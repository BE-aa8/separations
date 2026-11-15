/**
 * UI Orchestration & Event Handling
 * Manages tab switching, input synchronization, presets,
 * KaTeX rendering, card disclosure expanders, and simulation updates.
 */
import { DATA } from './data.js';
import { simulate, DEFAULT_INPUTS } from './model.js';
import { updateAllCharts } from './charts.js';
import { renderPFD, updatePFD } from './pfd.js';

// Current active simulation state
let currentSim = null;

// Presets definition adhering strictly to plan & user answers
const PRESETS = {
  handcalc: {
    label: 'Hand-calc case',
    inputs: { ...DEFAULT_INPUTS },
  },
  cheapElec: {
    label: 'Cheap electricity (Texas)',
    inputs: {
      ...DEFAULT_INPUTS,
      ce: 0.0721, // EIA Texas industrial (data.js)
      cs: 7.33,   // EIA Texas gas estimate (data.js)
    },
  },
  expensiveElec: {
    label: 'Expensive electricity',
    inputs: {
      ...DEFAULT_INPUTS,
      ce: 0.25,   // top of plan slider range
      cs: 7.33,
    },
  },
  highBpe: {
    label: 'High BPE',
    inputs: {
      ...DEFAULT_INPUTS,
      xF: 0.09,
      T_C: 70,
      purgeRatio: 0.02,
    },
  },
};

/**
 * Reads all input values from UI controls.
 */
function readInputs() {
  const getNum = (id, fallback) => {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
  };

  const useOsmoticEl = document.getElementById('input-useOsmotic');
  const useOsmotic = useOsmoticEl ? useOsmoticEl.checked : true;

  return {
    F: getNum('input-F', DEFAULT_INPUTS.F),
    xF: getNum('input-xF', DEFAULT_INPUTS.xF),
    zF: getNum('input-zF', DEFAULT_INPUTS.zF),
    T_C: getNum('input-T_C', DEFAULT_INPUTS.T_C),
    purgeRatio: getNum('input-purgeRatio', DEFAULT_INPUTS.purgeRatio),
    epsilon: getNum('input-epsilon', DEFAULT_INPUTS.epsilon),
    i: 2,
    useOsmotic,
    activityFactor: getNum('input-activityFactor', DEFAULT_INPUTS.activityFactor),
    dT_heater: getNum('input-dT_heater', DEFAULT_INPUTS.dT_heater),
    etaIs: getNum('input-etaIs', DEFAULT_INPUTS.etaIs),
    etaMotor: getNum('input-etaMotor', DEFAULT_INPUTS.etaMotor),
    gamma: 1.33,
    Ts_C: getNum('input-Ts_C', DEFAULT_INPUTS.Ts_C),
    Tlast_C: getNum('input-Tlast_C', DEFAULT_INPUTS.Tlast_C),
    dTmin: getNum('input-dTmin', DEFAULT_INPUTS.dTmin),
    N: Math.round(getNum('input-N', DEFAULT_INPUTS.N)),
    ce: getNum('input-ce', DEFAULT_INPUTS.ce),
    cs: getNum('input-cs', DEFAULT_INPUTS.cs),
    hours: getNum('input-hours', DEFAULT_INPUTS.hours),
  };
}

/**
 * Sets UI input controls to given values.
 */
function setInputs(inp) {
  const sync = (id, val) => {
    const rangeEl = document.getElementById(`${id}-range`);
    const numEl = document.getElementById(id);
    if (rangeEl) rangeEl.value = val;
    if (numEl) numEl.value = val;
  };

  sync('input-F', inp.F);
  sync('input-xF', inp.xF);
  sync('input-zF', inp.zF);
  sync('input-T_C', inp.T_C);
  sync('input-purgeRatio', inp.purgeRatio);
  sync('input-epsilon', inp.epsilon);
  sync('input-activityFactor', inp.activityFactor);
  sync('input-dT_heater', inp.dT_heater);
  sync('input-etaIs', inp.etaIs);
  sync('input-etaMotor', inp.etaMotor);
  sync('input-Ts_C', inp.Ts_C);
  sync('input-Tlast_C', inp.Tlast_C);
  sync('input-dTmin', inp.dTmin);
  sync('input-N', inp.N);
  sync('input-ce', inp.ce);
  sync('input-cs', inp.cs);
  sync('input-hours', inp.hours);

  const osmoticEl = document.getElementById('input-useOsmotic');
  if (osmoticEl) {
    osmoticEl.checked = inp.useOsmotic;
  }

  const actContainer = document.getElementById('container-activityFactor');
  if (actContainer) {
    actContainer.style.display = inp.useOsmotic ? 'none' : 'block';
  }
}

/**
 * Safe number formatting: avoids NaN, null, undefined, or Infinity.
 */
function fmt(val, digits = 1, unit = '') {
  if (val == null || !Number.isFinite(val)) return '—';
  const s = val.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return unit ? `${s} ${unit}` : s;
}

/**
 * Updates result cards across the Simulator tab.
 */
