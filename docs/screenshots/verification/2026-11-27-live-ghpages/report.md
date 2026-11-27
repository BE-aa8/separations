# Live-site check after moving to GitHub Pages (main @ 0de24fe)

Target: https://be-aa8.github.io/separations/ (deployed by `.github/workflows/pages.yml` after CI passed on main)

- All 22 deployed files are byte-identical to `site/`. GitHub Pages injects nothing, unlike Netlify.
- npm test 23/23.
- Smoke, light and dark: `/` 7 tabs, 22 sliders, 0 failures; `/gemini/` 7 tabs, 16 sliders, 0 failures.
- Phase 2 (light and dark), hero, UX (motion toggle), glass (light and dark), Industry (light and dark), Theory (light and dark), AI Workflow / Video / References (light and dark): all pass.
