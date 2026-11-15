import { DATA } from './data.js';

// Constants from data.js
const M_LIOH = DATA.molarMass.LiOH.value;       // 0.023947 kg/mol (or 23.947 g/mol)
const M_H2O = DATA.molarMass.H2O.value;         // 0.018015 kg/mol
const M_HYD = DATA.molarMass.LiOH_H2O.value;     // 0.041965 kg/mol
const F_LI = M_LIOH / M_HYD;                     // ~0.5706827 LiOH mass fraction in hydrate
const R = DATA.constants.R.value;                // 8.314462618 J/(mol*K)
const RV = DATA.constants.Rv.value;              // 461.5 J/(kg*K)
const AN = DATA.antoine;                         // A, B, C

/**
 * Generic linear interpolation on an array of [x, y] points.
 * Throws an error if x is outside the bounds.
 */
function interp(points, x) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x >= x0 && x <= x1) {
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  throw new Error(`Value ${x} is outside interpolation range [${points[0][0]}, ${points[points.length - 1][0]}]`);
}

/**
 * Saturation vapor pressure of water using Antoine equation (kPa).
 * log10(P_mmHg) = A - B / (C + T_C)
 * P_kPa = P_mmHg * 0.133322
 */
export function psat(T_C) {
  const pMmHg = Math.pow(10, AN.A - AN.B / (AN.C + T_C));
  return pMmHg * 0.133322;
}

/**
 * Saturation temperature of water from Antoine equation (°C).
 * Exact algebraic inverse of psat(T_C).
 */
export function tsat(P_kPa) {
  const pMmHg = P_kPa / 0.133322;
  const logP = Math.log10(pMmHg);
  return AN.B / (AN.A - logP) - AN.C;
}

/**
 * Saturation latent heat of vaporization of water (kJ/kg).
 * Linear interpolation of DATA.steamTable (NIST).
 * Throws error if T_C is outside the table bounds (30 to 150 °C).
 */
export function hfg(T_C) {
  const points = DATA.steamTable.rows.map(row => [row[0], row[4]]);
  return interp(points, T_C);
}

/**
 * Solubility of LiOH in water (g LiOH / 100 g H2O).
 * Linear interpolation of DATA.solubility.points.
 */
export function solubility(T_C) {
  return interp(DATA.solubility.points, T_C);
}

/**
 * Saturated osmotic coefficient of LiOH(aq) phi_sat.
 * Linear interpolation of DATA.osmoticSat.points.
 */
export function phi_sat(T_C) {
  return interp(DATA.osmoticSat.points, T_C);
}

/**
 * Boiling Point Elevation (K).
 * BPE = activityFactor * i * Kb * m
 * m = (s / 100) / (M_LiOH / 1000)
 * Kb = R * (T_C + 273.15)^2 / (hfg(T_C) * 1000)
 */
export function bpe({ s, T_C, i = 2, activityFactor = 1.0 }) {
  const m = (s / 100) / (M_LIOH / 1000);
  const Kb = (R * Math.pow(T_C + 273.15, 2)) / (hfg(T_C) * 1000);
  return activityFactor * i * Kb * m;
}

/**
 * Unit model: Mass balance with purge.
 * Bulk balance M1-M6, impurity carryover M8.
 * Returns null flows if infeasible (C < 0, V < 0, or xL <= 0).
 */
export function massBalance({ F, xF, zF, T_C, purgeRatio, epsilon }) {
  const s = solubility(T_C);
  const P = purgeRatio * F;
  const zML = zF / purgeRatio;
  const xL = (1 - zML) * s / (100 + s);
  const C = (F * xF - P * xL) / F_LI;
  const V = F * (1 - xF - zF) - (1 - F_LI) * C - P * (1 - xL - zML);

  const feasible = C >= 0 && V >= 0 && xL > 0;
  const warnings = [];

  if (!feasible) {
    warnings.push('Mass balance infeasible: negative crystal or vapor flow, or non-positive liquor concentration.');
    return {
      C: null,
      V: null,
      P: null,
      xL,
      zML,
      liYield: null,
      productImpurity_ppm: null,
      closureError: null,
      feasible: false,
      warnings,
    };
  }

  const liYield = (F_LI * C) / (F * xF);
  const productImpurity_ppm = ((epsilon * zML) / (1 + epsilon)) * 1e6;
  const closureError = V + C + P - F;

  return {
    C,
    V,
    P,
    xL,
    zML,
    liYield,
    productImpurity_ppm,
    closureError,
    feasible: true,
    warnings,
  };
}

/**
 * Unit model: MVR Compressor.
 * Evaluates suction/discharge pressures, isentropic & actual work,
 * discharge temperature T2, power, specific electricity consumption, COP.
 */
export function mvr({ V, Tb_C, BPE, dT_heater, etaIs, etaMotor, gamma }) {
  const Tv_C = Tb_C - BPE;
  const lamV = hfg(Tv_C);
  const Tc_C = Tb_C + dT_heater;
  const P1 = psat(Tv_C);
  const P2 = psat(Tc_C);
  const r = P2 / P1;
  const lift = Tc_C - Tv_C;
  const k = (gamma - 1) / gamma;
  const T1 = Tb_C + 273.15;

  const ws = (gamma / (gamma - 1)) * RV * T1 * (Math.pow(r, k) - 1) / 1000; // kJ/kg
  const w = ws / etaIs; // kJ/kg
  const T2_C = T1 * (1 + (Math.pow(r, k) - 1) / etaIs) - 273.15; // °C

  const Wshaft_kW = V != null ? (V * w) / 3600 : null;
  const Welec_kW = V != null ? (V * w) / 3600 / etaMotor : null;
  const kWh_per_t = w / (3.6 * etaMotor);
  const COP = lamV / w;
  const COP_carnot = (Tc_C + 273.15) / (Tc_C - Tv_C);

  return {
    Tv_C,
    P1,
    Tc_C,
    P2,
    r,
    lift,
    ws,
    w,
    T2_C,
    Wshaft_kW,
    Welec_kW,
    kWh_per_t,
    COP,
    COP_carnot,
  };
}

