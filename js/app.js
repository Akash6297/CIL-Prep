// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  theme:         localStorage.getItem('cil_theme')      || 'light',
  progress:      JSON.parse(localStorage.getItem('cil_progress')   || '{}'),
  topicProgress: JSON.parse(localStorage.getItem('cil_topics')     || '{}'),
  mistakes:      JSON.parse(localStorage.getItem('cil_mistakes')   || '[]'),
  history:       JSON.parse(localStorage.getItem('cil_history')    || '[]'),
  videoData:     JSON.parse(localStorage.getItem('cil_video')      || '{}'),
  studiedDates:  JSON.parse(localStorage.getItem('cil_dates')      || '[]'),
  examDate:      localStorage.getItem('cil_examdate')   || '',
  quiz: { qs:[], cur:0, score:0, answers:[], timer:null, timeLeft:0 },
  currentPlaylist: null,
  currentSubject: 'digital',
};

// ── STUDY PLAN ────────────────────────────────────────────────────────────────
const studyPlan = {
  week1: [
    { day:1,  subject:'Digital Electronics', topic:'Number Systems', sub:'Binary, Octal, Hexadecimal conversions' },
    { day:2,  subject:'Digital Electronics', topic:'Logic Gates', sub:'AND, OR, NOT, NAND, NOR, XOR, XNOR' },
    { day:3,  subject:'Digital Electronics', topic:'Boolean Algebra', sub:"Laws, De Morgan's theorem, simplification" },
    { day:4,  subject:'Digital Electronics', topic:'Karnaugh Map', sub:'2, 3, 4 variable K-maps, grouping' },
    { day:5,  subject:'Digital Electronics', topic:'Flip Flops', sub:'SR, D, JK, T flip-flops, truth tables' },
    { day:6,  subject:'Digital Electronics', topic:'Counters', sub:'Synchronous, asynchronous, MOD-N counters' },
    { day:7,  subject:'Digital Electronics', topic:'Revision + 50 MCQs', sub:'Full week review and practice test' },
  ],
  week2: [
    { day:8,  subject:'Network Theory', topic:'Ohm Law KCL KVL', sub:'Basic laws, series and parallel circuits' },
    { day:9,  subject:'Network Theory', topic:'Nodal Analysis', sub:'Node voltage method, reference node' },
    { day:10, subject:'Network Theory', topic:'Mesh Analysis', sub:'Mesh current method, supermesh' },
    { day:11, subject:'Network Theory', topic:'Thevenin Theorem', sub:'Vth, Rth, equivalent circuit' },
    { day:12, subject:'Network Theory', topic:'Norton Theorem', sub:'IN, RN and conversion from Thevenin' },
    { day:13, subject:'Network Theory', topic:'RLC Circuits', sub:'Resonance, time constants, phasors' },
    { day:14, subject:'Network Theory', topic:'Revision + MCQs', sub:'Full week review and practice test' },
  ],
  week3: [
    { day:15, subject:'Analog Electronics', topic:'PN Junction', sub:'Depletion region, forward/reverse bias' },
    { day:16, subject:'Analog Electronics', topic:'Diodes and Rectifiers', sub:'Half-wave, full-wave, bridge rectifiers' },
    { day:17, subject:'Analog Electronics', topic:'Zener Diode', sub:'Voltage regulation, breakdown region' },
    { day:18, subject:'Analog Electronics', topic:'BJT', sub:'CE, CB, CC configurations, beta, h-parameters' },
    { day:19, subject:'Analog Electronics', topic:'MOSFET and JFET', sub:'Enhancement/depletion, pinch-off, saturation' },
    { day:20, subject:'Analog Electronics', topic:'Amplifiers and Op-Amps', sub:'Classes, gain, CMRR, slew rate, feedback' },
    { day:21, subject:'Analog Electronics', topic:'Revision + MCQs', sub:'Full week review and practice test' },
  ],
  week4: [
    { day:22, subject:'Signals and Systems', topic:'Signal Classification', sub:'Continuous/discrete, periodic, energy/power' },
    { day:23, subject:'Signals and Systems', topic:'Convolution', sub:'Linear convolution, LTI systems, impulse response' },
    { day:24, subject:'Signals and Systems', topic:'Fourier Series', sub:'Coefficients, Dirichlet conditions, Gibbs' },
    { day:25, subject:'Signals and Systems', topic:'Fourier Transform', sub:'CTFT, properties, duality, Parseval' },
    { day:26, subject:'Signals and Systems', topic:'Laplace Transform', sub:'ROC, poles/zeros, stability, inverse' },
    { day:27, subject:'Signals and Systems', topic:'Z-Transform', sub:'ROC, properties, inverse Z-transform' },
    { day:28, subject:'Signals and Systems', topic:'Revision + Full Test', sub:'All 4 weeks combined practice test' },
    { day:29, subject:'Aptitude', topic:'Quant and Reasoning', sub:'Percentage, ratio, time-work, series, syllogism' },
    { day:30, subject:'Aptitude', topic:'Mock Exam Day', sub:'Full 3-hour mock exam simulation' },
  ],
  week5: [
    { day:31, subject:'Control Systems', topic:'Transfer Function & Block Diagrams', sub:'H(s), open/closed loop, signal flow graph' },
    { day:32, subject:'Control Systems', topic:'Time Domain Analysis', sub:'Step response, rise time, settling time, overshoot' },
    { day:33, subject:'Control Systems', topic:'Stability Analysis', sub:'Routh-Hurwitz criterion, characteristic equation' },
    { day:34, subject:'Control Systems', topic:'Root Locus', sub:'Construction rules, gain, dominant poles' },
    { day:35, subject:'Control Systems', topic:'Bode Plot', sub:'Gain margin, phase margin, crossover frequencies' },
    { day:36, subject:'Communications', topic:'Amplitude Modulation', sub:'AM, DSB-SC, SSB, VSB — modulation index, power' },
    { day:37, subject:'Communications', topic:'Frequency Modulation', sub:'FM, PM — modulation index, bandwidth, noise' },
    { day:38, subject:'Communications', topic:'Digital Communications', sub:'PCM, ASK, FSK, PSK, QPSK, QAM, Shannon capacity' },
    { day:39, subject:'EM Theory', topic:'Electrostatics', sub:"Coulomb's law, Gauss's law, electric field, potential" },
    { day:40, subject:'EM Theory', topic:'Magnetostatics & Waves', sub:"Biot-Savart, Ampere's law, Maxwell's equations, skin depth" },
    { day:41, subject:'Engineering Maths', topic:'Linear Algebra', sub:'Matrices, eigenvalues, eigenvectors, rank' },
    { day:42, subject:'Engineering Maths', topic:'Calculus & Differential Equations', sub:'Differentiation, integration, Laplace, DE' },
    { day:43, subject:'All', topic:'Full Revision Day 1', sub:'Digital + Network — all formulas and MCQs' },
    { day:44, subject:'All', topic:'Full Revision Day 2', sub:'Analog + Signals — all formulas and MCQs' },
    { day:45, subject:'All', topic:'Final Mock Exam', sub:'Full 3-hour simulation — 150 questions' },
  ],
};

window._dayData = {};
Object.values(studyPlan).forEach(w => w.forEach(d => { window._dayData[d.day] = d; }));

function searchPlanDay(dayNum, type) {
  const d = window._dayData[dayNum];
  if (!d) return;
  if (type === 'g') searchGoogle(d.topic + ' ' + d.subject + ' MCQ Coal India');
  if (type === 'y') openYT(d.topic + ' ' + d.subject + ' lecture');
}

// ── SUBJECTS DATA ─────────────────────────────────────────────────────────────
const subjects = {
  digital: {
    name:'Digital Electronics', color:'#8b5cf6',
    weight: '15-20%',
    topics:[
      { name:'Number Systems',        tags:['Binary','Octal','Hex','BCD'],              search:'number systems digital electronics MCQ' },
      { name:'Logic Gates',           tags:['AND','OR','NAND','NOR','XOR'],              search:'logic gates truth table MCQ' },
      { name:'Boolean Algebra',       tags:["De Morgan's",'SOP','POS','Simplify'],       search:'boolean algebra simplification MCQ' },
      { name:'Karnaugh Map',          tags:['2-var','3-var','4-var','Grouping'],         search:'karnaugh map k-map MCQ' },
      { name:'Flip Flops',            tags:['SR','D','JK','T'],                          search:'flip flop SR JK D T MCQ' },
      { name:'Counters',              tags:['Sync','Async','MOD-N'],                     search:'counters synchronous asynchronous MCQ' },
      { name:'Combinational Circuits',tags:['MUX','DEMUX','Encoder','Decoder'],         search:'combinational circuits multiplexer decoder MCQ' },
    ],
  },
  network: {
    name:'Network Theory', color:'#3b82f6',
    weight: '10-15%',
    topics:[
      { name:"Ohm's Law & KCL/KVL", tags:['Ohm','KCL','KVL'],                    search:'ohm law KCL KVL network theory MCQ' },
      { name:'Nodal Analysis',       tags:['Node voltage','Supernode'],             search:'nodal analysis network MCQ' },
      { name:'Mesh Analysis',        tags:['Mesh current','Supermesh'],             search:'mesh analysis network MCQ' },
      { name:'Thevenin Theorem',     tags:['Vth','Rth','Equivalent'],               search:'thevenin theorem MCQ problems' },
      { name:'Norton Theorem',       tags:['IN','RN','Conversion'],                 search:'norton theorem MCQ problems' },
      { name:'RLC Circuits',         tags:['Resonance','Impedance','Q factor'],     search:'RLC circuit resonance MCQ' },
      { name:'Two-Port Networks',    tags:['Z-params','Y-params','H-params'],       search:'two port network parameters MCQ' },
    ],
  },
  analog: {
    name:'Analog Electronics', color:'#10b981',
    weight: '15-20%',
    topics:[
      { name:'PN Junction & Diodes', tags:['Depletion','Forward bias','IV'],        search:'PN junction diode MCQ' },
      { name:'Rectifiers',           tags:['HWR','FWR','PIV','Ripple'],             search:'rectifier half wave full wave MCQ' },
      { name:'Zener Diode',          tags:['Regulation','Breakdown'],               search:'zener diode regulator MCQ' },
      { name:'BJT',                  tags:['beta','CE','CB','CC','Biasing'],         search:'BJT transistor amplifier MCQ' },
      { name:'MOSFET & JFET',        tags:['Enhancement','Depletion','Pinch-off'],  search:'MOSFET JFET MCQ' },
      { name:'Amplifiers',           tags:['Class A/B/C','Gain','Bandwidth'],        search:'amplifier class efficiency MCQ' },
      { name:'Op-Amp',               tags:['CMRR','Slew rate','Inverting'],          search:'operational amplifier op-amp MCQ' },
    ],
  },
  signals: {
    name:'Signals & Systems', color:'#f97316',
    weight: '10-15%',
    topics:[
      { name:'Signal Classification', tags:['Periodic','Energy','Power','Causal'],  search:'signal classification MCQ' },
      { name:'Convolution',           tags:['Linear','Circular','LTI'],              search:'convolution signals systems MCQ' },
      { name:'Fourier Series',        tags:['Coefficients','Harmonics','Gibbs'],     search:'fourier series MCQ' },
      { name:'Fourier Transform',     tags:['CTFT','Properties','Duality'],          search:'fourier transform MCQ' },
      { name:'Laplace Transform',     tags:['ROC','Stability','Poles'],              search:'laplace transform MCQ' },
      { name:'Z-Transform',           tags:['ROC','Sequences','Inverse'],            search:'z-transform ROC MCQ' },
      { name:'Sampling Theorem',      tags:['Nyquist','Aliasing'],                   search:'nyquist sampling theorem MCQ' },
    ],
  },
  control: {
    name:'Control Systems', color:'#ef4444',
    weight: '10-15%',
    topics:[
      { name:'Transfer Function',     tags:['H(s)','Block diagram','SFG'],           search:'transfer function block diagram MCQ' },
      { name:'Time Domain Analysis',  tags:['Step response','Overshoot','Rise time'], search:'time domain analysis control systems MCQ' },
      { name:'Stability - Routh',     tags:['Routh array','Characteristic eqn'],     search:'routh hurwitz stability MCQ' },
      { name:'Root Locus',            tags:['Poles','Zeros','Gain','Branches'],       search:'root locus control systems MCQ' },
      { name:'Bode Plot',             tags:['Gain margin','Phase margin','Crossover'], search:'bode plot gain phase margin MCQ' },
      { name:'PID Controllers',       tags:['Proportional','Integral','Derivative'],  search:'PID controller MCQ' },
      { name:'Nyquist Criterion',     tags:['Nyquist plot','Encirclement'],           search:'nyquist stability criterion MCQ' },
    ],
  },
  communications: {
    name:'Communications', color:'#14b8a6',
    weight: '10-15%',
    topics:[
      { name:'Amplitude Modulation',  tags:['AM','DSB-SC','SSB','VSB','m'],          search:'amplitude modulation AM MCQ' },
      { name:'Frequency Modulation',  tags:['FM','PM','β','Carson rule'],             search:'frequency modulation FM MCQ' },
      { name:'Digital Comms',         tags:['PCM','ASK','FSK','PSK','QPSK'],          search:'digital communications PCM PSK MCQ' },
      { name:'Multiplexing',          tags:['TDM','FDM','CDM'],                       search:'multiplexing TDM FDM MCQ' },
      { name:'Information Theory',    tags:["Shannon's capacity",'Entropy','SNR'],    search:'shannon capacity information theory MCQ' },
      { name:'Noise in Comms',        tags:['AWGN','SNR','BER','Thermal noise'],      search:'noise communications SNR BER MCQ' },
      { name:'Antennas & Propag.',    tags:['Gain','Directivity','Path loss'],        search:'antenna gain directivity MCQ' },
    ],
  },
};

