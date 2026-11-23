'use strict';
/* Face Features Lab: realistic 3D scan (Lee Perry-Smith, CC BY 3.0) with live
   vocabulary markers and educational skin-feature controls. 2D reference is separate. */

const ITEMS=[
 {id:'hair',name:'Hair',group:'face',xy:[300,185],definition:'The strands that grow from the scalp.',example:'She tied her hair into a bun.',tip:'Look above the forehead.'},
 {id:'skin',name:'Skin',group:'face',xy:[207,253],definition:'The outer covering of the face and body.',example:'Her skin feels soft.',tip:'Look at the surface of the cheek or forehead.'},
 {id:'eyebrow',name:'Eyebrow',group:'face',xy:[217,296],definition:'A strip of hair above the eye.',example:'He raised one eyebrow.',tip:'Look immediately above an eye.'},
 {id:'eyelash',name:'Eyelash',group:'face',xy:[221,341],definition:'One of the short hairs along the edge of an eyelid.',example:'An eyelash fell onto her cheek.',tip:'Look along the rim of an eye.'},
 {id:'ear',name:'Ear',group:'face',xy:[461,341],definition:'The organ on the side of your head used for hearing.',example:'He wears an earring in his left ear.',tip:'Look at the outer edge of the head.'},
 {id:'nose',name:'Nose',group:'face',xy:[313,400],definition:'The part of the face used for smelling and breathing.',example:'Her nose turned red in the cold.',tip:'Look between the eyes and the mouth.'},
 {id:'mole',name:'Mole',group:'face',xy:[250,452],definition:'A small, usually dark spot on the skin.',example:'She has a tiny mole beside her mouth.',tip:'Look for a small dark spot on a cheek.'},
 {id:'lip',name:'Lip',group:'face',xy:[310,466],definition:'Either of the two soft edges of the mouth.',example:'He bit his lower lip.',tip:'Look at the pink tissue around the mouth.'},
 {id:'chin',name:'Chin',group:'face',xy:[309,549],definition:'The bottom part of the face, below the mouth.',example:'She rested her chin on her hand.',tip:'Look at the lowest point of the face.'},
 {id:'forehead',name:'Forehead',group:'face',xy:[321,235],definition:'The area between the eyebrows and the hairline.',example:'He wiped sweat from his forehead.',tip:'Look above the eyebrows.'},
 {id:'temple',name:'Temple',group:'face',xy:[439,284],definition:'The flat area at the side of the forehead, near the eyes.',example:'He rubbed his temples.',tip:'Look between the outer eye and the hairline.'},
 {id:'eye',name:'Eye',group:'face',xy:[381,337],definition:'The organ that allows you to see.',example:'She closed one eye.',tip:'Look below the eyebrow.'},
 {id:'cheek',name:'Cheek',group:'face',xy:[416,407],definition:'The fleshy side of the face below the eye.',example:'The cold made her cheeks rosy.',tip:'Look beside the nose, under an eye.'},
 {id:'nostril',name:'Nostril',group:'face',xy:[294,427],definition:'Either of the two openings at the bottom of the nose.',example:'Air passes through each nostril.',tip:'Look under the tip of the nose.'},
 {id:'mouth',name:'Mouth',group:'face',xy:[323,488],definition:'The opening in the face used for eating and speaking.',example:'Please open your mouth.',tip:'Look between the lips.'},
 {id:'jaw',name:'Jaw',group:'face',xy:[414,524],definition:'The bony lower part of the face that supports the teeth.',example:'He clenched his jaw.',tip:'Look along the lower side of the face.'},
 {id:'wrinkle',name:'Wrinkle',group:'skin',xy:[420,331],definition:'A fold or line in the skin.',example:'She has a small wrinkle near her eye.',tip:'Look near the outer corner of an eye.'},
 {id:'freckle',name:'Freckle',group:'skin',xy:[215,412],definition:'A small brown spot of skin pigment.',example:'She has freckles across her cheeks.',tip:'Look for tiny spots on a cheek.'},
 {id:'pore',name:'Pore',group:'skin',xy:[410,447],definition:'A very small opening in the skin.',example:'A pore can be difficult to see without magnification.',tip:'Look closely at the texture of a cheek.'},
 {id:'dimple',name:'Dimple',group:'skin',xy:[408,471],definition:'A small hollow in the cheek, often more visible when smiling.',example:'A dimple appeared when she smiled.',tip:'Look beside the corner of the mouth.'}
];
const BY_ID=Object.fromEntries(ITEMS.map(x=>[x.id,x]));
const LIMITS={face:16,skin:4};
const $=id=>document.getElementById(id);
const STORE='faceFeaturesLab.v1';
const defaults=()=>({found:[],matched:[],mission:0,completed:[],settings:{freckles:0,wrinkles:0,pores:0,dimples:0},voice:true});
let saved={};
try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{}
let state=defaults();
state.found=Array.isArray(saved.found)?saved.found.filter(id=>BY_ID[id]):[];
state.matched=Array.isArray(saved.matched)?saved.matched.filter(id=>BY_ID[id]):[];
state.completed=Array.isArray(saved.completed)?saved.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<5):[];
state.mission=Math.max(0,Math.min(4,Number.isInteger(saved.mission)?saved.mission:0));
state.voice=saved.voice!==false;
for(const k of Object.keys(state.settings))state.settings[k]=Math.max(0,Math.min(100,Number(saved.settings?.[k])||0));
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}};
let mode='explore',group='face',selectedWord=null,selectedPin=null,hintedId=null;
let markersVisible=true;
let lastAction={id:null,serial:0},serial=0,missionEntrySerial=0;
let THREE=null,scene=null,camera=null,renderer=null,controls=null,headGroup=null,faceMesh=null,photoTexture=null,material=null,raycaster=null;
let pins3d=new Map(),models=[],ready3d=false,using3d=false,photoReady=false,renderRequested=false;
let scanBasePositions=null,scanFaceTargets={},skinLayers={},skinMaterial=null,scanNormalMap=null;
let portraitActive=false,portraitFocus=0,portraitUpdater=null;
let portraitModel=null;
let loadGeneration=0,activeObjectURL=null,modelFaceScale=1,modelOrbitDistance=.75;
let modelHostDescription='Female example (online)';
const PORTRAIT_REFERENCE="https://studio.tripo3d.ai/3d-model/a-high-detail-portrait-of-a-woman-with-long-dark-brown-hair-tan-skin-6a2b7cf8-4071-46d4-9c5a-d293d00af1dd";
const PORTRAIT_MODEL_URL="https://memoriesrohit.github.io/avatar-studio/models/priya_casual.glb";

