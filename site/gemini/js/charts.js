import { DATA } from './data.js';
import { simulate, solubility, bpe, mvr, multiEffect } from './model.js';

const CHART_IDS = [
    'chart-solubility', 'chart-energy', 'chart-crossover', 'chart-purity',
    'chart-power-bpe', 'chart-mass-flow', 'chart-lift', 'chart-me-feas', 'chart-bpe-conc'
];

export function initCharts() {
    CHART_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) Plotly.newPlot(id, [], { margin: { t: 40, b: 40, l: 50, r: 20 }, responsive: true });
    });
}

export function updateCharts(res) {
    if (!res.mass.feasible) return;

    updateSolubilityChart(res);
    updateEnergyChart(res);
    updateCrossoverChart(res);
    updatePurityChart(res);
    updatePowerBpeChart(res);
    updateMassFlowChart(res);
    updateLiftChart(res);
    updateMeFeasChart(res);
    updateBpeConcChart(res);
}

function updateSolubilityChart(res) {
    const T = Array.from({ length: 21 }, (_, i) => i * 5);
    const s = T.map(t => solubility(t));
    
    // Schematic bands (e.g., +2g and +5g above solubility)
    const metastable = s.map(v => v + 2);
    const spinodal = s.map(v => v + 5);

    const traces = [
        { x: T, y: s, name: 'Solubility (Binodal)', line: { color: '#27ae60', width: 3 } },
        { x: T, y: metastable, name: 'Metastable Limit', line: { color: '#e67e22', dash: 'dash' } },
        { x: T, y: spinodal, name: 'Spinodal Limit', line: { color: '#e74c3c', dash: 'dot' } },
        { x: [res.inputs.T_C], y: [res.s], name: 'Operating Point', mode: 'markers', marker: { size: 12, color: 'black' } }
    ];

    Plotly.react('chart-solubility', traces, {
        title: 'P1: Solubility & Zones',
        xaxis: { title: 'Temperature (°C)' },
        yaxis: { title: 'g LiOH / 100g H2O' },
        legend: { orientation: 'h', y: -0.2 }
    });
}

function updateEnergyChart(res) {
    const labels = ['1-Effect', '3-Effect', '5-Effect', 'MVR'];
    const costs = [
        res.econ[1].cost_ME_per_t,
        res.econ[3].cost_ME_per_t,
        res.econ[5].cost_ME_per_t,
        res.econ[res.inputs.N].cost_MVR_per_t // Actually MVR cost is same regardless of N
    ];

    const traces = [{
        x: labels,
        y: costs,
        type: 'bar',
        marker: { color: ['#bdc3c7', '#95a5a6', '#7f8c8d', '#3498db'] }
    }];

    Plotly.react('chart-energy', traces, {
        title: 'P5: Operating Cost Comparison',
        yaxis: { title: '$/t water evaporated' }
    });
}

function updateCrossoverChart(res) {
    const ce = Array.from({ length: 50 }, (_, i) => 0.03 + i * 0.005);
    const costMVR = ce.map(c => c * res.mvr.kWh_per_t);
    const costME3 = ce.map(() => res.inputs.cs / res.effects[3].economy);
    const costME5 = ce.map(() => res.inputs.cs / res.effects[5].economy);

    const traces = [
        { x: ce, y: costMVR, name: 'MVR', line: { color: '#3498db' } },
        { x: ce, y: costME3, name: '3-Effect', line: { color: '#95a5a6' } },
        { x: ce, y: costME5, name: '5-Effect', line: { color: '#7f8c8d' } },
        { x: [res.inputs.ce], y: [res.inputs.ce * res.mvr.kWh_per_t], name: 'Current', mode: 'markers', marker: { size: 10, color: 'black' } }
    ];

    Plotly.react('chart-crossover', traces, {
        title: 'P6: Economic Crossover',
        xaxis: { title: 'Electricity Price ($/kWh)' },
        yaxis: { title: 'Operating Cost ($/t)' },
        legend: { orientation: 'h', y: -0.2 }
    });
}

