// deck.js: the presentation slides on the Video & Transcript tab (images rendered from the .pptx).
// One slide at a time: buttons, arrow keys (when the viewer has focus), swipe on touch screens.
// Only the current and next slide images are requested, and nothing loads until the Video tab is opened.
const TITLES = [
  'MVR Crystallizer Explorer: title',
  'The project in three numbers',
  'Batteries need lithium hydroxide, refined in the US',
  'Boiling is the expensive step: the MVR process loop',
  'Three models, one plan, tests first: the AI workflow',
  'Six lessons: overview',
  'Lesson 1: Salt makes the compressor work harder',
  'Six lessons: lesson 2 next',
  'Lesson 2: MVR only pays for the lift',
  'Six lessons: lesson 3 next',
  "Lesson 3: Cheapest to run isn't always MVR",
  'Six lessons: lesson 4 next',
  'Lesson 4: The purge is a dial, yield vs purity',
  'Six lessons: lesson 5 next',
  'Lesson 5: One model planned, another critiqued',
  'Six lessons: lesson 6 next',
  'Lesson 6: Two builds, same tests',
  'Recap of the six lessons',
  "Live demo: let's run it",
  'Conclusions',
  'Try it yourself: site, sources, models, tools and contributions',
];
const N = TITLES.length;
const src = (i) => `slides/s-${String(i + 1).padStart(2, '0')}.jpg`;

const root = document.getElementById('deck-viewer');
const img = document.getElementById('deck-img');
const count = document.getElementById('deck-count');
const prev = document.getElementById('deck-prev');
const next = document.getElementById('deck-next');
let i = 0;
let started = false;

function show(k) {
  i = Math.max(0, Math.min(N - 1, k));
  img.src = src(i);
  img.alt = `Slide ${i + 1} of ${N}: ${TITLES[i]}`;
  count.textContent = `${i + 1} / ${N}`;
  prev.disabled = i === 0;
  next.disabled = i === N - 1;
  if (i + 1 < N) { const pre = new Image(); pre.src = src(i + 1); }   // warm the next slide
}

function start() {
  if (started || !root || root.offsetParent === null) return;
  started = true;
  show(0);
}

if (root && img) {
  prev.addEventListener('click', () => show(i - 1));
  next.addEventListener('click', () => show(i + 1));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { show(i + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(i - 1); e.preventDefault(); }
    else if (e.key === 'Home') { show(0); e.preventDefault(); }
    else if (e.key === 'End') { show(N - 1); e.preventDefault(); }
  });
  let x0 = null;
  img.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  img.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
  });
  window.__deck = { count: N, current: () => i };
  window.addEventListener('hashchange', () => requestAnimationFrame(start));
  requestAnimationFrame(start);
}
