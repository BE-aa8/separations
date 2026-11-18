# Live-site check after the Theory tab cleanup (main @ 89c3e1d)

Target: https://ucseparations.netlify.app

- Deployed files match `site/`; only Netlify's injected lines differ in the two index pages. The temporary `diag.html` is gone (404).
- npm test 23/23.
- Smoke, light and dark: `/` 7 tabs, 22 sliders, 0 failures; `/gemini/` 7 tabs, 16 sliders, 0 failures.
- Phase 2 (light and dark), hero, UX (including the motion toggle), glass (light and dark), Industry (light and dark) and Theory (light and dark): all pass.
