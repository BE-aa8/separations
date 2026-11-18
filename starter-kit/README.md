# Starter kit: AI-built interactive course website

Everything that worked on the MVR Crystallizer Explorer project, ready to start a new one:
a workflow, a project rules file for Claude Code, a working 7-tab site skeleton (light/dark,
motion toggle, Overview-style intro, dropdowns, a live slider + chart + equation demo), and the
tests and CI that kept it honest.

## How to start the new project

1. **Create a new GitHub repo** (one repo per class project) and copy the *contents* of this folder
   into its root (including the hidden `.github/` folder).
2. **Fill in `CLAUDE.md`** from `CLAUDE.template.md` (rename it). Five minutes: topic, class level,
   stack, deadlines, data rules.
3. **Put the assignment and rubric in `context/`**, verbatim (see `context/README.md`).
4. **Open the repo in a new Claude Code session** and send one message:
   > Read CLAUDE.md, PLAYBOOK.md and everything in context/. Then plan the project in plan mode
   > and ask me your clarifying questions.
5. Approve the plan, then build in phases. After each phase: tests, CI green, zip, deploy, live check.

## What's in here

| Path | What it is |
|---|---|
| `PLAYBOOK.md` | The workflow and every hard-won lesson from the last project. Read this first. |
| `CLAUDE.template.md` | Project rules for Claude Code. Rename to `CLAUDE.md` and fill in. |
| `context/README.md` | What to put in `context/` (assignment, rubric, notes). |
| `docs/process-log.md` | Session log template (the rubric rewards showing your process). |
| `site/` | Working skeleton: `index.html`, `css/base.css`, `js/app.js`, `js/data.js`. Open `site/index.html` through a local server. |
| `tests/browser-smoke.mjs` | Generic browser test: every tab renders, equations and charts render, every slider changes something, no NaN, no console errors, phone width fits. |
| `tests/browser-basics.mjs` | Theme toggle, motion toggle, dropdowns, phone layout (no zoom-out), header on one row. |
| `tests/example.test.mjs` | Pattern for hand-calc tests of the model (`npm test`). |
| `.github/workflows/ci.yml` | Runs all of the above on every push, in light and dark. |

## Run it locally

```bash
python3 -m http.server 8000 -d site
```

```bash
npm test
```

```bash
node tests/browser-smoke.mjs --base http://localhost:8000 --paths / --out /tmp/smoke
```

```bash
node tests/browser-basics.mjs --base http://localhost:8000 --out /tmp/basics
```

Playwright must be installed (`npm install --no-save playwright` plus `npx playwright install chromium`
on your own machine; Claude Code's cloud containers already have it).
