(function graphics(){
  const B=window.LegionBench;
  const paths={
    layers:'<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    laptop:'<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M5 17l-3 3h20l-3-3"/>',
    book:'<path d="M3 5c3-1 6 0 9 2 3-2 6-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2zM12 7v14"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/>',
    route:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M8 6h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7"/>',
    flag:'<path d="M5 21V4m0 0c5-4 8 4 15 0v10c-7 4-10-4-15 0"/>',
    award:'<circle cx="12" cy="9" r="5"/><path d="m8.5 13-2 8 5.5-3 5.5 3-2-8"/>',
    cube:'<path d="m12 2 9 5v10l-9 5-9-5V7zm-9 5 9 5 9-5m-9 5v10"/>',
    plan:'<path d="M3 4h18v16H3zM7 8h5v4H7zm8 0h2m-2 4h2M7 16h10"/>',
    focus:'<path d="M3 9V4h5m8 0h5v5m0 6v5h-5m-8 0H3v-5"/><circle cx="12" cy="12" r="3"/>',
    plus:'<path d="M5 12h14m-7-7v14"/>',minus:'<path d="M5 12h14"/>',
    tag:'<path d="M3 4h8l10 10-7 7L3 10z"/><circle cx="7.4" cy="7.5" r="1"/>',
    tray:'<path d="m3 13 3-8h12l3 8v6H3zm0 0h5l1.5 3h5l1.5-3h5"/>',
    mouse:'<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 5v4"/>',
    settings:'<path d="M3 6h5m5 0h8M3 12h10m5 0h3M3 18h3m5 0h10"/><circle cx="10" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-9v.4"/>',
    ram:'<path d="M2 6h20v10H2zM5 17v2m3-2v2m3-2v2m4-2v2m3-2v2"/><path d="M5 9h3v4H5zm6 0h3v4h-3zm6 0h2v4h-2z"/>',
    ssd:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 9h6v6H6zm9 0h3m-3 3h3m-3 3h3"/>',
    disk:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="5"/><path d="m12 11 5 6m-10 .5h1"/>',
    wifi:'<path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0m-11 4a5 5 0 0 1 8 0"/><circle cx="12" cy="19" r="1"/>',
    battery:'<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M22 10v4M6 9v6m4-6v6m4-6v6"/>',
    chip:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zm-1-7v3m4-3v3m4-3v3M8 19v3m4-3v3m4-3v3M2 8h3m-3 4h3m-3 4h3m14-8h3m-3 4h3m-3 4h3"/>',
    fan:'<circle cx="12" cy="12" r="2"/><path d="M11 10C5 3 14 1 16 5c1 2-1 4-3 5m1 2c10-2 7 8 2 7-2 0-3-3-3-5m-3-1c-3 10-9 2-6-1 1-2 4-1 6 0"/>',
    board:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h6v6H7zm9 0h2m-3 4h3m-7 4v3m-4-3v3m7-2h4"/>',
    power:'<path d="M12 2v10m-5-8a8 8 0 1 0 10 0"/>',activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    close:'<path d="m5 5 14 14M5 19 19 5"/>',bulb:'<path d="M9 18h6m-5 3h4m-6-8a6 6 0 1 1 8 0l-1 3H9z"/>',
    reset:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
    extract:'<path d="M4 15v5h16v-5M12 16V3m-5 5 5-5 5 5"/>',
    insert:'<path d="M4 15v5h16v-5M12 3v12m-5-5 5 5 5-5"/>',
    plug:'<path d="M8 2v5m8-5v5M6 7h12v3a6 6 0 0 1-12 0zm6 9v6"/>',
    check:'<path d="m4 12 5 5L20 6"/>'
  };
  const icon=name=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.info}</svg>`;
  const rep=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('');
  const pinRow=(n,x,y,step)=>rep(n,i=>`<rect x="${x+i*step}" y="${y}" width="${step*.63}" height="4" fill="#d7b965"/>`);
  const chip=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.6" fill="#222d2f" stroke="#7e8e87" stroke-width=".7"/><path d="M${x+2} ${y+3}h${w*.53}" stroke="#8c9592" stroke-width=".8"/>`;
  function topPart(id){
    const type=B.parts[id]?.type||id;
    if(type==='ram')return `<path d="M3 14h94v37H55l-2-4-2 4H3V36l2-2-2-2z" fill="#2c7861" stroke="#9dbe96" stroke-width="1.3"/>${pinRow(25,5,48,3.55)}${rep(7,i=>`<path d="M${7+i*11} 43l6-4v-5" fill="none" stroke="#78a88e" stroke-width=".65"/>`)}${rep(4,i=>chip(8+21*i,21,15,14))}<rect x="60" y="37" width="26" height="6" fill="#dae5cf"/><path d="M63 40h19" stroke="#466952" stroke-dasharray="1.3 1"/>`;
    if(type==='ssd')return `<path d="M5 18h91v29H5v-8l4-2-4-2z" fill="#17555a" stroke="#9cc0a4"/>${pinRow(12,9,44,5.7)}${chip(20,22,19,18)}${chip(45,22,14,18)}<rect x="63" y="21" width="24" height="20" rx="2" fill="#c1d2cc"/><path d="M66 26h18m-18 4h11m-11 5h15" stroke="#5e7970" stroke-width="1.3"/><circle cx="10" cy="27" r="2.2" fill="#c3ae74"/>`;
    if(type==='hdd')return `<rect x="14" y="4" width="71" height="57" rx="4" fill="#afb8b8" stroke="#f3f4e8" stroke-width="2"/><path d="M21 10h47l11 10v30l-7 5H22z" fill="#c7cdca" stroke="#889592"/><rect x="31" y="20" width="37" height="25" rx="2" fill="#f1f0dd"/><path d="M35 26h27m-27 4h18m-18 7h25" stroke="#75827b" stroke-width="2"/>${[[20,11],[78,11],[20,54],[78,54]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.9" fill="#45504f"/>`).join('')}`;
    if(type==='wifi')return `<path d="M21 8h57v45H21z" fill="#315e4f" stroke="#a1b393"/>${pinRow(12,24,52,4)}<rect x="26" y="16" width="46" height="29" rx="2" fill="#d4d9cb"/><path d="M32 23h32m-32 5h22m-22 9h25" stroke="#708176" stroke-width="1.7"/><circle cx="28" cy="10" r="3" fill="#d7b65f"/><circle cx="69" cy="10" r="3" fill="#d7b65f"/>`;
    if(type==='battery')return `<rect x="2" y="13" width="96" height="39" rx="3" fill="#303a3b" stroke="#8d9b93"/><path d="M9 17h80m-80 30h80M32 16v33m31-33v33" stroke="#65706b" stroke-width=".7"/><text x="9" y="32" font-family="sans-serif" font-size="7" fill="#e6e8dd" font-weight="bold">Li-ion</text><path d="M9 37h34m-34 3h25m35-9h19m-19 4h14" stroke="#a1aaa2" stroke-width="1.2"/>`;
    if(type==='thermal')return `<circle cx="50" cy="32" r="27" fill="#293233" stroke="#9aa6a2" stroke-width="3"/><circle cx="50" cy="32" r="23" fill="#151f20"/>${rep(29,i=>`<path d="M50 25q6-8 0-15q10 6 4 16z" transform="rotate(${i*360/29} 50 32)" fill="#788787"/>`)}<circle cx="50" cy="32" r="8" fill="#616e6a" stroke="#c4c9b9"/>`;
    if(type==='cpu'||type==='gpu')return `<rect x="23" y="6" width="54" height="52" rx="3" fill="#306655" stroke="#a8c2ae"/>${rep(7,i=>`<path d="M${27+i*7} 8v4m0 39v4" stroke="#c8b56d" stroke-width="2"/>`)}<rect x="33" y="18" width="34" height="28" rx="2" fill="#989f95" stroke="#dee1d2"/><text x="50" y="35" text-anchor="middle" font-size="7" font-family="monospace" fill="#273830">${type.toUpperCase()}</text>`;
    return `<path d="M10 10h72v9h9v31H50v6H10z" fill="#235875" stroke="#97b4b4"/>${chip(20,16,25,20)}${chip(55,23,17,12)}${rep(7,i=>`<path d="M${15+i*8} 47v-5l6-4h8" stroke="#699496" fill="none"/>`)}`;
  }
  function specimen(id){
    return `<g transform="translate(75 1)"><g transform="translate(0 12) scale(1.7 1.22) skewX(-12)">${topPart(id)}</g></g><g fill="none" stroke="#9fb59a" opacity=".7"><path d="M24 16v-5h10m251 0h10v5M24 89v5h10m251 0h10v-5"/></g>`;
  }
  function planar(svg,changed){
    const ns='http://www.w3.org/2000/svg';
    let s,ui,scale=1,panX=0,panZ=0,dragged=null;
    const f=n=>Number(n.toFixed(3));
    function box(x,z,w,d,fill,stroke,rad=.12){return `<rect x="${x-w/2}" y="${z-d/2}" width="${w}" height="${d}" rx="${rad}" fill="${fill}" stroke="${stroke}" stroke-width=".045"/>`;}
    function pipe(d){return `<path d="${d}" fill="none" stroke="#394241" stroke-width=".26" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#b77755" stroke-width=".14" stroke-linecap="round"/>`;}
    function part(id,x,z,w,d){
      const rot=id==='ssd'?90:0;
      return `<g data-pick="${id}" transform="translate(${x} ${z})"><rect x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" rx=".11" fill="transparent" stroke="${id===ui.selected?'#b3d854':'none'}" stroke-width=".10"/><g transform="rotate(${rot})"><svg x="${-(rot?d:w)/2}" y="${-(rot?w:d)/2}" width="${rot?d:w}" height="${rot?w:d}" viewBox="0 0 100 65" preserveAspectRatio="none">${topPart(id)}</svg></g></g>`;
    }
    function draw(){
      if(!s)return;
      svg.setAttribute('viewBox',`${f(panX-8/scale)} ${f(panZ-4.85/scale)} ${f(16/scale)} ${f(9.7/scale)}`);
      let html=`${box(0,0,12.05,7.9,'#303b3c','#83928a',.38)}${box(0,0,11.68,7.53,'#b5bfba','#788781',.22)}`;
      html+=`<g data-pick="board">${box(0,-.69,11.05,5.68,'#245875','#779c96')}${rep(22,i=>`<path d="M${-5.2+i*.46} 1.8v-.5l.48-.49v-.56l.39-.4v-1.2" fill="none" stroke="#78aaa6" stroke-width=".026"/>`)}${rep(17,i=>box(-4.9+i*.6,-3.28,.24,.36,'#475756','#9baba7',.02))}</g>`;
      for(const [key,slot] of Object.entries(B.slots))html+=`<g data-slot="${key}">${box(slot.x,slot.z,slot.w,slot.d,'#45514e','#bbc498')}${box(slot.x,slot.z-slot.d*.37,slot.w*.85,.08,'#bbac76','#c3b078',.02)}</g>`;
      for(const id of ['battery','cpu','gpu']){const p=B.parts[id];html+=part(id,p.x,p.z,p.w,p.d);}
      for(const id of B.removable){const p=B.spot(s,id);if(p)html+=part(id,p.x,p.z,p.w,p.d);}
      for(const x of [-4.47,4.47])html+=part('thermal',x,-2.39,2.55,2.46);
      if(!ui.explode)html+=`<g data-pick="thermal">${pipe('M-4.6-2.96Q-3.4-3.25-2.1-2.1T1.6-2.05T4.5-2.97')}${pipe('M-4.6-3.18Q-3.2-3.6-1.6-2.39')}${pipe('M1.4-2.3Q3.3-3.55 4.55-3.2')}</g>`;
      html+=`<g data-pick="battery"><path d="M-.7 1.52v-.22q0-.17-.24-.17h-.25" stroke="${s.battery?'#ae664b':'#2a3635'}" stroke-width=".13" fill="none" transform="translate(${s.battery?0:.3} 0)"/></g>`;
      if(!s.open&&!ui.explode)html+=`<g data-cover="">${box(0,0,12.08,7.95,'#414c4e','#a9b2ac',.35)}${rep(24,i=>box(-4.8+i*.42,-2.12,.17,1.58,'#212d2e','#485a56',.05))}${box(0,2.85,7.4,.21,'#252f30','#4c5955')}</g>`;
      svg.innerHTML=html; changed();
    }
    function point(x,z){
      const p=svg.createSVGPoint();p.x=x;p.y=z;
      const matrix=svg.getScreenCTM();if(!matrix)return null;
      const screen=p.matrixTransform(matrix), r=svg.getBoundingClientRect();
      return {x:screen.x-r.left,y:screen.y-r.top};
    }
    function world(cx,cy){
      const p=svg.createSVGPoint();p.x=cx;p.y=cy;const m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):p;
    }
    function projectPart(id){
      if(!s.open&&!ui.explode||!ui.explode&&['cpu','gpu'].includes(id))return null;
      const p=B.spot(s,id);return p?point(p.x,p.z):null;
    }
    return {
      setState(state,settings){s=state;ui=settings;dragged=null;draw();}, projectPart,
      projectSlot(id){const p=B.slots[id];return point(p.x,p.z);},
      pick(cx,cy){if(!s.open&&!ui.explode)return null;return document.elementFromPoint(cx,cy)?.closest('[data-pick]')?.getAttribute('data-pick')||null;},
      slotAt(cx,cy){const p=world(cx,cy);return Object.keys(B.slots).find(k=>{const t=B.slots[k];return Math.abs(p.x-t.x)<=t.w*.55&&Math.abs(p.y-t.z)<=t.d*.55;})||null;},
      drag(id,cx,cy){const p=world(cx,cy),e=svg.querySelector(`[data-pick="${id}"]`);if(!dragged){dragged=document.createElementNS(ns,'g');const loc=B.slots[B.parts[id].home];dragged.innerHTML=part(id,0,0,loc.w,loc.d);dragged.style.pointerEvents='none';svg.append(dragged);if(e)e.style.opacity='.25';}dragged.setAttribute('transform',`translate(${p.x} ${p.y})`);},
      clearDrag(){dragged=null;draw();},home(){scale=1;panX=panZ=0;draw();},
      zoom(factor){scale=Math.min(2.8,Math.max(.70,scale*factor));draw();},
      rotate(x,y){panX+=x/scale;panZ+=y/scale;draw();},pan(dx,dy){const w=world(0,0),v=world(dx,dy);panX-=v.x-w.x;panZ-=v.y-w.y;draw();},
      active(){},orbit(){},resize(){changed();}
    };
  }
  window.LegionGraphics={icon,specimen,planar};
})();
