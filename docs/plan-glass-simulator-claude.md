# Plan: Apple-inspired "Liquid Glass" Simulator redesign

## Context
Andrew finds the Simulator overwhelming. Measured today (1280 px): **~2,330 visible words**, of which ~700 are explanation (35 card interpretations = 424 words, 12 chart "What if?" notes = 198, slider and diagram hints ≈ 50), plus 35 rendered equations. There are **35 result cards** in 6 groups, **21 sliders** in 6 groups (+ the cooling slider, 5 presets), and **12 charts** that start **4,479 px** down a 7,343 px page. He wants a calm, premium, Liquid-Glass-inspired engineering simulator (references: Airglow glass cards, Lumare typography and editorial grid). **Decisions (Andrew):** clean by default with **Explain toggle + per-item "?"**; glass applied to the **Simulator first** (reusable tokens); charts **grouped, all visible**. Physics, data, equations, defaults, Gemini build: untouched.

## 1. Current simulator audit
- **Layout** (`site/index.html` `#tab-simulator`): `.sim-layout` grid = sticky `.controls` aside (presets, `#sliders` built by `buildSliders()` from `SLIDERS` in `ui.js`) + `.results` (warnings → `#pfd` + `#pfd-panel` → `#cards` built by `buildCards()` from `CARDS` → `.plots` grid of 12 `figure.plot`, each with a figcaption and `.whatif` text).
- **Problems:** (1) no summary: the key answers (kWh/t, $/t, yield, purity) sit among 35 equal-weight cards; (2) every card shows its equation + live interpretation → wall of text; (3) charts are ~4,500 px below the inputs, so cause→effect is lost; (4) 35 small boxes = visual noise; (5) on phones, 22 sliders come before any result; (6) the diagram panel pushes content down.
- **Keep:** all calculations and live updates; presets; the real/ideal BPE toggle; ESTIMATE flags; the live PFD and clickable units; the worked substitutions (`sub`) and interpretations (`say`, `EQ[].interp`); value flashes; dark/light; all 12 charts.

