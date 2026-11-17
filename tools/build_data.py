#!/usr/bin/env python3
"""Generate site/js/data.js: every property value and price used by the simulator.

Run:  python3 tools/build_data.py

Every value carries a sourceId (see SOURCES) and an `estimate` flag.
Raw numbers are copied verbatim from the cited source. Derived tables (LiOH
solubility, osmotic coefficient at saturation, steam cost) are computed below
from published equations so the derivation can be audited.
Standard library only.
"""
import json
import math
from pathlib import Path

ACCESSED = "2026-11-13"
ACCESSED_P2 = "2026-11-15"

SOURCES = {
    "nist-water": {
        "citation": "NIST Chemistry WebBook, SRD 69, Thermophysical Properties of Fluid Systems: Water, saturation properties (IAPWS-95 formulation, Wagner & Pruss 2002).",
        "url": "https://webbook.nist.gov/cgi/fluid.cgi?Action=Load&ID=C7732185&Type=SatP&TLow=30&THigh=150&TInc=5&Digits=6&TUnit=C&PUnit=kPa&HUnit=kJ%2Fkg",
        "accessed": ACCESSED,
    },
    "antoine-lange": {
        "citation": "Antoine constants for water (log10 P[mmHg] = A - B/(C + T[C])), A = 8.07131, B = 1730.63, C = 233.426, as tabulated in Lange's Handbook of Chemistry (via the Wikipedia 'Antoine equation' table). Checked by Claude against the NIST WebBook table: within 0.38 % from 30 to 110 C and 0.56 % at 130 C.",
        "url": "https://en.wikipedia.org/wiki/Antoine_equation",
        "accessed": ACCESSED,
        "verify": "Andrew: confirm the constants in a print copy of Lange's Handbook or Felder & Rousseau Table B.4.",
    },
    "monnin2005": {
        "citation": "Monnin, C.; Dubois, M. Thermodynamics of the LiOH + H2O system. J. Chem. Eng. Data 2005, 50 (4), 1109-1113. doi:10.1021/je0495482. Solubility fit: Eq 1 and Table 1 (LiOH.H2O, 255-373 K, 18 points from Pickering, Donk, Van Moeurs, Stephan & Miller, Ennan & Lapshin). Osmotic coefficient: Pitzer model Eqs 3-6, 8, Tables 3-4.",
        "url": "https://hal.science/hal-00350526v1/file/je0495482.pdf",
        "accessed": ACCESSED,
    },
    "eia-epm-5.6.a": {
        "citation": "U.S. EIA, Electric Power Monthly, Table 5.6.A, Average Price of Electricity to Ultimate Customers by End-Use Sector, by State, August 2026 and 2025 (released October 23, 2026).",
        "url": "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a",
        "accessed": ACCESSED,
    },
    "eia-ng-tx-ind": {
        "citation": "U.S. EIA, Texas Natural Gas Industrial Price (dollars per thousand cubic feet), monthly series N3035TX3 (released 10/30/2026).",
        "url": "https://www.eia.gov/dnav/ng/hist/n3035tx3m.htm",
        "accessed": ACCESSED,
    },
    "eia-ng-heat-content": {
        "citation": "U.S. EIA FAQ 'How do I convert natural gas prices in dollars per cubic feet to dollars per Btu?': 2025 U.S. average heat content of natural gas delivered to end users about 1,037 Btu/cf.",
        "url": "https://www.eia.gov/tools/faqs/faq.php?id=45&t=8",
        "accessed": ACCESSED,
    },
    "eia-epa-8.1": {
        "citation": "U.S. EIA, Electric Power Annual, Table 8.1, Average Operating Heat Rate for Selected Energy Sources, 2015-2025 (natural gas 2025: 7,781 Btu/kWh).",
        "url": "https://www.eia.gov/electricity/annual/html/epa_08_01.html",
        "accessed": ACCESSED,
    },
    "iupac-mw": {
        "citation": "IUPAC standard atomic weights (Li 6.94, O 15.999, H 1.008).",
        "url": "https://iupac.qmul.ac.uk/AtWt/",
        "accessed": ACCESSED,
    },
    "estimate": {
        "citation": "ESTIMATE: typical engineering value chosen by the project and not yet tied to a primary source. Shown on the site with an ESTIMATE label and adjustable with a slider.",
        "url": "",
        "accessed": ACCESSED,
    },
    "tesla-robstown": {
        "citation": "Tesla Robstown, TX lithium refinery: EnergyX blog 'Tesla's Lithium Refinery in Texas'; Spectrum News (Jan 21, 2026) 'Tesla lithium refinery in Texas is now fully operational'; Electrek. Earlier announced target: about 50 GWh/yr of battery capacity (superseded by the 2025 Impact Report figure, see tesla-impact-2025).",
        "url": "https://mynews13.com/fl/orlando/news/2026/01/21/tesla-lithium-refinery-in-texas-is-now-fully-operational",
        "accessed": "2026-10-23",
    },
    "doe-netl-2002": {
        "citation": "Loh, H.P.; Lyons, J.; White, C.W. III. Process Equipment Cost Estimation, Final Report. DOE/NETL-2002/1169, U.S. Department of Energy, National Energy Technology Laboratory, 2002 (OSTI 797810). Appendix B: ICARUS purchased and installed costs, 1st quarter 1998 dollars (shell-and-tube heat exchanger p. 58; centrifugal compressor p. 70). Table 11: CEPCI 1998 = 389.5. Stated accuracy: order-of-magnitude +50 %/-30 %.",
        "url": "https://www.osti.gov/servlets/purl/797810",
        "accessed": ACCESSED_P2,
    },
    "ce-econ-ind-2024": {
        "citation": "Chemical Engineering magazine, Economic Indicators, September 2024, p. 45: CEPCI annual index 2023 = 797.9 (1957-59 = 100); June 2024 preliminary 798.8. The 2024 and 2025 annual averages are behind the publisher's paywall (2025 reported 1.6 % above 2024).",
        "url": "https://www.chemengonline.com/wp-content/uploads/2024/08/19_CHE_0924_EconInd_p45.pdf",
        "accessed": ACCESSED_P2,
    },
    "tesla-impact-2025": {
        "citation": "Tesla, 2025 Impact Report: the Gulf Coast (Robstown, TX) refinery is to produce about 20,000 t/yr of battery-grade LiOH.H2O, enough for about 30 GWh of batteries, using an alkaline leach process. Read via Mining.com.au, 'Tesla's 2025 Impact Report outlines lithium refinery focus', and EVwire, 'Tesla 2025 Impact Report: highlights'; tesla.com blocks automated download, so the figure was not read from the PDF itself.",
        "url": "https://mining.com.au/teslas-2025-impact-report-outlines-lithium-refinery-focus/",
        "accessed": "2026-11-17",
    },
    "tesla-video": {
        "citation": "Tesla. 'Tesla Lithium Refinery' (video), YouTube channel @tesla. Embedded on the Industry Context tab; title and channel confirmed with YouTube oEmbed.",
        "url": "https://www.youtube.com/watch?v=rxYTx6aj96k",
        "accessed": "2026-11-17",
    },
    "mvr-market": {
        "citation": "Meticulous Research, evaporator/crystallizer market estimate (MVR share 55-60 %). A paid market-research estimate, not a primary source; quoted only as context.",
        "url": "",
        "accessed": ACCESSED,
    },
    "us10961126": {
        "citation": "US Patent 10,961,126 B2, Process for reducing fouling in evaporators in lithium hydroxide recovery (Veolia). Lithium carbonate scaling in LiOH evaporators; MVR, TVR and multi-effect options.",
        "url": "https://patents.google.com/patent/US10961126",
        "accessed": ACCESSED,
    },
}

