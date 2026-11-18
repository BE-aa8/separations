# Playbook: how the last project was built (and what to repeat)

## The workflow that worked

1. **Context first.** Assignment, rubric and the professor's guidance go into `context/` before any
   planning. `CLAUDE.md` holds the rules every session must follow.
2. **Plan mode, always.** Every new piece of work starts in plan mode. Claude explores, asks
   questions, writes a plan; you approve or change it. Plans are saved in `docs/` with the model name
   (`docs/plan-v1-claude.md`).
3. **Two models.** One model plans, a different model critiques; you accept or reject each point with a
   reason (`docs/critique-decisions.md`). Optionally both models build from the same prompt and you
   compare them (great rubric material).
4. **Data before code (Phase 0).** Every property value and price is looked up and cited in one data
   file (`site/js/data.js`) with its source; estimates are labeled as estimates. Hand-calc tests are
   written *before* the build, from the plan's worked example.
5. **Build in small phases**, each ending with: tests pass → commit → push → GitHub CI green →
   zip → you deploy → tests run against the live site.
6. **Log every session** in `docs/process-log.md`: your prompt (verbatim), what was built,
   decisions and why, problems. The site's AI Workflow tab is built from this log.

## Deploy loop (Netlify drag-and-drop)

- Claude builds `dist/site.zip` from `site/` and checks it file-by-file against `site/`.
- You drag it onto Netlify, then say "deployed, run the tests on the live site".
- Claude compares every live file with the repo, then runs the full browser suite against the live URL.
- Only then is `main` updated (fast-forward from the working branch).

## Design pattern that made pages calm (used on every tab)

- **Intro:** pill label, big headline, short lead, one primary button, plus a dark
  "at a glance" card with 3-5 key numbers computed live (never typed in).
- **Sections:** small mono eyebrow + headline, then rounded cards.
- **Dropdowns (`<details>`)** hold long text; the one-line takeaway and the key equation stay visible.
- **Quiet grey chips** ("estimate", "to be added") instead of red warning boxes.
- **Light/dark toggle and a motion toggle** in the header.
- Every calculation shows: equation, units, one-line "how does that make sense?" interpretation,
  and a chart ("No Plot = No Pay").

## Lessons that cost real time last project

| Problem | What to do |
|---|---|
| Hash routing (`#theory`): an in-page `href="#section"` link switches tabs | Use buttons with `scrollIntoView()` for in-page jumps |
| Charts drawn while their tab is hidden come out 700 px wide and make phones zoom out | Draw (or `Plotly.Plots.resize`) only when the chart is visible |
| "No animation on iPhone" | It was the phone's **Reduce Motion** setting. Honor it by default, but give a header motion toggle |
| Netlify's free-tier badge covers the bottom-right corner on phones | Keep floating buttons bottom-left; pad bottom sheets |
| A phone test passes but the page zooms out | Also check `innerWidth` on a 375 px phone, not just `scrollWidth` |
| Muted background video won't autoplay on iOS | Never hide the player with `opacity: 0`; cover it with a poster that fades out once it plays |
| Some sites (tesla.com) block automated downloads | Ask the user for a screenshot/link, or cite reputable coverage and say so |
| Guessing at a device bug twice | Build a tiny diagnostics page, have the user open it on the device, fix exactly what it shows |
| Tests that depend on YouTube or other third parties | Stub them in tests (`page.route`) |
| Inline SVG `<text>` and KaTeX in Python-built strings | Watch for `\t`, `\n` escapes turning into tabs/newlines |

## Prompts that worked

- "Read CLAUDE.md, PLAYBOOK.md and context/. Plan in plan mode and ask me your clarifying questions."
- "Approve all, but keep X" (answering critique decisions explicitly).
- "Start Phase N now, let me know what you need."
- "Send me the zip when CI passes."
- "Deployed, ship it and run the tests on the live site."
- "This tab has too much going on; clean it up like the Overview" (reuse an approved pattern).
