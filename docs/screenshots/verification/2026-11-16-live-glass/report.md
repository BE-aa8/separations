# Live-site check after the Liquid Glass ship (main @ e5c867e)

Target: https://ucseparations.netlify.app

- Deployed files match `site/` byte-for-byte (index.html and gemini/index.html differ only by Netlify's injected comment and badge script).
- npm test 23/23.
- Smoke light and dark: `/` 7 tabs, 22 sliders, 0 failures; `/gemini/` 7 tabs, 16 sliders, 0 failures.
- Phase 2 light and dark: pass. Hero: pass. UX: pass.
- **Glass (light and dark): FAILED on the live site.** Netlify's free tier injects a fixed "Powered by Netlify" badge (201×64 px, bottom-right, z-index 2147483645). On a 375 px phone it covered the right half of the centred Inputs button, so the tap landed on the badge (`live-phone-badge-overlap.png`). Locally there is no badge, which is why CI passed.

**Fix:** the Inputs button moved to the bottom-left (`fixed-inputs-button-left.png`); phone sheets get extra bottom padding so their last rows scroll above the badge; `browser-glass.mjs` now inserts a stand-in badge of the same size so CI catches any overlap. Full suite passed locally afterwards; re-run on the live site after redeploying.
