// app.js: router, theme + motion toggles, equations, references, and the example simulator.
import { DATA } from './data.js';
import { fopdtStep, t63, finalValue } from './model.js';

const $ = (id) => document.getElementById(id);
const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

// ---------- router (hash tabs; in-page jumps must be buttons, not #links) ----------
const TABS = [...document.querySelectorAll('section.tab')].map((s) => s.dataset.tab);
const currentTab = () => { const h = location.hash.slice(1); return TABS.includes(h) ? h : TABS[0]; };
function route() {
  const t = currentTab();
  document.querySelectorAll('section.tab').forEach((s) => { s.hidden = s.dataset.tab !== t; });
  document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === t));
  if (t === 'simulator') requestAnimationFrame(update);   // draw charts only when visible
}
document.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => {
  const el = $(b.dataset.jump);
  if (el) el.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth' });
}));

// ---------- theme and motion toggles (remembered; default = device setting) ----------
function toggle(btnId, attr, values, labels) {
  const b = $(btnId);
  const sync = () => { const on = document.documentElement.getAttribute(attr) === values[0]; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', labels[on ? 0 : 1]); };
  b.addEventListener('click', () => {
    const next = document.documentElement.getAttribute(attr) === values[0] ? values[1] : values[0];
    document.documentElement.setAttribute(attr, next);
    try { localStorage.setItem(attr.replace('data-', ''), next); } catch (e) { /* private mode */ }
    sync();
    document.dispatchEvent(new Event(attr.replace('data-', '') + 'change'));
  });
  sync();
}
toggle('motion-toggle', 'data-motion', ['on', 'off'], ['Turn animations off', 'Turn animations on']);
toggle('theme-toggle', 'data-theme', ['dark', 'light'], ['Switch to light mode', 'Switch to dark mode']);
document.addEventListener('themechange', () => { if (currentTab() === 'simulator') update(); });

// ---------- references and citations, generated from data.js ----------
const ids = Object.keys(DATA.sources);
$('source-list').innerHTML = ids.map((id) => { const s = DATA.sources[id]; return `<li id="src-${id}">${s.citation}${s.url ? ` <a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>` : ''}</li>`; }).join('');
document.querySelectorAll('.cite[data-src]').forEach((el) => { const n = ids.indexOf(el.dataset.src) + 1; el.innerHTML = n ? `<a href="#references">[${n}]</a>` : ''; });

// ---------- equations ----------
function renderTex() {
  if (!window.katex) return;
  document.querySelectorAll('[data-tex]').forEach((el) => { window.katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false }); });
}

// ---------- example simulator: sliders -> model -> results + chart ----------
const inputs = { K: $('in-K'), tau: $('in-tau'), theta: $('in-theta') };
const state = () => ({ K: +inputs.K.value, tau: +inputs.tau.value, theta: +inputs.theta.value });
function update() {
  const s = state();
  $('out-K').textContent = fmt(s.K, 1); $('out-tau').textContent = `${fmt(s.tau, 1)} min`; $('out-theta').textContent = `${fmt(s.theta, 1)} min`;
  $('kpi-t63').textContent = `${fmt(t63(s), 1)} min`;
  $('kpi-yinf').textContent = fmt(finalValue(s), 2);
  if (!window.Plotly || $('p-step').offsetParent === null) return;
  const tEnd = Math.max(20, 5 * s.tau + s.theta);
  const t = Array.from({ length: 201 }, (_, i) => (tEnd * i) / 200);
  const dark = document.documentElement.dataset.theme === 'dark';
  const fg = dark ? '#E4E8E0' : '#171B19', grid = dark ? '#26302A' : '#E3E6E0', bg = dark ? '#141A17' : '#FFFFFF';
  window.Plotly.react('p-step', [{ x: t, y: t.map((x) => fopdtStep(s, x)), mode: 'lines', line: { color: dark ? '#B5CC4E' : '#4F6A0F', width: 3 }, name: 'y(t)' }],
    { margin: { l: 56, r: 16, t: 10, b: 46 }, paper_bgcolor: bg, plot_bgcolor: bg, font: { color: fg }, showlegend: false,
      xaxis: { title: { text: 't (min)' }, gridcolor: grid }, yaxis: { title: { text: 'y' }, gridcolor: grid } }, { responsive: true, displayModeBar: false });
}
Object.values(inputs).forEach((el) => el.addEventListener('input', update));

// ---------- live numbers in the text ----------
function renderLive() {
  const ex = { K: DATA.example.K.value, tau: DATA.example.tau.value, theta: DATA.example.theta.value };
  const live = { tau: fmt(ex.tau, 1), theta: fmt(ex.theta, 1), t63: fmt(t63(ex), 1) };
  document.querySelectorAll('[data-live]').forEach((el) => { el.textContent = live[el.dataset.live] ?? '—'; });
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => { renderTex(); update(); });   // KaTeX/Plotly are deferred scripts
renderLive();
route();
update();
