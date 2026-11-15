/**
 * Plotly Charts for MVR Crystallizer Explorer
 * Implements plots P1–P8 and P11 per plan-v2-final.md.
 */
import { DATA } from './data.js';
import { solubility, mvr, massBalance, hfg } from './model.js';

const FONT_FAMILY = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const BASE_LAYOUT = {
  font: { family: FONT_FAMILY, size: 12, color: '#334155' },
  paper_bgcolor: 'transparent',
  plot_bgcolor: '#ffffff',
  margin: { l: 55, r: 40, t: 40, b: 45 },
  autosize: true,
  hoverlabel: { font: { family: FONT_FAMILY, size: 12 } },
};

const CONFIG = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
};

/**
 * P1: Solubility & Metastable Zone
 */
export function renderP1(containerId, sim) {
  const T_range = [];
  const s_eq = [];
  const s_meta = [];
  const s_spino = [];

  for (let t = 0; t <= 100; t += 2) {
    T_range.push(t);
    const s = solubility(t);
    s_eq.push(s);
    s_meta.push(s + 1.5); // schematic metastable limit (+1.5 g/100g)
    s_spino.push(s + 3.5); // schematic spinodal limit (+3.5 g/100g)
  }

  const rawPts = DATA.solubility.points;
  const traces = [
    // Metastable zone fill
    {
      x: T_range.concat([...T_range].reverse()),
      y: s_meta.concat([...s_eq].reverse()),
      fill: 'toself',
      fillcolor: 'rgba(56, 189, 248, 0.15)',
      line: { color: 'transparent' },
      name: 'Metastable Zone (Seed Growth)',
      hoverinfo: 'name',
    },
    // Labile zone fill
    {
      x: T_range.concat([...T_range].reverse()),
      y: s_spino.concat([...s_meta].reverse()),
      fill: 'toself',
      fillcolor: 'rgba(239, 68, 68, 0.12)',
      line: { color: 'transparent' },
      name: 'Labile Zone (Spontaneous Nucleation)',
      hoverinfo: 'name',
    },
    // Equilibrium solubility curve (Binodal)
    {
      x: T_range,
      y: s_eq,
      mode: 'lines',
      name: 'Solubility c* (Binodal)',
      line: { color: '#0284c7', width: 2.5 },
    },
    // Sourced data points
    {
      x: rawPts.map(p => p[0]),
      y: rawPts.map(p => p[1]),
      mode: 'markers',
      name: 'Monnin & Dubois (2005)',
      marker: { color: '#0369a1', size: 6, symbol: 'circle' },
    },
    // Schematic Metastable limit line
    {
      x: T_range,
      y: s_meta,
      mode: 'lines',
      name: 'Metastable Limit (ESTIMATE)',
      line: { color: '#f59e0b', width: 1.5, dash: 'dash' },
    },
    // Current operating point
    {
      x: [sim.inputs.T_C],
      y: [sim.s],
      mode: 'markers',
      name: 'Operating Point',
      marker: { color: '#dc2626', size: 11, symbol: 'star' },
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: '<b>P1: LiOH Solubility & Metastable Zones</b>', font: { size: 14 } },
    xaxis: { title: 'Temperature (°C)', range: [0, 100], gridcolor: '#f1f5f9' },
    yaxis: { title: 'Solubility (g LiOH / 100 g H₂O)', range: [10, 24], gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.25, x: 0 },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P2: BPE vs Molality
 */
export function renderP2(containerId, sim) {
  const m_vals = [];
  const bpe_ideal = [];
  const bpe_real = [];

  for (let m = 0; m <= 8; m += 0.2) {
    m_vals.push(m);
    bpe_ideal.push(sim.inputs.activityFactor * sim.inputs.i * sim.Kb * m);
    bpe_real.push(sim.phi * sim.inputs.i * sim.Kb * m);
  }

  const traces = [
    {
      x: m_vals,
      y: bpe_ideal,
      mode: 'lines',
      name: `Ideal (i=2, a=${sim.inputs.activityFactor.toFixed(2)})`,
      line: { color: '#94a3b8', width: 2, dash: 'dash' },
    },
    {
      x: m_vals,
      y: bpe_real,
      mode: 'lines',
      name: `Real (Osmotic φ_sat=${sim.phi.toFixed(3)})`,
      line: { color: '#0284c7', width: 2.5 },
    },
    {
      x: [sim.m],
      y: [sim.BPE],
      mode: 'markers',
      name: 'Current Saturation',
      marker: { color: '#dc2626', size: 11, symbol: 'star' },
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: '<b>P2: Boiling Point Elevation vs Molality</b>', font: { size: 14 } },
    xaxis: { title: 'Molality (mol LiOH / kg H₂O)', range: [0, 8], gridcolor: '#f1f5f9' },
    yaxis: { title: 'Boiling Point Elevation (K)', range: [0, 7], gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.25, x: 0 },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P3: Lift Breakdown
 */
export function renderP3(containerId, sim) {
  const bpe = sim.BPE;
  const dtHeater = sim.inputs.dT_heater;
  const totalLift = sim.mvr.lift;
  const bpePct = ((bpe / totalLift) * 100).toFixed(1);

  const traces = [
    {
      x: ['Compressor Lift'],
      y: [bpe],
      name: `BPE: ${bpe.toFixed(2)} K (${bpePct}%)`,
      type: 'bar',
      marker: { color: '#f59e0b' },
    },
    {
      x: ['Compressor Lift'],
      y: [dtHeater],
      name: `Heater ΔT: ${dtHeater.toFixed(1)} K`,
      type: 'bar',
      marker: { color: '#0284c7' },
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    barmode: 'stack',
    title: { text: `<b>P3: Compressor Lift Breakdown (${totalLift.toFixed(2)} K Total)</b>`, font: { size: 14 } },
    yaxis: { title: 'Temperature Lift (K)', gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.2, x: 0 },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P4: Compressor Power & Pressure Ratio vs BPE
 */
export function renderP4(containerId, sim) {
  const bpe_arr = [];
  const kwh_arr = [];
  const r_arr = [];

  for (let b = 0; b <= 15; b += 0.5) {
    bpe_arr.push(b);
    const m = mvr({
      V: 1000,
      Tb_C: sim.inputs.T_C,
      BPE: b,
      dT_heater: sim.inputs.dT_heater,
      etaIs: sim.inputs.etaIs,
      etaMotor: sim.inputs.etaMotor,
      gamma: sim.inputs.gamma,
    });
    kwh_arr.push(m.kWh_per_t);
    r_arr.push(m.r);
  }

  const traces = [
    {
      x: bpe_arr,
      y: kwh_arr,
      mode: 'lines',
      name: 'Electricity (kWh/t vapor)',
      line: { color: '#2563eb', width: 2.5 },
      yaxis: 'y1',
    },
    {
      x: bpe_arr,
      y: r_arr,
      mode: 'lines',
      name: 'Pressure Ratio r',
      line: { color: '#ea580c', width: 2, dash: 'dot' },
      yaxis: 'y2',
    },
    {
      x: [sim.BPE],
      y: [sim.mvr.kWh_per_t],
      mode: 'markers',
      name: 'Current Power',
      marker: { color: '#2563eb', size: 10, symbol: 'star' },
      yaxis: 'y1',
    },
    {
      x: [sim.BPE],
      y: [sim.mvr.r],
      mode: 'markers',
      name: 'Current Ratio',
      marker: { color: '#ea580c', size: 10, symbol: 'diamond' },
      yaxis: 'y2',
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: '<b>P4: Specific Energy & Compression Ratio vs BPE</b>', font: { size: 14 } },
    xaxis: { title: 'Boiling Point Elevation (K)', gridcolor: '#f1f5f9' },
    yaxis: { title: 'Specific Electricity (kWh/t)', titlefont: { color: '#2563eb' }, tickfont: { color: '#2563eb' }, gridcolor: '#f1f5f9' },
    yaxis2: {
      title: 'Pressure Ratio r',
      titlefont: { color: '#ea580c' },
      tickfont: { color: '#ea580c' },
      overlaying: 'y',
      side: 'right',
    },
    legend: { orientation: 'h', y: -0.25, x: 0 },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P5: Primary Energy & Operating Cost Comparison
 */
export function renderP5(containerId, sim) {
  const categories = ['1 Effect', '3 Effects', '5 Effects', 'MVR'];

  // Operating costs ($/t evaporated)
  const opCosts = [
    sim.econ[1]?.cost_ME_per_t ?? 0,
    sim.econ[3]?.cost_ME_per_t ?? 0,
    sim.econ[5]?.cost_ME_per_t ?? 0,
    sim.mvr.kWh_per_t * sim.inputs.ce,
  ];

  // Primary energy (MJ/t evaporated)
  // Steam fuel: hfg(Ts) / (0.85 * economy) MJ/t
  const lamS = hfg(sim.inputs.Ts_C);
  const boilerEta = DATA.prices.boilerEfficiency.value; // 0.85
  const gridHeatRateMJ = 8.209; // 7781 Btu/kWh * 1.055056e-3 MJ/Btu

  const primEnergy = [
    lamS / (boilerEta * (sim.effects[1]?.economy ?? 1)),
    lamS / (boilerEta * (sim.effects[3]?.economy ?? 3)),
    lamS / (boilerEta * (sim.effects[5]?.economy ?? 5)),
    sim.mvr.kWh_per_t * gridHeatRateMJ,
  ];

  const traces = [
    {
      x: categories,
      y: opCosts,
      name: 'Operating Cost ($/t)',
      type: 'bar',
      marker: { color: '#0284c7' },
      yaxis: 'y1',
    },
    {
      x: categories,
      y: primEnergy,
      name: 'Primary Energy (MJ/t fuel)',
      type: 'bar',
      marker: { color: '#f97316' },
      yaxis: 'y2',
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    barmode: 'group',
    title: { text: '<b>P5: Multi-Effect vs MVR Energy & Cost Comparison</b>', font: { size: 14 } },
    yaxis: { title: 'Operating Cost ($/t evaporated)', titlefont: { color: '#0284c7' }, gridcolor: '#f1f5f9' },
    yaxis2: {
      title: 'Primary Fuel Energy (MJ/t)',
      titlefont: { color: '#f97316' },
      overlaying: 'y',
      side: 'right',
    },
    legend: { orientation: 'h', y: -0.22, x: 0 },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P6: Economic Crossover Map
 */
export function renderP6(containerId, sim) {
  const ce_range = [0, 0.05, 0.10, 0.15, 0.20, 0.25];
  const kwh = sim.mvr.kWh_per_t;

  // Crossover lines: cs = economy * kWh * ce
  const cs_1 = ce_range.map(ce => (sim.effects[1]?.economy ?? 1) * kwh * ce);
  const cs_3 = ce_range.map(ce => (sim.effects[3]?.economy ?? 2.8) * kwh * ce);
  const cs_5 = ce_range.map(ce => (sim.effects[5]?.economy ?? 4.65) * kwh * ce);

  const traces = [
    {
      x: ce_range,
      y: cs_1,
      mode: 'lines',
      name: 'vs 1-Effect Crossover',
      line: { color: '#94a3b8', dash: 'dot', width: 2 },
    },
    {
      x: ce_range,
      y: cs_3,
      mode: 'lines',
      name: 'vs 3-Effect Crossover',
      line: { color: '#0284c7', width: 2.5 },
    },
    {
      x: ce_range,
      y: cs_5,
      mode: 'lines',
      name: 'vs 5-Effect Crossover',
      line: { color: '#8b5cf6', width: 2 },
    },
    // Texas Industrial Benchmark (EIA)
    {
      x: [0.0721],
      y: [7.33],
      mode: 'markers+text',
      name: 'Texas Industrial (EIA)',
      text: ['Texas Benchmark'],
      textposition: 'top right',
      marker: { color: '#059669', size: 10, symbol: 'square' },
    },
    // Current operating point
    {
      x: [sim.inputs.ce],
      y: [sim.inputs.cs],
      mode: 'markers+text',
      name: 'Current Utilities',
      text: ['Current Operating Point'],
      textposition: 'bottom right',
      marker: { color: '#dc2626', size: 12, symbol: 'star' },
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: '<b>P6: Economic Utility Crossover Map</b>', font: { size: 14 } },
    xaxis: { title: 'Electricity Price ($/kWh)', range: [0, 0.25], gridcolor: '#f1f5f9' },
    yaxis: { title: 'Steam Price ($/t)', range: [0, 30], gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.25, x: 0 },
    annotations: [
      {
        x: 0.04,
        y: 20,
        text: '<b>MVR Cheaper</b><br>(High Steam / Cheap Power)',
        showarrow: false,
        font: { size: 11, color: '#0369a1' },
      },
      {
        x: 0.18,
        y: 6,
        text: '<b>Steam Cheaper</b><br>(Expensive Power)',
        showarrow: false,
        font: { size: 11, color: '#64748b' },
      },
    ],
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P7: Purge Trade-Off (Yield vs Purity)
 */
export function renderP7(containerId, sim) {
  const p_arr = [];
  const yield_arr = [];
  const impurity_arr = [];

  for (let p = 0.005; p <= 0.20; p += 0.005) {
    p_arr.push(p);
    const mb = massBalance({
      F: sim.inputs.F,
      xF: sim.inputs.xF,
      zF: sim.inputs.zF,
      T_C: sim.inputs.T_C,
      purgeRatio: p,
      epsilon: sim.inputs.epsilon,
    });
    yield_arr.push(mb.liYield != null ? mb.liYield * 100 : null);
    impurity_arr.push(mb.productImpurity_ppm);
  }

  const traces = [
    {
      x: p_arr,
      y: yield_arr,
      mode: 'lines',
      name: 'Lithium Recovery Yield (%)',
      line: { color: '#16a34a', width: 2.5 },
      yaxis: 'y1',
    },
    {
      x: p_arr,
      y: impurity_arr,
      mode: 'lines',
      name: 'Product Impurity (ppm Na)',
      line: { color: '#dc2626', width: 2, dash: 'dash' },
      yaxis: 'y2',
    },
    {
      x: [sim.inputs.purgeRatio],
      y: [sim.mass.liYield != null ? sim.mass.liYield * 100 : null],
      mode: 'markers',
      name: 'Current Yield',
      marker: { color: '#16a34a', size: 10, symbol: 'star' },
      yaxis: 'y1',
    },
    {
      x: [sim.inputs.purgeRatio],
      y: [sim.mass.productImpurity_ppm],
      mode: 'markers',
      name: 'Current Impurity',
      marker: { color: '#dc2626', size: 10, symbol: 'diamond' },
      yaxis: 'y2',
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: '<b>P7: Mother Liquor Purge Trade-Off</b>', font: { size: 14 } },
    xaxis: { title: 'Purge Ratio p = P / F', range: [0, 0.20], gridcolor: '#f1f5f9' },
    yaxis: { title: 'Lithium Recovery Yield (%)', range: [70, 100], titlefont: { color: '#16a34a' }, tickfont: { color: '#16a34a' }, gridcolor: '#f1f5f9' },
    yaxis2: {
      title: 'Impurity in Crystals (ppm Na)',
      titlefont: { color: '#dc2626' },
      tickfont: { color: '#dc2626' },
      overlaying: 'y',
      side: 'right',
    },
    legend: { orientation: 'h', y: -0.25, x: 0 },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P8: Mass Flow Distribution
 */
export function renderP8(containerId, sim) {
  const categories = ['Vapor (V)', 'Hydrate Crystals (C)', 'Purge Liquor (P)'];
  const flows = [sim.mass.V ?? 0, sim.mass.C ?? 0, sim.mass.P ?? 0];
  const total = flows.reduce((a, b) => a + b, 0) || 1;
  const pcts = flows.map(f => ((f / total) * 100).toFixed(1));

  const traces = [
    {
      x: categories,
      y: flows,
      text: flows.map((f, i) => `${Math.round(f).toLocaleString()} kg/h (${pcts[i]}%)`),
      textposition: 'auto',
      type: 'bar',
      marker: {
        color: ['#0284c7', '#16a34a', '#b91c1c'],
      },
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: `<b>P8: Plant Mass Flow Split (Feed F = ${Math.round(sim.inputs.F).toLocaleString()} kg/h)</b>`, font: { size: 14 } },
    yaxis: { title: 'Mass Flow (kg/h)', gridcolor: '#f1f5f9' },
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * P11: Multi-Effect Feasibility Map
 */
export function renderP11(containerId, sim) {
  const N_vals = [1, 2, 3, 4, 5, 6, 7];
  const dT_vals = [];
  const colors = [];

  for (const n of N_vals) {
    const dt = (sim.inputs.Ts_C - sim.inputs.Tlast_C - n * sim.BPE) / n;
    dT_vals.push(dt);
    colors.push(dt >= sim.inputs.dTmin ? '#16a34a' : '#dc2626');
  }

  const traces = [
    {
      x: N_vals,
      y: dT_vals,
      mode: 'lines+markers',
      name: 'Available ΔT / effect',
      line: { color: '#0284c7', width: 2 },
      marker: { color: colors, size: 9 },
    },
    {
      x: [0.5, 7.5],
      y: [sim.inputs.dTmin, sim.inputs.dTmin],
      mode: 'lines',
      name: `Minimum ΔT (${sim.inputs.dTmin} K)`,
      line: { color: '#dc2626', width: 2, dash: 'dash' },
    },
    {
      x: [sim.inputs.N],
      y: [(sim.inputs.Ts_C - sim.inputs.Tlast_C - sim.inputs.N * sim.BPE) / sim.inputs.N],
      mode: 'markers',
      name: `Selected N = ${sim.inputs.N}`,
      marker: { color: '#eab308', size: 13, symbol: 'star' },
    },
  ];

  const layout = {
    ...BASE_LAYOUT,
    title: { text: '<b>P11: Multi-Effect Temperature Driving Force Feasibility</b>', font: { size: 14 } },
    xaxis: { title: 'Number of Effects N', dtick: 1, range: [0.5, 7.5], gridcolor: '#f1f5f9' },
    yaxis: { title: 'Available ΔT per Effect (K)', range: [0, 75], gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.22, x: 0 },
    annotations: [
      {
        x: 6,
        y: sim.inputs.dTmin + 3,
        text: 'Feasible Region (ΔT ≥ ΔT_min)',
        showarrow: false,
        font: { size: 11, color: '#16a34a' },
      },
    ],
  };

  Plotly.react(containerId, traces, layout, CONFIG);
}

/**
 * Updates or renders all 9 plots.
 */
export function updateAllCharts(sim) {
  renderP1('plot-p1', sim);
  renderP2('plot-p2', sim);
  renderP3('plot-p3', sim);
  renderP4('plot-p4', sim);
  renderP5('plot-p5', sim);
  renderP6('plot-p6', sim);
  renderP7('plot-p7', sim);
  renderP8('plot-p8', sim);
  renderP11('plot-p11', sim);
}
