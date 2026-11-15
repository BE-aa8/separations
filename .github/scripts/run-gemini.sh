#!/usr/bin/env bash
# Runs one Gemini CLI stage for the Phase 1 build and logs it for the model comparison.
# Called by .github/workflows/gemini-build.yml. Inputs come from env: STAGE, MESSAGE, MODEL, GEMINI_API_KEY.
set -euo pipefail

GEMINI_CLI_VERSION="0.68.0"
LOG_DIR="docs/gemini-build"
mkdir -p "$LOG_DIR" site/gemini
TS="$(date -u +%Y%m%dT%H%M%SZ)"
BASE_PROMPT="$(cat "$LOG_DIR/prompt.txt")"

if [ -z "${GEMINI_API_KEY:-}" ]; then
  echo "::error::Repository secret GEMINI_API_KEY is not set (Settings > Secrets and variables > Actions)."
  exit 1
fi

# ---- Spending guard ----------------------------------------------------------
# Every run's cost estimate is appended to costs.tsv. Refuse to start once the
# running total reaches BUDGET_USD. Estimates are deliberately HIGH (all input
# tokens at the >200k-context price, no cache discount), so real spend is lower.
BUDGET_USD="${BUDGET_USD:-6}"
COSTS="$LOG_DIR/costs.tsv"
[ -f "$COSTS" ] || printf 'timestamp\tstage\testimated_usd\tnote\n' > "$COSTS"
SPENT="$(awk -F'\t' 'NR>1 {s+=$3} END {printf "%.2f", s+0}' "$COSTS")"
echo "Estimated spend so far: \$$SPENT of \$$BUDGET_USD budget"
if [ "$STAGE" != "models" ] && awk -v s="$SPENT" -v b="$BUDGET_USD" 'BEGIN{exit !(s>=b)}'; then
  echo "::error::Budget reached (estimated \$$SPENT >= \$$BUDGET_USD). Not starting Gemini. Raise BUDGET_USD in the workflow only if the user approves."
  exit 1
fi
case "$STAGE" in plan) LIMIT_MIN=10 ;; build) LIMIT_MIN=30 ;; followup) LIMIT_MIN=15 ;; *) LIMIT_MIN=5 ;; esac

if [ "$STAGE" = "models" ]; then
  # Lists the models this API key can use (no prompt, no files changed).
  npx -y "@google/gemini-cli@$GEMINI_CLI_VERSION" --list-models 2>&1 | tee "$LOG_DIR/models-$TS.txt"
  printf '## Available models (%s)\n\n```\n%s\n```\n' "$TS" "$(cat "$LOG_DIR/models-$TS.txt")" > "$LOG_DIR/last-run.md"
  exit 0
fi

case "$STAGE" in
  plan)
    PROMPT="$BASE_PROMPT

This run is the planning step only. Do not create or edit any files. Reply with your full implementation plan, followed by any clarifying questions for the user."
    MODE=(--approval-mode plan)
    ;;
  build)
    [ -f "$LOG_DIR/plan.md" ] || { echo "::error::Run stage=plan first."; exit 1; }
    PROMPT="$BASE_PROMPT

You already proposed the implementation plan below, and the user has reviewed it.

User's response: ${MESSAGE:-Approved. Proceed.}

--- YOUR PLAN ---
$(cat "$LOG_DIR/plan.md")
--- END OF PLAN ---

Now implement it."
    MODE=(--yolo)
    ;;
  followup)
    [ -n "${MESSAGE:-}" ] || { echo "::error::stage=followup needs a message."; exit 1; }
    PROMPT="You are continuing an earlier build. The original task was:

--- ORIGINAL TASK ---
$BASE_PROMPT
--- END OF ORIGINAL TASK ---

Your previous work is already in site/gemini/ (read it before changing anything). The user's follow-up request:

$MESSAGE"
    MODE=(--yolo)
    ;;
  *) echo "::error::unknown STAGE=$STAGE"; exit 1 ;;
esac

ARGS=(--skip-trust -o json "${MODE[@]}")
[ -n "${MODEL:-}" ] && ARGS+=(-m "$MODEL")

OUT="$LOG_DIR/run-$TS-$STAGE.json"
printf '%s\n' "$PROMPT" > "$LOG_DIR/run-$TS-$STAGE.prompt.txt"
START=$(date +%s)
set +e
timeout -s INT -k 30s "${LIMIT_MIN}m" npx -y "@google/gemini-cli@$GEMINI_CLI_VERSION" "${ARGS[@]}" -p "$PROMPT" > "$OUT" 2> "$LOG_DIR/run-$TS-$STAGE.stderr.log"
CODE=$?
set -e
END=$(date +%s)

