# Plan: Industry Context tab: Tesla video band, cleanup, red flags resolved

## Context
Andrew likes the Industry Context tab but wants three things:
1. The red "SOURCE NEEDED" / "ESTIMATE" boxes gone.
2. Tesla's refinery video (YouTube `rxYTx6aj96k`) embedded as a full-width, muted, looping background video behind a headline. This is the Dudley Storey CodePen style he linked; he picked "full-width background video". He warned it can be buggy.
3. The tab cleaned up to match the new Overview: minimal and eye-catching, "A+ material".

His answers on the data:
- **Product rate:** use Tesla's stated output, about 20,000 t/yr of LiOH·H₂O (≈ 30 GWh, from the 2025 Impact Report).
- **MVR market share:** keep it, but with soft grey styling.
- **Refining-dominance paragraph:** remove it.

Network note: codepen.io, youtube.com, tesla.com and the news sites are blocked from this cloud environment, so the pen, the video's title/date and the Impact Report could not be read during planning.

## Step 0: verify the facts first (no invented data)
- Ask Andrew to approve adding `www.tesla.com` and `www.youtube.com` to the environment's network allowlist (an approval prompt).
  - With `www.youtube.com`, the oEmbed endpoint gives me the video's exact title and channel, and confirms it can be embedded.
  - With `www.tesla.com`, I can quote the Impact Report's refinery sentence (20,000 t/yr, ≈ 30 GWh, alkaline leach).
- If he declines: he pastes the video title and a screenshot of the Impact Report line, or I cite the secondary reports (Mining.com.au and EVwire coverage of the 2025 Impact Report) by name.
- The capacity figure on the site (50 GWh) becomes **≈ 30 GWh (2025 Impact Report)**, with a note that 50 GWh was the earlier announced target.
- Edit `tools/build_data.py` and regenerate `site/js/data.js` (CI checks they match):
  - update the `tesla-robstown` source;
  - add `industry.teslaOutput` = 20,000 t/yr;
  - add a `tesla-video` source.

## Step 1: Video band at the top of the tab (the CodePen effect, hardened)
**Layout:** a full-bleed dark band, the same width and treatment as the Overview dot hero.
- A muted, looping YouTube iframe sits behind a dark gradient scrim.
- In front: the pill "Industry context", the headline "Inside Tesla's Texas lithium refinery", one short line of copy, a lime **▶ Watch with sound** button and a "Jump to the crystallization step" link.

**Embed URL:** `youtube-nocookie.com/embed/rxYTx6aj96k?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1`.

The background iframe has `pointer-events:none`, `tabindex=-1` and `aria-hidden`. It is sized to *cover* the band with container-query units (`width:max(100cqw,177.78cqh)`, `height:max(56.25cqw,100cqh)`), centred, and scaled about 1.12× so YouTube's title strip sits outside the visible area.

**Known bugs and the fix for each:**
| Problem | Fix |
|---|---|
| Autoplay can be blocked (iOS Low Power mode, Data Saver, some browsers), leaving a big YouTube play button | The iframe stays invisible (opacity 0) over a **poster layer**: the video thumbnail plus a gradient. It fades in only when the YouTube IFrame API reports `PLAYING`. No PLAYING within 6 s means the poster stays. |
| The YouTube title, "More videos" and end screen appear | `controls=0`, the crop/scale above, and a manual loop: `seekTo(0)` shortly before the end via the API, instead of `loop=1`, which flashes the end screen. |
| The video keeps streaming while you are on another tab or have scrolled past | Pause when the Industry tab is hidden (hash routing) or the band leaves the viewport (IntersectionObserver plus an `offsetParent` check, the same pattern as `hero.js`). Play again when visible. |
| Cost on load and privacy | Nothing from YouTube loads until the Industry tab is first opened; the API script is injected lazily. The nocookie domain is used. |
| Reduced motion, phones and Save-Data | No background autoplay under `prefers-reduced-motion`, below 700 px, or with `navigator.connection.saveData`. The poster and the Watch button still work. |
| Keyboard and screen-reader users | "Watch with sound" opens a `<dialog>` holding a normal YouTube player with controls and sound. Esc or ✕ closes it, the dialog's iframe is removed so audio stops, and focus returns to the button. |
| The API or YouTube fails to load (ad blockers, offline) | Everything degrades to the poster and a link to the video on YouTube; no console errors. |

