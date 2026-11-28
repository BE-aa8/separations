# Chat history: my prompts to Claude Code (verbatim)

Every message I typed into the Claude Code session that planned and built this site (Nov 9 – Nov 28, 2026), plus my answers to Claude's multiple-choice questions, in order. Exported from the session log. Claude's replies are not included; what they produced is in the repo, and each step is summarized in `docs/process-log.md`.

Notes:
- Times are UTC.
- Two very long pastes are replaced by a pointer to the file where they are already saved verbatim: Gemini's critique (`docs/critique-v1-gemini.md`) and the YouTube transcript (`docs/transcript-raw.txt`).
- "[image attached]" marks a screenshot or photo I attached.
- Automated background-task notifications in the session log are left out; they were not typed by me.
- Other models' chats (the Oct 23 claude.ai planning chat, the Gemini critique chat, the ChatGPT UX chat) are not in this log. What they produced is in `docs/HANDOFF.md`, `docs/critique-v1-gemini.md` and the ChatGPT plan I pasted on Nov 15 (below).

## 1. 2026-11-09 16:53 UTC

```text
Read docs/PLAN_PROMPT.md and follow it exactly. My presentation date is Dec 7, so scope the phases to fit.
```

## 2. 2026-11-09 16:54 UTC · answer to Claude's questions

"Is this an individual project (50 pts, recorded in-class talk + detailed Q&A) or a group project (20 pts, up to 4 people)?"="Individual", "Which second AI model will critique the plan and do the second build?"="Gemini", "Should the second build use a different platform too (e.g., molab/Marimo in Python), so you compare platforms as well as models?"="No, same HTML/JS stack", "How should your time be split between visual polish and physics depth?"="Physics first (Recommended)".

## 3. 2026-11-13 00:12 UTC

```text
can you put ss13 in the chat, I can't find it
```

## 4. 2026-11-13 00:19 UTC

```text
can you send the plan as a code file that I can copy and paste into gemini, actually, do this with all of the files that I need to copy into Gemini
```

## 5. 2026-11-13 00:21 UTC

```text
can you send the plan as a code file that I can copy and paste into gemini, actually, do this with all of the files that I need to copy into Gemini
```

## 6. 2026-11-13 00:23 UTC

```text
You have the capability to make them all one, do it
```

## 7. 2026-11-13 00:27 UTC

```text
[Pasted: Gemini's full critique of plan v1, saved verbatim in docs/critique-v1-gemini.md]
```

## 8. 2026-11-13 00:36 UTC

```text
approve all, keep 7b
```

## 9. 2026-11-13 00:45 UTC

```text
Yes start Phase 0 now, let me know what all you need.
```

## 10. 2026-11-13 01:01 UTC

```text
keep $7.33 fuel-only steam, start Phase 1
```

## 11. 2026-11-13 01:09 UTC

```text
Can you sent up everything and run the code through Github? I will give you perms if needed.
```

## 12. 2026-11-13 21:07 UTC · answer to Claude's questions

"GitHub only lets you start a manually-run workflow (the Gemini build) once the workflow file is on the default branch, main. Netlify will also deploy production from main. Main currently has only the initial handoff commit. How should the planning branch (plan, data, tests, workflows) get onto main?"="Merge it to main yourself (Recommended)".

## 13. 2026-11-15 20:07 UTC

```text
I added the GEMINI_API_KEY secret, start the plan step. for netlify, once everything is built, you can give me a html and then I can import
```

## 14. 2026-11-15 20:17 UTC · answer to Claude's questions

"Gemini's first run used the free tier's default model (gemini-3-flash). It ran out of its 20-requests/day quota after ~6 min. It also skipped the plan step and wrote a partial build: the physics numbers are correct (8/8 tests), but the equation cards, ESTIMATE labels, flow diagram and most sliders are missing. The quota resets around 3 AM Eastern. How do you want to continue the Gemini build?"="Paid key + Pro, redo (Recommended)".

## 15. 2026-11-15 20:22 UTC

```text
There is a free $10 API credit right now in my AIS, can that be used?
```

## 16. 2026-11-15 20:26 UTC

```text
Okay it should be funded now, make sure you don't use a crazy amount of money on this shit otherwise we will be finding other methods.
```

## 17. 2026-11-15 20:29 UTC · answer to Claude's questions

"Your API key offers gemini-2.5-pro (Pro tier, older generation), gemini-3.5-flash (newest generation, Flash tier), and gemini-3.1-flash-lite. No Gemini 3.x Pro is listed. Which model should do the Gemini plan + build? The $6 cap applies either way."="gemini-3.5-flash (Recommended)".

## 18. 2026-11-15 20:35 UTC · answer to Claude's questions

"How do you want to answer Gemini's plan and start the build? (The full plan is in docs/gemini-build/plan.md on branch gemini/pro.)"="Approve with my answers (Recommended)".

## 19. 2026-11-15 20:59 UTC

```text
merge the builds to main and start Phase 2, you can see the live version currently at https://ucseparations.netlify.app
```

## 20. 2026-11-15 21:03 UTC · answer to Claude's questions

"Phase 2's heater-ΔT cost optimum needs purchased-equipment cost correlations (centrifugal compressor vs shaft power; forced-circulation evaporator/heat exchanger vs area) and a current CEPCI. Where should those numbers come from?"="Use the public DOE report".

## 21. 2026-11-15 21:21 UTC

```text
deployed, run the tests on the live site
```

## 22. 2026-11-15 21:24 UTC

```text
start the model comparison write-up, I also want to work on tidying up the website, giving it more of a better UI and UX design, and then we can do full deployment. But let's start with our model comparison write-up, and then we'll get to that in a little bit.
```

## 23. 2026-11-15 21:27 UTC · answer to Claude's questions

"Gemini's build includes a false sentence on its AI Workflow tab: "Key outcomes approved by course instructor" (you approved the critique decisions, not Prof. Co). It's on the public site at /gemini/. How should we handle it?"="Leave code, flag it (Recommended)".

## 24. 2026-11-15 21:52 UTC

```text
Could you give me a project breakdown that I can add into ChatGPT, I'm currently working with Chat to implement better UX to the website.
```

## 25. 2026-11-15 21:58 UTC

~~~~text
Please follow this plan in plan mode. # MVR CRYSTALLIZER EXPLORER — COMPLETE UI/UX REDESIGN PLAN

You are acting as a senior product designer, frontend engineer, and technical design lead. Your task is to improve the visual design and user experience of the existing **MVR Crystallizer Explorer** website.

This is an existing, working, tested chemical engineering project. You are NOT rebuilding the application. You are improving its presentation, organization, readability, and overall experience while preserving its scientific content and functionality.

You should approach this as a professional engineering technology product—not a typical student website.

---

# 1. PROJECT CONTEXT

**Project:** MVR Crystallizer Explorer  
**Course:** CHE 4061 — Separation Processes  
**Institution:** University of Cincinnati  
**Subject:** Evaporative crystallization of battery-grade lithium hydroxide monohydrate (LiOH·H₂O) using mechanical vapor recompression (MVR).

The website explains the industrial process and provides an interactive simulator that compares MVR against 1-, 3-, and 5-effect steam evaporators operating on the same feed.

