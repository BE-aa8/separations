# Submission checklist (final audit, 2026-11-28)

Each requirement from `context/assignment.md`, checked against the live site at https://be-aa8.github.io/separations/.

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | Publicly accessible website | Complete | GitHub Pages, deployed from `main` after CI passes |
| 2 | YouTube video of the presentation, linked on the site | Complete | Video & Transcript tab: embedded player plus a "Watch on YouTube" link |
| 3 | Verbatim YouTube auto-transcript, viewable on the site | Complete | Video & Transcript tab, 209 timed lines (0:01–27:31); raw paste in `docs/transcript-raw.txt` |
| 4a | Overview | Complete | Overview tab |
| 4b | Demo of what was created | Complete | Simulator tab; live demo in the video (about 14:00–23:30) |
| 4c | Clearly an AI project exploring AI capabilities | Complete | Overview banner; AI Workflow tab |
| 4d | Process: models, services, prompts | Complete | AI Workflow tab; `docs/process-log.md` (prompts); `docs/PLAN_PROMPT.md`, `docs/build-prompt.md` |
| 4e | Planning and iteration with my guidance and reasoning | Complete | `docs/critique-decisions.md`; AI Workflow timeline; process log |
| 4f | Course-related technical details | Complete | Theory tab (VLE/BPE, evaporation, crystallization, supersaturation, seeding, crystal size, compression) |
| 4g | What I learned / want to learn next | Complete | Video tab |
| 4h | Attribution / references | Complete | References tab: 16 sources, 39 values, 21 labelled estimates |
| 5a | Plan from one model, critique by another | Complete | `docs/plan-v1-claude.md`, `docs/critique-v1-gemini.md` |
| 5b | Justify accept/reject | Complete | `docs/critique-decisions.md`; AI Workflow tab table |
| 5c | Implemented with at least 2 models and compared | Complete | `site/` (Claude) and `site/gemini/` (Gemini); `docs/comparison.md` |
| 6 | Attribution and member contributions | Complete | References tab, Contributions (individual project) |
| Rubric | PowerPoint artifact | Complete | `site/slides/mvr-presentation.pptx` and `.pdf`, slide viewer on the Video tab |
| Syllabus | Chat history/prompts | Complete | `docs/chat-history-claude-code.md` (every prompt to Claude Code, verbatim); `docs/process-log.md`; Gemini's critique verbatim in `docs/critique-v1-gemini.md` |

## Resolved with Andrew (2026-11-28)

- "What I learned" paragraph: the process-control sentence replaced with Andrew's separations sentence.
- Course name in Andrew's conclusions: kept, his choice.
- Slides: speaker notes stripped from the public `.pptx` (slide content unchanged). The name and course line on the slides stay.
- Chat history: exported as `docs/chat-history-claude-code.md`.
- `netlify.toml` and the local `dist/` folder (Netlify leftovers) deleted.

## Still for Andrew

1. Submit the site link (and the video link, if asked) wherever the course collects them.
2. Q&A prep: a few numbers said in the video differ from the site (MVR is $2.09/t, not "$29 per ton"; $2.09 → $1.16 at 4 ¢/kWh; the compressor, not the condenser, raises 16.5 → 26 kPa; ChatGPT planned the redesign, Claude built it).
3. Click the four citation links listed below once, and look at the site on a phone.

## Not verifiable from the build environment

- Four cited pages (Wikipedia Antoine table, IUPAC atomic weights, Mining.com.au, Spectrum News) are blocked by this environment's network. They were read when first cited (see the accessed dates). Click through them once before the presentation.
- Real-device testing (iPhone/iPad/Android) was not repeated in this audit; the phone and tablet layouts were checked in emulated Chromium.
