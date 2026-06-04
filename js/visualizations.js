'use strict';
// ════════════════════════════════════════════════════════════
// CIL Cracker — Formula Visualizations
// Canvas-based animations for all major formulas
// ════════════════════════════════════════════════════════════

const _vf = {}; // active animation frame registry

function stopViz(id) { if (_vf[id]) { cancelAnimationFrame(_vf[id]); delete _vf[id]; } }
function stopAllViz() { Object.keys(_vf).forEach(stopViz); }

function _setup(canvas) {
  const r = window.devicePixelRatio || 1;
  const w = canvas.clientWidth  || 380;
  const h = canvas.clientHeight || 200;
  canvas.width  = w * r;
  canvas.height = h * r;
  const ctx = canvas.getContext('2d');
  ctx.scale(r, r);
  return { ctx, w, h };
}

function _C() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    bg:     dark ? '#1e293b' : '#f8fafc',
    card:   dark ? '#0f172a' : '#ffffff',
    text:   dark ? '#e2e8f0' : '#1e293b',
    muted:  dark ? '#94a3b8' : '#64748b',
    border: dark ? '#475569' : '#cbd5e1',
    grid:   dark ? '#2d3f54' : '#f1f5f9',
    primary:'#3b82f6', success:'#10b981', danger:'#ef4444',
    warning:'#f59e0b', purple:'#8b5cf6', orange:'#f97316', teal:'#14b8a6',
  };
}

function _T(ctx, str, x, y, {sz=12,fw='normal',col='#333',al='left',bl='middle',ff="'Segoe UI',sans-serif"}={}) {
  ctx.save();
  ctx.font=`${fw} ${sz}px ${ff}`; ctx.fillStyle=col; ctx.textAlign=al; ctx.textBaseline=bl;
  ctx.fillText(str,x,y); ctx.restore();
}

function _arrow(ctx,x1,y1,x2,y2,col='#666',lw=1.5) {
  const a=Math.atan2(y2-y1,x2-x1), hl=7;
  ctx.save(); ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=lw;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-hl*Math.cos(a-Math.PI/6),y2-hl*Math.sin(a-Math.PI/6));
  ctx.lineTo(x2-hl*Math.cos(a+Math.PI/6),y2-hl*Math.sin(a+Math.PI/6));
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function _axes(ctx,ox,oy,xlen,ylen,c,lx='',ly='') {
  _arrow(ctx,ox,oy,ox+xlen,oy,c.muted);
  _arrow(ctx,ox,oy,ox,oy-ylen,c.muted);
  if(lx) _T(ctx,lx,ox+xlen+6,oy,{sz:11,col:c.muted});
  if(ly) _T(ctx,ly,ox,oy-ylen-10,{sz:11,col:c.muted,al:'center'});
}

// ══════════════════════════════════════════════════════════
// 1. LOGIC GATES — Interactive
// ══════════════════════════════════════════════════════════
function vizLogicGates(canvas) {
  stopViz('lg');
  const {ctx,w,h} = _setup(canvas);
  let A=0, B=0;

  function gate(type,a,b){ return type==='AND'?a&b:type==='OR'?a|b:type==='NAND'?((a&b)?0:1):type==='NOR'?((a|b)?0:1):type==='XOR'?a^b:((a^b)?0:1); }

  const gates = [
    {type:'AND', x:90, y:55,  col:'#8b5cf6'},
    {type:'OR',  x:250,y:55,  col:'#3b82f6'},
    {type:'NAND',x:90, y:140, col:'#ef4444'},
    {type:'NOR', x:250,y:140, col:'#f97316'},
    {type:'XOR', x:170,y:210, col:'#10b981'},
  ];

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Click A or B to toggle — watch all gates update',w/2,14,{sz:11,col:c.muted,al:'center'});

    // Input toggle buttons
    [[A,'A','#8b5cf6',48],[B,'B','#3b82f6',120]].forEach(([val,lbl,col,cy])=>{
      ctx.fillStyle=val?col:c.border; ctx.strokeStyle=val?(col+'bb'):c.muted; ctx.lineWidth=2;
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(8,cy,36,36,6):ctx.rect(8,cy,36,36); ctx.fill(); ctx.stroke();
      _T(ctx,lbl,26,cy+12,{sz:14,fw:'700',col:val?'white':c.text,al:'center'});
      _T(ctx,val?'1':'0',26,cy+26,{sz:11,col:val?(col):c.muted,al:'center'});
    });

    gates.forEach(({type,x,y,col})=>{
      const out=gate(type,A,B);
      const gw=58, gh=36;
      ctx.fillStyle=out?(col+'25'):c.card; ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(x,y-gh/2,gw,gh,8); else ctx.rect(x,y-gh/2,gw,gh);
      ctx.fill(); ctx.stroke();

      // Input wires
      ctx.strokeStyle=A?'#8b5cf6':c.border; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x-14,y-9); ctx.lineTo(x,y-9); ctx.stroke();
      ctx.strokeStyle=B?'#3b82f6':c.border;
      ctx.beginPath(); ctx.moveTo(x-14,y+9); ctx.lineTo(x,y+9); ctx.stroke();

      // Output wire
      ctx.strokeStyle=out?col:c.border; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x+gw,y); ctx.lineTo(x+gw+18,y); ctx.stroke();

      // Output bubble (NAND/NOR)
      if(type==='NAND'||type==='NOR'){
        ctx.strokeStyle=col; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(x+gw+5,y,4,0,Math.PI*2); ctx.stroke();
      }

      // Gate label
      _T(ctx,type,x+gw/2,y,{sz:12,fw:'700',col:out?col:c.text,al:'center'});

      // Output value
      _T(ctx,out?'1':'0',x+gw+26,y,{sz:14,fw:'700',col:out?col:c.muted,al:'left'});

      // Input dots
      ctx.fillStyle=A?'#8b5cf6':c.muted; ctx.beginPath(); ctx.arc(x-16,y-9,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=B?'#3b82f6':c.muted; ctx.beginPath(); ctx.arc(x-16,y+9,3.5,0,Math.PI*2); ctx.fill();
    });

    _T(ctx,"De Morgan: (A·B)' = A'+B'   |   (A+B)' = A'·B'",w/2,h-8,{sz:10,col:c.muted,al:'center'});
  }

  draw();
  canvas.style.cursor='pointer';
  canvas.onclick = function(e) {
    const r=canvas.getBoundingClientRect(), sx=w/canvas.clientWidth;
    const cx=(e.clientX-r.left)*sx, cy=(e.clientY-r.top)*sx;
    if(cx>=8&&cx<=44&&cy>=48&&cy<=84)  { A^=1; draw(); }
    if(cx>=8&&cx<=44&&cy>=120&&cy<=156){ B^=1; draw(); }
  };
}

// ══════════════════════════════════════════════════════════
// 2. K-MAP — Animated groupings
// ══════════════════════════════════════════════════════════
function vizKMap(canvas) {
  stopViz('km');
  const {ctx,w,h} = _setup(canvas);
  const cells=[1,0,1,1, 0,0,1,1, 0,0,1,1, 1,0,1,1]; // 4-var k-map
  let phase=0;

  const groups=[
    {cells:[2,3,6,7,10,11,14,15], col:'#3b82f6', label:'CD (8-cell quad)'},
    {cells:[0,4,12],               col:'#10b981', label:'A\'C\'D (3-cell — not valid grouping, demo only)'},
    {cells:[2,3,10,11],            col:'#8b5cf6', label:'B\'D (4-cell)'},
  ];

  // Standard 4-var k-map layout
  const cols=['00','01','11','10'], rows=['00','01','11','10'];
  // Actual minterm positions in the 4×4 grid (Gray code order)
  // Row: AB, Col: CD
  const cellPos = [0,1,3,2, 4,5,7,6, 12,13,15,14, 8,9,11,10];

  function mterm(row,col){ return cellPos[row*4+col]; }

  const cw=38, ch=30;
  const ox=(w-4*cw-50)/2+40, oy=40;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'4-Variable K-Map — Animated Groupings',w/2,14,{sz:12,fw:'600',col:c.muted,al:'center'});

    // Header labels
    _T(ctx,'CD→',ox-36,oy-8,{sz:10,col:c.muted});
    _T(ctx,'AB↓',ox-36,oy+12,{sz:10,col:c.muted});
    cols.forEach((l,i)=>_T(ctx,l,ox+i*cw+cw/2,oy-8,{sz:10,col:c.muted,al:'center'}));
    rows.forEach((l,i)=>_T(ctx,l,ox-10,oy+i*ch+ch/2,{sz:10,col:c.muted,al:'right'}));

    // Draw cells
    for(let r=0;r<4;r++){
      for(let cc=0;cc<4;cc++){
        const mt=mterm(r,cc);
        const val=cells[mt];
        const x=ox+cc*cw, y=oy+r*ch;
        ctx.strokeStyle=c.border; ctx.lineWidth=1;
        ctx.fillStyle=val?(c.primary+'18'):c.bg;
        ctx.fillRect(x,y,cw,ch); ctx.strokeRect(x,y,cw,ch);
        _T(ctx,String(val),x+cw/2,y+ch/2,{sz:13,fw:'700',col:val?c.primary:c.muted,al:'center'});
        _T(ctx,String(mt),x+cw/2,y+4,{sz:7,col:c.muted,al:'center',bl:'top'});
      }
    }

    // Highlight active grouping with animation
    const gIdx = Math.floor(phase/80) % 3;
    const grp = groups[gIdx];
    const alpha = 0.15+0.1*Math.sin(phase*0.05);

    // Draw group overlay on matching cells
    for(let r=0;r<4;r++){
      for(let cc=0;cc<4;cc++){
        const mt=mterm(r,cc);
        if(cells[mt]&&grp.cells.includes(mt)){
          const x=ox+cc*cw, y=oy+r*ch;
          ctx.fillStyle=grp.col+(Math.floor(alpha*255).toString(16).padStart(2,'0'));
          ctx.fillRect(x+1,y+1,cw-2,ch-2);
          ctx.strokeStyle=grp.col; ctx.lineWidth=2.5;
          ctx.strokeRect(x+1,y+1,cw-2,ch-2);
        }
      }
    }

    const gNames=['Group 1: BC (4-cell)','Group 2: CD\' (4-cell)','Group 3: AB\' (4-cell)'];
    const gCols=[c.primary, c.success, c.purple];
    _T(ctx,'Active: '+gNames[gIdx],w/2,oy+4*ch+16,{sz:11,fw:'600',col:gCols[gIdx],al:'center'});
    _T(ctx,'SOP = BC + CD\' + AB\'',w/2,oy+4*ch+32,{sz:12,fw:'700',col:c.text,al:'center',ff:"'Courier New',monospace"});

    phase++;
    _vf['km'] = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 3. RC CHARGING CURVE — Network Theory