The site includes seven main sections:

1. Overview
2. Industry Context
3. Theory
4. Simulator
5. AI Workflow
6. Video & Transcript
7. References

It is also an AI comparison project. Claude's implementation lives at the root of the site, while Gemini's independent implementation lives under `/gemini/`.

**Live website:** https://ucseparations.netlify.app  
**GitHub repository:** https://github.com/be-aa8/seperations

The intended audience is the professor and classmates. The site will be presented on a laptop/projector and accessed by people using phones.

The design must communicate technical credibility, scientific clarity, and a polished industrial aesthetic.

# 2. OVERALL DESIGN DIRECTION

The selected direction is a hybrid of two visual approaches:

- **Anduril-inspired:** cinematic, industrial, bold typography, dramatic visual hierarchy, dark backgrounds, immersive section transitions.
- **Palantir-inspired:** analytical, structured, precise, data-driven layouts, restrained colors, technical diagrams, and sophisticated information presentation.

Do not copy either company's website directly. Use them as design references for the level of polish, visual hierarchy, and atmosphere.

## Selected visual direction

**Hybrid color system:**
- Dark cinematic sections for major visual moments.
- Light technical sections for equations, charts, tables, and dense information.
- Controlled lime/olive accent color for emphasis and interaction.

**Cinematic intensity: HIGH.**

I want the website to feel immersive and visually memorable. Use:
- Large editorial headlines.
- Strong contrast between sections.
- Oversized but purposeful typography.
- Large visual elements where appropriate.
- Refined transitions and subtle motion.
- Strong spacing and deliberate composition.
- Technical diagrams that feel like professional engineering documentation.

Avoid:
- Generic AI-generated website aesthetics.
- Excessive rounded cards.
- Generic gradients.
- Purple/blue AI-themed color schemes.
- Unnecessary glowing effects.
- Random terminal text or decorative code.
- Excessive animations.
- Visual elements that make the technical content harder to understand.

The result should feel like an industrial engineering technology platform.

# 3. DESIGN SYSTEM

Establish a consistent design system before modifying individual sections.

Use these as the starting palette. You may make small adjustments if needed to improve contrast and consistency.

## Core palette

Light technical surfaces:
- Main background: #F1F2EF
- White surface: #FFFFFF
- Main text: #171B19
- Secondary text: #68716C
- Borders: #D9DDD7

Dark cinematic surfaces:
- Main dark background: #090D0C
- Secondary dark surface: #141A17
- Dark borders: #303833
- Primary light text: #F0F1EB
- Secondary light text: #A0AAA2

Accent:
- Lime/olive accent: #A6BB43
- Soft accent background: #EDF1DC

Preserve distinct warning, error, estimate, and success states. Do not make important status indicators difficult to distinguish.

## Typography

Use a clean, modern typography system.

Preferred options:
- Inter
- Helvetica Neue
- Geist
- IBM Plex Mono for technical labels and numerical data

Use a system font stack where practical. One external font family at most. Do not introduce unnecessary dependencies.

Create a clear hierarchy between:
- Hero headlines
- Section headings
- Subheadings
- Body text
- Technical labels
- Numerical results
- Equations
- Captions and supporting information

Equations and numerical results should be particularly readable.

## Components

Standardize the appearance of:
- Navigation
- Buttons
- Cards
- Equation cards
- Simulator result cards
- Charts
- Tables
- Callouts
- Warnings
- Status labels
- Process diagrams
- Placeholder sections
- Expandable content

Use consistent spacing, borders, typography, and interaction states.

# 4. CURRENT UX PROBLEMS TO ADDRESS

These are known issues from the project brief. Treat them as priorities rather than optional suggestions.

### A. Overall visual hierarchy
The existing header and navigation are plain. Cards are dense, and the equations, numerical values, and interpretations compete for attention.

Improve the hierarchy so the most important information is immediately recognizable.

### B. Overview is too text-heavy
Create a stronger opening experience with:
- A cinematic hero section.
- A concise explanation of the process.
- A strong visual representation of the MVR crystallization process.
- A clear path into the technical content.
- Prominent headline metrics, but ONLY if their values are verified against the existing hand calculations or project data.

The project brief mentions example values such as:
- 29 kWh/t
- COP ≈ 24
- 89.6% lithium yield
- Optimum heater ΔT ≈ 3 K

These are examples from the existing hand calculation, not permission to invent or alter results. Verify every displayed value and its source before using it.

### C. Simulator is too long
The simulator currently contains approximately:
- 22 sliders and presets.
- A process-flow diagram.
- Approximately 35 result cards.
- 12 Plotly charts.

Improve the experience so users can understand cause and effect without constantly scrolling.

Investigate:
- A sticky input column on desktop.
- A compact key-results strip near the top.
- Grouping result cards into logical categories.
- Collapsible result groups where appropriate.
- Chart navigation organized around engineering questions.
- Clear relationships between inputs, results, and affected charts.

Possible chart groups:
- Energy
- Boiling-point elevation
- Economics
- Purity
- Crystallization

Do not hide essential information behind excessive interactions.

### D. Mobile experience
The current mobile experience places all 22 sliders before the results.

Explore:
- A collapsible Inputs panel or drawer.
- More compact result cards.
- Responsive chart layouts.
- Horizontally scrollable tables within their own containers.
- Better spacing and typography at narrow widths.

The page itself must never have horizontal overflow.

### E. Theory section
The Theory section contains approximately 33 KaTeX equations.

Improve organization with:
- Clear equation groupings.
- Strong section headings.
- Better equation-card hierarchy.
- A sticky or easily accessible table of contents if appropriate.
- Readable units and physical interpretations.

Do not change the actual equations.

### F. Process-flow diagram
Improve the existing inline SVG diagram.

Known issue: some labels crowd equipment, including the circulating-liquor label near the crystallizer.

Make it cleaner and more professional:
- Better spacing.
- Clearer equipment symbols.
- More readable labels.
- Consistent line weights.
- Better visual distinction between process streams.
- Responsive behavior.

Keep it an inline SVG. Do not replace it with a static image.

### G. Placeholder sections
Make unfinished sections feel intentional rather than broken.

Relevant sections include:
- What I Learned
- Process Log
- Video
- Transcript

Use clear, restrained placeholder treatments such as an upcoming-content label and expected date where supported by the existing content.

Do not invent completion dates or claim content exists when it does not.

### H. Presentation readiness
The site must look good when projected at approximately 1280×720.

Check:
- Font sizes.
- Contrast.
- Chart readability.
- Navigation.
- Section spacing.
- Technical content visibility.

Consider a print stylesheet if it provides meaningful value.

# 5. FILES AND TECHNICAL ARCHITECTURE

The project uses plain HTML, CSS, and JavaScript ES modules. There is no framework, build step, or backend.

Existing libraries:
- KaTeX 0.16.11
- Plotly 2.35.2

Do not add dependencies or frameworks.

The following files exist:

