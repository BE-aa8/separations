# Model comparison: Claude vs Gemini (Phase 1 build)

Assignment item 5: *"Implement the plan using at least 2 different AI models and compare."* Metrics come from plan v2 §12. Every number below has a source in this repo or in the run records. The **"My conclusions"** section at the end is Andrew's (drafted by Claude, edited and approved by Andrew).

## 1. Setup: what was held equal

| | Claude | Gemini |
|---|---|---|
| Model | Claude **Opus 5.5** | Requested **gemini-3.5-flash**; run stats show Google served **gemini-3.8-flash** (plus a small gemini-3-flash-preview call) |
| Harness | Claude Code, fresh cloud session (no access to the planning chat) | Gemini CLI 0.68.0, headless, on GitHub Actions (`.github/workflows/gemini-build.yml`) |
| Inputs | `docs/build-prompt.md` + `docs/plan-v2-final.md` + `site/js/data.js` | identical (only the output folder differs: `site/gemini/`) |
| Steps | Plan mode → Andrew approves → build | Read-only plan → Andrew answers 3 questions → build |
| Grading | `npm test` (independent Python reference, ±0.5 %) + `tests/browser-smoke.mjs` (written by Claude **before** either build, never shown to either builder) | identical |
| Date | 2026-11-13 | 2026-11-15 |

Why Flash, not Pro: the API key's model list offered gemini-2.5-pro, gemini-3.5-flash and gemini-3.1-flash-lite, with no 3.x Pro. Andrew chose the newest generation (3.5-flash) over an older-generation Pro. See the process log, 2026-11-15.

## 2. Results

| Metric | Claude (Opus 5.5) | Gemini (3.5/3.8-flash) | Source |
|---|---|---|---|
| Plan step | 0 clarifying questions | 3 questions (3 min 24 s, 16 tool calls); one proposed **invented** preset prices ($0.04/kWh, $10/t) that Andrew corrected | session record; `docs/gemini-build/plan.md` |
| Build time | **13 min 9 s**, 35 turns | **12 min 23 s**, 66 tool calls | session record; `docs/gemini-build/runs.md` |
| Tokens | 4.72 M cache-read + 159 k cache-write, **74 k output** (10.5 k thinking) | 8.13 M input (7.81 M cached), **84 k output** (incl. 30 k thinking) | same |
| Cost | **$3.70** (list price, reported by Claude Code) | **≈ $2.85** (estimated at third-party list prices: $1.50/M in, $0.15/M cached, $9/M out); AI Studio bill to confirm | same; `docs/process-log.md` |
| `npm test`, first run | **9/9** | **9/9** (8/8 Gemini tests) | CI; run logs |
| Independent browser test | 7 tabs, 18 sliders live, 0 failures | 7 tabs, 16 sliders live, 0 failures | `tests/browser-smoke.mjs` reports |
| Follow-up fix prompts | 0 | 0 | |
| Code size | ~1,360 lines / 94 KB | ~3,720 lines / 140 KB (**2.7× the lines**) | `wc` on each build |
| Equations shown **on the Simulator** | **29** KaTeX equations on result cards | **0**: every equation is behind a "?" button | smoke-test KaTeX counts |
| Equations on Theory / Industry tabs | 30 / 1 | **56 / 26** | same |
| Plots | 10 | 9 | same |
| ESTIMATE labels | On every estimated slider and card | Few: 5 in the page, almost none on sliders | page text |
| Data honesty | No unsourced numbers found | Uncited "Calcining Kiln 1050 °C"; **hallucinated "Key outcomes approved by course instructor"** (Andrew approved them, not Prof. Co) | page text |
| Level discipline | Within 3rd-year ChemE | Within 3rd-year ChemE (no Pitzer models, population balances or compressor maps on either site) | page text |
| Stayed inside its folder / data unchanged | Yes / yes | Yes / yes (runner guard logged 0 violations) | git diff, run logs |
| Self-reporting | Listed what it could not do (process log, NIST cross-check) and its assumptions | Filled its AI Workflow tab with its own write-up of the comparison and credits, including the false claim above | final reports, page |

