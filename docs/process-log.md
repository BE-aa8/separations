# Process Log

Running record of AI tools, prompts, decisions, and iterations for the AI project. Requirement #4 asks for the planning and iteration steps where I provided guidance and my reasoning, so append an entry after every session.

Entry template:
```
## YYYY-MM-DD — <tool / model> — <what this session was for>
**Prompts (key ones, verbatim):**
**What the AI produced:**
**What I accepted / changed / rejected, and why:**
**Problems hit:**
**Next step:**
```

---

## 2026-10-23 — Claude (Opus 5.5) in a claude.ai Project chat — topic selection and handoff

**Setup:** A claude.ai Project for the course holding the lecture transcripts, syllabus, assignment, and textbook, so Claude could search them.

**Prompts (key ones, verbatim):**
1. "can you go back into the transcripts and see what are some of the ideas that prof had for the project"
2. "I want to push forward the idea of 'Mechanical vapor recompression for lithium and mineral purification...' Can we put together some ideas for making everything needed for the project HTML and other needed parts." (followed by the full assignment text)
3. "Yes I like this idea, I want to move this conversation to Claude Code using the plan feature and then eventually build the website."
4. "is there a way to move the context, or pull this project into claude code?"
5. "Add the context from the project into the GitHub repo (separations) so Claude Code can look into it later. After that update the prompt and let me know how to move on step-by-step."

**What the AI produced:**
- Searched the lecture transcripts and found the professor's project ideas: extending the packed column tool with pricing, turndown, and economics (Lecture 10), and a list of presentation topics including MVR for lithium purification (Lecture 12).
- Ran web searches to verify the industry context: Tesla's Robstown refinery is operational and ends in a crystallization step; Veolia MVR crystallizers are used for battery-grade LiOH; MVR's market share; patents on foaming and Li2CO3 fouling in LiOH evaporators.
- Proposed the "MVR Crystallizer Explorer" concept: energy comparison of MVR vs. multi-effect, boiling point elevation panel, economic crossover, purge/purity trade-off, solubility panel.
- Proposed the site's tab structure and the two-model workflow.
- Wrote the handoff pack (CLAUDE.md, HANDOFF.md, PLAN_PROMPT.md) and committed it to this repo with the course context.

**Decisions and reasoning:**
- **Switched topic** from packed vs. tray absorption columns to MVR crystallization. Reason: the professor named MVR for lithium purification as a topic he wants students to teach, it's tied to current US industry (Tesla's 2026 refinery), and it connects to the crystallization advanced-topics module rather than repeating his own packed column demo.
- **Netlify + plain HTML/JS** for the main build, since I already know Netlify. A possible second build in molab would also compare platforms (he prefers Marimo/molab).
- **Kept the full lecture transcripts and textbook out of this public repo.** Committed timestamped paraphrased notes (context/professor-guidance.md) instead.

**Next step:** Open this repo in Claude Code, switch to plan mode, paste docs/PLAN_PROMPT.md, answer its clarifying questions, and save the plan as docs/plan-v1-claude.md.

## 2026-11-09 — Claude Code (Opus 5.5, cloud session) — implementation plan v1

**Prompts (key ones, verbatim):**
1. "Read docs/PLAN_PROMPT.md and follow it exactly. My presentation date is Dec 7, so scope the phases to fit."

**Clarifying questions asked by Claude, and my answers:**
- Individual or group? → **Individual**
- Second AI model for critique and second build? → **Gemini**
- Second build on a different platform (molab/Marimo)? → **No, same HTML/JS stack** (cleaner model-to-model comparison)
- Visual polish vs physics? → **Physics first**
- Deadline → **Presentation Mon Dec 7, 2026**

**What the AI produced:**
- `docs/plan-v1-claude.md`: phased plan (0 plan/critique/data → 1 MVP built by both models → 2 enhancements → 3 stretch → 4 verification → 5 slides/video/deploy), scheduled Nov 9–Dec 7 with Thanksgiving as a buffer and a cut order if behind.
- Feature-to-phase table, all equations (mass balance with purge, BPE, multi-effect, MVR compressor, economics, MSMPR stretch) with units and one-line interpretations, data table with sources and ESTIMATE flags, and a fully worked hand-calc case (10,000 kg/h feed, 6 wt% LiOH, 60 °C, 5 % purge → 947 kg/h LiOH·H2O, 90.1 % Li yield, BPE 4.5 K, r = 1.62, 30.8 kWh/t, crossover vs 3-effect at $0.174/kWh).
- A shared `model.js` API contract so one Node test (`node --test`) grades both the Claude and Gemini builds; Playwright browser smoke test with screenshots; folder structure (`site/` = Netlify root, `site/gemini/` = Gemini build); Netlify deployment steps; Gemini critique prompt.

**Decisions and reasoning:**
- Same stack for both builds so differences come from the model, not the platform.
- KaTeX over MathJax: renders synchronously, fast enough for live equation cards on every slider move.
- Hand-calc numbers were computed in a Python script during the session. Property values (solubility, h_fg, Antoine) are working values to be verified in Phase 0; the hand calc gets recomputed if any change.
- BPE has no confirmed measured data yet → ideal colligative estimate, flagged, with an activity-factor slider.

**Problems hit:** None. Solubility and BPE data still need verification against primary sources (Phase 0).

**Next step:** Paste plan + HANDOFF + CLAUDE.md into Gemini with the §13 critique prompt, save the reply as `docs/critique-v1-gemini.md`, and fill `docs/critique-decisions.md`.

## 2026-11-13 — Gemini (critique) + Claude Code (fact-check, decision draft) — plan v1 critique

**Prompts (key ones, verbatim):**
1. To Gemini: the §13 critique prompt from `plan-v1-claude.md`, followed by plan-v1-claude.md, HANDOFF.md, CLAUDE.md pasted as one message (`gemini-critique-all-in-one.txt`, built by Claude on request: "You have the capability to make them all one, do it").
2. To Claude: pasted Gemini's full reply.

**What the AI produced:**
- Gemini: an independent recomputation of the §7.2 hand calc (all values within 0.5 %) and 10 prioritized suggestions. Saved verbatim in `docs/critique-v1-gemini.md`.
- Claude: fact-checked Gemini's numeric claims with the IAPWS-IF97 saturation equation and steam-table enthalpies, then drafted `docs/critique-decisions.md` (accept/reject table with reasoning, awaiting my approval).

**Key findings:**
- Gemini's "critical" claim that Antoine vs NIST interpolation makes the test fail (r = 1.616, 0.95 % error) is **wrong**. Antoine is ~0.38 % low at both temperatures, so r is unchanged (1.6227 vs 1.6226). Gemini mis-evaluated Antoine at 66 °C (26.071 vs 26.085 kPa). Its fix (one P_sat method for both builds) is still accepted. Good example for the presentation that the critic model also needs checking.
- Gemini's compressor discharge temperature point is correct: T2 ≈ 116.7 °C, so compression superheats steam, and wet vapor comes only from entrained mist or foam.
- Gemini's unsourced numbers (LiOH osmotic coefficient 0.75–0.85, CRC solubility 12.4 g/100 g at 20 °C, crystal-size thresholds <100 µm / >800 µm) are treated as hypotheses to verify, not data.

**What I accepted / changed / rejected, and why:** see `docs/critique-decisions.md` (draft, pending my review; open question 7b on turndown).

**Next step:** Review and approve the decision table, then Claude writes `docs/plan-v2-final.md` and `docs/build-prompt.md`.

## 2026-11-13 (cont.) — Claude Code — decisions approved, plan v2 and build prompt

**Prompts (verbatim):** "approve all, keep 7b"