/**
 * Unit model: Multi-Effect Evaporator.
 * Steam economy, steam consumption S, available delta T per effect.
 */
export function multiEffect({ V, Q_kW, Ts_C, Tlast_C, N, BPE, dTmin, lambdaV }) {
  const lamS = hfg(Ts_C);
  const lamV = lambdaV ?? (Q_kW != null && V != null && V > 0 ? (Q_kW * 3600) / V : null);
  const E1 = lamS / lamV;
  const economy = N * E1;
  const S = V != null ? V / economy : null;
  const dT_per_effect = (Ts_C - Tlast_C - N * BPE) / N;
  const maxFeasibleN = Math.floor((Ts_C - Tlast_C) / (BPE + dTmin));
  const feasible = dT_per_effect >= dTmin;

  return {
    S,
    economy,
    dT_per_effect,
    feasible,
    maxFeasibleN,
  };
}

/**
 * Unit model: Operating Economics.
 * Specific operating costs ($/t evaporated), crossover electricity price, annual costs.
 */
export function economics({ kWh_per_t, economy, ce, cs, V, hours }) {
  const cost_MVR_per_t = ce * kWh_per_t;
  const cost_ME_per_t = cs / economy;
  const ce_crossover = cs / (economy * kWh_per_t);
  const annual_MVR = V != null ? (cost_MVR_per_t * V * hours) / 1000 : null;
  const annual_ME = V != null ? (cost_ME_per_t * V * hours) / 1000 : null;

  return {
    cost_MVR_per_t,
    cost_ME_per_t,
    ce_crossover,
    annual_MVR,
    annual_ME,
  };
}

/**
 * Exact default input dictionary matching hand-calc case and plan §5.4.
 */
export const DEFAULT_INPUTS = {
  F: 10000,
  xF: DATA.feed.xF.value,                 // 0.06
  zF: DATA.feed.zF.value,                 // 0.001
  T_C: 60,
  purgeRatio: 0.05,
  epsilon: DATA.feed.epsilon.value,       // 0.03
  i: 2,
  useOsmotic: true,
  activityFactor: 1.0,
  dT_heater: DATA.compressor.dT_heater.value, // 6
  etaIs: DATA.compressor.etaIs.value,     // 0.75
  etaMotor: DATA.compressor.etaMotor.value, // 0.95
  gamma: DATA.constants.gamma.value,      // 1.33
  Ts_C: DATA.evaporator.Ts_C.value,       // 120
  Tlast_C: DATA.evaporator.Tlast_C.value, // 50
  dTmin: DATA.evaporator.dTmin.value,     // 5
  N: 3,
  ce: DATA.prices.electricity.value,      // 0.0721
  cs: DATA.prices.steam.value,            // 7.33
  hours: 8000,
};

/**
 * Full simulation runner: merges inputs, evaluates thermodynamics,
 * mass balance, MVR compression, multi-effect evaporator (1, 3, 5, N),
 * and economics.
 */
export function simulate(inputs = {}) {
  const p = { ...DEFAULT_INPUTS, ...inputs };
  const T = p.T_C;

  const s = solubility(T);
  const m = (s / 100) / (M_LIOH / 1000);
  const Kb = (R * Math.pow(T + 273.15, 2)) / (hfg(T) * 1000);
  const phi = phi_sat(T);
  const a = p.useOsmotic ? phi : p.activityFactor;
  const BPE = a * p.i * Kb * m;

  const mass = massBalance({
    F: p.F,
    xF: p.xF,
    zF: p.zF,
    T_C: T,
    purgeRatio: p.purgeRatio,
    epsilon: p.epsilon,
  });

  const Tv = T - BPE;
  const lamV = hfg(Tv);
  const Q_kW = mass.V != null ? (mass.V * lamV) / 3600 : null;

  const mvrRes = mvr({
    V: mass.V,
    Tb_C: T,
    BPE,
    dT_heater: p.dT_heater,
    etaIs: p.etaIs,
    etaMotor: p.etaMotor,
    gamma: p.gamma,
  });

  const effects = {};
  const econ = {};
  const effectCounts = Array.from(new Set([1, 3, 5, p.N])).sort((x, y) => x - y);

  for (const n of effectCounts) {
    const eff = multiEffect({
      V: mass.V,
      Q_kW,
      Ts_C: p.Ts_C,
      Tlast_C: p.Tlast_C,
      N: n,
      BPE,
      dTmin: p.dTmin,
      lambdaV: lamV,
    });
    effects[n] = eff;

    const ec = economics({
      kWh_per_t: mvrRes.kWh_per_t,
      economy: eff.economy,
      ce: p.ce,
      cs: p.cs,
      V: mass.V,
      hours: p.hours,
    });
    econ[n] = ec;
  }

  const warnings = [...mass.warnings];
  if (!effects[p.N].feasible) {
    warnings.push(
      `Multi-effect configuration (N=${p.N}) infeasible: ΔT per effect (${effects[p.N].dT_per_effect.toFixed(1)} K) is less than ΔT_min (${p.dTmin} K). Maximum feasible effects: ${effects[p.N].maxFeasibleN}.`
    );
  }

  return {
    s,
    m,
    Kb,
    phi: a,
    BPE,
    Q_kW,
    lambdaV: lamV,
    mass,
    mvr: mvrRes,
    effects,
    econ,
    inputs: p,
    warnings,
  };
}