// ══════════════════════════════════════════════════════════
function vizRCCharging(canvas) {
  stopViz('rc');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  const ox=55, oy=h-35, xlen=w-ox-20, ylen=h-55;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'RC Charging: V(t) = V₀(1 − e^(−t/τ))',w/2,14,{sz:12,fw:'600',col:c.muted,al:'center'});

    _axes(ctx,ox,oy,xlen,ylen,c,'Time','Voltage');

    // Grid lines at τ, 2τ, 3τ, 4τ, 5τ
    for(let tau=1;tau<=5;tau++){
      const x=ox+tau*(xlen/5.5);
      ctx.setLineDash([4,4]);
      ctx.strokeStyle=c.grid; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x,oy); ctx.lineTo(x,oy-ylen); ctx.stroke();
      ctx.setLineDash([]);
      _T(ctx,`${tau}τ`,x,oy+14,{sz:10,col:c.muted,al:'center'});
    }

    // Full exponential curve
    ctx.strokeStyle=c.border; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const tt=i/200*5.5;
      const vv=1-Math.exp(-tt);
      const px=ox+i*(xlen/200);
      const py=oy-vv*ylen;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Animated dot on curve
    const tcur=Math.min(t*0.015, 5.5);
    const vcur=1-Math.exp(-tcur);
    const px=ox+tcur*(xlen/5.5);
    const py=oy-vcur*ylen;

    // Draw curve up to current point (colored)
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const tt=i/200*5.5;
      if(tt>tcur) break;
      const vv=1-Math.exp(-tt);
      const ppx=ox+i*(xlen/200);
      const ppy=oy-vv*ylen;
      i===0?ctx.moveTo(ppx,ppy):ctx.lineTo(ppx,ppy);
    }
    ctx.stroke();

    // Animated dot
    ctx.fillStyle=c.primary; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();

    // 63.2% marker line
    const tau1x=ox+xlen/5.5;
    const tau1y=oy-(1-Math.exp(-1))*ylen;
    ctx.strokeStyle=c.warning+'aa'; ctx.lineWidth=1; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(ox,tau1y); ctx.lineTo(tau1x,tau1y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tau1x,oy); ctx.lineTo(tau1x,tau1y); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'63.2%',ox-4,tau1y,{sz:10,fw:'600',col:c.warning,al:'right'});

    // V₀ = 100% line
    ctx.strokeStyle=c.success+'88'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(ox,oy-ylen); ctx.lineTo(ox+xlen,oy-ylen); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'V₀ (100%)',ox-4,oy-ylen,{sz:10,col:c.success,al:'right'});

    // Current voltage label near dot
    _T(ctx,`V = ${(vcur*100).toFixed(1)}%`,px+8,py-8,{sz:11,fw:'600',col:c.primary});

    // τ = RC annotation at bottom
    _T(ctx,'τ = RC  |  At t=τ: V = 63.2% of V₀  |  At t=5τ: V ≈ 99.3% (fully charged)',
       w/2,h-10,{sz:10,col:c.muted,al:'center'});

    if(t<370) { t++; _vf['rc']=requestAnimationFrame(draw); }
    else t=0;
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 4. RESONANCE — XL, XC, Z vs Frequency
// ══════════════════════════════════════════════════════════
function vizResonance(canvas) {
  stopViz('res');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  const ox=55, oy=h-35, xlen=w-ox-20, ylen=h-55;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Resonance: f₀ = 1/(2π√LC)  —  At f₀: XL=XC, Z is minimum',
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    _axes(ctx,ox,oy,xlen,ylen,c,'Frequency →','Impedance (Z)');

    const f0x=ox+xlen*0.5; // resonance at 50% of x-axis
    const pts=160;

    // XL = ωL — rising line
    ctx.strokeStyle=c.danger; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=pts;i++){
      const f=i/pts*2; // normalized freq 0..2
      const xl=f*ylen*0.8;
      const px=ox+i*(xlen/pts), py=oy-xl;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // XC = 1/(ωC) — falling hyperbola
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=2;i<=pts;i++){
      const f=i/pts*2;
      const xc=(1/f)*ylen*0.8;
      const px=ox+i*(xlen/pts), py=oy-Math.min(xc,ylen*1.1);
      i===2?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Z = √(R²+(XL-XC)²) — combined impedance (U-shape)
    ctx.strokeStyle=c.purple; ctx.lineWidth=3;
    ctx.beginPath();
    for(let i=1;i<=pts;i++){
      const f=Math.max(0.01,i/pts*2);
      const xl=f*0.8;
      const xc=1/(f)*0.8;
      const R=0.15;
      const z=Math.sqrt(R*R+Math.pow(xl-xc,2));
      const px=ox+i*(xlen/pts), py=oy-Math.min(z,1)*ylen;
      i===1?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // f₀ vertical line (animated pulse)
    const pulse=0.6+0.4*Math.sin(t*0.04);
    ctx.strokeStyle=c.warning; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.globalAlpha=pulse;
    ctx.beginPath(); ctx.moveTo(f0x,oy); ctx.lineTo(f0x,oy-ylen*0.15); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;

    // f₀ label
    _T(ctx,'f₀',f0x,oy+14,{sz:12,fw:'700',col:c.warning,al:'center'});
    _T(ctx,'Z_min',f0x+6,oy-ylen*0.13,{sz:10,fw:'600',col:c.warning});

    // Legends
    [[c.danger,'XL = ωL (↑ with f)'],[c.primary,'XC = 1/ωC (↓ with f)'],[c.purple,'Z = √(R²+(XL−XC)²)']].forEach(([col,lbl],i)=>{
      ctx.fillStyle=col;
      ctx.fillRect(ox,oy-ylen-30+i*14,20,3);
      _T(ctx,lbl,ox+25,oy-ylen-29+i*14,{sz:10,col:c.muted});
    });

    // Q factor annotation
    _T(ctx,'Q = f₀/BW = ωL/R',w-8,h-10,{sz:10,col:c.teal,al:'right'});

    t++;
    _vf['res']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 5. DIODE I-V CHARACTERISTIC — Analog
// ══════════════════════════════════════════════════════════
function vizDiodeIV(canvas) {
  stopViz('div');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  const ox=w*0.45, oy=h*0.55;
  const xlen=w*0.5, ylen=h*0.5;
  const xneg=w*0.38;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Diode I-V: I = I₀(e^(V/VT)−1), VT ≈ 26mV @ 300K',w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    // Axes
    _arrow(ctx,ox-xneg,oy,ox+xlen,oy,c.muted);
    _arrow(ctx,ox,oy+ylen*0.3,ox,oy-ylen,c.muted);
    _T(ctx,'V (Volts)',ox+xlen+6,oy,{sz:11,col:c.muted});
    _T(ctx,'I (mA)',ox,oy-ylen-10,{sz:11,col:c.muted,al:'center'});
    _T(ctx,'0',ox-10,oy,{sz:10,col:c.muted,al:'right'});

    // Threshold voltage label (0.7V)
    const vthX=ox+xlen*0.4;
    ctx.strokeStyle=c.warning+'88'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(vthX,oy); ctx.lineTo(vthX,oy-ylen*0.9); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'0.7V',vthX,oy+14,{sz:10,fw:'600',col:c.warning,al:'center'});

    // Reverse saturation current (tiny I₀ line)
    ctx.strokeStyle=c.danger; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(ox-xneg+2,oy+ylen*0.08); ctx.lineTo(ox,oy+ylen*0.08); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'−I₀',ox-xneg+4,oy+ylen*0.08,{sz:9,col:c.danger});

    // Breakdown knee
    const brkX=ox-xneg+xneg*0.25;
    ctx.strokeStyle=c.danger; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(brkX+2,oy+ylen*0.08); ctx.lineTo(brkX,oy+ylen*0.08); ctx.lineTo(brkX,oy+ylen*0.28); ctx.stroke();
    _T(ctx,'Breakdown\n(Zener)',brkX-4,oy+ylen*0.22,{sz:9,col:c.danger,al:'right'});

    // Forward bias exponential curve (animated growth)
    const progress=Math.min(t/100,1);
    ctx.strokeStyle=c.success; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=100;i++){
      const frac=i/100;
      if(frac>progress) break;
      const vNorm=frac; // 0..1 maps to 0..Vmax
      const iNorm=Math.min(Math.exp(vNorm*6.5-4.5)-Math.exp(-4.5),1);
      const px=ox+vNorm*xlen;
      const py=oy-iNorm*ylen*0.9;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Labels for regions
    _T(ctx,'Reverse Bias\n(OFF)',ox-xneg*0.5,oy-20,{sz:10,col:c.danger,al:'center'});
    _T(ctx,'Forward Bias\n(ON)',ox+vthX*0.3+10,oy-ylen*0.5,{sz:10,col:c.success});

    // Threshold dot
    if(progress>0.4){
      ctx.fillStyle=c.warning; ctx.beginPath(); ctx.arc(vthX,oy,5,0,Math.PI*2); ctx.fill();
      _T(ctx,'Cut-in\nVoltage',vthX+8,oy-18,{sz:9,fw:'600',col:c.warning});
    }

    _T(ctx,'VT = kT/q = 26mV at room temp',w/2,h-10,{sz:10,col:c.muted,al:'center'});

    if(t<180) t++;
    _vf['div']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 6. RECTIFIER WAVEFORMS — HWR vs FWR
// ══════════════════════════════════════════════════════════
function vizRectifier(canvas) {
  stopViz('rect');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Rectifier Waveforms: HWR (γ=1.21, η=40.6%) vs FWR (γ=0.48, η=81.2%)',
       w/2,14,{sz:10,fw:'600',col:c.muted,al:'center'});

    const rows=[
      {label:'Input AC',  oy:50,  fn:(x)=>Math.sin(x)},
      {label:'HWR Out',  oy:115,  fn:(x)=>Math.max(0,Math.sin(x))},
      {label:'FWR Out',  oy:180,  fn:(x)=>Math.abs(Math.sin(x))},
    ];

    const cycles=2.5, ox=60, xlen=w-ox-20, amp=28;

    rows.forEach(({label,oy,fn})=>{
      // Zero line
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,col:c.muted,al:'right'});

      // Waveform
      const pts=200;
      ctx.strokeStyle=label==='Input AC'?c.muted:(label==='HWR Out'?c.warning:c.success);
      ctx.lineWidth=2.5;
      ctx.beginPath();
      for(let i=0;i<=pts;i++){
        const phase=(i/pts)*cycles*2*Math.PI + t*0.025;
        const y=fn(phase)*amp;
        const px=ox+i*(xlen/pts), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();

      // Fill under the curve
      ctx.save();
      ctx.globalAlpha=0.12;
      ctx.fillStyle=label==='Input AC'?c.muted:(label==='HWR Out'?c.warning:c.success);
      ctx.beginPath();
      for(let i=0;i<=pts;i++){
        const phase=(i/pts)*cycles*2*Math.PI + t*0.025;
        const y=fn(phase)*amp;
        const px=ox+i*(xlen/pts), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.lineTo(ox+xlen,oy); ctx.lineTo(ox,oy); ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // PIV labels
    _T(ctx,'PIV (Bridge) = Vm',w-12,115,{sz:10,col:c.warning,al:'right'});
    _T(ctx,'PIV (Center Tap) = 2Vm',w-12,180,{sz:10,col:c.success,al:'right'});

    t++;
    _vf['rect']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7. OP-AMP — Inverting & Non-Inverting Gain
// ══════════════════════════════════════════════════════════
function vizOpAmp(canvas) {
  stopViz('oa');
  const {ctx,w,h} = _setup(canvas);
  let t=0, rf=100, rin=10; // kΩ

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const invGain=-(rf/rin).toFixed(1);
    const nonInvGain=(1+rf/rin).toFixed(1);
    _T(ctx,`Op-Amp: Av(inv) = −Rf/Rin = ${invGain}  |  Av(non-inv) = 1+Rf/Rin = ${nonInvGain}`,
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    // Draw op-amp triangle
    const cx=w/2, cy=h/2-10;
    ctx.strokeStyle=c.teal; ctx.lineWidth=2; ctx.fillStyle=c.teal+'15';
    ctx.beginPath();
    ctx.moveTo(cx-35,cy-32); ctx.lineTo(cx-35,cy+32); ctx.lineTo(cx+35,cy); ctx.closePath();
    ctx.fill(); ctx.stroke();

    // − input
    ctx.strokeStyle=c.danger; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-80,cy-16); ctx.lineTo(cx-35,cy-16); ctx.stroke();
    _T(ctx,'−',cx-32,cy-16,{sz:14,fw:'700',col:c.danger});
    _T(ctx,'V−',cx-90,cy-16,{sz:11,fw:'600',col:c.danger,al:'right'});

    // + input
    ctx.strokeStyle=c.success; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-80,cy+16); ctx.lineTo(cx-35,cy+16); ctx.stroke();
    _T(ctx,'+',cx-32,cy+20,{sz:14,fw:'700',col:c.success});
    _T(ctx,'V+',cx-90,cy+16,{sz:11,fw:'600',col:c.success,al:'right'});

    // Output
    ctx.strokeStyle=c.primary; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx+35,cy); ctx.lineTo(cx+80,cy); ctx.stroke();
    _T(ctx,'Vout',cx+82,cy,{sz:11,fw:'600',col:c.primary});

    // Rf feedback (inverting)
    ctx.strokeStyle=c.warning; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
    ctx.beginPath();
    ctx.moveTo(cx+75,cy); ctx.lineTo(cx+75,cy-55); ctx.lineTo(cx-75,cy-55);
    ctx.lineTo(cx-75,cy-16);
    ctx.stroke(); ctx.setLineDash([]);
    _T(ctx,'Rf',cx+2,cy-58,{sz:11,fw:'700',col:c.warning,al:'center'});

    // Rin
    ctx.strokeStyle=c.purple; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-120,cy-16); ctx.lineTo(cx-80,cy-16); ctx.stroke();
    _T(ctx,'Rin',cx-100,cy-26,{sz:10,fw:'600',col:c.purple,al:'center'});

    // Virtual ground label
    ctx.fillStyle=c.warning+'33'; ctx.strokeStyle=c.warning; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(cx-75,cy-28,30,18,4):ctx.rect(cx-75,cy-28,30,18);
    ctx.fill(); ctx.stroke();
    _T(ctx,'≈0V',cx-60,cy-18,{sz:9,fw:'600',col:c.warning,al:'center'});

    // Signal comparison - animated sine
    const sy=h-45, sx=20, slen=w-40;
    const inputAmp=20, outputAmp=Math.min(Math.abs(invGain)*inputAmp, 35);
    for(let i=0;i<=200;i++){
      const angle=(i/200)*2*Math.PI*2+t*0.04;
      const inp=Math.sin(angle)*inputAmp;
      const outp=Math.sin(angle+Math.PI)*outputAmp; // inverted
      if(i===0){ ctx.beginPath(); ctx.moveTo(sx+i*(slen/200),sy-inp); }
      else{ ctx.lineTo(sx+i*(slen/200),sy-inp); }
    }
    ctx.strokeStyle=c.muted; ctx.lineWidth=1.5; ctx.stroke();

    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const angle=(i/200)*2*Math.PI*2+t*0.04;
      const outp=Math.sin(angle+Math.PI)*outputAmp;
      if(i===0) ctx.moveTo(sx+i*(slen/200),sy-outp);
      else ctx.lineTo(sx+i*(slen/200),sy-outp);
    }
    ctx.strokeStyle=c.primary; ctx.lineWidth=2; ctx.stroke();

    _T(ctx,'Vin',sx,sy+14,{sz:9,col:c.muted});
    _T(ctx,'Vout (inverted)',sx+50,sy+14,{sz:9,col:c.primary});
    _T(ctx,'CMRR = 20·log(Ad/Ac)   |   Slew Rate = ΔVo/Δt (V/μs)',w/2,h-8,{sz:10,col:c.muted,al:'center'});

    t++;
    _vf['oa']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 8. FOURIER SERIES — Harmonic Buildup