| File | Responsibility | Permission |
|---|---|---|
| `site/index.html` | All seven tabs and static markup | May modify |
| `site/css/style.css` | Styling and CSS variables | May modify freely |
| `site/js/ui.js` | Tabs, sliders, presets, result cards, PFD interaction, update loop | Modify carefully; presentation only |
| `site/js/charts.js` | Plotly charts | Styling/layout only; preserve data and traces |
| `site/js/pfd.js` | Inline SVG process-flow diagram | Visual changes only |
| `site/js/content.js` | Equations, units, interpretations | Wording only with approval; do not change equations |
| `site/js/model.js` | Physics and pure functions | DO NOT MODIFY |
| `site/js/data.js` | Generated data and citations | DO NOT MODIFY |
| `site/gemini/**` | Gemini's independent build | NEVER MODIFY |

Before editing, inspect the actual repository and confirm the current state of these files. Do not assume the repository matches an earlier conversation or patch.

# 6. NON-NEGOTIABLE CONSTRAINTS

These constraints take priority over every design decision.

## Scientific integrity
- Do not change physics calculations.
- Do not change model functions.
- Do not alter source data.
- Do not invent numbers.
- Do not change engineering assumptions.
- Do not change equations.
- Do not remove citations.
- Preserve ESTIMATE, SCHEMATIC, and SOURCE NEEDED labels wherever they appear.
- Preserve the existing level of technical detail.
- Do not introduce new technical content without approval.

Every calculation card must continue to show:
1. Equation in KaTeX.
2. Numerical value.
3. Units.
4. One-line physical interpretation.

The expanded worked substitution must remain available.

The course requirement is "No Plot = No Pay." All 12 charts must remain.

## Functionality
Preserve:
- All seven hash-routed tabs.
- Navigation behavior.
- All sliders and their live updates.
- Presets.
- Simulator calculations.
- Result cards.
- Expandable worked substitutions.
- Clickable process-flow units.
- Equation panel behavior.
- All 12 charts.
- AI Workflow subtabs.
- References generated from data.js.
- Existing links and anchors.

## Required DOM IDs and hooks

Do not rename or remove these:

- `#sliders`
- `#cards`
- `#warnings`
- `#pfd`
- `#pfd-panel`
- `#p1`
- `#p1b`
- `#p2`
- `#p3`
- `#p4`
- `#p5`
- `#p6`
- `#p7`
- `#p8`
- `#p9`
- `#p10`
- `#p11`
- `#p5-note`
- `#tcold`
- `#tcold-out`
- `#cool-yield`
- `#in-<key>`
- `#out-<key>`
- `#in-useOsmotic`
- `#theory-equations`
- `#source-list`
- `#value-table`

Also preserve:
- `.rcard`
- `.num`
- `.u`
- `.eq`
- `.short`
- `.more`
- `.help`
- `.subtab[data-sub]`
- `.subpanel[data-sub]`
- `[data-preset]`
- `section[data-tab]`
- `#tab-<name>`

For the PFD, preserve:
- `#pfd [data-unit]`
- Existing `pfd-*` text IDs.
- Keyboard interaction, including Enter.
- `#pfd-panel` equation rendering.

## Automated test requirements

The following must continue to pass:

### Browser smoke test
- At least seven visible tab controls.
- Every tab must still open its corresponding content.
- Every visible range input must update a chart or visible text.
- No visible NaN, undefined, or Infinity.
- No KaTeX rendering errors.
- Theory must display KaTeX.
- All visible Plotly charts must render.
- Zero browser console errors.
- No horizontal page overflow at 375px on any tab.

Wide tables and diagrams may scroll inside their own containers.

### Phase 2 browser test
- `#p9` and `#p10` render correctly.
- They respond to `#in-U`, `#in-loadFraction`, and `#in-interest`.
- At least five PFD units remain clickable.
- Keyboard Enter works.
- The PFD equation panel displays KaTeX.
- No NaN appears.

### Physics tests
`npm test` must remain **23/23 passing**.

# 7. IMPLEMENTATION ROADMAP

Work in the following phases. Do not attempt a massive redesign in one pass.

## PHASE 0 — INSPECT AND ESTABLISH BASELINE

Before changing anything:

1. Inspect the complete repository.
2. Read the current UX brief.
3. Inspect the current `index.html`, `style.css`, `ui.js`, `charts.js`, and `pfd.js`.
4. Inspect the existing site visually at desktop and mobile sizes.
5. Identify which previous CSS changes, if any, are already present.
6. Run the existing test suite and record the baseline.
7. Identify any existing failures before making changes.
8. Create a safe working branch or checkpoint.

Deliver a concise baseline report:
- Current design strengths.
- Current design weaknesses.
- Files requiring changes.
- Existing test status.
- Recommended implementation sequence.

Do not start coding until the baseline is understood.

## PHASE 1 — GLOBAL VISUAL IDENTITY

Primary file: `site/css/style.css`

Establish:
- The hybrid dark/light palette.
- Typography system.
- Global spacing.
- Header and navigation.
- Section hierarchy.
- Cards and equation-card styling.
- Buttons and controls.
- Tables and callouts.
- Focus states.
- Responsive behavior.
- Reduced-motion behavior.

The header and navigation should feel like a polished industrial technology platform.

Use dark cinematic surfaces for high-impact areas and light surfaces for technical reading.

Keep this phase primarily CSS-only.

After implementation, inspect every tab to ensure the visual system works across the entire site.

## PHASE 2 — OVERVIEW / HERO

Primary file: `site/index.html` and `site/css/style.css`

Transform the Overview into a strong opening experience.

Suggested composition:

1. Dark cinematic hero.
2. Large headline introducing the MVR crystallization problem.
3. Concise explanatory copy.
4. Prominent process visual or existing process-flow diagram.
5. Verified headline metrics.
6. Clear transition into the lighter technical content.
7. Existing three explanatory cards, redesigned to match the visual system.
8. Existing What I Learned section, with its placeholder status preserved.

The opening should quickly communicate:
- What is being produced.
- Why crystallization matters.
- What MVR does.
- Why the simulator is useful.

Do not make the hero so large that users must scroll excessively to reach the technical material.

## PHASE 3 — SIMULATOR EXPERIENCE

Primary files: `site/index.html`, `site/css/style.css`, and carefully `site/js/ui.js`.

This is one of the most important phases.

The simulator should feel like a professional engineering control and analysis interface.

Improve:
- Input organization.
- Slider readability.
- Preset presentation.
- Sticky desktop inputs where practical.
- Mobile input drawer or accordion.
- Key-result summary.
- Result-card hierarchy.
- Grouping and navigation.
- Chart organization.
- Visual connection between input changes and affected results.

Result cards should prioritize the numerical answer, while keeping the equation, units, interpretation, and expanded worked substitution available.

Do not change the calculations or update logic.

All 12 charts must remain present and functional.

## PHASE 4 — THEORY AND INDUSTRY CONTEXT

Primary files: `site/index.html` and `site/css/style.css`.

Improve the reading experience without changing the scientific content.

Theory:
- Group equations logically.
- Improve equation spacing and typography.
- Make units and interpretations easy to identify.
- Add an accessible table of contents if appropriate.

Industry Context:
- Use stronger section hierarchy.
- Improve the presentation of production-volume arithmetic.
- Make operating problems and industrial context easier to scan.
- Preserve all existing technical information and citations.