# --- NIST saturation table, verbatim (T_C, P_kPa, hf, hg in kJ/kg) ---
# --- DOE/NETL 2002, Appendix B, 1st quarter 1998 dollars (verbatim) ---
# Shell and tube heat exchanger (p. 58): surface area ft2, purchased $, installed $
DOE_HX = [
    (100, 13200, 48300), (200, 13600, 55800), (300, 14500, 57300), (400, 16100, 59100),
    (500, 16200, 68000), (600, 16600, 68400), (700, 18000, 70000), (800, 18400, 70400),
    (900, 20300, 72600), (1000, 20800, 73100), (2000, 31900, 95800), (3000, 44700, 109600),
    (4000, 53900, 132900), (5000, 62100, 141800), (6000, 70800, 151100), (7000, 99600, 203500),
    (8000, 107900, 212400), (9000, 117100, 222100), (10000, 124200, 229800), (15000, 186300, 321500),
    (20000, 248400, 427000), (30000, 354000, 573900), (40000, 479100, 767500), (50000, 582500, 953000),
    (60000, 708300, 1106600), (70000, 839000, 1425600),
]
# Centrifugal compressor with motor driver (p. 70), 4-stage series: driver hp, purchased $, installed $
DOE_COMP4 = [
    (60, 595400, 702700), (125, 626400, 749300), (600, 719700, 907100), (1250, 1114800, 1339000),
    (6000, 2699800, 3247700), (12000, 5275800, 6142000), (17000, 8722600, 9735100), (25000, 9627600, 10980400),
]
FT2_PER_M2 = 1 / 0.09290304
KW_PER_HP = 0.745699872

