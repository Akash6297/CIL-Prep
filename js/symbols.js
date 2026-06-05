// ═══════════════════════════════════════════════════════════════
//  CIRCUIT & LOGIC SYMBOLS — CIL MT E&T Practice
//  Symbols follow IEEE Std 315 / IEC 60617 standards
// ═══════════════════════════════════════════════════════════════

// SVG helper — all drawn on a 120×60 viewBox, stroke-based, no fill
// Primary wire colour uses currentColor so it works in dark mode

const _S = {
  // ── Passive ─────────────────────────────────────────────────
  resistor: {
    name: 'Resistor',
    category: 'passive',
    catLabel: 'Passive Component',
    description: 'A resistor opposes the flow of electric current. Its opposition is measured in Ohms (Ω). Governed by Ohm\'s Law: V = IR. In CIL exams, resistors appear in divider networks, biasing circuits, and RC/RL filters.',
    unit: 'Ohm (Ω)',
    symbol_notation: 'R',
    standard: 'IEEE Std 315 / IEC 60617-4',
    key_use: 'Current limiting, voltage dividers, biasing BJT/FET',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="20" y2="30"/>
  <polyline points="20,30 25,18 33,42 41,18 49,42 57,18 65,42 73,18 81,42 86,30"/>
  <line x1="86" y1="30" x2="120" y2="30"/>
  <text x="60" y="57" text-anchor="middle" font-size="9" fill="currentColor" stroke="none" opacity=".6">R</text>
</svg>`
  },

  variable_resistor: {
    name: 'Variable Resistor (Rheostat)',
    category: 'passive',
    catLabel: 'Passive Component',
    description: 'A resistor whose resistance can be adjusted manually. Used as a rheostat (2-terminal) or potentiometer (3-terminal). Commonly seen in motor speed control and voltage divider applications.',
    unit: 'Ohm (Ω)',
    symbol_notation: 'VR / RV',
    standard: 'IEEE Std 315',
    key_use: 'Speed control, volume control, variable biasing',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="20" y2="30"/>
  <polyline points="20,30 25,18 33,42 41,18 49,42 57,18 65,42 73,18 81,42 86,30"/>
  <line x1="86" y1="30" x2="120" y2="30"/>
  <line x1="53" y1="10" x2="68" y2="25" stroke="currentColor"/>
  <polyline points="63,10 68,10 68,15" stroke="currentColor"/>
</svg>`
  },

  capacitor: {
    name: 'Capacitor (Non-polarized)',
    category: 'passive',
    catLabel: 'Passive Component',
    description: 'Stores electric charge (energy in electric field) between two parallel plates. Unit: Farad (F). In AC circuits: Xc = 1/(2πfC). Blocks DC, passes AC. Key topic in filter design and RC time constants (τ = RC).',
    unit: 'Farad (F)',
    symbol_notation: 'C',
    standard: 'IEEE Std 315 / IEC 60617-4',
    key_use: 'Filtering, coupling, decoupling, timing circuits',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="52" y2="30"/>
  <line x1="52" y1="14" x2="52" y2="46"/>
  <line x1="68" y1="14" x2="68" y2="46"/>
  <line x1="68" y1="30" x2="120" y2="30"/>
  <text x="60" y="57" text-anchor="middle" font-size="9" fill="currentColor" stroke="none" opacity=".6">C</text>
</svg>`
  },

  electrolytic_capacitor: {
    name: 'Electrolytic Capacitor (Polarized)',
    category: 'passive',
    catLabel: 'Passive Component',
    description: 'A polarized capacitor with higher capacitance values. The positive plate (+) must always be at higher potential. Commonly used in power supply filtering. Reversed polarity causes failure.',
    unit: 'Farad (F)',
    symbol_notation: 'C',
    standard: 'IEEE Std 315',
    key_use: 'Power supply filtering, decoupling',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="52" y2="30"/>
  <line x1="52" y1="14" x2="52" y2="46"/>
  <path d="M 68 14 Q 75 30 68 46" stroke="currentColor" fill="none"/>
  <line x1="68" y1="30" x2="120" y2="30"/>
  <text x="46" y="12" text-anchor="middle" font-size="9" fill="currentColor" stroke="none">+</text>
</svg>`
  },

  inductor: {
    name: 'Inductor (Coil)',
    category: 'passive',
    catLabel: 'Passive Component',
    description: 'Stores energy in a magnetic field when current flows. Unit: Henry (H). In AC circuits: XL = 2πfL. Blocks AC, passes DC — opposite to capacitor. Key in LC filters, oscillators, and transformers.',
    unit: 'Henry (H)',
    symbol_notation: 'L',
    standard: 'IEEE Std 315 / IEC 60617-4',
    key_use: 'Filters, oscillators, chokes, transformers',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="32" x2="18" y2="32"/>
  <path d="M18,32 Q23,14 30,32 Q35,14 42,32 Q47,14 54,32 Q59,14 66,32 Q71,14 78,32 Q83,14 90,32 Q95,14 102,32"/>
  <line x1="102" y1="32" x2="120" y2="32"/>
  <text x="60" y="56" text-anchor="middle" font-size="9" fill="currentColor" stroke="none" opacity=".6">L</text>
</svg>`
  },

  transformer: {
    name: 'Transformer',
    category: 'passive',
    catLabel: 'Passive Component',
    description: 'Two magnetically coupled coils — primary and secondary. Voltage ratio = Turns ratio: V1/V2 = N1/N2. Used for voltage step-up/step-down, impedance matching, and isolation. Ideal transformer: V1I1 = V2I2.',
    unit: 'Turns ratio (N1:N2)',
    symbol_notation: 'T',
    standard: 'IEEE Std 315',
    key_use: 'Step-up/step-down voltage, impedance matching, isolation',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="20" x2="18" y2="20"/>
  <path d="M18,20 Q22,8 27,20 Q31,8 36,20 Q40,8 45,20 Q49,8 54,20"/>
  <line x1="54" y1="20" x2="66" y2="20"/>
  <path d="M66,20 Q70,8 75,20 Q79,8 84,20 Q88,8 93,20 Q97,8 102,20"/>
  <line x1="102" y1="20" x2="120" y2="20"/>
  <line x1="0" y1="40" x2="18" y2="40"/>
  <path d="M18,40 Q22,52 27,40 Q31,52 36,40 Q40,52 45,40 Q49,52 54,40"/>
  <line x1="54" y1="40" x2="66" y2="40"/>
  <path d="M66,40 Q70,52 75,40 Q79,52 84,40 Q88,52 93,40 Q97,52 102,40"/>
  <line x1="102" y1="40" x2="120" y2="40"/>
  <line x1="60" y1="10" x2="60" y2="50" stroke-dasharray="3,2"/>
</svg>`
  },

  // ── Semiconductors ──────────────────────────────────────────
  diode: {
    name: 'Diode (PN Junction)',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'Allows current to flow in one direction only (Anode → Cathode). Forward bias ≈ 0.7V (Si). Reverse bias blocks current. Key equation: Shockley diode equation. Used for rectification — half-wave and full-wave.',
    unit: 'Volts (forward voltage)',
    symbol_notation: 'D',
    standard: 'IEEE Std 315',
    key_use: 'Rectification, clipping, clamping circuits',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="44" y2="30"/>
  <polygon points="44,14 44,46 76,30" fill="currentColor" opacity=".15" stroke="currentColor"/>
  <line x1="76" y1="14" x2="76" y2="46"/>
  <line x1="76" y1="30" x2="120" y2="30"/>
  <text x="40" y="56" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" opacity=".7">A</text>
  <text x="80" y="56" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" opacity=".7">K</text>
</svg>`
  },

  zener_diode: {
    name: 'Zener Diode',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'Designed to operate in reverse breakdown (Zener/avalanche). Maintains a constant voltage Vz across terminals when reverse biased beyond Vz. Used in voltage regulation circuits.',
    unit: 'Volts (Zener voltage Vz)',
    symbol_notation: 'ZD',
    standard: 'IEEE Std 315',
    key_use: 'Voltage regulation, reference voltage source',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="44" y2="30"/>
  <polygon points="44,14 44,46 76,30" fill="currentColor" opacity=".15" stroke="currentColor"/>
  <path d="M 68,14 L 76,14 L 76,46 L 84,46" stroke="currentColor"/>
  <line x1="76" y1="30" x2="120" y2="30"/>
</svg>`
  },

  led: {
    name: 'LED (Light Emitting Diode)',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'Emits light when forward biased. Forward voltage typically 1.8–3.3V depending on colour. Works on electroluminescence principle. Used in displays, indicators, and optical fibre transmitters.',
    unit: 'Volts (Vf ≈ 2V)',
    symbol_notation: 'LED / D',
    standard: 'IEEE Std 315',
    key_use: 'Indicators, displays, optocouplers, fibre optic transmitter',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="44" y2="30"/>
  <polygon points="44,14 44,46 76,30" fill="currentColor" opacity=".15" stroke="currentColor"/>
  <line x1="76" y1="14" x2="76" y2="46"/>
  <line x1="76" y1="30" x2="120" y2="30"/>
  <line x1="82" y1="10" x2="92" y2="2" marker-end="url(#arr)" stroke="currentColor"/>
  <line x1="88" y1="16" x2="98" y2="8" stroke="currentColor"/>
  <text x="87" y="5" font-size="7" fill="currentColor" stroke="none">▶</text>
  <text x="93" y="12" font-size="7" fill="currentColor" stroke="none">▶</text>
</svg>`
  },

  bjt_npn: {
    name: 'BJT — NPN Transistor',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'Bipolar Junction Transistor with N-P-N structure. Emitter arrow points OUT (away from base). Current controlled device: IC = β·IB. Operates in Active, Saturation, and Cutoff regions. Used for amplification and switching.',
    unit: 'β (current gain, typically 50–300)',
    symbol_notation: 'Q',
    standard: 'IEEE Std 315',
    key_use: 'Amplification (CE, CB, CC), switching circuits, oscillators',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="68" cy="30" r="22"/>
  <line x1="0" y1="30" x2="46" y2="30"/>
  <line x1="46" y1="14" x2="46" y2="46"/>
  <line x1="46" y1="20" x2="68" y2="12"/>
  <line x1="46" y1="40" x2="68" y2="48"/>
  <line x1="68" y1="12" x2="68" y2="0"/>
  <line x1="68" y1="48" x2="68" y2="60"/>
  <polygon points="62,44 68,48 64,54" fill="currentColor"/>
  <text x="6" y="26" font-size="8" fill="currentColor" stroke="none" opacity=".6">B</text>
  <text x="72" y="8"  font-size="8" fill="currentColor" stroke="none" opacity=".6">C</text>
  <text x="72" y="58" font-size="8" fill="currentColor" stroke="none" opacity=".6">E</text>
</svg>`
  },

  bjt_pnp: {
    name: 'BJT — PNP Transistor',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'Bipolar Junction Transistor with P-N-P structure. Emitter arrow points IN (toward base). Current flows from emitter to collector. Complementary to NPN — used in push-pull amplifiers and complementary pairs.',
    unit: 'β (current gain)',
    symbol_notation: 'Q',
    standard: 'IEEE Std 315',
    key_use: 'Push-pull amplifiers, complementary switching, sourcing current',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="68" cy="30" r="22"/>
  <line x1="0" y1="30" x2="46" y2="30"/>
  <line x1="46" y1="14" x2="46" y2="46"/>
  <line x1="46" y1="20" x2="68" y2="12"/>
  <line x1="46" y1="40" x2="68" y2="48"/>
  <line x1="68" y1="12" x2="68" y2="0"/>
  <line x1="68" y1="48" x2="68" y2="60"/>
  <polygon points="52,18 46,20 50,26" fill="currentColor"/>
  <text x="6" y="26" font-size="8" fill="currentColor" stroke="none" opacity=".6">B</text>
  <text x="72" y="8"  font-size="8" fill="currentColor" stroke="none" opacity=".6">C</text>
  <text x="72" y="58" font-size="8" fill="currentColor" stroke="none" opacity=".6">E</text>
</svg>`
  },

  nmos: {
    name: 'N-Channel MOSFET (Enhancement)',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'Metal Oxide Semiconductor FET. Enhancement mode: channel forms only when VGS > Vth. Voltage controlled device — gate draws no current. High input impedance. Used in digital ICs and power electronics.',
    unit: 'Threshold voltage Vth',
    symbol_notation: 'M / Q',
    standard: 'IEEE Std 315',
    key_use: 'Digital switching, CMOS logic, power converters',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="30" y2="30"/>
  <line x1="30" y1="22" x2="30" y2="38"/>
  <line x1="34" y1="16" x2="34" y2="44"/>
  <line x1="38" y1="18" x2="38" y2="28"/>
  <line x1="38" y1="32" x2="38" y2="42"/>
  <line x1="38" y1="23" x2="60" y2="23"/>
  <line x1="38" y1="37" x2="60" y2="37"/>
  <line x1="60" y1="12" x2="60" y2="23"/>
  <line x1="60" y1="37" x2="60" y2="48"/>
  <line x1="60" y1="12" x2="80" y2="12"/>
  <line x1="60" y1="48" x2="80" y2="48"/>
  <line x1="80" y1="12" x2="80" y2="48"/>
  <line x1="80" y1="30" x2="120" y2="30"/>
  <polygon points="52,34 58,37 52,40" fill="currentColor"/>
  <text x="6"  y="26" font-size="8" fill="currentColor" stroke="none" opacity=".6">G</text>
  <text x="84" y="10" font-size="8" fill="currentColor" stroke="none" opacity=".6">D</text>
  <text x="84" y="50" font-size="8" fill="currentColor" stroke="none" opacity=".6">S</text>
</svg>`
  },

  op_amp: {
    name: 'Operational Amplifier (Op-Amp)',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'High gain differential voltage amplifier. Ideal op-amp: infinite input impedance, zero output impedance, infinite open-loop gain (AOL → ∞), infinite bandwidth. Rules: V+ = V−, I_in = 0. Used in inverting/non-inverting amplifiers, integrators, differentiators, comparators.',
    unit: 'Gain A (V/V)',
    symbol_notation: 'U / IC',
    standard: 'IEEE Std 315',
    key_use: 'Amplifiers, integrators, differentiators, comparators, filters',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="20,4 20,56 96,30" fill="currentColor" opacity=".08" stroke="currentColor"/>
  <line x1="0"  y1="18" x2="20" y2="18"/>
  <line x1="0"  y1="42" x2="20" y2="42"/>
  <line x1="96" y1="30" x2="120" y2="30"/>
  <text x="26" y="22" font-size="9" fill="currentColor" stroke="none">−</text>
  <text x="26" y="46" font-size="9" fill="currentColor" stroke="none">+</text>
  <text x="4"  y="14" font-size="7" fill="currentColor" stroke="none" opacity=".7">V−</text>
  <text x="4"  y="50" font-size="7" fill="currentColor" stroke="none" opacity=".7">V+</text>
  <text x="100" y="27" font-size="7" fill="currentColor" stroke="none" opacity=".7">Vo</text>
</svg>`
  },

  // ── Logic Gates ──────────────────────────────────────────────
  and_gate: {
    name: 'AND Gate',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'Output is HIGH (1) only when ALL inputs are HIGH. Boolean expression: Y = A·B (A AND B). Truth table: 0·0=0, 0·1=0, 1·0=0, 1·1=1. Universal building block of digital circuits.',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: 'Y = A·B',
    standard: 'IEEE Std 91a / IEC 60617-12',
    key_use: 'Masking, enable/disable signals, coincidence detection',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="20" x2="30" y2="20"/>
  <line x1="0"  y1="40" x2="30" y2="40"/>
  <line x1="30" y1="10" x2="30" y2="50"/>
  <path d="M30,10 L65,10 Q90,10 90,30 Q90,50 65,50 L30,50 Z" fill="currentColor" opacity=".07"/>
  <path d="M30,10 L65,10 Q90,10 90,30 Q90,50 65,50 L30,50"/>
  <line x1="90" y1="30" x2="120" y2="30"/>
</svg>`
  },

  or_gate: {
    name: 'OR Gate',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'Output is HIGH (1) when ANY input is HIGH. Boolean: Y = A+B (A OR B). Truth table: 0+0=0, 0+1=1, 1+0=1, 1+1=1. Used in combining signals and alarm circuits.',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: 'Y = A+B',
    standard: 'IEEE Std 91a',
    key_use: 'Signal combining, error detection, alarm circuits',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="20" x2="32" y2="20"/>
  <line x1="0"  y1="40" x2="32" y2="40"/>
  <path d="M28,10 Q38,30 28,50 L66,50 Q100,50 90,30 Q100,10 66,10 Z" fill="currentColor" opacity=".07"/>
  <path d="M28,10 Q38,30 28,50 L66,50 Q100,50 90,30 Q100,10 66,10 Z"/>
  <line x1="90" y1="30" x2="120" y2="30"/>
</svg>`
  },

  not_gate: {
    name: 'NOT Gate (Inverter)',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'Inverts the input. Output is the complement of the input. Boolean: Y = A\' (NOT A). A=0 → Y=1; A=1 → Y=0. The bubble (○) at the output indicates inversion — this symbol is KEY in understanding NAND and NOR.',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: "Y = A' (A-bar)",
    standard: 'IEEE Std 91a',
    key_use: 'Signal inversion, complementing, clock inversion',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="25" y2="30"/>
  <polygon points="25,10 25,50 80,30" fill="currentColor" opacity=".07" stroke="currentColor"/>
  <circle cx="86" cy="30" r="6" fill="var(--bg)"/>
  <line x1="92" y1="30" x2="120" y2="30"/>
</svg>`
  },

  nand_gate: {
    name: 'NAND Gate',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'NOT-AND. Output is LOW only when ALL inputs are HIGH (complement of AND). Boolean: Y = (A·B)\'. NAND is a universal gate — any logic function can be built using only NAND gates. Widely used in digital ICs.',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: "Y = (A·B)'",
    standard: 'IEEE Std 91a',
    key_use: 'Universal gate — SRAM cells, flip-flops, decoders',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="20" x2="28" y2="20"/>
  <line x1="0"  y1="40" x2="28" y2="40"/>
  <line x1="28" y1="10" x2="28" y2="50"/>
  <path d="M28,10 L60,10 Q84,10 84,30 Q84,50 60,50 L28,50" fill="currentColor" opacity=".07"/>
  <path d="M28,10 L60,10 Q84,10 84,30 Q84,50 60,50 L28,50"/>
  <circle cx="90" cy="30" r="6" fill="var(--bg)"/>
  <line x1="96" y1="30" x2="120" y2="30"/>
</svg>`
  },

  nor_gate: {
    name: 'NOR Gate',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'NOT-OR. Output is HIGH only when ALL inputs are LOW (complement of OR). Boolean: Y = (A+B)\'. NOR is also a universal gate. NOR-based logic is used in early TTL and CMOS designs.',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: "Y = (A+B)'",
    standard: 'IEEE Std 91a',
    key_use: 'Universal gate, flip-flop construction, latch circuits',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="20" x2="30" y2="20"/>
  <line x1="0"  y1="40" x2="30" y2="40"/>
  <path d="M26,10 Q36,30 26,50 L62,50 Q94,50 84,30 Q94,10 62,10 Z" fill="currentColor" opacity=".07"/>
  <path d="M26,10 Q36,30 26,50 L62,50 Q94,50 84,30 Q94,10 62,10 Z"/>
  <circle cx="90" cy="30" r="6" fill="var(--bg)"/>
  <line x1="96" y1="30" x2="120" y2="30"/>
</svg>`
  },

  xor_gate: {
    name: 'XOR Gate (Exclusive OR)',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'Output is HIGH when inputs are DIFFERENT. Boolean: Y = A⊕B. Truth: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. XOR detects inequality. Key component in adder circuits (half adder sum = A⊕B) and error detection (parity).',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: 'Y = A⊕B',
    standard: 'IEEE Std 91a',
    key_use: 'Adder sum bit, parity check, comparators, encryption',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="20" x2="32" y2="20"/>
  <line x1="0"  y1="40" x2="32" y2="40"/>
  <path d="M30,10 Q40,30 30,50 L68,50 Q102,50 92,30 Q102,10 68,10 Z" fill="currentColor" opacity=".07"/>
  <path d="M30,10 Q40,30 30,50 L68,50 Q102,50 92,30 Q102,10 68,10 Z"/>
  <path d="M24,10 Q34,30 24,50" fill="none"/>
  <line x1="92" y1="30" x2="120" y2="30"/>
</svg>`
  },

  xnor_gate: {
    name: 'XNOR Gate (Exclusive NOR)',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'Output is HIGH when inputs are SAME (equality detector). Boolean: Y = (A⊕B)\'. Truth: 0⊕0=1, 0⊕1=0, 1⊕0=0, 1⊕1=1. Used in comparators and coincidence circuits.',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: "Y = (A⊕B)'",
    standard: 'IEEE Std 91a',
    key_use: 'Equality/coincidence detection, comparators',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="20" x2="30" y2="20"/>
  <line x1="0"  y1="40" x2="30" y2="40"/>
  <path d="M28,10 Q38,30 28,50 L64,50 Q96,50 86,30 Q96,10 64,10 Z" fill="currentColor" opacity=".07"/>
  <path d="M28,10 Q38,30 28,50 L64,50 Q96,50 86,30 Q96,10 64,10 Z"/>
  <path d="M22,10 Q32,30 22,50" fill="none"/>
  <circle cx="92" cy="30" r="6" fill="var(--bg)"/>
  <line x1="98" y1="30" x2="120" y2="30"/>
</svg>`
  },

  buffer: {
    name: 'Buffer Gate',
    category: 'logic',
    catLabel: 'Logic Gate',
    description: 'Output equals input — no logical change. Used to drive high fan-out (many connected inputs) or to restore signal strength. Tri-state buffer has an enable pin — output can be 0, 1, or high-impedance (Z).',
    unit: 'Logic levels (0 / 1)',
    symbol_notation: 'Y = A',
    standard: 'IEEE Std 91a',
    key_use: 'Signal buffering, bus driving, tri-state buses',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="25" y2="30"/>
  <polygon points="25,10 25,50 90,30" fill="currentColor" opacity=".07" stroke="currentColor"/>
  <line x1="90" y1="30" x2="120" y2="30"/>
</svg>`
  },

  // ── Power & Sources ──────────────────────────────────────────
  battery: {
    name: 'Battery (DC Voltage Source)',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Provides a constant DC EMF. Long line = positive terminal (+), short line = negative (−). Multiple cells shown as multiple pairs of lines. EMF symbol: ε or V. Governed by V = EMF − I·r (internal resistance).',
    unit: 'Volts (V)',
    symbol_notation: 'V / E / ε',
    standard: 'IEEE Std 315',
    key_use: 'DC power supply in circuits, biasing, portable equipment',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="38" y2="30"/>
  <line x1="38" y1="18" x2="38" y2="42"/>
  <line x1="46" y1="24" x2="46" y2="36"/>
  <line x1="54" y1="18" x2="54" y2="42"/>
  <line x1="62" y1="24" x2="62" y2="36"/>
  <line x1="70" y1="18" x2="70" y2="42"/>
  <line x1="78" y1="24" x2="78" y2="36"/>
  <line x1="82" y1="30" x2="120" y2="30"/>
  <text x="42" y="14" font-size="9" fill="currentColor" stroke="none">+</text>
  <text x="48" y="20" font-size="9" fill="currentColor" stroke="none">−</text>
</svg>`
  },

  dc_source: {
    name: 'Ideal Voltage Source (DC)',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Maintains a constant terminal voltage regardless of current drawn. Ideal: zero internal resistance. Symbol: circle with + and −. Used in circuit analysis (Thevenin, Norton, KVL, KCL).',
    unit: 'Volts (V)',
    symbol_notation: 'Vs / V',
    standard: 'IEEE Std 315',
    key_use: 'Circuit analysis, Thevenin source, biasing model',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="35" y2="30"/>
  <circle cx="60" cy="30" r="25"/>
  <text x="50" y="28" font-size="12" fill="currentColor" stroke="none">+</text>
  <text x="63" y="28" font-size="12" fill="currentColor" stroke="none">−</text>
  <line x1="85" y1="30" x2="120" y2="30"/>
</svg>`
  },

  ac_source: {
    name: 'AC Voltage Source',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Produces a sinusoidally varying voltage. v(t) = Vm·sin(ωt+φ). RMS value = Vm/√2. Used to model mains supply (50 Hz in India), generators, and signal generators.',
    unit: 'Volts RMS',
    symbol_notation: 'Vs~',
    standard: 'IEEE Std 315',
    key_use: 'AC circuit analysis, power systems, signal generators',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="35" y2="30"/>
  <circle cx="60" cy="30" r="25"/>
  <path d="M44,30 Q49,18 54,30 Q59,42 64,30 Q69,18 74,30 Q79,42 84,30" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <line x1="85" y1="30" x2="120" y2="30"/>
</svg>`
  },

  current_source: {
    name: 'Current Source',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Maintains a constant current regardless of terminal voltage. Ideal: infinite internal resistance. Arrow shows direction of conventional current flow. Used in Norton equivalent circuits and transistor small-signal models.',
    unit: 'Amperes (A)',
    symbol_notation: 'Is / I',
    standard: 'IEEE Std 315',
    key_use: 'Norton equivalent, transistor models, current mirrors',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="35" y2="30"/>
  <circle cx="60" cy="30" r="25"/>
  <line x1="60" y1="48" x2="60" y2="12"/>
  <polygon points="56,18 60,12 64,18" fill="currentColor"/>
  <line x1="85" y1="30" x2="120" y2="30"/>
</svg>`
  },

  ground: {
    name: 'Ground (Earth)',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Reference potential (0V). All voltages are measured with respect to ground. Three types: Earth ground (safety), Chassis ground, and Signal/Digital ground. Shown as three horizontal lines decreasing in length.',
    unit: '0 Volts (reference)',
    symbol_notation: 'GND / 0V',
    standard: 'IEEE Std 315',
    key_use: 'Voltage reference, safety earthing, return path',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="60" y1="4"  x2="60" y2="28"/>
  <line x1="36" y1="28" x2="84" y2="28"/>
  <line x1="42" y1="36" x2="78" y2="36"/>
  <line x1="50" y1="44" x2="70" y2="44"/>
  <line x1="56" y1="52" x2="64" y2="52"/>
</svg>`
  },

  // ── Instruments ──────────────────────────────────────────────
  voltmeter: {
    name: 'Voltmeter',
    category: 'instruments',
    catLabel: 'Measuring Instrument',
    description: 'Measures voltage (potential difference) across two points. Connected in PARALLEL. Ideal voltmeter has infinite internal resistance (draws no current). Symbol: circle with V inside.',
    unit: 'Volts (V)',
    symbol_notation: 'V',
    standard: 'IEEE Std 315',
    key_use: 'Measuring terminal voltage, checking supply, circuit testing',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="30" y2="30"/>
  <circle cx="60" cy="30" r="28"/>
  <text x="60" y="36" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">V</text>
  <line x1="88" y1="30" x2="120" y2="30"/>
</svg>`
  },

  ammeter: {
    name: 'Ammeter',
    category: 'instruments',
    catLabel: 'Measuring Instrument',
    description: 'Measures current flowing through a branch. Connected in SERIES. Ideal ammeter has zero internal resistance (no voltage drop). Symbol: circle with A inside.',
    unit: 'Amperes (A)',
    symbol_notation: 'A',
    standard: 'IEEE Std 315',
    key_use: 'Measuring branch current, checking fault currents',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="30" y2="30"/>
  <circle cx="60" cy="30" r="28"/>
  <text x="60" y="36" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">A</text>
  <line x1="88" y1="30" x2="120" y2="30"/>
</svg>`
  },

  ohmmeter: {
    name: 'Ohmmeter',
    category: 'instruments',
    catLabel: 'Measuring Instrument',
    description: 'Measures resistance. Must be used on a de-energized circuit. Uses an internal battery to pass current and measures the resulting voltage to calculate R = V/I. Symbol: circle with Ω inside.',
    unit: 'Ohm (Ω)',
    symbol_notation: 'Ω',
    standard: 'IEEE Std 315',
    key_use: 'Resistance measurement, continuity testing, fault finding',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="30" y2="30"/>
  <circle cx="60" cy="30" r="28"/>
  <text x="60" y="37" text-anchor="middle" font-size="15" font-weight="bold" fill="currentColor" stroke="none">Ω</text>
  <line x1="88" y1="30" x2="120" y2="30"/>
</svg>`
  },

  switch_spst: {
    name: 'Switch (SPST)',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Single Pole Single Throw. Two states: open (circuit broken) or closed (circuit complete). SPDT: Single Pole Double Throw — connects to one of two circuits. Used as basic ON/OFF control element.',
    unit: 'N/A (mechanical)',
    symbol_notation: 'S / SW',
    standard: 'IEEE Std 315',
    key_use: 'ON/OFF control, circuit breaking',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="40" y2="30"/>
  <circle cx="40" cy="30" r="3" fill="currentColor"/>
  <line x1="44" y1="30" x2="76" y2="16"/>
  <circle cx="80" cy="30" r="3" fill="currentColor"/>
  <line x1="80" y1="30" x2="120" y2="30"/>
  <text x="60" y="56" text-anchor="middle" font-size="9" fill="currentColor" stroke="none" opacity=".6">SPST</text>
</svg>`
  },

  fuse: {
    name: 'Fuse',
    category: 'power',
    catLabel: 'Power & Sources',
    description: 'Overcurrent protection device. Fuse wire melts and breaks the circuit when current exceeds rated value (I²t characteristic). Once blown, must be replaced. Protects wiring and equipment from overloads and short circuits.',
    unit: 'Amperes (rated current)',
    symbol_notation: 'F',
    standard: 'IEEE Std 315 / IEC 60617',
    key_use: 'Overcurrent protection, short circuit protection',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0"  y1="30" x2="30" y2="30"/>
  <rect x="30" y="18" width="60" height="24" rx="4" fill="currentColor" opacity=".07"/>
  <rect x="30" y="18" width="60" height="24" rx="4"/>
  <line x1="30" y1="30" x2="90" y2="30" stroke-dasharray="5,3" stroke-width="1.5"/>
  <line x1="90" y1="30" x2="120" y2="30"/>
</svg>`
  },

  photodiode: {
    name: 'Photodiode',
    category: 'semiconductor',
    catLabel: 'Semiconductor',
    description: 'A diode that conducts when exposed to light (photons). Operates in reverse bias (photoconductive mode) for faster response. Current increases with light intensity. Used in optical receivers, light sensors, and solar cells.',
    unit: 'A/W (responsivity)',
    symbol_notation: 'D / PD',
    standard: 'IEEE Std 315',
    key_use: 'Optical fibre receivers, light sensors, solar panels, optocouplers',
    svg: `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="0" y1="30" x2="44" y2="30"/>
  <polygon points="44,14 44,46 76,30" fill="currentColor" opacity=".15" stroke="currentColor"/>
  <line x1="76" y1="14" x2="76" y2="46"/>
  <line x1="76" y1="30" x2="120" y2="30"/>
  <line x1="28" y1="8"  x2="38" y2="18"/>
  <line x1="36" y1="4"  x2="46" y2="14"/>
  <polygon points="28,8  24,4  34,6"  fill="currentColor"/>
  <polygon points="36,4  32,0  42,2"  fill="currentColor"/>
</svg>`
  }
};

// ── State ────────────────────────────────────────────────────────
let _symState = {
  cat: 'all',
  mode: 'browse',
  learned: {},
  quizStreak: 0,
  quizTotal: 0,
  quizCorrect: 0,
  session: [],
  sessionIdx: 0,
  sessionCorrect: 0,
  sessionWrong: 0,
  answered: false,
  currentOpts: [],      // locked options for current question
};

function _symLoad() {
  try {
    const s = localStorage.getItem('cil_sym_v1');
    if (s) {
      const d = JSON.parse(s);
      _symState.learned     = d.learned     || {};
      _symState.quizStreak  = d.quizStreak  || 0;
      _symState.quizTotal   = d.quizTotal   || 0;
      _symState.quizCorrect = d.quizCorrect || 0;
    }
  } catch(e) {}
}
function _symSave() {
  localStorage.setItem('cil_sym_v1', JSON.stringify({
    learned:     _symState.learned,
    quizStreak:  _symState.quizStreak,
    quizTotal:   _symState.quizTotal,
    quizCorrect: _symState.quizCorrect,
  }));
}

_symLoad();

// ── Helpers ──────────────────────────────────────────────────────
function _symFiltered() {
  const all = Object.entries(_S);
  if (_symState.cat === 'all') return all;
  return all.filter(([,v]) => v.category === _symState.cat);
}

function _symUpdateScorebar() {
  const all = Object.keys(_S).length;
  const learned = Object.values(_symState.learned).filter(Boolean).length;
  const acc = _symState.quizTotal > 0
    ? Math.round(_symState.quizCorrect / _symState.quizTotal * 100) : null;
  const el = id => document.getElementById(id);
  if (el('sym-sb-learned'))  el('sym-sb-learned').textContent  = learned;
  if (el('sym-sb-total'))    el('sym-sb-total').textContent    = all;
  if (el('sym-sb-streak'))   el('sym-sb-streak').textContent   = _symState.quizStreak;
  if (el('sym-sb-accuracy')) el('sym-sb-accuracy').textContent = acc !== null ? acc + '%' : '--%';
}

// ── Category & Mode ──────────────────────────────────────────────
function setSymCat(cat) {
  _symState.cat = cat;
  document.querySelectorAll('.sym-cat').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === cat));
  renderSymMain();
}
function setSymMode(mode) {
  _symState.mode = mode;
  ['browse','nameQuiz','symHunt'].forEach(m => {
    document.getElementById('symmode-' + m)?.classList.toggle('active', m === mode);
  });
  if (mode !== 'browse') _startSymQuiz(mode);
  else renderSymMain();
}

// ── Render Router ────────────────────────────────────────────────
function renderSymMain() {
  _symUpdateScorebar();
  const el = document.getElementById('sym-main');
  if (!el) return;
  if (_symState.mode === 'browse') {
    _renderSymBrowse(el);
  } else if (_symState.mode === 'nameQuiz' || _symState.mode === 'symHunt') {
    _renderSymQuiz(el);
  }
}

// ── Browse Mode ──────────────────────────────────────────────────
function _renderSymBrowse(el) {
  const items = _symFiltered();
  if (!items.length) { el.innerHTML = '<p style="color:var(--text-muted);padding:20px">No symbols in this category.</p>'; return; }
  el.innerHTML = `<div class="sym-browse-grid">
    ${items.map(([id, s]) => `
      <div class="sym-card ${_symState.learned[id] ? 'learned' : ''}" onclick="openSymDetail('${id}')">
        <div class="sym-check">✓</div>
        <div class="sym-svg-wrap">${s.svg}</div>
        <div class="sym-card-name">${s.name}</div>
        <div class="sym-card-cat">${s.catLabel}</div>
      </div>`).join('')}
  </div>`;
}

// ── Detail Modal ─────────────────────────────────────────────────
function openSymDetail(id) {
  const s = _S[id];
  if (!s) return;
  const isLearned = !!_symState.learned[id];
  const overlay = document.createElement('div');
  overlay.className = 'sym-detail-overlay';
  overlay.id = 'sym-detail-overlay';
  overlay.innerHTML = `
    <div class="sym-detail-card">
      <div class="sym-detail-header">
        <div>
          <div class="sym-detail-title">${s.name}</div>
          <div class="sym-detail-cat">${s.catLabel}</div>
        </div>
        <button class="sym-detail-close" onclick="closeSymDetail()">×</button>
      </div>
      <div class="sym-detail-svg">${s.svg}</div>
      <div class="sym-detail-desc">${s.description}</div>
      <div class="sym-detail-facts">
        <div class="sym-detail-fact"><strong>Unit:</strong> <span>${s.unit}</span></div>
        <div class="sym-detail-fact"><strong>Notation:</strong> <span>${s.symbol_notation}</span></div>
        <div class="sym-detail-fact"><strong>Standard:</strong> <span>${s.standard}</span></div>
        <div class="sym-detail-fact"><strong>Key uses:</strong> <span>${s.key_use}</span></div>
      </div>
      <div class="sym-detail-actions">
        <button class="sym-mark-learned ${isLearned ? 'already' : ''}" id="sym-mark-btn"
          onclick="toggleSymLearned('${id}')">
          ${isLearned ? '✓ Marked as Learned' : '✓ Mark as Learned'}
        </button>
      </div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSymDetail(); });
  document.body.appendChild(overlay);
}
function closeSymDetail() {
  document.getElementById('sym-detail-overlay')?.remove();
}
function toggleSymLearned(id) {
  _symState.learned[id] = !_symState.learned[id];
  _symSave();
  const btn = document.getElementById('sym-mark-btn');
  if (btn) {
    btn.textContent = _symState.learned[id] ? '✓ Marked as Learned' : '✓ Mark as Learned';
    btn.classList.toggle('already', !!_symState.learned[id]);
  }
  const card = document.querySelector(`.sym-card[onclick="openSymDetail('${id}')"]`);
  if (card) card.classList.toggle('learned', !!_symState.learned[id]);
  _symUpdateScorebar();
}