# Guard: Gemini may only change site/gemini/ and its own logs. Record and undo anything else.
# In the plan stage nothing may change at all (read-only), including site/gemini/.
if [ "$STAGE" = "plan" ]; then
  ALLOWED='^(docs/gemini-build/|node_modules/|package-lock.json)'
else
  ALLOWED='^(site/gemini/|docs/gemini-build/|node_modules/|package-lock.json)'
fi
VIOLATIONS="$(git status --porcelain --untracked-files=all | awk '{print $2}' | grep -v -E "$ALLOWED" || true)"
if [ -n "$VIOLATIONS" ]; then
  echo "Files changed outside site/gemini/ (reverted):"; echo "$VIOLATIONS"
  echo "$VIOLATIONS" | while read -r f; do
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then git checkout -- "$f"; else rm -rf "$f"; fi
  done
fi
rm -f package-lock.json

# Test result after this run (recorded, never fails the job)
set +e
TEST_OUT="$(npm test 2>&1)"
set -e
printf '%s\n' "$TEST_OUT" > "$LOG_DIR/run-$TS-$STAGE.npm-test.txt"
PASS=$(printf '%s\n' "$TEST_OUT" | grep -E '^# pass' | awk '{print $3}')
FAIL=$(printf '%s\n' "$TEST_OUT" | grep -E '^# fail' | awk '{print $3}')

python3 - "$OUT" "$STAGE" "$TS" "$((END-START))" "$CODE" "${PASS:-?}" "${FAIL:-?}" "$VIOLATIONS" "$LIMIT_MIN" <<'PY'
import json, sys, pathlib
out, stage, ts, secs, code, npass, nfail, viol, limit = sys.argv[1:10]
log = pathlib.Path("docs/gemini-build")
raw = pathlib.Path(out).read_text(errors="replace")
try:
    j = json.loads(raw[raw.index("{"):])
except Exception:
    j = {}
resp = j.get("response") or ""
stats = j.get("stats") or {}
models = list((stats.get("models") or {}).keys())
tokens = {m: (v.get("tokens") or {}) for m, v in (stats.get("models") or {}).items()}
tools = (stats.get("tools") or {}).get("totalCalls")
# Conservative cost estimate: Gemini Pro long-context list prices ($4 in / $18 out per 1M tokens),
# no discount for cached tokens. Unknown (e.g. killed by the time limit) is charged a flat $3.
PRICE_IN, PRICE_OUT = 4.0, 18.0
if tokens:
    tin = sum(t.get("prompt", 0) or 0 for t in tokens.values())
    tout = sum((t.get("candidates", 0) or 0) + (t.get("thoughts", 0) or 0) for t in tokens.values())
    usd, note = (tin * PRICE_IN + tout * PRICE_OUT) / 1e6, f"in={tin} out={tout}"
else:
    usd, note = (0.0, "no API usage (failed before any request)") if code == "1" else (3.0, f"no token stats (exit {code}); flat conservative charge")
with open(log / "costs.tsv", "a") as f:
    f.write(f"{ts}\t{stage}\t{usd:.2f}\t{note}\n")
spent = sum(float(l.split("\t")[2]) for l in (log / "costs.tsv").read_text().splitlines()[1:] if l.strip())
if stage == "plan" and resp:
    (log / "plan.md").write_text(f"# Gemini's Phase 1 implementation plan\n\n_Run {ts}, models: {', '.join(models) or 'unknown'}_\n\n{resp}\n")
(log / f"run-{ts}-{stage}.response.md").write_text(resp or f"(no response text; exit code {code}; see the .json and .stderr.log)\n")
summary = (f"## Gemini {stage} run {ts}\n\n"
           f"- Exit code: {code}\n- Duration: {int(secs)//60} min {int(secs)%60} s\n"
           f"- Models: {', '.join(models) or 'unknown'}\n- Tokens: {json.dumps(tokens)}\n- Tool calls: {tools}\n"
           f"- Estimated cost (conservative): ${usd:.2f} this run, ${spent:.2f} total (time limit {limit} min)\n"
           f"- npm test after run: {npass} passed, {nfail} failed\n"
           f"- Files changed that this stage may not change (reverted): {viol.split() if viol.strip() else 'none'}\n"
           f"- Response: `docs/gemini-build/run-{ts}-{stage}.response.md`\n\n")
(log / "last-run.md").write_text(summary)
with open(log / "runs.md", "a") as f:
    f.write(summary)
print(summary)
PY

exit $CODE