NIST_ROWS = [
    (30.0000, 4.24697, 125.734, 2555.55),
    (35.0000, 5.62902, 146.634, 2564.55),
    (40.0000, 7.38494, 167.533, 2573.51),
    (45.0000, 9.59500, 188.435, 2582.43),
    (50.0000, 12.3519, 209.342, 2591.29),
    (55.0000, 15.7621, 230.256, 2600.09),
    (60.0000, 19.9464, 251.180, 2608.83),
    (65.0000, 25.0416, 272.116, 2617.50),
    (70.0000, 31.2009, 293.065, 2626.10),
    (75.0000, 38.5954, 314.030, 2634.60),
    (80.0000, 47.4145, 335.012, 2643.02),
    (85.0000, 57.8670, 356.015, 2651.33),
    (90.0000, 70.1818, 377.039, 2659.53),
    (95.0000, 84.6085, 398.089, 2667.61),
    (100.000, 101.418, 419.166, 2675.57),
    (105.000, 120.903, 440.274, 2683.39),
    (110.000, 143.379, 461.415, 2691.06),
    (115.000, 169.182, 482.593, 2698.58),
    (120.000, 198.674, 503.812, 2705.93),
    (125.000, 232.238, 525.074, 2713.10),
    (130.000, 270.280, 546.384, 2720.08),
    (135.000, 313.229, 567.745, 2726.87),
    (140.000, 361.539, 589.162, 2733.44),
    (145.000, 415.685, 610.638, 2739.80),
    (150.000, 476.165, 632.179, 2745.93),
]

# --- Monnin & Dubois (2005) ---
SOL_A = [-39.568, 0.48784, -1.7670e-3, 2.1431e-6]          # Table 1, LiOH.H2O, m = sum a_i T^i
Q = [86.683649, 0.0848795, -8.88878e-5, 4.88096e-8, -1327.31477, -17.6460]  # Table 3 q_i (Eq 6)
PITZER = {                                                    # Table 4 (Eq 8)
    "b0": [3.689298e-1, -1.262427e-3, 7.422313e-7, -3.968190e-1],
    "b1": [-2.201838, 1.119177e-2, -1.403500e-5, 0.0],
    "Cphi": [-1.491614e-2, 2.707400e-5, 3.591966e-8, 0.0],
}
M_LIOH = 6.94 + 15.999 + 1.008          # 23.947 g/mol
M_H2O = 2 * 1.008 + 15.999              # 18.015 g/mol


