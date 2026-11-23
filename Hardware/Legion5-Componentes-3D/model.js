window.createLegionModel = function createLegionModel(canvas,changed,onLoss){
  const T=window.THREE,B=window.LegionBench;
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'})||canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(!context||!T||!window.LegionOrbitControls)throw Error('WebGL no disponible');
  const renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true});
  renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-8,8,5,-5,.1,120);
  const controls=new window.LegionOrbitControls(camera,canvas);controls.enableDamping=false;
  controls.minZoom=.55;controls.maxZoom=3.4;controls.maxPolarAngle=Math.PI*.92;controls.rotateSpeed=.8;
  controls.touches.ONE=T.TOUCH.ROTATE;controls.touches.TWO=T.TOUCH.DOLLY_PAN;
  const bench=new T.Group();scene.add(bench);
  const materials=new Map(),cube=new T.BoxGeometry(1,1,1),disc=new T.CylinderGeometry(1,1,1,40);
  const vec=(x,y,z)=>new T.Vector3(x,y,z);
  function mat(color,metal=.12,rough=.62){
    const key=[color,metal,rough].join();if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(key);
  }
  function group(parent,id){const g=new T.Group();if(id)g.userData.part=id;parent.add(g);return g;}
  function mesh(parent,geo,m,x=0,y=0,z=0){const a=new T.Mesh(geo,m);a.position.set(x,y,z);parent.add(a);return a;}
  function box(parent,w,h,d,x,y,z,m){const a=mesh(parent,cube,m,x,y,z);a.scale.set(w,h,d);return a;}
  function cylinder(parent,r,h,x,y,z,m){const a=mesh(parent,disc,m,x,y,z);a.scale.set(r,h,r);return a;}
  function flatShape(pts,h,bevel=.025){
    const shape=new T.Shape();pts.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
    const g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:5});g.rotateX(-Math.PI/2);return g;
  }
  function rounded(w,d,r,h){
    const s=new T.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:.035,bevelThickness:.03,bevelSegments:2,curveSegments:5});g.rotateX(-Math.PI/2);return g;
  }
  function slab(o,w,h,d,r,x,y,z,m){return mesh(o,rounded(w,d,r,h),m,x,y,z);}
  function tube(o,points,r,m){const curve=new T.CatmullRomCurve3(points.map(p=>vec(...p)));return mesh(o,new T.TubeGeometry(curve,Math.max(9,points.length*5),r,7,false),m);}
  function tex(w,h,draw){
    const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
  }
  function print(o,w,d,x,y,z,map,alpha=false){
    const m=new T.MeshBasicMaterial({map,transparent:alpha,depthWrite:!alpha,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
    const a=mesh(o,new T.PlaneGeometry(w,d),m,x,y,z);a.rotation.x=-Math.PI/2;return a;
  }
  const dark=mat('#293539'),deep=mat('#172426'),rubber=mat('#182121',0,.9),silver=mat('#b0bfbd',.58,.36),edge=mat('#647675',.50,.46),gold=mat('#c8a557',.48,.42),pcb=mat('#176b73'),ramGreen=mat('#276952'),silicon=mat('#223035',.15,.47),copper=mat('#ad6749',.53,.40),blackmetal=mat('#424e4f',.43,.42),ivory=mat('#c9cec3',.12,.75);
  function screw(o,x,z,y,r=.066){
    cylinder(o,r,.031,x,y,z,silver);
    const m=mat('#526162');const a=box(o,r*1.18,.008,r*.19,x,y+.018,z,m);a.rotation.y=.45;
    const b=box(o,r*.19,.008,r*1.18,x,y+.019,z,m);b.rotation.y=.45;
  }
  function fasten(o,w,d,y){for(const sx of [-1,1])for(const sz of [-1,1])screw(o,sx*(w/2-.15),sz*(d/2-.16),y);}
  function label(a,b,base='#dce1d2'){
    return tex(360,144,(c,w,h)=>{
      c.fillStyle=base;c.fillRect(0,0,w,h);c.fillStyle='#293b39';c.font='bold 35px sans-serif';c.fillText(a,12,43);c.font='19px monospace';c.fillText(b,12,71);
      for(let i=0;i<54;i++){const n=(i*17%4)+1;c.fillRect(13+i*4.7,90,n,29);}
    });
  }
  const shell=group(bench,'board');
  slab(shell,12.16,.20,7.99,.38,0,-.29,0,dark);
  slab(shell,12.04,.19,7.88,.35,0,-.09,0,edge);
  slab(shell,11.78,.08,7.62,.26,0,.035,0,mat('#87918b',.44));
  for(const x of [-1,1]){box(shell,.115,.28,7.02,x*5.96,.15,0,dark);box(shell,.28,.10,7.10,x*5.76,.14,0,blackmetal);}
  for(const z of [-3.84,3.85])box(shell,11.46,.26,.10,0,.16,z,dark);
  // Rear ports, heat-exchanger fins and the stiffened front corners.
  for(const x of [-4.44,4.44]){
    box(shell,2.32,.45,.58,x,.22,-3.57,deep);
    for(let i=0;i<26;i++)box(shell,.041,.38,.54,x-1.02+i*.081,.32,-3.58,edge);
  }
  for(const x of [-2.85,-2.1,-1.43,-.65,.12,.9,1.8,2.72]){
    box(shell,.53,.35,.54,x,.30,-3.56,silver);box(shell,.40,.19,.045,x,.30,-3.851,deep);
  }
  for(const x of [-5.4,5.4]){slab(shell,.77,.15,1.02,.16,x,.14,2.91,rubber);for(let i=0;i<7;i++)box(shell,.54,.016,.032,x,.332,2.66+i*.073,edge);}
  const board=group(bench,'board');
  const boardPts=[[-5.68,-3.47],[5.62,-3.47],[5.62,-.28],[4.89,-.28],[4.89,1.11],[3.05,1.11],[2.80,1.41],[-4.9,1.41],[-4.9,1.16],[-5.57,1.16],[-5.57,-.34],[-5.68,-.34]];
  const boardBlue=mat('#176785',.15,.55);
  mesh(board,flatShape(boardPts,.10),boardBlue,0,.18,0);
  const traces=tex(1024,440,(c,w,h)=>{
    c.clearRect(0,0,w,h);let seed=311;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    for(let i=0;i<250;i++){
      const x=rnd()*w,y=rnd()*h,dx=(rnd()-.5)*65,dz=(rnd()-.5)*38;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+15,y);c.lineTo(x+15+dx,y+dz);c.lineTo(x+40+dx,y+dz);c.lineWidth=.7+rnd();c.strokeStyle=i%5?'#7faeb17a':'#b2c9a58a';c.stroke();
      c.beginPath();c.arc(x,y,1.8,0,Math.PI*2);c.fillStyle='#c6cab4';c.fill();
    }
    c.fillStyle='#bfdbd5';c.font='11px monospace';for(let i=0;i<36;i++)c.fillText((i%2?'R':'J')+(32+i),rnd()*w,rnd()*h);
  });
  print(board,10.5,4.55,-.05,.31,-1.03,traces,true);
  for(let i=0;i<111;i++){
    const x=-5.2+((i*47)%102)*.100,z=-3.21+((i*31)%78)*.053;
    if(i%7===0){cylinder(board,.081,.13,x,.39,z,silver);cylinder(board,.062,.015,x,.467,z,blackmetal);}
    else {box(board,.10+i%3*.031,.052,.076,x,.355,z,i%3?ivory:blackmetal);box(board,.023,.056,.078,x-.049,.356,z,silver);}
  }
  for(const [x,z] of [[-5.65,-3.45],[5.65,-3.45],[-5.6,1.7],[5.59,1.7],[-5.55,3.53],[5.52,3.55],[1.9,1.3],[-3.45,-.55],[2.65,-.55],[-2.8,-3]]){
    cylinder(shell,.13,.18,x,.23,z,gold);screw(shell,x,z,.34);
  }
  const objects={}, rotors=[];
  const add=id=>{objects[id]=group(bench,id);return objects[id];};
  const fixedAnchor=(id,y)=>{const p=B.parts[id];objects[id].position.set(p.x,y,p.z);};
  function siliconPack(o,w,d,x,y,z){box(o,w,.1,d,x,y,z,silicon);box(o,w*.5,.006,.019,x-.03,y+.052,z-d*.24,edge);}
  for(const id of ['cpu','gpu']){
    const o=add(id);fixedAnchor(id,.35);const p=B.parts[id];
    box(o,p.w,.08,p.d,0,0,0,ramGreen);slab(o,p.w*.68,.06,p.d*.67,.055,0,.06,0,silver);
    for(let i=0;i<7;i++){box(o,.054,.032,.065,-.6+i*.19,.068,-.53,gold);box(o,.054,.032,.065,-.6+i*.19,.068,.53,gold);}
    if(id==='gpu')for(const x of [-.96,.96])for(const z of [-.45,.25])siliconPack(board,.43,.34,p.x+x,.38,p.z+z);
  }
  const thermal=add('thermal');
  for(const side of [-1,1]){
    const x=side*4.43,z=-2.34,casePts=[[-1.24,-1.16],[.85,-1.16],[1.21,-.75],[1.29,.48],[.85,1.08],[-.71,1.15],[-1.29,.72]];
    mesh(thermal,flatShape(casePts,.17,.036),dark,x,.32,z);
    cylinder(thermal,1.12,.14,x,.53,z,blackmetal);cylinder(thermal,1.019,.07,x,.628,z,deep);
    const rotor=group(thermal);rotor.position.set(x,.69,z);rotors.push(rotor);
    const bladePts=[[.19,-.06],[.49,-.09],[.86,-.28],[.98,-.32],[.84,-.14],[.48,.035],[.20,.06]];
    const blade=flatShape(bladePts,.024,.006);
    for(let i=0;i<37;i++){const a=mesh(rotor,blade,i%3?mat('#687674',.50,.41):mat('#788781',.40,.43));a.rotation.y=i*Math.PI*2/37;}
    cylinder(rotor,.25,.10,0,.069,0,dark);cylinder(rotor,.16,.017,0,.129,0,edge);cylinder(rotor,.072,.02,0,.148,0,silver);
    const ring=mesh(thermal,new T.TorusGeometry(1.075,.042,8,64),edge,x,.713,z);ring.rotation.x=Math.PI/2;
    for(const dx of [-.95,.95])screw(thermal,x+dx,z+.83,.55);
    for(let i=0;i<11;i++)box(thermal,.32,.12,.052,x+side*1.13,.40,z-.81+i*.15,blackmetal);
  }
  for(const id of ['cpu','gpu']){
    const p=B.parts[id];slab(thermal,p.w+.12,.10,p.d+.06,.16,p.x,.52,p.z,blackmetal);
    for(const sx of [-1,1])for(const sz of [-1,1]){const x=p.x+sx*.73,z=p.z+sz*.60;cylinder(thermal,.15,.06,x,.625,z,copper);screw(thermal,x,z,.68,.08);}
  }
  const routes=[
    [[-4.45,.71,-3.48],[-3.60,.73,-3.44],[-2.7,.73,-2.86],[-1.6,.73,-2.16],[-.7,.73,-1.86],[.45,.73,-1.9],[1.48,.73,-2.10],[2.5,.73,-2.32],[3.62,.73,-3.34],[4.71,.71,-3.45]],
    [[-5.30,.73,-3.44],[-3.83,.76,-3.54],[-2.78,.75,-3.12],[-2.03,.76,-2.54],[-1.30,.76,-2.32]],
    [[1.1,.77,-2.42],[2.50,.77,-2.67],[3.42,.77,-3.49],[4.38,.75,-3.58],[5.25,.74,-3.47]]
  ];
  for(const pts of routes)tube(thermal,pts,.115,copper);
  for(const x of [-3.24,3.35]){const a=box(thermal,.31,.045,.32,x,.846,-3.12,blackmetal);a.rotation.y=x>0?.65:-.65;}
  const bayMat=mat('#373f3b'),bayBottom=mat('#687571',.32);
  for(const [id,p] of Object.entries(B.slots)){
    box(board,p.w+.09,.073,p.d+.065,p.x,.34,p.z,id==='sata'?bayBottom:bayMat);
    if(p.type==='ram'){box(board,p.w,.15,.12,p.x,.48,p.z-p.d*.49,ivory);for(const side of [-1,1])box(board,.10,.15,.34,p.x+side*p.w*.49,.51,p.z+.10,silver);}
    else{box(board,p.w*.86,.15,.12,p.x,.48,p.z-p.d/2,deep);if(p.type!=='hdd')cylinder(board,.12,.11,p.x,.45,p.z+p.d*.43,gold);}
  }
  for(const id of ['ramA','ramB']){
    const o=add(id);const p=B.slots.dimm1;
    box(o,p.w-.14,.081,p.d-.08,0,0,0,ramGreen);
    for(let i=0;i<36;i++){if(i===19)continue;box(o,.038,.015,.092,-1.20+i*.068,.05,-.295,gold);}
    for(let i=0;i<5;i++)siliconPack(o,.355,.35,-.946+i*.47,.102,.025);
    print(o,.63,.27,.52,.157,.04,label('DDR4','SO-DIMM'));
    for(let i=0;i<11;i++)box(o,.053,.043,.032,-1.13+i*.216,.066,.255,ivory);
  }
  const ssd=add('ssd');box(ssd,.79,.075,2.36,0,0,0,pcb);
  for(let i=0;i<12;i++)if(i!==8)box(ssd,.034,.016,.145,-.33+i*.060,.045,-1.14,gold);
  siliconPack(ssd,.58,.65,0,.096,-.54);siliconPack(ssd,.56,.69,0,.096,.41);
  print(ssd,.60,.80,0,.153,.35,label('NVMe','PCIe SSD'));
  cylinder(ssd,.095,.04,0,.066,1.045,gold);screw(ssd,0,1.045,.098,.063);
  const hdd=add('hdd');slab(hdd,2.40,.19,3.31,.14,0,-.05,0,deep);slab(hdd,2.35,.04,3.25,.13,0,.15,0,silver);
  slab(hdd,2.06,.026,2.93,.22,0,.213,.02,mat('#b2bbb7',.48,.37));
  print(hdd,1.55,1.27,-.12,.274,.03,label('SATA HDD','DATA DRIVE / 2.5'));fasten(hdd,2.38,3.25,.245);
  box(hdd,1.42,.16,.15,0,.065,-1.68,deep);
  const wifi=add('wifi');box(wifi,.96,.075,.93,0,0,0,ramGreen);slab(wifi,.83,.053,.64,.04,0,.06,-.02,silver);
  print(wifi,.72,.48,0,.155,-.03,label('WLAN','RF MODULE'));for(const x of [-.32,.32])cylinder(wifi,.074,.055,x,.14,.37,gold);
  const antenna=group(bench,'wifi');
  for(let i=0;i<2;i++)tube(antenna,[[-2.78+(i?-.32:.32),.68,.89],[-2.55+i*.05,.62,1.18],[-3.12,.58,1.34+i*.07],[-4.61,.52,1.69+i*.06],[-5.52,.44,1.25+i*.06],[-5.56-i*.05,.45,-2.67]],.026,i?ivory:deep);
  const batt=add('battery');fixedAnchor('battery',.34);slab(batt,6.19,.24,1.96,.12,0,-.05,0,rubber);slab(batt,5.99,.037,1.76,.10,0,.209,0,dark);
  const bLabel=tex(850,236,(c,w,h)=>{
    c.fillStyle='#303b3b';c.fillRect(0,0,w,h);c.strokeStyle='#48534d';for(const x of [255,548]){c.beginPath();c.moveTo(x,8);c.lineTo(x,h-9);c.stroke();}
    c.fillStyle='#d4d8c8';c.font='bold 44px sans-serif';c.fillText('Li-ion',30,68);c.font='20px monospace';c.fillText('RECHARGEABLE BATTERY',30,105);c.font='16px sans-serif';c.fillText('60 Wh  /  LEGION 5',30,140);
    for(let i=0;i<8;i++){c.fillStyle=i%3?'#a9b2a6':'#c1c6b7';c.fillRect(335,42+i*15,185-(i*13%70),2);c.fillRect(566,42+i*15,222-(i*19%80),2);}
    c.strokeStyle='#c3c9b9';c.lineWidth=3;c.strokeRect(36,174,39,28);c.font='bold 22px sans-serif';c.fillText('CE',109,199);c.fillText('Li-ion',192,199);
  });
  print(batt,5.85,1.57,0,.279,0,bLabel);for(const x of [-2.87,2.87])screw(batt,x,.75,.285);
  const batteryCable=group(bench,'battery');batteryCable.position.set(-1.28,.56,1.55);
  for(let i=0;i<5;i++)tube(batteryCable,[[i*.047,0,0],[i*.047+.01,.04,-.15],[i*.047+.09,.045,-.27],[i*.047+.10,.018,-.45]],.024,i<2?mat('#a4533e'):deep);
  box(batteryCable,.43,.13,.19,.20,.037,-.45,ivory);
  box(board,.53,.10,.20,-1.08,.47,1.12,deep);
  const cover=group(bench);cover.userData.cover=true;
  slab(cover,12.02,.19,7.86,.36,0,.85,0,mat('#404e50',.30,.52));
  for(let i=0;i<58;i++){
    const x=-4.98+i*.175;
    if(Math.abs(x)<.35)continue;
    const len=1.18+.37*Math.cos(x*.9);const v=box(cover,.052,.021,len,x,1.085,-2.17,deep);v.rotation.y=.23;
  }
  for(const z of [-3.28,2.89])slab(cover,z>0?8.2:7.7,.06,.19,.08,0,1.052,z,rubber);
  for(const [x,z] of [[-5.6,-3.4],[0,-3.5],[5.6,-3.4],[-5.66,-1.4],[5.66,-1.4],[-5.6,1.0],[5.6,1.0],[-5.33,3.42],[-1.81,3.48],[1.81,3.48],[5.33,3.42]])screw(cover,x,z,1.052,.082);
  const shadow=tex(256,192,(c,w,h)=>{
    c.clearRect(0,0,w,h);c.shadowBlur=14;c.shadowColor='#263634';c.fillStyle='#263634';c.fillRect(23,27,w-46,h-54);
  });
  const shadowMesh=print(scene,14.1,9.5,.10,-.37,.14,shadow,true);shadowMesh.material.opacity=.24;
  scene.add(new T.HemisphereLight('#ffffff','#8c9d94',2.25));
  const light=new T.DirectionalLight('#fff2da',2.65);light.position.set(-5,10,7);scene.add(light);
  const fill=new T.DirectionalLight('#c5e3f1',1.7);fill.position.set(5,6,-8);scene.add(fill);
  // Batch repeated meshes inside each component. Their parent keeps the picking identity.
  function batch(g){
    for(const ch of g.children.slice())if(ch.isGroup)batch(ch);
    const buckets=new Map();
    for(const c of g.children)if(c.isMesh&&!c.isInstancedMesh&&(c.geometry===cube||c.geometry===disc||g.parent===thermal&&c.geometry.type==='ExtrudeGeometry')){
      const key=c.geometry.uuid+c.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(c);
    }
    for(const items of buckets.values())if(items.length>2){
      const out=new T.InstancedMesh(items[0].geometry,items[0].material,items.length);
      items.forEach((item,i)=>{item.updateMatrix();out.setMatrixAt(i,item.matrix);g.remove(item);});out.instanceMatrix.needsUpdate=true;out.computeBoundingSphere();g.add(out);
    }
  }
  batch(bench);
  let s,ui,enabled=false,frame=0,priorTime=0,dragging=null;
  const probe=new T.Raycaster(),ndc=new T.Vector2(),ground=new T.Plane(vec(0,1,0),-.44),pt=new T.Vector3();
  const ringMat=new T.LineBasicMaterial({color:0xb8eb56,depthTest:false,transparent:true,opacity:.98});
  const outline=new T.LineLoop(new T.BufferGeometry(),ringMat);outline.renderOrder=8;scene.add(outline);outline.visible=false;
  function setOutline(){
    const id=ui.selected, p=B.spot(s,id);
    outline.visible=!!p&&(s.open||ui.explode)&&(!['cpu','gpu'].includes(id)||ui.explode)&&!dragging;
    if(!outline.visible)return;
    const x=p.x,z=p.z,w=p.w/2+.06,d=p.d/2+.06;
    const y=id==='thermal'?objects.thermal.position.y+.80:objects[id]?(objects[id].position.y+(id==='battery'||id==='hdd'?.33:.19)):.52;
    outline.geometry.dispose();outline.geometry=new T.BufferGeometry().setFromPoints([vec(x-w,y,z-d),vec(x+w,y,z-d),vec(x+w,y,z+d),vec(x-w,y,z+d)]);
  }
  function position(){
    if(!s)return;
    for(const id of B.removable){
      const p=B.spot(s,id),o=objects[id];o.visible=!!p;
      if(p)o.position.set(p.x,.53+(ui.explode?(id==='hdd'?.68:id==='ssd'?.96:.77):0),p.z);
    }
    cover.visible=!s.open&&!ui.explode;thermal.position.y=ui.explode?2.60:0;
    batt.position.y=.34+(ui.explode?.59:0);
    batteryCable.position.z=s.battery?1.55:1.76;batteryCable.position.y=.56+(ui.explode?.59:0);
    antenna.visible=!!s.location.wifi&&!ui.explode;shadowMesh.visible=camera.position.y>0;
    setOutline();bench.updateMatrixWorld(true);
  }
  function draw(time){
    frame=0;if(!enabled||!s||document.hidden)return;
    if(s.on&&!ui.paused){
      const delta=priorTime?Math.min((time-priorTime)/1000,.06):0;rotors[0].rotation.y+=delta*5;rotors[1].rotation.y-=delta*5;
    }
    priorTime=time;shadowMesh.visible=camera.position.y>0;
    renderer.render(scene,camera);changed();
    if(s.on&&!ui.paused)schedule();
  }
  function schedule(){if(enabled&&!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
  function home(){
    controls.target.set(0,.36,0);camera.position.set(3.25,16,11.5);camera.zoom=1;camera.updateProjectionMatrix();controls.update();schedule();
  }
  function resize(){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
    const aspect=r.width/r.height,h=Math.max(8.7,14.55/aspect);
    camera.left=-h*aspect/2;camera.right=-camera.left;camera.top=h/2;camera.bottom=-h/2;
    camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);schedule();
  }
  function cast(cx,cy){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return false;
    ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);camera.updateMatrixWorld();probe.setFromCamera(ndc,camera);return true;
  }
  function project(x,y,z){
    const v=vec(x,y,z).project(camera),r=canvas.getBoundingClientRect();return {x:(v.x+1)*r.width/2,y:(1-v.y)*r.height/2};
  }
  controls.addEventListener('change',schedule);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();enabled=false;onLoss();});
  document.addEventListener('visibilitychange',()=>{priorTime=0;schedule();});
  home();
  return {
    setState(state,settings){
      s=state;ui=settings;dragging=null;
      const ratio=Math.min(window.devicePixelRatio||1,ui.low?1:1.65);if(renderer.getPixelRatio()!==ratio)renderer.setPixelRatio(ratio);
      position();schedule();
    },
    active(value){enabled=value;controls.enabled=value;priorTime=0;if(value){resize();schedule();}},
    orbit(value){controls.enabled=enabled&&value;},
    home,resize,
    zoom(k){camera.zoom=T.MathUtils.clamp(camera.zoom*k,controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();schedule();},
    rotate(dx,dy){
      const offset=camera.position.clone().sub(controls.target),sph=new T.Spherical().setFromVector3(offset);
      sph.theta+=dx;sph.phi=T.MathUtils.clamp(sph.phi+dy,.04,controls.maxPolarAngle);camera.position.copy(controls.target).add(vec(0,0,0).setFromSpherical(sph));controls.update();schedule();
    },
    pick(cx,cy){
      if(!s||(!s.open&&!ui.explode)||!cast(cx,cy))return null;
      const hits=probe.intersectObject(bench,true);
      for(const hit of hits){let o=hit.object,id=null,visible=true;while(o&&o!==bench){if(!o.visible){visible=false;break;}id=id||o.userData.part;o=o.parent;}if(visible&&id)return id;}
      return null;
    },
    projectPart(id){
      const p=B.spot(s,id);if(!p||(!s.open&&!ui.explode)||(!ui.explode&&['cpu','gpu'].includes(id)))return null;
      const y=id==='thermal'?thermal.position.y+.78:(objects[id]?.position.y??.30)+(id==='battery'?.31:.20);
      return project(p.x,y,p.z);
    },
    projectSlot(id){const p=B.slots[id];return project(p.x,.44,p.z);},
    slotAt(cx,cy){
      if(!cast(cx,cy)||!probe.ray.intersectPlane(ground,pt))return null;
      return Object.keys(B.slots).find(k=>{const p=B.slots[k];return Math.abs(pt.x-p.x)<=p.w*.55&&Math.abs(pt.z-p.z)<=p.d*.55;})||null;
    },
    drag(id,cx,cy){
      if(!cast(cx,cy))return;const plane=new T.Plane(vec(0,1,0),-1.05);
      if(probe.ray.intersectPlane(plane,pt)){dragging=id;objects[id].visible=true;objects[id].position.copy(pt);outline.visible=false;schedule();}
    },
    clearDrag(){dragging=null;position();schedule();}
  };
};
