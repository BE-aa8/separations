// flow-anim.js: motion for the two process diagrams (Overview schematic and the Simulator's live PFD):
// dashed "flow" overlays, the compressor impeller and settling crystals.
// Driven by requestAnimationFrame, like the hero, instead of CSS keyframes on SVG: mobile Safari
// (every iPhone/iPad browser) can leave SVG keyframe animations frozen, while rAF runs everywhere.
// Pauses when a diagram is off screen or on a hidden tab; static when motion is off (device Reduce Motion
// by default, or the header toggle).
const DASH = 12;                                   // stroke-dasharray "2 10" repeats every 12 units
const motionOff = () => document.documentElement.dataset.motion === 'off';   // device Reduce Motion, or the header toggle
const diagrams = [];
const stats = { frames: 0, diagrams: 0 };
window.__flowStats = stats;                        // read-only counters for the browser tests
let raf = 0;
let last = 0;

const num = (v, d) => { const x = parseFloat(v); return Number.isFinite(x) ? x : d; };
const settle = (p) => (p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1);

function register(svg, spec) {
  if (!svg || diagrams.some((d) => d.svg === svg)) return;
  const d = {
    svg, spec, inView: false,
    flows: [...svg.querySelectorAll(spec.flow)].map((el) => ({ el, ph: 0 })),
    spins: [...svg.querySelectorAll(spec.spin)].map((el) => ({ el, ph: 0 })),
    xtals: [...svg.querySelectorAll(spec.xtal)].map((el, i) => ({ el, ph: spec.xtalOffset(el, i) })),
  };
  diagrams.push(d);
  stats.diagrams = diagrams.length;
  // observe the HTML wrapper, not the <svg>: some WebKit builds never report intersections for SVG elements
  const host = svg.parentElement || svg;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { for (const e of es) { d.inView = e.isIntersecting; d.seen = true; } kick(); }).observe(host);
    setTimeout(() => { if (!d.seen) { d.inView = true; kick(); } }, 1500);   // never heard back: assume visible
  } else d.inView = true;
  paintStatic(d);
  kick();
}

// reduced motion (or not yet running): everything at rest, crystals visible mid-way
function paintStatic(d) {
  for (const f of d.flows) f.el.style.strokeDashoffset = '0';
  for (const s of d.spins) s.el.setAttribute('transform', 'rotate(0)');
  for (const x of d.xtals) { x.el.setAttribute('transform', `translate(0 ${d.spec.xtalFrom + d.spec.xtalDist * 0.5})`); x.el.style.opacity = '0.8'; }
}

function active(d) {
  return d.inView && !document.hidden && d.svg.getClientRects().length > 0;
}

function step(now) {
  raf = 0;
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
  last = now;
  let any = false;
  for (const d of diagrams) {
    if (!active(d)) continue;
    any = true;
    if (d.spec.stopped && d.spec.stopped(d.svg)) continue;      // infeasible case: frozen in place
    for (const f of d.flows) {
      const T = d.spec.flowDur(d.svg, f.el);
      if (T > 0) f.ph = (f.ph + dt / T) % 1;
      f.el.style.strokeDashoffset = String((-f.ph * DASH).toFixed(2));
    }
    for (const s of d.spins) {
      const T = d.spec.spinDur(d.svg);
      if (T > 0) s.ph = (s.ph + dt / T) % 1;
      s.el.setAttribute('transform', `rotate(${(s.ph * 360).toFixed(1)})`);
    }
    for (const x of d.xtals) {
      const T = d.spec.xtalDur(d.svg);
      if (T > 0) x.ph = (x.ph + dt / T) % 1;
      x.el.setAttribute('transform', `translate(0 ${(d.spec.xtalFrom + d.spec.xtalDist * x.ph).toFixed(1)})`);
      x.el.style.opacity = settle(x.ph).toFixed(2);
    }
  }
  if (any) stats.frames++;
  if (any && !motionOff()) raf = requestAnimationFrame(step);
  else last = 0;
}

function kick() {
  if (motionOff()) { diagrams.forEach(paintStatic); return; }
  if (!raf) raf = requestAnimationFrame(step);
}

const cssSeconds = (svg, name, d) => num(svg.style.getPropertyValue(name), d);

/** The Simulator's live PFD (speeds come from the CSS variables pfd.js sets from the mass flows). */
export function registerPFD(svg) {
  const XTAL_OFF = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.52];
  register(svg, {
    flow: '.flow', spin: '.impeller .spin', xtal: '.xtal',
    flowDur: (s, el) => cssSeconds(s, `--d-${el.dataset.stream}`, 1.2),
    spinDur: (s) => cssSeconds(s, '--d-imp', 0.8),
    xtalDur: (s) => cssSeconds(s, '--d-xtal', 2.4),
    xtalOffset: (el, i) => XTAL_OFF[i % XTAL_OFF.length],
    xtalFrom: 0, xtalDist: 62,
    stopped: (s) => s.classList.contains('stopped'),
  });
}

/** The Overview schematic (fixed, qualitative speeds in data-dur). */
export function registerOverview(svg) {
  register(svg, {
    flow: '.ov-f', spin: '.ov-spin', xtal: '.ov-xtals rect',
    flowDur: (s, el) => num(el.dataset.dur, 1.2),
    spinDur: () => 1.6,
    xtalDur: () => 3,
    xtalOffset: (el, i) => (i * 0.17) % 1,
    xtalFrom: -6, xtalDist: 56,
  });
}

window.addEventListener('hashchange', () => requestAnimationFrame(kick));
document.addEventListener('visibilitychange', kick);
document.addEventListener('motionchange', kick);
registerOverview(document.querySelector('.ov-diagram svg'));
