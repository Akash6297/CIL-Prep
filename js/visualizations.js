'use strict';
// ════════════════════════════════════════════════════════════
// CIL Cracker — Formula Visualizations v3
// Fixed: title always visible, proper margins, interactive controls
// ════════════════════════════════════════════════════════════

const _vf = {};
function stopViz(id) { if (_vf[id]) { cancelAnimationFrame(_vf[id]); delete _vf[id]; } }
function stopAllViz() { Object.keys(_vf).forEach(stopViz); }

function _setup(canvas) {
  const r = window.devicePixelRatio || 1;
  const w = canvas.clientWidth  || 380;
  const h = canvas.clientHeight || 240;
  canvas.width  = w * r;
  canvas.height = h * r;
  const ctx = canvas.getContext('2d');
  ctx.scale(r, r);
  return { ctx, w, h };
}

function _C() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    bg:      dark ? '#1e293b' : '#f8fafc',
    card:    dark ? '#0f172a' : '#ffffff',
    text:    dark ? '#f1f5f9' : '#0f172a',
    label:   dark ? '#cbd5e1' : '#374151',
    muted:   dark ? '#94a3b8' : '#64748b',
    border:  dark ? '#475569' : '#cbd5e1',
    grid:    dark ? '#2d3f54' : '#e2e8f0',
    primary:'#3b82f6', success:'#10b981', danger:'#ef4444',
    warning:'#f59e0b', purple:'#8b5cf6', orange:'#f97316', teal:'#14b8a6',
  };
}