function updateCards(sim) {
  const setText = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  const { mass, mvr, effects, econ, inputs, warnings } = sim;

  // Warning Banner
  const alertEl = document.getElementById('simulator-alert');
  if (alertEl) {
    if (warnings.length > 0) {
      alertEl.style.display = 'block';
      alertEl.innerHTML = `<strong>Operational Feasibility Warning:</strong><ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul>`;
    } else {
      alertEl.style.display = 'none';
      alertEl.innerHTML = '';
    }
  }

  // Mass Balance Cards
  setText('val-mass-F', fmt(inputs.F, 0, 'kg/h'));
  setText('val-mass-V', fmt(mass.V, 1, 'kg/h'));
  setText('val-mass-C', fmt(mass.C, 1, 'kg/h'));
  setText('val-mass-P', fmt(mass.P, 1, 'kg/h'));
  setText('val-mass-xL', fmt(mass.xL * 100, 2, 'wt% LiOH'));
  setText('val-mass-zML', fmt(mass.zML * 100, 2, 'wt% Na'));
  setText('val-mass-yield', fmt(mass.liYield != null ? mass.liYield * 100 : null, 1, '%'));
  setText('val-mass-impurity', fmt(mass.productImpurity_ppm, 0, 'ppm Na'));
  setText('val-mass-closure', fmt(mass.closureError, 4, 'kg/h'));

  // Thermodynamics & BPE Cards
  setText('val-thermo-s', fmt(sim.s, 2, 'g/100g H₂O'));
  setText('val-thermo-m', fmt(sim.m, 2, 'mol/kg'));
  setText('val-thermo-Kb', fmt(sim.Kb, 4, 'K·kg/mol'));
  setText('val-thermo-phi', fmt(sim.phi, 4, '—'));
  setText('val-thermo-BPE', fmt(sim.BPE, 2, 'K'));
  setText('val-thermo-Tv', fmt(mvr.Tv_C, 1, '°C'));
  setText('val-thermo-Q', fmt(sim.Q_kW, 1, 'kW'));
  setText('val-thermo-lamV', fmt(sim.lambdaV, 1, 'kJ/kg'));

  // MVR Compressor Cards
  setText('val-mvr-P1', fmt(mvr.P1, 1, 'kPa'));
  setText('val-mvr-Tc', fmt(mvr.Tc_C, 1, '°C'));
  setText('val-mvr-P2', fmt(mvr.P2, 1, 'kPa'));
  setText('val-mvr-r', fmt(mvr.r, 2, '—'));
  setText('val-mvr-lift', fmt(mvr.lift, 2, 'K'));
  setText('val-mvr-ws', fmt(mvr.ws, 1, 'kJ/kg'));
  setText('val-mvr-w', fmt(mvr.w, 1, 'kJ/kg'));
  setText('val-mvr-T2', fmt(mvr.T2_C, 1, '°C'));
  setText('val-mvr-Wshaft', fmt(mvr.Wshaft_kW, 1, 'kW'));
  setText('val-mvr-Welec', fmt(mvr.Welec_kW, 1, 'kW'));
  setText('val-mvr-kwh', fmt(mvr.kWh_per_t, 1, 'kWh/t vapor'));
  setText('val-mvr-cop', fmt(mvr.COP, 1, '—'));
  setText('val-mvr-carnot', fmt(mvr.COP_carnot, 1, '—'));

  // Multi-Effect Cards
  const effN = effects[inputs.N] || effects[3] || {};
  setText('val-me-N', `${inputs.N} Effects`);
  setText('val-me-economy', fmt(effN.economy, 2, 'kg vap / kg stm'));
  setText('val-me-steam', fmt(effN.S, 1, 'kg/h'));
  setText('val-me-dT', fmt(effN.dT_per_effect, 1, 'K / effect'));
  setText('val-me-maxN', fmt(effN.maxFeasibleN, 0, 'effects'));
  setText('val-me-status', effN.feasible ? 'FEASIBLE' : 'INFEASIBLE (ΔT < ΔT_min)');

  // Economics Cards
  const ecN = econ[inputs.N] || econ[3] || {};
  setText('val-econ-mvr-cost', fmt(ecN.cost_MVR_per_t, 2, '$/t vapor'));
  setText('val-econ-me-cost', fmt(ecN.cost_ME_per_t, 2, '$/t vapor'));
  setText('val-econ-crossover', fmt(ecN.ce_crossover, 3, '$/kWh'));
  setText('val-econ-annual-mvr', fmt(ecN.annual_MVR, 0, '$/yr'));
  setText('val-econ-annual-me', fmt(ecN.annual_ME, 0, '$/yr'));

  const savings = (ecN.annual_ME != null && ecN.annual_MVR != null) ? ecN.annual_ME - ecN.annual_MVR : null;
  setText('val-econ-savings', fmt(savings, 0, '$/yr'));
}

/**
 * Main simulation runner: recomputes and syncs PFD, cards, and charts.
 */
export function runSimulation() {
  const inputs = readInputs();
  currentSim = simulate(inputs);

  updateCards(currentSim);
  updatePFD(currentSim);
  updateAllCharts(currentSim);
}

/**
 * Initializes slider and numeric input synchronization.
 */
