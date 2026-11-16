# Plan: Overview intro redesign + remove course/university references

## Context
Andrew feels the content under the CRYSTALLIZE hero gets overlooked, and the "What the simulator shows" list is redundant. He wants a clean, minimalist, eye-catching intro modeled on his mockup:
- a pill eyebrow;
- the big headline "Why crystallize lithium hydroxide with a compressor?";
- a short lead and a lime "Explore the Simulator →" button;
- a process diagram on a dark glass card at the right.

The CRYSTALLIZE dot hero moves underneath that intro. He also wants the site to read as a standalone project, so every mention of the University of Cincinnati, CHE 4061 and Prof. Co comes off the site.

Answers to the planning questions:
- **Gemini build:** strip the names only, and record that edit in the comparison write-up.
- **"What I learned":** move it to the Video & Transcript tab.
- **Header:** change to a single row.
- **AI Workflow table:** reword the Prof. Co row neutrally.

## Changes

### 1. Header (single row, as in the mockup) — `site/index.html`, `site/css/style.css`
- Move `<nav class="tabs">` inside the header `.wrap`.
- Layout: lime drop-shaped logo mark (inline SVG), then the title (a link to `#overview`), then the tabs, then the theme toggle.
- The subtitle line is deleted; it contained the course name.
- Below 1100 px the row wraps and the tabs keep scrolling sideways on a second row, as they do now.
- Update `--header-h` for both layouts, so the sticky Simulator toolbar and the scroll offsets still line up.
- The `data-tab` hooks, the `#theme-toggle` ID and the hash routing stay unchanged.

### 2. New Overview intro (top of `#tab-overview`)
A two-column section: copy on the left, diagram card on the right. On phones it stacks as one column.

Left column:
- **Pill eyebrow:** "Battery materials · Evaporative crystallization". It contains no class name.
- **H2 headline:** large and tight, about 56–64 px on desktop with a `clamp()` for phones.
- **Lead:** a shortened, accurate version of the current lead. It says that boiling off water is the expensive step, and that MVR compresses the vapor so it condenses hotter than the liquor and re-uses its own latent heat. It avoids the mockup's "improves purity" claim; purity comes from the purge, not from MVR.
- **Lime pill CTA:** "Explore the Simulator →", a link to `#simulator` (a real tab route, so `href` is correct here). Optional secondary text link: "How it works", pointing to `#theory`.

Right column, the diagram card:
- A dark glass card holding a new inline-SVG schematic in the same visual language as the mockup: rounded label chips and smooth lines.
- The flows are drawn correctly:
  - **Feed brine** goes into the **Crystallizer**.
  - **Vapor (low pressure)** leaves the top and goes to the **Compressor**.
  - **Compressed vapor (hot)** goes to the **Heater**, which warms the circulating liquor.
  - **Condensate** leaves the heater.
  - **LiOH·H₂O crystals** leave at the bottom.
  - The mockup labels the compressor's inlet as "compressed" vapor; that is backwards, so I won't copy it.
- Stream colors reuse the existing PFD palette (`site/js/pfd.js`).
- Animated dashed flows use the existing `.flow` CSS approach, and they stop under `prefers-reduced-motion`.
- The crystallizer gets a liquid level with a few settling crystal dots.
- The card is static, so there's no model call and no invented numbers.
- It looks the same in light and dark: the card stays dark, as in the mockup, with a light-theme variant only for the surroundings.

### 3. Dot hero moves below the intro
- The `#hero` block (canvas plus hint) moves underneath the intro, full width, as before.
- Its `.hero-copy` overlay (eyebrow with UC, tag line, CTA) is removed, because the intro now carries that copy. `hero.js` already copes with a missing copy element (`copyBottom()` returns 0), so the word mask uses the full height.
- The height drops a little, to about `clamp(360px, 50vh, 480px)`, so it reads as a visual band. The hint "Move to stir" stays.
- `#hero` and `#hero-canvas` keep their IDs, so `tests/browser-hero.mjs` still applies.

### 4. Below the hero (kept minimal)
- **Three clean link cards:** Significance → Industry, Theory → Theory, Simulator → Simulator. Same text as now, restyled as minimalist rounded cards with an arrow, a hover lift and a lime accent.
- **AI-project note:** a slim single-line strip. It is required by the rubric ("clearly an AI project") and keeps its link to AI Workflow.
- **Deleted:** the "Why crystallize…" H2 and lead (now in the intro), the "What the simulator shows" list, and the "What I learned" block (moved, see 5).

### 5. "What I learned / what I want to learn next" → Video & Transcript tab
Added after the transcript placeholder as an `h3` plus the existing placeholder text, unchanged.

### 6. Remove course and university references from the visible site
| Where | Change |
|---|---|
| `site/index.html` meta description | Drop "CHE 4061 Separation Processes"; keep "AI project". |
| Footer | Becomes "MVR Crystallizer Explorer · AI project · Data: see References". |
| AI Workflow table row 7a–c | The justification becomes "Operating scenarios (turndown) are a standard design question". |
| `site/gemini/index.html` | Remove only the UC / CHE 4061 / Prof. Co strings (3 places, at lines ~26, ~176 and ~1223). The wording around them stays minimal and nothing else changes. |
| `docs/comparison.md` | Add a note that these strings were removed from the Gemini build on 2026-11-16 at the author's request, and that no code or physics changed. |

The textbook citation (Seader, Henley & Roper) stays in Theory and References: it's a reference, not a class name.

## Files
- `site/index.html`: header, Overview, Video tab, footer, meta, AI Workflow row.
- `site/css/style.css`: header single row, intro, diagram card, link cards, AI note, hero height.
- `site/gemini/index.html`: three text strings only.
- `docs/comparison.md`, `docs/process-log.md`; plan saved as `docs/plan-overview-intro-claude.md`.
- `tests/browser-ux.mjs` or a small new check in `tests/browser-hero.mjs`:
  - the intro, diagram and CTA exist;
  - the diagram flows stop under reduced motion;
  - no element in `site/` or `/gemini/` contains "Cincinnati", "4061" or "Prof. Co";
  - no horizontal scroll at 375 px.

Not touched: `model.js`, `data.js`, `content.js`, the Simulator, and `hero.js` logic.

## Verification
- Run `npm test`.
- Run smoke (light and dark) on `/` and `/gemini/`, Phase 2 (light and dark), hero, UX, and glass (light and dark).
- Grep `site/` for "Cincinnati", "4061", "Carlos" and "Prof. Co".
- Review screenshots at 1440×900, 1280×720, 820×1180 and 375×812, in both themes:
  - the header fits on one row on desktop;
  - the intro matches the mockup's feel;
  - the diagram is legible;
  - the CTA routes to the Simulator;
  - the Simulator's sticky offsets still line up under the new header height.
- Then push, wait for green CI, ship to main and send the zip, as before.