// ══════════════════════════════════════════════════════════
function vizFourier(canvas) {
  stopViz('fs');
  const {ctx,w,h} = _setup(canvas);
  let t=0, harmonics=5;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,`Fourier Series: Square wave from ${harmonics} harmonic${harmonics>1?'s':''}`,
       w/2,14,{sz:12,fw:'600',col:c.muted,al:'center'});

    const oy=h/2+10, ox=20, xlen=w-40, amp=58;

    // Axes
    ctx.strokeStyle=c.border; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();

    // Individual harmonics (faint)
    for(let n=1;n<=harmonics;n+=2){
      const hcol = n===1?c.primary:n===3?c.danger:n===5?c.warning:n===7?c.purple:c.teal;
      ctx.strokeStyle=hcol+'55'; ctx.lineWidth=1;
      ctx.beginPath();
      for(let i=0;i<=200;i++){
        const x=(i/200)*2*Math.PI*2;
        const y=(4/Math.PI)*(1/n)*Math.sin(n*(x+t*0.03))*amp;
        const px=ox+i*(xlen/200), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
    }

    // Summed waveform (bright)
    ctx.strokeStyle=c.success; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=300;i++){
      const x=(i/300)*2*Math.PI*2;
      let y=0;
      for(let n=1;n<=harmonics;n+=2){
        y+=(4/Math.PI)*(1/n)*Math.sin(n*(x+t*0.03));
      }
      const px=ox+i*(xlen/300), py=oy-y*amp;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Ideal square wave
    ctx.strokeStyle=c.muted; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath();
    const half=Math.PI*2;
    [[0,1],[half,-1],[half*2,1]].forEach(([start,sign],si)=>{
      const p1=ox+(start/(4*Math.PI))*xlen;
      const p2=ox+((start+Math.PI*2)/(4*Math.PI))*xlen;
      if(si===0) ctx.moveTo(p1,oy-sign*amp);
      else ctx.moveTo(p1,oy-sign*amp);
      ctx.lineTo(Math.min(p2,ox+xlen),oy-sign*amp);
    });
    ctx.stroke(); ctx.setLineDash([]);

    // Harmonic selector buttons (in footer)
    [1,3,5,7,9].forEach((hn,i)=>{
      const bx=w/2-80+i*40, by=h-26;
      const active=hn<=harmonics;
      const col=[c.primary,c.danger,c.warning,c.purple,c.teal][i];
      ctx.fillStyle=active?col:c.border; ctx.strokeStyle=col; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,30,18,4):ctx.rect(bx,by,30,18);
      ctx.fill(); ctx.stroke();
      _T(ctx,`n=${hn}`,bx+15,by+9,{sz:9,fw:'600',col:active?'white':c.muted,al:'center'});
    });
    _T(ctx,'Click:',w/2-98,h-17,{sz:9,col:c.muted});

    const step=Math.floor(t/100)%5;
    harmonics=1+step*2;

    t++;
    _vf['fs']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 9. NYQUIST SAMPLING — Aliasing Demo