// Draw text (no maxWidth overflow)
function _T(ctx,str,x,y,{sz=12,fw='normal',col='#333',al='left',bl='middle',ff="'Segoe UI',sans-serif",mw=0}={}) {
  ctx.save();
  ctx.font=`${fw} ${sz}px ${ff}`; ctx.fillStyle=col; ctx.textAlign=al; ctx.textBaseline=bl;
  mw ? ctx.fillText(str,x,y,mw) : ctx.fillText(str,x,y);
  ctx.restore();
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

// Axes with ROTATED y-label so it never overlaps the title
function _axes(ctx,ox,oy,xlen,ylen,c,lx='',ly='') {
  _arrow(ctx,ox,oy,ox+xlen,oy,c.label);
  _arrow(ctx,ox,oy,ox,oy-ylen,c.label);
  if(lx) _T(ctx,lx,ox+xlen+4,oy,{sz:10,fw:'600',col:c.label});
  if(ly) {
    ctx.save();
    ctx.translate(12, oy-ylen/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle=c.label; ctx.font=`600 9px 'Segoe UI',sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(ly,0,0);
    ctx.restore();
  }
}

// ── TITLE: drawn LAST in every draw() so it always sits on top ──────────────
// Solid bg strip prevents graph lines from covering the formula text.
function _title(ctx,str,w,c) {
  ctx.save();
  // Solid header background strip
  ctx.fillStyle = c.bg;
  ctx.fillRect(0,0,w,30);
  // Thin border line
  ctx.strokeStyle = c.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0,30); ctx.lineTo(w,30); ctx.stroke();
  // Text — maxWidth auto-shrinks long strings to fit
  ctx.fillStyle = c.text;
  ctx.font = `700 12px 'Segoe UI',sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, w/2, 15, w-18);
  ctx.restore();
}

// ── NOTE: bottom footer text ─────────────────────────────────────────────────
function _note(ctx,str,w,h,c) {
  ctx.save();
  ctx.fillStyle=c.bg; ctx.fillRect(0,h-22,w,22);
  ctx.strokeStyle=c.border; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,h-22); ctx.lineTo(w,h-22); ctx.stroke();
  ctx.fillStyle=c.label;
  ctx.font=`500 10px 'Segoe UI',sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(str,w/2,h-11,w-18);
  ctx.restore();
}

// Layout constants for all axis-based plots
// Leaves more top/bottom breathing room inside the canvas
function _layout(h) {
  const ox = 56;
  const oy = h - 48; // lower axis sits 48px above bottom
  const ylen = h - 96; // graph height = canvas - top(48) - bottom(48)
  return { ox, oy, ylen };
}

// ══════════════════════════════════════════════════════════
// 1. LOGIC GATES — Interactive click
// ══════════════════════════════════════════════════════════
function vizLogicGates(canvas, params={}) {
  stopViz('lg');
  const {ctx,w,h} = _setup(canvas);
  let A=0, B=0;
  function gate(t,a,b){return t==='AND'?a&b:t==='OR'?a|b:t==='NAND'?((a&b)?0:1):t==='NOR'?((a|b)?0:1):t==='XOR'?a^b:((a^b)?0:1);}
  const gates=[
    {type:'AND',x:90, y:70, col:'#8b5cf6'},
    {type:'OR', x:250,y:70, col:'#3b82f6'},
    {type:'NAND',x:90,y:155,col:'#ef4444'},
    {type:'NOR',x:250,y:155,col:'#f97316'},
    {type:'XOR',x:170,y:215,col:'#10b981'},
  ];

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    [[A,'A','#8b5cf6',50],[B,'B','#3b82f6',130]].forEach(([val,lbl,col,cy])=>{
      ctx.fillStyle=val?col:c.border; ctx.strokeStyle=val?(col+'bb'):c.muted; ctx.lineWidth=2;
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(8,cy,36,36,6):ctx.rect(8,cy,36,36); ctx.fill(); ctx.stroke();
      _T(ctx,lbl,26,cy+12,{sz:14,fw:'700',col:val?'white':c.text,al:'center'});
      _T(ctx,val?'1':'0',26,cy+27,{sz:11,col:val?col:c.muted,al:'center'});
    });

    gates.forEach(({type,x,y,col})=>{
      const out=gate(type,A,B), gw=58, gh=36;
      ctx.fillStyle=out?(col+'25'):c.card; ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(x,y-gh/2,gw,gh,8):ctx.rect(x,y-gh/2,gw,gh);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle=A?'#8b5cf6':c.border; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x-14,y-9); ctx.lineTo(x,y-9); ctx.stroke();
      ctx.strokeStyle=B?'#3b82f6':c.border;
      ctx.beginPath(); ctx.moveTo(x-14,y+9); ctx.lineTo(x,y+9); ctx.stroke();
      ctx.strokeStyle=out?col:c.border; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x+gw,y); ctx.lineTo(x+gw+18,y); ctx.stroke();
      if(type==='NAND'||type==='NOR'){ctx.strokeStyle=col;ctx.beginPath();ctx.arc(x+gw+5,y,4,0,Math.PI*2);ctx.stroke();}
      _T(ctx,type,x+gw/2,y,{sz:12,fw:'700',col:out?col:c.text,al:'center'});
      _T(ctx,out?'1':'0',x+gw+28,y,{sz:14,fw:'700',col:out?col:c.muted,al:'left'});
      ctx.fillStyle=A?'#8b5cf6':c.muted; ctx.beginPath(); ctx.arc(x-16,y-9,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=B?'#3b82f6':c.muted; ctx.beginPath(); ctx.arc(x-16,y+9,3.5,0,Math.PI*2); ctx.fill();
    });

    _title(ctx,'Logic Gates  |  Click A or B to toggle — watch all outputs change',w,c);
    _note(ctx,"De Morgan: (A·B)' = A'+B'   |   (A+B)' = A'·B'",w,h,c);
  }

  draw();
  canvas.style.cursor='pointer';
  canvas.onclick=function(e){
    const r=canvas.getBoundingClientRect(),sx=w/canvas.clientWidth;
    const cx=(e.clientX-r.left)*sx,cy=(e.clientY-r.top)*sx;
    if(cx>=8&&cx<=44&&cy>=50&&cy<=86){A^=1;draw();}
    if(cx>=8&&cx<=44&&cy>=130&&cy<=166){B^=1;draw();}
  };
}

// ══════════════════════════════════════════════════════════
// 2. K-MAP — Animated groupings
// ══════════════════════════════════════════════════════════
function vizKMap(canvas, params={}) {
  stopViz('km');
  const {ctx,w,h} = _setup(canvas);
  const cells=[1,0,1,1,0,0,1,1,0,0,1,1,1,0,1,1];
  let phase=0;
  const groups=[
    {cells:[2,3,6,7,10,11,14,15],col:'#3b82f6',label:'Group 1: BC'},
    {cells:[2,3,10,11],          col:'#8b5cf6',label:"Group 2: AB'D'"},
    {cells:[0,4,12,8],           col:'#10b981',label:"Group 3: A'C'D'"},
  ];
  const cols=['00','01','11','10'],rows=['00','01','11','10'];
  const cellPos=[0,1,3,2,4,5,7,6,12,13,15,14,8,9,11,10];
  const mterm=(r,c)=>cellPos[r*4+c];
  const cw=36,ch=30;
  const ox=(w-4*cw-40)/2+38,oy=46;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    _T(ctx,'CD→',ox-34,oy-8,{sz:10,fw:'700',col:c.label});
    _T(ctx,'AB↓',ox-34,oy+12,{sz:10,fw:'700',col:c.label});
    cols.forEach((l,i)=>_T(ctx,l,ox+i*cw+cw/2,oy-8,{sz:10,fw:'600',col:c.muted,al:'center'}));
    rows.forEach((l,i)=>_T(ctx,l,ox-8,oy+i*ch+ch/2,{sz:10,fw:'600',col:c.muted,al:'right'}));

    for(let r=0;r<4;r++){
      for(let cc=0;cc<4;cc++){
        const mt=mterm(r,cc),val=cells[mt],x=ox+cc*cw,y=oy+r*ch;
        ctx.strokeStyle=c.border; ctx.lineWidth=1;
        ctx.fillStyle=val?(c.primary+'20'):c.bg;
        ctx.fillRect(x,y,cw,ch); ctx.strokeRect(x,y,cw,ch);
        _T(ctx,String(val),x+cw/2,y+ch/2,{sz:13,fw:'700',col:val?c.primary:c.muted,al:'center'});
        _T(ctx,String(mt),x+cw/2,y+4,{sz:7,col:c.muted,al:'center',bl:'top'});
      }
    }

    const gIdx=Math.floor(phase/80)%3;
    const grp=groups[gIdx];
    const alpha=0.15+0.1*Math.sin(phase*0.05);
    for(let r=0;r<4;r++){
      for(let cc=0;cc<4;cc++){
        const mt=mterm(r,cc);
        if(cells[mt]&&grp.cells.includes(mt)){
          const x=ox+cc*cw,y=oy+r*ch;
          ctx.fillStyle=grp.col+(Math.floor(alpha*255).toString(16).padStart(2,'0'));
          ctx.fillRect(x+1,y+1,cw-2,ch-2);
          ctx.strokeStyle=grp.col; ctx.lineWidth=2.5;
          ctx.strokeRect(x+1,y+1,cw-2,ch-2);
        }
      }
    }

    const gCols=[c.primary,c.purple,c.success];
    _T(ctx,grp.label+' (highlighted)',w/2,oy+4*ch+16,{sz:11,fw:'700',col:gCols[gIdx],al:'center'});
    _T(ctx,"SOP = BC + AB'D' + A'C'D'",w/2,oy+4*ch+32,{sz:12,fw:'700',col:c.text,al:'center',ff:"'Courier New',monospace"});

    _title(ctx,'4-Variable K-Map  |  Animated SOP Groupings',w,c);
    _note(ctx,'Group only 1,2,4,8 cells  |  Overlapping groups OK  |  SOP = sum of prime implicants',w,h,c);
    phase++;
    _vf['km']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 3. RC CHARGING — params: {tau, v0}
// ══════════════════════════════════════════════════════════
function vizRCCharging(canvas, params={}) {
  stopViz('rc');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const tauM=parseFloat(params.tau||1);
  const V0=parseFloat(params.v0||12);

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const {ox,oy,ylen}=_layout(h);
    const xlen=w-ox-15;

    _axes(ctx,ox,oy,xlen,ylen,c,'Time →','Voltage (V)');

    // Grid lines at each τ
    for(let tau=1;tau<=5;tau++){
      const x=ox+tau*(xlen/5.5);
      ctx.setLineDash([4,4]); ctx.strokeStyle=c.grid; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x,oy); ctx.lineTo(x,oy-ylen); ctx.stroke();
      ctx.setLineDash([]);
      _T(ctx,`${tau}τ`,x,oy+14,{sz:10,fw:'700',col:c.label,al:'center'});
    }

    // Full dashed ghost curve
    ctx.strokeStyle=c.border; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const tt=i/200*5.5, vv=(1-Math.exp(-tt/tauM));
      const px=ox+i*(xlen/200), py=oy-vv*ylen;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Animated coloured segment
    const tcur=Math.min(t*0.015,5.5);
    const vcur=(1-Math.exp(-tcur/tauM));
    const px=ox+tcur*(xlen/5.5), py=oy-vcur*ylen;

    ctx.strokeStyle=c.primary; ctx.lineWidth=3;
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const tt=i/200*5.5;
      if(tt>tcur) break;
      const vv=(1-Math.exp(-tt/tauM));
      const ppx=ox+i*(xlen/200), ppy=oy-vv*ylen;
      i===0?ctx.moveTo(ppx,ppy):ctx.lineTo(ppx,ppy);
    }
    ctx.stroke();

    // Moving dot
    ctx.fillStyle=c.primary; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
    _T(ctx,`V=${(vcur*V0).toFixed(1)}V`,px+8,py-10,{sz:11,fw:'700',col:c.primary});

    // 63.2% marker
    const t1x=ox+xlen/5.5, t1y=oy-(1-Math.exp(-1/tauM))*ylen;
    ctx.strokeStyle=c.warning+'aa'; ctx.lineWidth=1; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(ox,t1y); ctx.lineTo(t1x,t1y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(t1x,oy); ctx.lineTo(t1x,t1y); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,`${((1-Math.exp(-1/tauM))*100).toFixed(1)}%`,ox-4,t1y,{sz:10,fw:'700',col:c.warning,al:'right'});

    // V₀ line
    ctx.strokeStyle=c.success+'88'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(ox,oy-ylen); ctx.lineTo(ox+xlen,oy-ylen); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,`V₀=${V0}V`,ox-4,oy-ylen,{sz:10,fw:'700',col:c.success,al:'right'});

    _title(ctx,`RC Charging: V(t) = V₀·(1 − e^(−t/τ))  |  τ=${tauM}×RC  V₀=${V0}V`,w,c);
    _note(ctx,`At t=τ: V≈${((1-Math.exp(-1/tauM))*100).toFixed(1)}% of V₀  |  At t=5τ: V≈${((1-Math.exp(-5/tauM))*100).toFixed(1)}% (fully charged)`,w,h,c);

    if(t<380){t++;_vf['rc']=requestAnimationFrame(draw);}else t=0;
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 4. RESONANCE — params: {Q}
// ══════════════════════════════════════════════════════════
function vizResonance(canvas, params={}) {
  stopViz('res');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const Q=parseFloat(params.Q||10);

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const {ox,oy,ylen}=_layout(h);
    const xlen=w-ox-15, R=1/Q;
    _axes(ctx,ox,oy,xlen,ylen,c,'Frequency →','Impedance Z');

    const f0x=ox+xlen*0.5, pts=160;

    // XL = ωL
    ctx.strokeStyle=c.danger; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=pts;i++){
      const f=i/pts*2, xl=f*ylen*0.8;
      const px=ox+i*(xlen/pts), py=oy-xl;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // XC = 1/ωC
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=2;i<=pts;i++){
      const f=i/pts*2, xc=(1/f)*ylen*0.8;
      const px=ox+i*(xlen/pts), py=oy-Math.min(xc,ylen*1.05);
      i===2?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Z combined
    ctx.strokeStyle=c.purple; ctx.lineWidth=3; ctx.beginPath();
    for(let i=1;i<=pts;i++){
      const f=Math.max(0.01,i/pts*2);
      const z=Math.sqrt(R*R+Math.pow(f*0.8-1/(f)*0.8,2));
      const px=ox+i*(xlen/pts), py=oy-Math.min(z,1)*ylen;
      i===1?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // f₀ pulsing line
    const pulse=0.6+0.4*Math.sin(t*0.04);
    ctx.strokeStyle=c.warning; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.globalAlpha=pulse;
    ctx.beginPath(); ctx.moveTo(f0x,oy); ctx.lineTo(f0x,oy-ylen*0.18); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;
    _T(ctx,'f₀',f0x,oy+14,{sz:12,fw:'800',col:c.warning,al:'center'});
    _T(ctx,'Z_min',f0x+5,oy-ylen*0.16,{sz:10,fw:'700',col:c.warning});

    [[c.danger,'XL=ωL (rises)'],[c.primary,'XC=1/ωC (falls)'],[c.purple,'Z (U-shape)']].forEach(([col,lbl],i)=>{
      ctx.fillStyle=col; ctx.fillRect(ox+2,oy-ylen+2+i*14,18,3);
      _T(ctx,lbl,ox+24,oy-ylen+3+i*14,{sz:9,fw:'600',col:c.label});
    });

    _title(ctx,`Resonance: f₀=1/(2π√LC)  |  Q=${Q.toFixed(1)}  |  BW=f₀/Q`,w,c);
    _note(ctx,'At f₀: XL=XC, Z is minimum  |  Q=ωL/R=1/(ωCR)',w,h,c);
    t++;
    _vf['res']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 5. DIODE I-V
// ══════════════════════════════════════════════════════════
function vizDiodeIV(canvas, params={}) {
  stopViz('div');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    // oy=56%: graph top = oy-ylen = 0.56h-0.38h = 0.18h = 43px — below title zone
    const ox=w*0.44, oy=h*0.56;
    const xlen=w*0.5, ylen=h*0.38, xneg=w*0.38;

    _arrow(ctx,ox-xneg,oy,ox+xlen,oy,c.label);
    _arrow(ctx,ox,oy+ylen*0.3,ox,oy-ylen,c.label);
    _T(ctx,'V →',ox+xlen+4,oy,{sz:10,fw:'700',col:c.label});
    _T(ctx,'I',ox+2,oy-ylen-4,{sz:10,fw:'700',col:c.label});
    _T(ctx,'0',ox-8,oy,{sz:10,fw:'700',col:c.label,al:'right'});

    // Threshold
    const vthX=ox+xlen*0.4;
    ctx.strokeStyle=c.warning+'99'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(vthX,oy); ctx.lineTo(vthX,oy-ylen*0.85); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'0.7V',vthX,oy+15,{sz:10,fw:'700',col:c.warning,al:'center'});

    // -I₀ line
    ctx.strokeStyle=c.danger; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(ox-xneg+4,oy+ylen*0.07); ctx.lineTo(ox,oy+ylen*0.07); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'−I₀',ox-xneg+6,oy+ylen*0.07,{sz:9,fw:'600',col:c.danger});

    // Breakdown
    const brkX=ox-xneg+xneg*0.25;
    ctx.strokeStyle=c.danger; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(brkX+2,oy+ylen*0.07); ctx.lineTo(brkX,oy+ylen*0.07); ctx.lineTo(brkX,oy+ylen*0.26); ctx.stroke();
    _T(ctx,'Breakdown',brkX-4,oy+ylen*0.2,{sz:9,fw:'600',col:c.danger,al:'right'});

    // Animated forward curve
    const progress=Math.min(t/100,1);
    ctx.strokeStyle=c.success; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=100;i++){
      const frac=i/100;
      if(frac>progress) break;
      const iNorm=Math.min(Math.exp(frac*6.5-4.5)-Math.exp(-4.5),1);
      const px=ox+frac*xlen, py=oy-iNorm*ylen*0.88;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    _T(ctx,'Reverse Bias',ox-xneg*0.5,oy-20,{sz:10,fw:'700',col:c.danger,al:'center'});
    _T(ctx,'Forward ON',ox+vthX*0.25+10,oy-ylen*0.5,{sz:10,fw:'700',col:c.success});

    if(progress>0.4){
      ctx.fillStyle=c.warning; ctx.beginPath(); ctx.arc(vthX,oy,5,0,Math.PI*2); ctx.fill();
      _T(ctx,'Cut-in',vthX+8,oy-18,{sz:9,fw:'700',col:c.warning});
    }

    _title(ctx,'Diode I-V: I = I₀(e^(V/VT)−1)  |  VT=26mV @ 300K',w,c);
    _note(ctx,'Silicon: 0.7V threshold  |  Germanium: 0.3V  |  Zener: reverse breakdown',w,h,c);
    if(t<200)t++;
    _vf['div']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 6. RECTIFIER WAVEFORMS
// ══════════════════════════════════════════════════════════
function vizRectifier(canvas, params={}) {
  stopViz('rect');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    // Rows positioned below title zone (>32px from top)
    const rows=[
      {label:'Input AC',oy:72, fn:(x)=>Math.sin(x),           col:c.muted},
      {label:'HWR Out', oy:138,fn:(x)=>Math.max(0,Math.sin(x)),col:c.warning},
      {label:'FWR Out', oy:204,fn:(x)=>Math.abs(Math.sin(x)), col:c.success},
    ];
    const cycles=2.5, ox=65, xlen=w-ox-16, amp=26;

    rows.forEach(({label,oy,fn,col})=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,fw:'700',col,al:'right'});

      ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.beginPath();
      for(let i=0;i<=200;i++){
        const phase=(i/200)*cycles*2*Math.PI+t*0.025, y=fn(phase)*amp;
        const px=ox+i*(xlen/200), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();

      ctx.save(); ctx.globalAlpha=0.1; ctx.fillStyle=col; ctx.beginPath();
      for(let i=0;i<=200;i++){
        const phase=(i/200)*cycles*2*Math.PI+t*0.025, y=fn(phase)*amp;
        const px=ox+i*(xlen/200), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.lineTo(ox+xlen,oy); ctx.lineTo(ox,oy); ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    _T(ctx,'PIV=Vm',w-10,138,{sz:9,fw:'600',col:c.warning,al:'right'});
    _T(ctx,'PIV=2Vm (CT)',w-10,204,{sz:9,fw:'600',col:c.success,al:'right'});

    _title(ctx,'Rectifier: HWR (γ=1.21, η=40.6%)  vs  FWR (γ=0.48, η=81.2%)',w,c);
    _note(ctx,'Ripple factor γ = Vrms(ac)/Vdc  |  Efficiency η = Pdc/Pac',w,h,c);
    t++;
    _vf['rect']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7. OP-AMP — params: {rf, rin}
// ══════════════════════════════════════════════════════════
function vizOpAmp(canvas, params={}) {
  stopViz('oa');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const rf=parseFloat(params.rf||100);
  const rin=parseFloat(params.rin||10);

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const invG=(-(rf/rin)).toFixed(1);
    const nonInvG=(1+rf/rin).toFixed(1);

    const cx=w/2, cy=h/2;
    ctx.strokeStyle=c.teal; ctx.lineWidth=2; ctx.fillStyle=c.teal+'18';
    ctx.beginPath();
    ctx.moveTo(cx-36,cy-32); ctx.lineTo(cx-36,cy+32); ctx.lineTo(cx+36,cy); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle=c.danger; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-85,cy-16); ctx.lineTo(cx-36,cy-16); ctx.stroke();
    _T(ctx,'−',cx-33,cy-16,{sz:14,fw:'700',col:c.danger});
    _T(ctx,'V−',cx-95,cy-16,{sz:11,fw:'700',col:c.danger,al:'right'});

    ctx.strokeStyle=c.success; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-85,cy+16); ctx.lineTo(cx-36,cy+16); ctx.stroke();
    _T(ctx,'+',cx-33,cy+20,{sz:14,fw:'700',col:c.success});
    _T(ctx,'V+',cx-95,cy+16,{sz:11,fw:'700',col:c.success,al:'right'});

    ctx.strokeStyle=c.primary; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx+36,cy); ctx.lineTo(cx+85,cy); ctx.stroke();
    _T(ctx,'Vout',cx+87,cy,{sz:11,fw:'700',col:c.primary});

    ctx.strokeStyle=c.warning; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
    ctx.beginPath();
    ctx.moveTo(cx+80,cy); ctx.lineTo(cx+80,cy-58); ctx.lineTo(cx-78,cy-58); ctx.lineTo(cx-78,cy-16);
    ctx.stroke(); ctx.setLineDash([]);
    _T(ctx,`Rf=${rf}kΩ`,cx,cy-64,{sz:11,fw:'700',col:c.warning,al:'center'});

    ctx.strokeStyle=c.purple; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-122,cy-16); ctx.lineTo(cx-85,cy-16); ctx.stroke();
    _T(ctx,`Rin=${rin}kΩ`,cx-103,cy-28,{sz:10,fw:'700',col:c.purple,al:'center'});

    ctx.fillStyle=c.warning+'30'; ctx.strokeStyle=c.warning; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(cx-75,cy-28,30,18,4):ctx.rect(cx-75,cy-28,30,18);
    ctx.fill(); ctx.stroke();
    _T(ctx,'≈0V',cx-60,cy-18,{sz:9,fw:'700',col:c.warning,al:'center'});

    // Signal comparison
    const sy=h-46, sx=20, slen=w-40;
    const iAmp=16, oAmp=Math.min(Math.abs(parseFloat(invG))*iAmp,36);
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const angle=(i/200)*2*Math.PI*2+t*0.04;
      i===0?ctx.moveTo(sx+i*(slen/200),sy-Math.sin(angle)*iAmp):ctx.lineTo(sx+i*(slen/200),sy-Math.sin(angle)*iAmp);
    }
    ctx.strokeStyle=c.muted; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath();
    for(let i=0;i<=200;i++){
      const angle=(i/200)*2*Math.PI*2+t*0.04;
      i===0?ctx.moveTo(sx+i*(slen/200),sy-Math.sin(angle+Math.PI)*oAmp):ctx.lineTo(sx+i*(slen/200),sy-Math.sin(angle+Math.PI)*oAmp);
    }
    ctx.strokeStyle=c.primary; ctx.lineWidth=2; ctx.stroke();
    _T(ctx,'Vin',sx+2,sy+10,{sz:8,fw:'600',col:c.muted});
    _T(ctx,`Vout×${Math.abs(invG)}`,sx+42,sy+10,{sz:8,fw:'600',col:c.primary});

    _title(ctx,`Op-Amp | Av(inv)=−Rf/Rin=${invG}  |  Av(non-inv)=1+Rf/Rin=${nonInvG}`,w,c);
    _note(ctx,'Virtual ground at − input  |  CMRR=20·log(Ad/Ac)  |  Slew Rate=ΔVo/Δt',w,h,c);
    t++;
    _vf['oa']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 8. FOURIER SERIES
// ══════════════════════════════════════════════════════════
function vizFourier(canvas, params={}) {
  stopViz('fs');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const step=Math.floor(t/100)%5;
    const harmonics=params.n?parseInt(params.n):(1+step*2);
    const oy=h*0.53, ox=20, xlen=w-40, amp=h*0.2;

    ctx.strokeStyle=c.border; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();

    for(let n=1;n<=harmonics;n+=2){
      const hcol=[c.primary,c.danger,c.warning,c.purple,c.teal][(n-1)/2];
      ctx.strokeStyle=hcol+'55'; ctx.lineWidth=1; ctx.beginPath();
      for(let i=0;i<=200;i++){
        const x=(i/200)*2*Math.PI*2, y=(4/Math.PI)*(1/n)*Math.sin(n*(x+t*0.03))*amp;
        const px=ox+i*(xlen/200), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
    }

    ctx.strokeStyle=c.success; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=300;i++){
      const x=(i/300)*2*Math.PI*2;
      let y=0;
      for(let n=1;n<=harmonics;n+=2) y+=(4/Math.PI)*(1/n)*Math.sin(n*(x+t*0.03));
      const px=ox+i*(xlen/300), py=oy-y*amp;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Ideal square wave
    ctx.strokeStyle=c.border; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath();
    [[0,1],[Math.PI*2,-1],[Math.PI*4,1]].forEach(([start,sign],si)=>{
      const p1=ox+(start/(4*Math.PI))*xlen, p2=ox+((start+Math.PI*2)/(4*Math.PI))*xlen;
      si===0?ctx.moveTo(p1,oy-sign*amp):ctx.moveTo(p1,oy-sign*amp);
      ctx.lineTo(Math.min(p2,ox+xlen),oy-sign*amp);
    });
    ctx.stroke(); ctx.setLineDash([]);

    // Harmonic buttons
    [1,3,5,7,9].forEach((hn,i)=>{
      const bx=w/2-80+i*40,by=h-50,active=hn<=harmonics;  // above note zone (h-22)
      const col=[c.primary,c.danger,c.warning,c.purple,c.teal][i];
      ctx.fillStyle=active?col:c.border; ctx.strokeStyle=col; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,30,18,4):ctx.rect(bx,by,30,18);
      ctx.fill(); ctx.stroke();
      _T(ctx,`n=${hn}`,bx+15,by+9,{sz:9,fw:'700',col:active?'white':c.label,al:'center'});
    });

    _title(ctx,`Fourier Series — Square wave from ${harmonics} odd harmonic${harmonics>1?'s':''}`,w,c);
    _note(ctx,'f(t)=4/π·[sin(t)+sin(3t)/3+sin(5t)/5+…]  |  More harmonics → sharper edges',w,h,c);
    t++;
    _vf['fs']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 9. NYQUIST SAMPLING
// ══════════════════════════════════════════════════════════
function vizSampling(canvas, params={}) {
  stopViz('smp');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const rows=[
      {label:'Oversampled\nfs>>2fm', oy:h*0.26, fs:12,fm:2,col:c.success},
      {label:'Nyquist\nfs=2fm',      oy:h*0.50, fs:4, fm:2,col:c.warning},
      {label:'Aliased\nfs<2fm',      oy:h*0.74, fs:2, fm:2,col:c.danger},
    ];
    const ox=22, xlen=w-40;

    rows.forEach(({label,oy,fs,fm,col})=>{
      const amp=22;
      ctx.strokeStyle=col+'66'; ctx.lineWidth=1.5; ctx.beginPath();
      for(let i=0;i<=200;i++){
        const x=i/200*8*Math.PI, y=Math.sin(fm*x+t*0.02)*amp;
        const px=ox+i*(xlen/200), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();

      const period=200/fs, samples=[];
      for(let s=0;s*period<=200;s++){
        const i=s*period, x=i/200*8*Math.PI;
        const y=Math.sin(fm*x+t*0.02)*amp;
        samples.push({px:ox+i*(xlen/200),py:oy-y});
      }
      samples.forEach(({px,py})=>{
        ctx.fillStyle=col; ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=col+'66'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(px,oy); ctx.lineTo(px,py); ctx.stroke();
      });
      if(samples.length>2){
        ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath();
        samples.forEach(({px,py},i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));
        ctx.stroke();
      }
      _T(ctx,label,ox-4,oy,{sz:8,fw:'700',col,al:'right'});
      _T(ctx,`fs=${fs}fm`,ox+xlen-2,oy,{sz:8,fw:'700',col,al:'right'});
    });

    _title(ctx,'Nyquist Sampling: fs ≥ 2·fmax — below this causes ALIASING',w,c);
    _note(ctx,'Only fs ≥ 2fmax correctly reconstructs the original signal',w,h,c);
    t++;
    _vf['smp']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10. STEP RESPONSE — params: {xi}
// ══════════════════════════════════════════════════════════
function vizStepResponse(canvas, params={}) {
  stopViz('sr');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const xiFixed=params.xi!==undefined?parseFloat(params.xi):null;

  function stepResp(tau,xi) {
    if(xi>=1){const d=Math.sqrt(xi*xi-1);return 1-Math.exp(-xi*tau)*(Math.cosh(tau*d)+xi/d*Math.sinh(tau*d));}
    const wd=Math.sqrt(1-xi*xi);
    return 1-Math.exp(-xi*tau)*(Math.cos(wd*tau)+xi/wd*Math.sin(wd*tau));
  }

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const xi=xiFixed!==null?xiFixed:(0.1+Math.abs(Math.sin(t*0.008))*2);
    const lbl=xi<0.5?'Underdamped':xi<1?'Under-damped':xi===1?'Critically Damped':'Over-damped';

    const {ox,oy,ylen}=_layout(h);
    const xlen=w-ox-18;
    _axes(ctx,ox,oy,xlen,ylen,c,'Time →','c(t)');

    // Steady state line
    ctx.strokeStyle=c.success+'66'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(ox,oy-ylen*0.82); ctx.lineTo(ox+xlen,oy-ylen*0.82); ctx.stroke();
    ctx.setLineDash([]);
    _T(ctx,'1.0',ox-4,oy-ylen*0.82,{sz:10,fw:'700',col:c.success,al:'right'});

    // Reference curves (faint)
    [[0.2,c.orange+'33'],[1.0,c.teal+'33'],[2.0,c.purple+'33']].forEach(([xiFaint,col])=>{
      ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath();
      for(let i=0;i<=200;i++){
        const tau=i/200*10, y=stepResp(tau,xiFaint);
        const px=ox+i*(xlen/200), py=oy-Math.min(Math.max(y,0),1.5)*ylen*0.82;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
    });

    const curCol=xi<0.5?c.danger:xi<0.99?c.warning:xi===1?c.teal:c.primary;
    ctx.strokeStyle=curCol; ctx.lineWidth=3; ctx.beginPath();
    let maxY=0,maxTau=0;
    for(let i=0;i<=200;i++){
      const tau=i/200*10,y=stepResp(tau,xi);
      if(y>maxY&&i>5){maxY=y;maxTau=tau;}
      const px=ox+i*(xlen/200),py=oy-Math.min(Math.max(y,0),1.5)*ylen*0.82;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    if(xi<1&&maxY>1.01){
      const mpx=ox+maxTau*(xlen/10),mpy=oy-Math.min(maxY,1.5)*ylen*0.82;
      ctx.strokeStyle=c.danger+'aa'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(mpx,oy-ylen*0.82); ctx.lineTo(mpx,mpy); ctx.stroke();
      ctx.setLineDash([]);
      _T(ctx,`Mp≈${((maxY-1)*100).toFixed(1)}%`,mpx+4,mpy-4,{sz:9,fw:'700',col:c.danger});
    }

    [[c.orange+'66','ξ=0.2 underdamped'],[c.teal+'66','ξ=1.0 critical'],[c.purple+'66','ξ=2.0 overdamped']].forEach(([col,lbl2],i)=>{
      ctx.fillStyle=col; ctx.fillRect(ox+2,oy-ylen+2+i*14,16,3);
      _T(ctx,lbl2,ox+22,oy-ylen+3+i*14,{sz:9,fw:'500',col:c.label});
    });
    _T(ctx,`ξ=${xi.toFixed(2)} — ${lbl}`,ox,oy+15,{sz:10,fw:'700',col:curCol}); // below x-axis, above note zone

    _title(ctx,`Step Response: ξ=${xi.toFixed(2)} (${lbl})  |  ts≈4/(ξωn)`,w,c);
    _note(ctx,'Mp = e^(−πξ/√(1−ξ²)) × 100%  |  Underdamped: oscillates, Overdamped: slow',w,h,c);
    t++;
    _vf['sr']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 11. AM MODULATION — params: {m}
// ══════════════════════════════════════════════════════════
function vizAMModulation(canvas, params={}) {
  stopViz('am');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const mFixed=params.m!==undefined?parseFloat(params.m):null;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const m=mFixed!==null?mFixed:(0.5+0.5*Math.sin(t*0.015));
    const eff=((m*m/2)/(1+m*m/2)*100).toFixed(1);

    // AM amp=16: at m=1, max excursion = (1+1)*16=32, bottom = 182+32=214 — just above note zone
    const AMP=16;
    const rows=[
      {label:'Message m(t)',oy:62,  fn:(x)=>Math.sin(x)*20,                          col:c.success},
      {label:'Carrier c(t)',oy:128, fn:(x)=>Math.sin(x*8)*20,                         col:c.primary},
      {label:'AM Signal',   oy:182, fn:(x)=>(1+m*Math.sin(x))*Math.sin(x*8)*AMP,    col:c.orange},
    ];
    const ox=82, xlen=w-ox-12;

    rows.forEach(({label,oy,fn,col})=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,fw:'700',col,al:'right'});
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath();
      for(let i=0;i<=250;i++){
        const x=(i/250)*4*Math.PI+t*0.02, y=fn(x);
        const px=ox+i*(xlen/250), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
      if(label==='AM Signal'){
        ctx.strokeStyle=c.warning; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
        [[1],[-1]].forEach(([sign])=>{
          ctx.beginPath();
          for(let i=0;i<=250;i++){
            const x=(i/250)*4*Math.PI+t*0.02;
            const px=ox+i*(xlen/250), py=oy-(1+m*Math.sin(x))*AMP*sign;
            i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }
    });

    _title(ctx,`AM: m=Am/Ac=${m.toFixed(2)}  |  BW=2fm  |  Pt=Pc(1+m²/2)  |  η=${eff}%`,w,c);
    _note(ctx,'m<1: normal | m=1: ideal | m>1: overmodulation (distortion)  |  At m=1: η=33.3%',w,h,c);
    t++;
    _vf['am']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 12. FM MODULATION — params: {beta}
// ══════════════════════════════════════════════════════════
function vizFMModulation(canvas, params={}) {
  stopViz('fm');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const betaFixed=params.beta!==undefined?parseFloat(params.beta):null;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const beta=betaFixed!==null?betaFixed:(1+2*Math.abs(Math.sin(t*0.01)));
    const bw=(2*(beta+1)).toFixed(1);

    const rows=[
      {label:'Message m(t)',oy:80,  col:c.success,fn:(x)=>Math.sin(x)*28},
      {label:'FM Signal',   oy:175, col:c.teal,   fn:(x)=>Math.sin(x*6+beta*Math.sin(x))*32},
    ];
    const ox=82, xlen=w-ox-12;

    rows.forEach(({label,oy,col,fn})=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,fw:'700',col,al:'right'});
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath();
      for(let i=0;i<=300;i++){
        const x=(i/300)*3*Math.PI+t*0.02, y=fn(x);
        const px=ox+i*(xlen/300), py=oy-y;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
    });

    _T(ctx,`← Carson BW = 2(β+1)·fm = ${bw}·fm →`,w/2,h-30,{sz:11,fw:'700',col:c.warning,al:'center'});

    _title(ctx,`FM: β=Δf/fm=${beta.toFixed(2)}  |  Carson BW=2(Δf+fm)=${bw}·fm`,w,c);
    _note(ctx,'FM noise immunity > AM for β>1  |  SNR gain ≈ 3β²(β+1)',w,h,c);
    t++;
    _vf['fm']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 13. SHANNON CAPACITY — params: {maxSNR, B}
// ══════════════════════════════════════════════════════════
function vizShannon(canvas, params={}) {
  stopViz('sh');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const maxSNR=parseFloat(params.maxSNR||35);
  const B=parseFloat(params.B||1);

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const {ox,oy,ylen}=_layout(h);
    const xlen=w-ox-15;
    const maxCap=Math.log2(1+maxSNR);

    _axes(ctx,ox,oy,xlen,ylen,c,'SNR →','C/B');

    // Shannon curve
    ctx.strokeStyle=c.primary; ctx.lineWidth=3; ctx.beginPath();
    for(let i=0;i<=200;i++){
      const snr=i/200*maxSNR, cap=Math.log2(1+snr);
      const px=ox+i*(xlen/200), py=oy-cap*(ylen/maxCap)*0.92;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Grid lines
    const yTicks=Math.floor(maxCap);
    for(let v=1;v<=yTicks;v++){
      const py=oy-v*(ylen/maxCap)*0.92;
      if(py>oy-ylen){
        ctx.strokeStyle=c.grid; ctx.lineWidth=1; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(ox,py); ctx.lineTo(ox+xlen,py); ctx.stroke();
        ctx.setLineDash([]);
        _T(ctx,String(v),ox-4,py,{sz:10,fw:'700',col:c.label,al:'right'});
      }
    }
    const xStep=maxSNR<=20?5:maxSNR<=50?10:20;
    for(let v=xStep;v<=maxSNR;v+=xStep){
      _T(ctx,String(v),ox+v*(xlen/maxSNR),oy+14,{sz:9,fw:'700',col:c.label,al:'center'});
    }

    // Animated cursor
    const snrCur=Math.abs(Math.sin(t*0.008))*maxSNR;
    const capCur=Math.log2(1+snrCur);
    const curX=ox+snrCur*(xlen/maxSNR);
    const curY=oy-capCur*(ylen/maxCap)*0.92;

    ctx.strokeStyle=c.warning+'99'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(curX,oy); ctx.lineTo(curX,curY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox,curY); ctx.lineTo(curX,curY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowColor=c.warning; ctx.shadowBlur=10;
    ctx.fillStyle=c.warning; ctx.beginPath(); ctx.arc(curX,curY,6,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(curX,curY,3,0,Math.PI*2); ctx.fill();

    // Value labels — switch side if near right edge
    const lx=curX>ox+xlen*0.65?curX-90:curX+8;
    // Background box for labels
    ctx.fillStyle=c.card+'dd';
    ctx.fillRect(lx-2,curY-28,92,32);
    _T(ctx,`SNR = ${snrCur.toFixed(1)}`,lx+2,curY-18,{sz:10,fw:'700',col:c.warning});
    _T(ctx,`C = ${(capCur*B).toFixed(2)} Mbps`,lx+2,curY-4,{sz:10,fw:'700',col:c.primary});

    _title(ctx,`Shannon: C=B·log₂(1+SNR)  |  B=${B}MHz  |  Max C=${(B*maxCap).toFixed(2)}Mbps`,w,c);
    _note(ctx,'Increasing SNR has diminishing returns — doubling B doubles C linearly',w,h,c);
    t++;
    _vf['sh']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 14. BODE PLOT
// ══════════════════════════════════════════════════════════
function vizBodePlot(canvas, params={}) {
  stopViz('bp');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    // phOy=182 keeps phase curve bottom (182+180*0.13=205) well above note zone (h-22=218)
    const magOy=88, phOy=182;
    const SC=0.13; // phase vertical scale — chosen so 180° maps to only 23px
    const ox=52, xlen=w-ox-15;

    // Magnitude sub-plot
    _T(ctx,'Magnitude (dB)',ox+2,magOy-48,{sz:10,fw:'700',col:c.label});
    _arrow(ctx,ox,magOy,ox+xlen,magOy,c.label);
    _arrow(ctx,ox,magOy+36,ox,magOy-48,c.label);
    _T(ctx,'0dB',ox-4,magOy,{sz:9,fw:'700',col:c.label,al:'right'});

    const wcPct=0.55;
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=200;i++){
      const f=i/200;
      let mag;
      if(f<0.2) mag=38;
      else if(f<wcPct) mag=38-76*(f-0.2)/(wcPct-0.2);
      else mag=-76*(f-wcPct)/(1-wcPct)-14*(1-wcPct);
      const px=ox+i*(xlen/200),py=magOy-Math.min(Math.max(mag,-65),55)*0.58;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    const gcfX=ox+wcPct*xlen;
    ctx.strokeStyle=c.warning+'aa'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(gcfX,magOy-48); ctx.lineTo(gcfX,magOy); ctx.stroke(); ctx.setLineDash([]);
    _T(ctx,'ωgc',gcfX,magOy+12,{sz:9,fw:'700',col:c.warning,al:'center'});

    // Phase sub-plot — carefully scaled to stay within canvas
    _T(ctx,'Phase (°)',ox+2,phOy-38,{sz:10,fw:'700',col:c.label});
    _arrow(ctx,ox,phOy,ox+xlen,phOy,c.label);
    _arrow(ctx,ox,phOy+22,ox,phOy-38,c.label);
    _T(ctx,'-180°',ox-4,phOy+22,{sz:9,fw:'700',col:c.danger,al:'right'});
    _T(ctx,'0°',ox-4,phOy,{sz:9,fw:'700',col:c.label,al:'right'});

    ctx.strokeStyle=c.teal; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=200;i++){
      const f=i/200,ph=-f*220;
      const px=ox+i*(xlen/200),py=phOy-Math.min(Math.max(ph,-180),0)*SC;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    const ph180y=phOy+180*SC; // = 182+23.4 = 205 — well above note zone
    ctx.strokeStyle=c.danger+'66'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(ox,ph180y); ctx.lineTo(ox+xlen,ph180y); ctx.stroke(); ctx.setLineDash([]);

    const pcPct=0.42, pcfX=ox+pcPct*xlen;
    ctx.strokeStyle=c.danger+'aa'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(pcfX,phOy-38); ctx.lineTo(pcfX,ph180y); ctx.stroke(); ctx.setLineDash([]);
    _T(ctx,'ωpc',pcfX,phOy+12,{sz:9,fw:'700',col:c.danger,al:'center'});

    const phAtGcf=phOy+wcPct*0.55*220*SC;
    _arrow(ctx,gcfX+10,phAtGcf,gcfX+10,ph180y,c.success);
    _arrow(ctx,gcfX+10,ph180y,gcfX+10,phAtGcf,c.success);
    _T(ctx,'PM',gcfX+14,phAtGcf+10,{sz:10,fw:'800',col:c.success});

    const magAtPcf=magOy-(-76*(pcPct-0.2)/(wcPct-0.2)+28)*0.6;
    _arrow(ctx,pcfX+10,magAtPcf,pcfX+10,magOy,c.orange);
    _arrow(ctx,pcfX+10,magOy,pcfX+10,magAtPcf,c.orange);
    _T(ctx,'GM',pcfX+14,magAtPcf+10,{sz:10,fw:'800',col:c.orange});

    _title(ctx,'Bode Plot: GM=1/|G(jωpc)|   PM=180°+∠G(jωgc)',w,c);
    _note(ctx,'Stable: GM>0dB & PM>0°  |  Ideal PM=30°–60°  |  ωgc < ωpc for stability',w,h,c);
    t++;
    _vf['bp']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 15. THEVENIN THEOREM
// ══════════════════════════════════════════════════════════
function vizThevenin(canvas, params={}) {
  stopViz('th');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function drawZigzag(ctx,x1,y1,x2,y2,col,label) {
    ctx.strokeStyle=col; ctx.lineWidth=2;
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),n=5,zig=7;
    ctx.beginPath(); ctx.moveTo(x1,y1);
    for(let i=0;i<=n;i++){
      const tt=i/n,ox=-dy/len*zig*(i%2===0?1:-1),oy=dx/len*zig*(i%2===0?1:-1);
      ctx.lineTo(x1+tt*dx+ox,y1+tt*dy+oy);
    }
    ctx.lineTo(x2,y2); ctx.stroke();
    if(label) _T(ctx,label,(x1+x2)/2,(y1+y2)/2-10,{sz:10,fw:'700',col,al:'center'});
  }

  function drawOrig(ctx,x1,y1,x2,y2,c) {
    const cx=(x1+x2)/2,cy=(y1+y2)/2;
    ctx.strokeStyle=c.muted; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x1+20,y1+20); ctx.lineTo(x1+20,y2-20); ctx.stroke();
    _T(ctx,'V₁',x1+8,cy,{sz:11,fw:'700',col:c.primary,al:'right'});
    drawZigzag(ctx,x1+20,y1+20,x2-20,y1+20,c.muted,'R₁');
    drawZigzag(ctx,x2-20,y1+20,x2-20,y2-20,c.muted,'R₂');
    drawZigzag(ctx,x1+20,y2-20,x2-20,y2-20,c.muted,'R₃');
    _T(ctx,'Complex\nCircuit',cx,cy,{sz:11,fw:'600',col:c.label,al:'center'});
    ctx.fillStyle=c.danger;
    ctx.beginPath(); ctx.arc(x2-20,y1+20,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x2-20,y2-20,4,0,Math.PI*2); ctx.fill();
    _T(ctx,'A',x2-12,y1+22,{sz:11,fw:'700',col:c.danger});
    _T(ctx,'B',x2-12,y2-18,{sz:11,fw:'700',col:c.danger});
  }

  function drawThev(ctx,x1,y1,x2,y2,c) {
    const cx=(x1+x2)/2,cy=(y1+y2)/2,batX=x1+20;
    ctx.strokeStyle=c.primary; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(batX,y1+20); ctx.lineTo(batX,y2-20); ctx.stroke();
    [[cy-15,'+'],[cy+15,'−']].forEach(([y,lbl])=>{
      ctx.beginPath(); ctx.moveTo(batX-8,y); ctx.lineTo(batX+8,y); ctx.stroke();
      if(lbl==='+'){ctx.beginPath(); ctx.moveTo(batX,y-8); ctx.lineTo(batX,y+8); ctx.stroke();}
    });
    _T(ctx,'Vth',batX-10,cy,{sz:12,fw:'700',col:c.primary,al:'right'});
    drawZigzag(ctx,batX,y1+20,x2-20,y1+20,c.warning,'Rth');
    ctx.strokeStyle=c.muted; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x2-20,y1+20); ctx.lineTo(x2-20,y2-20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(batX,y2-20); ctx.lineTo(x2-20,y2-20); ctx.stroke();
    ctx.fillStyle=c.success;
    ctx.beginPath(); ctx.arc(x2-20,y1+20,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x2-20,y2-20,5,0,Math.PI*2); ctx.fill();
    _T(ctx,'A',x2-10,y1+22,{sz:11,fw:'700',col:c.success});
    _T(ctx,'B',x2-10,y2-18,{sz:11,fw:'700',col:c.success});
    _T(ctx,'Thevenin\nEquivalent',cx,cy+14,{sz:11,fw:'700',col:c.success,al:'center'});
  }

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const alpha=Math.min(t/80,1),mid=w/2;
    ctx.save(); ctx.globalAlpha=(1-alpha*0.5);
    drawOrig(ctx,48,38,mid-55,h-30,c);
    ctx.restore();
    if(alpha>0.3){
      ctx.globalAlpha=Math.min((alpha-0.3)/0.3,1);
      _T(ctx,'⟹',mid-18,h/2,{sz:26,col:c.warning,al:'center'});
      ctx.globalAlpha=1;
    }
    if(alpha>0.5){
      ctx.globalAlpha=Math.min((alpha-0.5)/0.5,1);
      drawThev(ctx,mid+26,38,w-16,h-30,c);
      ctx.globalAlpha=1;
    }

    const step=alpha<0.3?'Step 1: Open terminals A,B — find Vth=Voc':alpha<0.6?'Step 2: Kill sources, find Rth':'Simplified! Any RL sees only Vth+Rth';
    _T(ctx,step,w/2,h-28,{sz:10,fw:'600',col:alpha>=0.5?c.success:c.label,al:'center',mw:w-20});

    _title(ctx,"Thevenin's Theorem: Any linear circuit → Vth + Rth series equivalent",w,c);
    _note(ctx,'Norton: IN=Vth/Rth, RN=Rth | Kill V-source=short, I-source=open',w,h,c);

    if(t<200){t+=2;_vf['th']=requestAnimationFrame(draw);}
    else{setTimeout(()=>{t=0;_vf['th']=requestAnimationFrame(draw);},2000);}
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 16. SI vs CI — params: {P, R, T}
// ══════════════════════════════════════════════════════════
function vizInterest(canvas, params={}) {
  stopViz('int');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const P=parseFloat(params.P||1000);
  const R=parseFloat(params.R||15);
  const T=parseFloat(params.T||10);

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const {ox,oy,ylen}=_layout(h);
    const xlen=w-ox-15;
    const maxV=P*Math.pow(1+R/100,T), range=maxV-P||1;
    _axes(ctx,ox,oy,xlen,ylen,c,'Years →','Amount ₹');

    const progress=Math.min(t/120,1);

    // SI curve
    ctx.strokeStyle=c.primary; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=200;i++){
      if(i/200>progress) break;
      const yr=i/200*T,si=P*(1+R*yr/100);
      const px=ox+i*(xlen/200),py=oy-((si-P)/range)*ylen*0.9;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // CI curve
    ctx.strokeStyle=c.success; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=0;i<=200;i++){
      if(i/200>progress) break;
      const yr=i/200*T,ci=P*Math.pow(1+R/100,yr);
      const px=ox+i*(xlen/200),py=oy-((ci-P)/range)*ylen*0.9;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();

    // Year ticks
    const yStep=T<=10?2:T<=20?5:10;
    for(let y=0;y<=T;y+=yStep){
      _T(ctx,String(y),ox+y*(xlen/T),oy+14,{sz:10,fw:'700',col:c.label,al:'center'});
    }

    // Legends — placed INSIDE graph area (below graph top, never in title zone)
    const gt=oy-ylen; // graph top y position
    ctx.fillStyle=c.primary; ctx.fillRect(ox+2,gt+8,18,3);
    _T(ctx,'Simple Interest (linear)',ox+24,gt+9,{sz:9,fw:'600',col:c.primary});
    ctx.fillStyle=c.success; ctx.fillRect(ox+2,gt+22,18,3);
    _T(ctx,'Compound Interest (exp)',ox+24,gt+23,{sz:9,fw:'600',col:c.success});

    if(progress>0.92){
      const si10=P*(1+R*T/100),ci10=P*Math.pow(1+R/100,T);
      const siY=oy-((si10-P)/range)*ylen*0.9,ciY=oy-((ci10-P)/range)*ylen*0.9;
      // Right-aligned end labels — stay inside canvas
      _T(ctx,`₹${si10.toFixed(0)}`,ox+xlen-4,siY-10,{sz:10,fw:'700',col:c.primary,al:'right'});
      _T(ctx,`₹${ci10.toFixed(0)}`,ox+xlen-4,ciY-10,{sz:10,fw:'700',col:c.success,al:'right'});
      // CI-SI inside graph, above x-axis (not in note zone)
      _T(ctx,`CI−SI = ₹${(ci10-si10).toFixed(0)} more!`,w/2,oy-12,{sz:11,fw:'700',col:c.warning,al:'center'});
    }

    _title(ctx,`P=₹${P} | R=${R}% | T=${T}yr  |  SI=P·R·T/100  |  CI=P(1+R/100)^T`,w,c);
    _note(ctx,`CI−SI (2yr) = P×(R/100)²  |  Effective rate = (1+R/n)^n − 1`,w,h,c);
    t++;
    _vf['int']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 17. BJT — params: {beta}
// ══════════════════════════════════════════════════════════
function vizBJT(canvas, params={}) {
  stopViz('bjt');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const beta=parseFloat(params.beta||100);

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const cx=w/2, cy=h/2+6;
    const IB=10+10*Math.sin(t*0.02);
    const IC=beta*IB, IE=IC+IB;

    ctx.strokeStyle=c.teal; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(cx-58,cy); ctx.lineTo(cx-18,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-18,cy-34); ctx.lineTo(cx-18,cy+34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-18,cy-18); ctx.lineTo(cx+30,cy-58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+30,cy-58); ctx.lineTo(cx+30,cy-78); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-18,cy+18); ctx.lineTo(cx+30,cy+58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+30,cy+58); ctx.lineTo(cx+30,cy+78); ctx.stroke();
    _arrow(ctx,cx+4,cy+36,cx+17,cy+49,c.teal,2);

    _T(ctx,'B',cx-70,cy,{sz:14,fw:'800',col:c.primary,al:'center'});
    _T(ctx,'C',cx+30,cy-82,{sz:14,fw:'800',col:c.danger,al:'center'});
    _T(ctx,'E',cx+30,cy+82,{sz:14,fw:'800',col:c.success,al:'center'});

    const norm=IB/20;
    _arrow(ctx,cx-78,cy,cx-58,cy,c.primary,1+norm);
    _arrow(ctx,cx+30,cy-78,cx+30,cy-58,c.danger,2.5);
    _arrow(ctx,cx+30,cy+58,cx+30,cy+78,c.success,2.5);

    _T(ctx,`IB=${IB.toFixed(1)}μA`,cx-95,cy-14,{sz:11,fw:'700',col:c.primary,al:'right'});
    _T(ctx,`IC=β×IB=${IC.toFixed(0)}μA`,cx+38,cy-60,{sz:11,fw:'700',col:c.danger});
    _T(ctx,`IE=IC+IB=${IE.toFixed(0)}μA`,cx+38,cy+70,{sz:11,fw:'700',col:c.success});

    // β display box
    const bx=24,by=42;
    ctx.fillStyle=c.purple+'22'; ctx.strokeStyle=c.purple; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,88,52,8):ctx.rect(bx,by,88,52);
    ctx.fill(); ctx.stroke();
    _T(ctx,'β (hFE)',bx+44,by+14,{sz:10,fw:'700',col:c.purple,al:'center'});
    _T(ctx,String(beta),bx+44,by+34,{sz:20,fw:'800',col:c.purple,al:'center'});

    _title(ctx,`BJT: IC=β·IB  |  β=${beta}  |  α=β/(1+β)=${(beta/(1+beta)).toFixed(3)}`,w,c);
    _note(ctx,'CE gain Av=−β·RC/RE  |  gm=IC/VT=IC/26mV  |  IE=IC+IB',w,h,c);
    t++;
    _vf['bjt']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 18. CONVOLUTION
// ══════════════════════════════════════════════════════════
function vizConvolution(canvas, params={}) {
  stopViz('conv');
  const {ctx,w,h} = _setup(canvas);
  let t=0;

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const pts=200, ox=32, xlen=w-58;
    const offset=(t%200)/200;
    const xfn=(u)=>(u>=0.2&&u<0.6)?0.85:0;
    const hfn=(u,off)=>(u>=(off-0.3)&&u<off)?0.85:0;

    const rows=[
      {label:'x(τ)',  oy:h*0.28, fn:(u)=>xfn(u),            col:c.primary},
      {label:'h(t−τ)',oy:h*0.52, fn:(u)=>hfn(u,offset+0.3), col:c.orange},
      {label:'y(t)',  oy:h*0.76, fn:(u)=>null,               col:c.success},
    ];

    const yVals=[];
    for(let i=0;i<=pts;i++){
      let sum=0;
      for(let j=0;j<=pts;j++) sum+=xfn(j/pts)*hfn(j/pts,(i/pts)+0.3)/pts;
      yVals.push(sum);
    }
    const maxY=Math.max(...yVals)||1;

    rows.forEach(({label,oy,fn,col},ri)=>{
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+xlen,oy); ctx.stroke();
      _T(ctx,label,ox-4,oy,{sz:10,fw:'700',col,al:'right'});
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath();
      if(ri<2){
        for(let i=0;i<=pts;i++){
          const y=fn(i/pts)*36, px=ox+i*(xlen/pts), py=oy-y;
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
      } else {
        for(let i=0;i<=pts;i++){
          const y=(yVals[i]||0)/maxY*36, px=ox+i*(xlen/pts), py=oy-y;
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
      }
      ctx.stroke();
    });

    // Overlap highlight
    const hStart=Math.max(0.2,offset), hEnd=Math.min(0.6,offset+0.3);
    const topY = h * 0.16;
    const botY = h * 0.79;
    if(hEnd>hStart){
      const px1=ox+hStart*xlen, px2=ox+hEnd*xlen;
      ctx.fillStyle=c.warning+'28'; ctx.fillRect(px1,topY,px2-px1,botY-topY);
      _T(ctx,'overlap',(px1+px2)/2,h*0.35,{sz:9,fw:'700',col:c.warning,al:'center'});
    }

    const curX=ox+(offset+0.15)*xlen;
    ctx.strokeStyle=c.muted+'80'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(curX,topY); ctx.lineTo(curX,botY); ctx.stroke();
    ctx.setLineDash([]);

    _title(ctx,'Convolution: y(t) = x(t)*h(t) = ∫ x(τ)·h(t−τ) dτ',w,c);
    _note(ctx,'Time convolution = Frequency multiplication: Y(ω)=X(ω)·H(ω)',w,h,c);
    t++;
    _vf['conv']=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// VISUALIZATION MAP
// ══════════════════════════════════════════════════════════
const vizMap = {
  'digital': [
    {id:'lg',  title:'Logic Gates (Interactive)', fn:vizLogicGates, desc:'Click A/B to toggle inputs — see AND, OR, NAND, NOR, XOR outputs update live', controls:[]},
    {id:'km',  title:'K-Map Groupings',            fn:vizKMap,       desc:'4-variable K-map — animated SOP groupings with prime implicants highlighted', controls:[]},
    {id:'bjt2',title:'JK Flip-Flop',               fn:vizFlipFlop_JK,desc:'Q(t+1)=J·Q\'+K\'·Q — cycles through Hold/Set/Reset/Toggle states automatically', controls:[]},
  ],
  'network': [
    {id:'rc',  title:'RC Charging Curve',          fn:vizRCCharging, desc:'V(t)=V₀(1−e^(−t/τ)) — 63.2% at t=τ, 99.3% at t=5τ',
      controls:[
        {id:'tau',label:'Time Constant τ', min:0.5,max:5,  step:0.5,val:1, unit:'×RC'},
        {id:'v0', label:'Supply Voltage V₀',min:3,  max:24, step:1,  val:12,unit:'V'},
      ]},
    {id:'res', title:'Resonance Frequency',         fn:vizResonance,  desc:'XL, XC, Z vs Frequency — at f₀: XL=XC, Z is minimum',
      controls:[
        {id:'Q',label:'Quality Factor Q', min:1,max:50,step:1,val:10,unit:''},
      ]},
    {id:'th',  title:"Thevenin's Theorem",          fn:vizThevenin,   desc:'Any linear circuit → Vth+Rth equivalent — animated transformation', controls:[]},
  ],
  'analog': [
    {id:'div', title:'Diode I-V Curve',             fn:vizDiodeIV,    desc:'I=I₀(e^(V/VT)−1) — forward bias exponential rise, reverse saturation', controls:[]},
    {id:'rect',title:'Rectifier Waveforms',          fn:vizRectifier,  desc:'HWR vs FWR — ripple factor γ and efficiency η comparison', controls:[]},
    {id:'oa',  title:'Op-Amp Configurations',       fn:vizOpAmp,      desc:'Av(inv)=−Rf/Rin | Av(non-inv)=1+Rf/Rin | Virtual ground concept',
      controls:[
        {id:'rf', label:'Rf (feedback)', min:10, max:500,step:10,val:100,unit:'kΩ'},
        {id:'rin',label:'Rin (input)',   min:1,  max:100,step:1, val:10, unit:'kΩ'},
      ]},
    {id:'bjt', title:'BJT Transistor (β)',          fn:vizBJT,        desc:'IC=β·IB | IE=IC+IB | α=IC/IE=β/(1+β)',
      controls:[
        {id:'beta',label:'β (hFE)',min:10,max:500,step:10,val:100,unit:''},
      ]},
  ],
  'signals': [
    {id:'fs',  title:'Fourier Series Buildup',      fn:vizFourier,    desc:'Square wave from odd harmonics — more harmonics = sharper edges (Gibbs phenomenon)', controls:[]},
    {id:'smp', title:'Nyquist Sampling Theorem',    fn:vizSampling,   desc:'fs≥2fmax prevents aliasing — watch what happens below the Nyquist rate', controls:[]},
    {id:'conv',title:'Convolution (Animated)',       fn:vizConvolution,desc:'y(t)=x(t)*h(t) — sliding overlap integral visualized step by step', controls:[]},
  ],
  'control': [
    {id:'sr',  title:'Step Response (Damping)',     fn:vizStepResponse,desc:'ξ animates 0→2.2 — observe underdamped oscillation, critical damping, overdamped',
      controls:[
        {id:'xi',label:'Damping Ratio ξ',min:0.05,max:2.5,step:0.05,val:0.5,unit:''},
      ]},
    {id:'bp',  title:'Bode Plot (GM & PM)',         fn:vizBodePlot,   desc:'Gain margin, phase margin, gain/phase crossover frequencies explained', controls:[]},
  ],
  'communications': [
    {id:'am',  title:'AM Modulation',              fn:vizAMModulation,desc:'m=Am/Ac animated — envelope, bandwidth BW=2fm, efficiency η shown',
      controls:[
        {id:'m',label:'Modulation Index m',min:0.1,max:1.0,step:0.05,val:0.5,unit:''},
      ]},
    {id:'fm',  title:'FM Modulation',              fn:vizFMModulation,desc:'β=Δf/fm animated — Carson BW=2(Δf+fm), FM noise advantage',
      controls:[
        {id:'beta',label:'Modulation Index β',min:0.5,max:5,step:0.25,val:2,unit:''},
      ]},
    {id:'sh',  title:'Shannon Channel Capacity',   fn:vizShannon,    desc:'C=B·log₂(1+SNR) — move slider to see how SNR and bandwidth affect capacity',
      controls:[
        {id:'maxSNR',label:'Max SNR shown',  min:10, max:100,step:5, val:35,unit:''},
        {id:'B',     label:'Bandwidth B',    min:1,  max:20, step:1, val:1, unit:'MHz'},
      ]},
  ],
  'aptitude': [
    {id:'int', title:'SI vs CI Growth Chart',      fn:vizInterest,   desc:'See how compound interest exponentially beats simple interest over time',
      controls:[
        {id:'P',label:'Principal P', min:500,  max:10000,step:500,val:1000,unit:'₹'},
        {id:'R',label:'Rate R',      min:5,    max:30,   step:1,  val:15,  unit:'%'},
        {id:'T',label:'Years T',     min:1,    max:20,   step:1,  val:10,  unit:'yr'},
      ]},
  ],
  'english': [],
};

// JK Flip-Flop (function declaration — hoisted above vizMap reference)
function vizFlipFlop_JK(canvas, params={}) {
  stopViz('ff');
  const {ctx,w,h} = _setup(canvas);
  let t=0;
  const states=[
    {J:0,K:0,Q:0,Qn:1,label:'HOLD — no change'},
    {J:1,K:0,Q:1,Qn:0,label:'SET — Q goes to 1'},
    {J:0,K:0,Q:1,Qn:0,label:'HOLD — Q stays 1'},
    {J:0,K:1,Q:0,Qn:1,label:'RESET — Q goes to 0'},
    {J:1,K:1,Q:1,Qn:0,label:'TOGGLE — Q flips!'},
    {J:1,K:1,Q:0,Qn:1,label:'TOGGLE — Q flips!'},
  ];

  function draw() {
    const c=_C();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);

    const si=Math.floor(t/90)%states.length;
    const {J,K,Q,Qn,label}=states[si];
    const pulse=0.5+0.5*Math.sin(t*0.05);

    const bx=w/2-62,by=h/2-54,bw=124,bh=108;
    ctx.fillStyle=c.card; ctx.strokeStyle=Q?c.success:c.primary; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,bw,bh,8):ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
    _T(ctx,'JK FF',w/2,by+bh/2-12,{sz:15,fw:'800',col:c.text,al:'center'});
    _T(ctx,'CLK ↑',w/2,by+bh/2+8,{sz:11,fw:'600',col:c.muted,al:'center'});
    ctx.fillStyle=c.warning; ctx.globalAlpha=pulse;
    ctx.beginPath(); ctx.arc(w/2,by+bh/2+22,4,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;

    // J input
    ctx.strokeStyle=J?c.danger:c.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx-58,by+24); ctx.lineTo(bx,by+24); ctx.stroke();
    _T(ctx,'J',bx-62,by+24,{sz:14,fw:'800',col:J?c.danger:c.label,al:'right'});
    ctx.fillStyle=J?c.danger:c.border; ctx.beginPath(); ctx.arc(bx-60,by+24,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(J),bx-60,by+24,{sz:11,fw:'700',col:J?'white':c.label,al:'center'});

    // K input
    ctx.strokeStyle=K?c.orange:c.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx-58,by+bh-24); ctx.lineTo(bx,by+bh-24); ctx.stroke();
    _T(ctx,'K',bx-62,by+bh-24,{sz:14,fw:'800',col:K?c.orange:c.label,al:'right'});
    ctx.fillStyle=K?c.orange:c.border; ctx.beginPath(); ctx.arc(bx-60,by+bh-24,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(K),bx-60,by+bh-24,{sz:11,fw:'700',col:K?'white':c.label,al:'center'});

    // Q output
    ctx.strokeStyle=Q?c.success:c.border; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bx+bw,by+24); ctx.lineTo(bx+bw+58,by+24); ctx.stroke();
    _T(ctx,'Q',bx+bw+62,by+24,{sz:14,fw:'800',col:Q?c.success:c.label});
    ctx.fillStyle=Q?c.success:c.border; ctx.beginPath(); ctx.arc(bx+bw+60,by+24,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(Q),bx+bw+60,by+24,{sz:11,fw:'700',col:Q?'white':c.label,al:'center'});

    // Q' output
    ctx.strokeStyle=Qn?c.purple:c.border; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx+bw,by+bh-24); ctx.lineTo(bx+bw+58,by+bh-24); ctx.stroke();
    _T(ctx,"Q'",bx+bw+62,by+bh-24,{sz:14,fw:'800',col:Qn?c.purple:c.label});
    ctx.fillStyle=Qn?c.purple:c.border; ctx.beginPath(); ctx.arc(bx+bw+60,by+bh-24,8,0,Math.PI*2); ctx.fill();
    _T(ctx,String(Qn),bx+bw+60,by+bh-24,{sz:11,fw:'700',col:Qn?'white':c.label,al:'center'});

    // State badge
    const stCol=Q?c.success:c.primary;
    ctx.fillStyle=stCol+'22'; ctx.strokeStyle=stCol; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(w/2-85,h-52,170,26,6):ctx.rect(w/2-85,h-52,170,26);
    ctx.fill(); ctx.stroke();
    _T(ctx,label,w/2,h-39,{sz:12,fw:'800',col:stCol,al:'center'});

    _title(ctx,"JK Flip-Flop: Q(t+1)=J·Q'+K'·Q  |  J=K=1 → Toggle",w,c);
    _note(ctx,'J=0,K=0→Hold | J=1,K=0→Set | J=0,K=1→Reset | J=1,K=1→Toggle',w,h,c);
    t++;
    _vf['ff']=requestAnimationFrame(draw);
  }
  draw();
}