## PHASE 5 — DIAGRAM AND CHART PRESENTATION

Primary files: `site/js/pfd.js`, `site/js/charts.js`, and `site/css/style.css`.

Improve the process-flow diagram and Plotly styling.

The diagram should resemble a clean engineering process-flow illustration.

Charts should have:
- Consistent typography.
- Readable axes and units.
- Clear legends.
- Consistent spacing.
- A restrained color system.
- Appropriate dark/light integration.

Do not change chart data, traces, or scientific meaning.

Keep all diagram interactions and required IDs.

## PHASE 6 — AI WORKFLOW, REFERENCES, AND FINISHING

Primary files: `site/index.html` and `site/css/style.css`.

Improve:
- AI comparison tables.
- Screenshots and supporting content.
- Process Log placeholder.
- Video and Transcript placeholders.
- References and generated-value table.
- Footer.
- Link to the Gemini version.

Keep the AI comparison fair. Do not visually imply that one model's results are scientifically superior without evidence.

Add final responsive, accessibility, and projector checks.

# 8. VISUAL QUALITY EXPECTATIONS

The finished website should feel:

- Industrial.
- Cinematic.
- Precise.
- Modern.
- Technically credible.
- Easy to navigate.
- Visually memorable.
- Appropriate for a university-level chemical engineering presentation.

Think of the experience as a combination of:
- An industrial technology company's product website.
- A professional engineering analysis dashboard.
- A clear technical teaching resource.

The site should not feel like a generic dashboard template or an ordinary student assignment.

Use large visual moments selectively. Dense technical information should remain calm, readable, and structured.

# 9. TESTING AND VALIDATION

Run the following commands from the repository root:

Start the local site:

```bash
python3 -m http.server 8000 -d site
```

Open:
`http://localhost:8000`

Run physics tests:

```bash
npm test
```

Expected result: 23/23 passing.

Run browser smoke tests:

```bash
node tests/browser-smoke.mjs \
  --base http://localhost:8000 \
  --paths /,/gemini/ \
  --out /tmp/smoke
```

Run Phase 2 tests:

```bash
node tests/browser-phase2.mjs \
  --base http://localhost:8000 \
  --out /tmp/p2
```

Browser tests require Playwright with Chromium.

Also manually inspect:
- Desktop at 1280×720.
- Desktop at 1280×800.
- Mobile at 375×812.
- Every one of the seven tabs.
- Simulator slider interactions.
- PFD unit interactions.
- All charts.
- AI Workflow subtabs.
- References table.

Check for console errors, broken links, layout overflow, unreadable equations, and visual inconsistencies.

# 10. HOW TO WORK WITH ME

I want this implemented incrementally, with review checkpoints.

Follow these rules:

1. Do not make all changes at once.
2. Do not rewrite the entire application.
3. Do not modify Gemini's version.
4. Do not modify the physics model or generated data.
5. Prefer CSS and markup changes over JavaScript changes.
6. When JavaScript changes are necessary, keep them strictly presentational.
7. Do not add frameworks or dependencies.
8. Do not silently remove content to make the page look cleaner.
9. Do not invent technical values or claims.
10. Do not claim tests passed unless you actually ran them.

For each phase:

- Explain what you intend to change.
- Identify the files involved.
- Explain any risks to functionality.
- Implement the smallest sensible change set.
- Show a concise summary of the changes.
- Run relevant tests.
- Report actual test results.
- Wait for my approval before moving to the next major phase.

Use complete replacement files or clear unified diffs. Keep changes small enough to review.

If a design decision could affect technical content, scientific accuracy, or functionality, stop and ask me before proceeding.

# 11. FIRST TASK

Begin with **Phase 0 only**.

Inspect the actual repository and current implementation. Do not assume any earlier CSS patch has been applied.

Then provide:
1. A concise assessment of the current website.
2. A list of the most important visual and UX improvements.
3. A file-by-file implementation plan.
4. Any risks or conflicts you identify.
5. The current test baseline.

Do not start implementing the redesign until I approve the Phase 0 report.

The goal is not simply to make the website look different. The goal is to make it look and feel like a polished industrial engineering technology product while preserving every important part of the working scientific application.
~~~~

## 26. 2026-11-15 22:28 UTC

```text
@"/root/.claude/uploads/d5df5d04-fb01-5d88-a0bd-3bbfd8093344/68069738-Screen_Recording_2026-11-15_at_5.27.12PM.mov" Overall I think it looks pretty good, is there anyway we could make a flashy "homepage" that is only there for looks? I think anything that could give a wow factor would be nice. Could we implement some flowy physics? something kinda like the screenrecording attached?
```

## 27. 2026-11-15 22:30 UTC · answer to Claude's questions

"What word should the giant dot-grid text spell? (The dots will also 'crystallize' into the letters when the page loads: a nod to the topic.)"="CRYSTALLIZE", "Where should the flashy part live?"="Top of Overview (Recommended)".

## 28. 2026-11-15 22:42 UTC

```text
yes i love! now we can work on adding similar animations to the website. could we add active flows in and out for the process flow simulator or add some color to it all. How ever you think will work the best should be fine. Could you also add a dark/light mode functions
```

## 29. 2026-11-15 22:53 UTC

```text
Let's ship out what we have right now, and then I'll take a look at it, and I'll come back later and see if there's any other UI UX stuff that I want to fix with it.
```

## 30. 2026-11-15 22:55 UTC

```text
send me the zip when CI passes
```

## 31. 2026-11-16 03:50 UTC

```text
deployed, run the tests on the live site
```

## 32. 2026-11-16 04:24 UTC

