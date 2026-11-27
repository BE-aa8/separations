// deck.js: the presentation slides on the Video & Transcript tab (images rendered from the .pptx).
// Prev / Next, a slide counter, "Title:" line, a numbered thumbnail strip and Full screen.
// Keys: arrows / Page Up/Down / Home / End when the viewer has focus; Esc leaves full screen.
// Swipe on touch screens. Nothing loads until the Video tab is opened; thumbnails are small and lazy.
const TITLES = [
  'MVR Crystallizer Explorer',
  'The project in three numbers',
  'Batteries need lithium hydroxide, refined in the US',
  'Boiling is the expensive step: the MVR process loop',
  'Three models, one plan, tests first',
  'Six lessons',
  'Lesson 1: Salt makes the compressor work harder',
  'Six lessons: lesson 2',
  'Lesson 2: MVR only pays for the lift',
  'Six lessons: lesson 3',
  "Lesson 3: Cheapest to run isn't always MVR",
  'Six lessons: lesson 4',
  'Lesson 4: The purge is a dial, yield vs purity',
  'Six lessons: lesson 5',
  'Lesson 5: One model planned, another critiqued',
  'Six lessons: lesson 6',
  'Lesson 6: Two builds, same tests',
  'Recap: the six lessons',
  "Live demo: let's run it",
  'Conclusions',
  'Try it yourself: sources, models, tools and contributions',
];
const N = TITLES.length;
const pad = (k) => String(k + 1).padStart(2, '0');
const src = (k) => `slides/s-${pad(k)}.jpg`;
const thumb = (k) => `slides/t-${pad(k)}.jpg`;

const root = document.getElementById('deck-viewer');
const img = document.getElementById('deck-img');
const count = document.getElementById('deck-count');
const title = document.getElementById('deck-title');
const strip = document.getElementById('deck-thumbs');
const prev = document.getElementById('deck-prev');
const next = document.getElementById('deck-next');
const fsBtn = document.getElementById('deck-fs');
let i = 0;
let started = false;

function show(k, scrollThumb = true) {
  i = Math.max(0, Math.min(N - 1, k));
  img.src = src(i);
  img.alt = `Slide ${i + 1} of ${N}: ${TITLES[i]}`;
  count.textContent = `${i + 1} / ${N}`;
  title.textContent = `Title: ${TITLES[i]}`;
  prev.disabled = i === 0;
  next.disabled = i === N - 1;
  strip.querySelectorAll('button').forEach((b, n) => {
    const on = n === i;
    b.classList.toggle('is-on', on);
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    if (on && scrollThumb && strip.offsetParent !== null) {
      // keep the active thumbnail in view without scrolling the page
      const l = b.offsetLeft - strip.offsetLeft, r = l + b.offsetWidth;
      if (l < strip.scrollLeft) strip.scrollLeft = l - 8;
      else if (r > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = r - strip.clientWidth + 8;
    }
  });
  if (i + 1 < N) { const pre = new Image(); pre.src = src(i + 1); }   // warm the next slide
}

function buildThumbs() {
  strip.innerHTML = TITLES.map((t, k) => `<button type="button" class="deck-thumb" aria-label="Go to slide ${k + 1}: ${t.replace(/"/g, '&quot;')}"><img src="${thumb(k)}" alt="" width="320" height="180" loading="lazy" decoding="async"><span>${k + 1}</span></button>`).join('');
  strip.querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => { show(k); root.focus({ preventScroll: true }); }));
}

// ---------- full screen: native where allowed, otherwise a full-window overlay (iPhone) ----------
const nativeFS = () => document.fullscreenElement || document.webkitFullscreenElement;
const isFS = () => !!nativeFS() || root.classList.contains('is-fs');
function syncFS() {
  const on = isFS();
  root.classList.toggle('in-fs', on);
  fsBtn.textContent = on ? 'Exit full screen' : 'Full screen';
  fsBtn.setAttribute('aria-pressed', String(on));
  document.documentElement.classList.toggle('deck-fs-open', root.classList.contains('is-fs'));
}
async function enterFS() {
  const req = root.requestFullscreen || root.webkitRequestFullscreen;
  try {
    if (req) { await req.call(root); syncFS(); return; }
  } catch (e) { /* not allowed here: fall back */ }
  root.classList.add('is-fs');
  syncFS();
}
async function exitFS() {
  if (nativeFS()) {
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    try { await ex.call(document); } catch (e) { /* ignore */ }
  }
  root.classList.remove('is-fs');
  syncFS();
}

function start() {
  if (started || !root || root.offsetParent === null) return;
  started = true;
  buildThumbs();
  show(0, false);
}

if (root && img) {
  prev.addEventListener('click', () => show(i - 1));
  next.addEventListener('click', () => show(i + 1));
  fsBtn.addEventListener('click', () => (isFS() ? exitFS() : enterFS()));
  document.addEventListener('fullscreenchange', syncFS);
  document.addEventListener('webkitfullscreenchange', syncFS);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && isFS())) { show(i + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(i - 1); e.preventDefault(); }
    else if (e.key === 'Home') { show(0); e.preventDefault(); }
    else if (e.key === 'End') { show(N - 1); e.preventDefault(); }
    else if (e.key === 'Escape' && root.classList.contains('is-fs')) { exitFS(); e.preventDefault(); }
    else if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey) { isFS() ? exitFS() : enterFS(); e.preventDefault(); }
  });
  let x0 = null;
  img.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  img.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
  });
  window.__deck = { count: N, current: () => i, fullscreen: isFS };
  window.addEventListener('hashchange', () => { if (root.offsetParent === null && isFS()) exitFS(); requestAnimationFrame(start); });
  requestAnimationFrame(start);
}