const SCAN_ASSET='./assets/';
const texCanvas=document.createElement('canvas');texCanvas.width=420;texCanvas.height=578;const paint=texCanvas.getContext('2d',{willReadFrequently:true});
const photo=new Image();photo.src='./face-reference.jpg';

function status(title,message='',type=''){
 $('status').className='status'+(type?' '+type:'');
 $('status').innerHTML='';
 const b=document.createElement('strong');b.textContent=title;
 $('status').append(b,document.createTextNode(message?' '+message:''));
}
function updateStats(){
 $('statFound').textContent=state.found.length+' / 20';
 $('allFound').textContent=state.found.length+' discovered';
 $('labelCount').textContent=state.matched.length+' / 20';
 $('labelMeter').style.width=(state.matched.length/20*100)+'%';
 renderGlossary();
}
function remember(id){
 if(!state.found.includes(id)){state.found.push(id);persist();updateStats()}
}
function pronounce(id){
 if(!id){status('Choose a word first.');return}
 if(!state.voice){status('Voice is muted.','Enable it with the voice button.');return}
 if(!('speechSynthesis' in window)){status('Speech unavailable.','Try another browser.');return}
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(BY_ID[id].name);u.lang='en-US';u.rate=.83;u.pitch=1;speechSynthesis.speak(u)}
 catch{status('Speech unavailable.','You can still read the word and example.')}
}
function showWord(id,{award=true,announce=true}={}){
 const w=BY_ID[id];if(!w)return;
 selectedPin=id;
 if(award)remember(id);
 $('wordType').textContent=w.group==='skin'?'Skin characteristic':'Facial feature';
 $('wordTitle').textContent=w.name;
 $('wordDefinition').textContent=w.definition;
 $('wordExample').textContent='“'+w.example+'”';
 if(announce)status('Found: '+w.name+'.',w.definition,'ok');
 refreshPins();
}
function setHint(id){hintedId=id;refreshPins();if(id)status('Look for the highlighted location.','The answer is not marked complete.')}
function featureVisible(id){return mode!=='label'||BY_ID[id].group===group}
function refreshPins(){
 for(const b of document.querySelectorAll('.pin2d')){
  const id=b.dataset.id;b.hidden=!(featureVisible(id)&&(markersVisible||mode==='label'||mode==='missions'));
  b.classList.toggle('selected',selectedPin===id);
  b.classList.toggle('matched',state.matched.includes(id));
  b.classList.toggle('hint',hintedId===id);
 }
 for(const [id,p] of pins3d){
  p.visible=featureVisible(id)&&(markersVisible||mode==='label'||mode==='missions');
  const mat=p.material;
  mat.color.set(hintedId===id?0xffdc57:selectedPin===id?0xffb561:state.matched.includes(id)?0x71e6b8:BY_ID[id].group==='skin'?0xf7a7ca:0xbda8ff);
  mat.emissive.set(hintedId===id?0xa16d0a:0x131123);
  p.scale.setScalar(hintedId===id?1.37:selectedPin===id?1.14:1);
 }
}
function hitFeature(id){
 if(!BY_ID[id]||!featureVisible(id))return;
 lastAction={id,serial:++serial};
 if(mode==='label'){
  if(selectedWord){tryMatch(selectedWord,id);return}
  status('Pick a word first.','Select a label from the bank, then click this marker.');
  selectedPin=id;refreshPins();return;
 }
 showWord(id);
 if(mode==='missions')status('Selected '+BY_ID[id].name+'.','Now press Check objective to verify this mission.','ok');
}
function tryMatch(wordId,pinId){
 if(!BY_ID[wordId]||!BY_ID[pinId]||BY_ID[wordId].group!==group)return;
 if(state.matched.includes(wordId))return;
 if(wordId===pinId){
  state.matched.push(wordId);
  selectedWord=null;hintedId=null;remember(wordId);persist();
  status('Correct! '+BY_ID[wordId].name+'.',BY_ID[wordId].definition,'ok');
  showWord(wordId,{award:false,announce:false});
  renderBank();updateStats();refreshPins();
  if(state.matched.length===20)status('Perfect: 20 / 20!','You matched every feature. Try the missions next.','ok');
 }else{
  status('Not quite.','“'+BY_ID[wordId].name+'” does not match that marker. Try again.','bad');
  selectedPin=pinId;refreshPins();
 }
}
function renderBank(){
 const bank=$('wordBank');bank.replaceChildren();
 ITEMS.filter(w=>w.group===group).sort((a,b)=>a.name.localeCompare(b.name)).forEach(w=>{
  const b=document.createElement('button');b.type='button';b.className='chip'+(selectedWord===w.id?' active':'');
  b.textContent=state.matched.includes(w.id)?'✓ '+w.name:w.name;
  b.disabled=state.matched.includes(w.id);b.dataset.word=w.id;
  b.setAttribute('aria-label','Select label '+w.name);
  b.addEventListener('click',()=>{if(b.disabled)return;selectedWord=w.id;selectedPin=null;hintedId=null;status('Selected: '+w.name+'.','Now click its marker on the face.');renderBank();refreshPins()});
  b.addEventListener('pointerdown',startDrag);
  bank.append(b);
 });
}
let drag=null;
function startDrag(e){
 if(e.button!==0&&e.pointerType==='mouse')return;
 const b=e.currentTarget;if(b.disabled)return;
 drag={id:b.dataset.word,x:e.clientX,y:e.clientY,pointer:e.pointerId,ghost:null};
 try{b.setPointerCapture(e.pointerId)}catch{}
}
document.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==drag.pointer)return;
 if(!drag.ghost&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>9){
  const g=document.createElement('div');g.className='drag-ghost';g.textContent=BY_ID[drag.id].name;document.body.append(g);drag.ghost=g;
 }
 if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px'}
});
document.addEventListener('pointerup',e=>{
 if(!drag||e.pointerId!==drag.pointer)return;
 const moving=Boolean(drag.ghost),id=drag.id;
 if(drag.ghost)drag.ghost.remove();drag=null;
 if(!moving)return;
 selectedWord=id;renderBank();
 const target=document.elementFromPoint(e.clientX,e.clientY);
 let pinId=target?.closest?.('.pin2d')?.dataset.id||null;
 if(!pinId&&using3d&&$('canvas3d').contains(target))pinId=pick3d(e.clientX,e.clientY);
 if(pinId)tryMatch(id,pinId);
 else status('Move closer to a marker.','Drag the label onto a colored pin or select it and click a pin.');
});
document.addEventListener('pointercancel',()=>{if(drag?.ghost)drag.ghost.remove();drag=null});
function renderGlossary(){
 const root=$('glossaryGrid');root.replaceChildren();
 ITEMS.forEach(w=>{
  const b=document.createElement('button');b.type='button';
  b.innerHTML='<span class="category"></span><strong></strong><small></small><span class="seen"></span>';
  b.querySelector('.category').textContent=w.group==='skin'?'SKIN DETAIL':'FACE';
  b.querySelector('strong').textContent=w.name;
  b.querySelector('small').textContent=w.definition;
  b.querySelector('.seen').textContent=state.found.includes(w.id)?'✓ Discovered':'Select to discover';
  b.addEventListener('click',()=>{setMode('explore');showWord(w.id);document.querySelector('.layout').scrollIntoView({behavior:'smooth',block:'start'})});
  root.append(b);
 });
}
function setMode(next){
 mode=next;hintedId=null;
 for(const b of document.querySelectorAll('.tab'))b.setAttribute('aria-selected',String(b.dataset.mode===next));
 for(const [m,p] of Object.entries({explore:'explorePanel',label:'labelPanel',studio:'studioPanel',missions:'missionPanel'}))$(p).classList.toggle('hide',m!==next);
 const titles={explore:['Explore the face','Select a marker to learn a word.'],label:['Label the face','Select a word, then place it on the correct marker.'],studio:['Experiment with skin','Change the sliders and watch the model respond.'],missions:['Solve real challenges','Complete the objective by interacting with the model.']};
 $('stageTitle').textContent=titles[next][0];$('stageSubtitle').textContent=titles[next][1];
 $('stageTag').textContent=next==='label'?'Match vocabulary':next==='studio'?'Live visual changes':next==='missions'?'5 objectives':'20 English words';
 if(next==='label'){selectedWord=null;renderBank()}
 if(next==='missions'){missionEntrySerial=serial;renderMission()}
 refreshPins();
 status('Mode: '+titles[next][0]+'.',titles[next][1]);
}
function create2DPins(){
 const holder=$('pins2d');
 for(const w of ITEMS){
  const b=document.createElement('button');b.type='button';b.className='pin2d';b.dataset.id=w.id;
  b.style.left=((w.xy[0]-170)/294*100)+'%';b.style.top=((w.xy[1]-172)/404*100)+'%';
  b.title=w.name;b.setAttribute('aria-label','Inspect '+w.name);
  b.addEventListener('click',()=>hitFeature(w.id));holder.append(b);
 }
 refreshPins();
}
function random(seed){let t=seed|0;return()=>{t=(Math.imul(t,1664525)+1013904223)|0;return (t>>>0)/4294967296}}
function drawDetails(){
 if(!photoReady)return;
 const w=texCanvas.width,h=texCanvas.height,scale=w/210;
 paint.clearRect(0,0,w,h);paint.drawImage(photo,0,0,w,h);
 const s=state.settings;
 const rnd=random(2174);
 // Freckles: two symmetrical cheek clusters, with count controlled by one state variable.
 for(let i=0;i<105;i++){
  const side=i%2===0?-1:1, x=210+side*(95+rnd()*40)+(rnd()-.5)*50,y=295+rnd()*110;
  if(i<s.freckles*1.05){paint.fillStyle='rgba(112,64,45,'+(.10+rnd()*.30)+')';paint.beginPath();paint.ellipse(x,y,1+rnd()*3,.8+rnd()*2,0,0,Math.PI*2);paint.fill()}
 }
 // Wrinkles: illustrative fine lines near the outside corners of the eyes.
 const amount=s.wrinkles/100;paint.lineWidth=1.3;
 for(const side of [-1,1])for(let n=0;n<4;n++){
  paint.strokeStyle='rgba(117,75,74,'+(amount*(.22+n*.07))+')';
  paint.beginPath();const x=210+side*144,y=231+n*8;paint.moveTo(x,y);
  paint.quadraticCurveTo(x+side*12,y-6,x+side*(21+n*4),y+3);paint.stroke();
 }
 // Pores are deliberately enlarged in this educational visualization.
 const pr=random(722);for(let i=0;i<420;i++){
  if(i>=s.pores*4.2)break;
  const side=i%2===0?-1:1,x=210+side*(86+pr()*58),y=275+pr()*141;
  paint.fillStyle='rgba(92,58,59,'+(.10+pr()*.19)+')';paint.beginPath();
  paint.arc(x,y,.55+pr()*.65,0,Math.PI*2);paint.fill();
 }
 // Dimple shadows (geometry deformation is applied separately in Three.js).
 const d=s.dimples/100;
 for(const cx of [123,305]){
  if(d===0)break;
  const grad=paint.createRadialGradient(cx,424,1,cx,424,31);
  grad.addColorStop(0,'rgba(92,42,47,'+(.31*d)+')');grad.addColorStop(1,'rgba(92,42,47,0)');
  paint.fillStyle=grad;paint.fillRect(cx-35,389,70,70);
 }
 // Feather the edges. This removes the rectangular photo boundary on the 3D mesh.
 const data=paint.getImageData(0,0,w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const nx=(x-w*.5)/(w*.5),ny=(y-h*.5)/(h*.5);
  const d=Math.sqrt((nx/1.01)**2+(ny/1.045)**2);
  const opacity=Math.max(0,Math.min(1,(1.04-d)/.17));
  data.data[(y*w+x)*4+3]=Math.round(data.data[(y*w+x)*4+3]*opacity);
 }
 paint.putImageData(data,0,0);
 $('facePhoto').src=texCanvas.toDataURL('image/png');
 if(faceMesh||portraitActive)updateSkinDetails();
}

