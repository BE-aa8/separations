// pfd.js: live process flow diagram (inline SVG). Streams are color-coded by fluid and carry
// animated "flow" overlays whose speed follows the simulated mass flows; the compressor impeller
// spins with electric power and crystals settle in the crystallizer at a rate set by C.
// Units are clickable (data-unit), handled in ui.js. Colors come from CSS variables (themes).
// Text IDs pfd-* and the six data-unit groups are part of the test contract: keep them.

const STREAMS = [
  // key, label for legend, path
  ['feed', 'Feed brine', 'M20,150 L266,150'],
  ['slurry', 'Slurry to centrifuge', 'M300,222 L300,246'],
  ['vapor', 'Vapor (low pressure)', 'M330,70 L330,60 L476,60'],
  ['hot', 'Compressed vapor (hot)', 'M542,65 L595,65 L595,146'],
  ['circ', 'Circulating liquor', 'M548,200 L394,200'],
  ['cond', 'Condensate', 'M647,215 L745,215'],
  ['xtal', 'Crystals (product)', 'M322,268 L468,268'],
  ['purge', 'Purge (mother liquor)', 'M248,268 L142,268'],
];
const LEGEND = ['feed', 'vapor', 'hot', 'cond', 'circ', 'xtal', 'purge'];

const marker = (k) => `<marker id="arr-${k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk mk-${k}"/></marker>`;
const stream = ([k, , d]) => `<path class="s st-${k}" d="${d}" marker-end="url(#arr-${k})"/><path class="flow fl-${k}" data-stream="${k}" d="${d}"/>`;

const SVG = `
<svg viewBox="0 0 760 300" role="img" aria-label="Process flow diagram of an MVR evaporative crystallizer, with animated streams" font-family="Inter, system-ui, sans-serif" font-size="12">
  <defs>
    ${STREAMS.map(([k]) => marker(k)).join('')}
    <linearGradient id="heat-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="hg0"/><stop offset="1" class="hg1"/>
    </linearGradient>
    <clipPath id="clip-body"><rect x="272" y="72" width="116" height="146" rx="28"/></clipPath>
  </defs>
  ${STREAMS.map(stream).join('\n  ')}

  <g class="unit" data-unit="crystallizer" role="button" tabindex="0" aria-pressed="false" aria-label="Crystallizer: show equations">
  <!-- crystallizer body -->
  <rect class="u" x="270" y="70" width="120" height="150" rx="30"/>
  <rect class="liquor" x="272" y="150" width="116" height="68" clip-path="url(#clip-body)"/>
  <g class="xtals" clip-path="url(#clip-body)">
    <rect class="xtal" x="292" y="150" width="5" height="5"/><rect class="xtal" x="312" y="150" width="4" height="4"/>
    <rect class="xtal" x="338" y="150" width="5" height="5"/><rect class="xtal" x="356" y="150" width="4" height="4"/>
    <rect class="xtal" x="302" y="150" width="4" height="4"/><rect class="xtal" x="347" y="150" width="5" height="5"/>
    <rect class="xtal" x="324" y="150" width="4" height="4"/><rect class="xtal" x="368" y="150" width="4" height="4"/>
  </g>
  <text class="l k" x="330" y="112" text-anchor="middle">Crystallizer</text>
  <text class="l" x="330" y="128" text-anchor="middle" id="pfd-Tb">T_b</text>
  <text class="n" x="330" y="143" text-anchor="middle" id="pfd-P1">P₁</text>
  </g>

  <g class="unit" data-unit="compressor" role="button" tabindex="0" aria-pressed="false" aria-label="Compressor: show equations">
  <!-- compressor -->
  <path class="u" d="M478,30 L540,45 L540,85 L478,100 z"/>
  <g class="impeller" transform="translate(507 65)"><g class="spin"><circle r="11" class="imp-ring"/><path class="imp-blade" d="M0,-10 L0,10 M-10,0 L10,0 M-7,-7 L7,7 M-7,7 L7,-7"/></g></g>
  <text class="l k" x="509" y="22" text-anchor="middle">Compressor</text>
  <text class="n" x="470" y="118" id="pfd-r">r</text>
  <text class="n" x="470" y="133" id="pfd-W">W</text>
  </g>

  <g class="unit" data-unit="heater" role="button" tabindex="0" aria-pressed="false" aria-label="Heater: show equations">
  <!-- heater -->
  <rect class="u heater" x="550" y="150" width="95" height="80" rx="6"/>
  <path class="coil" d="M560,175 h75 M560,190 h75 M560,205 h75"/>
  <text class="l k" x="597" y="168" text-anchor="middle">Heater</text>
  <text class="n" x="597" y="224" text-anchor="middle" id="pfd-Tc">T_c</text>
  </g>

  <g class="unit" data-unit="centrifuge" role="button" tabindex="0" aria-pressed="false" aria-label="Centrifuge: show equations">
  <!-- centrifuge -->
  <rect class="u" x="250" y="250" width="70" height="36" rx="6"/>
  <text class="l k" x="285" y="273" text-anchor="middle">Centrifuge</text>
  </g>

  <!-- stream labels -->
  <g class="unit" data-unit="feed" role="button" tabindex="0" aria-pressed="false" aria-label="Feed: show equations"><rect class="hit" x="16" y="126" width="150" height="62"/>
  <text class="l k" x="22" y="140">Feed</text>
  <text class="n" x="22" y="168" id="pfd-F">F</text>
  <text class="n" x="22" y="183" id="pfd-xF">x_F</text></g>
  <text class="n" x="345" y="52" id="pfd-V">V</text>
  <text class="n" x="604" y="110" id="pfd-T2">T₂</text>
  <text class="n" x="471" y="192" text-anchor="middle">circulating liquor</text>
  <text class="n" x="652" y="232">condensate out</text>
  <text class="l k" x="480" y="265">Crystals</text>
  <text class="n" x="480" y="281" id="pfd-C">C</text>
  <g class="unit" data-unit="purge" role="button" tabindex="0" aria-pressed="false" aria-label="Purge: show equations"><rect class="hit" x="24" y="250" width="110" height="38"/>
  <text class="l k" x="30" y="265">Purge</text>
  <text class="n" x="30" y="281" id="pfd-P">P</text></g>
  <text class="n" x="150" y="258">mother liquor</text>
</svg>
<div class="pfd-legend" aria-label="Stream colors">${LEGEND.map((k) => `<span class="lg"><i class="sw sw-${k}"></i>${STREAMS.find((s) => s[0] === k)[1]}</span>`).join('')}<span class="lg lg-note">Flow speed ∝ √(mass flow)</span></div>`;