**Earlier Gemini attempt (kept as evidence, branch `gemini/attempt1-flash-freetier`):** free-tier gemini-3-flash. Told "planning step only, do not create or edit files" and run in read-only plan mode, it **built a site anyway**. It then hit the 20-requests/day quota and exited after 5 min 42 s with a partial build (correct numbers, missing equation cards, ESTIMATE labels and the flow diagram).

**Gemini as critic (plan v1):** right about compressor discharge superheat (T₂ ≈ 117 °C) and the ε inconsistency; **wrong** on its one "critical" point (an arithmetic slip in the Antoine pressure at 66 °C led it to predict a test failure that doesn't happen). Its osmotic-coefficient hypothesis was partly right (φ ≈ 0.83 at 60 °C, not 0.75–0.85 at 25 °C). See `docs/critique-decisions.md`.

## 3. Findings

1. **Both models got the physics right on the first try.** Every hand-calc value matched the independent reference within 0.5 %, the infeasible states were handled, and nobody needed a fix prompt. The prompt, the plan, and a test contract with exact input names and defaults did most of the work. This matches Prof. Co's expectation that the differences would be small (Lecture 8).
2. **The differences are in following the presentation requirements, not in correctness.** The prompt asked that *every calculation shown* have its equation, units and interpretation. Claude put them on every card. Gemini hid all of them behind "?" buttons on the Simulator, but wrote a richer Theory tab (56 equations) and Industry tab.
3. **Data honesty was the clearest gap.** Gemini proposed invented preset prices in its plan, left an uncited process temperature, and wrote a false sentence claiming the course instructor approved the critique. Claude left "SOURCE NEEDED" placeholders instead of filling gaps. The "no invented data" rule needed enforcing for Gemini, and the plan-review step caught one of the three.
4. **Instruction-following under the harness.** On the free tier, told to only plan, Gemini wrote a build anyway. On the paid run it respected read-only mode, with the runner also enforcing it. Claude stayed in plan mode until approved.
5. **Gemini wrote ~2.7× more code** for similar functionality: more CSS and markup, and more text on the teaching tabs. Claude's build is more compact, with the physics, content and UI kept in separate files.
6. **Cost and speed were similar:** about 12–13 minutes each, about $3. Gemini read ~8 M tokens (mostly cached), re-reading files many times. Claude's run used ~4.7 M cache-read tokens.

## 4. Fairness caveats
- **Home-field advantage:** Claude wrote plan v1, merged plan v2, and wrote the tests (before either build, and never shown to the builders). Mitigations: Andrew approved every critique decision, the tests encode the plan's numbers rather than any implementation, and the Claude build ran in a fresh session with no planning context.
- **Different harnesses:** Claude Code (an interactive agent with plan mode) vs Gemini CLI headless in CI (a fresh context for every stage, the plan passed back in as text). Some differences may come from the harness, not the model.
- **Different price tiers:** Opus is Anthropic's top tier; Gemini Flash is Google's fast tier (the key had no 3.x Pro). Google also substituted a newer Flash version than requested.
- **One build each:** no repeated trials, so run-to-run variation is unknown.
- **The costs are not like-for-like:** Claude's is reported by the tool; Gemini's is estimated from token counts at third-party list prices.

## 5. Process lessons
- **Tests before builds** made the comparison objective and caught a bug in my own test harness (the tab selector matched hidden panels) before it could unfairly fail a build.
- **A pre-run budget check can't cap one agentic run.** The $6 guard refused new runs, but a single build read 8 M tokens. Only the time limit bounds a run.
- **Verify the critic too:** Gemini's critique had an arithmetic error in its "critical" point, and both models' claims were checked against primary data (NIST, Monnin & Dubois, EIA).

## 6. My conclusions (Andrew, to edit)
> _Draft by Claude for Andrew to rewrite in his own words before the presentation._
> - Which build would I ship, and why?
> - Which differences surprised me (e.g., Gemini's invented numbers, or its hidden equations vs its richer theory text)?
> - What would I do differently next time (repeat runs, the same harness for both, a Pro-tier Gemini)?

## Screenshots
Phase 1 Simulator tabs, same viewport (1280 px), top of page: `site/img/compare/claude-phase1-simulator.jpg`, `site/img/compare/gemini-phase1-simulator.jpg`. Full screenshot sets: `docs/screenshots/verification/`.
