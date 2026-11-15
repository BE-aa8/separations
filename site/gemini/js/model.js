import { DATA } from './data.js';

/**
 * P_sat (kPa) using Antoine equation only.
 * log10(P/mmHg) = A - B/(C + T)
 */
export function psat(T_C) {
  const { A, B, C } = DATA.antoine;
  const log10P_mmHg = A - B / (C + T_C);
  const P_mmHg = Math.pow(10, log10P_mmHg);
  return P_mmHg * 0.133322;
}

/**
 * T_sat (C) as the algebraic inverse of the Antoine equation.
 */
export function tsat(P_kPa) {
  const { A, B, C } = DATA.antoine;
  const P_mmHg = P_kPa / 0.133322;
  const log10P_mmHg = Math.log10(P_mmHg);
  return B / (A - log10P_mmHg) - C;
}

/**
 * Linear interpolation helper.
 */
function interpolate(x, table, xCol, yCol) {
  if (x < table[0][xCol] || x > table[table.length - 1][xCol]) {
    throw new Error(`Value ${x} outside table range [${table[0][xCol]}, ${table[table.length - 1][xCol]}]`);
  }
  for (let i = 0; i < table.length - 1; i++) {
    const x0 = table[i][xCol];
    const x1 = table[i + 1][xCol];
    if (x >= x0 && x <= x1) {
      const y0 = table[i][yCol];
      const y1 = table[i + 1][yCol];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
  }
  return table[table.length - 1][yCol];
}

/**
 * h_fg (kJ/kg) using linear interpolation in DATA.steamTable.
 */
export function hfg(T_C) {
  // steamTable.columns = ["T_C", "P_kPa", "hf_kJkg", "hg_kJkg", "hfg_kJkg"]
  return interpolate(T_C, DATA.steamTable.rows, 0, 4);
}

/**
 * Solubility (g LiOH / 100 g H2O) using linear interpolation in DATA.solubility.
 */
export function solubility(T_C) {
  // solubility.columns = ["T_C", "s_g_per_100g_H2O"]
  return interpolate(T_C, DATA.solubility.points, 0, 1);
}

/**
 * BPE (K).
 * BPE = activityFactor * i * Kb * m
 */
export function bpe({ s, T_C, i, activityFactor, useOsmotic }) {
  const R = DATA.constants.R.value; // J/(mol K)
  const Mw = DATA.molarMass.H2O.value / 1000; // kg/mol
  const hfg_val = hfg(T_C); // kJ/kg
  
  // Kb = R * (T_C + 273.15)^2 * Mw / (hfg(T_C) * Mw * 1000)
  // Wait, the formula in plan §5.3 is:
  // Kb = R*(T_C+273.15)^2*Mw / (hfg(T_C)*Mw*1000) = R*(T_C+273.15)^2 / (hfg(T_C)*1000)
  // Mw cancels out in the Kb formula provided in the plan text if you look closely:
  // Kb = R*(T_b+273.15)^2*Mw / (hfg(T_b)*Mw*1000)
  const Kb = R * Math.pow(T_C + 273.15, 2) / (hfg_val * 1000);
  
  const m = (s / 100) / (DATA.molarMass.LiOH.value / 1000); // mol/kg
  
  let phi = activityFactor;
  if (useOsmotic) {
    phi = interpolate(T_C, DATA.osmoticSat.points, 0, 1);
  }
  
  return phi * i * Kb * m;
}

/**
 * Mass balance.
 */
export function massBalance({ F, xF, zF, T_C, purgeRatio, epsilon }) {
  const s = solubility(T_C);
  const p = purgeRatio;
  
  const zML = zF / p;
  const xL = (1 - zML) * s / (100 + s);
  
  const LiOH_frac_C = DATA.molarMass.LiOH.value / DATA.molarMass.LiOH_H2O.value; // ~0.5707
  
  const P = F * p;
  const C = (F * xF - P * xL) / LiOH_frac_C;
  const V = F - C - P;
  
  const feasible = (C >= 0 && V >= 0 && xL > 0 && zML < 1);
  const warnings = [];
  if (!feasible) {
    if (zML >= 1) warnings.push("Impurity concentration in purge exceeds 100%.");
    if (C < 0) warnings.push("Negative crystal flow: feed too lean or purge too large.");
    if (V < 0) warnings.push("Negative vapor flow: feed too concentrated or purge too large.");
    if (xL <= 0) warnings.push("Liquor LiOH concentration is zero or negative.");
    return { C: null, V: null, P: null, xL: null, zML: null, liYield: null, productImpurity_ppm: null, closureError: null, feasible: false, warnings };
  }
  
  const liYield = (LiOH_frac_C * C) / (F * xF);
  const productImpurity_ppm = (epsilon * zML / (1 + epsilon)) * 1e6;
  
  // M6 check for closure
  const water_frac_C = DATA.molarMass.H2O.value / DATA.molarMass.LiOH_H2O.value; // ~0.4293
  const waterIn = F * (1 - xF - zF);
  const waterOut = V + water_frac_C * C + P * (1 - xL - zML);
  const closureError = waterIn - waterOut;
  
  return { C, V, P, xL, zML, liYield, productImpurity_ppm, closureError, feasible, warnings };
}

/**
 * MVR compressor model.
 */
export function mvr({ V, Tb_C, BPE, dT_heater, etaIs, etaMotor, gamma }) {
  const Tv_C = Tb_C - BPE;
  const P1 = psat(Tv_C);
  const Tc_C = Tb_C + dT_heater;
  const P2 = psat(Tc_C);
  const r = P2 / P1;
  const lift = BPE + dT_heater;
  
  const T1_K = Tb_C + 273.15; // Suction temperature is the liquor temperature (superheated by BPE)
  const Rv = DATA.constants.Rv.value; // J/(kg K)
  
  // ws = [gamma/(gamma-1)] * Rv * T1 * [r^((gamma-1)/gamma) - 1]
  const powerFactor = (gamma - 1) / gamma;
  const ws = (gamma / (gamma - 1)) * Rv * T1_K * (Math.pow(r, powerFactor) - 1) / 1000; // kJ/kg
  const w = ws / etaIs;
  const Wshaft_kW = (V * w) / 3600;
  const Welec_kW = Wshaft_kW / etaMotor;
  
  const T2_C = T1_K * (1 + (Math.pow(r, powerFactor) - 1) / etaIs) - 273.15;
  
  const kWh_per_t = w / (3.6 * etaMotor);
  const hfg_Tv = hfg(Tv_C);
  const COP = hfg_Tv / w;
  const COP_carnot = (Tc_C + 273.15) / (Tc_C - Tv_C);
  
  return { Tv_C, P1, Tc_C, P2, r, lift, ws, w, T2_C, Wshaft_kW, Welec_kW, kWh_per_t, COP, COP_carnot };
}

/**
 * Multi-effect evaporator model.
 */
export function multiEffect({ V, Q_kW, Ts_C, Tlast_C, N, BPE, dTmin, lambdaV }) {
  // economy approx N * E1
  // E1 = hfg(Ts) / hfg(Tv) if we were rigorous, but plan says E = V/S.
  // Actually plan E3: E_N approx N * E_1.
  // E1 = lambdaV / hfg(Ts_C) ? No, S = Q / hfg(Ts_C). E1 = V / S = V * hfg(Ts_C) / Q.
  // Since Q = V * lambdaV / 3600, E1 = V * hfg(Ts_C) / (V * lambdaV / 3600) = 3600 * hfg(Ts_C) / lambdaV.
  // Wait, Q is in kW (kJ/s), hfg is kJ/kg. V is kg/h.
  // Q = (V/3600) * lambdaV.
  // S [kg/h] = Q / hfg(Ts_C) * 3600.
  // Economy E = V / S = hfg(Ts_C) / lambdaV.
  const hfg_Ts = hfg(Ts_C);
  const E1 = hfg_Ts / lambdaV;
  const economy = N * E1;
  const S = V / economy;
  
  const totalDT = Ts_C - Tlast_C;
  const dT_per_effect = (totalDT - N * BPE) / N;
  const feasible = dT_per_effect >= dTmin;
  const maxFeasibleN = Math.floor(totalDT / (BPE + dTmin));
  
  return { S, economy, dT_per_effect, feasible, maxFeasibleN };
}

/**
 * Economic model.
 */
export function economics({ kWh_per_t, economy, ce, cs, V, hours }) {
  const cost_MVR_per_t = ce * kWh_per_t;
  const cost_ME_per_t = cs / economy;
  const ce_crossover = cs / (economy * kWh_per_t);
  
  const annual_MVR = cost_MVR_per_t * V * hours / 1000;
  const annual_ME = cost_ME_per_t * V * hours / 1000;
  
  return { cost_MVR_per_t, cost_ME_per_t, ce_crossover, annual_MVR, annual_ME };
}

export const DEFAULT_INPUTS = {
  F: 10000,
  xF: 0.060,
  zF: 0.0010,
  T_C: 60,
  purgeRatio: 0.05,
  epsilon: 0.03,
  i: 2,
  useOsmotic: true,
  activityFactor: 1.0,
  dT_heater: 6,
  etaIs: 0.75,
  etaMotor: 0.95,
  gamma: 1.33,
  Ts_C: 120,
  Tlast_C: 50,
  dTmin: 5,
  N: 3,
  ce: DATA.prices.electricity.value,
  cs: DATA.prices.steam.value,
  hours: 8000
};

export function simulate(inputs) {
  const inp = { ...DEFAULT_INPUTS, ...inputs };
  
  const s = solubility(inp.T_C);
  const BPE = bpe({ s, T_C: inp.T_C, i: inp.i, activityFactor: inp.activityFactor, useOsmotic: inp.useOsmotic });
  
  const mass = massBalance({ F: inp.F, xF: inp.xF, zF: inp.zF, T_C: inp.T_C, purgeRatio: inp.purgeRatio, epsilon: inp.epsilon });
  
  let Q_kW = null;
  let mvr_res = null;
  let effects = {};
  let econ = {};
  const warnings = [...mass.warnings];
  
  if (mass.feasible) {
    const Tv_C = inp.T_C - BPE;
    const lambdaV = hfg(Tv_C);
    Q_kW = (mass.V * lambdaV) / 3600;
    
    mvr_res = mvr({ V: mass.V, Tb_C: inp.T_C, BPE, dT_heater: inp.dT_heater, etaIs: inp.etaIs, etaMotor: inp.etaMotor, gamma: inp.gamma });
    
    [1, 3, 5, inp.N].forEach(n => {
      const me = multiEffect({ V: mass.V, Q_kW, Ts_C: inp.Ts_C, Tlast_C: inp.Tlast_C, N: n, BPE, dTmin: inp.dTmin, lambdaV });
      effects[n] = me;
      econ[n] = economics({ kWh_per_t: mvr_res.kWh_per_t, economy: me.economy, ce: inp.ce, cs: inp.cs, V: mass.V, hours: inp.hours });
      if (n === inp.N && !me.feasible) {
        warnings.push(`N=${n} effects is infeasible (dT/effect < dTmin). Max N is ${me.maxFeasibleN}.`);
      }
    });
  }
  
  return {
    inputs: inp,
    s,
    m: (s / 100) / (DATA.molarMass.LiOH.value / 1000),
    Kb: DATA.constants.R.value * Math.pow(inp.T_C + 273.15, 2) / (hfg(inp.T_C) * 1000),
    phi: inp.useOsmotic ? interpolate(inp.T_C, DATA.osmoticSat.points, 0, 1) : inp.activityFactor,
    lambdaV: mass.feasible ? hfg(inp.T_C - BPE) : null,
    BPE,
    mass,
    Q_kW,
    mvr: mvr_res,
    effects,
    econ,
    warnings
  };
}