export function mountPFD(el) { el.innerHTML = SVG; }

const F_REF = 10000;                       // kg/h, design feed (hand-calc case): sets the speed scale
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const dur = (flow) => (flow > 0 ? clamp(1.2 / Math.sqrt(flow / F_REF), 0.25, 8) : 0);

export function updatePFD(out) {
  const set = (id, t) => { const n = document.getElementById(id); if (n) n.textContent = t; };
  const kg = (v) => (v == null ? '—' : `${Math.round(v).toLocaleString('en-US')} kg/h`);
  const inp = out.inputs, mb = out.mass, mv = out.mvr;
  set('pfd-F', `F = ${kg(inp.F)}`);
  set('pfd-xF', `x_F = ${(inp.xF * 100).toFixed(1)} wt % LiOH`);
  set('pfd-Tb', `T_b = ${inp.T_C.toFixed(1)} °C`);
  set('pfd-V', `vapor V = ${kg(mb.V)}`);
  set('pfd-C', `C = ${kg(mb.C)} LiOH·H₂O`);
  set('pfd-P', `P = ${kg(mb.P)}`);
  if (mv) {
    set('pfd-P1', `P₁ = ${mv.P1.toFixed(2)} kPa`);
    set('pfd-r', `r = ${mv.r.toFixed(3)}`);
    set('pfd-W', `W = ${mv.Welec_kW == null ? '—' : mv.Welec_kW.toFixed(0) + ' kW'}`);
    set('pfd-T2', `T₂ = ${mv.T2_C.toFixed(1)} °C`);
    set('pfd-Tc', `T_c = ${mv.Tc_C.toFixed(1)} °C`);
  }

  // ---- animation speeds from the live mass flows (presentation only) ----
  const svg = document.querySelector('#pfd svg');
  if (!svg) return;
  const ok = !!(mb && mb.feasible && mv);
  svg.classList.toggle('stopped', !ok);
  if (!ok) return;
  const flows = {
    feed: inp.F, slurry: mb.C + mb.P, vapor: mb.V, hot: mb.V, cond: mb.V, xtal: mb.C, purge: mb.P,
    circ: 4 * inp.F,                        // recirculation is not modelled: fixed, qualitative speed
  };
  for (const [k, f] of Object.entries(flows)) svg.style.setProperty(`--d-${k}`, `${dur(f).toFixed(2)}s`);
  const W = mv.Welec_kW || 0;
  svg.style.setProperty('--d-imp', `${(W > 0 ? clamp(0.8 * 248 / W, 0.15, 4) : 0).toFixed(2)}s`);
  svg.style.setProperty('--d-xtal', `${(mb.C > 0 ? clamp(2.4 * Math.sqrt(942 / mb.C), 0.8, 8) : 0).toFixed(2)}s`);
  svg.dataset.flowVapor = dur(flows.vapor).toFixed(2);   // read by the browser test
  svg.dataset.flowPurge = dur(flows.purge).toFixed(2);
}
