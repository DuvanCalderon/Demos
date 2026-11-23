'use strict';
/* Face Features Lab — educational 2D portrait laboratory with real CC0 photography. */

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
const PHOTO_MARKERS={
 hair:[.57,.064],skin:[.42,.56],eyebrow:[.47,.354],eyelash:[.485,.456],
 ear:[.891,.477],nose:[.633,.557],mole:[.697,.747],lip:[.631,.693],
 chin:[.636,.817],forehead:[.635,.238],temple:[.869,.342],eye:[.743,.432],
 cheek:[.765,.564],nostril:[.600,.604],mouth:[.641,.669],jaw:[.822,.758],
 wrinkle:[.838,.455],freckle:[.49,.54],pore:[.713,.563],dimple:[.438,.661]
};
const canvas=document.getElementById('skinOverlay');
const paint=canvas.getContext('2d');
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
  b.style.left=(PHOTO_MARKERS[w.id][0]*100)+'%';b.style.top=(PHOTO_MARKERS[w.id][1]*100)+'%';
  b.title=w.name;b.setAttribute('aria-label','Inspect '+w.name);
  b.addEventListener('click',()=>hitFeature(w.id));holder.append(b);
 }
 refreshPins();
}
function random(seed){let t=seed|0;return()=>{t=(Math.imul(t,1664525)+1013904223)|0;return (t>>>0)/4294967296}}
function drawDetails(){
 const s=state.settings,W=960,H=974;
 canvas.width=W;canvas.height=H;paint.clearRect(0,0,W,H);
 const freckles=random(2174);
 for(let i=0;i<s.freckles*2;i++){
  const left=i%2?1:-1,x=(left<0?470:750)+(freckles()-.5)*132;
  const y=485+freckles()*120;
  paint.fillStyle='rgba(100,57,37,'+(.15+freckles()*.38)+')';
  paint.beginPath();paint.ellipse(x,y,1.4+freckles()*2.4,1+freckles()*2.3,0,0,Math.PI*2);paint.fill();
 }
 const wrinkles=s.wrinkles/100;paint.lineWidth=2.1;
 for(const side of [-1,1])for(let k=0;k<4;k++){
  const x=side<0?392:820,y=438+k*14;
  paint.strokeStyle='rgba(85,54,49,'+(wrinkles*(.25+k*.075))+')';
  paint.beginPath();paint.moveTo(x,y);
  paint.quadraticCurveTo(x+side*30,y-14,x+side*(47+k*7),y+2);paint.stroke();
 }
 const pores=random(853);
 for(let i=0;i<s.pores*6.5;i++){
  const side=i%2?-1:1,x=(side<0?500:731)+(pores()-.5)*125;
  const y=493+pores()*146;
  paint.fillStyle='rgba(74,52,50,'+(.12+pores()*.27)+')';
  paint.beginPath();paint.arc(x,y,.55+pores()*1.15,0,Math.PI*2);paint.fill();
 }
 const dimples=s.dimples/100;
 if(dimples){
  for(const [cx,cy] of [[425,641],[776,653]]){
   const g=paint.createRadialGradient(cx,cy,3,cx,cy,36);
   g.addColorStop(0,'rgba(90,44,49,'+(dimples*.38)+')');
   g.addColorStop(1,'rgba(90,44,49,0)');
   paint.fillStyle=g;paint.beginPath();paint.arc(cx,cy,38,0,Math.PI*2);paint.fill();
  }
 }
}
function sliderChange(e){
 const id=e.currentTarget.id;state.settings[id]=Number(e.currentTarget.value);
 $(id+'Value').textContent=state.settings[id]+'%';persist();drawDetails();
 status('Updated: '+id+'.','The effect is overlaid on the real photograph.','ok');
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
 $('toggleMarkers').addEventListener('click',()=>{
  markersVisible=!markersVisible;
  $('toggleMarkers').textContent=markersVisible?'◉ Hide markers':'◌ Show markers';
  refreshPins();
  status(markersVisible?'Markers visible.':'Markers hidden.',
    'Challenges and missions always display the markers.');
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
 const photo=$('facePhoto');
 photo.addEventListener('error',()=>{
  status('Photo unavailable.','Check your Internet connection and reload the page.','bad');
 });
 drawDetails();
 status('2D photo lab ready.','Click a marker to learn an English facial word.','ok');
}
main();
