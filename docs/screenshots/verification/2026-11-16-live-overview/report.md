# Live-site check after the Overview redesign (main @ 635fffd)

Target: https://ucseparations.netlify.app

- Deployed files match `site/` (index.html and gemini/index.html differ only by Netlify's injected comment and badge script).
- npm test 23/23.
- Smoke light and dark: `/` 7 tabs, 22 sliders, 0 failures; `/gemini/` 7 tabs, 16 sliders, 0 failures.
- Phase 2 (light and dark), hero, glass (light and dark): pass.
- UX: pass, including the Overview checks:
  - intro and headline present, with the dot hero below the intro;
  - diagram flows animate, and stop under reduced motion;
  - the CTA opens the Simulator;
  - one-row desktop header;
  - "What I learned" is on the Video tab;
  - no "Cincinnati", "CHE 4061" or "Prof. Co" on `/` or `/gemini/`.