// ── FORMULA SHEET DATA ────────────────────────────────────────────────────────
const formulaData = [
  { id:'digital', name:'Digital Electronics', color:'#8b5cf6', groups:[
    { title:'Number Systems', items:[
      { name:"2's Complement",           formula:"Flip all bits, then add 1",                  tip:"0110 → 1001+1 = 1010" },
      { name:"Binary to Gray Code",      formula:"MSB same; each bit = XOR of adjacent binary bits", tip:"0111 → 0100 (gray for 7)" },
      { name:"Conversion: Decimal→Hex",  formula:"Divide by 16, remainders in reverse",         tip:"255 = FF hex" },
      { name:"BCD Code",                 formula:"Each decimal digit encoded in 4 bits",         tip:"29 BCD = 0010 1001" },
    ]},
    { title:'Boolean Algebra', items:[
      { name:"De Morgan's Law 1",   formula:"(A+B)' = A'·B'",                           tip:"NOR = AND of NOTs" },
      { name:"De Morgan's Law 2",   formula:"(A·B)' = A'+B'",                           tip:"NAND = OR of NOTs" },
      { name:"Absorption Law",      formula:"A + AB = A   |   A(A+B) = A",               tip:"Eliminates redundant terms" },
      { name:"Consensus Theorem",   formula:"AB + A'C + BC = AB + A'C",                  tip:"BC is a redundant (consensus) term" },
      { name:"SOP Canonical Form",  formula:"Sum of minterms where output = 1",          tip:"Each minterm is an AND term" },
    ]},
    { title:'Flip-Flops & Counters', items:[
      { name:"JK Flip-Flop",       formula:"Q(t+1) = JQ' + K'Q",                        tip:"J=K=1 → Toggle" },
      { name:"D Flip-Flop",        formula:"Q(t+1) = D",                                 tip:"Stores D at clock edge" },
      { name:"T Flip-Flop",        formula:"Q(t+1) = T⊕Q",                              tip:"T=1 → Toggle, T=0 → Hold" },
      { name:"MOD-N Counter FFs",  formula:"n = ⌈log₂N⌉ flip-flops",                   tip:"MOD-6 needs 3 FFs (2³=8≥6)" },
      { name:"Frequency Division", formula:"Output freq = Clock / 2ⁿ (n-bit counter)",  tip:"4-bit counter: f_out = f_clk/16" },
    ]},
  ]},
  { id:'network', name:'Network Theory', color:'#3b82f6', groups:[
    { title:'Basic Laws', items:[
      { name:"Ohm's Law",           formula:"V = IR  |  I = V/R  |  R = V/I",            tip:"Units: V(volts), I(amps), R(ohms)" },
      { name:"KVL",                 formula:"ΣV = 0 (sum of voltages in a closed loop)",  tip:"Sum of voltage rises = sum of drops" },
      { name:"KCL",                 formula:"ΣI = 0 (sum of currents at a node)",         tip:"Current in = Current out at any node" },
      { name:"Power",               formula:"P = VI = I²R = V²/R",                        tip:"Units: Watts" },
    ]},
    { title:'Network Theorems', items:[
      { name:"Thevenin",            formula:"Vth = Voc, Rth = R(all sources killed)",      tip:"Voltage source→short, current source→open" },
      { name:"Norton",              formula:"IN = Isc, RN = Rth",                          tip:"IN = Vth/Rth" },
      { name:"Max Power Transfer",  formula:"RL = Rth, Pmax = Vth²/(4Rth)",               tip:"50% efficiency at max power" },
      { name:"Superposition",       formula:"Response = sum of responses to each source",  tip:"Valid only for linear circuits" },
    ]},
    { title:'AC & Resonance', items:[
      { name:"Impedance (inductor)", formula:"ZL = jωL",                                   tip:"XL = ωL (inductive reactance)" },
      { name:"Impedance (capacitor)",formula:"ZC = 1/(jωC)",                               tip:"XC = 1/(ωC) (capacitive reactance)" },
      { name:"Resonant Frequency",   formula:"f₀ = 1/(2π√LC)",                            tip:"At resonance: XL = XC" },
      { name:"Quality Factor Q",     formula:"Q = ωL/R = 1/(ωCR) = f₀/BW",              tip:"High Q = narrow bandwidth" },
      { name:"Time Constant RC",     formula:"τ = RC",                                     tip:"Time to reach 63.2% of final value" },
      { name:"Time Constant RL",     formula:"τ = L/R",                                    tip:"Time for current to reach 63.2%" },
    ]},
  ]},
  { id:'analog', name:'Analog Electronics', color:'#10b981', groups:[
    { title:'Diodes & Rectifiers', items:[
      { name:"Diode Equation",       formula:"I = I₀(e^(V/VT) - 1), VT ≈ 26mV at 300K",   tip:"VT = kT/q = thermal voltage" },
      { name:"HWR Ripple Factor",    formula:"γ = 1.21",                                    tip:"HWR: efficiency = 40.6%" },
      { name:"FWR Ripple Factor",    formula:"γ = 0.482",                                   tip:"FWR: efficiency = 81.2%" },
      { name:"PIV — Bridge",         formula:"PIV = Vm",                                    tip:"Bridge rectifier PIV = Vm" },
      { name:"PIV — Center Tap FWR", formula:"PIV = 2Vm",                                  tip:"Center tap FWR needs higher PIV" },
    ]},
    { title:'BJT', items:[
      { name:"Current Gain β",    formula:"β = IC/IB (50 to 300 typically)",              tip:"Also called hFE" },
      { name:"α relationship",    formula:"α = IC/IE = β/(1+β)",                          tip:"α < 1 always" },
      { name:"KCL at BJT",        formula:"IE = IC + IB",                                  tip:"Emitter current = collector + base" },
      { name:"Voltage Gain CE",   formula:"Av = -gm·RC (negative → inverting)",           tip:"gm = IC/VT (transconductance)" },
    ]},
    { title:'Op-Amp', items:[
      { name:"Inverting Amp",         formula:"Av = -Rf/Rin",                              tip:"Negative gain = phase inversion" },
      { name:"Non-Inverting Amp",     formula:"Av = 1 + Rf/Rin",                           tip:"Always ≥ 1, no phase inversion" },
      { name:"Voltage Follower",      formula:"Av = 1 (Rf=0, Rin=∞)",                     tip:"High Zin, low Zout — buffer" },
      { name:"Slew Rate",             formula:"SR = ΔVo/Δt (V/μs)",                       tip:"Limits high-freq large-signal response" },
      { name:"Unity Gain Bandwidth",  formula:"GBW = |Av| × BW = constant",               tip:"At Av=10: BW = GBW/10" },
    ]},
    { title:'Amplifier Classes', items:[
      { name:"Class A Efficiency",    formula:"η_max = 25% (direct) or 50% (transformer)", tip:"Conducts full cycle, low distortion" },
      { name:"Class B Efficiency",    formula:"η_max = π/4 = 78.5%",                       tip:"Each transistor conducts 180°" },
      { name:"Class AB",              formula:"η between Class A and B",                   tip:"Reduces crossover distortion of Class B" },
      { name:"Class C Efficiency",    formula:"η up to ~100% (narrow conduction angle)",   tip:"High distortion, used in RF tuned amps" },
    ]},
  ]},
  { id:'signals', name:'Signals & Systems', color:'#f97316', groups:[
    { title:'Transforms', items:[
      { name:"CTFT",              formula:"X(jω) = ∫₋∞^∞ x(t)e^(-jωt)dt",               tip:"Converts time signal to frequency domain" },
      { name:"Inverse CTFT",      formula:"x(t) = (1/2π)∫₋∞^∞ X(jω)e^(jωt)dω",         tip:"Reconstruct signal from spectrum" },
      { name:"Laplace Transform", formula:"X(s) = ∫₀^∞ x(t)e^(-st)dt",                  tip:"s = σ + jω (generalized frequency)" },
      { name:"Z-Transform",       formula:"X(z) = Σₙ x[n]z^(-n)",                        tip:"Discrete-time counterpart of Laplace" },
      { name:"Common L.T. Pairs", formula:"δ(t)↔1  u(t)↔1/s  e^(-at)u(t)↔1/(s+a)",     tip:"Memorize these for exam" },
    ]},
    { title:'Key Properties', items:[
      { name:"Convolution",           formula:"y(t) = x(t)*h(t), Y(s) = X(s)·H(s)",      tip:"Time convolution = frequency multiplication" },
      { name:"Time Delay (Laplace)",  formula:"L{x(t-T)} = e^(-sT)·X(s)",               tip:"Delay by T = multiply by e^(-sT)" },
      { name:"Time Delay (Z-domain)", formula:"Z{x[n-k]} = z^(-k)·X(z)",                tip:"Unit delay = multiply by z^(-1)" },
      { name:"Parseval's Theorem",    formula:"∫|x(t)|²dt = (1/2π)∫|X(jω)|²dω",         tip:"Energy in time = energy in frequency" },
      { name:"Sampling Theorem",      formula:"fs ≥ 2fmax (Nyquist rate)",                tip:"Below Nyquist rate: aliasing occurs" },
    ]},
    { title:'System Properties', items:[
      { name:"Stability (Laplace)",   formula:"All poles in Left Half s-Plane (σ < 0)",   tip:"Stable: all poles have negative real part" },
      { name:"Stability (Z-domain)",  formula:"All poles inside unit circle |z| < 1",     tip:"Digital system stability condition" },
      { name:"Causality",             formula:"h(t) = 0 for t < 0",                       tip:"Causal: output depends only on past/present" },
      { name:"Energy Signal",         formula:"E = ∫|x(t)|²dt < ∞",                      tip:"Finite energy: most real signals" },
      { name:"Power Signal",          formula:"P = lim(T→∞)(1/T)∫|x(t)|²dt < ∞",        tip:"Periodic signals are power signals" },
    ]},
  ]},
  { id:'control', name:'Control Systems', color:'#ef4444', groups:[
    { title:'System Fundamentals', items:[
      { name:"Transfer Function",      formula:"H(s) = Y(s)/X(s) (zero initial conditions)", tip:"Ratio of output to input in s-domain" },
      { name:"Closed-Loop TF",         formula:"T(s) = G(s)/(1+G(s)H(s))",                   tip:"Negative feedback reduces to this" },
      { name:"Characteristic Equation",formula:"1 + G(s)H(s) = 0",                            tip:"Roots = closed-loop poles (stability)" },
      { name:"System Type",            formula:"Number of open-loop poles at origin (s=0)",    tip:"Type 0: no integrator, Type 1: one, etc." },
    ]},
    { title:'Steady-State Errors', items:[
      { name:"Position const. Kp",     formula:"Kp = lim(s→0) G(s)H(s)",                     tip:"ess = 1/(1+Kp) for step input, Type 0" },
      { name:"Velocity const. Kv",     formula:"Kv = lim(s→0) s·G(s)H(s)",                   tip:"ess = 1/Kv for ramp, Type 1" },
      { name:"Acceleration const. Ka", formula:"Ka = lim(s→0) s²·G(s)H(s)",                  tip:"ess = 1/Ka for parabolic, Type 2" },
    ]},
    { title:'Stability & Margins', items:[
      { name:"Routh-Hurwitz",          formula:"All 1st-column elements same sign → Stable", tip:"Sign changes = # RHP poles" },
      { name:"Gain Margin (GM)",        formula:"GM = 1/|G(jωpc)| where ∠G(jωpc) = -180°",  tip:"GM > 1 (0 dB) → stable" },
      { name:"Phase Margin (PM)",       formula:"PM = 180° + ∠G(jωgc) where |G(jωgc)| = 1", tip:"PM > 0° → stable. Ideally 30°-60°" },
    ]},
    { title:'Time Domain Response', items:[
      { name:"Underdamped (ξ < 1)",    formula:"Oscillatory with exponential decay",          tip:"Most common case in practice" },
      { name:"Settling Time (2%)",      formula:"ts ≈ 4/(ξωn)",                               tip:"Time to stay within 2% of final" },
      { name:"Peak Overshoot",          formula:"Mp = e^(-πξ/√(1-ξ²)) × 100%",              tip:"ξ=0.5 → Mp ≈ 16.3%" },
      { name:"Natural Frequency ωn",    formula:"Poles: s = -ξωn ± jωn√(1-ξ²)",             tip:"ωn = distance from origin to poles" },
    ]},
  ]},
  { id:'communications', name:'Communications', color:'#14b8a6', groups:[
    { title:'Amplitude Modulation', items:[
      { name:"Modulation Index",       formula:"m = Am/Ac  (0 ≤ m ≤ 1)",                  tip:"m > 1: overmodulation (distortion)" },
      { name:"AM Total Power",         formula:"Pt = Pc(1 + m²/2)",                        tip:"At m=1: Pt = 1.5 Pc" },
      { name:"AM Bandwidth",           formula:"BW = 2fm",                                  tip:"Two sidebands at ±fm from carrier" },
      { name:"Efficiency",             formula:"η = (m²/2)/(1 + m²/2) × 100%",            tip:"At m=1: η = 33.3%" },
    ]},
    { title:'Frequency Modulation', items:[
      { name:"Modulation Index",       formula:"β = Δf/fm (no upper limit)",               tip:"β > 1: wideband FM (better noise rejection)" },
      { name:"FM Bandwidth (Carson)",  formula:"BW = 2(Δf + fm) = 2fm(β + 1)",            tip:"Commercial FM: Δf = 75 kHz, fm = 15 kHz" },
      { name:"FM SNR advantage",       formula:"SNR_FM / SNR_AM = 3β²(β+1)/2",            tip:"FM is much better than AM at large β" },
    ]},
    { title:'Digital Communications', items:[
      { name:"PCM Bit Rate",           formula:"Rb = fs × n bits/s",                       tip:"fs = sampling rate, n = bits/sample" },
      { name:"Shannon Capacity",       formula:"C = B log₂(1 + SNR) bits/s",              tip:"Maximum error-free rate for given bandwidth and SNR" },
      { name:"QPSK Spectral Eff.",     formula:"2 bits per symbol (4 phase states)",       tip:"Twice the efficiency of BPSK" },
      { name:"8-PSK",                  formula:"3 bits per symbol (8 phase states)",       tip:"More bits but needs better SNR" },
    ]},
    { title:'Noise & Receivers', items:[
      { name:"Image Frequency",        formula:"fi = fRF + 2fIF",                          tip:"Superheterodyne: reject image with RF filter" },
      { name:"Signal Bandwidth (IF)",  formula:"BIF must be ≥ bandwidth of signal",        tip:"IF filter selects wanted station" },
      { name:"Thermal Noise Power",    formula:"N = kTB (k=1.38×10⁻²³ J/K)",             tip:"Unavoidable noise in all systems" },
    ]},
  ]},
  { id:'aptitude', name:'Quantitative Aptitude', color:'#0f766e', groups:[
    { title:'Percentage', items:[
      { name:'x% of y',               formula:'= x × y / 100',                            tip:'15% of 240 = 240×15/100 = 36' },
      { name:'% Increase',            formula:'= (New − Old) / Old × 100',                tip:'80→100: (100−80)/80×100 = 25% increase' },
      { name:'% Decrease',            formula:'= (Old − New) / Old × 100',                tip:'100→80: (100−80)/100×100 = 20% decrease' },
      { name:'Successive % change',   formula:'Net = a + b + ab/100',                     tip:'+10% then −10%: 10−10−1 = −1% net loss' },
      { name:'x% more than y',        formula:'Actual = y × (1 + x/100)',                 tip:'20% more than 500 = 500×1.2 = 600' },
    ]},
    { title:'Profit, Loss & Discount', items:[
      { name:'Profit %',              formula:'= (SP − CP) / CP × 100',                   tip:'Always calculated on Cost Price (CP)' },
      { name:'SP from CP',            formula:'SP = CP × (100 + P%) / 100',               tip:'CP=200, P=25% → SP = 200×125/100 = 250' },
      { name:'CP from SP',            formula:'CP = SP × 100 / (100 + P%)',               tip:'Work backwards when SP and profit% are known' },
      { name:'Loss %',                formula:'= (CP − SP) / CP × 100',                   tip:'If CP=500, SP=400: Loss% = (500−400)/500×100 = 20%' },
      { name:'Discount %',            formula:'= (MP − SP) / MP × 100',                   tip:'Discount is ALWAYS on Marked Price (MP)' },
      { name:'Successive discounts',  formula:'Net discount = a + b − ab/100',            tip:'20% then 10%: 20+10−2 = 28% net discount' },
    ]},
    { title:'Simple & Compound Interest', items:[
      { name:'Simple Interest',        formula:'SI = P × R × T / 100',                    tip:'P=principal, R=rate%, T=time(years)' },
      { name:'Amount (SI)',            formula:'A = P + SI = P(1 + RT/100)',               tip:'Total amount after T years with SI' },
      { name:'Compound Interest',      formula:'A = P(1 + R/100)^T,  CI = A − P',         tip:'Compounded annually. For half-yearly: rate/2, time×2' },
      { name:'CI vs SI (2 years)',     formula:'Diff = P × (R/100)²',                      tip:'Quick shortcut for 2-year difference' },
      { name:'Rule of 72',             formula:'Doubling time ≈ 72 / R years',             tip:'At 9%: money doubles in 72/9 = 8 years approx' },
    ]},
    { title:'Ratio, Proportion & Mixtures', items:[
      { name:'Ratio split',            formula:'Each share = (ratio / sum of ratio) × total',tip:'A:B = 3:5, total=80 → A=30, B=50' },
      { name:'Proportion',             formula:'a:b = c:d → ad = bc (cross multiply)',      tip:'If 3:4 = x:12, then x = 9' },
      { name:'Alligation rule',        formula:'Ratio = (Higher − Mean) : (Mean − Lower)',  tip:'Used for mixing two items at different prices/concentrations' },
    ]},
    { title:'Time, Work & Distance', items:[
      { name:'Work rate (1 person)',   formula:'Rate = 1/n per day (n = days to finish)',   tip:'A finishes in 6 days → rate = 1/6 per day' },
      { name:'Combined work (A+B)',    formula:'Time = ab/(a+b)',                            tip:'A in 4, B in 6: together = 24/10 = 2.4 days' },
      { name:'Speed formula',          formula:'D = S × T,  S = D/T,  T = D/S',            tip:'Always check units: km/h vs m/s (×18/5 to convert)' },
      { name:'Relative speed (same)',  formula:'S_rel = |S1 − S2|',                         tip:'Overtaking: use difference of speeds' },
      { name:'Relative speed (opp.)',  formula:'S_rel = S1 + S2',                           tip:'Meeting head-on: use sum of speeds' },
      { name:'Trains crossing',        formula:'Time = (L1 + L2) / Relative speed',        tip:'Always add lengths of both trains' },
    ]},
    { title:'Number System & Averages', items:[
      { name:'HCF × LCM',             formula:'= Product of two numbers (for 2 numbers)',  tip:'HCF(12,18)=6, LCM=36: 6×36=216=12×18 ✓' },
      { name:'Divisibility by 3',      formula:'Sum of all digits divisible by 3',          tip:'123: 1+2+3=6 → divisible by 3' },
      { name:'Divisibility by 9',      formula:'Sum of all digits divisible by 9',          tip:'162: 1+6+2=9 → divisible by 9' },
      { name:'Divisibility by 11',     formula:'(Odd position sum − Even position sum) div by 11', tip:'Alternating digit difference = 0 or ±11' },
      { name:'Average',               formula:'= Sum / Count',                              tip:'If avg of n numbers is A, then total sum = n×A' },
      { name:'Weighted average',      formula:'= (n1×a1 + n2×a2) / (n1 + n2)',             tip:'Used for combined averages of two groups' },
    ]},
    { title:'Permutation, Combination & Probability', items:[
      { name:'Permutation nPr',        formula:'n! / (n−r)!',                              tip:'Arrangement (order matters): 5P2 = 5×4 = 20' },
      { name:'Combination nCr',        formula:'n! / (r! × (n−r)!)',                       tip:'Selection (order doesn\'t matter): 5C2 = 10' },
      { name:'Probability',            formula:'P(A) = Favorable outcomes / Total outcomes', tip:'P(head) = 1/2, P(6 on die) = 1/6' },
      { name:'P(A or B)',              formula:'P(A) + P(B) − P(A and B)',                  tip:'For mutually exclusive: P(A) + P(B)' },
      { name:'P(A and B)',             formula:'P(A) × P(B) if A,B independent',            tip:'Two fair coins: P(HH) = 1/2 × 1/2 = 1/4' },
    ]},
  ]},
  { id:'english', name:'English — Verbal Ability', color:'#6d28d9', groups:[
    { title:'Subject-Verb Agreement', items:[
      { name:'Basic rule',             formula:'Singular subject → singular verb. Plural subject → plural verb.', tip:'"He is" / "They are". Never "He are".' },
      { name:'Either/Neither...or/nor',formula:'Verb agrees with the NEARER subject',      tip:'"Neither he nor they ARE wrong" (they = nearer, plural)' },
      { name:'Each / Every / No / None',formula:'Always takes singular verb',              tip:'"Each of the students HAS submitted"' },
      { name:'Collective nouns',       formula:'Usually singular (committee, jury, team, class)', tip:'"The committee HAS decided"' },
      { name:'Uncountable nouns',      formula:'Always singular: news, furniture, information, advice', tip:'"The news IS good" (never "news are")' },
    ]},
    { title:'Tenses — Quick Rules', items:[
      { name:'Simple Past keywords',   formula:'Yesterday, last year/week/month, ago, in 1990', tip:'"I visited Delhi last year" — always use past tense' },
      { name:'Present Perfect keywords',formula:'Just, already, yet, ever, never, recently, so far', tip:'"I have just finished the exam"' },
      { name:'Past Perfect',           formula:'Earlier action uses past perfect (had + V3)',   tip:'"He had left BEFORE I arrived" (leaving happened first)' },
      { name:'For vs Since',           formula:'FOR + duration | SINCE + point in time',        tip:'"Studying FOR 2 hours" | "studying SINCE morning"' },
      { name:'Since vs For (exam tip)', formula:'Since 2020 (year). For 3 years (period). Never "since 3 years"', tip:'"I have been here since 2020" / "for 2 years"' },
    ]},
    { title:'Common Error Types (Error Spotting)', items:[
      { name:'Wrong preposition',      formula:'Depend ON, Married TO, Proud OF, Good AT, Differ FROM', tip:'Memorize fixed prepositions with common adjectives/verbs' },
      { name:'Double superlative',     formula:'WRONG: "most tallest" → CORRECT: "tallest"',   tip:'Never use most/more with -est/-er forms' },
      { name:'Wrong pronoun case',     formula:'"Between you and ME" (not I). Object case after preposition.', tip:'"It is I who am wrong" — pronoun as subject of verb' },
      { name:'Redundancy',             formula:'Remove: "end result", "free gift", "future plans", "past history"', tip:'These repeat the same meaning — one word is enough' },
      { name:'Comparative with "than"',formula:'More + adjective + than. Never "more + -er"',  tip:'"He is taller than me" NOT "more taller"' },
      { name:'Misplaced modifier',     formula:'Modifier must be NEXT to the word it modifies', tip:'"Only I love her" ≠ "I only love her" — meaning differs!' },
    ]},
    { title:'Articles (a, an, the)', items:[
      { name:'"an" before vowel sound',formula:'"an" when the word SOUNDS like it starts with a vowel', tip:'"an hour" (h silent), "an MLA" (em sound), "a university" (yoo sound)' },
      { name:'Use "the"',              formula:'Specific/known noun, unique things (sun, moon), superlatives', tip:'"THE best", "THE sun", "THE book you gave me"' },
      { name:'No article (zero article)',formula:'Languages, sports, meals, abstract nouns, proper names', tip:'"play cricket", "eat breakfast", "visit India", "hate injustice"' },
      { name:'Common exam traps',      formula:'"Go to school/college/hospital/church" (purpose) = no article', tip:'"He is in THE hospital" (visiting) vs "He goes to hospital" (as patient)' },
    ]},
    { title:'Active & Passive Voice', items:[
      { name:'Rule',                   formula:'Object + is/are/was/were + past participle + by + subject', tip:'"Ram writes a letter" → "A letter is written by Ram"' },
      { name:'Tense mapping',          formula:'Present: is/are written | Past: was/were written | Future: will be written', tip:'The tense changes only the auxiliary verb' },
      { name:'Cannot be passive',      formula:'Intransitive verbs (no object): sleep, die, come, go, happen', tip:'"She slept" → NO passive possible (no object to become subject)' },
    ]},
    { title:'Reading Comprehension Strategy', items:[
      { name:'Time allocation',        formula:'Max 5 minutes per passage in exam (2 min skim + 3 min answer)', tip:'Do not re-read the full passage for each question' },
      { name:'Inference questions',    formula:'Answer is NOT directly stated — deduce from context',          tip:'Choose what MUST be true, not what might be true' },
      { name:'Tone/Attitude',          formula:'Look for adjectives, emotional words, and author\'s word choice', tip:'Common tones: critical, appreciative, neutral, ironic, satirical' },
      { name:'Vocabulary from context',formula:'Eliminate options that don\'t fit the sentence meaning',       tip:'Even unknown words can be answered by elimination' },
    ]},
    { title:'Fill in the Blanks & Vocabulary', items:[
      { name:'Synonyms to memorize',   formula:'Eloquent=fluent | Benevolent=kind | Ambiguous=unclear | Pejorative=negative', tip:'Focus on words appearing frequently in PSU exams' },
      { name:'One-word substitution',  formula:'Omniscient=all-knowing | Omnipotent=all-powerful | Altruist=selfless person', tip:'Very common in Paper I English section' },
      { name:'Idioms',                 formula:'Bite the bullet=endure pain | Burn bridges=ruin relations | Hit the sack=sleep', tip:'Learn 20-30 common idioms and their meanings' },
    ]},
  ]},
];

