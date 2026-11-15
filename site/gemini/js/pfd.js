/**
 * Process Flow Diagram (PFD) for MVR Evaporative Crystallizer
 * Renders an inline responsive SVG with live stream text labels.
 */

export function renderPFD(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <svg class="pfd-svg" viewBox="0 0 960 450" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Marker arrows -->
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--pfd-stream, #1e40af)" />
        </marker>
        <marker id="arrow-vapor" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-purge" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#b91c1c" />
        </marker>
        <marker id="arrow-prod" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#15803d" />
        </marker>
      </defs>

      <!-- Background & Border Grid -->
      <rect x="5" y="5" width="950" height="440" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />

      <!-- EQUIPMENT: Evaporative Crystallizer Body -->
      <g class="pfd-equipment" id="eq-crystallizer">
        <!-- Main Body -->
        <rect x="360" y="80" width="160" height="150" rx="8" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" />
        <!-- Conical Bottom -->
        <polygon points="360,230 520,230 460,310 420,310" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" />
        <!-- Vapor dome -->
        <path d="M 360,80 Q 440,50 520,80" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" />
        <!-- Liquid Level -->
        <path d="M 365,150 Q 400,147 440,150 T 515,150" fill="none" stroke="#38bdf8" stroke-dasharray="4,3" stroke-width="2" />
        <text x="440" y="175" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#0369a1">Crystallizer Body</text>
        <text x="440" y="195" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#0284c7">Flash & Crystal Growth</text>
      </g>

      <!-- EQUIPMENT: External Slurry Heat Exchanger -->
      <g class="pfd-equipment" id="eq-heater">
        <rect x="180" y="120" width="80" height="150" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
        <!-- Tube lines -->
        <line x1="195" y1="130" x2="195" y2="260" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,2" />
        <line x1="220" y1="130" x2="220" y2="260" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,2" />
        <line x1="245" y1="130" x2="245" y2="260" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,2" />
        <text x="220" y="195" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#92400e">Heater (HX)</text>
        <text x="220" y="210" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#b45309">Shell & Tube</text>
      </g>

      <!-- EQUIPMENT: Circulation Pump -->
      <g class="pfd-equipment" id="eq-pump">
        <circle cx="300" cy="360" r="22" fill="#f1f5f9" stroke="#475569" stroke-width="2" />
        <polygon points="300,342 318,360 300,378" fill="#64748b" />
        <text x="300" y="398" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#475569">Circ. Pump</text>
      </g>

      <!-- EQUIPMENT: MVR Vapor Compressor -->
      <g class="pfd-equipment" id="eq-compressor">
        <!-- Casing trapezoid: wider intake right, narrower discharge left -->
        <polygon points="580,45 660,65 660,115 580,135" fill="#e2e8f0" stroke="#334155" stroke-width="2" />
        <rect x="670" y="75" width="30" height="30" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="1.5" />
        <line x1="660" y1="90" x2="670" y2="90" stroke="#334155" stroke-width="3" />
        <text x="620" y="94" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1e293b">MVR</text>
        <text x="685" y="94" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#f8fafc">M</text>
        <text x="620" y="150" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#475569">Compressor</text>
      </g>

      <!-- EQUIPMENT: Centrifuge / Filter -->
      <g class="pfd-equipment" id="eq-centrifuge">
        <polygon points="700,280 770,280 750,330 720,330" fill="#fbcfe8" stroke="#be185d" stroke-width="2" />
        <line x1="710" y1="295" x2="760" y2="295" stroke="#db2777" stroke-width="1.5" stroke-dasharray="2,2" />
        <text x="735" y="310" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#9d174d">Centrifuge</text>
        <text x="735" y="348" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#be185d">& Washing</text>
      </g>

      <!-- PIPELINES & STREAMS -->
      <!-- 1. Feed Stream -->
      <path d="M 20,200 L 140,200 L 140,360 L 278,360" fill="none" stroke="#1e40af" stroke-width="2.5" marker-end="url(#arrow)" />

      <!-- 2. Circulation Loop -->
      <path d="M 440,310 L 440,360 L 322,360" fill="none" stroke="#0284c7" stroke-width="2.5" marker-end="url(#arrow)" />
      <path d="M 300,338 L 300,300 L 220,300 L 220,270" fill="none" stroke="#0284c7" stroke-width="2.5" marker-end="url(#arrow)" />
      <path d="M 220,120 L 220,95 L 360,95" fill="none" stroke="#0284c7" stroke-width="2.5" marker-end="url(#arrow)" />

      <!-- 3. Vapor Suction Stream -->
      <path d="M 440,65 L 440,30 L 660,30 L 660,65" fill="none" stroke="#0284c7" stroke-width="2.5" marker-end="url(#arrow-vapor)" />

      <!-- 4. Compressed Vapor Discharge Stream -->
      <path d="M 580,90 L 550,90 L 550,150 L 260,150" fill="none" stroke="#ea580c" stroke-width="2.5" marker-end="url(#arrow)" />

      <!-- 5. Condensate Drain Stream -->
      <path d="M 220,270 L 220,285 L 140,285 L 140,410 L 20,410" fill="none" stroke="#0284c7" stroke-width="2" marker-end="url(#arrow-vapor)" />

      <!-- 6. Slurry to Centrifuge Stream -->
      <path d="M 460,290 L 735,290 L 735,278" fill="none" stroke="#6b21a8" stroke-width="2" marker-end="url(#arrow)" />

      <!-- 7. Mother Liquor Purge Stream -->
      <path d="M 725,330 L 725,410 L 630,410" fill="none" stroke="#b91c1c" stroke-width="2" marker-end="url(#arrow-purge)" />

      <!-- 8. Product Crystal Stream -->
      <path d="M 745,330 L 745,410 L 850,410" fill="none" stroke="#15803d" stroke-width="2.5" marker-end="url(#arrow-prod)" />

      <!-- DATA OVERLAY CARDS / BADGES -->
      <!-- Feed Badge -->
      <g class="pfd-badge" transform="translate(15, 140)">
        <rect width="115" height="52" rx="4" fill="#ffffff" stroke="#1e40af" stroke-width="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="6" y="14" font-family="sans-serif" font-weight="bold" font-size="10.5" fill="#1e40af">FEED (F)</text>
        <text id="pfd-feed-f" x="6" y="29" font-family="sans-serif" font-size="10" fill="#1e293b">10,000 kg/h</text>
        <text id="pfd-feed-xf" x="6" y="44" font-family="sans-serif" font-size="10" fill="#475569">6.0 wt% LiOH</text>
      </g>

      <!-- Vapor Suction Badge -->
      <g class="pfd-badge" transform="translate(460, 10)">
        <rect width="130" height="52" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="6" y="14" font-family="sans-serif" font-weight="bold" font-size="10.5" fill="#0284c7">SUCTION VAPOR (V)</text>
        <text id="pfd-vapor-v" x="6" y="29" font-family="sans-serif" font-size="10" fill="#1e293b">8,558 kg/h</text>
        <text id="pfd-vapor-state" x="6" y="44" font-family="sans-serif" font-size="10" fill="#475569">56.1 °C | 16.5 kPa</text>
      </g>

      <!-- Compressor Discharge Badge -->
      <g class="pfd-badge" transform="translate(710, 45)">
        <rect width="155" height="66" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="6" y="14" font-family="sans-serif" font-weight="bold" font-size="10.5" fill="#ea580c">COMPRESSOR WORK</text>
        <text id="pfd-comp-w" x="6" y="29" font-family="sans-serif" font-size="10" fill="#1e293b">248 kW (elec)</text>
        <text id="pfd-comp-r" x="6" y="44" font-family="sans-serif" font-size="10" fill="#475569">r = 1.58 | ΔT = 9.9 K</text>
        <text id="pfd-comp-t2" x="6" y="58" font-family="sans-serif" font-size="9.5" fill="#c2410c">T₂ = 113.4 °C (superheat)</text>
      </g>

      <!-- Condensate Badge -->
      <g class="pfd-badge" transform="translate(15, 365)">
        <rect width="115" height="42" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="6" y="14" font-family="sans-serif" font-weight="bold" font-size="10.5" fill="#0284c7">CONDENSATE</text>
        <text id="pfd-cond-v" x="6" y="29" font-family="sans-serif" font-size="10" fill="#1e293b">8,558 kg/h (at 66 °C)</text>
      </g>

      <!-- Mother Liquor Purge Badge -->
      <g class="pfd-badge" transform="translate(500, 375)">
        <rect width="125" height="52" rx="4" fill="#ffffff" stroke="#b91c1c" stroke-width="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="6" y="14" font-family="sans-serif" font-weight="bold" font-size="10.5" fill="#b91c1c">PURGE (P)</text>
        <text id="pfd-purge-p" x="6" y="29" font-family="sans-serif" font-size="10" fill="#1e293b">500 kg/h</text>
        <text id="pfd-purge-zml" x="6" y="44" font-family="sans-serif" font-size="10" fill="#475569">z_ML = 2.0 wt% Na</text>
      </g>

      <!-- Product Crystals Badge -->
      <g class="pfd-badge" transform="translate(800, 355)">
        <rect width="145" height="68" rx="4" fill="#ffffff" stroke="#15803d" stroke-width="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))" />
        <text x="6" y="14" font-family="sans-serif" font-weight="bold" font-size="10.5" fill="#15803d">PRODUCT (C)</text>
        <text id="pfd-prod-c" x="6" y="29" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1e293b">942 kg/h LiOH·H₂O</text>
        <text id="pfd-prod-yield" x="6" y="44" font-family="sans-serif" font-size="10" fill="#166534">Yield: 89.6%</text>
        <text id="pfd-prod-impurity" x="6" y="58" font-family="sans-serif" font-size="9.5" fill="#475569">Impurity: 583 ppm Na</text>
      </g>
    </svg>
  `;
}

/**
 * Updates the text nodes inside the PFD SVG with current simulation results.
 */
export function updatePFD(sim) {
  const safeSet = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const { inputs, mass, mvr } = sim;

  // Feed
  safeSet('pfd-feed-f', `${Number(inputs.F).toLocaleString()} kg/h`);
  safeSet('pfd-feed-xf', `${(inputs.xF * 100).toFixed(1)} wt% LiOH`);

  // Vapor Suction
  if (mass.V != null) {
    safeSet('pfd-vapor-v', `${Math.round(mass.V).toLocaleString()} kg/h`);
    safeSet('pfd-cond-v', `${Math.round(mass.V).toLocaleString()} kg/h (at ${mvr.Tc_C.toFixed(1)} °C)`);
  } else {
    safeSet('pfd-vapor-v', '— kg/h (infeasible)');
    safeSet('pfd-cond-v', '— kg/h');
  }
  safeSet('pfd-vapor-state', `${mvr.Tv_C.toFixed(1)} °C | ${mvr.P1.toFixed(1)} kPa`);

  // Compressor
  if (mvr.Welec_kW != null) {
    safeSet('pfd-comp-w', `${Math.round(mvr.Welec_kW)} kW (${mvr.kWh_per_t.toFixed(1)} kWh/t)`);
  } else {
    safeSet('pfd-comp-w', '— kW');
  }
  safeSet('pfd-comp-r', `r = ${mvr.r.toFixed(2)} | ΔT = ${mvr.lift.toFixed(1)} K`);
  safeSet('pfd-comp-t2', `T₂ = ${mvr.T2_C.toFixed(1)} °C (superheat)`);

  // Purge
  if (mass.P != null) {
    safeSet('pfd-purge-p', `${Math.round(mass.P).toLocaleString()} kg/h`);
    safeSet('pfd-purge-zml', `z_ML = ${(mass.zML * 100).toFixed(2)} wt% Na`);
  } else {
    safeSet('pfd-purge-p', '— kg/h');
    safeSet('pfd-purge-zml', '—');
  }

  // Product Crystals
  if (mass.C != null) {
    safeSet('pfd-prod-c', `${Math.round(mass.C).toLocaleString()} kg/h LiOH·H₂O`);
    safeSet('pfd-prod-yield', `Yield: ${(mass.liYield * 100).toFixed(1)}%`);
    safeSet('pfd-prod-impurity', `Impurity: ${Math.round(mass.productImpurity_ppm)} ppm Na`);
  } else {
    safeSet('pfd-prod-c', '— kg/h LiOH·H₂O');
    safeSet('pfd-prod-yield', 'Yield: —');
    safeSet('pfd-prod-impurity', 'Impurity: —');
  }
}
