import { DATA } from './data.js';
import { simulate, DEFAULT_INPUTS } from './model.js';
import { initCharts, updateCharts } from './charts.js';

/**
 * Tab Navigation
 */
function setupTabs() {
    const links = document.querySelectorAll('#tab-bar a, .sub-nav a');
    const sections = document.querySelectorAll('.tab-content, .sub-tab');

    function navigate() {
        const hash = window.location.hash || '#simulator';
        
        // Main tabs
        const mainHash = hash.split('-')[0] || '#simulator';
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === mainHash || link.getAttribute('href') === hash);
        });

        sections.forEach(section => {
            const id = section.getAttribute('id');
            if (id === mainHash.substring(1)) {
                section.classList.add('active');
            } else if (hash.startsWith('#ai-') && id.startsWith('ai-')) {
                section.classList.toggle('hidden', id !== hash.substring(1));
            } else if (!id.startsWith('ai-')) {
                section.classList.remove('active');
            }
        });

        // Trigger chart resize if entering simulator
        if (mainHash === '#simulator') {
            window.dispatchEvent(new Event('resize'));
        }
    }

    window.addEventListener('hashchange', navigate);
    navigate();
}

/**
 * Simulator Logic
 */
let currentInputs = { ...DEFAULT_INPUTS };

function setupSimulator() {
    const inputs = [
        'F', 'xF', 'purgeRatio', 'T_C', 'dT_heater', 'activityFactor', 'ce', 'cs'
    ];

    inputs.forEach(key => {
        const el = document.getElementById(`input-${key}`);
        const valEl = document.getElementById(`val-${key}`);
        if (el) {
            el.addEventListener('input', (e) => {
                currentInputs[key] = parseFloat(e.target.value);
                if (valEl) valEl.textContent = currentInputs[key];
                updateUI();
            });
        }
    });

    const useOsmoticEl = document.getElementById('input-useOsmotic');
    if (useOsmoticEl) {
        useOsmoticEl.addEventListener('change', (e) => {
            currentInputs.useOsmotic = e.target.checked;
            updateUI();
        });
    }

    // Help buttons
    document.querySelectorAll('.help-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const helpId = `help-${btn.dataset.help}`;
            const helpEl = document.getElementById(helpId);
            helpEl.classList.toggle('hidden');
            if (!helpEl.classList.contains('hidden')) {
                const eqEl = helpEl.querySelector('.eq');
                if (eqEl && !eqEl.dataset.rendered) {
                    katex.render(eqEl.textContent, eqEl);
                    eqEl.dataset.rendered = "true";
                }
            }
        });
    });

    // Presets
    document.getElementById('preset-handcalc').addEventListener('click', () => applyInputs(DEFAULT_INPUTS));
    document.getElementById('preset-highbpe').addEventListener('click', () => applyInputs({ ...DEFAULT_INPUTS, activityFactor: 1.2, useOsmotic: false }));
    document.getElementById('preset-texas').addEventListener('click', () => applyInputs({ ...DEFAULT_INPUTS, ce: 0.0721, cs: 7.33 }));

    initCharts();
    updateUI();
}

function applyInputs(newInp) {
    currentInputs = { ...currentInputs, ...newInp };
    for (const key in currentInputs) {
        const el = document.getElementById(`input-${key}`);
        const valEl = document.getElementById(`val-${key}`);
        if (el) {
            el.value = currentInputs[key];
            if (valEl) valEl.textContent = currentInputs[key];
        }
    }
    const useOsmoticEl = document.getElementById('input-useOsmotic');
    if (useOsmoticEl) useOsmoticEl.checked = currentInputs.useOsmotic;
    updateUI();
}

function updateUI() {
    const res = simulate(currentInputs);
    
    // Warning banner
    const warningEl = document.getElementById('infeasible-warning');
    if (res.warnings.length > 0) {
        warningEl.textContent = res.warnings.join(' ');
        warningEl.classList.remove('hidden');
    } else {
        warningEl.classList.add('hidden');
    }

    // Result cards
    if (res.mass.feasible) {
        updateValue('res-BPE', res.BPE.toFixed(2));
        updateValue('res-kWh_per_t', res.mvr.kWh_per_t.toFixed(1));
        updateValue('res-liYield', (res.mass.liYield * 100).toFixed(1));
        updateValue('res-impurity', Math.round(res.mass.productImpurity_ppm));
    } else {
        ['res-BPE', 'res-kWh_per_t', 'res-liYield', 'res-impurity'].forEach(id => updateValue(id, '—'));
    }

    updateCharts(res);
}

function updateValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/**
 * Theory Equations
 */
function renderEquations() {
    const eqBPE = document.getElementById('eq-bpe');
    if (eqBPE) {
        katex.render('BPE = \\phi \\cdot i \\cdot K_b \\cdot m', eqBPE, { displayMode: true });
    }
    const eqCOP = document.getElementById('eq-cop');
    if (eqCOP) {
        katex.render('COP = \\frac{h_{fg}}{w}', eqCOP, { displayMode: true });
    }
}

/**
 * References
 */
function renderReferences() {
    const refEl = document.getElementById('dynamic-references');
    if (!refEl) return;

    let html = '<h3>Data Sources</h3><ul>';
    for (const [id, source] of Object.entries(DATA.sources)) {
        if (id === 'estimate') continue;
        html += `<li><strong>${id}:</strong> ${source.citation} ${source.url ? `<a href="${source.url}" target="_blank">[link]</a>` : ''}</li>`;
    }
    html += '</ul>';
    refEl.innerHTML = html;
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupSimulator();
    renderEquations();
    renderReferences();
});