function updatePurityChart(res) {
    const p = Array.from({ length: 40 }, (_, i) => 0.005 + i * 0.005);
    const impurities = p.map(pr => {
        const zML = res.inputs.zF / pr;
        return (res.inputs.epsilon * zML / (1 + res.inputs.epsilon)) * 1e6;
    });

    const traces = [
        { x: p, y: impurities, name: 'Product Impurity', line: { color: '#e67e22' } },
        { x: [res.inputs.purgeRatio], y: [res.mass.productImpurity_ppm], name: 'Current', mode: 'markers', marker: { size: 10, color: 'black' } }
    ];

    Plotly.react('chart-purity', traces, {
        title: 'P7: Purge vs Purity',
        xaxis: { title: 'Purge Ratio (P/F)' },
        yaxis: { title: 'Impurity (ppm)' }
    });
}

function updatePowerBpeChart(res) {
    const bpes = Array.from({ length: 31 }, (_, i) => i * 0.5);
    const powers = bpes.map(b => {
        const m = mvr({ ...res.inputs, Tb_C: res.inputs.T_C, V: 1000, BPE: b });
        return m.kWh_per_t;
    });

    const traces = [
        { x: bpes, y: powers, name: 'MVR Power', line: { color: '#3498db' } },
        { x: [res.BPE], y: [res.mvr.kWh_per_t], name: 'Current', mode: 'markers', marker: { size: 10, color: 'black' } }
    ];

    Plotly.react('chart-power-bpe', traces, {
        title: 'P4: Power vs BPE',
        xaxis: { title: 'BPE (K)' },
        yaxis: { title: 'kWh/t water' }
    });
}

function updateMassFlowChart(res) {
    const traces = [{
        x: ['Feed (F)', 'Vapor (V)', 'Crystals (C)', 'Purge (P)'],
        y: [res.inputs.F, res.mass.V, res.mass.C, res.mass.P],
        type: 'bar',
        marker: { color: ['#34495e', '#3498db', '#27ae60', '#e67e22'] }
    }];

    Plotly.react('chart-mass-flow', traces, {
        title: 'P8: Mass Balance',
        yaxis: { title: 'Flow Rate (kg/h)' }
    });
}

function updateLiftChart(res) {
    const traces = [{
        values: [res.BPE, res.inputs.dT_heater],
        labels: ['BPE', 'Heater ΔT'],
        type: 'pie',
        marker: { colors: ['#e74c3c', '#9b59b6'] }
    }];

    Plotly.react('chart-lift', traces, {
        title: 'P3: Lift Breakdown'
    });
}

function updateMeFeasChart(res) {
    const ns = [1, 2, 3, 4, 5, 6, 7];
    const dTs = ns.map(n => multiEffect({ ...res.inputs, V: 1000, Q_kW: 1000, BPE: res.BPE, lambdaV: 2300, N: n }).dT_per_effect);

    const traces = [
        { x: ns, y: dTs, name: 'ΔT per effect', type: 'bar', marker: { color: dTs.map(dt => dt >= res.inputs.dTmin ? '#27ae60' : '#e74c3c') } },
        { x: [0, 8], y: [res.inputs.dTmin, res.inputs.dTmin], name: 'Min ΔT', mode: 'lines', line: { color: 'black', dash: 'dash' } }
    ];

    Plotly.react('chart-me-feas', traces, {
        title: 'P11: Multi-Effect Feasibility',
        xaxis: { title: 'Number of Effects' },
        yaxis: { title: 'ΔT per effect (K)' }
    });
}

function updateBpeConcChart(res) {
    const concs = Array.from({ length: 30 }, (_, i) => 2 + i * 0.5); // g/100g
    const bpes = concs.map(c => bpe({ ...res.inputs, s: c, T_C: res.inputs.T_C, i: res.inputs.i }));

    const traces = [
        { x: concs, y: bpes, name: 'BPE', line: { color: '#e74c3c' } },
        { x: [res.s], y: [res.BPE], name: 'Current', mode: 'markers', marker: { size: 10, color: 'black' } }
    ];

    Plotly.react('chart-bpe-conc', traces, {
        title: 'P2: BPE vs Concentration',
        xaxis: { title: 'Concentration (g/100g)' },
        yaxis: { title: 'BPE (K)' }
    });
}
