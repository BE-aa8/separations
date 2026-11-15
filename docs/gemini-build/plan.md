# Gemini's Phase 1 implementation plan

_Run 20261115T202947Z, models: gemini-3.8-flash_

# Implementation Plan: MVR Crystallizer Explorer — Phase 1 (MVP)

Below is the complete implementation plan for Phase 1 (MVP) of the **MVR Crystallizer Explorer** static educational website, isolated to `site/gemini/`.

---

## 1. Objective & Scope

Build **only Phase 1 (MVP)** (per `docs/plan-v2-final.md` §2–§3) in `site/gemini/` for UC CHE 4061 Separation Processes (Prof. Carlos Co, Fall 2026). The site teaches why lithium refineries (such as Tesla's Robstown, TX facility) crystallize battery-grade $\text{LiOH}\cdot\text{H}_2\text{O}$ using Mechanical Vapor Recompression (MVR) evaporative crystallizers instead of traditional multi-effect evaporation.

All generated files will reside strictly within `site/gemini/`. No Phase 2 items (capital cost optimization P9, fixed-area turndown P10, clickable PFD) will be built in this phase.

---

## 2. Architecture & File Structure

```
site/gemini/
├── index.html           # Single-page app with 7 hash-routed tabs, responsive layout
├── css/
│   └── style.css        # Responsive styling (mobile <= 375px), theme, cards, tables, KaTeX/Plotly containers
└── js/
    ├── data.js          # Unchanged copy of site/js/data.js (single source of truth)
    ├── model.js         # Pure thermodynamic model (Node 18+ and browser ES module)
    ├── pfd.js           # Static labeled SVG PFD with live overlay stream values
    ├── charts.js        # Plotly chart definitions (P1–P8, P11) with live updates and operating markers
    └── ui.js            # Tab routing, slider bindings, presets, KaTeX rendering, card expanders, alerts
```

### Pinned Dependencies (via CDN)
- **Plotly**: `https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js` (2.35.2)
- **KaTeX CSS**: `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css` (0.16.11)
- **KaTeX JS**: `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js`
- **KaTeX Auto-render**: `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js`

---

## 3. Component Details

### 3.1 Data Management (`site/gemini/js/data.js`)
- Copy `site/js/data.js` to `site/gemini/js/data.js` **unchanged**.
- Zero modification to property constants, steam tables, solubility data, or source citations.

### 3.2 Pure Physics Model (`site/gemini/js/model.js`)
Pure functions, zero DOM dependencies, fully testable under Node 18+ (`npm test`).

#### API Contract & Functions:
1. `psat(T_C)`:
   - Antoine equation: $\log_{10}(P_{\text{mmHg}}) = A - \frac{B}{C + T_C}$
   - $P_{\text{kPa}} = 10^{A - \frac{B}{C + T_C}} \times 0.133322$
   - Constants from `DATA.antoine`: $A = 8.07131, B = 1730.63, C = 233.426$ (valid over 30–130 °C).
2. `tsat(P_kPa)`:
   - Exact algebraic inverse of Antoine:
     $$T_C = \frac{B}{A - \log_{10}(P_{\text{kPa}} / 0.133322)} - C$$
3. `hfg(T_C)`:
   - Linear interpolation of saturation latent heat from `DATA.steamTable.rows` ($T_C$ in col 0, $h_{fg}$ in col 4).
   - Throws error if $T_C$ is strictly outside table bounds ($30$ to $150\ ^\circ\text{C}$).
4. `solubility(T_C)`:
   - Linear interpolation of $\text{LiOH}$ solubility from `DATA.solubility.points` ($g\ \text{LiOH} / 100\ g\ \text{H}_2\text{O}$).
5. `phi_sat(T_C)`:
   - Linear interpolation of saturated osmotic coefficient from `DATA.osmoticSat.points`.
6. `bpe({ s, T_C, i = 2, activityFactor = 1.0 })`:
   - $m = \frac{s / 100}{M_{\text{LiOH}} / 1000}$ ($\text{mol/kg}$, with $M_{\text{LiOH}} = 0.023947\ \text{kg/mol}$)
   - $K_b = \frac{R \cdot (T_C + 273.15)^2}{h_{fg}(T_C) \cdot 1000}$ ($\text{K}\cdot\text{kg/mol}$, evaluated at liquor temperature $T_C$)
   - $\text{BPE} = \text{activityFactor} \cdot i \cdot K_b \cdot m$ ($\text{K}$)
7. `massBalance({ F, xF, zF, T_C, purgeRatio, epsilon })`:
   - $f_{\text{Li}} = M_{\text{LiOH}} / M_{\text{hydrate}} \approx 0.570683$
   - $P = \text{purgeRatio} \cdot F$
   - $z_{\text{ML}} = z_F / \text{purgeRatio}$
   - $s = \text{solubility}(T_C)$
   - $x_L = (1 - z_{\text{ML}}) \frac{s}{100 + s}$
   - $C = \frac{F x_F - P x_L}{f_{\text{Li}}}$
   - $V = F(1 - x_F - z_F) - (1 - f_{\text{Li}})C - P(1 - x_L - z_{\text{ML}})$
   - Feasibility check: $\text{feasible} = (C \ge 0 \land V \ge 0 \land x_L > 0)$
   - If infeasible: flows set to `null` (`C = null, V = null, P = null`), `closureError = null`, `liYield = null`.
   - If feasible:
     * $\text{liYield} = \frac{f_{\text{Li}} C}{F x_F}$
     * $\text{productImpurity\_ppm} = \frac{\varepsilon z_{\text{ML}}}{1 + \varepsilon} \times 10^6$
     * $\text{closureError} = V + C + P - F$ (asserted $\le 10^{-6}\ \text{kg/h}$)
8. `mvr({ V, Tb_C, BPE, dT_heater, etaIs, etaMotor, gamma })`:
   - $T_v = T_b - \text{BPE}$
   - $T_c = T_b + \Delta T_{\text{heater}}$
   - $P_1 = p_{\text{sat}}(T_v)$, $P_2 = p_{\text{sat}}(T_c)$
   - $r = P_2 / P_1$
   - $\text{lift} = T_c - T_v = \text{BPE} + \Delta T_{\text{heater}}$
   - $k = (\gamma - 1) / \gamma$
   - $T_1 = T_b + 273.15$
   - $w_s = \frac{\gamma}{\gamma - 1} R_v T_1 (r^k - 1) / 1000$ ($\text{kJ/kg}$)
   - $w = w_s / \eta_{\text{is}}$
   - $T_{2,C} = T_1 [1 + (r^k - 1)/\eta_{\text{is}}] - 273.15$
   - $W_{\text{shaft}} = V \neq \text{null} ? V \cdot w / 3600 : \text{null}$ ($\text{kW}$)
   - $W_{\text{elec}} = W_{\text{shaft}} / \eta_{\text{motor}}$ ($\text{kW}$)
   - $\text{kWh/t} = w / (3.6 \cdot \eta_{\text{motor}})$
   - $\text{COP} = h_{fg}(T_v) / w$
   - $\text{COP}_{\text{Carnot}} = (T_c + 273.15) / (T_c - T_v)$
9. `multiEffect({ V, Q_kW, Ts_C, Tlast_C, N, BPE, dTmin, lambdaV })`:
   - $E_1 = h_{fg}(T_s) / \lambda_V$
   - $\text{economy} = N \cdot E_1$
   - $S = V \neq \text{null} ? V / \text{economy} : \text{null}$
   - $\Delta T_{\text{per\_effect}} = (T_s - T_{\text{last}} - N \cdot \text{BPE}) / N$
   - $\text{maxFeasibleN} = \lfloor(T_s - T_{\text{last}}) / (\text{BPE} + \Delta T_{\text{min}})\rfloor$
   - $\text{feasible} = (\Delta T_{\text{per\_effect}} \ge \Delta T_{\text{min}})$
10. `economics({ kWh_per_t, economy, ce, cs, V, hours })`:
    - $\text{cost\_MVR\_per\_t} = c_e \cdot \text{kWh/t}$
    - $\text{cost\_ME\_per\_t} = c_s / \text{economy}$
    - $c_{e,\text{crossover}} = c_s / (\text{economy} \cdot \text{kWh/t})$
    - $\text{annual\_MVR} = V \neq \text{null} ? \text{cost\_MVR\_per\_t} \cdot V \cdot \text{hours} / 1000 : \text{null}$
    - $\text{annual\_ME} = V \neq \text{null} ? \text{cost\_ME\_per\_t} \cdot V \cdot \text{hours} / 1000 : \text{null}$
11. `simulate(inputs)`:
    - Merges `DEFAULT_INPUTS` with user inputs.
    - Evaluates properties, mass balance, MVR, and multi-effect & economics for $N \in \{1, 3, 5, \text{inputs.N}\}$.
    - Returns `{ s, m, Kb, phi, BPE, Q_kW, lambdaV, mass, mvr, effects, econ, inputs, warnings }`.
12. `DEFAULT_INPUTS`:
    - Exactly the 19 default values specified in plan §5.4 matching `tests/handcalc-expected.json`.

---

### 3.3 UI & 7 Tabs Architecture (`site/gemini/index.html`, `style.css`, `ui.js`)

#### Navigation
- Pinned accessible navbar using `[role="tab"]` and `nav a[href^="#"]` with URL hash-routing.
- Mobile-friendly scrolling tab bar that never triggers horizontal overflow on the page viewport ($375\ \text{px}$).

#### Tab 1: Overview
- Motivation: Global transition to EVs $\rightarrow$ high-nickel cathodes demand battery-grade $\text{LiOH}\cdot\text{H}_2\text{O}$ $\rightarrow$ crystallization is the largest thermal energy sink in chemical refining.
- Site guide: Interactive engineering explorer contrasting MVR with multi-effect steam evaporation under variable thermodynamic lift, BPE, and electricity/steam utility prices.
- Prominent "AI Project" banner linking to the AI Workflow tab.
- "What I learned / what I want to learn next" reflection card.

#### Tab 2: Industry Context
- Chemical rationale for $\text{LiOH}\cdot\text{H}_2\text{O}$ vs $\text{Li}_2\text{CO}_3$ in NMC 811 cathodes.
- Tesla Robstown, TX refinery process flow walkthrough:
  $$\text{Spodumene} \xrightarrow{\text{Calcining Kiln}} \beta\text{-spodumene} \xrightarrow{\text{Alkaline Leach}} \text{Pregnant Leach} \xrightarrow{\text{Ion Exchange}} \xrightarrow{\text{MVR Crystallizer}} \text{Centrifuge} \xrightarrow{\text{Drying/Pack}} \text{LiOH}\cdot\text{H}_2\text{O}$$
- Production volume calculations:
  $50\ \text{GWh/yr} \times 0.7\ \text{kg LCE/kWh} \approx 35,000\ \text{t LCE/yr} \times 1.136 \approx 40,000\ \text{t LiOH}\cdot\text{H}_2\text{O/yr} \approx 5\ \text{t/h}$ product ($50\ \text{t/h}$ feed at 6 wt%).
- Market share and geopolitical context: Chinese refining concentration (~70%+), IRA requirements, equipment vendors (Veolia HPD forced-circulation crystallizers, US Patent 10,961,126 B2).
- Operating Problem Callout Cards:
  1. *Foaming*: High vapor velocities and surfactant impurities cause foaming, entraining mother liquor into compressor suction (impeller erosion, condensate contamination).
  2. *$\text{Li}_2\text{CO}_3$ Scaling*: Carbonate absorption causes inverse-solubility $\text{Li}_2\text{CO}_3$ to precipitate on hot heat exchanger tubes, degrading overall heat transfer coefficient $U$.

#### Tab 3: Theory
- Detailed ChemE theory sections with KaTeX equations M1–M9, B1–B5, E1–E4, C1–C8, and $1–$4.
- Every equation rendered with: KaTeX math block, equation label, units, and the exact one-line physical interpretation from plan §8.
- Comprehensive coverage:
  * Single-stage VLE thermodynamics.
  * Colligative BPE: Ideal van 't Hoff vs Pitzer osmotic coefficient $\phi_{\text{sat}}$ from Monnin & Dubois (2005) ($3.95\ \text{K}$ real vs $4.76\ \text{K}$ ideal at $60\ ^\circ\text{C}$).
  * Multi-effect steam economy and cumulative BPE penalty: $\Delta T_{\text{per effect}} = (T_s - T_{\text{last}} - N \cdot \text{BPE})/N$.
  * MVR heat pump thermodynamics: COP derivation and open-loop vapor recompression.
  * Superheated compressor discharge: why vapor compression produces superheated steam ($T_2 \approx 113–117\ ^\circ\text{C}$) without condensation; desuperheating requirements.
  * Surplus compressor heat ($C8$): ~3% surplus heat balance.
  * Crystallization kinetics and phase equilibria: driving forces $S = c/c^*$ and $\sigma = (c-c^*)/c^*$; Binodal vs Metastable Zone vs Spinodal limit; nucleation vs growth; controlled seeding; "Why crystal size matters" qualitative card.
  * Purge & impurity balance: Mother liquor concentration factor $z_{\text{ML}} = z_F / p$ and adhering liquor carry-over $\varepsilon$.
  * Flat solubility curve: why cooling crystallization gives poor recovery and evaporative crystallization is required.
- Engineering glossary.

#### Tab 4: Simulator
- Presets:
  * "Hand-calc case" (reloads `DEFAULT_INPUTS`)
  * "High BPE" ($x_F = 0.09$, $T = 70\ ^\circ\text{C}$, $\text{purge} = 0.02$)
  * "Cheap electricity (Texas)" ($c_e = \$0.04/\text{kWh}$, $c_s = \$10/\text{t}$)
  * "Expensive electricity" ($c_e = \$0.18/\text{kWh}$, $c_s = \$7.33/\text{t}$)
- Controls:
  * Sliders with synchronized numerical inputs and units: $F$, $x_F$, $z_F$, $T_b$, purge ratio, adhering liquor $\varepsilon$, $\Delta T_{\text{heater}}$, $\eta_{\text{is}}$, $\eta_{\text{motor}}$, $T_s$, $T_{\text{last}}$, $\Delta T_{\text{min}}$, $N$, $c_e$, $c_s$, annual hours.
  * Toggle for BPE model: "Real (Osmotic $\phi_{\text{sat}}$)" vs "Ideal (activityFactor slider)".
- Feasibility Alerts:
  * Alert banner displayed when `mass.feasible === false` or `effects[N].feasible === false`.
  * Infeasible outputs displayed as `—` (em-dash), never `NaN`, `undefined`, or negative numbers.
- Process Flow Diagram (PFD) (`js/pfd.js`):
  * Static labeled vector SVG with live stream text values for Feed ($F, x_F$), Vapor ($V, T_v, P_1$), Compressor ($W_{\text{elec}}, r, T_c, P_2, T_2$), Condensate, Mother liquor purge ($P, z_{\text{ML}}$), and Product crystals ($C$, yield, impurity ppm).
- Result Cards:
  * Grouped into: Mass Balance & Product, Thermodynamics & BPE, MVR Compressor Performance, Multi-Effect Comparison, and Economics.
  * Expandable "?" disclosure on each card revealing the underlying KaTeX formula, units, and physical interpretation.

#### Tab 5: AI Workflow
- Sub-tab 1: Model Comparison (Claude Code build in `site/` vs Gemini CLI build in `site/gemini/`, critique decision table summary, comparison metrics).
- Sub-tab 2: Process Log (Summary of prompts, model versions, development iterations from `docs/process-log.md`).

#### Tab 6: Video & Transcript
- Video container with placeholder: "Presentation Video: In-class presentation recording will be embedded here by Dec 4, 2026." (YouTube embed format).
- Scrollable text box for verbatim presentation transcript.

#### Tab 7: References & Contributions
- Interactive bibliography generated dynamically from `DATA.sources` (citation, URL, access date, notes, verification status).
- Project Contributions Table (Course CHE 4061, Andrew; Claude Code; Gemini CLI).
- Course and textbook attribution (Prof. Carlos Co, Seader/Henley/Roper 4th ed.).

---

### 3.4 Live Plotly Charts (`site/gemini/js/charts.js`)

All Phase 1 plots (P1–P8, P11) implemented with pinned Plotly 2.35.2, responsive sizing, clean typography, and operating point markers:

1. **P1: Solubility & Metastable Zone**
   - $x$: Temperature ($0$ to $100\ ^\circ\text{C}$).
   - $y$: $\text{LiOH}$ Solubility ($g / 100\ g\ \text{H}_2\text{O}$).
   - Traces: Data points, interpolation curve, schematic metastable limit band, schematic spinodal limit band, current operating point marker.
2. **P2: BPE vs Molality**
   - $x$: Molality ($0$ to $8\ \text{mol/kg}$).
   - $y$: Boiling Point Elevation ($\text{K}$).
   - Traces: Ideal colligative curve ($i=2, \phi=1$), Real osmotic curve ($\phi_{\text{sat}}$), current operating point marker.
3. **P3: Lift Breakdown**
   - Stacked bar chart comparing the two components of compressor temperature lift:
     * Boiling Point Elevation ($\text{BPE}$)
     * Heat exchanger driving force ($\Delta T_{\text{heater}}$)
     * Total lift labeled.
4. **P4: Compressor Power & Pressure Ratio vs BPE**
   - $x$: BPE swept from $0$ to $15\ \text{K}$.
   - $y_1$ (Left): Specific electricity consumption ($\text{kWh/t}$ vapor).
   - $y_2$ (Right): Pressure ratio $r = P_2 / P_1$.
   - Current operating state marked on both traces.
5. **P5: Primary Energy & Operating Cost Comparison**
   - Grouped bar chart comparing:
     * Single-effect ($N=1$)
     * Triple-effect ($N=3$)
     * Quintuple-effect ($N=5$)
     * MVR
   - Dual metrics: Primary energy equivalent ($\text{MJ/t}$ evaporated) and Operating cost ($\$/\text{t}$ evaporated).
6. **P6: Economic Crossover Map**
   - $x$: Electricity price $c_e$ ($0$ to $0.25\ \$/\text{kWh}$).
   - $y$: Steam price $c_s$ ($0$ to $30\ \$/\text{t}$).
   - Traces: Crossover lines where MVR cost equals 1-, 3-, and 5-effect steam costs; shaded preference regions; Texas EIA benchmark marker; current input marker.
7. **P7: Purge Trade-Off (Yield vs Purity)**
   - $x$: Purge ratio $p = P/F$ ($0.005$ to $0.20$).
   - $y_1$ (Left): Lithium recovery yield ($\%$).
   - $y_2$ (Right): Product impurity ($\text{ppm}$ $\text{Na}$).
   - Traces showing the trade-off, with current operating point marked.
8. **P8: Mass Flow Distribution**
   - Stacked bar or horizontal flow distribution displaying the split of Feed $F$ ($100\%$) into Evaporated Water $V$, Hydrate Crystals $C$, and Purge Liquor $P$.
9. **P11: Multi-Effect Feasibility Map**
   - $x$: Number of effects $N$ ($1$ to $7$).
   - $y$: Available $\Delta T$ per effect ($\text{K}$).
   - Horizontal threshold line at $\Delta T_{\text{min}}$ ($5\ \text{K}$).
   - Points above line are feasible; points below line are infeasible; current $N$ highlighted.

---

## 4. Verification & Testing Strategy

1. **Unit Testing (`npm test`)**:
   - `tests/handcalc.test.mjs` runs against `site/gemini/js/model.js`.
   - Asserts exact API exports, `DEFAULT_INPUTS` match, and hand-calc case reproduces all `handcalc-expected.json` values within $\pm 0.5\%$.
   - Validates mass balance closure error $< 10^{-6}\ \text{kg/h}$ for 100 random feasible input sets.
   - Validates infeasible purge state, excessive effect counts, and limiting cases ($r \rightarrow 1, W \rightarrow 0$).
2. **Browser Smoke Testing (`tests/browser-smoke.mjs`)**:
   - Served locally via Python HTTP server: `python3 -m http.server 8000 -d site`.
   - Tested using Playwright at desktop ($1280 \times 800$) and mobile ($375 \times 812$):
     * $\ge 7$ accessible tabs discovered and navigable.
     * Zero KaTeX render errors (`.katex-error`).
     * Visible rendered KaTeX equations on the Theory tab.
     * Every Plotly chart container contains rendered `.main-svg`.
     * Zero instances of `NaN`, `undefined`, or `Infinity` in the text.
     * Every visible range slider triggers a live update to a chart or result card when adjusted.
     * Mobile check: `scrollWidth <= clientWidth + 1` across all tabs at $375\ \text{px}$.
     * Zero browser console errors.
3. **Manual Validation**:
   - Presets change all sliders to expected values.
   - "?" disclosure buttons reveal formulas and interpretations.
   - Dynamic bibliography on References tab matches `DATA.sources`.

---

## 5. Execution Steps (Post-Approval)

1. Copy `site/js/data.js` to `site/gemini/js/data.js` unchanged.
2. Implement pure mathematical model in `site/gemini/js/model.js` adhering strictly to API contract in §5.3–§5.4.
3. Run `npm test` and verify that all hand-calc and edge-case unit tests pass for the Gemini build.
4. Implement `site/gemini/css/style.css` (mobile-first, responsive, clean technical palette, zero horizontal overflow).
5. Implement `site/gemini/js/pfd.js` (SVG flow diagram with dynamic live labels).
6. Implement `site/gemini/js/charts.js` (Plotly P1–P8, P11 with responsive layout and operating markers).
7. Implement `site/gemini/js/ui.js` (tab routing, slider bindings, presets, KaTeX formatting, card disclosures).
8. Assemble `site/gemini/index.html` with all 7 tabs, placeholders, and structure.
9. Serve locally and execute `node tests/browser-smoke.mjs --base http://localhost:8000 --paths /gemini/`.
10. Review verification screenshots and fix any console warnings, layout shifts, or rendering issues.
11. Commit changes to the active branch with descriptive commit messages.

---

## Clarifying Questions

1. **Process Flow Diagram (PFD) Display**: Plan §3 specifies a "static labeled SVG with live stream values" for Phase 1. We plan to render this as an inline SVG directly in the Simulator tab right above the result cards, displaying live SVG text labels for stream flows ($F, V, C, P$), temperatures, pressures, and powers. Does this layout meet your design expectations?
2. **Preset Definitions**: We plan to implement four presets:
   - "Hand-calc case" (exact `DEFAULT_INPUTS`)
   - "High BPE" ($x_F = 0.09, T_b = 70\ ^\circ\text{C}, \text{purge} = 0.02$)
   - "Cheap electricity (Texas)" ($c_e = \$0.04/\text{kWh}, c_s = \$10/\text{t}$)
   - "Expensive electricity" ($c_e = \$0.18/\text{kWh}, c_s = \$7.33/\text{t}$)
   Are there any other specific preset configurations you would like included?
3. **Branch & Remote Push**: Requirement 15 asks to commit and push to the working branch. When implementation commences, should we push directly to the current working branch (`gemini/mvp` or active branch)?
