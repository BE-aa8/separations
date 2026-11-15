# Phase 2 plan: MVR Crystallizer Explorer (Claude build, `site/`)

## Context
Phase 1 is done: both builds are on `main` and live at ucseparations.netlify.app. Plan v2 (§2, §3, §8 $5–$7, §9 P9–P10) defines Phase 2 for the **Claude build only**:
(a) heater-ΔT capital vs operating cost optimum (P9), (b) clickable process-flow diagram, (c) fixed-area turndown (P10).
These answer Prof. Co's Lecture 10 requests (equipment pricing, operating scenarios/turndown, economics across the operating range) and the "why not a tiny ΔT?" Q&A question.
Cost data source (Andrew's choice): the public-domain **DOE/NETL "Process Equipment Cost Estimation" report (OSTI 797810)**. The Gemini build (`site/gemini/`) is not changed.

## Step 0: Data (before any code)
1. Propose adding `osti.gov` (report) and `ucseparations.netlify.app` (live smoke test) to the "seperations" environment allowlist (approval prompt). If the CEPCI article host (chemengonline.com) is needed, propose it then.
2. Read the DOE report. Extract cost-vs-size points for: **centrifugal compressor + motor drive** (cost vs kW) and **forced-circulation evaporator, or shell-and-tube HX if no evaporator curve** (cost vs m²), plus the report's cost year and its CEPCI, and any installation factors. Points read off graphs are tagged `estimate: true` with a note ("read from Fig. X, ±10 % reading error").
3. Current CEPCI: try the Chemical Engineering annual-average article. If it can't be sourced, show costs in the report's base-year dollars with an "escalation factor" slider labeled ESTIMATE (default 1.0) rather than invent an index.
4. Finance (ESTIMATE, sliders): interest 10 %/yr, life 10 yr → CRF = i(1+i)ⁿ/((1+i)ⁿ−1).
5. Add everything to `tools/build_data.py` → regenerate `site/js/data.js` (sources added to `SOURCES`; CI checks regeneration).
   - Gemini's copy (`site/gemini/js/data.js`) stays frozen as built; only `site/js/data.js` is regenerated.

## Step 1: Physics (`site/js/model.js`, pure functions, existing style)
Reuse `mvr()`, `massBalance()`, `simulate()`, `linspace`, `interp` already in the file.
- `heaterArea({ Q_kW, U, dT })` → A = Q·1000/(U·ΔT) m² ($5).
- `compressorCost(kW)`, `heaterCost(m2)`: log-log interpolation in the DATA cost tables × escalation; throw (→ warning) outside the table's size range.
- `crf(i, n)`.
- `tacAt(inp, dT)`: one design point → { A, Wshaft_kW, C_comp, C_hx, capAnnual, energyAnnual = annual_MVR, TAC } ($6).
- `sweepTAC(inp, dTs = 1..15)` + optimum ΔT (min TAC on the sweep grid, refined by golden-section on [1, 15]).
- `turndownAt(inp, f)`: A fixed at the design point (`inp.dT_heater`, full load). At load f: F→fF, so V, Q scale by f; ΔT′ = Q′/(U·A) = f·ΔT (U constant, ESTIMATE); rerun `mvr()` at ΔT′ → { dT, r, kWh_per_t, cost_per_t } ($7).
- `sweepTurndown(inp, f = 0.5..1.1)`.
- `simulate()` gains one key, `design: { A, tac, optimum, turndown }`. Existing keys are unchanged, so the Phase 1 test still passes. New inputs `U`, `loadFraction` already exist in `DEFAULT_INPUTS`; add `interest`, `life_yr`, `escalation`.

## Step 2: Charts (`site/js/charts.js`, same `draw`/`base`/`ax` helpers)
- **P9**: annualized capital (compressor + heater), annual energy cost, TAC vs ΔT_heater; optimum and current points marked; heater area on a secondary axis. "What if?": U, prices, interest.
- **P10**: kWh/t and $/t vs load fraction (50–110 %), with r on a secondary axis; current load marked; note "no compressor surge map (beyond course level)".

## Step 3: UI (`site/js/ui.js`, `site/js/pfd.js`, `site/index.html`, `site/css/style.css`)
- New sliders (existing `SLIDERS` table): U, load fraction, interest, life, escalation (ESTIMATE labels from DATA).
- New cards (existing `CARDS` table): heater area A ($5), compressor cost, heater cost, TAC ($6), optimum ΔT, turndown ΔT′ and kWh/t ($7), each with KaTeX, units, and interpretation.
- **Clickable PFD**: units in the SVG become focusable buttons (`role="button"`, `tabindex=0`, Enter/Space). Clicking opens a side panel (below the diagram on mobile) listing that unit's equations and live values, reusing card definitions by id:
  crystallizer → s, m, BPE, Tv, C, V, yield; compressor → r, w_s, w, T2, W, kWh/t, COP; heater → Q, A, ΔT, cost; centrifuge → ε, impurity; purge → z_ML, P. The panel updates on every slider move.
- Theory tab: add equations $5–$7 to the existing equation list (they already exist in plan §8).

## Step 4: Tests (written before the code, same pattern as Phase 0)
- Extend `tests/reference/handcalc_reference.py` with an independent Phase 2 section (area, CRF, costs from the same DATA tables, TAC at the default, optimum ΔT, turndown at 75 % and 50 % load) → `tests/handcalc-expected.json` key `phase2`.
- New `tests/phase2.test.mjs` (Claude build only): values within ±0.5 % (optimum ΔT ±0.1 K); limiting cases (f = 1 reproduces the base case; A ∝ 1/ΔT; TAC convex with an interior minimum for defaults); `npm test` picks it up.
- New `tests/browser-phase2.mjs` (Claude build only, added to CI): clicking each PFD unit opens a panel with KaTeX and no NaN; the P9/P10 charts render; the U and load sliders change them.
- The existing generic smoke test still runs on both builds.

## Step 5: Docs and deploy
- Save this plan as `docs/plan-phase2-claude.md`; add a Phase 2 section to `docs/handcalc.md` (unit checks + interpretations); append to `docs/process-log.md`.
- Commit on `claude/presentation-planning-dec7-jqubaj`, push, confirm CI green, fast-forward `main`.
- Rebuild `dist/mvr-crystallizer-site.zip` and send it for Netlify Drop. After Andrew deploys, run the smoke test against ucseparations.netlify.app.

## Verification
- `npm test` (Phase 1 17/17 + Phase 2 tests) and CI green on GitHub.
- The reference script and data regenerate identically (CI checks).
- Browser: generic smoke test on `/` and `/gemini/`, plus the Phase 2 browser test on `/`; screenshots of P9, P10, and an open PFD panel at 1280 px and 375 px, viewed by me before reporting.
- Sanity: the TAC optimum lies inside 1–15 K for defaults; at the optimum, raising electricity price shifts optimum ΔT **down**, and raising U shifts it **down**; documented as the "how does that make sense?" lines.

## Cut order if data is a problem
If DOE curves lack an evaporator/HX or compressor size range covering ~250 kW / ~470 m², fall back to showing P9 with physical trade-off only (area and energy vs ΔT, no dollars) and flag "capital cost: SOURCE NEEDED", rather than extrapolate.