// ── Quiz Session ─────────────────────────────────────────────────
function _startSymQuiz(mode) {
  const pool = _symFiltered().map(([id]) => id);
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  _symState.session        = pool;
  _symState.sessionIdx     = 0;
  _symState.sessionCorrect = 0;
  _symState.sessionWrong   = 0;
  _symState.answered       = false;
  _symState.currentOpts    = [];
  renderSymMain();
}

function _renderSymQuiz(el) {
  const { session, sessionIdx, sessionCorrect, sessionWrong, answered } = _symState;
  if (sessionIdx >= session.length) {
    _renderSymResults(el); return;
  }
  const id = session[sessionIdx];
  const s  = _S[id];
  const total = session.length;
  const scoreHtml = `<span style="color:var(--success);font-weight:800">${sessionCorrect}✓</span>
    <span style="margin:0 4px;color:var(--text-muted)">·</span>
    <span style="color:var(--danger);font-weight:800">${sessionWrong}✗</span>`;

  if (_symState.mode === 'nameQuiz') {
    _renderNameQuiz(el, id, s, sessionIdx, total, scoreHtml);
  } else {
    _renderSymHunt(el, id, s, sessionIdx, total, scoreHtml);
  }
}

// Name Quiz: show symbol, pick name
function _renderNameQuiz(el, id, s, idx, total, scoreHtml) {
  if (!_symState.currentOpts.length) _symState.currentOpts = _buildNameOpts(id);
  const opts = _symState.currentOpts;
  const letters = ['A','B','C','D'];
  el.innerHTML = `<div class="sym-quiz-wrap">
    <div class="sym-quiz-header">
      <span class="sym-quiz-progress">Question ${idx+1} / ${total}</span>
      <span class="sym-quiz-score">${scoreHtml}</span>
    </div>
    <div class="sym-quiz-q-card">
      <div class="sym-quiz-label">Name Quiz — What is this symbol?</div>
      <div class="sym-quiz-svg-box">${s.svg}</div>
      <div class="sym-nq-opts">
        ${opts.map((o,i) => `
          <button class="sym-nq-opt" onclick="answerNameQuiz('${id}','${o.id}')">
            <span class="sym-nq-letter">${letters[i]}</span>
            <span>${o.name}</span>
          </button>`).join('')}
      </div>
    </div>
  </div>`;
}