function initInputBindings() {
  const bindPair = (name) => {
    const range = document.getElementById(`input-${name}-range`);
    const num = document.getElementById(`input-${name}`);

    if (range && num) {
      range.addEventListener('input', () => {
        num.value = range.value;
        runSimulation();
      });
      num.addEventListener('input', () => {
        range.value = num.value;
        runSimulation();
      });
    }
  };

  const inputNames = [
    'F', 'xF', 'zF', 'T_C', 'purgeRatio', 'epsilon',
    'activityFactor', 'dT_heater', 'etaIs', 'etaMotor',
    'Ts_C', 'Tlast_C', 'dTmin', 'N', 'ce', 'cs', 'hours',
  ];

  inputNames.forEach(bindPair);

  const osmoticEl = document.getElementById('input-useOsmotic');
  const actContainer = document.getElementById('container-activityFactor');
  if (osmoticEl) {
    osmoticEl.addEventListener('change', () => {
      if (actContainer) {
        actContainer.style.display = osmoticEl.checked ? 'none' : 'block';
      }
      runSimulation();
    });
  }

  // Presets
  const presetButtons = document.querySelectorAll('[data-preset]');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.getAttribute('data-preset');
      const preset = PRESETS[pKey];
      if (preset) {
        setInputs(preset.inputs);
        runSimulation();
      }
    });
  });
}

/**
 * Tab routing and navigation handling.
 */
function initNavigation() {
  const navTabs = document.querySelectorAll('[role="tab"], nav a[href^="#"]');
  const panels = document.querySelectorAll('.tab-panel');

  function showTab(targetId) {
    if (!targetId || targetId === '#') targetId = '#overview';
    const id = targetId.replace(/^#/, '');

    panels.forEach(p => {
      if (p.id === id) {
        p.classList.add('active');
        p.removeAttribute('hidden');
      } else {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
      }
    });

    navTabs.forEach(t => {
      const href = t.getAttribute('href');
      if (href === `#${id}`) {
        t.classList.add('active');
        t.setAttribute('aria-selected', 'true');
      } else {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      }
    });

    if (id === 'simulator') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        if (currentSim) updateAllCharts(currentSim);
      }, 50);
    }
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const href = tab.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        window.location.hash = href;
        showTab(href);
      }
    });
  });

  window.addEventListener('hashchange', () => {
    showTab(window.location.hash);
  });

  // Initial tab selection
  showTab(window.location.hash || '#overview');
}

/**
 * AI Workflow Sub-tab navigation
 */
function initWorkflowSubtabs() {
  const subtabs = document.querySelectorAll('[data-subtab]');
  const subpanels = document.querySelectorAll('.subtab-panel');

  subtabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab');
      subtabs.forEach(b => b.classList.toggle('active', b === btn));
      subpanels.forEach(p => {
        if (p.id === target) {
          p.classList.add('active');
          p.removeAttribute('hidden');
        } else {
          p.classList.remove('active');
          p.setAttribute('hidden', '');
        }
      });
    });
  });
}

/**
 * Expandable Card Disclosures ("?" buttons)
 */
function initCardDisclosures() {
  const buttons = document.querySelectorAll('.card-disclosure-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.result-card');
      if (card) {
        const details = card.querySelector('.card-details');
        if (details) {
          const isExpanded = details.classList.contains('expanded');
          details.classList.toggle('expanded', !isExpanded);
          btn.textContent = isExpanded ? '?' : '✕';
          btn.setAttribute('aria-expanded', !isExpanded);
        }
      }
    });
  });
}

/**
 * Populates References Tab dynamically from DATA.sources
 */
function renderReferences() {
  const container = document.getElementById('references-list');
  if (!container) return;

  const sources = DATA.sources;
  let html = '<div class="references-grid">';

  for (const [id, src] of Object.entries(sources)) {
    html += `
      <div class="reference-item">
        <div class="ref-header">
          <span class="ref-id">[${id}]</span>
          ${src.verified ? '<span class="badge badge-verified">VERIFIED</span>' : '<span class="badge badge-estimate">ESTIMATE</span>'}
        </div>
        <div class="ref-citation"><strong>${src.citation || src.title || id}</strong></div>
        ${src.author ? `<div class="ref-author">${src.author} (${src.year || ''})</div>` : ''}
        ${src.notes ? `<div class="ref-notes">${src.notes}</div>` : ''}
        ${src.url ? `<div class="ref-url"><a href="${src.url}" target="_blank" rel="noopener noreferrer">${src.url}</a></div>` : ''}
        ${src.accessDate ? `<div class="ref-date"><small>Accessed: ${src.accessDate}</small></div>` : ''}
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Initializes KaTeX Auto-rendering
 */
export function renderKaTeX() {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  }
}

/**
 * Main application bootstrap.
 */
export function initApp() {
  renderPFD('pfd-container');
  setInputs(DEFAULT_INPUTS);
  initInputBindings();
  initNavigation();
  initWorkflowSubtabs();
  initCardDisclosures();
  renderReferences();

  // Run initial simulation
  runSimulation();

  // Render KaTeX equations
  renderKaTeX();
}

// Auto-boot if loaded in browser
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
}