**New file:** `site/js/industry-video.js`, presentation only. It is loaded from `index.html` like `hero.js`. `ui.js` routing stays unchanged; the new module listens for `hashchange` itself.

## Step 2: Clean up the tab (Overview style)
1. **What LiOH·H₂O is for:** a short two-column intro. The current text stays, with three small fact chips ("high-nickel cathodes", "sold as the monohydrate", "battery grade = tight Na limits").
2. **Tesla's Robstown refinery:**
   - A **stat strip** of three big numbers: ≈ 20,000 t/yr LiOH·H₂O; ≈ 30 GWh/yr; 2,500 kg/h at 8,000 h/yr. All are cited or computed.
   - The 5 process steps become a horizontal numbered timeline (stacked on phones). The **Crystallization** step is highlighted lime with "This site models this step →", linking to the Simulator.
3. **How much product?** The card is rewritten with no flags:
   - $\dot m = 20{,}000\ \tfrac{t}{yr} \div 8{,}000\ \tfrac{h}{yr} = 2.5\ \tfrac{t}{h} = 2{,}500\ \tfrac{kg}{h}$, with units and a one-line interpretation.
   - Then $N = 2{,}500 / C_{\text{sim}}$: how many simulator-size crystallizers (hand-calc case C ≈ 942 kg/h) Tesla would need, ≈ 2.7. C is computed live from `simulate(DEFAULT_INPUTS)`, so no number is typed in.
   - **Plot (No Plot = No Pay):** a small Plotly bar chart, "Tesla refinery (stated)" vs "one simulated crystallizer". It follows the dark/light theme via `setChartTheme`.
4. **Who builds the crystallizers:** the Veolia patent sentence stays. The 55–60 % MVR share stays, but its red `.flag` becomes a quiet grey "market estimate" chip with the source named. The refining-dominance paragraph is deleted.
5. **Operating problems:** Foaming and Li₂CO₃ scaling become two clean cards like the Overview cards, each with a small line icon. Text unchanged.

The old H2 "Industry context" is replaced by the band's headline; the `#tab-industry` ID, `data-tab` and route stay.

## Files
- `site/index.html`: Industry section, the dialog, the script tag.
- `site/css/style.css`: video band, poster, dialog, stats, timeline, cards, grey estimate chip.
- `site/js/industry-video.js`: new.
- `site/js/ui.js`: small additions to render the Industry product numbers and the Plotly bar from `simulate()` output. Presentation only.
- `tools/build_data.py` → `site/js/data.js`: sources and values from Step 0.
- `tests/browser-industry.mjs`: new, added to CI. YouTube requests are stubbed with `page.route`, because the real player can't run here.
  - No red `.flag` left in `#tab-industry`.
  - The band and poster render; the background iframe gets the right `src` only after the tab opens.
  - No YouTube request before the Industry tab is visited.
  - The poster stays when the stubbed API never reports PLAYING; the iframe fades in when the stub reports PLAYING.
  - It pauses on leaving the tab.
  - Reduced motion and 375 px: no background iframe, Watch works.
  - The dialog opens with a controls iframe; Esc closes it, removes the iframe and returns focus.
  - The product numbers equal 20,000/8,000 and 2,500 / C from the model; the Plotly chart renders.
  - No horizontal scroll and no console errors, in light and dark.
- `docs/plan-industry-claude.md`, `docs/process-log.md`.

## Verification
- Run `npm test` and the full browser suite (smoke, Phase 2, hero, UX and glass in light/dark, plus industry in light/dark).
- Review screenshots at 1440, 1280×720, 820 and 375 in both themes.
- **Real video:** playback can't run in this container (YouTube's video hosts and the codecs are unavailable). After deploy, Andrew checks a short list on his laptop and phone: the video plays muted behind the headline with no YouTube chrome, it pauses on other tabs, and Watch with sound plays with audio. I then run the suite on the live site.
- Push, green CI, then ship to main and send the zip.
