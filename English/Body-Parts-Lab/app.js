/* Body Atlas — English-only, dependency-free interactive anatomy vocabulary lab.
   Coordinates and silhouettes are approximate educational illustrations based on
   the user-provided bilingual reference image, not clinical anatomical models. */
"use strict";

const PARTS = [
 {id:"head",name:"Head",x:210,y:82,side:"right",labelY:66,group:"Upper body",definition:"The top part of your body, containing your brain, eyes, nose, and mouth.",example:"I wear a helmet to protect my head.",clue:"The part above your neck."},
 {id:"neck",name:"Neck",x:210,y:150,side:"left",labelY:145,group:"Upper body",definition:"The part that connects your head to your shoulders and torso.",example:"My scarf keeps my neck warm.",clue:"A necklace goes around it."},
 {id:"chest",name:"Chest",x:182,y:211,side:"left",labelY:204,group:"Torso",definition:"The front of your upper torso, over your ribs and lungs.",example:"The runner placed a hand on his chest.",clue:"The upper front of your torso."},
 {id:"breast",name:"Breast",x:238,y:226,side:"right",labelY:212,group:"Torso",definition:"The area of the chest containing breast tissue. People of all sexes have breast tissue.",example:"A breast is located on the chest.",clue:"This chest area contains breast tissue."},
 {id:"nipple",name:"Nipple",x:235,y:252,side:"right",labelY:252,group:"Torso",definition:"A small raised area near the center of each breast.",example:"The nipple is part of the breast.",clue:"Look at the surface of the breast."},
 {id:"abdomen",name:"Abdomen",x:187,y:291,side:"left",labelY:282,group:"Torso",definition:"The belly region between the chest and the pelvis.",example:"My abdomen feels sore after exercise.",clue:"Another word for the belly area."},
 {id:"waist",name:"Waist",x:157,y:328,side:"left",labelY:322,group:"Torso",definition:"The narrower area of the torso between your ribs and hips.",example:"This belt goes around my waist.",clue:"You wear a belt around this area."},
 {id:"navel",name:"Navel",x:210,y:334,side:"right",labelY:326,group:"Torso",definition:"The small mark in the middle of your abdomen, also called the belly button.",example:"My navel is in the middle of my belly.",clue:"Its everyday name is belly button."},
 {id:"hip",name:"Hip",x:154,y:371,side:"left",labelY:368,group:"Lower body",definition:"The side of the pelvis where the upper leg meets the torso.",example:"She rested her hand on her hip.",clue:"The joint area where the upper leg meets the pelvis."},
 {id:"forearm",name:"Forearm",x:312,y:319,side:"right",labelY:375,group:"Arms",definition:"The part of the arm between the elbow and the wrist.",example:"I rested my forearm on the desk.",clue:"The lower section of your arm."},
 {id:"groin",name:"Groin",x:246,y:383,side:"right",labelY:407,group:"Lower body",definition:"The region where the lower abdomen meets the upper inner thigh.",example:"A groin strain can happen during sports.",clue:"The crease between the lower belly and the inner thigh."},
 {id:"genitals",name:"Genitals",x:209,y:399,side:"left",labelY:412,group:"Lower body",definition:"The external reproductive organs in the pelvic region, covered here for a non-graphic diagram.",example:"The genitals are in the pelvic area.",clue:"External reproductive organs, in the covered pelvic region."},
 {id:"thigh",name:"Thigh",x:246,y:451,side:"right",labelY:461,group:"Legs",definition:"The upper part of the leg, between the hip and the knee.",example:"Cycling strengthens the thigh muscles.",clue:"The part above your knee."},
 {id:"knee",name:"Knee",x:241,y:495,side:"right",labelY:504,group:"Legs",definition:"The joint between the upper and lower parts of the leg.",example:"I bend my knee when I climb stairs.",clue:"The joint that bends in the middle of your leg."},
 {id:"leg",name:"Leg",x:171,y:549,side:"left",labelY:546,group:"Legs",definition:"The lower limb as a whole, from the hip down to the foot. In everyday English, 'leg' often means the whole limb.",example:"I hurt my leg playing basketball.",clue:"The whole lower limb, not just one small section."},
 {id:"shin",name:"Shin",x:245,y:561,side:"right",labelY:560,group:"Legs",definition:"The front of the lower leg, between the knee and ankle, over the shinbone.",example:"I bumped my shin against the table.",clue:"The front of the lower leg."},
 {id:"foot",name:"Foot",x:168,y:662,side:"right",labelY:657,group:"Legs",definition:"The lowest part of the leg, used for standing and walking.",example:"My left foot is inside my shoe.",clue:"You wear a shoe on this part."}
];
PARTS.push(...window.BODY_ATLAS_BACK_PARTS);
const BY_ID=Object.fromEntries(PARTS.map(part=>[part.id,part]));
const MISSIONS=[
 {id:"neck",scene:"You are choosing where to wear a necklace. Tap the part of the body the necklace goes around.",hint:"It connects your head to your shoulders."},
 {id:"shin",scene:"You bump the front of your lower leg against a table. Find the area that hurts.",hint:"Look below the knee, on the front of a lower leg."},
 {id:"navel",scene:"A friend asks: ‘Where is your belly button?’ Point to its anatomical name.",hint:"Find the little mark in the middle of the abdomen."},
 {id:"forearm",scene:"You roll up your sleeve between your elbow and wrist. Tap that part of your arm.",hint:"It is below the elbow and above the hand."},
 {id:"waist",scene:"You are measuring someone for a belt. Which body area do you measure?",hint:"Look between the ribs and the hips."},
 {id:"thigh",scene:"After cycling, the upper part of your leg feels tired. Tap it.",hint:"This part runs from the hip to the knee."},
 {id:"knee",scene:"You kneel down to tie a shoe. Which joint bends in the middle of your leg?",hint:"It is between the thigh and the lower leg."},
 {id:"groin",scene:"A soccer player strains the region where the lower abdomen meets the inner thigh. Locate it.",hint:"Look at the crease at the top of the inner thigh."}
];
MISSIONS.push(...window.BODY_ATLAS_BACK_MISSIONS);
const STORAGE_KEY="body-atlas-en-v2";
function defaults(){return {mode:"explore",model:"female",difficulty:"beginner",selected:null,explored:[],matched:[],xp:0,streak:0,labMistakes:0,labHinted:[],missionIndex:0,missionMistakes:0,missionHinted:[],missionCompleted:0,showNames:false,view:"2d",threeNames:false,orientation:"front"};}
function restore(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
  if(!raw||typeof raw!=="object")return defaults();
  const next={...defaults(),...raw};
  for(const k of ["explored","matched","labHinted","missionHinted"])next[k]=Array.isArray(next[k])?[...new Set(next[k].filter(id=>!!BY_ID[id]))]:[];
  if(!["explore","label","missions"].includes(next.mode))next.mode="explore";
  if(!["female","male"].includes(next.model))next.model="female";
  if(!["beginner","intermediate","expert"].includes(next.difficulty))next.difficulty="beginner";
  if(!Number.isInteger(next.missionIndex)||next.missionIndex<0||next.missionIndex>MISSIONS.length)next.missionIndex=0;
  for(const k of ["xp","labMistakes","missionMistakes","missionCompleted","streak"])next[k]=Math.max(0,Number(next[k])||0);
  next.selected=BY_ID[next.selected]?next.selected:null;
  next.showNames=!!next.showNames;
  next.threeNames=!!next.threeNames;
  next.view=["2d","3d"].includes(next.view)?next.view:"2d";
  next.orientation=next.orientation==="back"?"back":"front";
  return next;
 }catch{return defaults();}
}
let state=restore();
let armed=null,highlightId=null,errorId=null;
let feedback=null,gesture=null,suppressClickUntil=0;
const $=id=>document.getElementById(id);
const SVG_NS="http://www.w3.org/2000/svg";
let svg=$("bodySvg"),spots=$("hotspots");
const activity=$("activityView"),glossary=$("glossaryList"),ghost=$("dragGhost");
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{/* private browsing */}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function setFeedback(kind,title,detail){feedback={kind,title,detail};drawFeedback();}
function clearFeedback(){feedback=null;drawFeedback();}
function drawFeedback(){
 const node=$("feedback");node.className="feedback"+(feedback?" "+feedback.kind:"");
 node.replaceChildren();
 if(feedback){const b=document.createElement("strong");b.textContent=feedback.title;const t=document.createElement("span");t.textContent=feedback.detail;node.append(b,t);}
}
function setMode(mode){
 if(!["explore","label","missions"].includes(mode))return;
 state.mode=mode;armed=null;highlightId=null;errorId=null;
 if(mode==="missions"&&state.missionIndex<MISSIONS.length)state.orientation=sideFor(MISSIONS[state.missionIndex].id);
 clearFeedback();save();render();
 if(state.view==="3d")window.BodyAtlas3D?.goToSide?.(state.orientation);
}
function sideFor(id){return BY_ID[id]?.view||"front";}
function setOrientation(side){
 if(!["front","back"].includes(side))return;
 state.orientation=side;highlightId=null;errorId=null;save();render();
 if(state.view==="3d")window.BodyAtlas3D?.goToSide?.(side);
}
function showSideOf(id){
 const side=sideFor(id);if(side!==state.orientation){state.orientation=side;save();}
 if(state.view==="3d")window.BodyAtlas3D?.goToSide?.(side);
}
function changeModel(model){
 state.model=model;save();render();setFeedback("info",model==="female"?"Female silhouette selected.":"Male silhouette selected.","Anatomical vocabulary applies to both models; the drawing is schematic.");
}
function updateModel(){
 $("modelFemale").classList.toggle("selected",state.model==="female");
 $("modelMale").classList.toggle("selected",state.model==="male");
 $("modelFemale").setAttribute("aria-pressed",String(state.model==="female"));
 $("modelMale").setAttribute("aria-pressed",String(state.model==="male"));
 const torso=document.querySelector("#bodyArtwork > path:nth-of-type(5)");
 const female="M193 121 L193 158 Q171 165 153 177 Q148 192 154 218 Q159 250 158 278 Q154 311 142 357 Q138 379 147 392 Q170 405 210 407 Q250 405 273 392 Q282 379 278 357 Q266 314 262 278 Q261 251 267 219 Q272 192 267 177 Q248 165 228 158 L228 121Z";
 const male="M193 121 L193 158 Q164 167 144 177 Q143 197 151 225 Q161 249 159 284 Q158 316 148 355 Q145 379 152 389 Q176 403 210 407 Q245 403 269 389 Q276 379 272 355 Q262 316 261 284 Q259 249 269 225 Q277 197 276 177 Q255 167 228 158 L228 121Z";
 torso.setAttribute("d",state.model==="female"?female:male);
 $("femaleChest").classList.toggle("hidden",state.model!=="female");
 $("maleChest").classList.toggle("hidden",state.model!=="male");
 $("underwear").setAttribute("fill",state.model==="female"?"#5c6e92":"#3c5f70");
}
function makeSvg(tag,attrs){const el=document.createElementNS(SVG_NS,tag);for(const [key,val] of Object.entries(attrs||{}))el.setAttribute(key,String(val));return el;}
function renderSpots(){
 svg=$(state.orientation==="back"?"bodyBackSvg":"bodySvg");
 spots=$(state.orientation==="back"?"backHotspots":"hotspots");
 spots.replaceChildren();
 PARTS.forEach((part,i)=>{
  if((part.view||"front")!==state.orientation)return;
  const completed=state.matched.includes(part.id)&&state.mode==="label";
  const selected=state.selected===part.id||armed===part.id;
  const highlight=highlightId===part.id,wrong=errorId===part.id;
  const g=makeSvg("g",{class:"spot"+(completed?" completed":"")+(selected?" selected":"")+(highlight?" hint":"")+(wrong?" error":"")+(state.difficulty==="expert"&&state.mode==="label"?" hidden-spots":""),transform:`translate(${part.x} ${part.y})`,"data-id":part.id,role:"button",tabindex:"0","aria-label":state.mode==="explore"?`Explore ${part.name}`:`Anatomy position ${i+1}`});
  g.append(makeSvg("circle",{r:"19",fill:"transparent",class:"hit-circle"}));
  g.append(makeSvg("circle",{r:"15",class:"halo"}));
  g.append(makeSvg("circle",{r:"8",class:"target-core"}));
  g.append(makeSvg("circle",{r:"2.5",class:"target-center"}));
  if(state.mode==="label"&&state.difficulty==="beginner"&&!completed){
   const n=makeSvg("text",{class:"spot-text","text-anchor":"middle",dy:"3.5",style:"font-size:8px"});n.textContent=String(i+1);g.append(n);
  }
  if(state.showNames&&state.mode==="explore"){
   const lx=part.side==="left"?68:354,ly=part.labelY;
   const connector=makeSvg("path",{d:`M0 0 L${lx-part.x+(part.side==="left"?35:-35)} ${ly-part.y} L${lx-part.x} ${ly-part.y}`,stroke:"#8193b5","stroke-width":"1",fill:"none",opacity:".85","pointer-events":"none"});
   g.append(connector);
   const text=makeSvg("text",{x:lx-part.x,y:ly-part.y-4,class:"map-label","text-anchor":part.side==="left"?"start":"end"});text.textContent=part.name;g.append(text);
  }
  g.addEventListener("click",()=>pickSpot(part.id));
  g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pickSpot(part.id);}});
  spots.append(g);
 });
}
function pickSpot(id){
 const part=BY_ID[id];if(!part)return;
 if(state.mode==="explore"){
  state.selected=id;
  const fresh=!state.explored.includes(id);
  if(fresh){state.explored.push(id);state.xp+=2;}
  save();render();
  setFeedback(fresh?"success":"info",fresh?"New word discovered!":`Reviewing: ${part.name}`,fresh?"You earned 2 XP. Read the meaning, then try saying the word aloud.":"Select another point to explore more vocabulary.");
 }else if(state.mode==="label"){
  if(!armed){setFeedback("info","Choose a word first.","Tap a word chip (or drag it onto the figure), then tap a glowing location.");return;}
  attemptLabel(armed,id);
 }else if(state.mode==="missions")attemptMission(id);
}
function attemptLabel(wordId,locationId){
 if(state.matched.includes(wordId))return;
 if(wordId===locationId){
  state.matched.push(wordId);state.streak++;state.selected=wordId;
  const gained=state.labHinted.includes(wordId)?5:10;
  state.xp+=gained;armed=null;highlightId=null;errorId=null;
  save();render();
  if(state.matched.length===PARTS.length)setFeedback("success","Lab completed — 30 / 30!","All labels are in the correct places. Restart the labels to practice again.");
  else setFeedback("success",`Correct! ${BY_ID[wordId].name}`,`+${gained} XP · ${BY_ID[wordId].definition}`);
 }else{
  state.labMistakes++;state.streak=0;errorId=locationId;highlightId=null;save();render();
  setFeedback("warning","Not quite — try another spot.",`That location is not ${BY_ID[wordId].name.toLowerCase()}. ${BY_ID[wordId].clue}`);
 }
}
function attemptMission(locationId){
 if(state.missionIndex>=MISSIONS.length)return;
 const task=MISSIONS[state.missionIndex],correct=task.id===locationId;
 if(correct){
  const gained=state.missionHinted.includes(task.id)?8:15;
  state.xp+=gained;state.missionIndex++;state.selected=task.id;highlightId=null;errorId=null;state.streak++;
  if(state.missionIndex<MISSIONS.length)state.orientation=sideFor(MISSIONS[state.missionIndex].id);
  if(state.missionIndex===MISSIONS.length)state.missionCompleted++;
  save();render();
  if(state.view==="3d"&&state.missionIndex<MISSIONS.length)window.BodyAtlas3D?.goToSide?.(state.orientation);
  setFeedback("success",`Great choice — ${BY_ID[task.id].name}!`,`+${gained} XP · ${BY_ID[task.id].definition}`);
 }else{
  state.missionMistakes++;state.streak=0;errorId=locationId;highlightId=null;save();render();
  setFeedback("warning","Try again.",`This location is the ${BY_ID[locationId].name.toLowerCase()}. Think about the situation and choose another point.`);
 }
}
function chooseWord(id){
 if(state.matched.includes(id))return;
 armed=armed===id?null:id;highlightId=null;errorId=null;
 if(armed)state.orientation=sideFor(armed);
 save();render();
 if(armed&&state.view==="3d")window.BodyAtlas3D?.goToSide?.(state.orientation);
 if(armed)setFeedback("info",`Place: ${BY_ID[armed].name}`,"Drag this chip to the body or tap the correct glowing point.");
 else clearFeedback();
}
function nextUnmatched(){return PARTS.find(p=>!state.matched.includes(p.id));}
function giveHint(reveal=false){
 const id=armed||nextUnmatched()?.id;
 if(!id){setFeedback("success","Everything is placed!","Use Restart labels for a fresh round.");return;}
 armed=id;state.orientation=sideFor(id);highlightId=reveal?id:null;
 if(!state.labHinted.includes(id))state.labHinted.push(id);
 save();render();
 if(state.view==="3d")window.BodyAtlas3D?.goToSide?.(state.orientation);
 setFeedback("info",reveal?`Location shown: ${BY_ID[id].name}`:`Hint for ${BY_ID[id].name}`,reveal?"Follow the gold halo, then place the chip yourself. A reveal does not complete the task.":BY_ID[id].clue+" (Hints reduce XP for this word.)");
}
function missionHint(reveal=false){
 const task=MISSIONS[state.missionIndex];if(!task)return;
 if(!state.missionHinted.includes(task.id))state.missionHinted.push(task.id);
 state.orientation=sideFor(task.id);highlightId=reveal?task.id:null;save();render();
 if(state.view==="3d")window.BodyAtlas3D?.goToSide?.(state.orientation);
 setFeedback("info",reveal?"Target highlighted":"Mission hint",reveal?`The gold halo marks the ${BY_ID[task.id].name.toLowerCase()}. Tap it yourself to complete the mission.`:task.hint+" (Hints reduce XP.)");
}
function resetLab(){
 state.matched=[];state.labHinted=[];state.labMistakes=0;armed=null;highlightId=null;errorId=null;save();render();
 setFeedback("info","Labels restarted.","All 30 chips are available again. Your overall XP and discoveries are preserved.");
}
function resetMissions(){
 state.missionIndex=0;state.missionMistakes=0;state.missionHinted=[];highlightId=null;errorId=null;state.orientation="front";save();render();
 if(state.view==="3d")window.BodyAtlas3D?.goToSide?.("front");
 setFeedback("info","Missions restarted.","Begin again at mission 1. Your saved XP remains.");
}
function renderActivity(){
 const progress=state.matched.length;
 $("activityKicker").textContent=state.mode==="explore"?"YOUR LEARNING SPACE":state.mode==="label"?"DRAG & PLACE LAB":"REAL-LIFE CHALLENGES";
 $("activityCounter").textContent=state.mode==="explore"?"01 / 03":state.mode==="label"?"02 / 03":"03 / 03";
 if(state.mode==="explore"){
  const p=BY_ID[state.selected];
  activity.innerHTML=`<span class="overline">MODE 01 — DISCOVER</span>
   <h3>Meet your <span class="intro-accent">body.</span></h3>
   <p>Select any glowing point on the figure to learn its English name, pronunciation, and everyday use.</p>
   <div class="panel-progress"><span>Words discovered</span><strong>${state.explored.length} / ${PARTS.length}</strong></div>
   <div class="progress-track" aria-label="Words discovered"><div class="progress-fill" style="width:${state.explored.length/PARTS.length*100}%"></div></div>
   ${p?`<div class="detail-card">
      <div class="detail-row"><div><span class="tag">${esc(p.group)}</span><h4>${esc(p.name)}</h4></div><button id="speakButton" type="button" class="audio-btn" title="Listen to the pronunciation of ${esc(p.name)}" aria-label="Pronounce ${esc(p.name)}">♫</button></div>
      <p>${esc(p.definition)}</p><p class="usage">“${esc(p.example)}”</p>
   </div>`:`<div class="tip" style="margin-top:18px"><strong>Start here.</strong> Touch the head, neck, or another point on the model. All 30 words are available on both silhouettes.</div>`}
   <div class="button-row"><button id="goLabel" class="primary-button" type="button">Practice labeling →</button></div>`;
 }else if(state.mode==="label"){
  activity.innerHTML=`<span class="overline">MODE 02 — ACTIVE RECALL</span>
   <h3>Put words <span class="intro-accent">in place.</span></h3>
   <p class="label-instruction">Drag each English label onto the correct body point, or tap a chip then tap its location.</p>
   <div class="panel-progress"><span>Correct placements</span><strong>${progress} / ${PARTS.length}</strong></div>
   <div class="progress-track" aria-label="Correct placements"><div class="progress-fill" style="width:${progress/PARTS.length*100}%"></div></div>
   <div class="segmented" role="group" aria-label="Difficulty level">
    ${["beginner","intermediate","expert"].map(d=>`<button type="button" data-difficulty="${d}" class="${state.difficulty===d?"selected":""}" aria-pressed="${state.difficulty===d}">${d[0].toUpperCase()+d.slice(1)}</button>`).join("")}
   </div>
   <div class="word-bank" aria-label="Draggable English body part labels">
    ${[...PARTS].sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<button type="button" class="word-chip ${armed===p.id?"armed":""} ${state.matched.includes(p.id)?"matched":""}" data-word="${p.id}" ${state.matched.includes(p.id)?"disabled":""} aria-pressed="${armed===p.id}"><span class="chip-handle" aria-hidden="true">⠿</span>${esc(p.name)}</button>`).join("")}
   </div>
   <div class="button-row"><button id="labHint" type="button" class="secondary-button">◌ Hint</button><button id="labReveal" type="button" class="secondary-button">◎ Reveal location</button><button id="labReset" type="button" class="secondary-button">↺ Restart labels</button></div>
   <p class="mission-note">Mistakes: ${state.labMistakes} · Hints earn fewer XP · ${state.difficulty==="beginner"?"Numbered targets":state.difficulty==="intermediate"?"Unnumbered targets":"Subtle targets"}.</p>`;
 }else{
  const i=state.missionIndex;
  if(i>=MISSIONS.length){
   activity.innerHTML=`<span class="overline">MODE 03 — COMPLETED</span><div class="mission-result"><h3>Mission accomplished!</h3><div class="score-big">${MISSIONS.length} / ${MISSIONS.length}</div><p>You correctly identified every scenario. The best learning comes from doing it again without hints.</p><p>Incorrect attempts this round: ${state.missionMistakes}</p></div><div class="button-row"><button type="button" id="missionRestart" class="primary-button">↺ Replay missions</button><button type="button" id="goLabel" class="secondary-button">Try Label Lab</button></div>`;
  }else{
   const task=MISSIONS[i];
   activity.innerHTML=`<span class="overline">MODE 03 — APPLY YOUR KNOWLEDGE</span>
    <h3>Think in <span class="intro-accent">context.</span></h3>
    <p>Read the everyday situation and tap the matching location on the model.</p>
    <div class="progress-steps" aria-label="Mission progress">${MISSIONS.map((_,n)=>`<span class="step ${n<i?"done":n===i?"current":""}"></span>`).join("")}</div>
    <p class="mission-title">SCENARIO ${String(i+1).padStart(2,"0")} / ${MISSIONS.length}</p>
    <div class="mission-scene"><p>${esc(task.scene)}</p></div>
    <div class="button-row"><button id="missionHint" type="button" class="secondary-button">◌ Give me a hint</button><button id="missionReveal" type="button" class="secondary-button">◎ Show the location</button><button id="missionRestart" type="button" class="secondary-button">↺ Restart</button></div>
    <p class="mission-note">Wrong attempts: ${state.missionMistakes}. Only the correct selection moves you forward.</p>`;
  }
 }
}
function renderGlossary(){
 const value=$("wordSearch").value.trim().toLocaleLowerCase("en");
 const items=PARTS.filter(p=>(p.name+" "+p.definition+" "+p.group).toLocaleLowerCase("en").includes(value));
 $("wordCount").textContent=String(PARTS.length);
 glossary.replaceChildren();
 if(!items.length){const p=document.createElement("p");p.className="empty-search";p.textContent="No matching words. Try another search.";glossary.append(p);return;}
 for(const part of items){
  const btn=document.createElement("button");btn.type="button";
  btn.className="glossary-item"+(state.selected===part.id?" selected":"");
  const index=String(PARTS.indexOf(part)+1).padStart(2,"0");
  btn.innerHTML=`<span class="glossary-index">${index}</span><span class="glossary-name">${esc(part.name)}<span class="glossary-sub">${esc(part.group)}</span></span><span class="glossary-arrow">↗</span>`;
  btn.addEventListener("click",()=>{
   state.mode="explore";armed=null;highlightId=null;errorId=null;state.orientation=sideFor(part.id);clearFeedback();pickSpot(part.id);
   if(state.view==="3d")window.BodyAtlas3D?.goToSide?.(state.orientation);
  });
  glossary.append(btn);
 }
}
function render(){
 document.querySelectorAll("[data-mode]").forEach(btn=>{const active=btn.dataset.mode===state.mode;btn.classList.toggle("active",active);btn.setAttribute("aria-pressed",String(active));});
 $("xpCount").textContent=String(state.xp);
 $("toggleNamesBtn").disabled=state.mode!=="explore";
 $("toggleNamesBtn").textContent=state.mode==="explore"
    ?(state.view==="3d"?(state.threeNames?"Hide 3D names":"Show 3D names"):(state.showNames?"Hide map labels":"Show map labels"))
    :"Names available in Explore";
 $("view2dBtn").classList.toggle("selected",state.view==="2d");
 $("view3dBtn").classList.toggle("selected",state.view==="3d");
 $("view2dBtn").setAttribute("aria-pressed",String(state.view==="2d"));
 $("view3dBtn").setAttribute("aria-pressed",String(state.view==="3d"));
 $("frontSideBtn").classList.toggle("selected",state.orientation==="front");
 $("backSideBtn").classList.toggle("selected",state.orientation==="back");
 $("frontSideBtn").setAttribute("aria-pressed",String(state.orientation==="front"));
 $("backSideBtn").setAttribute("aria-pressed",String(state.orientation==="back"));
 $("bodySvg").hidden=state.orientation!=="front";
 $("bodyBackSvg").hidden=state.orientation!=="back";
 $("twoDViewport").hidden=state.view==="3d";
 $("threeViewport").hidden=state.view!=="3d";
 $("viewHelper").textContent=state.view==="3d"?"Orbit 360° • zoom • select anatomy markers":"Select parts on the interactive diagram";
 $("orientationLabel").textContent=state.view==="3d"?"360° 3D VIEW":(state.orientation==="back"?"BACK VIEW":"FRONT VIEW");
 $("stageInstruction").textContent=state.view==="3d"
    ?(state.mode==="explore"?"Tap a 3D marker to discover a word":state.mode==="label"?"Drop a label onto a 3D marker":"Read the scenario • tap the 3D marker")
    :(state.mode==="explore"?"Tap a glowing marker • discover a new word":state.mode==="label"?"Drag a label or tap a label, then tap its spot":"Read the scenario • tap the correct point");
 updateModel();renderSpots();renderActivity();renderGlossary();
 if(window.BodyAtlas3D?.ready)window.BodyAtlas3D.update(window.BodyAtlasBridge.getState());
}
function pronounce(){
 const p=BY_ID[state.selected];
 if(!p)return;
 if(!("speechSynthesis" in window)){setFeedback("info","Audio unavailable","Your browser does not support built-in speech synthesis.");return;}
 try{
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(p.name.toLowerCase());
  utterance.lang="en-US";utterance.rate=.8;utterance.pitch=1;
  const voices=speechSynthesis.getVoices();
  const selected=voices.find(v=>v.lang==="en-US")||voices.find(v=>v.lang.startsWith("en"));
  if(selected)utterance.voice=selected;
  speechSynthesis.speak(utterance);
  setFeedback("info","Listen and repeat",`Say the word aloud: ${p.name}.`);
 }catch{setFeedback("info","Audio unavailable","Try saying the word aloud and checking your device audio settings.");}
}
function positionGhost(x,y){ghost.style.left=x+"px";ghost.style.top=y+"px";}
function dropTargetAt(clientX,clientY){
 if(state.view==="3d")return window.BodyAtlas3D?.hitTest(clientX,clientY)||null;
 const ctm=svg.getScreenCTM();if(!ctm)return null;
 const point=svg.createSVGPoint();point.x=clientX;point.y=clientY;
 const mapped=point.matrixTransform(ctm.inverse());
 let closest=null,distance=Infinity;
 PARTS.filter(p=>(p.view||"front")===state.orientation).forEach(p=>{const d=Math.hypot(mapped.x-p.x,mapped.y-p.y);if(d<distance){distance=d;closest=p;}});
 return distance<=27?closest?.id:null;
}
function pointerStart(e){
 const chip=e.target.closest?.("[data-word]");
 if(!chip||state.mode!=="label"||chip.disabled||e.button>0)return;
 gesture={id:chip.dataset.word,x:e.clientX,y:e.clientY,pointerId:e.pointerId,dragging:false};
 document.addEventListener("pointermove",pointerMove);
 document.addEventListener("pointerup",pointerEnd);
 document.addEventListener("pointercancel",pointerCancel);
}
function pointerMove(e){
 if(!gesture||e.pointerId!==gesture.pointerId)return;
 const distance=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y);
 if(!gesture.dragging&&distance<8)return;
 if(!gesture.dragging){
  gesture.dragging=true;ghost.hidden=false;ghost.textContent=BY_ID[gesture.id].name;
 }
 positionGhost(e.clientX,e.clientY);
 if(e.cancelable)e.preventDefault();
}
function pointerEnd(e){
 if(!gesture||e.pointerId!==gesture.pointerId)return;
 const g=gesture,wasDragging=g.dragging;releaseGesture();
 if(wasDragging){
  suppressClickUntil=Date.now()+300;
  armed=g.id;
  const dropped=dropTargetAt(e.clientX,e.clientY);
  if(dropped)attemptLabel(g.id,dropped);
  else{render();setFeedback("info",`${BY_ID[g.id].name} selected`,"The label wasn't dropped on a glowing target. Tap the correct point to place it.");}
 }
}
function pointerCancel(){releaseGesture();}
function releaseGesture(){gesture=null;ghost.hidden=true;document.removeEventListener("pointermove",pointerMove);document.removeEventListener("pointerup",pointerEnd);document.removeEventListener("pointercancel",pointerCancel);}
document.addEventListener("click",e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
activity.addEventListener("pointerdown",pointerStart);
activity.addEventListener("click",e=>{
 const btn=e.target.closest("button");if(!btn)return;
 if(btn.dataset.word){chooseWord(btn.dataset.word);return;}
 if(btn.dataset.difficulty){state.difficulty=btn.dataset.difficulty;armed=null;highlightId=null;save();render();setFeedback("info",`${state.difficulty} difficulty`,state.difficulty==="expert"?"Target points are less visible. Use memory and careful observation.":"Difficulty updated. Your previous correct placements are preserved.");return;}
 switch(btn.id){
  case"goLabel":setMode("label");break;
  case"speakButton":pronounce();break;
  case"labHint":giveHint(false);break;
  case"labReveal":giveHint(true);break;
  case"labReset":resetLab();break;
  case"missionHint":missionHint(false);break;
  case"missionReveal":missionHint(true);break;
  case"missionRestart":resetMissions();break;
 }
});
document.querySelectorAll(".mode-tab").forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.mode)));
function setView(view){
 if(!["2d","3d"].includes(view))return;
 state.view=view;save();render();
 if(view==="3d")window.BodyAtlas3D?.goToSide?.(state.orientation);
 if(view==="3d"&&!window.BodyAtlas3D?.ready){
  setFeedback("info","3D is loading","The 3D view needs an internet connection for Three.js and a browser with WebGL. The 2D view always remains available.");
 }
}
$("view2dBtn").addEventListener("click",()=>setView("2d"));
$("view3dBtn").addEventListener("click",()=>setView("3d"));
$("frontSideBtn").addEventListener("click",()=>setOrientation("front"));
$("backSideBtn").addEventListener("click",()=>setOrientation("back"));
$("modelFemale").addEventListener("click",()=>changeModel("female"));
$("modelMale").addEventListener("click",()=>changeModel("male"));
$("toggleNamesBtn").addEventListener("click",()=>{if(state.mode!=="explore")return;if(state.view==="3d")state.threeNames=!state.threeNames;else state.showNames=!state.showNames;save();render();});
$("wordSearch").addEventListener("input",renderGlossary);
const resetDialog=$("resetDialog");
$("resetAllBtn").addEventListener("click",()=>{if(typeof resetDialog.showModal==="function")resetDialog.showModal();else if(confirm("Erase all saved Body Atlas progress?"))resetEverything();});
$("cancelReset").addEventListener("click",()=>resetDialog.close());
$("confirmReset").addEventListener("click",()=>{resetDialog.close();resetEverything();});
function resetEverything(){
 state=defaults();armed=null;highlightId=null;errorId=null;$("wordSearch").value="";save();render();
 setFeedback("info","Fresh start!","All saved discoveries, placements, mission results, and XP have been reset.");
}
// Both renderers use the SAME authoritative learning state.
window.BodyAtlasBridge=Object.freeze({
 parts:PARTS.map(({id,name,view})=>({id,name,view:view||"front"})),
 getState:()=>({
  mode:state.mode,view:state.view,model:state.model,difficulty:state.difficulty,orientation:state.orientation,
  selected:state.selected,matched:[...state.matched],armed,highlightId,errorId,
  threeNames:state.threeNames
 }),
 selectSpot:id=>{state.orientation=sideFor(id);pickSpot(id);}
});
window.BodyAtlas3DFailed=()=>{
 const el=$("threeMessage");
 el.hidden=false;el.classList.add("error");
 el.textContent="The 3D library could not load. Check your internet connection or use the 2D lab, which works offline.";
};
render();
window.BodyAtlasDiagnostics=Object.freeze({getSnapshot:()=>JSON.parse(JSON.stringify(state)),getPartCount:()=>PARTS.length,getMissionCount:()=>MISSIONS.length,getView:()=>state.view});
