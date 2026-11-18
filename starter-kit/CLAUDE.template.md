# Project: <SITE NAME>

<One paragraph: course (optional), topic, audience, what the site lets people do.>

## Read these before planning or building
- `PLAYBOOK.md`: workflow and lessons from the previous project
- `context/assignment.md`: the assignment and rubric, verbatim
- `context/notes.md`: what the professor emphasized (paraphrased, with dates)
- `docs/process-log.md`: what has been done so far; append to it after every work session

## Requirements (summary; verbatim text in context/assignment.md)
1. <requirement>
2. <requirement>

Deadlines: <presentation date>, <video upload date>.

## Rules for this repo
- Math at a <level, e.g. 3rd-year ChemE undergrad> level. Do not go beyond it.
- Every calculation shows: equation, units, and a one-line physical interpretation.
- Every calculation has a visualization; the tool invites "what if?" exploration with sliders.
- No invented data. Cite every property value and price in `site/js/data.js` and on the References tab; label estimates.
- Stack: plain HTML/CSS/JavaScript, Plotly for charts, KaTeX for equations. Static, no backend. Mobile-friendly.
- Always start new work in plan mode. Save plans in `docs/` with the model name in the filename.
- Append prompts, decisions, iterations and problems to `docs/process-log.md` at the end of every session.
- Verification: unit-check equations; the simulator must reproduce the hand-calc case; run the browser tests; check the live site after every deploy.
- <Optional> Do not mention the class, university or professor on the site.
- This repo is public. Do not commit textbooks, full lecture transcripts, or anything personal.