// ── EXAM INFO DATA ────────────────────────────────────────────────────────────
const examInfoData = {
  pattern: [
    { paper:'Paper I — General Aptitude', marks:50, questions:50, time:'50 min', sections:[
      { name:'Verbal Ability (English)',  qs:15, topics:'Grammar, vocabulary, reading comprehension, error detection, fill in the blanks' },
      { name:'Numerical Aptitude',        qs:15, topics:'Percentage, ratio, profit-loss, time-work, time-speed-distance, averages, SI & CI' },
      { name:'Logical Reasoning',         qs:15, topics:'Series, coding-decoding, blood relations, syllogism, direction sense, ranking' },
      { name:'General Knowledge',         qs:5,  topics:'Current affairs, science GK, Indian polity, geography, Coal India facts' },
    ]},
    { paper:'Paper II — Technical (E&T)', marks:100, questions:100, time:'100 min', sections:[
      { name:'Digital Electronics',       qs:'15-20', topics:'Number systems, logic gates, Boolean algebra, K-map, flip-flops, counters, combinational circuits' },
      { name:'Analog Electronics',        qs:'15-20', topics:'Diodes, BJT, MOSFET, rectifiers, amplifiers, op-amp, oscillators, feedback' },
      { name:'Network Theory',            qs:'10-15', topics:'KCL/KVL, Thevenin/Norton, RLC, resonance, two-port networks' },
      { name:'Signals & Systems',         qs:'10-15', topics:'Fourier series/transform, Laplace, Z-transform, sampling, LTI systems' },
      { name:'Control Systems',           qs:'10-15', topics:'Transfer function, stability, Routh, root locus, Bode plot, PID' },
      { name:'Communications',            qs:'10-15', topics:'AM, FM, PCM, digital modulation, Shannon capacity, noise' },
      { name:'EM Theory',                 qs:'5-8',   topics:"Maxwell's equations, wave propagation, transmission lines, antennas" },
      { name:'Engineering Maths',         qs:'5-8',   topics:'Linear algebra, calculus, differential equations, probability, Fourier' },
    ]},
  ],
  marking: [
    { rule:'Correct answer',   marks:'+1 mark' },
    { rule:'Wrong answer',     marks:'-0.25 (negative marking)' },
    { rule:'Unattempted',      marks:'0 (no penalty)' },
    { rule:'Total marks',      marks:'150 (Paper I: 50 + Paper II: 100)' },
    { rule:'Duration',         marks:'3 hours total (approx 1 hr Paper I + 2 hrs Paper II)' },
    { rule:'Mode',             marks:'Online (Computer Based Test)' },
  ],
  strategy: [
    { tip:'Attempt accuracy over quantity', detail:'With -0.25 penalty, skip if unsure. 80% accuracy on 80 questions beats 60% on 120.' },
    { tip:'Digital + Analog first', detail:'These two subjects have highest weightage (30-40%). Master them first, they are also conceptually more straightforward.' },
    { tip:'Do not skip Paper I', detail:'Many candidates focus only on ECE and lose 10-15 marks in Paper I. 1 hour of daily aptitude = significant edge.' },
    { tip:'Formula sheet review', detail:'Last 30 days: review all formulas daily (use the Formula Sheet section). Do not try to learn new topics.' },
    { tip:'Elimination method', detail:'Even with partial knowledge, eliminate 2 wrong options to improve your odds to 50%. Much safer than blind guessing.' },
    { tip:'Time management', detail:'Paper II: spend max 1.5 min per question. Flag and skip tough ones, return at end.' },
    { tip:'Previous year papers', detail:'Coal India often repeats question patterns. Solve at least 5 previous year papers in the last month.' },
    { tip:'Negative marking discipline', detail:'If less than 60% confident → skip. If 60-75% confident → attempt. If > 75% confident → must attempt.' },
  ],
  importantTopics: [
    { subject:'Digital Electronics', topics:['K-Map simplification','JK/D flip-flop excitation','MOD-N counter design','Boolean expression minimization','Universal gates (NAND/NOR)','Number system conversion'] },
    { subject:'Analog Electronics',  topics:['BJT CE amplifier analysis','Op-amp configurations','Rectifier parameters (ripple, efficiency, PIV)','MOSFET vs BJT comparison','Zener regulation','Barkhausen criterion'] },
    { subject:'Network Theory',      topics:["Thevenin's/Norton's theorem","Maximum power transfer","Resonance frequency formula","KCL/KVL applications","Time constant RC/RL"] },
    { subject:'Signals & Systems',   topics:['Laplace transform pairs','Z-transform properties','Fourier series coefficients','Nyquist sampling theorem','LTI system stability (poles location)'] },
    { subject:'Control Systems',     topics:['Routh-Hurwitz stability','Bode plot (GM & PM)','Steady-state error constants','Root locus construction','PID controller effect','Type vs Order'] },
    { subject:'Communications',      topics:['AM modulation index & power','FM bandwidth (Carson rule)','PCM bit rate calculation','Shannon capacity formula','Superheterodyne receiver','PSK/FSK/QPSK comparison'] },
  ],
};