/* Surface coordinates are in the imported scan's native space. The model is a
   real, closed-head scan, not a billboard or a photograph projected onto a plane. */
// Calibrated against the actual scan triangles. Using the original diagram's
// pixel positions here would place several labels off the face or in mid-air.
const SCAN_LANDMARKS={
 hair:[0,2.9],skin:[-.88,1.75],eyebrow:[-.87,1.0],
 eyelash:[-.82,.70],ear:[1.35,1.30],nose:[0,-.34],
 mole:[-.80,-.93],lip:[-.08,-1.15],chin:[0,-1.93],
 forehead:[0,1.95],temple:[1.25,1.55],eye:[.76,.67],
 cheek:[.82,-.20],nostril:[-.24,-.70],mouth:[0,-1.40],
 jaw:[1.01,-1.68],wrinkle:[1.08,.80],freckle:[-.79,-.36],
 pore:[.79,-.65],dimple:[.80,-1.29]
};
function scanXY(w){
 const [x,y]=SCAN_LANDMARKS[w.id]||[0,0];
 return {x,y};
}
function scanHit(x,y){
 if(!THREE||!faceMesh||!headGroup)return null;
 // Raycaster operates in *world* coordinates; our scanned head is scaled to
 // 41%, so world/local conversion is essential for correct marker placement.
 headGroup.updateMatrixWorld(true);
 const origin=headGroup.localToWorld(new THREE.Vector3(x,y,8));
 const destination=headGroup.localToWorld(new THREE.Vector3(x,y,6));
 const direction=destination.sub(origin).normalize();
 const cast=new THREE.Raycaster(origin,direction,0,16);
 const hit=cast.intersectObject(faceMesh,false)[0];
 if(!hit)return null;
 return {...hit,point:headGroup.worldToLocal(hit.point.clone())};
}
function placeAnchor(id){
 const w=BY_ID[id],p=pins3d.get(id);
 if(!p||!w)return;
 const xy=scanXY(w),hit=scanHit(xy.x,xy.y);
 if(hit){
  const normal=hit.face.normal.clone().normalize();
  p.position.copy(hit.point).addScaledVector(normal,.14);
  scanFaceTargets[id]=hit.point.clone();
 }else {
  p.position.set(xy.x,xy.y,2.10);
  scanFaceTargets[id]=p.position.clone();
 }
}
function updateGeometry(){
 if(!faceMesh||!scanBasePositions)return;
 const a=faceMesh.geometry.attributes.position;
 const strength=state.settings.dimples/100;
 const L=scanFaceTargets.dimple||new THREE.Vector3(1.55,-1.2,1.45);
 const R=new THREE.Vector3(-L.x,L.y,L.z);
 for(let i=0;i<a.count;i++){
  const x=scanBasePositions[i*3],y=scanBasePositions[i*3+1],z=scanBasePositions[i*3+2];
  if(strength>0&&z>.2){
   const weight=(p)=>{
    const d=(x-p.x)**2/(.42*.42)+(y-p.y)**2/(.32*.32)+(z-p.z)**2/(.60*.60);
    return Math.exp(-d*2.7);
   };
   a.setXYZ(i,x,y,z-.28*strength*Math.max(weight(L),weight(R)));
  }else a.setXYZ(i,x,y,z);
 }
 a.needsUpdate=true;faceMesh.geometry.computeVertexNormals();
 faceMesh.geometry.computeBoundingSphere();
 // Facial markers remain attached to the deformed surface.
 for(const id of ['dimple','cheek','mouth','lip'])placeAnchor(id);
}
function seedRand(seed){let v=seed>>>0;return()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296;}}
function makeSkinLayers(){
 if(!THREE||!faceMesh)return;
 const T=THREE;
 const freckleMaterial=new T.MeshStandardMaterial({color:0x754c39,roughness:1,transparent:true,opacity:.70,depthWrite:false});
 const poreMaterial=new T.MeshStandardMaterial({color:0x715049,roughness:1,transparent:true,opacity:.32,depthWrite:false});
 const dotGeo=new T.SphereGeometry(1,8,6);
 const freckles=new T.InstancedMesh(dotGeo,freckleMaterial,160);
 const pores=new T.InstancedMesh(dotGeo,poreMaterial,220);
 freckles.instanceMatrix.setUsage(T.StaticDrawUsage);
 pores.instanceMatrix.setUsage(T.StaticDrawUsage);
 freckles.frustumCulled=false;pores.frustumCulled=false;
 const rnd=seedRand(80951),tmp=new T.Object3D();
 function fill(inst,n,isPore){
  let done=0,tries=0;
  while(done<n&&tries++<n*12){
   const side=rnd()<.5?-1:1;
   const x=side*(.57+rnd()*.70);
   const y=isPore?-.75+rnd()*1.10:-.47+rnd()*.83;
   const hit=scanHit(x,y);
   if(!hit)continue;
   const worldNormal=hit.face.normal.clone().normalize();
   const radius=isPore?.009+rnd()*.008:.018+rnd()*.025;
   tmp.position.copy(hit.point).addScaledVector(worldNormal,.026);
   tmp.scale.set(radius,radius*.42,radius*.30);
   tmp.rotation.set(0,0,rnd()*Math.PI);
   tmp.updateMatrix();inst.setMatrixAt(done++,tmp.matrix);
  }
  inst.count=0;inst.instanceMatrix.needsUpdate=true;return done;
 }
 const freckleMax=fill(freckles,160,false),poreMax=fill(pores,220,true);
 headGroup.add(freckles,pores);
 const wrinkleMaterial=new T.LineBasicMaterial({color:0x684637,transparent:true,opacity:0,depthWrite:false});
 const wrinkles=new T.Group();
 for(const side of [-1,1]){
  for(let j=0;j<4;j++){
   const pts=[];
   for(let k=0;k<=13;k++){
    const t=k/13,x=side*(1.52+t*(.48+j*.08));
    const y=.70-j*.11+Math.sin(t*Math.PI)*.055;
    const hit=scanHit(x,y);
    if(hit)pts.push(hit.point.clone().add(hit.face.normal.clone().multiplyScalar(.029)));
   }
   if(pts.length>2)wrinkles.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),wrinkleMaterial));
  }
 }
 headGroup.add(wrinkles);
 skinLayers={freckles,pores,wrinkles,wrinkleMaterial,freckleMax,poreMax};
 updateSkinDetails();
}
function updateSkinDetails(){
 if(portraitActive){portraitUpdater?.(state.settings);return;}

 if(!faceMesh)return;
 const s=state.settings;
 if(skinLayers.freckles){
  skinLayers.freckles.count=Math.round(s.freckles/100*skinLayers.freckleMax);
  skinLayers.pores.count=Math.round(s.pores/100*skinLayers.poreMax);
  skinLayers.freckles.instanceMatrix.needsUpdate=true;
  skinLayers.pores.instanceMatrix.needsUpdate=true;
  skinLayers.wrinkleMaterial.opacity=s.wrinkles/100*.52;
  skinLayers.wrinkles.visible=s.wrinkles>0;
 }
 // The normal map already contains actual scanned micro-surface detail.
 if(skinMaterial?.normalScale)skinMaterial.normalScale.setScalar(.85+s.pores/100*1.25);
 updateGeometry();
}