def m_sat(T_K):
    return sum(a * T_K ** i for i, a in enumerate(SOL_A))


def a_phi(T_K):
    q = Q
    return q[0] + q[1] * T_K + q[2] * T_K ** 2 + q[3] * T_K ** 3 + q[4] / T_K + q[5] * math.log(T_K)


def pitzer(name, T_K):
    c = PITZER[name]
    return c[0] + c[1] * T_K + c[2] * T_K ** 2 + c[3] / (T_K - 240.0)


def phi(m, T_K):
    """Osmotic coefficient of LiOH(aq), Monnin & Dubois Eqs 3-5 (1:1 electrolyte, I = m)."""
    s = math.sqrt(m)
    f = -a_phi(T_K) * s / (1 + 1.2 * s)
    B = pitzer("b0", T_K) + pitzer("b1", T_K) * math.exp(-2 * s)
    return 1 + f + m * B + m * m * pitzer("Cphi", T_K)


def val(value, units, sourceId, estimate=False, note=""):
    return {"value": value, "units": units, "sourceId": sourceId, "estimate": estimate, "note": note}


def build():
    temps = list(range(0, 101, 5))
    sol_points, phi_points = [], []
    for t in temps:
        T = t + 273.15
        m = m_sat(T)
        sol_points.append([t, round(m * M_LIOH / 10.0, 4)])     # g LiOH / 100 g H2O
        phi_points.append([t, round(phi(m, T), 4)])

    # Steam cost (fuel only), ESTIMATE built from EIA data
    gas_usd_mcf = 2.98                       # Texas industrial, Aug 2026
    heat_content = 1.037                     # MMBtu per Mcf
    gj_per_mmbtu = 1.055056
    usd_per_gj = gas_usd_mcf / heat_content / gj_per_mmbtu
    eta_boiler = 0.85                        # ESTIMATE
    T_feedwater = 100.0                      # ESTIMATE (condensate return)
    hg_120 = 2705.93
    hf_100 = 419.166
    dh_gj_per_t = (hg_120 - hf_100) / 1000.0  # GJ per tonne of steam
    steam_cost = dh_gj_per_t / eta_boiler * usd_per_gj

    data = {
        "meta": {
            "generatedBy": "tools/build_data.py",
            "generated": ACCESSED,
            "note": "Do not edit by hand; edit tools/build_data.py and rerun. Format: 'export const DATA = ' + strict JSON.",
        },
        "sources": SOURCES,
        "molarMass": {
            "LiOH": val(round(M_LIOH, 3), "g/mol", "iupac-mw"),
            "H2O": val(round(M_H2O, 3), "g/mol", "iupac-mw"),
            "LiOH_H2O": val(round(M_LIOH + M_H2O, 3), "g/mol", "iupac-mw"),
        },
        "constants": {
            "R": val(8.314, "J/(mol K)", "iupac-mw", False, "Gas constant (CODATA 8.314462618)."),
            "Rv": val(461.5, "J/(kg K)", "iupac-mw", False, "R / M_H2O = 8.314 / 0.018015."),
            "gamma": val(1.33, "-", "estimate", True, "Heat-capacity ratio of low-pressure steam, ideal-gas approximation."),
        },
        "antoine": {
            "A": 8.07131, "B": 1730.63, "C": 233.426,
            "form": "log10(P/mmHg) = A - B/(C + T/degC); P_kPa = P_mmHg * 0.133322",
            "validRange_C": [1, 100],
            "checkedRange_C": [30, 130],
            "sourceId": "antoine-lange", "estimate": False,
            "note": "One constant set is used over the whole simulator range (30-130 C); error vs NIST is -0.38 % at 55-65 C, cancelling in the pressure ratio.",
        },
        "steamTable": {
            "columns": ["T_C", "P_kPa", "hf_kJkg", "hg_kJkg", "hfg_kJkg"],
            "rows": [[t, p, hf, hg, round(hg - hf, 3)] for (t, p, hf, hg) in NIST_ROWS],
            "sourceId": "nist-water", "estimate": False,
            "note": "Verbatim NIST values; hfg = hg - hf. Linear interpolation between rows.",
        },
        "solubility": {
            "columns": ["T_C", "s_g_per_100g_H2O"],
            "points": sol_points,
            "solidPhase": "LiOH.H2O (stable solid from the eutectic, 254.9 K, to the peritectic, 378.3 K)",
            "sourceId": "monnin2005", "estimate": False,
            "note": "Computed from Monnin & Dubois Eq 1 (fit to 18 critically selected literature points), m_sat in mol/kg converted with M_LiOH = 23.947 g/mol. Linear interpolation between points. Impurities assumed not to change solubility.",
        },
        "osmoticSat": {
            "columns": ["T_C", "phi"],
            "points": phi_points,
            "sourceId": "monnin2005", "estimate": False,
            "note": "Osmotic coefficient of SATURATED LiOH(aq), from the Monnin & Dubois Pitzer model (Eqs 3-6, 8). It enters BPE = phi * i * Kb * m. The model's only data between 273 and 373 K are at 298.15 K (plus 393-443 K isopiestic data), so 40-100 C values are model interpolation; treat as +/-0.05.",
        },
        "compressor": {
            "etaIs": val(0.75, "-", "estimate", True, "Isentropic efficiency; slider 0.60-0.85."),
            "etaMotor": val(0.95, "-", "estimate", True, "Motor/drive efficiency; slider 0.90-0.97."),
            "rMaxSingleStage": val(2.0, "-", "estimate", True, "Warn above this pressure ratio per stage (fans ~1.2-1.4, centrifugal ~1.8-2)."),
            "dT_heater": val(6, "K", "estimate", True, "Condensing-side driving force in the MVR heater."),
            "specificEnergyRange": val([20, 60], "kWh/t water", "estimate", True, "Plausibility band shown on plots."),
        },
        "evaporator": {
            "U": val(2000, "W/(m2 K)", "estimate", True, "Forced-circulation evaporator overall coefficient (Phase 2)."),
            "dTmin": val(5, "K", "estimate", True, "Minimum useful driving force per effect."),
            "Ts_C": val(120, "C", "estimate", True, "Heating steam saturation temperature (multi-effect)."),
            "Tlast_C": val(50, "C", "estimate", True, "Last-effect condenser temperature (cooling-water limited)."),
            "cpFeed": val(4.0, "kJ/(kg K)", "estimate", True, "Feed liquor heat capacity; only used if feed is subcooled."),
        },
        "prices": {
            "electricity": val(0.0721, "$/kWh", "eia-epm-5.6.a", False, "Texas industrial, August 2026 (7.21 c/kWh; August 2025: 6.42). U.S. industrial August 2026: 9.64."),
            "gasTexasIndustrial": val(gas_usd_mcf, "$/Mcf", "eia-ng-tx-ind", False, "August 2026. Prior 12 months ranged 2.84-6.33 $/Mcf."),
            "gasHeatContent": val(heat_content, "MMBtu/Mcf", "eia-ng-heat-content"),
            "boilerEfficiency": val(eta_boiler, "-", "estimate", True, "Gas-fired boiler, fuel to steam."),
            "feedwaterT_C": val(T_feedwater, "C", "estimate", True, "Boiler feedwater (condensate return) temperature."),
            "steam": val(round(steam_cost, 2), "$/t steam", "estimate", True,
                         "FUEL-ONLY steam cost = gas $/GJ x (hg(120 C) - hf(100 C)) / eta_boiler "
                         f"= {usd_per_gj:.3f} $/GJ x {dh_gj_per_t:.4f} GJ/t / {eta_boiler} = {steam_cost:.2f} $/t. "
                         "Excludes boiler capital, water treatment, labor; real steam costs more."),
            "gridHeatRate": val(7781, "Btu/kWh", "eia-epa-8.1", False, "Natural gas plants, 2025: 2.28 kWh of fuel per kWh of electricity."),
        },
        "feed": {
            "xF": val(0.060, "mass frac LiOH", "estimate", True, "Purified liquor to the crystallizer; no published figure found yet."),
            "zF": val(0.0010, "mass frac NaOH-eq", "estimate", True, "Na impurity in feed."),
            "epsilon": val(0.03, "kg liquor / kg crystals", "estimate", True, "Adhering mother liquor after centrifuge and wash."),
        },
        "industry": {
            "teslaOutput": val(20000, "t LiOH.H2O / yr", "tesla-impact-2025", False, "About 20,000 t/yr (2025 Impact Report)."),
            "teslaCapacity": val(30, "GWh/yr battery capacity", "tesla-impact-2025", False, "About 30 GWh/yr (2025 Impact Report); 50 GWh was the earlier announced target (tesla-robstown)."),
            "mvrShare": val("55-60", "% of evaporator/crystallizer market", "mvr-market", True, "Market-research estimate, not a primary source."),
        },
        "capital": {
            "basis": "INSTALLED cost (equipment + setting + installation bulks), DOE/NETL Appendix B, escalated from 1998 to 2023 dollars by CEPCI ratio. Interpolated log-log between rows; no extrapolation outside the table.",
            "heaterShellTube": {
                "columns": ["area_m2", "purchased_usd1998", "installed_usd1998"],
                "rows": [[round(a / FT2_PER_M2, 3), pc, ic] for (a, pc, ic) in DOE_HX],
                "sourceId": "doe-netl-2002", "estimate": False,
                "note": "Carbon-steel shell-and-tube (A285C shell, A214 tubes), 150 psig; areas converted from ft2 (x 0.09290304). A forced-circulation crystallizer heater is a shell-and-tube exchanger; LiOH service would need better alloys (cost higher, not modeled).",
            },
            "compressor": {
                "columns": ["shaft_kW", "purchased_usd1998", "installed_usd1998"],
                "rows": [[round(hp * KW_PER_HP, 2), pc, ic] for (hp, pc, ic) in DOE_COMP4],
                "sourceId": "doe-netl-2002", "estimate": True,
                "note": "PROXY: DOE 4-stage centrifugal air compressor with motor (3:1 ratio, MW 29), cost vs driver power (hp x 0.7457 = kW). An MVR compressor is a single-stage, large-volume steam machine; using driver power as the size parameter is a stated approximation (ESTIMATE).",
            },
            "cepciBase": val(389.5, "-", "doe-netl-2002", False, "CEPCI 1998 annual average (DOE report Table 11)."),
            "cepciNow": val(797.9, "-", "ce-econ-ind-2024", False, "CEPCI 2023 annual average, latest annual value available without a subscription."),
            "interest": val(0.10, "1/yr", "estimate", True, "Interest (discount) rate for annualizing capital; slider 0.05-0.15."),
            "life_yr": val(10, "yr", "estimate", True, "Equipment life for annualizing capital; slider 5-20."),
        },
        "spec": {
            "naMax_ppm": val(None, "ppm Na", "estimate", True, "SOURCE NEEDED: GB/T 26008-2020 Table 1 or a producer data sheet. Spec line hidden until sourced."),
        },
    }
    return data


def main():
    data = build()
    out = Path(__file__).resolve().parent.parent / "site" / "js" / "data.js"
    text = ("// GENERATED by tools/build_data.py. Do not edit by hand.\n"
            "// Every value cites DATA.sources[sourceId]; estimate:true means flagged ESTIMATE on the site.\n"
            "export const DATA = " + json.dumps(data, indent=2) + ";\n")
    out.write_text(text)
    print(f"wrote {out}  ({len(text)} bytes)")
    print("steam $/t", data["prices"]["steam"]["value"])
    print("s(60C)", dict(map(tuple, data["solubility"]["points"]))[60], "phi(60C)", dict(map(tuple, data["osmoticSat"]["points"]))[60])


if __name__ == "__main__":
    main()