// ── PLAYLISTS ─────────────────────────────────────────────────────────────────
const playlists = [
  // ── Neso Academy — verified embeddable IDs ──
  { id:'de-neso',   title:'Digital Electronics',   channel:'Neso Academy',   subject:'digital',        color:'#8b5cf6', desc:'Number systems, logic gates, K-maps, flip-flops, counters — complete beginner-friendly course',           videos:'52 videos', hasEmbed:true, embedId:'PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm', ytUrl:'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm' },
  { id:'nt-neso',   title:'Network Theory',         channel:'Neso Academy',   subject:'network',        color:'#3b82f6', desc:'KCL, KVL, Thevenin, Norton, RLC circuits and resonance — complete course',                            videos:'60 videos', hasEmbed:true, embedId:'PLBlnK6fEyqRgLR-hMp7wem-bdVN1iEhsh', ytUrl:'https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLR-hMp7wem-bdVN1iEhsh' },
  { id:'ae-neso',   title:'Analog Electronics',    channel:'Neso Academy',   subject:'analog',         color:'#10b981', desc:'Diodes, BJT, MOSFET, amplifiers, op-amps — full playlist for analog circuits',                        videos:'70 videos', hasEmbed:true, embedId:'PLBlnK6fEyqRiw-GZRqfnlVIBz9dxrqHJS', ytUrl:'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiw-GZRqfnlVIBz9dxrqHJS' },
  { id:'ss-neso',   title:'Signals and Systems',   channel:'Neso Academy',   subject:'signals',        color:'#f97316', desc:'Signal types, Fourier series/transform, Laplace, Z-transform, sampling theorem',                       videos:'80 videos', hasEmbed:true, embedId:'PLBlnK6fEyqRhG6s3jYIU48CqsT5cyiDTO', ytUrl:'https://www.youtube.com/playlist?list=PLBlnK6fEyqRhG6s3jYIU48CqsT5cyiDTO' },
  { id:'cs-neso',   title:'Control Systems',       channel:'Neso Academy',   subject:'control',        color:'#ef4444', desc:'Transfer function, stability, Bode plots, root locus, PID — full control systems course',              videos:'60 videos', hasEmbed:true, embedId:'PLBlnK6fEyqRhqzJT87LsdQKYZBC93ezDo', ytUrl:'https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqzJT87LsdQKYZBC93ezDo' },
  { id:'comm-neso', title:'Communications',        channel:'GATE Wallah',    subject:'communications', color:'#14b8a6', desc:'AM, FM, digital modulation, Shannon capacity, noise — complete communication systems course',          videos:'60 videos', hasEmbed:true, embedId:'PLGtVq7DEEogZk2DPF5muPRV4p9Q4-UIy5', ytUrl:'https://www.youtube.com/playlist?list=PLGtVq7DEEogZk2DPF5muPRV4p9Q4-UIy5' },
  // ── Gate Smashers + GATE ECE alternatives ──
  { id:'de-gs',     title:'Digital Logic',         channel:'Gate Smashers',  subject:'digital',        color:'#7c3aed', desc:'GATE/PSU focused: number systems, boolean, flip-flops with MCQ tricks and shortcuts',                  videos:'45 videos', hasEmbed:true, embedId:'PLxCzCOWd7aiGmXg4NoX6R31AsC5LeCPHe', ytUrl:'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGmXg4NoX6R31AsC5LeCPHe' },
  { id:'nt-gs',     title:'Network Theory',        channel:'GATE ECE',       subject:'network',        color:'#1d4ed8', desc:'Network Theory strictly per GATE syllabus — KCL/KVL, theorems, resonance, two-port networks',           videos:'40 videos', hasEmbed:true, embedId:'PLfDaOYdi9aZwlZNAU0gl0rZ-SctZJcLe7', ytUrl:'https://www.youtube.com/playlist?list=PLfDaOYdi9aZwlZNAU0gl0rZ-SctZJcLe7' },
  { id:'ae-gs',     title:'Analog Electronics',    channel:'GATE Wallah',    subject:'analog',         color:'#047857', desc:'BJT, MOSFET, amplifiers, op-amp — GATE 2024 series with exam-focused shortcuts',                      videos:'50 videos', hasEmbed:true, embedId:'PL3eEXnCBViH8x_j-ulD23V4CIDazfrWfa', ytUrl:'https://www.youtube.com/playlist?list=PL3eEXnCBViH8x_j-ulD23V4CIDazfrWfa' },
  { id:'ss-gs',     title:'Signals and Systems',   channel:'GATE Wallah',    subject:'signals',        color:'#c2410c', desc:'Fourier, Laplace, Z-transform — GATE crash course with previous year problems',                       videos:'50 videos', hasEmbed:true, embedId:'PL3eEXnCBViH-mxwEDOfUaTNazck6Pf8Jt', ytUrl:'https://www.youtube.com/playlist?list=PL3eEXnCBViH-mxwEDOfUaTNazck6Pf8Jt' },
  { id:'cs-gs',     title:'Control Systems',       channel:'NPTEL / IIT',    subject:'control',        color:'#b91c1c', desc:'Control Systems by IIT Madras — transfer function, stability, Routh, root locus, Bode plot',          videos:'40 videos', hasEmbed:true, embedId:'PLrpK1inhO61UmJJOTNS8NvoSSW3TgkxrO', ytUrl:'https://www.youtube.com/playlist?list=PLrpK1inhO61UmJJOTNS8NvoSSW3TgkxrO' },
  { id:'comm-gs',   title:'Communications',        channel:'ECE Lectures',   subject:'communications', color:'#0f766e', desc:'Electronics & Communication complete lecture series — AM, FM, modulation, GATE & IES prep',            videos:'60 videos', hasEmbed:true, embedId:'PLDp9Jik5WjRtkw7q3aaVvMtLJiiw62V-H', ytUrl:'https://www.youtube.com/playlist?list=PLDp9Jik5WjRtkw7q3aaVvMtLJiiw62V-H' },
  // ── General / Other ──
  { id:'apt-gen',   title:'Quantitative Aptitude', channel:'GATE Aptitude',  subject:'other',          color:'#0f766e', desc:'Complete aptitude for GATE — percentage, ratio, profit-loss, time-work, series, reasoning',            videos:'60 videos', hasEmbed:true, embedId:'PLC36xJgs4dxE43Au1FGRQvwHTr7NbgDCS', ytUrl:'https://www.youtube.com/playlist?list=PLC36xJgs4dxE43Au1FGRQvwHTr7NbgDCS' },
  { id:'ca-gen',    title:'Current Affairs Daily', channel:'Utkarsh Classes',subject:'other',          color:'#b45309', desc:'Daily current affairs for competitive exams — GK, government schemes, news, science & tech',          videos:'Daily',    hasEmbed:true, embedId:'PLoZP2WsNfBSHJKkLcV_HY-3e3yN5zAuO4', ytUrl:'https://www.youtube.com/playlist?list=PLoZP2WsNfBSHJKkLcV_HY-3e3yN5zAuO4' },
  { id:'cil-pp',    title:'PSU Exam Papers',       channel:'PSU Prep',       subject:'other',          color:'#374151', desc:'PSU exam previous year question papers and solutions — Coal India, BHEL, NTPC, SAIL ECE',              videos:'30 videos', hasEmbed:true, embedId:'PLQQnCnD3IEymSsZ92bTTlA9yjQgMqa7g6', ytUrl:'https://www.youtube.com/playlist?list=PLQQnCnD3IEymSsZ92bTTlA9yjQgMqa7g6' },
  { id:'eng-gen',   title:'English for Exams',     channel:'Grade Up',       subject:'other',          color:'#6d28d9', desc:'English grammar & vocabulary for competitive exams — error detection, fill blanks, comprehension',     videos:'50 videos', hasEmbed:true, embedId:'PLhuF3CfgKa3ZTGbWZgxiIaHKwxw7YdlgA', ytUrl:'https://www.youtube.com/playlist?list=PLhuF3CfgKa3ZTGbWZgxiIaHKwxw7YdlgA' },
];

