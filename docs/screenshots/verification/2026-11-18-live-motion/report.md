# Live-site check after the Industry tab, mobile and motion-toggle work (main @ 5471470)

Target: https://ucseparations.netlify.app

- Deployed files match `site/`; only Netlify's injected lines differ in index.html, gemini/index.html and diag.html.
- npm test 23/23.
- Smoke, light and dark: `/` 22 sliders and `/gemini/` 16 sliders, 0 failures. The first light run logged one transient `502 Bad Gateway` for a resource; the re-run was clean.
- Phase 2 (light and dark), hero, UX (including the motion toggle), glass (light and dark) and Industry (light and dark): all pass.
- On Andrew's iPhone (Reduce Motion ON), `diag.html` showed the earlier "no animation" was the site honouring Reduce Motion. The motion toggle now lets him turn motion on.
