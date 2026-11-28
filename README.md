# MVR Crystallizer Explorer

An interactive website on **mechanical vapor recompression (MVR) evaporative crystallization** of battery-grade lithium hydroxide monohydrate (LiOH·H2O), with Tesla's Robstown, TX refinery as the industry example. AI project for Separation Processes (CHE 4061, Fall 2026, University of Cincinnati).

- **Live site:** https://be-aa8.github.io/separations/
- **Presentation video:** https://www.youtube.com/watch?v=BLQXmZmRMlQ (embedded, with its verbatim transcript, on the site's Video & Transcript tab)
- **Slides:** `site/slides/mvr-presentation.pdf` and `.pptx`, also viewable on the site

## What is in the site (7 tabs)

| Tab | Content |
|---|---|
| Overview | The question the project answers, and the animated process loop |
| Industry Context | Tesla's refinery, the product-rate arithmetic, vendors, operating problems |
| Theory | Seven ideas behind the design, then every equation with units and a "how does that make sense?" line |
| Simulator | Sliders, live process diagram, key results, 12 charts (P1–P11): BPE, compressor work, 1/3/5 effects vs MVR, cost crossover, purge trade-off, capital cost and optimum ΔT, turndown |
| AI Workflow | Plan → critique → decisions → two builds compared; timeline of the whole process |
| Video & Transcript | YouTube embed, slide viewer, verbatim auto-transcript, what I learned |
| References | Every source, every value used (generated from `site/js/data.js`), contributions |

## AI workflow (assignment requirement 5)

1. Claude wrote plan v1 (`docs/plan-v1-claude.md`).
2. Gemini critiqued it (`docs/critique-v1-gemini.md`); every point accepted, modified or rejected with a reason (`docs/critique-decisions.md`).
3. Claude merged plan v2 (`docs/plan-v2-final.md`); the hand-calc tests were written before either build (`docs/handcalc.md`, `tests/`).
4. Both Claude Code and Gemini built Phase 1 from the same prompt: Claude's build is `site/`, Gemini's is `site/gemini/` (live at `/gemini/`).
5. Comparison: `docs/comparison.md`. ChatGPT later planned the UI/UX redesign (`docs/ux-brief-for-chatgpt.md`).

Every prompt, decision, iteration and problem: **`docs/process-log.md`**. My prompts to Claude Code, verbatim: `docs/chat-history-claude-code.md`.

## Run and test locally

```bash
python3 -m http.server 8000 -d site
```

```bash
npm test
```

`npm test` checks the model against the independent hand calculation (`tests/handcalc-expected.json`, from `tests/reference/handcalc_reference.py`). The browser suites (`tests/browser-*.mjs`, Playwright + Chromium) run in CI in light and dark mode; see `.github/workflows/ci.yml`. GitHub Pages deploys `site/` only after CI passes on `main` (`.github/workflows/pages.yml`).

## Folder map

| Path | What's in it |
|---|---|
| `site/` | The website (plain HTML/CSS/JS, Plotly, KaTeX); `site/gemini/` is the Gemini build |
| `site/js/model.js` | All calculations; `site/js/data.js` holds every property value and price with its source |
| `docs/` | Plans, critique, decisions, comparison, hand calculation, process log, video script, raw transcript |
| `tests/` | Hand-calc and browser tests |
| `tools/build_data.py` | Rebuilds `data.js` from its sources |
| `context/` | Assignment (verbatim), syllabus notes, lecture guidance |
| `starter-kit/` | Reusable template for a future project |
