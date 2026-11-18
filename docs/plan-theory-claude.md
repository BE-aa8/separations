# Plan: Theory tab cleanup (same style as Overview and Industry)

## Context
The Theory tab has the same problem the old Overview had: everything is open at once. On one long page it shows a lead, 7 concept sections of dense paragraphs, 33 equation cards in 5 groups (all expanded), a callout, a simplifications list and a 10-term glossary. Andrew wants it calmer, with text tucked into dropdowns, built "in a very similar way" to the Overview and Industry tabs he liked.

**Rules for this change:**
- Nothing is deleted. Every sentence, equation, unit and interpretation stays in the page, just folded.
- `content.js` (equations, units, interpretations) and the physics are unchanged.
- The live numbers (`data-live`) and citations stay.

## New layout of `#tab-theory`

### 1. Intro (Overview-style two columns)
**Left column:**
- Pill: "Theory".
- Big headline: "How a compressor replaces steam".
- A short lead that keeps the level sentence (Seader, Henley & Roper Ch. 17) and the note that every equation has units and a "how does that make sense?" line.
- Lime CTA "Try it in the Simulator →" plus a text link "Jump to the equations".

**Right column:** an "At a glance" stat card with live numbers only, computed by the existing `renderTheory()` / `simulate()`:
- the osmotic coefficient φ at 60 °C;
- BPE real vs ideal;
- the compressor lift and COP for the hand-calc case;
- LiOH solubility at 20 °C vs 100 °C.

### 2. "The ideas": 7 concept cards (Industry-style eyebrow and headings, 2-column grid)
Each card shows a number, a title, **one bold takeaway sentence**, its **key equation rendered with KaTeX** (pulled from `EQ` in `content.js`, so it is never retyped) and its units. Below that, a **"Read more" dropdown** (`<details>`) holds the full current paragraphs, unchanged.

| # | Concept | Key equation |
|---|---|---|
| 1 | Evaporation is a single-stage VLE separation | B2 |
| 2 | Ideal vs real electrolyte BPE | B1 |
| 3 | Steam economy and multiple effects | E3 |
| 4 | MVR as a heat pump; superheat, not wet vapor | C2 |
| 5 | Solubility, supersaturation, metastable zone (with seeding, nucleation vs growth and the "Why crystal size matters" callout inside its dropdown) | B4 |
| 6 | Impurity purge | M4 |
| 7 | Why not cooling crystallization? | M9 |

The takeaways are new one-liners, written from the existing text with no new claims. Some use the live numbers, for example "Real LiOH liquor boils 3.95 K above water, not the ideal 4.76 K".

### 3. "Every equation": the 33-card reference as accordions
- The 5 groups (Mass balances, Phase equilibrium and BPE, Energy, MVR compressor, Economics) each become a rounded `<details>` card.
- The summary row shows the group title, a count and the ID chips (M1 … M9). The cards inside are unchanged.
- Groups are closed by default, with an "Expand all / Collapse all" button.
- "Jump to the equations" and the IDs mentioned in the text, such as "(E3)", stay plain text. I won't add new hash links, because they would switch tabs.

### 4. "Fine print": two closed dropdowns
- **Simplifications we made:** the current list.
- **Glossary:** the 10 terms, laid out as a clean 2-column definition grid when opened.

### Flags
The red `SCHEMATIC` and `ESTIMATE` flags in the Theory text become the grey chips used on the Industry tab (`.est-chip`). The qualifier stays, only quieter. The References tab keeps its flags.

## Files
- `site/index.html`: rewrite the `#tab-theory` markup. The paragraph text moves into the dropdowns verbatim.
- `site/js/ui.js`, presentation only:
  - `renderTheory()` builds the accordion groups (same `eq-card` markup);
  - it renders each concept card's key equation from `EQ[id]`;
  - it fills the "At a glance" numbers from the hand-calc `simulate()` output;
  - it wires the Expand/Collapse-all button and the "Jump to the equations" button (`scrollIntoView`).
- `site/css/style.css`: intro, stat card, concept cards, accordions and fine print, reusing the `.ov-*` / `.ind-*` tokens; mobile 1-column; respects the motion setting.
- `tests/browser-theory.mjs`: new, added to CI for light and dark.
  - **Clean view:** 7 concept cards, each with a visible key equation (KaTeX); dropdowns closed; visible word count well below today's.
  - **Nothing lost:** all 33 equation cards and every original paragraph (checked against a list of their opening words) are still in the DOM.
  - **Live numbers:** no "—", NaN or undefined, and the "At a glance" values equal `simulate()`.
  - **Dropdowns:** Read more opens and closes; Expand all opens all 5 groups and shows 33 rendered equations; Collapse all closes them; Jump scrolls without changing the tab.
  - **General:** no red `.flag` in the Theory tab; no horizontal scroll and no zoomed-out layout at 375 px; no console errors.
- `docs/plan-theory-claude.md`, `docs/process-log.md`.

The existing smoke test (it needs visible KaTeX on Theory) stays satisfied by the 7 visible key equations.

## Verification
- Run `npm test` and the full browser suite (smoke, Phase 2, hero, UX, glass, Industry) plus the new Theory test, in light and dark.
- Review screenshots at 1440, 1280×720, 820 and 375 in both themes.
- Then push, wait for green CI, and send the zip. I ship to main after Andrew deploys and approves, as before.