**What the AI produced:**
- `docs/critique-decisions.md` marked approved (all 14 rows; 7b kept as a simple fixed-area turndown).
- `docs/plan-v2-final.md`: self-contained merged plan. Changes tagged [v2: #n]: Antoine-only P_sat; ε as a purity-only model; K_b at T_b specified; discharge temperature T2 (C7) and the compressor-work surplus note (C8); schematic metastable/spinodal bands moved to the MVP; rewritten B2/E4/C3 interpretations; Phase 3 removed (problem cards become static text, MSMPR dropped); Phase 2 = ΔT optimum + clickable PFD + fixed-area turndown; feasibility guards; exact `simulate()` input keys and defaults; 7 tabs; an independent Python reference script generating unrounded expected values; added comparison metrics including critique accuracy. Schedule re-baselined (Phase 0 ran 2 days late): data Nov 13–15, MVP Nov 16–21, Phase 2 Nov 22–25.
- New hand-calc values: T2 = 116.7 °C, maxFeasibleN = 7, product impurity 583 ppm at ε = 0.03, heater area 469 m², turndown 26.34 / 21.88 kWh/t at 75 % / 50 % load.
- `docs/build-prompt.md`: the identical Phase 1 prompt for Claude Code and Gemini.

**Next step:** Phase 0: verify data against sources and write `site/js/data.js`, the reference script, the expected JSON, and the Node test. Then start both builds.

## 2026-11-13 (cont.) — Claude Code — Phase 0: data verification and test harness

**Prompts (verbatim):** "Yes start Phase 0 now, let me know what all you need."

**Problems hit:** The Default cloud environment blocked NIST, EIA and journal hosts (search worked, fetching did not). Claude proposed a personal "seperations" environment allowing only the needed data hosts; I approved it.

**What the AI produced:**
- `tools/build_data.py` → `site/js/data.js`: every value with a sourceId and an estimate flag. NIST steam table (verbatim), Antoine constants checked against NIST, LiOH·H2O solubility and the osmotic coefficient at saturation computed from Monnin & Dubois (2005, J. Chem. Eng. Data 50:1109), EIA Texas industrial electricity (7.21 ¢/kWh, Aug 2026), Texas industrial gas ($2.98/Mcf), gas heat content (1,037 Btu/cf), gas-plant heat rate (7,781 Btu/kWh), and a fuel-only steam cost derived from them ($7.33/t, ESTIMATE).
- `tests/reference/handcalc_reference.py` → `tests/handcalc-expected.json` (independent Python reference, unrounded values); `tests/handcalc.test.mjs` (Node test for both builds: API, defaults, hand calc ±0.5 %, infeasible cases, limiting cases, random mass closure, data-source audit); `package.json`, `netlify.toml`.
- Self-test of the harness: a throwaway correct JS model passed 9/9; the same model with a planted 1 % error in compressor work failed exactly the 11 dependent values.
- `docs/handcalc.md`: the hand calc redone with verified data, with unit checks and interpretations. Plan v2 amended ([P0] notes).

**Key findings:**
- **The v1 working data were wrong in places.** The "12.7/12.8 g" solubility values were per 100 mL (Wikipedia), not per 100 g. The verified solubility at 60 °C is 14.56 g/100 g (v1 had 13.8). Gemini's "CRC gives 12.4 at 20 °C" was also wrong (13.37).
- **Gemini's osmotic-coefficient hypothesis was partly right:** φ ≈ 0.83 at saturation and 60 °C, so the real BPE (3.95 K) is 21 % below ideal (4.76 K). But φ ≈ 0.90–0.93 at 25 °C, not 0.75–0.85 as Gemini claimed.
- **The economics changed:** with Aug 2026 Texas prices and fuel-only steam, MVR ($2.09/t) beats 3 effects ($2.63/t) but not 5 effects ($1.58/t). The fuel-only steam cost leaves out boiler capital and O&M, so this needs the Phase 2 capital comparison and a decision on the steam-cost default.
- New hand-calc results: C = 942.2 kg/h, Li yield 89.6 %, BPE 3.95 K, r = 1.580, 29.0 kWh/t, T2 = 113.4 °C, max 7 effects.

**Still needed from me:** see the open items in `docs/handcalc.md` and the Phase 0 summary in chat (book checks, steam-cost decision, battery spec, lithium intensity).

**Next step:** Close the open data items, then start the Phase 1 builds with `docs/build-prompt.md`.

## 2026-11-13 (cont.) — decision: steam price; Phase 1 kickoff

**Prompt (verbatim):** "keep $7.33 fuel-only steam, start Phase 1"

**Decision and reasoning:** Keep the sourced fuel-only steam cost ($7.33/t, from EIA Texas gas Aug 2026) as the default instead of an unsourced "all-in" number. On energy cost alone, 5 effects beat MVR at current cheap Texas gas. This is presented as a finding, and Phase 2's capital-cost comparison tells the rest of the story.

**Phase 1 setup:** `docs/build-prompt.md` clarified before either build started (copy `data.js` unchanged into the output folder; commit and push). The Claude build runs in a **fresh** Claude Code cloud session (no access to this planning conversation) on branch `claude/phase1-build`, output `site/`. The Gemini build is run by me with Gemini CLI on branch `gemini/mvp`, output `site/gemini/`, with the identical prompt.

## 2026-11-13 (cont.) — Claude Code — everything moved onto GitHub; Claude Phase 1 build verified

**Prompts (verbatim):** "Can you sent up everything and run the code through Github? I will give you perms if needed." Then, on where to put the work: "Merge it to main yourself".

**What the AI produced:**
- `.github/workflows/ci.yml`: on every push and PR, (1) `data.js` and `handcalc-expected.json` must regenerate exactly from their scripts, (2) `npm test`, (3) the browser smoke test, with screenshots uploaded as an artifact. First run on GitHub: green.
- `tests/browser-smoke.mjs`: generic browser checks applied identically to both builds (≥7 tabs, KaTeX errors, Plotly rendered, every slider changes output, no NaN/undefined, no horizontal scroll at 375 px, screenshots). Self-tested on a fake site with planted bugs (all caught).
- `.github/workflows/gemini-build.yml` + `.github/scripts/run-gemini.sh`: Gemini CLI 0.68.0 headless on GitHub Actions, in stages plan (read-only `--approval-mode plan`) → build → followup, on branch `gemini/mvp`. Each run logs time, model, tokens, tool calls, the npm test result, and any files touched outside `site/gemini/` (reverted). Self-tested with a fake Gemini that tampered with CLAUDE.md (caught and reverted).
- Main fast-forwarded to the planning branch (no history rewrite), so the Gemini workflow can be started from the Actions tab.

**Claude Phase 1 build (fresh session, branch `claude/phase1-build`):** finished in about 13 minutes in one turn, with no follow-up prompts. Self-reported npm test 9/9 and its own browser check 97/97. Verified independently here: npm test 9/9 reproduced; `data.js` unchanged; changes confined to `site/`; my smoke test (which the build never saw) passed with 7 tabs, 18/18 sliders live, 0 failures. Session cost reported: about $3.70.

**Problems hit:** The first smoke-test run against a real build crashed: my `[data-tab]` selector also matched hidden tab panels. Fixed generically (only visible buttons/links count as tabs). The same fixed test grades the Gemini build. Recorded here because the fix came after seeing a build.

**Next step:** I add the GEMINI_API_KEY repository secret, then run the Gemini workflow (plan → approve → build).

## 2026-11-15 — Gemini plan run on GitHub Actions (run 43756313310)

**Prompt:** I added the GEMINI_API_KEY secret ("I added the GEMINI_API_KEY secret, start the plan step"). Claude dispatched the workflow with stage=plan.

**What happened:**
- Gemini CLI 0.68.0 defaulted to **gemini-3-flash** on the **free tier**. It hit the per-minute limits three times, then the **daily limit (20 requests/day)**, and exited with code 173 after 5 min 42 s. No plan text was returned.
- Despite `--approval-mode plan` (read-only) and the instruction "do not create or edit any files", **Gemini skipped the plan and wrote a build** in `site/gemini/` (index.html, style.css, charts.js, model.js, ui.js, plus an unchanged copy of data.js; about 1,630 lines).
- Checked by Claude: `site/js/data.js` untouched; the data.js copy identical; nothing outside `site/gemini/`. **npm test: 8/8 Gemini tests pass** (numbers match the hand calc). Browser smoke test: 7 tabs, 8 sliders live, 1 failure (2 px horizontal overflow on mobile Simulator).
- Against the plan, the partial build is missing: per-calculation equation cards (KaTeX equation + units + interpretation), ESTIMATE labels, the process flow diagram, and most inputs (8 sliders vs about 19).
- Test-environment note: Gemini loads Plotly from cdn.plot.ly (Claude used jsDelivr). The first smoke run failed only because Claude's sandbox blocked that host; cdn.plot.ly was added to the environment allowlist and the test re-run.

**Fix:** `run-gemini.sh` now treats any file change during the plan stage as a violation and reverts it (plan mode in Gemini CLI did not prevent writes in headless mode).

**Comparison findings so far:** Gemini (Flash, free tier) produced correct physics on the first attempt but ignored the plan-only instruction and stopped early on quota. Claude (Opus, fresh session) completed every requirement in one turn (~13 min, ~$3.70).

**Decision (2026-11-15):** "Paid key + Pro, redo". Reasoning: a flagship-vs-flagship comparison (Gemini Pro vs Claude Opus) is fairer than free-tier Flash vs Opus, and Gemini should go through the same plan → approval → build steps Claude did. The first attempt is preserved on branch `gemini/attempt1-flash-freetier` as a data point; `gemini/mvp` was deleted so the redo starts clean. Added a `models` workflow stage to list the models the key can use before choosing the Pro model ID.

**Update:** the git proxy refused deleting `gemini/mvp`, so the redo runs on a fresh branch `gemini/pro` instead. `gemini/mvp` stays as a duplicate of the saved first attempt.

## 2026-11-15 (cont.) — spending limits on the Gemini workflow

**Prompt (verbatim):** "Okay it should be funded now, make sure you don't use a crazy amount of money on this shit otherwise we will be finding other methods."

**What changed:** `run-gemini.sh` now keeps `docs/gemini-build/costs.tsv`. Each run logs a deliberately high cost estimate (all input tokens at $4/M and output at $18/M, no cache discount; $3 flat if a run dies without stats) and **refuses to start once the estimated total reaches $6** (`BUDGET_USD` in the workflow), below the $10 AI Studio credit. Each Gemini call has a time limit (plan 10 min, build 30, follow-up 15), and the whole job has a 45-minute timeout. Tested with a fake Gemini: the cost was logged and the over-budget run refused to start.

## 2026-11-15 (cont.) — Gemini plan + build with gemini-3.5-flash (paid key); both Phase 1 builds merged

**Prompts:** `models` stage → the key offered gemini-2.5-pro, gemini-3.5-flash, gemini-3.1-flash-lite (no 3.x Pro). I chose **gemini-3.5-flash**. Plan stage → Gemini returned a full plan (`docs/gemini-build/plan.md`) with 3 questions. I approved with these answers (sent verbatim as the build message): inline SVG PFD above the cards; presets only from data.js/plan values (Texas $0.0721/kWh, Expensive $0.25/kWh, steam $7.33/t); commit to the current branch; no uncited numbers (drop "China ~70%+" and "largest thermal energy sink").

**Results (Gemini):**
- Plan run: 3 min 24 s, read-only respected (no files changed). Build run: 12 min 23 s, 66 tool calls, ~8.1 M input tokens (7.8 M cached), ~84 k output tokens. Run stats name the models as gemini-3.8-flash plus gemini-3-flash-preview (Google appears to route the 3.5-flash name to a newer version).
- npm test 8/8 on the first build run; browser smoke test 7 tabs, 16 sliders, 0 failures; data.js unchanged; nothing touched outside site/gemini/. It followed all of my answers (presets, no "70%" claim).
- Minor UI issues: stray "—" after unitless values; overlapping annotations on the crossover map. Equations sit behind "?" disclosures (allowed by the plan) rather than shown on every card.

**Cost:** my "$6 cap" only checks before a run starts, and its estimate assumes Pro long-context prices with no cache discount, so it logged $36.61 (it now blocks further Gemini runs, a safe default). At third-party-listed Gemini 3.5 Flash prices ($1.50/M input, $0.15/M cached, $9/M output) the real spend is about **$0.43 (plan) + $2.42 (build) ≈ $2.85**. To be confirmed on the AI Studio usage page. Lesson: a pre-run budget check cannot cap a single agentic run; only the time limit does.

**Comparison snapshot (Phase 1):**

| Metric | Claude (Opus 5.5, fresh Claude Code session) | Gemini (3.5-flash, Gemini CLI on GitHub Actions) |
|---|---|---|
| Plan step | Plan mode, no questions | Plan with 3 questions (one exposed invented preset numbers) |
| Build time | ~13 min | 12 min 23 s (+3 min 24 s plan) |
| npm test first run | 9/9 | 8/8 Gemini tests (9/9 suite) |
| Smoke test (independent) | 7 tabs, 18 sliders, 0 failures | 7 tabs, 16 sliders, 0 failures |
| Follow-up prompts needed | 0 | 0 (after one aborted free-tier attempt) |
| Cost | ~$3.70 (reported) | ~$2.85 (estimated at list prices) |
| Size | site/ ≈ 1,360 lines | site/gemini/ ≈ 4,400 lines |
| Earlier attempt | n/a | free-tier gemini-3-flash: ignored plan-only instruction, hit daily quota, partial build |

**Merged:** both builds merged into the planning branch (`site/` = Claude, `site/gemini/` = Gemini). Combined npm test 17/17; combined smoke test 0 failures on both paths. Netlify Drop zip built at `dist/mvr-crystallizer-site.zip` (not committed).

## 2026-11-15 (cont.) — Claude Code — Phase 2 (Claude build): capital cost optimum, clickable PFD, turndown

**Prompts (verbatim):** "merge the builds to main and start Phase 2, you can see the live version currently at https://ucseparations.netlify.app". Cost-data choice (to Claude's question): "Use the public DOE report".

**Process:** main fast-forwarded with both Phase 1 builds. Phase 2 started in **plan mode** (project rule); plan approved and saved as `docs/plan-phase2-claude.md`. Network allowlist extended (osti.gov, www.osti.gov, www.chemengonline.com, ucseparations.netlify.app) with my approval.

**Data (Step 0):** DOE/NETL "Process Equipment Cost Estimation" (2002, OSTI 797810) has **tabulated** ICARUS purchased and installed costs (Appendix B, 1st-quarter 1998 dollars), so no graph reading was needed: shell-and-tube heat exchanger vs area, centrifugal compressor vs driver hp (4-stage series used as a proxy, flagged ESTIMATE). CEPCI 1998 = 389.5 (same report); CEPCI 2023 = 797.9 (Chemical Engineering, Economic Indicators Sept 2024, the latest annual value without a paywall). Interest 10 %, life 10 yr (ESTIMATE sliders).

**Tests first (Step 4):** the Python reference was extended with an independent Phase 2 calculation; `tests/phase2.test.mjs` (values, trends, out-of-table guard) and `tests/browser-phase2.mjs` (P9/P10 render and respond; every PFD unit opens a panel with KaTeX; keyboard Enter; 375 px) were written before the code and failed (6 red) until it existed. CI now runs the Phase 2 browser check.

**Built (Steps 1–3):** `model.js`: heaterArea, compressorCost/heaterCost (log-log in DOE tables, × CEPCI ratio, no extrapolation), crf, tacAt, sweepTAC, optimumDT (0.1 K grid), turndownAt/sweepTurndown; `simulate()` gains `design`. Charts P9 (capital vs electricity vs TAC, with optimum, and area on a 2nd axis) and P10 (kWh/t, $/t, r vs load). New sliders U, i, n, load f; new cards $5–$7 with KaTeX, units, and interpretations; Theory tab gains $5–$7; PFD units are now buttons that open a live equations panel.

**Results:** heater 469 m², TAC $470k/yr at ΔT = 6 K; **cost-optimal ΔT = 3.0 K** (TAC $444k/yr). Pricier electricity → 2.3 K; U 3000 → 2.0 K; U 1000 → 4.4 K. Turndown 75 %/50 % → 24.6/20.1 kWh/t. All in `docs/handcalc.md`.

**Verification:** npm test 23/23 (Phase 1 17 + Phase 2 6); Phase 2 browser check passed at 1280 and 375 px; generic smoke test 0 failures on `/` (22 sliders) and `/gemini/` (16). Screenshots reviewed: fixed a clipped P9 label, and made the PFD readable on phones (min width with in-box scroll instead of shrinking).

## 2026-11-15 (cont.) — live-site verification

**Prompt (verbatim):** "deployed, run the tests on the live site"

**Results against https://ucseparations.netlify.app:**
- Generic browser smoke test: `/` (Claude, Phases 1+2) 7 tabs, 22 sliders, 0 failures; `/gemini/` (Gemini, Phase 1) 7 tabs, 16 sliders, 0 failures.
- Phase 2 browser check (P9, P10, every clickable PFD unit, keyboard, 375 px): passed.
- Deployed files compared byte-for-byte with the repo: every JS and CSS file is identical. `index.html` differs only by Netlify's injected hosting comment and HUD script tag. The unit-tested numbers are the ones online.
- Report and representative screenshots: `docs/screenshots/verification/2026-11-15-live/` (the full set of about 13 MB was kept out of the repo).

## 2026-11-15 (cont.) — Claude Code — model comparison write-up

**Prompt (verbatim):** "start the model comparison write-up, I also want to work on tidying up the website, giving it more of a better UI and UX design, and then we can do full deployment. But let's start with our model comparison write-up, and then we'll get to that in a little bit."

**Process:** plan mode → plan approved. Evidence gathered: the Claude build session record (13 min 9 s, 35 turns, $3.70, 74 k output tokens, 0 questions), Gemini run logs (`docs/gemini-build/runs.md`), the smoke-test KaTeX/plot counts for both Phase 1 builds (Claude's Phase 1 re-served from `claude/phase1-build` for a fair screenshot), line and byte counts, and text audits for unsourced numbers and level.

**Decision (Andrew):** Gemini's site says the critique outcomes were "approved by course instructor", which is false (I approved them). Leave Gemini's code untouched as evidence and flag it in the comparison.

**Produced:** `docs/comparison.md` (setup, sourced results table, findings, fairness caveats, process lessons, and a "My conclusions" section for me to write); the site's AI Workflow → Model Comparison sub-tab (results table, findings, side-by-side Phase 1 simulator screenshots in `site/img/compare/`, short critique-decision table). Verified: npm test 23/23, smoke test 0 failures, Phase 2 browser check passed; screenshots reviewed at 1280 and 375 px.

**Key findings:** both builds were correct on the first run (9/9, 0 fix prompts, ~12–13 min, ~$3). The differences were presentation (Claude: equations on every simulator card; Gemini: none on the simulator but a richer Theory tab) and data honesty (Gemini: invented preset prices in its plan, an uncited kiln temperature, a hallucinated approval claim).

**Next:** I write "My conclusions" in comparison.md; then the UI/UX pass and full deployment.

## 2026-11-15 (cont.) — brief for a third model (ChatGPT) to do the UX pass

**Prompt (verbatim):** "Could you give me a project breakdown that I can add into ChatGPT, I'm currently working with Chat to implement better UX to the website."

**Produced:** `docs/ux-brief-for-chatgpt.md`: a self-contained brief covering what the site is and who it's for, file-by-file edit permissions (`model.js`, `data.js` and `site/gemini/` are off-limits), the hard constraints the automated tests enforce (tab controls, live sliders, no NaN, KaTeX, Plotly, no console errors, no horizontal scroll at 375 px, the Phase 2 IDs), course content rules (equation, units and interpretation stay visible; ESTIMATE/SCHEMATIC/SOURCE NEEDED labels stay), a list of known UX problems, the delivery format (plan first, then small diffs), and how to test. Also a paste/upload bundle (`dist/chatgpt-ux-bundle.txt`, not committed) with the brief plus the UI source files.

**Why:** ChatGPT becomes a third model in the workflow; the brief makes it easy to verify whatever it returns against the same tests.

## 2026-11-15 (cont.) — UI/UX redesign: plan from ChatGPT, Phase 0 report, Phase 1 (global identity)

**Prompt:** Andrew pasted a 6-phase redesign plan written with **ChatGPT** (a third model): a hybrid dark-cinematic / light-technical style, lime/olive accent, "Anduril/Palantir-inspired" industrial look, strict preservation of physics, data, IDs and tests, and a checkpoint after each phase. Instruction: "Please follow this plan in plan mode."

**Phase 0 (plan mode, approved):** confirmed the repo matched main with no prior CSS patch; baseline npm 23/23, smoke 0 failures on both builds, Phase 2 check pass; measured the mobile Simulator's first result at y = 2,259 px (page 14,668 px). Risks flagged: hash routing makes `href="#…"` jump links switch tabs (use buttons); lime #A6BB43 fails contrast on white (~2.2:1), so olive #55621A is used for text and links; the hero can't reuse the PFD (duplicate IDs); headline metrics should render live from the model, not be hard-coded.

**Phase 1 (done):** `site/css/style.css` rewritten as a design system (tokens for light and dark surfaces, lime/olive, preserved status colors; type scale; mono for values and labels; dark sticky header 86 px vs 117 px before; restyled buttons, cards, value-first result cards, equation cards, tables with dark heads, callouts, intentional placeholders, focus rings, reduced-motion, print). Inter is **self-hosted** (`site/fonts/`, OFL license included) instead of Google Fonts, avoiding a third-party request and projector-Wi-Fi risk. Bug found in review: `.wrap` padding overrode `main`'s top padding, so content sat under the header; fixed.

**Checkpoint:** local tag `pre-ux-redesign` = `2fe4d1f` (the git proxy refused pushing tags); main stays at that commit until the redesign is approved.

**Tests after Phase 1:** npm 23/23; smoke `/` 7 tabs, 22 sliders, 0 failures; `/gemini/` 0 failures; Phase 2 check pass. Screenshots reviewed at 1280×720, 1280×800 and 375×812.

## 2026-11-15 (cont.) — "CRYSTALLIZE" fluid dot-lattice hero (wow factor)

**Prompt (verbatim):** "Overall I think it looks pretty good, is there anyway we could make a flashy "homepage" that is only there for looks? I think anything that could give a wow factor would be nice. Could we implement some flowy physics? something kinda like the screenrecording attached?" (A 9-second screen recording of a dot-grid wordmark that swirls under the cursor; Claude extracted frames with ffmpeg to study it.)

**Decisions (Andrew):** the word is **CRYSTALLIZE**; it sits at the top of the Overview tab (header and tabs stay visible). Planned in plan mode and approved.

**Built:** `site/js/hero.js` (self-contained, no libraries): the letters are sampled onto a dot lattice; on load the dots settle out of a scattered "supersaturated" cloud (a crystallization nod); the pointer drives a coarse 2-D Stam stable-fluids solver (splat → vorticity confinement → semi-Lagrangian advection → 14-iteration pressure projection → decay) whose velocity carries the dots, with springs pulling them back. Fast dots tint lime. An automatic slow stir runs after 4 s idle (for projector demos). It pauses when the tab is hidden or off screen; reduced-motion users get static dots. Mobile stacks CRYS / TAL / LIZE. The hero markup and CSS are in `index.html` and `style.css`; `model.js`, `data.js` and the Gemini build are untouched.

**Tests:** new `tests/browser-hero.mjs` (added to CI): lattice renders; stirring changes the frame; reduced motion is static with 0 frames; the loop stops on another tab; no console errors; no horizontal scroll at 375 px. The first run caught a real bug: the loop kept running after switching tabs (fixed by checking `offsetParent`). Then: npm 23/23, smoke 0 failures on both builds, Phase 2 pass, hero pass. Frame sequences reviewed: tuned fluid coupling down (it was too explosive) and resized the hero to remove an empty band.

## 2026-11-15 (cont.) — live process diagram, color, dark/light mode

**Prompt (verbatim):** "yes i love! now we can work on adding similar animations to the website. could we add active flows in and out for the process flow simulator or add some color to it all. How ever you think will work the best should be fine. Could you also add a dark/light mode functions"

**Planned in plan mode, approved. Built:**
- **Live PFD** (`site/js/pfd.js`): color-coded streams (feed brine amber, vapor steam-blue, compressed vapor orange, condensate teal, circulating liquor, crystals lime, purge rust) with animated dashed "flow" overlays whose speed is set from the live mass flows (duration ∝ 1/√(flow/10,000 kg/h)); compressor impeller spins with electric power; crystals settle in the crystallizer at a rate set by C; heater shows a warm gradient; legend; infeasible states stop the flows. All `pfd-*` IDs and `data-unit` groups kept; crowded label moved. Recirculation isn't modelled, so its speed is fixed and qualitative.
- **Dark/light mode:** header toggle (aria-pressed); default follows the device setting; choice remembered in localStorage (fails safe); an inline head script prevents a flash. Dark tokens for every surface and status color; charts get light/dark palettes via `setChartTheme()` and re-render on toggle (traces and data unchanged).
- **Cause → effect motion:** card values flash briefly when a slider changes them; tabs fade in. All motion is off under reduced motion.

**Tests:** new `tests/browser-ux.mjs` (theme default/toggle/persistence, chart background follows the theme, streams animate with vapor faster than purge, the feed slider changes flow speed, the infeasible preset stops flows, value flashes, reduced motion → no animations, no horizontal scroll at 375 px in both themes, no console errors): passed on the first run. Smoke and Phase 2 tests gained `--scheme dark`; CI now runs them in both themes.

## 2026-11-15 (cont.) — shipped the redesign so far

**Prompt (verbatim):** "Let's ship out what we have right now, and then I'll take a look at it, and I'll come back later and see if there's any other UI UX stuff that I want to fix with it." then "send me the zip when CI passes"

**Done:** waited for GitHub CI on `2b09249` (data + hand-calc job and browser job, now covering the light and dark smoke tests, Phase 2 in both themes, the hero and UX checks): all green. Fast-forwarded main to `2b09249` (the pre-redesign checkpoint `2fe4d1f` is still in history). Built `dist/mvr-crystallizer-site.zip` (28 files) and verified its contents byte-for-byte against the committed `site/` before sending it for Netlify Drop.

**Still open (by choice, for later):** Simulator layout (key-results strip, chart groups, mobile inputs panel), the Overview area below the hero (live headline numbers, cards), Theory TOC, placeholders. My "conclusions" section in comparison.md.

## 2026-11-16 — live-site verification of the redesign

**Prompt (verbatim):** "deployed, run the tests on the live site"

**Results against https://ucseparations.netlify.app:** every deployed file matches the repo byte-for-byte (index.html differs only by Netlify's injected lines); npm 23/23; smoke test light and dark: `/` 7 tabs, 22 sliders, 0 failures; `/gemini/` 7 tabs, 16 sliders, 0 failures; Phase 2 check pass in both themes; hero check pass; UX check (theme toggle and persistence, live PFD flows, reduced motion, mobile) pass. Reports and key screenshots: `docs/screenshots/verification/2026-11-16-live/` (the full ~32 MB set was kept out of the repo).

## 2026-11-16 — Liquid Glass simulator: plan (approved) and phase G1

**Prompt:** Andrew attached three reference screenshots (Airglow weather app glass UI; Lumare landing page and journal) with a detailed brief: plan an Apple-inspired Liquid Glass redesign of the Simulator, hide explanatory text behind a "?" toggle without deleting it, keep all engineering information, physics, data, IDs and tests intact, plan first and wait for approval.

**Plan mode:** measured the current Simulator (≈2,330 visible words, ~700 of them explanation; 35 cards, 21 sliders, 12 charts starting 4,479 px down). Andrew's decisions: **clean by default with an Explain switch and per-item "?"** (satisfies the CLAUDE.md "equation, units, interpretation" rule on demand; nothing deleted); **glass on the Simulator first**; **charts grouped, all visible**. Plan saved as `docs/plan-glass-simulator-claude.md` (phases G1–G5, each with a checkpoint).

**G1 (this commit):** glass tokens for light and dark, atmospheric backdrop while the Simulator is open, a sticky glass toolbar (presets as a segmented control, Process/Results/Charts jump buttons using `scrollIntoView`, not hash links), a glass inputs panel with collapsible groups (`<details>`, open by default), Apple-style sliders (filled track via `--pct`, white thumb, value pills), rounded process and chart surfaces. Presentation-only changes in `index.html`, `style.css`, `ui.js`; physics, data, equations and Gemini untouched. Review fix: an attempt to truncate long value pills hid units, so it was reverted (units are essential) and the inputs panel widened instead.

## 2026-11-16 (cont.) — Liquid Glass simulator: G2–G5

**Prompt (verbatim excerpt):** "I have reviewed and approved the simulator redesign plan. Now begin implementing it. Follow the approved plan closely. Do not introduce unrelated redesigns or expand the scope unnecessarily. ... Do not claim functionality works unless it has been tested." Requested at the end: an implementation report listing modified files, completed work, test results and remaining problems.

**G2:** six key-result tiles (MVR kWh/t, MVR operating cost with the N-effect comparison, Li yield, product impurity, BPE, cost-optimal ΔT) read from values `simulate()` already returns. The 35 boxed cards became compact rows (name, value, units, tag, "?"), grouped in collapsible sections. An **Explain** switch (remembered) reveals every equation, interpretation and worked substitution inline. One shared **Help panel** (desktop: right-hand panel that pushes the layout so values stay visible; phone: bottom sheet) shows the equation, live substitution, units, "How does that make sense?" and the current interpretation; it updates as sliders move. Esc closes it and returns focus. Review fix: a 1-column card rule made the page 8,580 px tall; replaced with an auto-fit grid.

**G3:** the 12 charts grouped into four titled sections (Energy & cost; BPE & compressor; Purity & mass balance; Crystallization) with a jump row; every chart stays visible (No Plot = No Pay). The 13 "What if?" notes were moved into help slots, checked verbatim (none lost). Clean view: 1,295 visible words (was 2,329); Explain view: 3,015.

**G4:** the unit detail card now sits beside the live PFD on desktop (it no longer pushes the diagram down) and below it on smaller screens; legend items are pill chips. On phones a floating **Inputs** button opens the sliders as a bottom sheet (Done, scrim tap or Esc closes it), so results come first. Review fix: the equation tag in the detail card ran into its title ("C1Suction"); it was given its own chip style.

**G5:** projector (1280×720) and dark-mode review; new `tests/browser-glass.mjs` (clean view, nothing lost from the DOM, KPI tiles equal their rows, Help open/update/Esc/focus, Explain persistence, 4 chart groups with 12 rendered charts, phone sheet changes a KPI, help bottom sheet, no horizontal scroll, no console errors) added to CI in light and dark.

## 2026-11-16 (cont.) — phone toolbar, tablet inputs, ship

**Prompt (verbatim):** "find a fix for the phone toolbar and the tablet width and then ship and send the zip"

**Phone toolbar:** below 1100 px the toolbar is a static two-row card: Explain and the Process/Results/Charts jump buttons on top, all five presets as wrapped chips below (previously they scrolled sideways out of sight, and at tablet widths Explain and the jump buttons were cut off). **Tablet (700–1099 px):** the inputs panel above the results lays its groups out in two columns (about half the height) and has a Hide/Show button, remembered in localStorage, so the results can be brought to the top. `browser-glass.mjs` gained tablet checks (no clipped toolbar buttons, slider updates a tile, Hide moves results up and is remembered, Show restores the inputs) and a phone check for clipped toolbar buttons. Full suite passed locally in light and dark.

**Shipped:** GitHub CI green on `e5c867e` (both jobs, including the new glass checks in light and dark); main fast-forwarded to `e5c867e`; `dist/mvr-crystallizer-site.zip` (28 files) rebuilt and verified identical to `site/` before sending it for Netlify Drop.

## 2026-11-16 (cont.) — live check found a real phone bug

**Prompt (verbatim):** "deployed, run the tests on the live site"

Every suite passed on the live site except the glass test: Netlify injects a "Powered by Netlify" badge at the bottom-right that sits above everything, and on phones it covered half of the centred Inputs button, so taps hit the badge. Local runs and CI never see the badge. Fixed by moving the button to the bottom-left and padding the phone sheets; the glass test now adds a same-size stand-in badge. Details: `docs/screenshots/verification/2026-11-16-live-glass/report.md`.

**Re-run after redeploy (main @ d4ce8fb):** every suite passes on the live site in light and dark, including the glass checks with the real Netlify badge present.

## 2026-11-16 (cont.) — Overview intro redesign; course references removed

**Prompt (verbatim excerpt):** "let's work on the Overview below the hero. right now, I think the information that is pesented below the hero will just be overlooked by the human eye tbh. ... get rid of the "What the Simulator shows"and everything underneath of it. ... can we also get rid of anything that relates with University of Cincinnati or class names. ... let's implement something like the photo attached. add the Hero on the bottom underneath what is seen on the photo. keep it very clean and minimalist" (with a mockup screenshot).

**Plan mode** (`docs/plan-overview-intro-claude.md`). Andrew's answers: strip the names from the Gemini build too (text only, noted in `comparison.md`); move "What I learned" to the Video & Transcript tab; one-row header; neutral wording for the Prof. Co row.

**Built:**
- **Header:** one row with a lime drop-shaped logo mark, title, tabs and theme toggle; the subtitle with the course name is gone.
- **Overview:**
  - A two-column intro: pill eyebrow, big headline, a short accurate lead, a lime "Explore the Simulator →" button and a "How it works" link.
  - A dark card with a new animated schematic. Its flows are drawn correctly (crystallizer vapor → compressor → hot vapor → heater; the mockup had "compressed" vapor entering the compressor). It avoids the mockup's claim that MVR improves purity; purity comes from the purge.
  - The CRYSTALLIZE dot hero now sits below as a visual band, then three minimalist link cards and a slim AI-project note.
  - The "What the simulator shows" list was removed, and "What I learned" moved to the Video tab.
- **Course references removed:** meta description, footer, header subtitle, the AI Workflow "Prof. Co" justification and "as Prof. Co predicted"; in the Gemini build, text only (see `comparison.md`).

**Tests:**
- `browser-ux.mjs` gained Overview checks: intro and headline present, hero below the intro, diagram flows animate and stop under reduced motion, CTA opens the Simulator, one-row desktop header, "What I learned" on the Video tab, and no "Cincinnati" / "CHE 4061" / "Prof. Co" on `/` or `/gemini/`.
- `browser-hero.mjs` now scrolls the hero into view first, since it sits below the fold on phones and only animates on screen.
- Full suite passed locally in light and dark.

**Shipped and verified live:** main fast-forwarded to `635fffd` after green CI; Andrew deployed the zip. Every suite passes against https://ucseparations.netlify.app in light and dark (report: `docs/screenshots/verification/2026-11-16-live-overview/`).

## 2026-11-17 — Industry Context tab: Tesla video band, red flags resolved, cleanup

**Prompt (verbatim excerpt):** "let's work on the Industry context tab next ... I would like to remove the source needed and estimate red zones though ... I would like to imbed Tesla's video (https://www.youtube.com/watch?v=rxYTx6aj96k) into this tab ... something as seen on https://codepen.io/dudleystorey/pen/PZyMrd would be AWESOME. It could be buggy though so make sure you look into that intensely. ... clean things up similarly to what we did on the overview".

**Plan mode** (`docs/plan-industry-claude.md`). CodePen, YouTube and tesla.com were blocked from the cloud environment, so I asked instead of guessing. Andrew's answers:
- **Video effect:** a full-width, muted background video behind a headline.
- **Product rate:** use Tesla's stated output, 20,000 t/yr, instead of the unsourced lithium-intensity estimate.
- **MVR market share:** keep it, with soft grey styling.
- **Refining-dominance paragraph:** remove it.

Andrew approved adding www.youtube.com and www.tesla.com to the environment.
- YouTube oEmbed confirmed the video ("Tesla Lithium Refinery", channel Tesla, embeddable).
- tesla.com returns 403 to automated requests. The 20,000 t/yr ≈ 30 GWh figure is therefore cited as the 2025 Impact Report via its press coverage (Mining.com.au, EVwire). The 50 GWh figure is now labeled as the earlier announced target.

**Built:**
- **Video band:** a background-video band (`site/js/industry-video.js`), hardened against the usual bugs:
  - nothing loads from YouTube until the tab is opened, and it uses the nocookie host;
  - the player stays hidden over a poster until it actually plays, so a blocked autoplay never shows a big play button;
  - there is no background video under reduced motion, on phones, or with Save-Data;
  - it pauses on other tabs, when scrolled away, when the page is hidden, or while the dialog is open;
  - it loops manually, so YouTube's end screen never shows;
  - any failure falls back to the poster.
  - "Watch with sound" opens a `<dialog>` with the normal player; Esc closes it, the audio stops, and focus returns.
- **Tab cleanup:** product intro with fact chips; a stat strip (20,000 t/yr, 30 GWh, 2,500 kg/h); the 5-step process as a timeline with the crystallization step highlighted; "How much product?" rewritten as ṁ = 20,000/8,000 × 1000 = 2,500 kg/h and N = ṁ/C_sim ≈ 2.7 simulator-size crystallizers (C from `simulate()`), with a bar chart; the vendor paragraph with a grey "market estimate" chip; the operating-problem cards.
- **Data:** `tools/build_data.py` gained the `tesla-impact-2025`, `tesla-video` and `mvr-market` sources and the `teslaOutput`, `teslaCapacity` (30) and `mvrShare` values. The unsourced `lceIntensity` was removed.

**Bugs found by testing and fixed:**
1. Loading `#industry` directly drew the Plotly chart in a hidden div at its 700 px default width. On phones that widened the layout to 733 px and the browser zoomed out. The scrollWidth check missed it, because it measures after the zoom. Fix: draw only when visible. The UX and Industry tests now also check `innerWidth` on phones, for every tab.
2. The dialog overflowed 1280×720 projector screens; its width is now capped by the screen height.
3. The smoke and UX tests now stub YouTube, so CI never depends on YouTube's network or its console noise.

**New test:** `tests/browser-industry.mjs`, in CI for light and dark. It uses a stub IFrame API and covers: lazy loading, plays only once PLAYING is reported, inert iframe that covers the band, pause on tab change and when scrolled away, the dialog and focus, blocked autoplay → poster, YouTube unreachable → poster, reduced motion and phone, product arithmetic against the model, no red flags.

**Not testable here:** real playback (YouTube's video hosts and codecs aren't available in the container). Andrew will check that on his laptop and phone after deploying.

## 2026-11-17 (cont.) — mobile/tablet motion and video fix

**Prompt (verbatim):** "the video is currently working as intended on a laptop/desktop. it is not working on phone or tablet. along with this, the hero does flow on tablet/mobile and the overview process and the simulator process doesn't flow as intended. ... everything is working right on laptop/desktop rn."

**Diagnosis:** the hero (canvas driven by requestAnimationFrame) moved on phones and tablets, but both process diagrams (CSS keyframe animations on SVG stroke-dashoffset and transforms) did not. Every iPhone/iPad browser runs WebKit, which can leave SVG keyframe animations frozen. Separately, the background video hid the player with `opacity: 0` while it started. WebKit will not autoplay a muted video it considers hidden, and phones were excluded on purpose (below 700 px).

**Fix:**
- New `site/js/flow-anim.js` drives the dashed flows, the impeller and the settling crystals for both diagrams with requestAnimationFrame, the same mechanism as the hero.
  - PFD speeds still follow the live mass flows (`--d-*` variables from `pfd.js`).
  - Motion pauses off screen and on hidden tabs, freezes for the infeasible case, and is static under reduced motion.
  - The CSS keyframes were removed.
- Video: the player is never hidden. The poster now sits on top and fades away once the player reports PLAYING.
  - Phones and tablets get the background video; only reduced motion and Save-Data turn it off.
  - The start timeout went from 8 s to 15 s.
  - Added a size fallback for iPads without container-query units (iOS < 16).
- Tests:
  - UX and Industry now sample `stroke-dashoffset` over time instead of reading CSS animations.
  - Added phone (375) and tablet (820) checks that both diagrams move and that the background video plays with its iframe rendered.

**Limit:** the container only has Chromium. Phone and tablet emulation is not real Safari, so Andrew verifies on his iPhone/iPad after deploying.

## 2026-11-17 (cont.) — mobile fix did not work; diagnostics first

**Prompt (verbatim):** "nothing was fixed, it remains the same as the old zip file."

I checked the live site: every new file is deployed byte-for-byte, so the fix did not help on Andrew's devices and my diagnosis was a guess. I stopped guessing and added `site/diag.html`, an unlinked, noindex page that reports what the device actually does:
- Reduce Motion, Save-Data and container-unit support;
- the animation frame rate (Low Power Mode hint);
- whether CSS keyframes run on SVG, and whether visibility events fire for SVG;
- the real site's hero and diagram frame counters, measured in hidden on-screen frames;
- the video state, and a plain muted-autoplay test.

It also includes one cheap fix for a plausible WebKit cause: `flow-anim.js` now observes the diagram's HTML wrapper instead of the `<svg>`, and assumes the diagram is visible if no visibility event arrives within 1.5 s.

## 2026-11-18 — the real cause: Reduce Motion; motion toggle added

**Diagnostics from Andrew's iPhone** (iOS 18.7, Safari 26.6): **Reduce Motion ON**. The hero, both diagrams and the background video had 0 frames because the site honours that setting. CSS-on-SVG animation runs, visibility events fire, and muted YouTube autoplay plays. So nothing was broken: the earlier WebKit theory was wrong, and the diagnostics page settled it in one round instead of more guessing.

**Decision (Andrew):** add a motion toggle rather than ignore the setting.

**Built:**
- `<html data-motion="on|off">` is set before first paint from the saved choice, otherwise from the device's Reduce Motion setting.
- A header button (waves / struck-through waves, `aria-pressed`) switches it, remembers the choice, and fires a `motionchange` event.
- The hero, `flow-anim.js`, the background video and smooth scrolling all follow `data-motion`. Every former `@media (prefers-reduced-motion)` CSS block is now an `html[data-motion="off"]` rule.
- Default behaviour is unchanged for everyone: Reduce Motion still means still, until the visitor opts in.

**Tests:**
- UX: under Reduce Motion, motion starts off; the toggle starts the overview flows and the hero; the choice survives a reload; the PFD moves; toggling off stops it.
- Industry: the toggle starts the background video and stops it again.
- Full suite passes.

**Shipped (2026-11-18):** main fast-forwarded to `5471470` (CI green, deployed by Andrew). The live suite passes (`docs/screenshots/verification/2026-11-18-live-motion/`); one transient 502 in the first light smoke run was clean on re-run. Afterwards `site/diag.html` was removed from the repo; it leaves the live site with the next deploy.

## 2026-11-18 (cont.) — Theory tab cleanup

**Prompt (verbatim):** "next I want to work on cleaning up the theory section. this has the same issues as the old overview where theres just too much going on. can you try and clean it up a little bit by adding dropdown menus or something similar to storage some of the text? try to implement this in a very similar way to the other 2 cleaned up sections, as I liked how those turned out"

**Plan mode** (`docs/plan-theory-claude.md`), approved without changes.

**Built:**
- **Intro:** in the Overview style: pill, the headline "How a compressor replaces steam", the original lead, a Simulator CTA and a "Jump to the equations" button.
- **"At a glance" card:** live hand-calc numbers only: φ, BPE real vs ideal, lift, COP and solubility at 20 vs 100 °C. Lift and COP come from `simulate()`.
- **Seven concept cards:** each has a one-line takeaway, its key equation rendered from `content.js` (B2, B1, E3, C2, B4, M4, M9) with units, and a "Read more" dropdown holding the original paragraphs verbatim.
- **Equation reference:** the 33 equations sit in 5 accordions (closed, with ID chips and counts) under Expand all / Collapse all.
- **Fine print:** Simplifications and Glossary as dropdowns.
- **Flags:** the red SCHEMATIC/ESTIMATE flags became grey chips.

**Result at 1280 px:** 2,092 → 522 visible words; 6,323 → about 2,460 px tall.

**Also fixed:** a regression from the motion toggle. At 375 px the theme button wrapped to a second header row. The header is now tighter on narrow phones, and the title truncates at 320 px.

**New test:** `tests/browser-theory.mjs`, in CI for light and dark. It checks:
- 7 cards with visible key equations; dropdowns closed;
- far fewer visible words;
- every original paragraph still on the page (23 opening phrases);
- 33 equations present;
- the live numbers equal the model;
- Read more, Expand all / Collapse all and Jump work;
- no red flags;
- phone layout, including the header on one row.

Full suite passes.

**Shipped (2026-11-18):** main fast-forwarded to `89c3e1d` after green CI; Andrew deployed. Every suite passes on the live site in light and dark, including the new Theory checks (`docs/screenshots/verification/2026-11-18-live-theory/`). The temporary diagnostics page is gone from the live site.

## 2026-11-18 (cont.) — AI Workflow, Video & Transcript and References cleanup

**Prompt (verbatim):** "let's finishing the clean up the AI Workflow, video, and references tabs next, just add similar details to the others; I think you get the gist now"

**Plan mode** (`docs/plan-pages-claude.md`), approved.

**AI Workflow:**
- Intro: "One plan, two builders, one critic".
- A Phase 1 at-a-glance card (tests, time, cost, code size, fix prompts), with figures taken from the existing results table.
- The subtabs became a pill switch.
- The workflow is a 4-step timeline and the 5 findings are cards; the screenshots are kept.
- The results table (12 rows) and the critique decisions (10 rows) are now dropdowns.
- **Process Log:** the placeholder was replaced by a 12-milestone timeline from topic to live site, taken from this log. It includes ChatGPT as the third model and the live-site bugs.

**Video & Transcript:** intro, a 16:9 "Video coming by Dec 4" card, a transcript dropdown and a "What I learned" card, with grey chips instead of red placeholders. Setting `data-video-id` on `#vd-card` renders the youtube-nocookie player.

**References:**
- Intro: "Every number has a source", with live counts from `data.js`: 16 sources, 40 values, 22 estimates.
- Sources are shown as numbered cards; the citation numbers are unchanged.
- The value table is a dropdown, with grey estimate chips.
- Contributions are cards. "(student)" was dropped, and ChatGPT was added as the redesign planner (it was missing).

**New test:** `tests/browser-pages.mjs`, in CI for light and dark. It checks:
- the intros, and that no red flags or placeholders remain;
- nothing is lost: 12 and 10 table rows, 5 findings, 4 steps, both screenshots, and Gemini's false claim kept as evidence;
- the subtabs and dropdowns work;
- the counts equal `data.js`;
- the video hook renders a player;
- the phone layout fits.

The test also confirmed a detail: 22 values are estimates, and one of them (`spec.naMax_ppm`) is also "source needed". Full suite passes.

**Left as is (flagged to Andrew):** the two Phase 1 comparison screenshots still show the old course subtitle inside the images.

**Shipped (2026-11-18):** main fast-forwarded to `1e6074c` after green CI; Andrew deployed it. Every suite passes on the live site (`docs/screenshots/verification/2026-11-18-live-pages/`). The pages test needed a harness fix for remote runs: its video-hook check no longer fetches from Node.

## 2026-11-18 (cont.) — starter kit for the next course website

**Prompt (verbatim):** "yes, make the starter kit and send me the zip. Would chromatography make sense for Process Dynamics and Controls"

**Answer on the topic:** chromatography as a separation belongs to a separations course. As **composition control with an online GC analyzer** it fits a controls course well:
- the analyzer brings dead time and sampled measurements;
- that leads to FOPDT models, PID tuning, stability margins, and the Smith predictor or cascade control.

**Built:** `starter-kit/`:
- `README.md`, `PLAYBOOK.md` (the workflow, design pattern, lessons and prompts from this project), `CLAUDE.template.md`, the `context/` guide and a process-log template;
- a working 7-tab site skeleton: one-row header with theme and motion toggles, Overview-style intro with a live at-a-glance card, cards, dropdowns, grey chips, and an FOPDT step-response demo with sliders, KPIs, a Plotly chart, a KaTeX equation and a data.js-driven References list;
- tests: a hand-calc pattern (`npm test`), the generic smoke test (now with `--min-tabs`), and a new basics test (toggles remembered, dropdowns, 375/320 px phones without zoom-out, header on one row);
- a CI workflow.

Verified as a fresh project: npm 4/4; smoke 7 tabs, 3 sliders, 0 failures in light and dark; basics pass. Zipped as `dist/starter-kit.zip`.

## 2026-11-27 — finishing pass: every red tag and "to verify" resolved

**Prompt (verbatim):** "okay now I want to completely finish the website. get rid of all of the to verify and red tags. ask me questions and we can clear things up and push"

**Inventory:**
- 16 red ESTIMATE flags on the Simulator;
- one "to verify" (Antoine constants);
- one "source needed" (battery-grade Na limit);
- placeholders on the Video tab ("What I learned") and in Contributions;
- the class name still visible inside the two comparison screenshots.

**Andrew's decisions and what was done:**
- **Simulator estimates:** now grey "estimate" chips (sliders, Help panel, P9 note); still clearly labeled.
- **Antoine constants:** re-verified against the stored NIST table (25 points): max 0.383 % from 30 to 110 °C, mean −0.27 %, 0.56 % at 130 °C. Recorded in the citation; the "to verify" note is removed.
- **Battery-grade Na limit (`spec.naMax_ppm`):** unused and unsourced, so removed from `tools/build_data.py` and `data.js`. Chart P7 no longer shows its "SOURCE NEEDED" note. The References table now lists 39 values.
- **Video:** not uploaded yet, so the "coming by Dec 4" card and the transcript chip stay.
- **What I learned / what I want to learn next:** drafted in Andrew's voice from this log (engineering lessons, AI-workflow lessons, next steps), for him to edit before presenting.
- **Contributions:** Andrew's card and "Other tools" are filled in from the log and the repo.
- **Comparison screenshots:** cropped above the tab row (Claude −40 px, Gemini −33 px) to remove the course and professor names. The simulator content is unchanged.
- **Tesla figure:** kept as cited coverage of the 2025 Impact Report.

**Result:** 0 red flags or placeholders and no "to verify" left. The remaining grey chips are honest qualifiers: 39 estimates, 1 schematic, 1 market estimate, and the transcript pending upload. `browser-pages.mjs` now accepts at least 30 values (39 after the removal).

**Tests:** full suite passes; the expected hand-calc values are unchanged.

## 2026-11-27 (cont.) — Andrew's conclusions added

**Prompt:** Andrew wrote his conclusions (which build he shipped and why, ChatGPT's strength at moodboards and UI/UX planning, GitHub Pages plus a Gemini API key for next time, about $5 spent across both projects) and what he learned and wants to learn next.

**Done:**
- Paragraph 1 is now a "My conclusions" quote on the AI Workflow → Model Comparison tab, and it replaces the placeholder in `docs/comparison.md` §6.
- Paragraph 2 leads the "What I learned / what I want to learn next" section on the Video tab, above the three drafted cards.
- Both appear verbatim except three small typo fixes, reported to Andrew: "uI" → "UI", "effects" → "affects", "project" → "projects".

Full suite passes.

## 2026-11-27 (cont.) — hosting moved from Netlify to GitHub Pages

**Prompt (verbatim):** "can you actually push the website to GitHub Pages instead of hosting in Netlify? I tried doing this with my other class project and it worked so much better an is nice how hands free it is"

**Built:**
- `.github/workflows/pages.yml` publishes `site/` to GitHub Pages automatically whenever the CI workflow succeeds on `main`. If any test fails, nothing is published. A manual run is also possible.
- One-time setup by Andrew: Settings → Pages → Source: GitHub Actions.
- The site uses only relative paths, so it works under `https://be-aa8.github.io/separations/`.
- Three tests imported `/js/...` from the domain root; they now use `./js/...`.
- Before shipping, the full suite was run against a local copy served from `/separations/`: all pass.
- Contributions and `CLAUDE.md` now name GitHub Pages as the host (Netlify until today). No more zip uploads.

**Live on GitHub Pages (2026-11-27):**
- The first automatic deploy failed only because Pages was not enabled. Andrew set Settings → Pages → Source: GitHub Actions, and the re-run succeeded.
- `be-aa8.github.io` was added to the environment's network allowlist so the live tests could run.
- All 22 files on https://be-aa8.github.io/separations/ match `site/` exactly.
- Every suite passes live in light and dark (`docs/screenshots/verification/2026-11-27-live-ghpages/`).
- From now on, every green CI run on `main` republishes the site; no zips.
