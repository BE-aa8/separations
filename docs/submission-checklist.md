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
| 4g | What I learned / want to learn next | Needs Andrew | Video tab. Andrew's paragraph talks about process control and recycle (see note below) |
| 4h | Attribution / references | Complete | References tab: 16 sources, 39 values, 21 labelled estimates |
| 5a | Plan from one model, critique by another | Complete | `docs/plan-v1-claude.md`, `docs/critique-v1-gemini.md` |
| 5b | Justify accept/reject | Complete | `docs/critique-decisions.md`; AI Workflow tab table |
| 5c | Implemented with at least 2 models and compared | Complete | `site/` (Claude) and `site/gemini/` (Gemini); `docs/comparison.md` |
| 6 | Attribution and member contributions | Complete | References tab, Contributions (individual project) |
| Rubric | PowerPoint artifact | Complete | `site/slides/mvr-presentation.pptx` and `.pdf`, slide viewer on the Video tab |
| Syllabus | Chat history/prompts | Complete, see note | Prompts and decisions are in `docs/process-log.md`; full chat exports are not in the repo |

## Needs Andrew

1. **"What I learned" paragraph (Video tab).** It says "Something I learned about process control … how recycle affects processes." This project is about separations and MVR, so the paragraph may belong to another course's site. Confirm it, or replace it.
2. **Course name in your conclusions (AI Workflow tab).** "similar to what I did in Process Dynamics and Controls" names a course. You asked for no class names on the site. This is your own wording, so it was left as is.
3. **Slides.** The deck shows your full name and "Separation Processes · An AI project · Fall 2026", and the downloadable `.pptx` includes speaker notes. The site and repo are public.
4. **Chat history.** The syllabus says chat history and prompts are required. The process log records the prompts and decisions. If full chat exports are expected, they would have to come from your accounts (claude.ai, Gemini, ChatGPT).
5. **Submission.** Submit the site link (and the video link, if asked) wherever the course collects them.
6. **Q&A prep.** A few things said in the video differ from the site's numbers (list in the final audit report). Know the correct values for the live Q&A.

## Not verifiable from the build environment

- Four cited pages (Wikipedia Antoine table, IUPAC atomic weights, Mining.com.au, Spectrum News) are blocked by this environment's network. They were read when first cited (see the accessed dates). Click through them once before the presentation.
- Real-device testing (iPhone/iPad/Android) was not repeated in this audit; the phone and tablet layouts were checked in emulated Chromium.
