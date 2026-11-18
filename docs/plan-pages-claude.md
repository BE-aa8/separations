# Plan: AI Workflow, Video & Transcript and References cleanup (same style as the other tabs)

## Context
These are the last three tabs that haven't had the Overview / Industry / Theory treatment. Andrew: "just add similar details to the others; I think you get the gist now."

The same rules as before apply:
- the Overview-style intro (pill, big headline, lead, dark "at a glance" card);
- Industry-style eyebrow and section headings, rounded cards;
- long material folded into dropdowns;
- red flags and placeholders turned into quiet grey chips;
- nothing deleted, and every number taken from what is already on the site or in the docs (no invented data).

The Gemini build is untouched. The 7-tab routing and the smoke-test conventions stay (no new `role="tab"` or `data-tab` controls).

## 1. AI Workflow tab
**Intro.** Pill "AI Workflow", headline "One plan, two builders, one critic", and a short lead (the existing workflow sentence). The "At a glance" card uses figures that are already in the results table:

| Figure | Claude | Gemini |
|---|---|---|
| Models | plan v1, plan v2, builder (with Andrew's decisions) | critic, second builder |
| Hand-calc tests on the first run | 9/9 | 9/9 |
| Build time | 13 min 9 s | 12 min 23 s |
| Cost | $3.70 | ≈ $2.85 |
| Code size | ~1,360 lines | ~3,720 lines |

**Subtabs.** "Model Comparison" and "Process Log" become a segmented pill switch. They keep their `.subtab` / `.subpanel` hooks and `initSubtabs()`.

**Comparison panel:**
- **Workflow:** the 4 steps become a numbered horizontal timeline, like the Industry steps.
- **What I found:** the 5 findings become cards (bold first line visible, rest below).
- **Side-by-side screenshots:** kept visible.
- **Full results table:** the 12 metrics go in a dropdown, closed.
- **Gemini's critique and my decisions:** the 10 rows go in a dropdown, closed. The caveats line and the links stay.

**Process Log panel.** The placeholder is replaced with a **timeline of the real milestones**, taken from `docs/process-log.md` headings and text. Each milestone has a date, the model(s) used and one line on what happened or what Andrew decided:
1. topic chosen (Claude);
2. plan v1 (Claude);
3. Gemini critique and Andrew's decisions;
4. plan v2 and Phase 0 data and tests;
5. both Phase 1 builds;
6. Phase 2;
7. the comparison write-up;
8. the UX plan from ChatGPT, a third model;
9. the redesign and the CRYSTALLIZE hero;
10. the Liquid Glass simulator;
11. Overview, Industry and Theory cleanups;
12. live-site checks that caught real bugs (the Netlify badge; the Reduce Motion diagnosis).

The link to the full log stays.

## 2. Video & Transcript tab
**Intro.** Pill "Video & transcript", headline "The presentation", one-line lead.
- **Video card:** a 16:9 dark card with a play icon and "Video coming by Dec 4", replacing the red placeholder. It is built so the YouTube ID is a one-line change: set `data-video-id` and it renders the youtube-nocookie player, reusing the Industry tab's approach.
- **Transcript:** a dropdown "Transcript (verbatim YouTube auto-transcript)" with a grey "to be added after upload" chip.
- **What I learned / what I want to learn next:** a clean card with a grey "to be written" chip. The text is unchanged and stays clearly Andrew's to write.

## 3. References tab
**Intro.** Pill "References", headline "Every number has a source", lead. The "At a glance" figures are counted live from `DATA`: number of sources, values tracked, and how many are marked estimates.
- **Sources:** a clean numbered list of cards (citation, link, accessed date), rendered by the existing `renderReferences()` so the `[n]` citation numbers stay the same.
- **Every value used:** the table goes in a dropdown, closed, with a count. Its red `ESTIMATE` flags become grey "estimate" chips.
- **Contributions:** 4–5 cards instead of the table:
  - **Andrew:** "Project lead" (the "(student)" label is dropped, matching the no-class-references change);
  - **Claude:** plan v1 and v2, Phase 0 data and test harness, this build;
  - **Gemini:** critique of plan v1; independent Phase 1 build;
  - **ChatGPT:** the UX redesign plan (documented in the process log, currently missing from this table);
  - **Tools:** Plotly 2.35.2, KaTeX 0.16.11, Netlify.

  The red PLACEHOLDER flags become grey "details to be added" chips.

## Files
- `site/index.html`: the three sections.
- `site/js/ui.js`, presentation only:
  - `renderReferences()` uses grey chips and fills the References at-a-glance counts;
  - a small `initVideo()` for the `data-video-id` hook;
  - `initSubtabs()` is unchanged.
- `site/css/style.css`: subtab pill switch, timelines, finding cards, contribution cards, source list, video card. Reuses the `.ov-*`, `.ind-*` and `.th-*` styles.
- `tests/browser-pages.mjs`: new, added to CI for light and dark. It checks:
  - the three intros render; no red `.flag` or `.placeholder` remains in these tabs;
  - nothing is lost: results table 12 rows, critique table 10 rows, 5 findings, 4 workflow steps, both comparison images, sources count = `DATA.sources`, values table row count unchanged, contributions include all of the original roles;
  - subtabs switch; the dropdowns open and close; the timeline shows its milestones;
  - the References counts equal `DATA`;
  - phone: no horizontal scroll or zoom-out, header on one row; no console errors.
- `docs/plan-pages-claude.md`, `docs/process-log.md`.

## Verification
- Run `npm test` and the full browser suite (smoke, Phase 2, hero, UX, glass, Industry, Theory) plus the new pages test, in light and dark.
- Review screenshots of the three tabs at 1440, 1280×720 and 375 in both themes.
- Push, wait for green CI, send the zip. I ship after Andrew deploys and approves, then test the live site.