function sliderChange(e){
 const id=e.currentTarget.id;state.settings[id]=Number(e.currentTarget.value);
 $(id+'Value').textContent=state.settings[id]+'%';persist();drawDetails();
 status('Updated: '+id+'.','The change is applied to the face model and the 2D view.','ok');
}
function setSettings(values){
 for(const [k,v] of Object.entries(values)){state.settings[k]=v;$(k).value=v;$(k+'Value').textContent=v+'%'}
 persist();drawDetails();status('Preset applied.','Inspect the cheeks and outer eye corners.','ok');
}
const MISSIONS=[
 {title:'Find the nose',description:'Click the nose marker, then check your objective.',hint:'It is in the center, below the eyes.',test:()=>lastAction.id==='nose'&&lastAction.serial>missionEntrySerial},
 {title:'Label a nostril',description:'Open the label challenge, match the word “Nostril” to the correct marker, then check.',hint:'Look for one of the two openings under the nose.',test:()=>state.matched.includes('nostril')},
 {title:'Reveal freckles',description:'In Skin studio, move the Freckles slider to at least 60%, then check.',hint:'Freckles are small pigmented spots on the cheeks.',test:()=>state.settings.freckles>=60},
 {title:'Create dimples',description:'In Skin studio, move the Dimples slider to at least 55%, then check.',hint:'Dimples form hollows near the corners of a smiling mouth.',test:()=>state.settings.dimples>=55},
 {title:'Label an eyebrow',description:'In Label challenge, match “Eyebrow” correctly to its marker, then check.',hint:'It is the strip of hair above the eye.',test:()=>state.matched.includes('eyebrow')}
];
function renderMission(){
 const i=state.mission,m=MISSIONS[i];
 $('missionCount').textContent='Mission '+(i+1)+' / '+MISSIONS.length;
 $('missionTitle').textContent=m.title;$('missionDescription').textContent=m.description;
 $('missionMeter').style.width=(state.completed.length/MISSIONS.length*100)+'%';
 $('missionNext').disabled=!state.completed.includes(i)||i===MISSIONS.length-1;
 $('missionNext').textContent=i===MISSIONS.length-1?'All missions finished ✓':'Next mission →';
 $('missionHintText').classList.add('hide');
 if(state.completed.includes(i))status('Mission already completed.','You can continue to the next mission.','ok');
}
function checkMission(){
 const i=state.mission;
 if(MISSIONS[i].test()){
  if(!state.completed.includes(i)){state.completed.push(i);persist()}
  status('Mission complete!','Objective verified through the live lab state.','ok');
  renderMission();
 }else status('Not completed yet.','Perform the requested action first, then check again.','bad');
}
function changeMission(){
 if(!state.completed.includes(state.mission)||state.mission>=MISSIONS.length-1)return;
 state.mission++;missionEntrySerial=serial;persist();renderMission();
}