// ══════════════════════════════════════════════════════════
function vizSampling(canvas) {
  stopViz('smp');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Nyquist Sampling: fs ≥ 2·fmax — below Nyquist rate causes ALIASING',
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const rows=[
      {label:'Oversampled\n(fs >> 2fm)',  oy:60,  fs:12, fm:2, col:c.success},
      {label:'Nyquist rate\n(fs = 2fm)',   oy:130, fs:4,  fm:2, col:c.warning},
      {label:'Aliased\n(fs < 2fm)',        oy:200, fs:2,  fm:2, col:c.danger},
    ];

    const ox=20, xlen=w-40;

    rows.forEach(({label,oy,fs,fm,col})=>{
      const amp=24;
      // Original signal
      ctx.strokeStyle=col+'66'; ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let i=0;i<=200;i++){
        const x=i/200*8*Math.PI;
        const y=Math.sin(fm*x+t*0.02)*amp;
        const px=ox+i*(xlen/200), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();

      // Sample points
      const samples=[];
      const period=200/fs;
      for(let s=0;s*period<=200;s++){
        const i=s*period;
        const x=i/200*8*Math.PI;
        const y=Math.sin(fm*x+t*0.02)*amp;
        samples.push({px:ox+i*(xlen/200), py:oy-y});
      }
      samples.forEach(({px,py})=>{
        ctx.fillStyle=col; ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=col+'66'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(px,oy); ctx.lineTo(px,py); ctx.stroke();
      });

      // Reconstructed signal through sample points
      if(samples.length>2){
        ctx.strokeStyle=col; ctx.lineWidth=2;
        ctx.beginPath();
        // Simple linear interpolation for reconstruction
        samples.forEach(({px,py},i)=>{
          if(i===0) ctx.moveTo(px,py); else {
            const prev=samples[i-1];
            ctx.lineTo(px,py);
          }
        });
        ctx.stroke();
      }

      _T(ctx,label,ox-8,oy,{sz:9,col,al:'right'});
      _T(ctx,`fs=${fs}·fm`,xlen+ox-2,oy,{sz:9,fw:'600',col,al:'right'});
    });

    _T(ctx,'Only the Nyquist/oversampled cases can reconstruct the original signal correctly',
       w/2,h-8,{sz:10,col:c.muted,al:'center'});
    t++;
    _vf['smp']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10. STEP RESPONSE — 2nd Order System (interactive damping)
// ══════════════════════════════════════════════════════════
function vizStepResponse(canvas) {
  stopViz('sr');
  const {ctx,w,h} = _setup(canvas);
  let t=0, xi=0.5; // damping ratio

  function stepResp(tau, xi) {
    if(xi>=1) return 1-Math.exp(-xi*tau)*(Math.cosh(tau*Math.sqrt(xi*xi-1))+xi/Math.sqrt(xi*xi-1)*Math.sinh(tau*Math.sqrt(xi*xi-1)));
    const wd=Math.sqrt(1-xi*xi);
    return 1-Math.exp(-xi*tau)*(Math.cos(wd*tau)+xi/wd*Math.sin(wd*tau));
  }

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const label=xi<0.5?'Underdamped':xi===1?'Critically Damped':'Overdamped';
    _T(ctx,`Step Response — ξ=${xi.toFixed(2)} (${label})  |  ts ≈ 4/(ξωn)`,
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const ox=55, oy=h-35, xlen=w-ox-25, ylen=h-60;
    _axes(ctx,ox,oy,xlen,ylen,c,'Time (t)','c(t)');

    // y=1 (steady state) line
    ctx.strokeStyle=c.success+'66'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(ox,oy-ylen*0.8); ctx.lineTo(ox+xlen,oy-ylen*0.8); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'1.0',ox-4,oy-ylen*0.8,{sz:10,col:c.success,al:'right'});

    // Different damping curves (faint)
    [[0.2,'underdamped'],[1.0,'critical'],[2.0,'overdamped']].forEach(([xiFaint,lbl])=>{
      const col=xiFaint<1?c.orange:xiFaint===1?c.teal:c.purple;
      ctx.strokeStyle=col+'33'; ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let i=0;i<=200;i++){
        const tau=i/200*10;
        const y=stepResp(tau,xiFaint);
        const px=ox+i*(xlen/200), py=oy-Math.min(Math.max(y,0),1.5)*ylen*0.8;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
    });

    // Current curve
    const curCol=xi<0.5?c.danger:xi<0.99?c.warning:xi===1?c.teal:c.primary;
    ctx.strokeStyle=curCol; ctx.lineWidth=3;
    ctx.beginPath();
    let maxY=0, maxTau=0;
    for(let i=0;i<=200;i++){
      const tau=i/200*10;
      const y=stepResp(tau,xi);
      if(y>maxY&&i>5){ maxY=y; maxTau=tau; }
      const px=ox+i*(xlen/200), py=oy-Math.min(Math.max(y,0),1.5)*ylen*0.8;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Overshoot marker
    if(xi<1&&maxY>1.01){
      const mpx=ox+maxTau*(xlen/10);
      const mpy=oy-Math.min(maxY,1.5)*ylen*0.8;
      ctx.strokeStyle=c.danger+'aa'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(mpx,oy-ylen*0.8); ctx.lineTo(mpx,mpy); ctx.stroke();
      ctx.setLineDash([]);
      _T(ctx,`Mp≈${((maxY-1)*100).toFixed(1)}%`,mpx+4,mpy-4,{sz:9,fw:'600',col:c.danger});
    }

    // Settling time marker
    const tsNorm=4/(xi);
    if(tsNorm<10){
      const tspx=ox+tsNorm*(xlen/10);
      ctx.strokeStyle=c.success+'aa'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(tspx,oy); ctx.lineTo(tspx,oy-ylen*0.85); ctx.stroke();
      ctx.setLineDash([]);
      _T(ctx,'ts',tspx,oy+12,{sz:10,fw:'600',col:c.success,al:'center'});
    }

    // Legends
    [[c.orange+'55','ξ=0.2 (underdamped)'],[c.teal+'55','ξ=1.0 (critical)'],[c.purple+'55','ξ=2.0 (overdamped)']].forEach(([col,lbl],i)=>{
      ctx.fillStyle=col; ctx.fillRect(ox,oy-ylen-35+i*14,18,3);
      _T(ctx,lbl,ox+22,oy-ylen-34+i*14,{sz:9,col:c.muted});
    });

    _T(ctx,`ξ=${xi.toFixed(2)}`,ox,h-10,{sz:10,fw:'700',col:curCol});
    _T(ctx,'Mp = e^(−πξ/√(1−ξ²)) × 100%',w/2,h-10,{sz:10,col:c.muted,al:'center'});

    xi += 0.005;
    if(xi>2.2) xi=0.1;
    t++;
    _vf['sr']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 11. AM MODULATION — Carrier + Message → AM Signal
// ══════════════════════════════════════════════════════════
function vizAMModulation(canvas) {
  stopViz('am');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const m=0.5+0.5*Math.sin(t*0.015); // modulation index 0..1
    _T(ctx,`AM Modulation: m = Am/Ac = ${m.toFixed(2)}  |  BW = 2fm  |  Pt = Pc(1+m²/2)`,
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const rows=[
      {label:'Message m(t)', oy:62,  fn:(x)=>Math.sin(x)*28,        col:c.success},
      {label:'Carrier c(t)', oy:130, fn:(x)=>Math.sin(x*8)*28,      col:c.primary},
      {label:'AM Signal',    oy:198, fn:(x)=>(1+m*Math.sin(x))*Math.sin(x*8)*24, col:c.orange},
    ];

    const ox=80, xlen=w-ox-15;
    rows.forEach(({label,oy,fn,col})=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,col,al:'right',fw:'600'});

      ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath();
      for(let i=0;i<=250;i++){
        const x=(i/250)*4*Math.PI+t*0.02;
        const y=fn(x);
        const px=ox+i*(xlen/250), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();

      // Envelope for AM signal
      if(label==='AM Signal'){
        ctx.strokeStyle=c.warning; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
        [[1],[-1]].forEach(([sign])=>{
          ctx.beginPath();
          for(let i=0;i<=250;i++){
            const x=(i/250)*4*Math.PI+t*0.02;
            const env=(1+m*Math.sin(x))*24*sign;
            const px=ox+i*(xlen/250), py=oy-env;
            i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);
        _T(ctx,'Envelope = Ac(1+m·m(t))',ox+xlen-4,oy-30,{sz:9,col:c.warning,al:'right'});
      }
    });

    // Efficiency
    const eff=((m*m/2)/(1+m*m/2)*100).toFixed(1);
    _T(ctx,`At m=${m.toFixed(2)}: η = ${eff}%  |  At m=1: η = 33.3%`,w/2,h-8,{sz:10,col:c.muted,al:'center'});
    t++;
    _vf['am']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 12. FM MODULATION — Frequency Deviation
// ══════════════════════════════════════════════════════════
function vizFMModulation(canvas) {
  stopViz('fm');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const beta=1+2*Math.abs(Math.sin(t*0.01)); // 1..3
    _T(ctx,`FM: β = Δf/fm = ${beta.toFixed(2)}  |  Carson BW = 2(Δf+fm) = 2fm(β+1) = ${(2*(beta+1)).toFixed(1)}·fm`,
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const rows=[
      {label:'Message m(t)', oy:65,  col:c.success, fn:(x)=>Math.sin(x)*25},
      {label:'FM Signal',    oy:160, col:c.teal,    fn:(x,p)=>Math.sin(x*6+beta*Math.sin(x))*28},
    ];

    const ox=80, xlen=w-ox-15;
    rows.forEach(({label,oy,col,fn})=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,col,al:'right',fw:'600'});

      ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath();
      for(let i=0;i<=300;i++){
        const x=(i/300)*3*Math.PI+t*0.02;
        const y=fn(x);
        const px=ox+i*(xlen/300), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
    });

    // Bandwidth annotation
    const bwAnn=` ← Carson BW = 2(${beta.toFixed(1)}+1)fm →`;
    _T(ctx,bwAnn,w/2,h-22,{sz:10,fw:'600',col:c.warning,al:'center'});
    _T(ctx,'FM has better noise rejection than AM for β > 1',w/2,h-8,{sz:10,col:c.muted,al:'center'});
    _T(ctx,`FM SNR advantage over AM = 3β²(β+1)/2 ≈ ${(1.5*beta*beta*(beta+1)).toFixed(0)}`,
       w-10,160,{sz:9,col:c.teal,al:'right'});
    t++;
    _vf['fm']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 13. SHANNON CAPACITY — C = B log₂(1+SNR)
// ══════════════════════════════════════════════════════════
function vizShannon(canvas) {
  stopViz('sh');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Shannon Capacity: C = B·log₂(1+SNR)  —  Maximum error-free rate',
       w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const ox=55, oy=h-35, xlen=w-ox-20, ylen=h-58;
    _axes(ctx,ox,oy,xlen,ylen,c,'SNR (linear)','C/B (bits/s/Hz)');

    // Animated SNR cursor
    const snrCur=Math.abs(Math.sin(t*0.008))*30;
    const capCur=Math.log2(1+snrCur);

    // Shannon curve
    ctx.strokeStyle=c.primary; ctx.lineWidth=3;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const snr=i/200*35;
      const cap=Math.log2(1+snr);
      const px=ox+i*(xlen/200), py=oy-cap*(ylen/5.5);
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Reference line: C = B (log₂2 = 1)
    ctx.strokeStyle=c.border; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(ox,oy-ylen/5.5); ctx.lineTo(ox+xlen,oy-ylen/5.5); ctx.stroke();
    ctx.setLineDash([]);

    // Animated cursor
    const curX=ox+snrCur*(xlen/35), curY=oy-capCur*(ylen/5.5);
    ctx.strokeStyle=c.warning+'aa'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(curX,oy); ctx.lineTo(curX,curY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox,curY); ctx.lineTo(curX,curY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle=c.warning; ctx.beginPath(); ctx.arc(curX,curY,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(curX,curY,2.5,0,Math.PI*2); ctx.fill();

    _T(ctx,`SNR=${snrCur.toFixed(1)}`,curX+6,curY-14,{sz:10,fw:'600',col:c.warning});
    _T(ctx,`C=${capCur.toFixed(2)}B`,curX+6,curY,{sz:10,fw:'600',col:c.primary});

    // Y-axis ticks
    [1,2,3,4,5].forEach(v=>{
      const py=oy-v*(ylen/5.5);
      _T(ctx,String(v),ox-4,py,{sz:10,col:c.muted,al:'right'});
    });

    // X-axis ticks
    [5,10,15,20,25,30].forEach(v=>{
      const px=ox+v*(xlen/35);
      _T(ctx,String(v),px,oy+12,{sz:9,col:c.muted,al:'center'});
    });

    _T(ctx,'As SNR → ∞, C grows logarithmically (not linearly)',w/2,h-8,{sz:10,col:c.muted,al:'center'});
    t++;
    _vf['sh']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 14. BODE PLOT — Gain Margin & Phase Margin
// ══════════════════════════════════════════════════════════
function vizBodePlot(canvas) {
  stopViz('bp');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Bode Plot: GM = 1/|G(jωpc)|   PM = 180° + ∠G(jωgc)',w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const magOy=75, phOy=210;
    const ox=55, xlen=w-ox-20;

    // Magnitude plot
    _T(ctx,'Magnitude (dB)',ox,magOy-50,{sz:10,col:c.muted,fw:'600'});
    _arrow(ctx,ox,magOy,ox+xlen,magOy,c.muted);
    _arrow(ctx,ox,magOy+40,ox,magOy-55,c.muted);
    _T(ctx,'0dB',ox-4,magOy,{sz:9,col:c.muted,al:'right'});

    // Magnitude curve (approximated)
    const wcPct=0.55; // gain crossover at 55% of x-axis
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const f=i/200;
      let mag;
      if(f<0.2) mag=40;
      else if(f<wcPct) mag=40-80*(f-0.2)/(wcPct-0.2);
      else mag=-80*(f-wcPct)/(1-wcPct)-14*(1-wcPct);
      const px=ox+i*(xlen/200), py=magOy-Math.min(Math.max(mag,-70),60)*0.6;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // GCF (gain crossover at 0dB)
    const gcfX=ox+wcPct*xlen;
    ctx.strokeStyle=c.warning+'aa'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(gcfX,magOy-50); ctx.lineTo(gcfX,magOy); ctx.stroke(); ctx.setLineDash([]);
    _T(ctx,'ωgc\n(|G|=1)',gcfX,magOy+12,{sz:9,fw:'700',col:c.warning,al:'center'});

    // Phase plot
    _T(ctx,'Phase (°)',ox,phOy-50,{sz:10,col:c.muted,fw:'600'});
    _arrow(ctx,ox,phOy,ox+xlen,phOy,c.muted);
    _arrow(ctx,ox,phOy+30,ox,phOy-55,c.muted);
    _T(ctx,'-180°',ox-4,phOy+28,{sz:9,col:c.danger,al:'right'});
    _T(ctx,'0°',ox-4,phOy,{sz:9,col:c.muted,al:'right'});

    // Phase curve
    const pcPct=0.42;
    ctx.strokeStyle=c.teal; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const f=i/200;
      const ph=-f*230;
      const px=ox+i*(xlen/200), py=phOy-Math.min(Math.max(ph,-220),0)*0.18;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // -180° line
    const ph180y=phOy+180*0.18;
    ctx.strokeStyle=c.danger+'66'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(ox,ph180y); ctx.lineTo(ox+xlen,ph180y); ctx.stroke(); ctx.setLineDash([]);

    // PCF (phase crossover)
    const pcfX=ox+pcPct*xlen;
    ctx.strokeStyle=c.danger+'aa'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(pcfX,phOy-50); ctx.lineTo(pcfX,ph180y); ctx.stroke(); ctx.setLineDash([]);
    _T(ctx,'ωpc',pcfX,phOy+12,{sz:9,fw:'700',col:c.danger,al:'center'});

    // PM and GM arrows
    // PM = distance from -180 at gcf
    const phAtGcf=phOy+wcPct*0.55*230*0.18;
    ctx.strokeStyle=c.success; ctx.lineWidth=2;
    _arrow(ctx,gcfX+8,phAtGcf,gcfX+8,ph180y,c.success);
    _arrow(ctx,gcfX+8,ph180y,gcfX+8,phAtGcf,c.success);
    _T(ctx,'PM',gcfX+12,phAtGcf+12,{sz:10,fw:'700',col:c.success});

    // GM = magnitude at pcf
    const magAtPcf=magOy-(-80*(pcPct-0.2)/(wcPct-0.2)+30)*0.6;
    ctx.strokeStyle=c.orange; ctx.lineWidth=2;
    _arrow(ctx,pcfX+8,magAtPcf,pcfX+8,magOy,c.orange);
    _arrow(ctx,pcfX+8,magOy,pcfX+8,magAtPcf,c.orange);
    _T(ctx,'GM',pcfX+12,magAtPcf+12,{sz:10,fw:'700',col:c.orange});

    _T(ctx,'Stable: GM > 0dB & PM > 0°  |  Ideally PM = 30°–60°',w/2,h-8,{sz:10,col:c.muted,al:'center'});
    t++;
    _vf['bp']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 15. THEVENIN THEOREM — Circuit Transformation
// ══════════════════════════════════════════════════════════
function vizThevenin(canvas) {
  stopViz('th');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,"Thevenin's Theorem: Any linear circuit → Vth + Rth (Series)",w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const alpha=Math.min(t/80,1);
    const midX=w/2;

    // LEFT: original complex circuit
    ctx.save();
    ctx.globalAlpha=(1-alpha*0.5);
    drawOrigCircuit(ctx,50,35,midX-60,h-25,c);
    ctx.restore();

    // Arrow → Thevenin
    if(alpha>0.3){
      ctx.globalAlpha=Math.min((alpha-0.3)/0.3,1);
      _T(ctx,'⟹',midX-20,h/2,{sz:28,col:c.warning,al:'center'});
      ctx.globalAlpha=1;
    }

    // RIGHT: Thevenin equivalent
    if(alpha>0.5){
      ctx.globalAlpha=Math.min((alpha-0.5)/0.5,1);
      drawTheveninEq(ctx,midX+30,35,w-20,h-25,c);
      ctx.globalAlpha=1;
    }

    // Bottom labels
    if(alpha<0.3) _T(ctx,'Finding Vth: Vth = Voc (open circuit voltage)',w/2,h-10,{sz:10,col:c.muted,al:'center'});
    else if(alpha<0.6) _T(ctx,'Finding Rth: Kill sources (V→short, I→open), find Rth',w/2,h-10,{sz:10,col:c.muted,al:'center'});
    else _T(ctx,'Simplified! Any load RL connects to Vth + Rth only',w/2,h-10,{sz:10,col:c.success,al:'center'});

    if(t<200) { t+=2; _vf['th']=requestAnimationFrame(draw); }
    else { setTimeout(()=>{t=0;_vf['th']=requestAnimationFrame(draw);},2000); }
  }

  function drawOrigCircuit(ctx,x1,y1,x2,y2,c) {
    ctx.strokeStyle=c.muted; ctx.lineWidth=2;
    const cx=(x1+x2)/2, cy=(y1+y2)/2;
    // Battery
    ctx.beginPath(); ctx.moveTo(x1+20,y1+20); ctx.lineTo(x1+20,y2-20); ctx.stroke();
    _T(ctx,'V₁',x1+8,cy,{sz:11,col:c.primary,al:'right'});
    // Resistors (zigzag)
    drawZigzag(ctx,x1+20,y1+20,x2-20,y1+20,c.muted,'R₁');
    drawZigzag(ctx,x2-20,y1+20,x2-20,y2-20,c.muted,'R₂');
    drawZigzag(ctx,x1+20,y2-20,x2-20,y2-20,c.muted,'R₃');
    // Source
    _T(ctx,'Complex\nCircuit',cx,cy,{sz:11,col:c.muted,al:'center'});
    // Terminals A,B
    _T(ctx,'A',x2-16,y1+20,{sz:12,fw:'700',col:c.danger,al:'center'});
    _T(ctx,'B',x2-16,y2-20,{sz:12,fw:'700',col:c.danger,al:'center'});
    ctx.fillStyle=c.danger; ctx.beginPath(); ctx.arc(x2-20,y1+20,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x2-20,y2-20,4,0,Math.PI*2); ctx.fill();
  }

  function drawTheveninEq(ctx,x1,y1,x2,y2,c) {
    const cx=(x1+x2)/2, cy=(y1+y2)/2;
    // Vth battery
    const batX=x1+20, batH=(y2-y1-60)/2;
    ctx.strokeStyle=c.primary; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(batX,y1+20); ctx.lineTo(batX,y2-20); ctx.stroke();
    [[cy-15,'+'],[cy+15,'−']].forEach(([y,lbl])=>{
      ctx.strokeStyle=c.primary; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(batX-8,y); ctx.lineTo(batX+8,y); ctx.stroke();
      if(lbl==='+'){ctx.beginPath(); ctx.moveTo(batX,y-8); ctx.lineTo(batX,y+8); ctx.stroke();}
    });
    _T(ctx,'Vth',batX-12,cy,{sz:12,fw:'700',col:c.primary,al:'right'});

    // Rth in series
    drawZigzag(ctx,batX,y1+20,x2-20,y1+20,c.warning,'Rth');
    ctx.strokeStyle=c.muted; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x2-20,y1+20); ctx.lineTo(x2-20,y2-20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(batX,y2-20); ctx.lineTo(x2-20,y2-20); ctx.stroke();

    // Terminals A,B
    ctx.fillStyle=c.success; ctx.beginPath(); ctx.arc(x2-20,y1+20,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x2-20,y2-20,5,0,Math.PI*2); ctx.fill();
    _T(ctx,'A',x2-8,y1+20,{sz:12,fw:'700',col:c.success});
    _T(ctx,'B',x2-8,y2-20,{sz:12,fw:'700',col:c.success});

    // Equivalent label
    _T(ctx,'Thevenin\nEquivalent',cx,cy+15,{sz:11,fw:'600',col:c.success,al:'center'});
  }

  function drawZigzag(ctx,x1,y1,x2,y2,col,label) {
    ctx.strokeStyle=col; ctx.lineWidth=2;
    const dx=x2-x1, dy=y2-y1;
    const len=Math.sqrt(dx*dx+dy*dy);
    const n=5, zig=7;
    ctx.beginPath(); ctx.moveTo(x1,y1);
    for(let i=0;i<=n;i++){
      const t=i/n;
      const ox=-dy/len*zig*(i%2===0?1:-1);
      const oy=dx/len*zig*(i%2===0?1:-1);
      ctx.lineTo(x1+t*dx+ox,y1+t*dy+oy);
    }
    ctx.lineTo(x2,y2); ctx.stroke();
    if(label) _T(ctx,label,(x1+x2)/2,(y1+y2)/2-10,{sz:10,fw:'600',col,al:'center'});
  }

  draw();
}

// ══════════════════════════════════════════════════════════
// 16. SI vs CI GROWTH — Aptitude
// ══════════════════════════════════════════════════════════
function vizInterest(canvas) {
  stopViz('int');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const P=1000, R=15; // principal=1000, rate=15%

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,`SI vs CI (P=₹${P}, R=${R}%): SI=P·R·T/100  |  CI=P(1+R/100)^T`,w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const maxT=10, maxV=P*Math.pow(1+R/100,maxT);
    const ox=55, oy=h-35, xlen=w-ox-20, ylen=h-55;
    _axes(ctx,ox,oy,xlen,ylen,c,'Years (T)','Amount (₹)');

    const progress=Math.min(t/120,1);

    // SI curve (linear)
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      if(i/200>progress) break;
      const yr=i/200*maxT;
      const si=P*(1+R*yr/100);
      const px=ox+i*(xlen/200), py=oy-((si-P)/(maxV-P))*ylen*0.88-ylen*0.05;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // CI curve (exponential)
    ctx.strokeStyle=c.success; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      if(i/200>progress) break;
      const yr=i/200*maxT;
      const ci=P*Math.pow(1+R/100,yr);
      const px=ox+i*(xlen/200), py=oy-((ci-P)/(maxV-P))*ylen*0.88-ylen*0.05;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Year labels
    for(let y=0;y<=maxT;y+=2){
      _T(ctx,String(y),ox+y*(xlen/maxT),oy+12,{sz:10,col:c.muted,al:'center'});
    }

    // Legends
    ctx.fillStyle=c.primary; ctx.fillRect(ox,oy-ylen-30,20,3);
    _T(ctx,'Simple Interest (linear)',ox+25,oy-ylen-29,{sz:10,col:c.primary});
    ctx.fillStyle=c.success; ctx.fillRect(ox,oy-ylen-14,20,3);
    _T(ctx,'Compound Interest (exponential)',ox+25,oy-ylen-13,{sz:10,col:c.success});

    // At T=10 values
    if(progress>0.92){
      const si10=P*(1+R*10/100);
      const ci10=P*Math.pow(1+R/100,10);
      const p10x=ox+xlen, p10ysi=oy-((si10-P)/(maxV-P))*ylen*0.88-ylen*0.05;
      const p10yci=oy-((ci10-P)/(maxV-P))*ylen*0.88-ylen*0.05;
      _T(ctx,`₹${si10.toFixed(0)}`,p10x+4,p10ysi,{sz:10,fw:'600',col:c.primary});
      _T(ctx,`₹${ci10.toFixed(0)}`,p10x+4,p10yci,{sz:10,fw:'600',col:c.success});
      _T(ctx,`CI−SI = ₹${(ci10-si10).toFixed(0)} more!`,w/2,h-10,{sz:11,fw:'600',col:c.warning,al:'center'});
    } else {
      _T(ctx,'CI−SI (2yr) shortcut: P×(R/100)²',w/2,h-10,{sz:10,col:c.muted,al:'center'});
    }
    t++;
    _vf['int']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 17. BJT OPERATION — β = IC/IB
// ══════════════════════════════════════════════════════════
function vizBJT(canvas) {
  stopViz('bjt');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'BJT: IC = β·IB  |  IE = IC + IB  |  α = IC/IE = β/(1+β)',w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const cx=w/2, cy=h/2+5;
    const IB=10+10*Math.sin(t*0.02);
    const beta=100;
    const IC=beta*IB; const IE=IC+IB;

    // BJT symbol
    ctx.strokeStyle=c.teal; ctx.lineWidth=2.5;
    // Base line
    ctx.beginPath(); ctx.moveTo(cx-60,cy); ctx.lineTo(cx-20,cy); ctx.stroke();
    // Vertical bar (base)
    ctx.beginPath(); ctx.moveTo(cx-20,cy-35); ctx.lineTo(cx-20,cy+35); ctx.stroke();
    // Collector
    ctx.beginPath(); ctx.moveTo(cx-20,cy-20); ctx.lineTo(cx+30,cy-60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+30,cy-60); ctx.lineTo(cx+30,cy-80); ctx.stroke();
    // Emitter (with arrow)
    ctx.beginPath(); ctx.moveTo(cx-20,cy+20); ctx.lineTo(cx+30,cy+60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+30,cy+60); ctx.lineTo(cx+30,cy+80); ctx.stroke();
    // Arrow on emitter
    _arrow(ctx,cx+5,cy+38,cx+18,cy+51,c.teal,2);

    // Labels
    _T(ctx,'B',cx-70,cy,{sz:14,fw:'700',col:c.primary,al:'center'});
    _T(ctx,'C',cx+30,cy-84,{sz:14,fw:'700',col:c.danger,al:'center'});
    _T(ctx,'E',cx+30,cy+84,{sz:14,fw:'700',col:c.success,al:'center'});

    // Current arrows with animated thickness
    const norm=IB/20;
    ctx.strokeStyle=c.primary; ctx.lineWidth=1+norm*2;
    _arrow(ctx,cx-80,cy,cx-60,cy,c.primary,1+norm);

    ctx.strokeStyle=c.danger; ctx.lineWidth=1+(norm*beta/IC)*8;
    _arrow(ctx,cx+30,cy-80,cx+30,cy-60,c.danger,2.5);

    ctx.strokeStyle=c.success; ctx.lineWidth=2+norm*8;
    _arrow(ctx,cx+30,cy+60,cx+30,cy+80,c.success,2.5);

    // Values
    _T(ctx,`IB = ${IB.toFixed(1)} μA`,cx-100,cy-12,{sz:11,fw:'700',col:c.primary,al:'right'});
    _T(ctx,`IC = β×IB = ${IC.toFixed(0)} μA`,cx+40,cy-60,{sz:11,fw:'700',col:c.danger});
    _T(ctx,`IE = IC+IB = ${IE.toFixed(0)} μA`,cx+40,cy+70,{sz:11,fw:'700',col:c.success});

    // β meter
    const bx=30, by=40;
    ctx.fillStyle=c.purple+'22'; ctx.strokeStyle=c.purple; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,90,50,8):ctx.rect(bx,by,90,50);
    ctx.fill(); ctx.stroke();
    _T(ctx,'β (hFE)',bx+45,by+14,{sz:10,col:c.purple,al:'center',fw:'600'});
    _T(ctx,String(beta),bx+45,by+33,{sz:20,fw:'800',col:c.purple,al:'center'});

    _T(ctx,'Voltage Gain CE: Av = −gm·RC  |  gm = IC/VT',w/2,h-8,{sz:10,col:c.muted,al:'center'});
    t++;
    _vf['bjt']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 18. CONVOLUTION — Sliding Overlap
// ══════════════════════════════════════════════════════════
function vizConvolution(canvas) {
  stopViz('conv');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,'Convolution: y(t) = x(t) * h(t) = ∫ x(τ)·h(t−τ) dτ',w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const pts=200, ox=30, xlen=w-60;
    const offset=(t%200)/200; // 0..1 slider for h(-τ) sliding

    // x(τ): rect pulse 0.2..0.6
    const xfn=(u)=>(u>=0.2&&u<0.6)?0.85:0;
    // h(-τ) reversed and shifted by offset
    const hfn=(u,off)=>(u>=(off-0.3)&&u<off)?0.85:0;

    // Overlap region (product)
    const rows=[
      {label:'x(τ)', oy:60,  fn:(u)=>xfn(u), col:c.primary, fill:true},
      {label:'h(t−τ)',oy:125, fn:(u)=>hfn(u,offset+0.3), col:c.orange, fill:true},
      {label:'y(t)', oy:195, fn:(u)=>null, col:c.success, fill:true},
    ];

    // Output y
    const yVals=[];
    for(let i=0;i<=pts;i++){
      const tval=i/pts;
      let sum=0;
      for(let j=0;j<=pts;j++){
        sum+=xfn(j/pts)*hfn(j/pts,tval+0.3)/pts;
      }
      yVals.push(sum);
    }

    rows.forEach(({label,oy,fn,col},ri)=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,col,al:'right',fw:'600'});

      ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath();

      if(ri<2){
        for(let i=0;i<=pts;i++){
          const u=i/pts;
          const y=fn(u)*38;
          const px=ox+i*(xlen/pts), py=oy-y;
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
      } else {
        const maxY=Math.max(...yVals);
        for(let i=0;i<=pts;i++){
          const y=(yVals[i]||0)/maxY*38;
          const px=ox+i*(xlen/pts), py=oy-y;
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
      }
      ctx.stroke();
    });

    // Overlap highlight
    const hStart=Math.max(0.2,offset), hEnd=Math.min(0.6,offset+0.3);
    if(hEnd>hStart){
      const px1=ox+hStart*xlen, px2=ox+hEnd*xlen;
      ctx.fillStyle=c.warning+'30';
      ctx.fillRect(px1,25,px2-px1,195);
      _T(ctx,'overlap',( px1+px2)/2,h/2-55,{sz:9,col:c.warning,al:'center',fw:'600'});
    }

    // Cursor line
    const curX=ox+(offset+0.15)*xlen;
    ctx.strokeStyle=c.muted+'80'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(curX,25); ctx.lineTo(curX,215); ctx.stroke();
    ctx.setLineDash([]);

    _T(ctx,'Time convolution = Frequency multiplication: Y(ω)=X(ω)·H(ω)',w/2,h-8,{sz:10,col:c.muted,al:'center'});
    t++;
    _vf['conv']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// VISUALIZATION MAP — maps topic name → render function
// ══════════════════════════════════════════════════════════
const vizMap = {
  'digital':       [
    { id:'lg',   title:'Logic Gates (Interactive)',  fn: vizLogicGates,   desc:'Click A/B to toggle — see AND, OR, NAND, NOR, XOR outputs live' },
    { id:'km',   title:'K-Map Groupings',             fn: vizKMap,         desc:'Animated 4-var K-map showing valid groups and SOP expression' },
    { id:'bjt2', title:'Flip-Flop (JK)',              fn: vizFlipFlop_JK,  desc:'JK flip-flop: Q(t+1) = JQ\' + K\'Q with clock animation' },
  ],
  'network':       [
    { id:'rc',   title:'RC Charging Curve',           fn: vizRCCharging,   desc:'V(t) = V₀(1−e^(−t/τ)) — 63.2% at τ=RC' },
    { id:'res',  title:'Resonance Frequency',          fn: vizResonance,    desc:'XL, XC, Z vs Frequency — f₀ = 1/(2π√LC)' },
    { id:'th',   title:"Thevenin's Theorem",           fn: vizThevenin,     desc:'Any linear circuit simplifies to Vth + Rth in series' },
  ],
  'analog':        [
    { id:'div',  title:'Diode I-V Curve',              fn: vizDiodeIV,      desc:'I = I₀(e^(V/VT)−1) — forward bias, threshold 0.7V' },
    { id:'rect', title:'Rectifier Waveforms',           fn: vizRectifier,    desc:'HWR vs FWR — ripple factor and efficiency comparison' },
    { id:'oa',   title:'Op-Amp Configurations',        fn: vizOpAmp,        desc:'Av(inv)=−Rf/Rin | Av(non-inv)=1+Rf/Rin — virtual ground' },
    { id:'bjt',  title:'BJT Operation (β)',            fn: vizBJT,          desc:'IC = β·IB | IE = IC+IB | α = IC/IE' },
  ],
  'signals':       [
    { id:'fs',   title:'Fourier Series Buildup',       fn: vizFourier,      desc:'Square wave from harmonics — see why more terms → better square wave' },
    { id:'smp',  title:'Nyquist Sampling Theorem',     fn: vizSampling,     desc:'fs ≥ 2fm prevents aliasing — see what happens below Nyquist rate' },
    { id:'conv', title:'Convolution (Sliding)',         fn: vizConvolution,  desc:'y(t)=x(t)*h(t) — animated sliding overlap integral' },
  ],
  'control':       [
    { id:'sr',   title:'Step Response (Damping)',      fn: vizStepResponse, desc:'Auto-animates ξ from 0.1 to 2.0 — watch underdamped/overdamped behavior' },
    { id:'bp',   title:'Bode Plot (GM & PM)',          fn: vizBodePlot,     desc:'Gain margin, phase margin, crossover frequencies explained visually' },
  ],
  'communications':[
    { id:'am',   title:'AM Modulation',               fn: vizAMModulation, desc:'m=Am/Ac animated — envelope, bandwidth, efficiency shown' },
    { id:'fm',   title:'FM Modulation',               fn: vizFMModulation, desc:'β=Δf/fm animated — Carson rule bandwidth = 2(Δf+fm)' },
    { id:'sh',   title:'Shannon Capacity',             fn: vizShannon,      desc:'C = B·log₂(1+SNR) — animated cursor shows capacity vs SNR' },
  ],
  'aptitude':      [
    { id:'int',  title:'SI vs CI Growth',             fn: vizInterest,     desc:'P=₹1000 at 15% — linear SI vs exponential CI over 10 years' },
  ],
  'english': [],
};

// Placeholder for JK Flip-Flop (added below vizBJT)
function vizFlipFlop_JK(canvas) {
  stopViz('ff');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const states=[
    {J:0,K:0,Q:0,Qn:1,label:'Hold (No Change)'},
    {J:1,K:0,Q:1,Qn:0,label:'Set (Q→1)'},
    {J:0,K:0,Q:1,Qn:0,label:'Hold'},
    {J:0,K:1,Q:0,Qn:1,label:'Reset (Q→0)'},
    {J:1,K:1,Q:1,Qn:0,label:'Toggle (Q flips)'},
    {J:1,K:1,Q:0,Qn:1,label:'Toggle (Q flips)'},
  ];

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    _T(ctx,"JK Flip-Flop: Q(t+1) = J·Q' + K'·Q  |  J=K=1 → Toggle",w/2,14,{sz:11,fw:'600',col:c.muted,al:'center'});

    const si=Math.floor(t/90)%states.length;
    const {J,K,Q,Qn,label}=states[si];
    const pulse=0.5+0.5*Math.sin(t*0.05);

    // FF box
    const bx=w/2-60, by=h/2-55, bw=120, bh=110;
    ctx.fillStyle=c.card; ctx.strokeStyle=Q?c.success:c.primary; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,bw,bh,8):ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
    _T(ctx,'JK FF',w/2,by+bh/2-12,{sz:14,fw:'700',col:c.text,al:'center'});
    _T(ctx,'CLK ↑',w/2,by+bh/2+8,{sz:11,col:c.muted,al:'center'});
    // Clock pulse animation
    ctx.fillStyle=c.warning; ctx.globalAlpha=pulse;
    ctx.beginPath(); ctx.arc(w/2,by+bh/2+20,4,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;

    // J input
    ctx.strokeStyle=J?c.danger:c.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx-60,by+25); ctx.lineTo(bx,by+25); ctx.stroke();
    _T(ctx,'J',bx-65,by+25,{sz:14,fw:'700',col:J?c.danger:c.muted,al:'right'});
    const jBtn=ctx.fillStyle=J?c.danger:c.border;
    ctx.fillStyle=J?c.danger:c.border; ctx.beginPath(); ctx.arc(bx-62,by+25,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(J),bx-62,by+25,{sz:11,fw:'700',col:J?'white':c.muted,al:'center'});

    // K input
    ctx.strokeStyle=K?c.orange:c.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx-60,by+bh-25); ctx.lineTo(bx,by+bh-25); ctx.stroke();
    _T(ctx,'K',bx-65,by+bh-25,{sz:14,fw:'700',col:K?c.orange:c.muted,al:'right'});
    ctx.fillStyle=K?c.orange:c.border; ctx.beginPath(); ctx.arc(bx-62,by+bh-25,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(K),bx-62,by+bh-25,{sz:11,fw:'700',col:K?'white':c.muted,al:'center'});

    // Q output
    ctx.strokeStyle=Q?c.success:c.border; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bx+bw,by+25); ctx.lineTo(bx+bw+60,by+25); ctx.stroke();
    _T(ctx,'Q',bx+bw+64,by+25,{sz:14,fw:'700',col:Q?c.success:c.muted});
    ctx.fillStyle=Q?c.success:c.border; ctx.beginPath(); ctx.arc(bx+bw+62,by+25,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(Q),bx+bw+62,by+25,{sz:11,fw:'700',col:Q?'white':c.muted,al:'center'});

    // Q' output
    ctx.strokeStyle=Qn?c.purple:c.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx+bw,by+bh-25); ctx.lineTo(bx+bw+60,by+bh-25); ctx.stroke();
    _T(ctx,"Q'",bx+bw+64,by+bh-25,{sz:14,fw:'700',col:Qn?c.purple:c.muted});
    ctx.fillStyle=Qn?c.purple:c.border; ctx.beginPath(); ctx.arc(bx+bw+62,by+bh-25,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(Qn),bx+bw+62,by+bh-25,{sz:11,fw:'700',col:Qn?'white':c.muted,al:'center'});

    // State label
    const stateCol=Q?c.success:c.primary;
    ctx.fillStyle=stateCol+'22'; ctx.strokeStyle=stateCol; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(w/2-80,h-55,160,28,6):ctx.rect(w/2-80,h-55,160,28);
    ctx.fill(); ctx.stroke();
    _T(ctx,label,w/2,h-41,{sz:12,fw:'700',col:stateCol,al:'center'});

    // Truth table hint
    _T(ctx,'J=0,K=0→Hold | J=1,K=0→Set | J=0,K=1→Reset | J=1,K=1→Toggle',
       w/2,h-10,{sz:9,col:c.muted,al:'center'});

    t++;
    _vf['ff']=requestAnimationFrame(draw);
  }
  draw();
}