// ── PLAYLIST TOPIC CATALOG (for tracking what topics were watched) ────────────
const playlistTopics = {
  'de-neso':   ['Introduction & Number Systems','Binary & Octal Arithmetic','Hexadecimal & BCD','Logic Gates & Truth Tables','Boolean Algebra & Laws',"De Morgan's Theorem & Simplification",'SOP & POS Forms','Karnaugh Map (2 & 3 var)','Karnaugh Map (4 var & groups)','Combinational Circuits — Adder/Subtractor','MUX, DEMUX, Encoder, Decoder','SR Flip-Flop','D & JK Flip-Flop','T Flip-Flop & Edge Triggering','Asynchronous Counters','Synchronous Counters & MOD-N','Shift Registers','Memory — ROM & RAM'],
  'nt-neso':   ['Intro to Networks & Ohm\'s Law','KCL — Kirchhoff\'s Current Law','KVL — Kirchhoff\'s Voltage Law','Nodal Analysis (Part 1)','Nodal Analysis (Part 2 — Supernode)','Mesh Analysis (Part 1)','Mesh Analysis (Part 2 — Supermesh)','Superposition Theorem','Thevenin\'s Theorem','Norton\'s Theorem','Maximum Power Transfer','Source Transformation','Delta-Star Conversion','Impedance — Inductors & Capacitors','AC Circuit Analysis','Series Resonance','Parallel Resonance & Q Factor','Two-Port Networks'],
  'ss-neso':   ['Signals — Classification & Types','Unit Step, Ramp, Impulse Signals','Energy & Power Signals','Even & Odd Signals','Systems — Properties (Linearity, Time-invariance)','Causality, Stability & Memory','Convolution (Part 1)','Convolution (Part 2)','Fourier Series — Coefficients','Fourier Series — Properties','Fourier Transform — Definition','Fourier Transform — Properties','Sampling Theorem & Aliasing','Laplace Transform — Definition & ROC','Laplace Transform — Properties & Pairs','Inverse Laplace Transform','Z-Transform — Definition & ROC','Z-Transform — Properties & Pairs','Inverse Z-Transform','Discrete Fourier Transform (DFT)'],
  'ae-neso':   ['PN Junction Diode — Theory','Diode IV Characteristics','Half-Wave Rectifier (HWR)','Full-Wave Rectifier (FWR) & Bridge','Clippers & Clampers','Zener Diode & Voltage Regulation','BJT — Construction & IV Curves','BJT Biasing Techniques','CE Amplifier Analysis','CB & CC (Emitter Follower) Configurations','BJT Small Signal Model','JFET — Characteristics & Pinch-off','MOSFET — Enhancement & Depletion','MOSFET Amplifier','Class A Amplifier','Class B & AB Amplifiers','Op-Amp — Ideal Characteristics','Op-Amp Inverting & Non-Inverting','Integrator & Differentiator','Comparator & Schmitt Trigger','Oscillators — Hartley & Colpitts','Feedback Amplifier Theory'],
  'de-gs':     ['Number Systems & Conversions','Boolean Algebra & Theorems','K-Map Minimization','Logic Gates & Universal Gates','Combinational Circuit Design','Sequential Circuits Intro','Flip Flops — SR, D, JK, T','Counters & Shift Registers','Memory Devices'],
  'nt-gs':     ['Basic Laws (Ohm, KCL, KVL)','Nodal & Mesh Analysis','Superposition Theorem','Thevenin & Norton Theorem','Maximum Power Transfer','RLC Circuit Analysis','Resonance & Q Factor'],
  'ae-gs':     ['Diodes & Rectifier Circuits','BJT Analysis & Biasing','MOSFET & JFET','Amplifier Circuits','Op-Amp Applications','Oscillators & Feedback'],
  'ss-gs':     ['Signal Classification','LTI Systems & Convolution','Fourier Series','Fourier Transform','Laplace Transform & ROC','Z-Transform & ROC','Sampling & Reconstruction'],
  'cs-neso':   ['Introduction to Control Systems','Mathematical Modeling','Transfer Function','Block Diagram Reduction','Signal Flow Graph & Mason\'s Formula','Time Response — First Order','Time Response — Second Order','Routh-Hurwitz Stability Criterion','Root Locus — Construction Rules','Root Locus — Design','Bode Plot — Construction','Bode Plot — Stability Margins','Polar Plot & Nyquist Criterion','PID Controller Design','State Space Representation','State Space — Controllability & Observability'],
  'cs-gs':     ['Transfer Function & Block Diagrams','Time Domain Analysis','Stability — Routh Criterion','Root Locus Technique','Bode & Nyquist Plots','Controllers & Compensation'],
  'comm-neso': ['Introduction to Communications','AM — Theory & Modulation Index','AM — Power & Bandwidth','DSB-SC Modulation','SSB Modulation','VSB Modulation','AM Demodulation (Envelope Detector)','Angle Modulation — FM & PM','FM — Modulation Index & Bandwidth','FM — Carson\'s Rule','FM Demodulation','Noise in AM Systems','Noise in FM Systems','Pulse Modulation — PAM, PWM, PPM','PCM — Sampling, Quantization, Encoding','Digital Modulation — ASK & FSK','PSK & DPSK','QPSK & QAM','Shannon\'s Information Theory','Multiplexing — TDM & FDM','Superheterodyne Receiver'],
  'comm-gs':   ['AM & FM Modulation Analysis','Digital Modulation Schemes','PCM & Information Theory','Noise & SNR Calculations','Receivers & Superheterodyne'],
  'apt-gen':   ['Percentages & Applications','Profit, Loss & Discount','Simple & Compound Interest','Ratio, Proportion & Variation','Time & Work','Pipes & Cisterns','Time, Speed & Distance','Trains & Boats','Number System & HCF/LCM','Averages & Mixtures','Permutation & Combination','Probability Basics'],
  'ca-gen':    ['National Current Affairs','International Current Affairs','Science & Technology News','Sports & Awards','Government Schemes & Policies','Economy & Finance GK'],
  'cil-pp':    ['Coal India MT 2019 Paper Analysis','Coal India MT 2021 Paper Analysis','Coal India MT 2022 Paper Analysis','Coal India MT 2023 Paper Analysis','Paper I Aptitude Solutions','Paper II ECE Technical Solutions'],
  'eng-gen':   ['Subject-Verb Agreement Rules','Tense Rules & Common Errors','Articles (a, an, the)','Prepositions — Fixed Phrases','Active & Passive Voice','Direct & Indirect Speech','Reading Comprehension Strategy','Error Spotting Techniques','Fill in the Blanks','One-Word Substitution & Vocabulary','Idioms & Phrases'],
};

// ── YOUTUBE IFRAME API TRACKING ────────────────────────────────────────────────
let ytPlayer = null;
let ytSkipCount = 0;       // consecutive errors — resets on successful play
window.ytApiReady = false;

// Called automatically by YouTube API when script loads
window.onYouTubeIframeAPIReady = function() {
  window.ytApiReady = true;
  // If a playlist is already waiting to be loaded, create the player now
  if (window._pendingPlaylist) {
    createYTPlayer(window._pendingPlaylist);
    window._pendingPlaylist = null;
  }
};

function initYTApiPlayer(pl) {
  ytSkipCount = 0; // reset skip counter for new playlist
  // Destroy old player safely
  try { if (ytPlayer) { ytPlayer.destroy(); ytPlayer = null; } } catch(e) {}
  // Clear the container
  const div = document.getElementById('yt-player-div');
  if (div) div.innerHTML = '';

  if (window.ytApiReady && window.YT && window.YT.Player) {
    createYTPlayer(pl);
  } else {
    window._pendingPlaylist = pl;
    // Fallback iframe in case API takes too long
    setTimeout(() => {
      if (window._pendingPlaylist) {
        createYTPlayer(window._pendingPlaylist);
        window._pendingPlaylist = null;
      }
    }, 3000);
  }
}

function createYTPlayer(pl) {
  const div = document.getElementById('yt-player-div');
  if (!div) return;
  div.innerHTML = '';
  const inner = document.createElement('div');
  inner.id = 'yt-inner-player';
  div.appendChild(inner);

  try {
    ytPlayer = new YT.Player('yt-inner-player', {
      width: '100%', height: '100%',
      playerVars: {
        listType: 'playlist',
        list: pl.embedId,
        rel: 0,
        modestbranding: 1,
        autoplay: 0,
        enablejsapi: 1,
      },
      events: {
        onReady: function() {
          document.getElementById('vp-now-playing').style.display = 'none';
        },
        onStateChange: onYTStateChange,
        onError: function(event) {
          // Codes 100/101/150 = video unavailable or embedding blocked.
          // Try to skip to the next video in the playlist.
          // Only fall back to the open-on-YouTube panel after 5 consecutive failures.
          ytSkipCount++;
          if (ytSkipCount < 6) {
            try { if (ytPlayer && ytPlayer.nextVideo) ytPlayer.nextVideo(); } catch(e) {}
          } else {
            // All (or most) videos in this playlist cannot be embedded — show fallback
            ytSkipCount = 0;
            div.innerHTML = '';
            const noEmbed = document.getElementById('vp-no-embed');
            if (noEmbed) noEmbed.style.display = 'flex';
            const t = document.getElementById('vp-no-embed-title');
            if (t) t.textContent = pl.title + ' — ' + pl.channel;
            const ytLnk = document.getElementById('vp-yt-link');
            if (ytLnk) ytLnk.href = pl.ytUrl;
            const openLnk = document.getElementById('vp-open-link');
            if (openLnk) openLnk.href = pl.ytUrl;
            const npEl2 = document.getElementById('vp-now-playing');
            if (npEl2) npEl2.style.display = 'none';
          }
        },
      },
    });
  } catch(e) {
    // API not available — fallback to standard iframe
    div.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${pl.embedId}&rel=0&modestbranding=1" style="width:100%;height:100%;border:none" allowfullscreen></iframe>`;
  }
}