function set2D(on){
 if(!ready3d&&!on)on=true;
 using3d=!on&&ready3d;
 $('canvas3d').style.display=using3d?'block':'none';
 $('fallback').classList.toggle('hide',using3d);
 $('toggle2d').textContent=using3d?'▣ Switch to 2D':'◉ Switch to 3D';
 $('viewBadge').textContent=using3d?'Live 3D · orbit controls':'2D reference · all activities';
 $('stageTip').textContent=using3d?'Drag to rotate 360° · Scroll / pinch to zoom · Click colored markers.':'Click the photo markers. 2D supports all vocabulary tasks and skin sliders.';
 if(using3d)resize3D();
}
function view(position){
 if(!ready3d){status('2D mode is active.','3D orbit views need WebGL and access to the Three.js CDN.');return}
 set2D(false);
 if(portraitActive){
  const distance=Math.max(controls.minDistance*1.3,Math.hypot(position[0],position[2]));
  camera.position.set(position[0]/Math.max(.01,Math.hypot(position[0],position[2]))*distance,
    portraitFocus, position[2]/Math.max(.01,Math.hypot(position[0],position[2]))*distance);
  controls.target.set(0,portraitFocus,0);
 }else{camera.position.set(...position);controls.target.set(0,-.08,0);}
 controls.update();
}
function pick3d(clientX,clientY){
 if(!using3d||!renderer||!camera)return null;
 const rect=renderer.domElement.getBoundingClientRect();
 const x=((clientX-rect.left)/rect.width)*2-1,y=-((clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(new THREE.Vector2(x,y),camera);
 const targets=[...pins3d.values()].filter(p=>p.visible);
 const hits=raycaster.intersectObjects(targets,false);
 return hits[0]?.object.userData.feature||null;
}


async function init3D(customURL=null){
 const generation=++loadGeneration;
 try{
  if(controls){controls.dispose();controls=null;}
  if(renderer){
   renderer.dispose();
   $('canvas3d').replaceChildren();
  }
  ready3d=false;using3d=false;portraitActive=false;portraitUpdater=null;
  pins3d=new Map();skinLayers={};portraitModel=null;
  const [T,orbit,loaderModule]=await Promise.all([
   import('three'),import('three/addons/controls/OrbitControls.js'),
   import('three/addons/loaders/GLTFLoader.js')
  ]);
  THREE=T;
  renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.NeutralToneMapping;
  renderer.toneMappingExposure=1.06;
  $('canvas3d').append(renderer.domElement);
  scene=new T.Scene();scene.fog=new T.FogExp2(0x162136,.03);
  camera=new T.PerspectiveCamera(32,1,.012,30);
  controls=new orbit.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.075;
  controls.enablePan=true;controls.minDistance=.35;controls.maxDistance=1.9;
  controls.minPolarAngle=.04;controls.maxPolarAngle=Math.PI-.04;
  scene.add(new T.HemisphereLight(0xf0f6ff,0x75665c,1.9));
  const key=new T.DirectionalLight(0xffebda,2.6);key.position.set(-1.8,3,2.5);scene.add(key);
  const fill=new T.DirectionalLight(0xd8e7ff,.95);fill.position.set(2.5,1.2,2);scene.add(fill);
  const rim=new T.DirectionalLight(0xb8bcff,2.1);rim.position.set(1,2,-2.4);scene.add(rim);
  $('stageLoading').textContent='Loading female portrait (approximate Tripo reference)…';
  const loader=new loaderModule.GLTFLoader();
  loader.setCrossOrigin('anonymous');
  let gltf,portraitError;
  const sources=customURL?[customURL]:[PORTRAIT_MODEL_URL,
    'https://raw.githubusercontent.com/memoriesrohit/avatar-studio/main/models/priya_casual.glb'];
  for(const modelURL of sources){
   try{gltf=await loader.loadAsync(modelURL);break}
   catch(error){portraitError=error;console.warn('Model unavailable:',modelURL,error)}
  }
  if(generation!==loadGeneration)return;
  if(!gltf)throw portraitError||new Error('The GLB could not be loaded');
  const avatar=gltf.scene;
  portraitModel=avatar;scene.add(avatar);
  avatar.updateMatrixWorld(true);
  const allMeshes=[];
  const faceSurfaces=[], hairSurfaces=[];
  avatar.traverse(o=>{
   if(!o.isMesh)return;
   allMeshes.push(o);
   const own=o.name||'';
   const label=/^(mesh_\d+|_\d+)$/.test(own)?(o.parent?.name||own):own;
   o.frustumCulled=false;
   // Rocketbox exports a formal outfit, original outfit, and modular clothing
   // together. Only the original outfit should be visible in this close-up.
   const outfit=['Outfit_formal','Skin_formal','Top_shirt','Skin_shirt',
     'Top_tee','Skin_tee','Trousers','Shoes'];
   if(outfit.includes(label))o.visible=false;
   if(/Hair|Eyelash|Eyebrow/i.test(label)){hairSurfaces.push(o);}
   if(/Body|Skin|Face|Head/i.test(label)){faceSurfaces.push(o);}
   if(/Hair|Eyelash|Eyebrow/i.test(label)){
    // Preserve the model's own transparency and cutout textures. Forcing
    // every hair material to opaque previously caused solid hair sheets.
    const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){
     if(!m)continue;
     m.side=T.DoubleSide;
     m.needsUpdate=true;
    }
   }
  });
  if(!allMeshes.length)throw new Error('The portrait GLB has no usable meshes.');
  const surfaceTargets=faceSurfaces.length?faceSurfaces:allMeshes;
  // This is a licensed Rocketbox avatar used as an approximate match. The
  // Tripo preview link did not provide a downloadable GLB or mesh geometry.
  const headBone=avatar.getObjectByName('mixamorigHead');
  const eyeMeshes=allMeshes.filter(o=>/^Eyes/i.test(o.name||o.parent?.name||''));
  const eyesBox=new T.Box3();
  if(eyeMeshes.length)for(const e of eyeMeshes)eyesBox.expandByObject(e);
  const bodyBox=new T.Box3().setFromObject(avatar);
  if(bodyBox.isEmpty())throw new Error('The GLB has no visible geometry');
  const bodySize=bodyBox.getSize(new T.Vector3());
  const eyePos=new T.Vector3(),headPos=new T.Vector3();
  if(!eyesBox.isEmpty())eyesBox.getCenter(eyePos);
  if(headBone)headBone.getWorldPosition(headPos);
  const isBody=headBone!==undefined||bodySize.y>bodySize.x*1.9;
  const boxCenter=bodyBox.getCenter(new T.Vector3());
  portraitFocus=!eyesBox.isEmpty()?eyePos.y:
     headBone?headPos.y+bodySize.y*.04:
     isBody?bodyBox.max.y-bodySize.y*.115:boxCenter.y;
  const faceWidth=isBody?Math.min(bodySize.x*.26,bodySize.y*.18):bodySize.x*.49;
  modelFaceScale=Math.max(.25,Math.min(45,faceWidth/.11));
  modelOrbitDistance=Math.max(faceWidth*5.8,.58*modelFaceScale);
  controls.minDistance=Math.max(faceWidth*1.9,.20*modelFaceScale);
  controls.maxDistance=Math.max(modelOrbitDistance*5,2*modelFaceScale);
  camera.far=Math.max(30,bodySize.length()*6);camera.updateProjectionMatrix();
  camera.position.set(0,portraitFocus+.03*modelFaceScale,modelOrbitDistance);
  controls.target.set(0,portraitFocus,0);controls.update();
  headGroup=new T.Group();scene.add(headGroup);
  raycaster=new T.Raycaster();
  // Stable, normalized facial landmarks around the eye midpoint. All
  // hotspots are raycast onto actual skin geometry, not a flat image.
  const coords={
   hair:[0,.145],skin:[-.067,.055],eyebrow:[-.046,.038],
   eyelash:[-.049,.012],ear:[.103,-.010],nose:[-.001,-.043],
   mole:[-.063,-.091],lip:[0,-.111],chin:[0,-.168],
   forehead:[0,.092],temple:[.083,.037],eye:[.042,.006],
   cheek:[.068,-.067],nostril:[-.018,-.072],mouth:[0,-.124],
   jaw:[.078,-.146],wrinkle:[.082,.003],freckle:[-.073,-.064],
   pore:[.068,-.095],dimple:[.067,-.116]
  };
  function surfaceHit(x,y,includeHair=false){
   const originZ=bodyBox.max.z+Math.max(.35,.4*modelFaceScale);
   const ray=new T.Raycaster(new T.Vector3(x,y,originZ),
    new T.Vector3(0,0,-1),0,Math.max(bodySize.z*3,4*modelFaceScale));
   const targets=includeHair?[...hairSurfaces,...surfaceTargets]:surfaceTargets;
   return ray.intersectObjects(targets,false)[0]||null;
  }
  for(const w of ITEMS){
   const [px,dy]=coords[w.id]||[0,0];
   const x=px*modelFaceScale,y=portraitFocus+dy*modelFaceScale;
   const hit=surfaceHit(x,y,w.id==='hair'||w.id==='eyebrow'||w.id==='eyelash');
   const pin=new T.Mesh(new T.SphereGeometry(.009*modelFaceScale,16,12),
    new T.MeshStandardMaterial({color:w.group==='skin'?0xf7a7ca:0xbda8ff,
      roughness:.35,metalness:.05,depthTest:true,depthWrite:false,emissive:0x131123}));
   pin.userData.feature=w.id;
   pin.renderOrder=50;
   const z=hit?hit.point.z+.012*modelFaceScale:bodyBox.max.z+.02*modelFaceScale;
   pin.position.set(x,y,z);
   headGroup.add(pin);pins3d.set(w.id,pin);
  }
  // Skin study effects. These are 3D visual cues and facial blendshapes,
  // not scientific skin simulations.
  const freckles=new T.Group(),pores=new T.Group(),wrinkles=new T.Group();
  const rnd=seedRand(134791);
  for(let i=0;i<140;i++){
   const left=i%2?-1:1,x=left*(.035+rnd()*.053)*modelFaceScale,y=portraitFocus-(.026+rnd()*.073)*modelFaceScale;
   const h=surfaceHit(x,y);if(!h)continue;
   const dot=new T.Mesh(new T.CircleGeometry((.0018+rnd()*.0015)*modelFaceScale,8),
     new T.MeshBasicMaterial({color:0x79503b,side:T.DoubleSide,transparent:true,opacity:.53,depthWrite:false}));
   dot.position.copy(h.point).add(new T.Vector3(0,0,.002*modelFaceScale));
   freckles.add(dot);
  }
  for(let i=0;i<180;i++){
   const side=i%2?-1:1,x=side*(.025+rnd()*.069)*modelFaceScale,y=portraitFocus-(.012+rnd()*.102)*modelFaceScale;
   const h=surfaceHit(x,y);if(!h)continue;
   const dot=new T.Mesh(new T.CircleGeometry((.00065+rnd()*.0003)*modelFaceScale,6),
     new T.MeshBasicMaterial({color:0x795b50,side:T.DoubleSide,transparent:true,opacity:.28,depthWrite:false}));
   dot.position.copy(h.point).add(new T.Vector3(0,0,.0015*modelFaceScale));pores.add(dot);
  }
  for(const side of [-1,1])for(let j=0;j<3;j++){
   const points=[];
   for(let k=0;k<9;k++){
    const t=k/8,x=side*(.067+t*.028)*modelFaceScale,y=portraitFocus+(.009-j*.006+Math.sin(t*Math.PI)*.003)*modelFaceScale;
    const h=surfaceHit(x,y);if(h)points.push(h.point.clone().add(new T.Vector3(0,0,.0025*modelFaceScale)));
   }
   if(points.length<2)continue;
   const line=new T.Line(new T.BufferGeometry().setFromPoints(points),
    new T.LineBasicMaterial({color:0x876054,transparent:true,opacity:.30,depthWrite:false}));
   wrinkles.add(line);
  }
  scene.add(freckles,pores,wrinkles);
  const faceMorphs=allMeshes.filter(m=>m.morphTargetDictionary&&m.morphTargetInfluences);
  // Preserve a neutral expression while allowing gentle human-like blinking.
  let nextBlink=0,blinkStart=-10;
  function animateBlink(time){
   if(time>=nextBlink){blinkStart=time;nextBlink=time+2600+Math.random()*3000}
   const elapsed=time-blinkStart;
   const amount=elapsed>=0&&elapsed<=180?Math.sin(Math.PI*elapsed/180):0;
   for(const mesh of faceMorphs){
    for(const name of ['eyeBlinkLeft','eyeBlinkRight']){
     const i=mesh.morphTargetDictionary[name];
     if(i!==undefined)mesh.morphTargetInfluences[i]=amount;
    }
   }
  }

  portraitUpdater=values=>{
   freckles.children.forEach((o,i)=>o.visible=i<Math.round(values.freckles/100*freckles.children.length));
   pores.children.forEach((o,i)=>o.visible=i<Math.round(values.pores/100*pores.children.length));
   wrinkles.visible=values.wrinkles>0;
   wrinkles.children.forEach(o=>o.material.opacity=.05+values.wrinkles/100*.5);
   for(const mesh of faceMorphs){
    for(const [name,value] of [
     ['mouthSmileLeft',values.dimples/100*.55],
     ['mouthSmileRight',values.dimples/100*.55],
     ['cheekSquintLeft',values.dimples/100*.25],
     ['cheekSquintRight',values.dimples/100*.25]
    ]){
     const index=mesh.morphTargetDictionary[name];
     if(index!==undefined)mesh.morphTargetInfluences[index]=value;
    }
   }
  };
  portraitActive=true;
  portraitUpdater(state.settings);
  function pickedAt(e){
   const rect=renderer.domElement.getBoundingClientRect();
   const ndc=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,
    -(e.clientY-rect.top)/rect.height*2+1);
   raycaster.setFromCamera(ndc,camera);
   const hits=raycaster.intersectObjects([...pins3d.values()].filter(m=>m.visible),false);
   return hits[0]?.object.userData.feature||null;
  }
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
  renderer.domElement.addEventListener('pointercancel',()=>{down=null});
  renderer.domElement.addEventListener('pointerup',e=>{
   if(!down)return;
   const dist=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;
   if(dist>9)return;
   const id=pickedAt(e);if(id)hitFeature(id);
  });
  if(generation!==loadGeneration)return;
  ready3d=true;set2D(false);refreshPins();resize3D();
  let previous=0;
  function frame(t){
   if(generation!==loadGeneration)return;
   requestAnimationFrame(frame);
   if(!using3d||t-previous<14)return;
   previous=t;animateBlink(t);controls.update();renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
  if('ResizeObserver' in window)new ResizeObserver(resize3D).observe($('canvas3d'));
  window.addEventListener('resize',resize3D);
  $('stageLoading').textContent=customURL?'Your GLB · Imported successfully':'Female sample GLB · Imported successfully';
  status(customURL?'Your 3D model loaded.':'Female sample loaded.',
   customURL?'The model was read locally, without uploading it to a server.':'This is a licensed example, not the Tripo model. You can import your own GLB.','ok');
 }catch(err){
  if(generation!==loadGeneration)return;
  console.error('3D model failed to load; keeping the 2D lab usable.',err);
  ready3d=false;portraitActive=false;set2D(true);
  $('stageLoading').textContent='2D mode · 3D portrait unavailable';
  status('2D mode available.',
   'The model could not load. Use a self-contained GLB or check Internet/WebGL, then retry.');
 }
}

function resize3D(){
 if(!renderer||!camera||!using3d)return;
 const el=$('canvas3d'),w=el.clientWidth,h=el.clientHeight;
 if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function bindEvents(){
 $('modelUpload').addEventListener('change',async event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  event.target.value='';
  if(!/\.glb$/i.test(file.name)){
   status('Unsupported model type.','Please choose a .glb file that includes its own textures.','bad');return;
  }
  if(file.size>120*1024*1024){
   status('This model is too large.','Choose a GLB under 120 MB for reasonable browser performance.','bad');return;
  }
  const previous=activeObjectURL;
  activeObjectURL=URL.createObjectURL(file);
  $('stageLoading').textContent='Importing '+file.name+'…';
  status('Loading your model.','This runs inside your browser. No file is uploaded to a server.');
  await init3D(activeObjectURL);
  if(previous)URL.revokeObjectURL(previous);
 });
 $('sampleModel').addEventListener('click',async()=>{
  if(activeObjectURL){URL.revokeObjectURL(activeObjectURL);activeObjectURL=null;}
  await init3D();
 });

 document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 document.querySelectorAll('.groupbtn').forEach(b=>b.addEventListener('click',()=>{
  group=b.dataset.group;selectedWord=null;
  document.querySelectorAll('.groupbtn').forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.group===group)));
  renderBank();refreshPins();status('Label group: '+group+'.','Match all words in this group.');
 }));
 $('pronounce').addEventListener('click',()=>pronounce(selectedPin));
 $('nextWord').addEventListener('click',()=>{
  const next=ITEMS.find(w=>!state.found.includes(w.id))||ITEMS[0];
  setHint(next.id);status('Next word: '+next.name+'.','Find the highlighted marker to discover it.');
 });
 $('audioToggle').addEventListener('click',()=>{
  state.voice=!state.voice;persist();$('audioToggle').textContent=state.voice?'🔊 Voice on':'🔇 Voice off';
  if(!state.voice&&'speechSynthesis' in window)speechSynthesis.cancel();
  status(state.voice?'Voice enabled.':'Voice muted.');
 });
 $('audioToggle').textContent=state.voice?'🔊 Voice on':'🔇 Voice off';
 $('labelHint').addEventListener('click',()=>{
  if(!selectedWord){status('Select a label first.','Then ask for its location hint.');return}
  status('Hint: '+BY_ID[selectedWord].tip,'Find the corresponding pin.');
 });
 $('labelSolution').addEventListener('click',()=>{
  if(!selectedWord){status('Select a label first.');return}
  setHint(selectedWord);
 });
 $('labelReset').addEventListener('click',()=>{
  if(!confirm('Clear all label matches? Your discovered words will remain.'))return;
  state.matched=[];persist();selectedWord=null;hintedId=null;renderBank();updateStats();refreshPins();status('Label challenge restarted.','Your previous discoveries are preserved.');
 });
 for(const k of Object.keys(state.settings)){
  $(k).value=state.settings[k];$(k+'Value').textContent=state.settings[k]+'%';
  $(k).addEventListener('input',sliderChange);
 }
 $('presetClear').addEventListener('click',()=>setSettings({freckles:0,wrinkles:0,pores:0,dimples:0}));
 $('presetAll').addEventListener('click',()=>setSettings({freckles:85,wrinkles:72,pores:73,dimples:65}));
 $('presetSmile').addEventListener('click',()=>setSettings({dimples:90}));
 $('missionCheck').addEventListener('click',checkMission);
 $('missionNext').addEventListener('click',changeMission);
 $('missionHint').addEventListener('click',()=>{
  const hint=$('missionHintText');hint.textContent=MISSIONS[state.mission].hint;hint.classList.remove('hide');
  status('Hint shown.','You still need to perform the objective.');
 });
 $('frontView').addEventListener('click',()=>view([0,portraitFocus,modelOrbitDistance]));
 $('sideView').addEventListener('click',()=>view([modelOrbitDistance,portraitFocus,0]));
 $('backView').addEventListener('click',()=>view([0,portraitFocus,-modelOrbitDistance]));
 $('resetCamera').addEventListener('click',()=>{if(ready3d){view([0,.1,5.65]);controls.reset();view([0,.1,5.65])}else status('2D view centered.','The photo is displayed at its original scale.')});
 $('toggleMarkers').addEventListener('click',()=>{
  markersVisible=!markersVisible;
  $('toggleMarkers').textContent=markersVisible?'◉ Hide markers':'◌ Show markers';
  refreshPins();
  status(markersVisible?'Markers visible.':'Markers hidden.',
    'Label Challenge and Missions always keep markers visible so you can still complete tasks.');
 });
 $('toggle2d').addEventListener('click',()=>{
  if(!ready3d){set2D(true);status('3D is unavailable.','Use a browser with WebGL and an Internet connection for Three.js.');return}
  set2D(using3d);
  status(using3d?'3D mode enabled.':'2D mode enabled.','Your progress and slider settings are unchanged.');
 });
 $('resetAll').addEventListener('click',()=>{
  if(!confirm('Reset discovered words, label matches, all missions, and skin sliders?'))return;
  state=defaults();lastAction={id:null,serial:++serial};selectedPin=null;selectedWord=null;hintedId=null;missionEntrySerial=serial;
  persist();$('audioToggle').textContent='🔊 Voice on';
  for(const k of Object.keys(state.settings)){$(k).value=0;$(k+'Value').textContent='0%'}
  drawDetails();updateStats();renderBank();renderMission();refreshPins();status('All progress reset.','Start exploring again.');
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){selectedWord=null;hintedId=null;renderBank();refreshPins()}});
}
function main(){
 create2DPins();bindEvents();renderGlossary();renderBank();renderMission();updateStats();
 if(photo.complete&&photo.naturalWidth){photoReady=true;drawDetails()}
 else{
  photo.addEventListener('load',()=>{photoReady=true;drawDetails()},{once:true});
  photo.addEventListener('error',()=>{console.warn('2D reference photo failed to load.')},{once:true});
 }
 init3D();
}
main();
