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
let lastAction={id:null,serial:0},serial=0,missionEntrySerial=0;
let THREE=null,scene=null,camera=null,renderer=null,controls=null,headGroup=null,faceMesh=null,photoTexture=null,material=null,raycaster=null;
let pins3d=new Map(),models=[],ready3d=false,using3d=false,photoReady=false,renderRequested=false;
let scanBasePositions=null,scanFaceTargets={},skinLayers={},skinMaterial=null,scanNormalMap=null;
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
  const id=b.dataset.id;b.hidden=!featureVisible(id);
  b.classList.toggle('selected',selectedPin===id);
  b.classList.toggle('matched',state.matched.includes(id));
  b.classList.toggle('hint',hintedId===id);
 }
 for(const [id,p] of pins3d){
  p.visible=featureVisible(id);
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
 if(faceMesh)updateSkinDetails();
}

/* Surface coordinates are in the imported scan's native space. The model is a
   real, closed-head scan, not a billboard or a photograph projected onto a plane. */
function scanXY(w){
 const px=w.xy[0],py=w.xy[1];
 return {x:(px-318)*.017, y:(380-py)*.014};
}
function scanHit(x,y){
 if(!THREE||!faceMesh)return null;
 const origin=new THREE.Vector3(x,y,8);
 const cast=new THREE.Raycaster(origin,new THREE.Vector3(0,0,-1),0,16);
 const hit=cast.intersectObject(faceMesh,false)[0];
 return hit||null;
}
function placeAnchor(id){
 const w=BY_ID[id],p=pins3d.get(id);
 if(!p||!w)return;
 const xy=scanXY(w),hit=scanHit(xy.x,xy.y);
 if(hit){
  const normal=hit.face.normal.clone().transformDirection(faceMesh.matrixWorld).normalize();
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
   const x=side*(1.05+rnd()*.85);
   const y=isPore?-.85+rnd()*1.40:-.42+rnd()*1.20;
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
    const y=.67-j*.15+Math.sin(t*Math.PI)*.085;
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
 camera.position.set(...position);controls.target.set(0,-.08,0);controls.update();
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

async function init3D(){
 try{
  const [T,orbit,loaderModule]=await Promise.all([
   import('three'),
   import('three/addons/controls/OrbitControls.js'),
   import('three/addons/loaders/GLTFLoader.js')
  ]);
  THREE=T;
  const host=$('canvas3d');
  renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.18;
  host.append(renderer.domElement);
  scene=new T.Scene();
  scene.fog=new T.FogExp2(0x19283f,.035);
  camera=new T.PerspectiveCamera(36,1,.1,60);
  camera.position.set(0,.12,7.2);
  controls=new orbit.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.07;
  controls.target.set(0,-.08,0);
  controls.minDistance=3.5;controls.maxDistance=12;controls.enablePan=true;
  controls.maxPolarAngle=Math.PI-.04;controls.minPolarAngle=.04;
  scene.add(new T.HemisphereLight(0xdce6ff,0x484155,1.25));
  const key=new T.DirectionalLight(0xffe6ce,3.5);
  key.position.set(-3,5,6);scene.add(key);
  const fill=new T.DirectionalLight(0xe2f0ff,1.4);
  fill.position.set(4,1,4);scene.add(fill);
  const rim=new T.DirectionalLight(0xb9c4ff,2.4);
  rim.position.set(2.5,4,-5);scene.add(rim);
  const bounce=new T.DirectionalLight(0xffd9c6,.52);
  bounce.position.set(0,-3,4);scene.add(bounce);
  headGroup=new T.Group();
  headGroup.scale.setScalar(.41);
  headGroup.position.y=-.07;scene.add(headGroup);
  const textureLoader=new T.TextureLoader();
  const loadTexture=url=>new Promise((resolve,reject)=>textureLoader.load(url,resolve,undefined,reject));
  $('stageLoading').textContent='Loading scanned face and skin maps…';
  const loader=new loaderModule.GLTFLoader();
  const modelP=new Promise((resolve,reject)=>loader.load(SCAN_ASSET+'LeePerrySmith.glb',resolve,undefined,reject));
  const [gltf,diffuse,specular,normal]=await Promise.all([
   modelP,
   loadTexture(SCAN_ASSET+'Map-COL.jpg'),
   loadTexture(SCAN_ASSET+'Map-SPEC.jpg'),
   loadTexture(SCAN_ASSET+'normal-map.jpg')
  ]);
  diffuse.colorSpace=T.SRGBColorSpace;
  specular.colorSpace=T.SRGBColorSpace;
  diffuse.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  normal.anisotropy=diffuse.anisotropy;
  skinMaterial=new T.MeshPhongMaterial({
   color:0xf3edeb,
   map:diffuse,
   normalMap:normal,
   normalScale:new T.Vector2(.9,.9),
   specularMap:specular,
   specular:0x393333,
   shininess:28
  });
  const scan=gltf.scene.getObjectByName('LeePerrySmith')||
   gltf.scene.getObjectByProperty('type','Mesh');
  if(!scan?.geometry)throw new Error('Scanned face geometry not found in GLB.');
  faceMesh=new T.Mesh(scan.geometry.clone(),skinMaterial);
  faceMesh.name='Licensed realistic face scan';
  faceMesh.geometry.computeVertexNormals();
  faceMesh.geometry.computeBoundingSphere();
  scanBasePositions=faceMesh.geometry.attributes.position.array.slice();
  headGroup.add(faceMesh);
  raycaster=new T.Raycaster();
  headGroup.updateMatrixWorld(true);
  for(const w of ITEMS){
   const marker=new T.Mesh(
    new T.SphereGeometry(.145,18,12),
    new T.MeshStandardMaterial({
     color:w.group==='skin'?0xf7a7ca:0xbda8ff,
     roughness:.4,metalness:.08,emissive:0x131123,
     transparent:true,opacity:.93,depthTest:true
    })
   );
   marker.name='Vocabulary marker: '+w.name;
   marker.userData.feature=w.id;
   headGroup.add(marker);
   pins3d.set(w.id,marker);
  }
  for(const w of ITEMS)placeAnchor(w.id);
  makeSkinLayers();
  updateSkinDetails();
  let pointerDown=null;
  renderer.domElement.addEventListener('pointerdown',e=>{
   pointerDown={x:e.clientX,y:e.clientY};
  });
  renderer.domElement.addEventListener('pointerup',e=>{
   if(!pointerDown)return;
   const d=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);
   pointerDown=null;if(d>8)return;
   const id=pick3d(e.clientX,e.clientY);
   if(id)hitFeature(id);
  });
  renderer.domElement.addEventListener('pointercancel',()=>pointerDown=null);
  ready3d=true;set2D(false);refreshPins();resize3D();
  let lastFrame=0;
  function animate(timestamp){
   requestAnimationFrame(animate);
   if(!using3d)return;
   // Cap redraw rate on weaker devices while keeping orbit controls responsive.
   if(timestamp-lastFrame<14)return;
   lastFrame=timestamp;
   controls.update();renderer.render(scene,camera);
  }
  requestAnimationFrame(animate);
  if('ResizeObserver' in window)new ResizeObserver(resize3D).observe(host);
  window.addEventListener('resize',resize3D);
  $('stageLoading').textContent='Real scanned 3D head · Rotate / zoom / inspect';
  status('High-fidelity 3D scan loaded.',
   'This is a sculpted, textured human head: facial anatomy, skin texture and relief are actual 3D assets.','ok');
 }catch(err){
  console.error('3D scan or WebGL failed; 2D activities remain available.',err);
  ready3d=false;set2D(true);
  $('stageLoading').textContent='2D learning available · 3D assets could not load';
  status('2D learning mode ready.',
   '3D could not load. Check Internet, WebGL or the browser console; exercises still work.');
 }
}

function resize3D(){
 if(!renderer||!camera||!using3d)return;
 const el=$('canvas3d'),w=el.clientWidth,h=el.clientHeight;
 if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function bindEvents(){
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
 $('frontView').addEventListener('click',()=>view([0,.12,7.2]));
 $('sideView').addEventListener('click',()=>view([7.2,.12,.2]));
 $('backView').addEventListener('click',()=>view([0,.12,-7.2]));
 $('resetCamera').addEventListener('click',()=>{if(ready3d){view([0,.1,5.65]);controls.reset();view([0,.1,5.65])}else status('2D view centered.','The photo is displayed at its original scale.')});
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