function onYTStateChange(event) {
  const pl = state.currentPlaylist;
  if (!pl) return;
  const playerStates = { '-1':'unstarted', '0':'ended', '1':'playing', '2':'paused', '3':'buffering', '5':'cued' };

  if (event.data === 1) { // Playing
    try {
      ytSkipCount = 0; // reset — a video is actually playing
      const data = ytPlayer.getVideoData();
      if (!data || !data.video_id) return;
      const vid = data.video_id, title = data.title || 'Unknown';
      state.videoData[pl.id] = state.videoData[pl.id] || {};
      state.videoData[pl.id].ytWatched = state.videoData[pl.id].ytWatched || {};
      state.videoData[pl.id].ytWatched[vid] = state.videoData[pl.id].ytWatched[vid] || {};
      state.videoData[pl.id].ytWatched[vid].title = title;
      state.videoData[pl.id].ytWatched[vid].started = true;
      state.videoData[pl.id].ytWatched[vid].lastWatched = new Date().toLocaleDateString();
      localStorage.setItem('cil_video', JSON.stringify(state.videoData));

      // Show now-playing bar with current video title
      const np = document.getElementById('vp-now-playing');
      if (np) {
        np.innerHTML = `<strong>Now Playing:</strong> ${title}`;
        np.style.display = 'block';
      }

      renderTopicChecklist(pl.id);
      markTodayStudied();
    } catch(e) {}
  }

  if (event.data === 0) { // Ended
    try {
      const data = ytPlayer.getVideoData();
      if (!data || !data.video_id) return;
      const vid = data.video_id;
      if (state.videoData[pl.id] && state.videoData[pl.id].ytWatched && state.videoData[pl.id].ytWatched[vid]) {
        state.videoData[pl.id].ytWatched[vid].completed = true;
        localStorage.setItem('cil_video', JSON.stringify(state.videoData));
        renderTopicChecklist(pl.id);
      }
    } catch(e) {}
  }
}

// ── QUICK SEARCH TOPICS ───────────────────────────────────────────────────────
const quickTopics = [
  'Coal India MT E&T syllabus 2025','Digital Electronics MCQ','K-Map simplification',
  'Thevenin Norton theorem','BJT vs MOSFET','Fourier Transform properties',
  'FM bandwidth Carson rule','Control Systems Bode plot','Z-transform ROC',
  'Routh Hurwitz stability','AM modulation index','Shannon capacity formula',
  'Op-amp CMRR slew rate','Nyquist sampling theorem','Coal India previous year paper',
];

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  renderStats();
  renderWeek('week1');
  renderSubjects();
  renderPlaylists('all');
  renderQuickChips();
  renderMistakeBook('all');
  renderFormulas('digital');
  renderExamInfo();
  updateVideoBadge();
  updateExamCountdown();
  navigateTo('dashboard');
});

// ── NAVIGATION ────────────────────────────────────────────────────────────────
const sectionTitles = {
  dashboard:'Dashboard', subjects:'Subjects', mocktest:'Mock Test',
  playlists:'Video Library', video:'Now Watching', search:'Search Topics',
  mistakebook:'Mistake Book', formulas:'Formula Sheet', examinfo:'Exam Info',
};
function navigateTo(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
  document.getElementById('sec-' + id)?.classList.add('active');
  document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
  document.getElementById('topbar-title').textContent = sectionTitles[id] || id;
  if (window.innerWidth < 769) document.getElementById('sidebar').classList.remove('open');
}
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// ── THEME ─────────────────────────────────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('cil_theme', state.theme);
  applyTheme();
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.innerHTML = state.theme === 'dark'
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
}

// ── STREAK & DAILY TRACKING ───────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().split('T')[0]; }

function markTodayStudied() {
  const key = todayKey();
  if (!state.studiedDates.includes(key)) {
    state.studiedDates.push(key);
    localStorage.setItem('cil_dates', JSON.stringify(state.studiedDates));
  }
}

