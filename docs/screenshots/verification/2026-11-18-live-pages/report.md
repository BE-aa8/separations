# Live-site check after the AI Workflow / Video / References cleanup (main @ 1e6074c)

Target: https://ucseparations.netlify.app

- Deployed files match `site/`; only Netlify's injected lines differ in the two index pages.
- npm test 23/23.
- Smoke, light and dark: `/` 22 sliders and `/gemini/` 16 sliders, 0 failures.
- Phase 2, hero, UX, glass, Industry and Theory (light and dark): pass.
- Pages test (AI Workflow, Video, References), light and dark: pass after a test-harness fix. The video-hook check fetched the page from Node, which cannot resolve hosts in this container. It now sets the ID inside the browser instead, and passes locally and live.