```text
[image attached]
[image attached]
[image attached]
Phase 1: Plan an Apple-Inspired Liquid Glass Simulator Redesign
I want to redesign the simulator interface of my Chemical Engineering crystallization website. Before making any changes, thoroughly inspect the existing project and create a detailed implementation plan.
IMPORTANT: This is a planning-only task. Do not modify any files, write code, or begin implementation until I review and approve your plan.
1. Project context
Website: https://ucseparations.netlify.app/#simulator
GitHub repository: https://github.com/be-aa8/seperations
This is an educational Chemical Engineering website for a CHE 4061 Separation Processes project. It models lithium hydroxide monohydrate evaporative crystallization using mechanical vapor recompression (MVR).
The simulator allows users to adjust process inputs and compare MVR against conventional steam evaporation configurations.
The project is built using plain HTML, CSS, and JavaScript ES modules. There is no frontend framework or build step.
The simulator includes:

* Approximately 22 adjustable inputs.
* A live process flow diagram.
* Approximately 35 calculated result cards.
* Multiple Plotly visualizations.
* Technical equations and explanatory material.
* Different operating presets and process configurations.

The existing simulator's calculations and engineering content are important. This task is strictly about improving the user interface and user experience.
2. Design references
I have provided three screenshots as visual references. Study all three before planning.
Reference 1: Airglow weather app
This is the strongest reference for the visual language.
Pay attention to:

* Translucent glass panels.
* Background blur and layered surfaces.
* Soft, subtle gradients.
* Floating information cards.
* Rounded controls and containers.
* Fine borders and highlights.
* The feeling of depth between interface elements.
* How information is presented without making the screen feel crowded.

Reference 2: Lumare landing page
Pay attention to:

* Large, clean typography.
* Immersive presentation.
* Strong visual hierarchy.
* Restrained use of color.
* The balance between large visual elements and minimal text.

Reference 3: Lumare journal
Pay attention to:

* Consistent rounded corners.
* Subtle borders and grid structures.
* Generous spacing.
* Clean typography.
* A polished, editorial presentation.

Do not simply copy these websites. Use them as inspiration for a cohesive design system appropriate for an engineering simulator.
3. Overall design direction
I want to move toward an Apple-inspired Liquid Glass interface.
The interface should feel:

* Premium.
* Modern.
* Rounded.
* Lightweight.
* Smooth.
* Layered.
* Intuitive.
* Visually calm.

Use Apple's Liquid Glass design language as inspiration, particularly its translucent surfaces, material depth, subtle reflections, and layered interface elements.
Avoid:

* Generic AI-generated dashboard styling.
* Excessive gradients.
* Excessive glow effects.
* Too many individual cards.
* Sharp, outdated-looking interface elements.
* Dense blocks of explanatory text.
* Unnecessary decorative elements.
* Excessive animation.

The simulator must still feel like a serious engineering application, not a weather app or marketing website.
4. Major UX change: Hide explanatory text behind a ? toggle
This is one of the most important changes.
Currently, I feel overwhelmed when looking at the amount of text in the simulator.
I want the default simulator experience to be much cleaner.
Move explanatory and educational text behind a Help/Details toggle represented by a `?` icon.
The default view should prioritize:

* Input controls.
* Important numerical results.
* Process flow diagram.
* Charts and visualizations.
* Units and essential labels.

The following should generally be hidden until the user opens Help:

* Long explanations.
* Paragraphs describing individual inputs.
* Descriptions of equations.
* Detailed explanations of calculated outputs.
* Educational notes.
* Extended chart descriptions.
* Additional technical context.

When the user clicks the `?` toggle, the relevant explanatory material should become available in a well-organized, readable format.
Think carefully about the best implementation:

* Should there be one main simulator Help toggle?
* Would smaller contextual `?` buttons work better for individual sections?
* Could the Help content appear in a floating glass panel, expandable drawer, or modal?
* How should the experience behave on mobile?

Recommend the best approach rather than automatically choosing one.
Important: Do not hide essential engineering information. Keep input labels, units, values, warnings, chart axes, legends, and information necessary to interpret results visible. The goal is to hide lengthy explanations, not make the simulator ambiguous.
Do not delete educational content. Preserve it and make it accessible through the Help interface.
5. Simulator design priorities
Inspect the existing simulator and determine how to improve the following:
A. Input controls

* Make sliders and input fields feel more refined.
* Improve grouping and organization.
* Use rounded controls and subtle glass surfaces.
* Make values easy to identify.
* Ensure users can quickly understand which inputs affect the process.
* Avoid excessive visual separation between related controls.

B. Results

* Create a clear hierarchy between primary and secondary results.
* Make important engineering outputs easy to identify.
* Reduce unnecessary visual clutter.
* Use consistent formatting, spacing, and typography.
* Consider whether results should be grouped into a smaller number of larger sections rather than dozens of disconnected cards.

C. Process flow diagram

* Make the diagram feel integrated into the new design.
* Improve the presentation of equipment and process information.
* Preserve all existing interactions and functionality.
* Ensure labels remain readable.

D. Charts

* Improve the presentation and organization of the Plotly charts.
* Use consistent rounded containers.
* Make chart titles and key information easier to understand.
* Reduce unnecessary explanatory text.
* Preserve all existing chart data and interactions.

E. Overall layout
Evaluate the current arrangement of inputs, results, process diagram, and charts.
I am open to reorganizing the simulator if it improves usability.
Consider:

* Desktop layout.
* Mobile layout.
* Responsive behavior.
* Sticky elements where useful.
* Expandable sections.
* Better separation between controls and results.

Do not force everything into glass cards. Use glass surfaces selectively to establish hierarchy.
6. Technical restrictions
These restrictions are critical.

* Do not modify `site/js/model.js`.
* Do not modify `site/js/data.js`.
* Do not change the equations in `content.js`.
* Do not change underlying process calculations.
* Do not change input values, default parameters, or engineering assumptions.
* Do not modify anything inside `site/gemini/**`.
* Preserve existing DOM IDs and JavaScript hooks wherever possible.
* Preserve all seven website tabs.
* Preserve existing simulator functionality.
* Preserve all Plotly charts and their underlying data.
* Maintain accessibility and keyboard usability.
* Avoid horizontal overflow on mobile.
* Keep the existing plain HTML/CSS/JavaScript architecture.

You may inspect all project files, but identify exactly which files would need to change before proposing implementation.
7. Planning deliverables
Before implementation, give me:

1. Current simulator audit: Explain the existing layout, major UX problems, and what should be retained.
2. Design concept: Describe the proposed Apple-inspired Liquid Glass visual system.
3. Help toggle design: Explain exactly how explanatory text will be hidden and accessed.
4. Proposed simulator layout: Describe the new organization of inputs, results, process diagram, and charts.
5. Desktop and mobile behavior: Explain how the interface will adapt.
6. Visual design system: Specify colors, typography, border treatments, shadows, blur, corner radii, spacing, and animation behavior.
7. File-by-file implementation plan: Identify every file that needs to change and what will change inside it.
8. Risk assessment: Identify anything that could break existing functionality.
9. Testing plan: Explain how you will verify that the redesigned simulator still works correctly.

Use the actual repository as your source of truth. Do not invent existing file structures or functionality.
8. Implementation workflow
Break the implementation into manageable phases.
I want to review the plan before any coding begins.
After presenting the plan, stop and wait for my approval. Do not start implementation automatically.
The end goal is a polished, Apple-inspired engineering simulator that feels significantly less overwhelming while preserving the full technical depth of the project.
```

## 33. 2026-11-16 04:26 UTC · answer to Claude's questions

"Your project rules (CLAUDE.md) say every calculation shows its equation, units and a one-line interpretation, and Prof. Co always asks 'how does that make sense?'. Your new brief wants a clean default with explanations behind '?'. How should the simulator open by default?"="Clean + Explain toggle (Recommended)", "Should the Liquid Glass style apply only to the Simulator tab, or the whole site?"="Simulator first (Recommended)", "How should the 12 charts be organized? (All must stay: 'No Plot = No Pay'.)"="Grouped, all visible (Recommended)".

## 34. 2026-11-16 04:37 UTC

~~~~text
I think it looks good! I would have to see the full deploy before making any more changes I think. That's fine for now though. I have reviewed and approved the simulator redesign plan.
Now begin implementing it.
Follow the approved plan closely. Do not introduce unrelated redesigns or expand the scope unnecessarily.
Implementation priorities

1. Establish the new Apple-inspired Liquid Glass design system.
2. Implement the cleaner simulator layout.
3. Move explanatory text behind the planned `?` Help interface.
4. Improve input controls and input grouping.
5. Improve the results hierarchy.
6. Refine the process flow diagram.
7. Improve the presentation and grouping of charts.
8. Polish responsive behavior for desktop and mobile.

Design expectations
The finished simulator should feel like a thoughtfully designed Apple application.
Pay particular attention to:

* Translucent surfaces with appropriate background blur.
* Layered glass panels.
* Subtle highlights and fine borders.
* Consistent rounded corners.
* Smooth, restrained transitions.
* Refined typography.
* Generous spacing.
* Clear visual hierarchy.
* Consistent treatment of controls, results, and charts.

Do not apply glass effects indiscriminately. Some areas should remain clean and simple so that the interface doesn't become visually noisy.
The scientific information must remain easy to read. Never sacrifice contrast or legibility for a glass effect.
Help toggle requirements
The default simulator view should be concise.
All lengthy explanatory text should be accessible through the approved Help design. The Help interface must be functional, easy to discover, and usable on mobile.
Do not remove, rewrite, or discard technical explanations simply to reduce clutter.
Development rules

* Work incrementally.
* Preserve all existing calculations and engineering content.
* Respect all file restrictions from the approved plan.
* Do not modify `site/gemini/**`.
* Preserve existing IDs and event hooks wherever possible.
* Do not replace functioning simulator components with static mockups.
* Avoid unnecessary dependencies.
* Do not claim functionality works unless it has been tested.

After each implementation phase:

1. Run the relevant tests.
2. Check for console errors.
3. Verify that existing simulator interactions still work.
4. Review desktop and mobile layouts.
5. Summarize what changed and any remaining issues.

Required final verification
Run the existing project tests and browser smoke tests, including:

```
npm test
node tests/browser-smoke.mjs --base http://localhost:8000 --paths /,/gemini/ --out /tmp/smoke
node tests/browser-phase2.mjs --base http://localhost:8000 --out /tmp/p2
```

Use the appropriate local server command if needed:

```
python3 -m http.server 8000 -d site
```

Verify:

* All simulator inputs still work.
* Changing inputs updates the correct results.
* The process flow diagram remains functional.
* All Plotly charts render.
* The Help toggle opens and closes correctly.
* No explanatory text is accidentally lost.
* No NaN or undefined values appear.
* Mobile layouts do not overflow horizontally.
* The other website tabs remain functional.
* The Gemini comparison site remains untouched.

At the end, provide a concise implementation report listing modified files, completed work, test results, and any remaining problems.
Begin with the first approved implementation phase.
~~~~

## 35. 2026-11-16 05:35 UTC

```text
find a fix for the phone toolbar and the tablet width and then ship and send the zip
```

## 36. 2026-11-16 05:53 UTC

```text
deployed, run the tests on the live site
```

## 37. 2026-11-16 22:35 UTC

```text
Okay the new zip is fully loaded now
```

## 38. 2026-11-16 23:25 UTC

```text
[image attached]
let's work on the Overview below the hero. right now, I think the information that is pesented below the hero will just be overlooked by the human eye tbh. I'm thinking we add more components that are flashy to give it that "look." To start, get rid of the "What the Simulator shows"and everything underneath of it. It just is redundant imo. can we also get rid of anything that relates with University of Cincinnati or class names. He knows what class it is for and would like it to seem as if it wasn't done for class purposes. let's implement something like the photo attached. add the Hero on the bottom underneath what is seen on the photo. keep it very clean and minimalist
```

## 39. 2026-11-16 23:54 UTC

```text
deployed, ship it and run the tests on the live site
```

## 40. 2026-11-17 00:29 UTC

```text
let's work on the Industry context tab next, I think this one look pretty good. I would like to remove the source needed and estimate red zones though so let me know what all you need and I'll do my best to give an answer. I would like to imbed Tesla's video (https://www.youtube.com/watch?v=rxYTx6aj96k) into this tab as it is very good. I think implementing using something as seen on https://codepen.io/dudleystorey/pen/PZyMrd would be AWESOME. It could be buggy though so make sure you look into that intensely. Other than that I think just kinda clean things up similarly to what we did on the overview and everything should be A+ material. Lets see what you got.
```

## 41. 2026-11-17 00:32 UTC · answer to Claude's questions

"I can't open the CodePen from here (codepen.io and youtube.com are both blocked in this cloud environment). Dudley Storey's well-known pens include a muted, looping YouTube video playing full-width behind big headline text, and video playing inside giant cut-out letters. Which effect did you mean?"="Full-width background video", "The red "SOURCE NEEDED" box is for battery lithium intensity (kg LCE/kWh), which is only there to estimate the refinery's output. Tesla's 2025 Impact Report reportedly states the output directly: about 20,000 t/yr of LiOH·H₂O (roughly 30 GWh; the 50 GWh figure on the site now is an earlier target). What should the "How much product?" card use?"="Tesla's 20,000 t/yr (Recommended)", "The red "ESTIMATE" says MVR holds a 55–60 % share of the evaporator/crystallizer market. Its only source is a paid market-research estimate. What should happen to it?"="Keep, softer styling", "The other "SOURCE NEEDED" asks which countries dominate lithium refining and why the US wants domestic refining. The IEA site is blocked from here, but the USGS Mineral Commodity Summaries are reachable. What would you like?"="Remove the paragraph".

## 42. 2026-11-17 01:01 UTC

```text
send me the zip when CI passes
```

## 43. 2026-11-17 01:09 UTC

```text
the video is currently working as intended on a laptop/desktop. it is not working on phone or tablet. along with this, the hero does flow on tablet/mobile and the overview process and the simulator process doesn't flow as intended. sorry for not bring this up earlier I just noticed. again, everything is working right on laptop/desktop rn.
```

## 44. 2026-11-17 23:40 UTC

```text
nothing was fixed, it remains the same as the old zip file.
```

## 45. 2026-11-18 00:06 UTC

```text
Browser: Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1
Screen: 393 × 695 CSS px, DPR 3
Reduce Motion setting: ON (site keeps animations still)
Reduced data / Save-Data: false / false
Container query units: true
YouTube player script: loaded
CSS animation on SVG: runs (0px → -8.652px)
Visibility events for SVG: fire
Animation frames per second: 35 fps (looks like Low Power Mode)
Site: hero frames in 3 s: 0
Site: Overview diagram frames in 3 s: 0
Site: Simulator diagram frames in 3 s: 0
Site: video state: poster (API requested: false)
Muted autoplay test: plays
```

## 46. 2026-11-18 00:07 UTC · answer to Claude's questions

"Your iPhone has Reduce Motion turned on, and the site honours that setting by keeping the hero, the diagram flows and the background video still (the accessibility guideline for people with motion sensitivity). How should the site handle Reduce Motion?"="Add a Motion toggle (Recommended)".

## 47. 2026-11-18 00:27 UTC

```text
deployed, ship it and run the tests on the live site
```

## 48. 2026-11-18 00:35 UTC

```text
next I want to work on cleaning up the theory section. this has the same issues as the old overview where theres just too much going on. can you try and clean it up a little bit by adding dropdown menus or something similar to storage some of the text? try to implement this in a very similar way to the other 2 cleaned up sections, as I liked how those turned out
```

## 49. 2026-11-18 01:45 UTC

```text
deployed, ship it and run the tests on the live site
```

## 50. 2026-11-18 02:12 UTC

```text
let's finishing the clean up the AI Workflow, video, and references tabs next, just add similar details to the others; I think you get the gist now
```

## 51. 2026-11-18 02:30 UTC

```text
send me the zip when CI passes
```

## 52. 2026-11-18 02:46 UTC

```text
deployed, ship it and run the tests on the live site
```

## 53. 2026-11-18 14:54 UTC

```text
yes, make the starter kit and send me the zip. Would chromatography make sense for Process Dynamics and Controls
```

## 54. 2026-11-18 15:12 UTC

```text
I think we can come up with something better for PD&C, what are some ideas you have? I also want to do a complete redesign with a different aesthetic. I will give more details later.
```

## 55. 2026-11-18 15:14 UTC

```text
I like ideas 3 and 4, creates pitches for both in a copyable chat. I will read and weigh which option is better
```

## 56. 2026-11-18 15:52 UTC

```text
how many tokens did this along with other chats take to build the website
```

## 57. 2026-11-18 16:26 UTC

```text
For process dynamics and controls chat where were working on the same project, its having a hard time understanding how we using GitHub, google gemini through the API key, and claude code as one to build the website. can you give me something I can add to the chat in that convo that could lead the ai in the correct direction
```

## 58. 2026-11-27 00:25 UTC

```text
okay now I want to completely finish the website. get rid of all of the to verify and red tags. ask me questions and we can clear things up and push
```

## 59. 2026-11-27 00:27 UTC · answer to Claude's questions

"The Simulator still shows 16 red "ESTIMATE" flags on its input sliders (feed rate, feed LiOH, impurity, ε, efficiencies…). The project rules say estimates must be clearly labeled. How should they look?"="Grey chips (Recommended)", "The Antoine constants for water (A = 8.07131, B = 1730.63, C = 233.426) carry a "to verify" tag asking for a print-handbook check. The site already checked them against NIST steam data (within 0.38 % over 30–110 °C). How should we close it?"="NIST check counts (Recommended)", ""Battery-grade sodium limit" (spec.naMax_ppm) is marked "source needed". It isn't used in any calculation or shown on the Simulator; it only appears in the References value table. What should we do?"="Remove it (Recommended)", "Is the YouTube presentation uploaded yet (it's due Dec 4)?"="Not yet".

## 60. 2026-11-27 00:31 UTC · answer to Claude's questions

"The "What I learned / what I want to learn next" section on the Video tab is required by the assignment and still says "to be written". How do you want to fill it?"="Draft it for me (Recommended)", "Two Contributions cards say "details to be added": yours (Andrew) and "Other tools". Can I fill them in from the process log and the repo?"="Yes, fill both (Recommended)", "The two Phase 1 comparison screenshots on the AI Workflow tab still show the old class name in their headers (Gemini's says "UC CHE 4061 · Prof. Carlos Co · Fall 2026"). What should I do?"="Crop the headers (Recommended)", "The Tesla figure (≈ 20,000 t/yr LiOH·H₂O, ≈ 30 GWh) is cited through news coverage of Tesla's 2025 Impact Report because tesla.com blocks automated downloads. Do you have a way to cite the report directly?"="Keep the coverage (Recommended)".

## 61. 2026-11-27 01:01 UTC

```text
add this to the website conclusions: After comparison, I chose to ship mostly Anthropic made content. I found that Claude had better design and overall building skills. Something that surprised me while making the website was how good ChatGPT is at making moodboards and planning for uI and UX implementations. I found it much better than Claude and Gemini. If I were to rebuild a website, I would use GitHub Pages with a Gemini API key implementation, similar to what I did in Process Dynamics and Controls. This does cost you (I spent around $5 for both Separations and PD&C), but it is definitely worth it for hands free integration!

Something I learned about process control over these past few weeks has been how recycle effects processes. I liked working with AI and expanding my knowledge on building websites. In the future, I would like to further my understanding of LLMs and use GitHub Pages and Claude to build a homepage for all of my project and endeavors.
```

## 62. 2026-11-27 01:19 UTC

```text
can you actually push the website to GitHub Pages instead of hosting in Netlify? I tried doing this with my other class project and it worked so much better an is nice how hands free it is
```

## 63. 2026-11-27 01:48 UTC

```text
done, pages is enabled now
```

## 64. 2026-11-27 19:26 UTC

```text
[image attached]
can you add the crystal graphic back to the crystals like how it was before on the browser tab
```

## 65. 2026-11-27 20:12 UTC

```text
@"/root/.claude/uploads/d5df5d04-fb01-5d88-a0bd-3bbfd8093344/b8ed1659-mvr-presentation.pptx" take a look at these slides and see if there is anything that needs to be changed or any errors
```

## 66. 2026-11-27 20:14 UTC

```text
make the changes to the slide and then embed it into the website under the video placement
```

## 67. 2026-11-27 20:34 UTC

```text
[image attached]
nice looks good, can you add the little addition bar and full screen like the other project, see photo
```

## 68. 2026-11-27 20:54 UTC

```text
what im having trouble with is understanding every part of the website and how to explain it. I know the basics but some of the graphs and terminology im not familiar with too much. what I would like you to do is provide a layout/script that I can follow for the YouTube video. I would like half of this to be over the slides and half to be over the website itself. you can either choose to do cuts back and forth for each section or all slides then all website. whatever you think will bw better, it would be easier to edit if we did slides then website though, less cuts. not everything on the website needs to be mentioned either, just the main parts. the QandA in class can cover the rest of that if needed. can you make an easily printable version pdf that can use minimal ink while still being readable on white apper
```

## 69. 2026-11-27 22:29 UTC

```text
can you create a good yt title and description for the video
```

## 70. 2026-11-27 22:44 UTC

```text
I want to use the quiz feature, what are 3 questions I can ask and what parts and what answers and what's right
```

## 71. 2026-11-27 22:55 UTC

```text
can you create 2 different thumbnails for this project
```

## 72. 2026-11-27 23:15 UTC

```text
time to add the transcript and embed the yt video: https://www.youtube.com/watch?v=BLQXmZmRMlQ

[Pasted: the full YouTube auto-transcript, saved verbatim in docs/transcript-raw.txt]
```

## 73. 2026-11-27 23:51 UTC

```text
FINAL PROJECT COMPLETION: FULL AUDIT, QUALITY CONTROL & LOOSE-ENDS REVIEW
I believe this project is nearly finished. I now want you to conduct a comprehensive final review and bring it to a genuinely complete, polished, submission-ready state.
I do not want a superficial review or a list of suggestions. I want you to inspect the actual project, identify anything incomplete, fix issues where appropriate, and verify that everything works.
Approach this as a senior software engineer, Chemical Engineering subject-matter reviewer, quality assurance tester, and final project evaluator.
The objective is to leave no avoidable loose ends.
1. First: Understand the entire project
Before making changes:

* Inspect the complete repository and project structure.
* Review the original assignment requirements, project specifications, and deliverables available in the project files.
* Review the current implementation.
* Identify the intended functionality of every major feature.
* Review all pages, tabs, sections, interactive elements, visualizations, and supporting materials.
* Identify any previous decisions or technical restrictions documented in the project.

Do not assume something is complete simply because it exists.
Compare the actual project against its original requirements.
If important requirements or source materials are missing, identify them rather than inventing answers.
2. Complete functionality audit
Go through the entire project systematically.
Check:

* Every navigation link and tab.
* Every button and interactive element.
* Every slider, input, and control.
* Every dropdown, toggle, modal, and expandable section.
* Every chart, graph, and visualization.
* Every process diagram and interactive component.
* Every internal and external link.
* Every download or supporting resource.
* Every mobile and desktop interaction.

Look for:

* Broken functionality.
* Incorrect event handlers.
* Missing content.
* Placeholder elements.
* Dead buttons.
* Incorrect navigation.
* Rendering problems.
* JavaScript errors.
* Missing assets.
* Broken image references.
* Incorrect responsive behavior.
* Inconsistent UI behavior.

Test functionality instead of simply reading the source code.
3. Engineering and technical correctness
This is a Chemical Engineering project, so technical correctness is extremely important.
Review all engineering-related content against the project's supplied materials and documented assumptions.
Check:

* Equations and mathematical notation.
* Units and conversions.
* Variable definitions.
* Input and output relationships.
* Material and energy balances.
* Engineering assumptions.
* Physical relationships.
* Process diagrams.
* Chart calculations and labels.
* Numerical formatting.
* Results displayed by the simulator.
* Consistency between the written explanations and implemented calculations.

Where possible, independently verify important calculations using a separate method.
Do not silently change engineering assumptions, equations, or model behavior to make something appear correct.
If you discover a potential technical issue, investigate it and explain the evidence before changing anything that affects the engineering model.
Clearly distinguish verified correctness from assumptions that cannot be independently confirmed.
4. Content and completeness audit
Read through every section of the project.
Identify and resolve:

* Placeholder text.
* Empty sections.
* Missing explanations.
* Incomplete descriptions.
* "TODO" comments.
* "SOURCE NEEDED" labels.
* Temporary content.
* Missing references.
* Incomplete tables.
* Unfinished captions.
* Inconsistent terminology.
* Repeated or unnecessary text.
* Broken formatting.
* Missing attribution.

Pay particular attention to whether the project tells a complete story.
A visitor should understand:

1. What the project is about.
2. Why the subject matters.
3. How the process or model works.
4. How to interact with the project.
5. What the results mean.
6. What conclusions can reasonably be drawn.

Do not fabricate citations, sources, results, or experimental findings.
If information cannot be verified, flag it clearly rather than making something up.
5. Design and presentation audit
Review the entire project as if it were being presented to a professor, engineering professional, or technical audience.
Evaluate:

* Overall visual consistency.
* Typography.
* Spacing.
* Alignment.
* Color consistency.
* Section hierarchy.
* Navigation.
* Chart readability.
* Equation readability.
* Image quality.
* Interactive feedback.
* Desktop presentation.
* Mobile presentation.

Look for anything that feels unfinished, inconsistent, cluttered, or visually out of place.
Preserve the established design direction. Do not unnecessarily redesign components that already work well.
Make targeted improvements where they meaningfully improve the finished product.
Avoid adding unnecessary features simply to make the project appear more sophisticated.
6. Code quality and reliability
Inspect the codebase for:

* Unused code.
* Duplicate functionality.
* Unnecessary dependencies.
* Dead CSS.
* Broken imports.
* Console warnings and errors.
* Unhandled exceptions.
* Incorrect asset paths.
* Potential performance problems.
* Accessibility problems.
* Unnecessary complexity.

Make reasonable cleanup improvements without introducing unnecessary architectural changes.
Do not remove functionality simply because it appears unused without verifying that it is not needed.
Preserve existing project architecture unless a genuine issue requires a change.
7. Testing and verification
Run the project's existing tests.
Identify any additional tests needed to verify important functionality.
Test the actual deployed website if access is available, not just the local development version.
Verify:

* The project loads correctly.
* All major pages and sections work.
* Interactive features function correctly.
* Calculations update as expected.
* Charts render correctly.
* No major console errors remain.
* Navigation works.
* Desktop layouts are correct.
* Mobile layouts are usable.
* There is no unintended horizontal overflow.
* External links work.
* No important content is missing.

For every test, report whether it passed, failed, or could not be verified.
Never claim a test passed if it was not actually performed.
8. Assignment and deliverables audit
Return to the original assignment requirements and create a requirement-by-requirement completion checklist.
Check whether every required deliverable exists and is accessible.
Consider:

* Public website availability.
* Documentation.
* Project explanations.
* AI workflow documentation, where required.
* Model and tool descriptions.
* Prompts and development process.
* Presentation materials.
* Video and transcript requirements.
* Supporting files.
* References and citations.
* Required submission links.

Do not assume that a feature being present on the website means the corresponding assignment requirement has been satisfied.
Identify anything that still requires my personal involvement, such as recording a video, reviewing a claim, supplying a missing source, or submitting something through Canvas.
9. Implementation instructions
After completing the initial audit, do not stop at identifying problems.
Classify each issue as:

* Critical: prevents the project from functioning or meeting a requirement.
* High: significantly affects correctness, usability, or completeness.
* Medium: noticeable quality issue.
* Low: minor polish or optional improvement.

Then fix the issues that can be safely resolved within the project.
Rules:

* Preserve the established project direction.
* Do not introduce unnecessary features.
* Do not fabricate missing information.
* Do not compromise technical correctness for visual improvements.
* Do not break working functionality.
* Do not remove required content.
* Respect any documented file restrictions.
* Preserve separate project versions and do not overwrite another project's work.
* Make changes incrementally and test after each meaningful group of changes.

If a problem requires information or approval from me, leave it clearly documented rather than guessing.
10. Final completion report
When you believe the project is finished, provide a comprehensive but concise final report.
Include:
A. Overall assessment
Is the project genuinely complete and ready for submission? Explain why.
B. Changes made
List the important issues you discovered and exactly what you fixed.
C. Engineering verification
Summarize which calculations, equations, assumptions, and technical claims were checked, and identify anything that remains unverified.
D. Functionality testing
List the tests performed and their actual results.
E. Assignment checklist
Show every requirement and whether it is:

* Complete.
* Incomplete.
* Needs my attention.
* Unable to verify.

F. Remaining loose ends
List absolutely everything that still requires attention from me.
Do not hide minor issues just to make the project appear finished.
G. Final recommendation
Give me your honest assessment of whether I can confidently consider the project finished.
Final instruction
Be thorough and critical.
I would rather discover a small problem now than discover it during my final presentation or after submission.
Do not confuse a visually polished website with a completed project.
The final goal is a technically sound, fully functional, professionally presented, properly documented, and submission-ready project.
Start with the full audit, then work through the issues systematically until the project is as complete as you can reasonably make it.
```

## 74. 2026-11-28 02:47 UTC

```text
just change the process control to: something I learned in separations that surprised me is that MVR isn't always the cheapest option. 2 is fine. strip speaker notes. for 4, don't you have them already? 5-7 okay. 8 delete them.
```