function getStreak() {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 100; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (state.studiedDates.includes(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function checkIn() {
  markTodayStudied();
  renderStats();
  renderWeekGrid();
  showToast("Check-in recorded! Keep going!", 'ok');
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function renderStats() {
  const daysDone = Object.values(state.progress).filter(Boolean).length;
  const topicsDone = Object.values(state.topicProgress).filter(Boolean).length;
  const totalTopics = Object.values(subjects).reduce((sum, s) => sum + s.topics.length, 0) || 42;
  const pct = Math.round((daysDone / 45) * 100);
  const avg = state.history.length ? Math.round(state.history.reduce((a,b) => a + b.pct, 0) / state.history.length) : null;
  const streak = getStreak();

  // Stat cards
  const sdays = document.getElementById('stat-days'); if(sdays) sdays.textContent = daysDone;
  const stests = document.getElementById('stat-tests'); if(stests) stests.textContent = state.history.length;
  const sscore = document.getElementById('stat-score'); if(sscore) sscore.textContent = avg !== null ? avg + '%' : '--';
  const smist = document.getElementById('stat-mistakes'); if(smist) smist.textContent = state.mistakes.length;
  const sstreak = document.getElementById('stat-streak'); if(sstreak) sstreak.textContent = streak;
  const stopics = document.getElementById('stat-topics'); if(stopics) stopics.textContent = topicsDone + '/' + totalTopics;

  // Progress ring (out of 45 days total)
  const ring = document.getElementById('progress-ring');
  const ringPct = document.getElementById('ring-pct');
  if (ring) ring.style.strokeDashoffset = 226.2 * (1 - pct / 100);
  if (ringPct) ringPct.textContent = pct + '%';

  // Subject progress bars
  Object.keys(subjects).forEach(key => {
    const total = subjects[key].topics.length;
    const done  = subjects[key].topics.filter((_, i) => state.topicProgress[key + '_' + i]).length;
    const bar   = document.getElementById('subj-bar-' + key);
    const lbl   = document.getElementById('subj-lbl-' + key);
    if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
    if (lbl) lbl.textContent = done + '/' + total;
  });

  renderWeekGrid();
}

function renderWeekGrid() {
  const grid = document.getElementById('week-grid');
  if (!grid) return;
  const today = new Date();
  grid.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key  = d.toISOString().split('T')[0];
    const done = state.studiedDates.includes(key);
    const isToday = i === 0;
    const cell = document.createElement('div');
    cell.className = 'wg-cell' + (done ? ' wg-done' : '') + (isToday ? ' wg-today' : '');
    cell.title = d.toDateString() + (done ? ' — Studied' : ' — No activity');
    const days = ['S','M','T','W','T','F','S'];
    cell.innerHTML = `<span>${days[d.getDay()]}</span>`;
    grid.appendChild(cell);
  }
}

// ── EXAM COUNTDOWN ────────────────────────────────────────────────────────────
function setExamDate() {
  const inp = document.getElementById('exam-date-input');
  if (!inp || !inp.value) return;
  state.examDate = inp.value;
  localStorage.setItem('cil_examdate', inp.value);
  updateExamCountdown();
  showToast('Exam date set!', 'ok');
}

function updateExamCountdown() {
  const el = document.getElementById('exam-countdown');
  if (!el) return;
  if (!state.examDate) { el.textContent = 'Set exam date below'; return; }
  const diff = Math.ceil((new Date(state.examDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) { el.textContent = 'Exam date passed'; return; }
  el.textContent = diff + ' days remaining';
  el.style.color = diff <= 30 ? 'var(--danger)' : diff <= 60 ? 'var(--warning)' : 'var(--success)';
}

// ── STUDY PLAN ────────────────────────────────────────────────────────────────
function switchWeek(week) {
  document.querySelectorAll('.week-tab').forEach(t => t.classList.toggle('active', t.dataset.week === week));
  renderWeek(week);
}
function renderWeek(week) {
  const days = studyPlan[week] || [];
  const el = document.getElementById('plan-days');
  if (!el) return;
  el.innerHTML = days.map(d => {
    const done = !!state.progress['d' + d.day];
    return `
    <div class="plan-item ${done ? 'done' : ''}">
      <div class="plan-day-badge">D${d.day}</div>
      <div class="plan-info">
        <div class="plan-topic">${d.topic}</div>
        <div class="plan-sub">${d.subject} &middot; ${d.sub}</div>
      </div>
      <div class="plan-actions">
        <button class="btn-icon" onclick="searchPlanDay(${d.day},'g')" title="Search Google">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="btn-icon" onclick="searchPlanDay(${d.day},'y')" title="Watch on YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </button>
        <button class="check-circle ${done ? 'done' : ''}" onclick="toggleDay(${d.day})" title="${done ? 'Mark undone' : 'Mark done'}">
          ${done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </button>
      </div>
    </div>`;
  }).join('');
}
function toggleDay(day) {
  const k = 'd' + day;
  state.progress[k] = !state.progress[k];
  localStorage.setItem('cil_progress', JSON.stringify(state.progress));
  if (state.progress[k]) markTodayStudied();
  const w = document.querySelector('.week-tab.active')?.dataset.week || 'week1';
  renderWeek(w);
  renderStats();
  showToast(state.progress[k] ? 'Day ' + day + ' marked complete' : 'Day ' + day + ' unmarked', 'ok');
}

// ── SUBJECTS ──────────────────────────────────────────────────────────────────
function renderSubjects() {
  Object.entries(subjects).forEach(([key, subj]) => {
    const panel = document.getElementById('panel-' + key);
    if (!panel) return;
    const topicsDone = subj.topics.filter((_, i) => state.topicProgress[key+'_'+i]).length;
    const pct = Math.round((topicsDone / subj.topics.length) * 100);
    panel.innerHTML = `
    <div class="subj-header-bar">
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">${topicsDone} of ${subj.topics.length} topics completed &middot; Exam weightage: ${subj.weight}</div>
        <div class="subj-prog-wrap"><div class="subj-prog-fill" style="width:${pct}%;background:${subj.color}"></div></div>
      </div>
      <div style="margin-left:16px;font-size:22px;font-weight:800;color:${subj.color}">${pct}%</div>
    </div>
    <div class="topic-grid">${subj.topics.map((t, i) => {
      const done = !!state.topicProgress[key+'_'+i];
      const si = key+'_t'+i;
      window['_s_'+si] = t.search;
      return `
      <div class="topic-card ${done ? 'topic-done' : ''}" style="border-color:${done ? subj.color : 'var(--border)'}">
        <div class="topic-card-top">
          <span class="topic-number">Topic ${i+1}</span>
          <button class="topic-check ${done ? 'checked' : ''}" onclick="toggleTopic('${key}',${i})" style="${done ? 'background:'+subj.color+';border-color:'+subj.color : ''}" title="${done?'Mark undone':'Mark done'}">
            ${done ? '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </button>
        </div>
        <div class="topic-name">${t.name}</div>
        <div class="topic-tags">${t.tags.map(tag=>`<span class="tag">${tag}</span>`).join('')}</div>
        <div class="topic-actions">
          <button class="btn btn-primary btn-sm" onclick="searchGoogle(window['_s_${si}']+' MCQ Coal India exam')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Google
          </button>
          <button class="btn btn-ghost btn-sm" onclick="openYT('neso academy '+window['_s_${si}'])">Neso</button>
          <button class="btn btn-ghost btn-sm" onclick="openYT('gate smashers '+window['_s_${si}'])">GATE</button>
          <button class="btn btn-success btn-sm" onclick="quickTest('${key}')">MCQ</button>
        </div>
      </div>`;
    }).join('')}</div>`;
  });
}

function toggleTopic(subject, index) {
  const k = subject + '_' + index;
  state.topicProgress[k] = !state.topicProgress[k];
  localStorage.setItem('cil_topics', JSON.stringify(state.topicProgress));
  if (state.topicProgress[k]) markTodayStudied();
  renderSubjects();
  renderStats();
  showToast(state.topicProgress[k] ? subjects[subject].topics[index].name + ' marked done' : 'Marked undone', 'ok');
}

function switchSubject(key) {
  state.currentSubject = key;
  document.querySelectorAll('.subject-tab').forEach(t => t.classList.toggle('active', t.dataset.subj === key));
  document.querySelectorAll('.subject-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + key));
}
function quickTest(subject) {
  navigateTo('mocktest');
  const el = document.getElementById('sel-subject');
  if (el) el.value = subject;
}

// ── MOCK TEST ─────────────────────────────────────────────────────────────────
function startTest() {
  const subject = document.getElementById('sel-subject').value;
  const count   = parseInt(document.getElementById('sel-count').value);
  const mins    = parseInt(document.getElementById('sel-time').value);
  let pool = shuffle([...(questionsDB[subject] || questionsDB.mixed)]).slice(0, count);
  state.quiz = { qs:pool, cur:0, score:0, answers:new Array(pool.length).fill(null), timer:null, timeLeft:mins*60 };
  document.getElementById('test-setup').style.display  = 'none';
  document.getElementById('quiz-area').style.display   = 'block';
  document.getElementById('result-area').style.display = 'none';
  renderQ();
  startTimer();
}
function renderQ() {
  const { qs, cur, answers } = state.quiz;
  if (cur >= qs.length) { endTest(); return; }
  const q = qs[cur]; const opts = ['A','B','C','D'];
  document.getElementById('q-num').textContent = `Question ${cur+1} of ${qs.length}`;
  document.getElementById('q-prog-fill').style.width = ((cur / qs.length) * 100) + '%';
  document.getElementById('q-text').textContent = q.q;
  const already = answers[cur] !== null;
  document.getElementById('q-options').innerHTML = q.options.map((o, i) => `
    <button class="option-btn ${already ? (i===q.answer?'correct':(i===answers[cur]?'wrong':'')) : ''}"
      id="opt-${i}" onclick="selectA(${i})" ${already?'disabled':''}>
      <span class="opt-key">${opts[i]}</span><span>${o}</span>
    </button>`).join('');
  const expEl = document.getElementById('q-explain');
  expEl.textContent = already ? 'Explanation: ' + q.explanation : '';
  expEl.style.display = already ? 'block' : 'none';
  document.getElementById('btn-next').style.display = already ? 'inline-flex' : 'none';
}
function selectA(idx) {
  const { qs, cur } = state.quiz;
  if (state.quiz.answers[cur] !== null) return;
  state.quiz.answers[cur] = idx;
  if (idx === qs[cur].answer) state.quiz.score++;
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  document.getElementById('opt-'+idx).classList.add(idx===qs[cur].answer?'correct':'wrong');
  if (idx !== qs[cur].answer) document.getElementById('opt-'+qs[cur].answer).classList.add('correct');
  const expEl = document.getElementById('q-explain');
  expEl.textContent = 'Explanation: ' + qs[cur].explanation;
  expEl.style.display = 'block';
  document.getElementById('btn-next').style.display = 'inline-flex';
}
function nextQ() { state.quiz.cur++; if(state.quiz.cur>=state.quiz.qs.length) endTest(); else renderQ(); }
function startTimer() {
  clearInterval(state.quiz.timer);
  state.quiz.timer = setInterval(() => {
    state.quiz.timeLeft--;
    const m=Math.floor(state.quiz.timeLeft/60), s=state.quiz.timeLeft%60;
    document.getElementById('timer-text').textContent = m+':'+String(s).padStart(2,'0');
    if(state.quiz.timeLeft<=60) document.getElementById('quiz-timer').classList.add('warn');
    if(state.quiz.timeLeft<=0) { clearInterval(state.quiz.timer); endTest(); }
  }, 1000);
}
function endTest() {
  clearInterval(state.quiz.timer);
  const { qs, score } = state.quiz;
  const total = qs.length, pct = Math.round((score/total)*100);
  state.history.push({ pct, score, total, date:new Date().toLocaleDateString() });
  localStorage.setItem('cil_history', JSON.stringify(state.history));
  markTodayStudied();
  document.getElementById('quiz-area').style.display  = 'none';
  document.getElementById('result-area').style.display = 'block';
  const cls = pct>=75?'var(--success)':pct>=50?'var(--warning)':'var(--danger)';
  const msg = pct>=75?'Excellent work!':pct>=50?'Good effort!':'Keep practicing!';
  const circ = 2*Math.PI*44;
  document.getElementById('result-area').innerHTML = `
  <div class="result-hero">
    <div class="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="44" fill="none" stroke="var(--border)" stroke-width="9"/>
        <circle cx="55" cy="55" r="44" fill="none" stroke="${cls}" stroke-width="9" stroke-linecap="round"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}" transform="rotate(-90 55 55)"/>
      </svg>
      <div class="score-text"><span class="score-pct" style="color:${cls}">${pct}%</span><span class="score-label">Score</span></div>
    </div>
    <div class="result-msg">${msg}</div>
    <div class="result-sub">Completed ${new Date().toLocaleDateString()} &mdash; ${score} correct of ${total}</div>
    <div class="result-stats">
      <div class="rs-chip"><div class="rs-num" style="color:var(--success)">${score}</div><div class="rs-lbl">Correct</div></div>
      <div class="rs-chip"><div class="rs-num" style="color:var(--danger)">${total-score}</div><div class="rs-lbl">Wrong</div></div>
      <div class="rs-chip"><div class="rs-num" style="color:var(--warning)">${total-score}</div><div class="rs-lbl">Skippable next time</div></div>
    </div>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="resetTest()">New Test</button>
      <button class="btn btn-ghost" onclick="addWrongToMB()">Add Wrong Answers to Mistake Book</button>
    </div>
  </div>
  <div class="card" style="margin-top:0">
    <div class="card-title">Answer Review</div>
    ${state.quiz.qs.map((q,i)=>{
      const a=state.quiz.answers[i]; const ok=a===q.answer;
      return `<div class="review-item ${ok?'c':'w'}">
        <strong>Q${i+1}:</strong> ${q.q}<br>
        <span style="color:${ok?'var(--success)':'var(--danger)'}">
          ${ok?'Correct: '+q.options[q.answer]:'Your answer: '+(a!==null?q.options[a]:'Not answered')+' | Correct: '+q.options[q.answer]}
        </span><br>
        <small style="color:var(--text-muted)">${q.explanation}</small>
      </div>`;
    }).join('')}
  </div>`;
  renderStats();
}
function resetTest() {
  document.getElementById('result-area').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('test-setup').style.display = 'block';
  document.getElementById('btn-next').style.display = 'none';
}
function addWrongToMB() {
  const { qs, answers } = state.quiz; let added = 0;
  const subj = document.getElementById('sel-subject')?.value || 'mixed';
  qs.forEach((q,i) => {
    if(answers[i]!==q.answer) {
      state.mistakes.unshift({ id:Date.now()+i, topic:'Test Question', subject:subj,
        question:q.q, formula:'Correct: '+q.options[q.answer], why:q.explanation,
        date:new Date().toLocaleDateString() });
      added++;
    }
  });
  localStorage.setItem('cil_mistakes', JSON.stringify(state.mistakes));
  renderMistakeBook('all'); renderStats();
  navigateTo('mistakebook');
  showToast(added + ' wrong answers added to Mistake Book', 'ok');
}

// ── VIDEO LIBRARY ─────────────────────────────────────────────────────────────
function renderPlaylists(filter) {
  const grid = document.getElementById('playlist-grid');
  if (!grid) return;
  const list = filter==='all' ? playlists : playlists.filter(p=>p.subject===filter);
  grid.innerHTML = list.map(p => {
    const vd=state.videoData[p.id]||{}, status=vd.status||'not-started';
    // Calculate pct from topic checklist if available, else use stored pct
    const topics = playlistTopics[p.id] || [];
    const topicsDone = topics.length ? Object.values(vd.topicsWatched||{}).filter(Boolean).length : 0;
    const pct = topics.length ? Math.round((topicsDone/topics.length)*100) : (vd.pct||0);
    const topicLabel = topics.length ? ` · ${topicsDone}/${topics.length} topics` : '';
    const statusLabel={'not-started':'Not started','in-progress':'In progress','completed':'Completed'}[status];
    const statusSvg={'not-started':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>','in-progress':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="12 2 12 22"/><circle cx="12" cy="12" r="10"/></svg>','completed':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>'}[status];
    return `
    <div class="pl-card" onclick="openPlayer('${p.id}')">
      <div class="pl-thumb" style="background:linear-gradient(135deg,${p.color}ee,${p.color}88)">
        <span class="pl-channel-badge">${p.channel}</span>
        <div class="pl-thumb-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
        <span class="pl-count-badge">${p.videos}</span>
        ${status==='completed'?'<span class="pl-done-badge">Done</span>':''}
      </div>
      <div class="pl-progress-bar"><div class="pl-progress-fill" style="width:${pct}%;background:${p.color}"></div></div>
      <div class="pl-body">
        <div class="pl-title">${p.title}</div>
        <div style="font-size:11px;color:var(--text-light);margin-bottom:4px">${p.channel}</div>
        <div class="pl-desc">${p.desc}</div>
        <div class="pl-footer">
          <span class="pl-status ${status}">${statusSvg}${statusLabel}${topicLabel}</span>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openPlayer('${p.id}')">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M5 3l14 9-14 9V3z"/></svg>
            Watch
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function filterLib(f) {
  document.querySelectorAll('.lib-filter').forEach(b=>b.classList.toggle('active',b.dataset.f===f));
  renderPlaylists(f);
}
function updateVideoBadge() {
  const watching = playlists.filter(p=>(state.videoData[p.id]||{}).status==='in-progress').length;
  const el = document.getElementById('video-badge');
  if (el) { el.textContent=watching; el.style.display=watching>0?'inline':'none'; }
}

// ── VIDEO PLAYER ──────────────────────────────────────────────────────────────
function openPlayer(id) {
  const pl = playlists.find(p => p.id === id);
  if (!pl) return;
  state.currentPlaylist = pl;

  // ── Meta / header ──
  document.getElementById('vp-back-title').textContent = pl.title + ' — ' + pl.channel;
  document.getElementById('vp-title').textContent      = pl.title;
  document.getElementById('vp-desc').textContent       = pl.desc;
  document.getElementById('vp-channel').textContent    = pl.channel;
  document.getElementById('vp-open-link').href         = pl.ytUrl;
  const chip = document.getElementById('vp-channel-chip');
  if (chip) { chip.style.background = pl.color + '22'; chip.style.color = pl.color; }

  // ── Player area: clear previous content first ──
  const playerDiv = document.getElementById('yt-player-div');
  const noEmbedEl = document.getElementById('vp-no-embed');
  const npEl      = document.getElementById('vp-now-playing');
  if (playerDiv) playerDiv.innerHTML = '';   // stops previous video / audio
  if (npEl)      npEl.style.display  = 'none';

  if (pl.hasEmbed && pl.embedId) {
    // ── Embedded playlist: use YT.Player API for error detection + auto-tracking ──
    if (noEmbedEl) noEmbedEl.style.display = 'none';
    if (npEl)      npEl.style.display = 'none';   // hidden until a video actually plays
    initYTApiPlayer(pl);
    renderTopicChecklist(pl.id);
  } else {
    // ── Non-embeddable: show a styled info panel + topic checklist ──
    if (playerDiv) playerDiv.innerHTML = '';
    if (noEmbedEl) {
      noEmbedEl.style.display = 'flex';
      const t = document.getElementById('vp-no-embed-title');
      if (t) t.textContent = pl.title + ' — ' + pl.channel;
    }
    const ytLink = document.getElementById('vp-yt-link');
    if (ytLink) ytLink.href = pl.ytUrl;
    renderTopicChecklist(pl.id);
  }

  // ── Restore notes, status ──
  const saved   = state.videoData[pl.id] || {};
  const notesEl = document.getElementById('vp-notes');
  if (notesEl) notesEl.value = saved.notes || '';
  updateStatusBtns(saved.status || 'not-started');
  if (!saved.status || saved.status === 'not-started') setVStatus('in-progress');

  navigateTo('video');
}

function leavePlayer() {
  // Destroy YT player and clear iframe so audio stops immediately
  try { if (ytPlayer) { ytPlayer.destroy(); ytPlayer = null; } } catch(e) {}
  const playerDiv = document.getElementById('yt-player-div');
  if (playerDiv) playerDiv.innerHTML = '';
  const noEmbedEl = document.getElementById('vp-no-embed');
  if (noEmbedEl) noEmbedEl.style.display = 'none';
  navigateTo('playlists');
}

function renderTopicChecklist(playlistId) {
  const topics = playlistTopics[playlistId] || [];
  const el = document.getElementById('vp-topic-list');
  const countEl = document.getElementById('vp-topic-done-count');
  if (!el) return;

  const watched    = (state.videoData[playlistId] || {}).topicsWatched || {};
  const ytWatched  = (state.videoData[playlistId] || {}).ytWatched || {};
  const doneCount  = Object.values(watched).filter(Boolean).length;
  const ytEntries  = Object.entries(ytWatched);
  const ytFinished = ytEntries.filter(([, v]) => v.completed).length;

  if (countEl) countEl.textContent = doneCount + ' / ' + topics.length + ' done';

  let html = '';

  // ── Predefined topic checklist (manual ticking) ──
  if (topics.length) {
    html += topics.map((t, i) => {
      const done = !!watched['t' + i];
      return `<div class="tc-item" onclick="togglePlaylistTopic('${playlistId}',${i})">
        <div class="tc-icon ${done ? 'tc-done' : ''}">
          ${done
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'}
        </div>
        <div class="tc-title" style="${done ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${t}</div>
      </div>`;
    }).join('');
  } else {
    html += '<div style="font-size:12px;color:var(--text-muted);padding:8px 0">Tick off topics as you finish them.</div>';
  }

  // ── Auto-tracked videos from YouTube player ──
  if (ytEntries.length) {
    html += `<div class="tc-separator">Auto-tracked from player &nbsp;·&nbsp; ${ytEntries.length} watched &nbsp;·&nbsp; ${ytFinished} completed</div>`;
    html += ytEntries.map(([vid, info]) => `
    <div class="tc-item">
      <div class="tc-icon ${info.completed ? 'tc-done' : 'tc-progress'}">
        ${info.completed
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'}
      </div>
      <div style="flex:1;min-width:0">
        <div class="tc-title">${info.title}</div>
        <div class="tc-meta">${info.completed ? 'Completed' : 'Watching'} &nbsp;·&nbsp; ${info.lastWatched}</div>
      </div>
      <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" class="tc-replay" title="Open video on YouTube">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>`).join('');
  }

  el.innerHTML = html;
}

function renderYTWatchedList(playlistId) {
  renderTopicChecklist(playlistId);
}

function togglePlaylistTopic(playlistId, index) {
  state.videoData[playlistId] = state.videoData[playlistId] || {};
  state.videoData[playlistId].topicsWatched = state.videoData[playlistId].topicsWatched || {};
  const k = 't' + index;
  state.videoData[playlistId].topicsWatched[k] = !state.videoData[playlistId].topicsWatched[k];
  // Auto-calculate pct from ticked topics
  const topics = playlistTopics[playlistId] || [];
  const doneCount = Object.values(state.videoData[playlistId].topicsWatched).filter(Boolean).length;
  if (topics.length) state.videoData[playlistId].pct = Math.round((doneCount / topics.length) * 100);
  if (state.videoData[playlistId].topicsWatched[k]) markTodayStudied();
  localStorage.setItem('cil_video', JSON.stringify(state.videoData));
  renderTopicChecklist(playlistId);
  renderPlaylists(document.querySelector('.lib-filter.active')?.dataset.f || 'all');
  updateVideoBadge();
}
function setVStatus(status) {
  if(!state.currentPlaylist) return;
  const id=state.currentPlaylist.id;
  state.videoData[id]=state.videoData[id]||{};
  state.videoData[id].status=status;
  if(!state.videoData[id].startedAt) state.videoData[id].startedAt=new Date().toLocaleDateString();
  if(status==='completed') state.videoData[id].completedAt=new Date().toLocaleDateString();
  localStorage.setItem('cil_video',JSON.stringify(state.videoData));
  updateStatusBtns(status); updateVideoBadge(); renderStats();
  showToast('Status: '+status.replace('-',' '),'ok');
}
function updateStatusBtns(status) {
  document.getElementById('sb-not').className  ='status-btn'+(status==='not-started'?' sel-not':'');
  document.getElementById('sb-prog').className ='status-btn'+(status==='in-progress'?' sel-prog':'');
  document.getElementById('sb-done').className ='status-btn'+(status==='completed'?' sel-done':'');
}
function updatePct(val) {
  document.getElementById('vp-pct-val').textContent=val+'%';
  if(!state.currentPlaylist) return;
  state.videoData[state.currentPlaylist.id]=state.videoData[state.currentPlaylist.id]||{};
  state.videoData[state.currentPlaylist.id].pct=parseInt(val);
  localStorage.setItem('cil_video',JSON.stringify(state.videoData));
}
function saveVNotes() {
  if(!state.currentPlaylist) return;
  state.videoData[state.currentPlaylist.id]=state.videoData[state.currentPlaylist.id]||{};
  state.videoData[state.currentPlaylist.id].notes=document.getElementById('vp-notes').value;
  localStorage.setItem('cil_video',JSON.stringify(state.videoData));
  showToast('Notes saved','ok');
}

// ── FORMULA SHEET ─────────────────────────────────────────────────────────────
function renderFormulas(subjectId) {
  const subj = formulaData.find(f=>f.id===subjectId);
  document.querySelectorAll('.formula-tab').forEach(t=>t.classList.toggle('active',t.dataset.fsubj===subjectId));
  const el = document.getElementById('formula-content');
  if (!el || !subj) return;
  el.innerHTML = subj.groups.map(g=>`
  <div class="formula-group">
    <div class="fg-title" style="border-left-color:${subj.color}">${g.title}</div>
    <div class="formula-cards">
      ${g.items.map(item=>`
      <div class="formula-card">
        <div class="fc-name">${item.name}</div>
        <div class="fc-formula">${item.formula}</div>
        ${item.tip?`<div class="fc-tip">${item.tip}</div>`:''}
      </div>`).join('')}
    </div>
  </div>`).join('');
}

// ── EXAM INFO ─────────────────────────────────────────────────────────────────
function renderExamInfo() {
  renderPattern();
  renderImportantTopics();
  renderStrategy();
}
function renderPattern() {
  const el = document.getElementById('exam-pattern');
  if (!el) return;
  el.innerHTML = examInfoData.pattern.map(paper=>`
  <div class="exam-paper-card">
    <div class="epc-header">
      <h3>${paper.paper}</h3>
      <div class="epc-badges">
        <span class="epc-badge">${paper.questions} Qs</span>
        <span class="epc-badge" style="background:var(--primary-muted);color:var(--primary)">${paper.marks} Marks</span>
        <span class="epc-badge" style="background:var(--warning-muted);color:var(--warning)">${paper.time}</span>
      </div>
    </div>
    <div class="epc-sections">
      ${paper.sections.map(s=>`
      <div class="epc-section">
        <div class="epc-sec-top">
          <span class="epc-sec-name">${s.name}</span>
          <span class="epc-sec-qs">${s.qs} Qs</span>
        </div>
        <div class="epc-sec-topics">${s.topics}</div>
      </div>`).join('')}
    </div>
  </div>`).join('');

  // Marking scheme
  const ms = document.getElementById('marking-scheme');
  if (ms) ms.innerHTML = examInfoData.marking.map(m=>`
  <div class="ms-row">
    <span>${m.rule}</span>
    <span class="ms-val">${m.marks}</span>
  </div>`).join('');
}
function renderImportantTopics() {
  const el = document.getElementById('important-topics');
  if (!el) return;
  el.innerHTML = examInfoData.importantTopics.map((s,idx)=>{
    const colors=['#8b5cf6','#10b981','#3b82f6','#f97316','#ef4444','#14b8a6'];
    const c = colors[idx % colors.length];
    return `
    <div class="it-card">
      <div class="it-subject" style="color:${c};border-left-color:${c}">${s.subject}</div>
      <ul class="it-list">${s.topics.map(t=>`<li>${t}</li>`).join('')}</ul>
    </div>`;
  }).join('');
}
function renderStrategy() {
  const el = document.getElementById('exam-strategy');
  if (!el) return;
  el.innerHTML = examInfoData.strategy.map((s,i)=>`
  <div class="strat-card">
    <div class="strat-num">${i+1}</div>
    <div>
      <div class="strat-tip">${s.tip}</div>
      <div class="strat-detail">${s.detail}</div>
    </div>
  </div>`).join('');
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function renderQuickChips() {
  const el = document.getElementById('quick-chips');
  if (!el) return;
  el.innerHTML = quickTopics.map((t,i) => {
    window['_qt'+i] = t;
    return `<span class="quick-chip" onclick="doSearch(window['_qt${i}'])">${t}</span>`;
  }).join('');
}
function doSearch(query) {
  query = query || document.getElementById('main-search-q')?.value?.trim();
  if (!query) return;
  const inp = document.getElementById('main-search-q');
  if (inp) inp.value = query;
  const q = query;
  const results = [
    { label:'Google Search',     desc:'Study notes, PDFs, and MCQs',           bg:'var(--primary-muted)', c:'var(--primary)',  icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',  fn(){searchGoogle(q+' Coal India MCQ')} },
    { label:'YouTube Videos',    desc:'Video lectures on this topic',           bg:'#fef2f2',              c:'var(--danger)',   icon:'<path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>',fn(){openYT(q)} },
    { label:'Neso Academy',      desc:'Best beginner-friendly lectures',        bg:'var(--success-muted)', c:'var(--success)',  icon:'<polygon points="5 3 19 12 5 21 5 3"/>',fn(){openYT('neso academy '+q)} },
    { label:'Gate Smashers',     desc:'Exam-focused MCQ tricks',                bg:'var(--purple-muted)',  c:'var(--purple)',   icon:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',fn(){openYT('gate smashers '+q)} },
    { label:'Coal India MCQ',    desc:'MCQs for Coal India PSU exam',           bg:'var(--warning-muted)', c:'var(--warning)',  icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',fn(){searchGoogle('Coal India MT E&T MCQ '+q)} },
    { label:'Previous Year Qs',  desc:'Past paper questions on this topic',    bg:'var(--teal-muted)',    c:'var(--teal)',     icon:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',fn(){searchGoogle('GATE PSU previous year '+q)} },
  ];
  const resultsEl = document.getElementById('search-results');
  if (!resultsEl) return;
  resultsEl.innerHTML = `
  <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px">Results for: <strong style="color:var(--text)">"${query}"</strong></div>
  <div class="search-results-grid">
    ${results.map((r,i)=>`
    <div class="sr-card" onclick="_sr[${i}].fn()">
      <div class="sr-icon" style="background:${r.bg}">
        <svg viewBox="0 0 24 24" fill="none" stroke="${r.c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${r.icon}</svg>
      </div>
      <div class="sr-title">${r.label}</div>
      <div class="sr-desc">${r.desc}</div>
      <button class="btn btn-ghost btn-sm">Open &rarr;</button>
    </div>`).join('')}
  </div>`;
  window._sr = results;
}

// ── MISTAKE BOOK ──────────────────────────────────────────────────────────────
function addMistake() {
  const topic=document.getElementById('mb-topic').value.trim();
  const question=document.getElementById('mb-question').value.trim();
  if(!topic||!question){showToast('Fill in Topic and Question fields','err');return;}
  state.mistakes.unshift({ id:Date.now(), topic, question,
    subject:document.getElementById('mb-subj').value,
    formula:document.getElementById('mb-formula').value.trim(),
    why:document.getElementById('mb-why').value.trim(),
    date:new Date().toLocaleDateString() });
  localStorage.setItem('cil_mistakes',JSON.stringify(state.mistakes));
  ['mb-topic','mb-question','mb-formula','mb-why'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  renderMistakeBook('all'); renderStats();
  showToast('Saved to Mistake Book','ok');
}
function deleteMistake(id) {
  state.mistakes=state.mistakes.filter(m=>m.id!==id);
  localStorage.setItem('cil_mistakes',JSON.stringify(state.mistakes));
  const f=document.querySelector('.mb-filter.active')?.dataset.f||'all';
  renderMistakeBook(f); renderStats();
  showToast('Entry deleted','ok');
}
function filterMB(f) {
  document.querySelectorAll('.mb-filter').forEach(b=>b.classList.toggle('active',b.dataset.f===f));
  renderMistakeBook(f);
}
function renderMistakeBook(filter) {
  const list=filter==='all'?state.mistakes:state.mistakes.filter(m=>m.subject===filter);
  const cnt=document.getElementById('mb-count');
  if(cnt) cnt.textContent=list.length+' entries';
  const el=document.getElementById('mb-list');
  if(!el) return;
  if(!list.length){
    el.innerHTML=`<div class="empty-state">
      <div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg></div>
      <h4>No mistakes yet</h4><p>Take a mock test and add wrong answers here for review</p>
    </div>`;
    return;
  }
  el.innerHTML=list.map(m=>`
  <div class="mb-item">
    <div class="mb-item-top">
      <span class="subj-chip chip-${m.subject}">${m.subject.toUpperCase()}</span>
      <span style="font-size:12px;color:var(--text-muted)">${m.topic}</span>
      <span class="mb-item-date">${m.date}</span>
      <button class="mb-item-del" onclick="deleteMistake(${m.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </button>
    </div>
    <div class="mb-question">${m.question}</div>
    ${m.formula?`<div class="mb-formula">${m.formula}</div>`:''}
    ${m.why?`<div class="mb-note">${m.why}</div>`:''}
  </div>`).join('');
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function searchGoogle(q){window.open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank');}
function openYT(q){window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(q),'_blank');}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function showToast(msg,type='ok'){
  document.querySelector('.toast')?.remove();
  const t=document.createElement('div');t.className='toast '+type;
  const icon=type==='ok'?'<svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  t.innerHTML=icon+msg;document.body.appendChild(t);
  setTimeout(()=>t.style.opacity='0',2700);setTimeout(()=>t.remove(),3000);
}