function answerNameQuiz(correctId, chosenId) {
  if (_symState.answered) return;
  _symState.answered = true;
  const correct = chosenId === correctId;
  _recordSymAnswer(correct, correctId);

  const el = document.getElementById('sym-main');
  const id = _symState.session[_symState.sessionIdx];
  const s  = _S[id];
  const idx = _symState.sessionIdx;
  const opts = _symState.currentOpts;
  const letters = ['A','B','C','D'];
  const feedbackHtml = `
    <div class="sym-quiz-fb">
      <div class="sym-quiz-fb-icon" style="width:28px;height:28px;border-radius:50%;background:${correct?'var(--success)':'var(--danger)'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800;flex-shrink:0">${correct?'+1':'0'}</div>
      <div>
        <div class="sym-quiz-fb-title" style="color:${correct ? 'var(--success)' : 'var(--danger)'}">
          ${correct ? 'Correct!' : `Wrong — it's: ${_S[correctId].name}`}
        </div>
        <div class="sym-quiz-fb-desc">${_S[correctId].description.substring(0,120)}…</div>
      </div>
    </div>`;
  el.innerHTML = `<div class="sym-quiz-wrap">
    <div class="sym-quiz-header">
      <span class="sym-quiz-progress">Question ${idx+1} / ${_symState.session.length}</span>
      <span class="sym-quiz-score"><span style="color:var(--success);font-weight:800">${_symState.sessionCorrect}✓</span> · <span style="color:var(--danger);font-weight:800">${_symState.sessionWrong}✗</span></span>
    </div>
    <div class="sym-quiz-q-card">
      <div class="sym-quiz-label">Name Quiz — What is this symbol?</div>
      <div class="sym-quiz-svg-box">${s.svg}</div>
      <div class="sym-nq-opts">
        ${opts.map((o,i) => {
          let cls = '';
          if (o.id === correctId) cls = 'correct';
          else if (o.id === chosenId && chosenId !== correctId) cls = 'wrong';
          return `<button class="sym-nq-opt ${cls}" disabled>
            <span class="sym-nq-letter">${letters[i]}</span>
            <span>${o.name}</span>
          </button>`;
        }).join('')}
      </div>
    </div>
    ${feedbackHtml}
    <button class="sym-quiz-next" onclick="nextSymQuiz()">Next →</button>
  </div>`;
}

// Symbol Hunt: show name, pick symbol
function _renderSymHunt(el, id, s, idx, total, scoreHtml) {
  if (!_symState.currentOpts.length) _symState.currentOpts = _buildSymOpts(id);
  const opts = _symState.currentOpts;
  const letters = ['A','B','C','D'];
  el.innerHTML = `<div class="sym-quiz-wrap">
    <div class="sym-quiz-header">
      <span class="sym-quiz-progress">Question ${idx+1} / ${total}</span>
      <span class="sym-quiz-score">${scoreHtml}</span>
    </div>
    <div class="sym-quiz-q-card">
      <div class="sym-quiz-label">Symbol Hunt — Find this symbol</div>
      <div class="sym-quiz-prompt">${s.name}</div>
      <div class="sym-sh-opts">
        ${opts.map((o,i) => `
          <button class="sym-sh-opt" id="shopt-${i}" onclick="answerSymHunt('${id}','${o.id}')">
            <div>${_S[o.id].svg}</div>
            <div class="sym-sh-letter">${letters[i]}</div>
          </button>`).join('')}
      </div>
    </div>
    <div id="sym-quiz-fb-zone"></div>
    ${_symState.answered ? `<button class="sym-quiz-next" onclick="nextSymQuiz()">Next →</button>` : ''}
  </div>`;
}

function answerSymHunt(correctId, chosenId) {
  if (_symState.answered) return;
  _symState.answered = true;
  const correct = chosenId === correctId;
  _recordSymAnswer(correct, correctId);

  const el = document.getElementById('sym-main');
  const s  = _S[correctId];
  const idx = _symState.sessionIdx;
  const opts = _symState.currentOpts;
  const letters = ['A','B','C','D'];
  const feedbackHtml = `
    <div class="sym-quiz-fb">
      <div class="sym-quiz-fb-icon" style="width:28px;height:28px;border-radius:50%;background:${correct?'var(--success)':'var(--danger)'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800;flex-shrink:0">${correct?'+1':'0'}</div>
      <div>
        <div class="sym-quiz-fb-title" style="color:${correct ? 'var(--success)' : 'var(--danger)'}">
          ${correct ? 'Correct!' : `Wrong! The correct symbol is option ${letters[opts.findIndex(o=>o.id===correctId)]}`}
        </div>
        <div class="sym-quiz-fb-desc">${s.description.substring(0,120)}…</div>
      </div>
    </div>`;
  el.innerHTML = `<div class="sym-quiz-wrap">
    <div class="sym-quiz-header">
      <span class="sym-quiz-progress">Question ${idx+1} / ${_symState.session.length}</span>
      <span class="sym-quiz-score"><span style="color:var(--success);font-weight:800">${_symState.sessionCorrect}✓</span> · <span style="color:var(--danger);font-weight:800">${_symState.sessionWrong}✗</span></span>
    </div>
    <div class="sym-quiz-q-card">
      <div class="sym-quiz-label">Symbol Hunt — Find this symbol</div>
      <div class="sym-quiz-prompt">${s.name}</div>
      <div class="sym-sh-opts">
        ${opts.map((o,i) => {
          let cls = '';
          if (o.id === correctId) cls = 'correct';
          else if (o.id === chosenId && chosenId !== correctId) cls = 'wrong';
          return `<button class="sym-sh-opt ${cls}" disabled>
            <div>${_S[o.id].svg}</div>
            <div class="sym-sh-letter">${letters[i]}</div>
          </button>`;
        }).join('')}
      </div>
    </div>
    ${feedbackHtml}
    <button class="sym-quiz-next" onclick="nextSymQuiz()">Next →</button>
  </div>`;
}

function nextSymQuiz() {
  _symState.sessionIdx++;
  _symState.answered = false;
  _symState.currentOpts = [];
  renderSymMain();
}

// ── Option builders ──────────────────────────────────────────────
function _buildNameOpts(correctId) {
  const allIds = Object.keys(_S).filter(id => id !== correctId);
  const wrong = _shuffle(allIds).slice(0, 3);
  const opts = _shuffle([{ id: correctId, name: _S[correctId].name },
    ...wrong.map(id => ({ id, name: _S[id].name }))]);
  return opts;
}
function _buildSymOpts(correctId) {
  const allIds = Object.keys(_S).filter(id => id !== correctId);
  const wrong = _shuffle(allIds).slice(0, 3);
  const opts = _shuffle([{ id: correctId }, ...wrong.map(id => ({ id }))]);
  return opts;
}
function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// ── Record answer ────────────────────────────────────────────────
function _recordSymAnswer(correct, correctId) {
  _symState.quizTotal++;
  if (correct) {
    _symState.sessionCorrect++;
    _symState.quizCorrect++;
    _symState.quizStreak++;
    // Auto-mark as learned after 2 correct answers not tracked here, just mark
    _symState.learned[correctId] = true;
  } else {
    _symState.sessionWrong++;
    _symState.quizStreak = 0;
  }
  _symSave();
}

// ── Results ──────────────────────────────────────────────────────
function _renderSymResults(el) {
  const { sessionCorrect, sessionWrong, session } = _symState;
  const total = session.length;
  const pct = total > 0 ? Math.round(sessionCorrect / total * 100) : 0;
  const circ = 2 * Math.PI * 45;
  const dash = circ * (1 - pct/100);
  const grade = pct >= 90 ? 'Outstanding!' : pct >= 75 ? 'Excellent!' : pct >= 55 ? 'Good Work' : 'Keep Practising';
  const gradeColor = pct >= 75 ? 'var(--success)' : pct >= 55 ? 'var(--warning)' : 'var(--danger)';
  el.innerHTML = `<div class="sym-quiz-wrap">
    <div class="sym-results-card">
      <div style="font-size:18px;font-weight:800;margin-bottom:8px">Quiz Complete</div>
      <div class="sym-results-ring-wrap">
        <div class="sym-results-ring">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="45" fill="none" stroke="var(--border)" stroke-width="10"/>
            <circle cx="55" cy="55" r="45" fill="none" stroke="${gradeColor}" stroke-width="10"
              stroke-dasharray="${circ}" stroke-dashoffset="${dash}"
              stroke-linecap="round" style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div class="sym-results-pct" style="color:${gradeColor}">${pct}%</div>
        </div>
      </div>
      <div class="sym-results-grade" style="color:${gradeColor}">${grade}</div>
      <div class="sym-results-stats">
        <div class="sym-results-stat">
          <div class="sym-results-stat-val" style="color:var(--success)">${sessionCorrect}</div>
          <div class="sym-results-stat-lbl">Correct</div>
        </div>
        <div class="sym-results-stat">
          <div class="sym-results-stat-val" style="color:var(--danger)">${sessionWrong}</div>
          <div class="sym-results-stat-lbl">Wrong</div>
        </div>
        <div class="sym-results-stat">
          <div class="sym-results-stat-val">${total}</div>
          <div class="sym-results-stat-lbl">Total</div>
        </div>
        <div class="sym-results-stat">
          <div class="sym-results-stat-val" style="color:var(--primary)">${_symState.quizStreak}</div>
          <div class="sym-results-stat-lbl">Streak</div>
        </div>
      </div>
      <div class="sym-results-btns">
        <button class="btn btn-primary" onclick="setSymMode('${_symState.mode}')">Try Again</button>
        <button class="btn btn-ghost" onclick="setSymMode('browse')">Browse Symbols</button>
      </div>
    </div>
  </div>`;
  _symUpdateScorebar();
}

// ── Reset ────────────────────────────────────────────────────────
function resetSymbolProgress() {
  if (!confirm('Reset all symbol progress? This clears learned marks and quiz stats.')) return;
  _symState.learned = {};
  _symState.quizStreak = 0;
  _symState.quizTotal = 0;
  _symState.quizCorrect = 0;
  _symSave();
  setSymMode('browse');
}

// ── Init on nav ──────────────────────────────────────────────────
// Called by navigateTo patch below
function initSymbols() {
  _symLoad();
  _symState.mode = 'browse';
  _symState.cat  = 'all';
  document.querySelectorAll('.sym-cat').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === 'all'));
  document.querySelectorAll('.sym-mode-btn').forEach(b =>
    b.classList.toggle('active', b.id === 'symmode-browse'));
  renderSymMain();
}