## 2. Design concept
A calm "instrument panel" on a soft atmospheric backdrop: a few **large glass panels** (inputs, key results, process, charts), with content inside them on quiet, near-flat surfaces, so the glass marks hierarchy instead of wrapping everything. Big, light numerals for the headline results (Airglow's "19°" treatment), editorial section titles (Lumare), thin hairline borders, generous spacing. Engineering detail is one tap away, never in the way.

## 3. Help design (recommended: two layers, same content)
1. **Explain switch** in the simulator toolbar (a "?" pill labeled "Explain", `aria-pressed`, remembered in localStorage). Off (default) = clean view. On = every result row shows its equation, live interpretation and worked substitution inline; charts show their "What if?" notes; inputs show hints. Use it when presenting, so Prof. Co's "how does that make sense?" is always one click away. This satisfies the CLAUDE.md rule on demand, and the Theory tab keeps everything.
2. **Contextual "?"** on each result row, KPI tile, input group and chart → opens one shared, non-modal **glass Help panel**: desktop = floating panel at the right edge of the results; mobile = bottom sheet. It shows title, equation tag, KaTeX equation, the worked substitution **with live numbers** (updates as sliders move), units, interpretation, and the source if any. Esc / ✕ closes it; focus returns to the trigger; one panel at a time.
- **Nothing is deleted:** `CARDS[].say/sub`, `EQ[].interp`, the chart `whatif` texts and slider hints all stay; they're moved into help slots (hidden by CSS until Explain or the panel shows them).
- **Always visible:** input labels, values and units, ESTIMATE flags, warnings, result names, values, units, chart titles, axes and legends.

## 4. Proposed simulator layout (desktop ≥ 1100 px)
```
[ toolbar (glass pill, sticky under header): Presets ▾ (segmented pills) · Explain (?) · Jump: Process · Results · Charts ]
[ Inputs (glass, sticky, own scroll) ] [ KEY RESULTS: 6 large glass tiles                                   ]
[  6 collapsible groups (all open on  ] [  kWh/t · MVR vs N-effect $/t · Li yield · impurity ppm · BPE · ΔT*   ]
[  desktop), refined sliders          ] [ PROCESS: live PFD (glass panel); unit click → floating detail card  ]
[                                     ] [ RESULTS: 6 sections, each a glass panel holding compact rows:      ]
[                                     ] [   name · value · units · tag(M2) · ?   (2-column grid on desktop)  ]
[                                     ] [ CHARTS: 4 titled sections, all visible:                            ]
[                                     ] [   Energy & cost (P5, P6, P9, P10, P11) · BPE & compressor (P2, P3, P4) ]
[                                     ] [   Purity & mass balance (P7, P8) · Crystallization (P1, P1b)       ]
```
KPI tiles use values `simulate()` already returns (`mvr.kWh_per_t`, `econ[1].cost_MVR_per_t` vs `econ[N].cost_ME_per_t`, `mass.liYield`, `mass.productImpurity_ppm`, `BPE`, `design.optimum.dT`); each tile's "?" opens the matching card's help. The result rows replace the 35 boxed cards visually; same data, ~60 % less height.

## 5. Desktop and mobile behavior
- **≥ 1100 px:** as above; inputs sticky with internal scroll; toolbar sticky.
- **700–1100 px:** inputs become a collapsible glass panel above the results (closed by default after first visit), KPI tiles 3 per row.
- **< 700 px:** a floating **"Inputs" pill** (bottom) opens a glass bottom sheet with the input groups as accordions (sliders stay in the DOM, so tests and presets work); KPI tiles scroll horizontally inside their strip; PFD scrolls inside its panel; result sections are accordions (first open); charts stacked; Help = bottom sheet. Never page-level horizontal scroll.

## 6. Visual design system (simulator scope; tokens in `:root`/`[data-theme="dark"]`)
- **Backdrop:** light #EEF1EC with two very soft radial washes (lime 6 %, teal 5 %); dark #0B100E with deep olive/teal washes. No busy gradients.
- **Glass:** `background: rgba(255,255,255,.58)` / dark `rgba(22,28,25,.55)`; `backdrop-filter: blur(22px) saturate(160%)`; border 1px `rgba(255,255,255,.65)` / dark `rgba(255,255,255,.08)`; top inner highlight `inset 0 1px 0 rgba(255,255,255,.7)` (dark .06); shadow `0 10px 30px -12px rgba(9,13,12,.18)`. `@supports not (backdrop-filter)` → opaque surface. Blur only on ~6 panels (not on 35 rows) for performance.
- **Radii:** panels 24 px, tiles/rows 16 px, buttons/pills/slider track 999 px.
- **Type (Inter, self-hosted):** KPI value 44/48 px weight 300–500, tracking −0.03em, tabular; section titles 22 px 600; labels 11 px mono uppercase +0.08em; row name 14 px; row value 17 px 600 mono-tabular; help body 15 px.
- **Color:** accent lime/olive for active state and fills only; status colors (warning amber, ESTIMATE red, ok green) unchanged; stream colors unchanged.
- **Controls:** custom range: 4 px rounded track with filled portion (CSS var `--pct`, set by `syncSliders`), 20 px white thumb with soft shadow and 1 px border, focus ring; value shown as a pill; segmented preset control; switch-style toggles.
- **Spacing:** 8-pt grid; panel padding 20–24 px; row height ≥ 40 px (touch).
- **Motion:** 180–260 ms, `cubic-bezier(.2,.8,.2,1)`; Help panel fade+scale 0.98→1; accordion height transitions; value flash kept; all off under reduced motion.

## 7. File-by-file plan
| File | Changes |
|---|---|
| `site/index.html` | Simulator section only: toolbar (presets as segmented pills, Explain switch, jump buttons using `scrollIntoView` (not hash links)); KPI strip container; Help panel container (`#help-panel`, `role="dialog"`, `aria-modal="false"`); chart figures regrouped into 4 titled sections (same `#p1…#p11`, `#p1b`, `#p5-note`, `#tcold`, `#tcold-out`, `#cool-yield`); `.whatif` text wrapped as help slots; mobile Inputs pill. IDs kept. |
| `site/css/style.css` | Glass tokens (light/dark), simulator-scoped layout (`#tab-simulator …`), panels, KPI tiles, result rows, refined sliders, segmented control, switch, Help panel and bottom sheet, accordions, responsive breakpoints, reduced motion, `@supports` fallback. Other tabs untouched except tiny harmonizing (rounded nav pill optional, off by default). |
| `site/js/ui.js` (presentation only) | `buildSliders`: group disclosure (`<details>`), `--pct` fill, hints as help slots. `buildCards`: render each `CARDS` item as a compact `.rcard` row (keeps `.rcard`, `.num`, `.u`, `.eq`, `.short`, `.more`, `.help`); the `.help` button opens the Help panel instead of the inline toggle. New: `renderKPIs(out)`, `openHelp(id)` / `closeHelp()` (live-updating on `update()`), Explain switch (+ localStorage), mobile sheet open/close, focus management, Esc. `CARDS`/`SLIDERS` texts, `fmt`, `simulate` calls unchanged. |
| `site/js/charts.js` | Styling only: transparent paper to sit on glass (theme-aware), slightly larger titles/axes; no trace or data changes. Call `Plotly.Plots.resize` after accordion/sheet changes (charts stay visible, so this is rare). |
| `site/js/pfd.js` | Visual polish only (rounded equipment, glass legend chips); `pfd-*` IDs, `data-unit` groups, keyboard unchanged. `#pfd-panel` becomes a floating glass card over the diagram on desktop (below it on mobile). |
| `site/js/content.js` | **No change** (equations and interps reused as-is). |
| `tests/browser-glass.mjs` (new, in CI, both themes) | Explain off → no `.short`/whatif text visible and ≤ ~600 visible words; Explain on → interpretations, equations and what-ifs visible and persisted after reload; a row's "?" opens `#help-panel` with KaTeX, live numbers, no NaN; Esc closes and focus returns; the panel updates when a slider moves; KPI tiles show the same values as their cards; mobile Inputs sheet opens and a slider in it changes a KPI; no horizontal scroll at 375 px; no console errors; reduced motion → no transitions running. |
| `tests/browser-ux.mjs` | Minor: the flash check stays (`.rcard .num.changed`); adjust any selector that assumed the boxed card layout. |
| Not touched | `model.js`, `data.js`, equations in `content.js`, defaults, `site/gemini/**`, other tabs' content. |

## 8. Risk assessment
- **Smoke test:** sliders inside closed `<details>`/sheets aren't "visible" → fewer sliders exercised. Mitigation: all groups open on desktop (where the smoke test runs the slider loop); the new glass test covers the mobile sheet.
- **Phase 2 test:** needs `#pfd-panel` visible with KaTeX after a unit click, and `#p9`/`#p10` responsive to `#in-U`, `#in-loadFraction`, `#in-interest`: kept.
- **Plotly in hidden containers** renders at the wrong size: avoided because charts stay visible; resize after accordions.
- **backdrop-filter cost** on low-end phones and projectors: blur limited to a few panels, with an opaque fallback.
- **Contrast on glass:** text sits on near-opaque inner surfaces; check WCAG AA in both themes.
- **Hash routing:** toolbar jump links must be buttons (`scrollIntoView`), never `href="#…"`.
- **Course rule:** satisfied through the Explain switch + "?"; record the decision in the process log.
- **Focus traps / Esc** in the Help panel and sheet: explicit tests.

## 9. Testing plan
Every phase: `npm test` (23/23); `browser-smoke.mjs` light + dark on `/` and `/gemini/`; `browser-phase2.mjs` light + dark; `browser-hero.mjs`; `browser-ux.mjs`; new `browser-glass.mjs`. Screenshots at 1280×720, 1280×800, 375×812 in both themes reviewed by me; short screen recordings of Explain/Help and the mobile sheet. CI green before fast-forwarding main; Netlify zip verified against `site/`.

## Implementation phases (each ends with a checkpoint for Andrew)
- **G1:** glass tokens, atmospheric backdrop, simulator layout shell, toolbar, refined sliders and segmented presets (no content moves yet).
- **G2:** KPI strip + compact result rows + Explain switch + Help panel (the "less overwhelming" core).
- **G3:** charts regrouped into 4 sections with jump bar; chart glass styling; what-ifs moved to help.
- **G4:** PFD integration (floating detail card, glass legend) + mobile Inputs sheet and accordions.
- **G5:** polish: motion, both themes, accessibility, projector check, ship (CI → main → zip).
