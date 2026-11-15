/* Body Atlas 3D — educational procedural mannequin.
 * Three.js is used for genuine orbit/zoom and Raycaster-based picking.
 * This is a schematic visual model, not a clinical anatomy reconstruction.
 * Main 2D app owns all scoring, state, and storage.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const bridge = window.BodyAtlasBridge;
const mount = document.getElementById('scene3d');
const stage = document.getElementById('threeViewport');
const status = document.getElementById('threeStatus');
const message = document.getElementById('threeMessage');
const points = {
 head:[0,3.26,.46], neck:[0,2.57,.34], chest:[-.41,1.92,.62],
 breast:[.43,1.83,.78], nipple:[.45,1.56,.85],
 abdomen:[-.33,.91,.51], waist:[-.58,.43,.39], navel:[0,.48,.55],
 hip:[-.60,-.20,.32], forearm:[1.32,.12,.20],
 groin:[.30,-.43,.42], genitals:[0,-.56,.49],
 thigh:[.43,-1.02,.29], knee:[.40,-1.75,.28],
 leg:[-.40,-2.21,.27], shin:[.40,-2.52,.24], foot:[-.40,-3.37,.67],
 nape:[0,2.50,-.39],shoulder:[-.70,2.12,-.27],back:[.13,1.36,-.48],
 armpit:[.93,1.73,-.17],arm:[-1.02,1.12,-.22],elbow:[-1.17,.71,-.26],
 "small-of-back":[0,.28,-.43],wrist:[-1.40,-.25,-.17],
 buttock:[.35,-.45,-.52],hand:[-1.47,-.49,-.16],
 calf:[.42,-2.36,-.32],ankle:[-.42,-3.11,-.22],heel:[.41,-3.48,-.33]
};

let renderer, scene, camera, controls, figure, markers, raycaster, pointer;
let pickedTargets = [], markerNodes = new Map(), materialSkin, modelType = null;
let lastState, showAllNames = false, renderRequested = false, destroyed = false;
let activeReal = null, loadingToken=0;
const modelCache=new Map();
const MODEL_URLS={
 male:"https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-male.glb",
 female:"https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-female.glb"
};
const background = 0x15243a;
const tempVector = new THREE.Vector3();
const skinMat = new THREE.MeshStandardMaterial({color:0xdfc1ae,roughness:.82,metalness:.015});
const skinLight = new THREE.MeshStandardMaterial({color:0xe9ccba,roughness:.87});
const skinShade = new THREE.MeshStandardMaterial({color:0xb98c7d,roughness:.95});
const suitMat = new THREE.MeshStandardMaterial({color:0x455b7b,roughness:.86,metalness:.015});
const soleMat = new THREE.MeshStandardMaterial({color:0x647998,roughness:.95});
const markerBase = new THREE.Color(0x9fede1);
const markerFinished = new THREE.Color(0xab9cfa);
const markerWarn = new THREE.Color(0xff9ba3);
const markerHint = new THREE.Color(0xffcb80);

function notifyFailure(err){
 console.error('Body Atlas 3D rendering error:',err);
 if(message){
   message.hidden=false;
   message.textContent='3D could not initialize (WebGL or device limitation). The 2D lab still works — switch to 2D to continue.';
   message.classList.add('error');
 }
 if(status)status.textContent='3D unavailable • 2D remains available';
}
function ellipsoid(group,position,scale,mat,segments=24){
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,segments,16),mat);
 mesh.position.set(...position);mesh.scale.set(...scale);mesh.castShadow=false;mesh.receiveShadow=false;
 group.add(mesh);return mesh;
}
function link(group,start,end,r1,r2,mat,segments=18){
 const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end);
 const dir=b.clone().sub(a),length=dir.length();
 const obj=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,length,segments,1),mat);
 obj.position.copy(a).add(b).multiplyScalar(.5);
 obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
 group.add(obj);return obj;
}
function loft(group,rings,mat){
 const radial=36;
 const positions=[],indices=[];
 for(const [y,rx,rz,offsetZ=0] of rings){
  for(let k=0;k<radial;k++){
   const a=2*Math.PI*k/radial;
   positions.push(Math.cos(a)*rx,y,offsetZ+Math.sin(a)*rz);
  }
 }
 for(let r=0;r<rings.length-1;r++){
  for(let k=0;k<radial;k++){
   const a=r*radial+k,b=r*radial+(k+1)%radial;
   const c=(r+1)*radial+k,d=(r+1)*radial+(k+1)%radial;
   indices.push(a,c,b,b,c,d);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,mat);group.add(mesh);return mesh;
}
function curve(group,points,color,r=.009){
 const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),18,r,5,false);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.9}));
 group.add(mesh);
}
function clearFigure(){
 if(!figure)return;
 figure.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose();if(o.material&&!Object.values({skinMat,skinLight,skinShade,suitMat,soleMat}).includes(o.material)&&o.material.dispose)o.material.dispose();});
 figure.removeFromParent();
}
function buildFigure(kind){
 if(activeReal){activeReal.removeFromParent();activeReal=null;}
 clearFigure();
 figure=new THREE.Group();figure.name='Schematic human '+kind;
 scene.add(figure);modelType=kind;
 const female=kind==='female';
 const shoulder=female?.80:.92;
 const hip=female?.67:.63;
 loft(figure,[
  [-.44,.39,.33,0],[-.25,hip,.39,0],[.13,.61,.39,0],
  [.52,.52,.37,0],[.95,.51,.40,0],[1.35,.64,.46,0],
  [1.80,shoulder*.94,.49,0],[2.13,shoulder,.43,0],
  [2.35,.59,.32,0],[2.48,.29,.26,0]
 ],skinMat);
 ellipsoid(figure,[0,-.20,0],[hip,.44,.40],skinMat);
 // Opaque, neutral educational covering over the pelvis.
 const clothing=ellipsoid(figure,[0,-.50,.04],[hip*.94,.34,.40],suitMat);
 clothing.rotation.x=.04;
 link(figure,[0,2.40,0],[0,2.82,0],.235,.20,skinMat);
 ellipsoid(figure,[0,3.21,0],[.40,.56,.37],skinLight,32);
 // Ears, eyes, nose, and a neutral mouth make the front face easy to orient.
 for(const side of [-1,1]){
  ellipsoid(figure,[side*.398,3.15,-.01],[.085,.14,.085],skinMat);
  ellipsoid(figure,[side*.155,3.30,.343],[.050,.025,.018],skinShade,14);
 }
 ellipsoid(figure,[0,3.15,.377],[.077,.155,.084],skinMat,16);
 curve(figure,[[-.084,2.99,.349],[0,2.985,.362],[.084,2.99,.349]],0x9a7065,.009);
 // Chest shape differs modestly by silhouette, but vocabulary is shared.
 for(const side of [-1,1]){
  if(female){
   ellipsoid(figure,[side*.37,1.68,.40],[.31,.27,.25],skinMat);
   ellipsoid(figure,[side*.38,1.67,.647],[.027,.027,.017],skinShade,14);
  }else{
   ellipsoid(figure,[side*.39,1.82,.42],[.34,.22,.11],skinMat);
   ellipsoid(figure,[side*.38,1.78,.52],[.021,.021,.012],skinShade,12);
  }
 }
 // Arms: independent connected segments with visible elbows and fingers.
 for(const side of [-1,1]){
  const shoulderP=[side*(shoulder+.04),2.17,0];
  const elbow=[side*1.16,.82,.07];
  const wrist=[side*1.44,-.28,.16];
  ellipsoid(figure,shoulderP,[.29,.27,.30],skinMat);
  link(figure,shoulderP,elbow,.255,.195,skinMat);
  ellipsoid(figure,elbow,[.19,.19,.19],skinMat);
  link(figure,elbow,wrist,.20,.118,skinMat);
  ellipsoid(figure,[side*1.49,-.42,.16],[.155,.27,.085],skinMat);
  for(let i=0;i<4;i++){
   const x=side*(1.375+i*.074);
   const start=[x,-.59,.16],end=[x+side*.014,-.80+(i===0||i===3?.05:0),.17];
   link(figure,start,end,.032,.021,skinMat,9);
  }
  link(figure,[side*1.35,-.39,.22],[side*1.22,-.62,.39],.075,.042,skinMat,12);
 }
 // Legs: thigh, knee, calf, ankle and feet.
 for(const side of [-1,1]){
  const upper=[side*.37,-.37,0],knee=[side*.42,-1.78,.01],ankle=[side*.43,-3.10,.05];
  ellipsoid(figure,[side*.37,-.42,0],[.31,.43,.31],skinMat);
  link(figure,upper,knee,.30,.20,skinMat,24);
  ellipsoid(figure,knee,[.215,.21,.215],skinMat);
  link(figure,knee,ankle,.205,.115,skinMat,24);
  ellipsoid(figure,ankle,[.14,.19,.14],skinMat);
  ellipsoid(figure,[side*.43,-3.40,.31],[.225,.15,.53],skinMat);
 }
}
async function loadRealModel(kind){
 const token=++loadingToken;
 if(message){message.hidden=false;message.classList.remove('error');message.textContent='Loading anatomically detailed human model… The original mannequin is available as a fallback.';}
 try{
  let glb=modelCache.get(kind);
  if(!glb){
   // Import on demand: the basic mannequin and the offline SVG still work if this fails.
   const [{GLTFLoader},{MeshoptDecoder}]=await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js')
   ]);
   const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
   glb=await loader.loadAsync(MODEL_URLS[kind]);
   modelCache.set(kind,glb);
  }
  if(token!==loadingToken||modelType!==kind)return;
  if(activeReal){activeReal.removeFromParent();activeReal=null;}
  const body=glb.scene;
  const skin=body.getObjectByName('skin');
  if(!skin)throw new Error('The anatomical model has no named external skin mesh');
  body.traverse(obj=>{
   if(obj!==skin&&['skeleton','muscles','organs','vessels','nerves','joints'].includes(obj.name.toLowerCase()))obj.visible=false;
  });
  skin.traverse(obj=>{
   if(obj.isMesh){
    obj.material=new THREE.MeshStandardMaterial({color:kind==='female'?0xebc9b7:0xd5ab94,roughness:.85,metalness:0,side:THREE.DoubleSide});
   }
  });
  const bounds=new THREE.Box3().setFromObject(skin);
  const size=bounds.getSize(new THREE.Vector3());
  if(size.y<.6||size.y>3)throw new Error('Unexpected human-model scale');
  const center=bounds.getCenter(new THREE.Vector3());
  const ratio=6.9/size.y;
  body.scale.setScalar(ratio);
  body.position.set(-center.x*ratio,-3.46-bounds.min.y*ratio,-center.z*ratio);
  scene.add(body);scene.updateMatrixWorld(true);
  activeReal=body;
  clearFigure();figure=null;
  // Place each labeled point on the visible skin surface whenever the coordinate ray meets it.
  const skinMeshes=[];skin.traverse(obj=>{if(obj.isMesh)skinMeshes.push(obj);});
  const surfaceRay=new THREE.Raycaster();
  for(const [id,rec] of markerNodes){
   const p=rec.node.position;
   const rear=bridge.parts.find(v=>v.id===id)?.view==='back';
   const dir=rear?1:-1;
   surfaceRay.set(new THREE.Vector3(p.x,p.y,rear?-8:8),new THREE.Vector3(0,0,dir));
   const hits=surfaceRay.intersectObjects(skinMeshes,false);
   if(hits.length)p.z=hits[0].point.z+(rear?-.08:.08);
  }
  if(message)message.hidden=true;
  const detailBadge=document.getElementById('modelDetailBadge');
  if(detailBadge){detailBadge.textContent='DETAILED BODY MESH';detailBadge.classList.add('real');}
  if(status)status.textContent='Detailed 3D human mesh • orbit to explore front and back';
  requestRender();
 }catch(err){
  if(token!==loadingToken)return;
  console.warn('Anatomical GLB unavailable, using procedural backup:',err);
  const detailBadge=document.getElementById('modelDetailBadge');
  if(detailBadge){detailBadge.textContent='SCHEMATIC BACKUP';detailBadge.classList.remove('real');}
  if(message){message.hidden=false;message.classList.add('error');message.textContent='Detailed model could not load. Showing the simpler 3D fallback; the 2D diagrams and all exercises remain usable.';}
  requestRender();
 }
}
function createNameSprite(label){
 const canvas=document.createElement('canvas');canvas.width=300;canvas.height=80;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='rgba(13,28,48,.89)';
 ctx.beginPath();ctx.roundRect(5,5,290,70,17);ctx.fill();
 ctx.strokeStyle='rgba(160,232,221,.65)';ctx.lineWidth=3;ctx.stroke();
 ctx.font=`bold ${label.length>11?23:35}px system-ui, sans-serif`;ctx.fillStyle='#efffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,150,40);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));
 sprite.scale.set(1.05,.28,1);sprite.renderOrder=22;
 return sprite;
}
function buildMarkers(){
 markers=new THREE.Group();scene.add(markers);
 for(const part of bridge.parts){
  const loc=points[part.id];if(!loc)continue;
  const node=new THREE.Group();node.name=part.name;node.position.set(...loc);
  const halo=new THREE.Mesh(new THREE.RingGeometry(.112,.163,32),new THREE.MeshBasicMaterial({color:markerBase,transparent:true,opacity:.65,depthTest:false,side:THREE.DoubleSide}));
  halo.renderOrder=20;node.add(halo);
  const core=new THREE.Mesh(new THREE.SphereGeometry(.079,18,12),new THREE.MeshBasicMaterial({color:0x0c4353,depthTest:false}));
  core.renderOrder=21;node.add(core);
  const center=new THREE.Mesh(new THREE.SphereGeometry(.029,12,10),new THREE.MeshBasicMaterial({color:0xc5fff4,depthTest:false}));
  center.renderOrder=22;node.add(center);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthTest:false,depthWrite:false}));
  hit.userData.partId=part.id;hit.userData.view=part.view||'front';hit.renderOrder=23;node.add(hit);pickedTargets.push(hit);
  const label=createNameSprite(part.name);
  label.position.set(loc[0]<0?-.73:.73,.19,0);node.add(label);
  markers.add(node);markerNodes.set(part.id,{node,halo,core,center,hit,label});
 }
}
function resize(){
 if(!renderer||!stage||stage.hidden)return;
 const rect=mount.getBoundingClientRect();
 const width=Math.floor(rect.width),height=Math.floor(rect.height);
 if(width<20||height<20)return;
 renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();
 requestRender();
}
function currentFacing(){return camera.position.z-controls.target.z>=0?'front':'back';}
function requestRender(){
 if(renderRequested||!renderer||stage.hidden||destroyed)return;
 renderRequested=true;
 requestAnimationFrame(()=>{
  renderRequested=false;
  if(stage.hidden||destroyed)return;
  const facing=currentFacing();
  if(status)status.textContent=(facing==='front'?'Front':'Back')+' view • drag to orbit • pinch/scroll to zoom • tap markers';
  markerNodes.forEach(({node,halo},id)=>{
   node.visible=(bridge.parts.find(p=>p.id===id)?.view||'front')===facing;
   halo.quaternion.copy(camera.quaternion);
  });
  renderer.render(scene,camera);
 });
}
function hitTest(clientX,clientY){
 if(!renderer||stage.hidden)return null;
 const rect=renderer.domElement.getBoundingClientRect();
 if(!rect.width||!rect.height||clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;
 const ndc=new THREE.Vector2(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);
 raycaster.setFromCamera(ndc,camera);
 const intersection=raycaster.intersectObjects(pickedTargets.filter(p=>p.userData.view===currentFacing()),false);
 return intersection.length?intersection[0].object.userData.partId:null;
}
function onPointerDown(e){
 if(e.button!==undefined&&e.button!==0)return;
 pointer={x:e.clientX,y:e.clientY,id:e.pointerId};
}
function onPointerUp(e){
 if(!pointer||e.pointerId!==pointer.id)return;
 const traveled=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);pointer=null;
 if(traveled>7)return; // OrbitControls uses longer drags to rotate, not select.
 const selected=hitTest(e.clientX,e.clientY);
 if(selected)bridge.selectSpot(selected);
}
function resetCamera(){
 camera.position.set(0,1.0,12.7);controls.target.set(0,.17,0);
 controls.update();requestRender();
}
function goToSide(side){
 const distance=Math.max(6,Math.min(24,camera.position.clone().sub(controls.target).length()));
 camera.position.set(0,controls.target.y+.5,(side==='back'?-1:1)*distance);
 controls.update();requestRender();
}
function rotateCamera(delta){
 const offset=camera.position.clone().sub(controls.target);
 offset.applyAxisAngle(new THREE.Vector3(0,1,0),delta);
 camera.position.copy(controls.target).add(offset);
 controls.update();requestRender();
}
function zoomCamera(factor){
 const offset=camera.position.clone().sub(controls.target);
 const dist=Math.max(5.0,Math.min(24.0,offset.length()*factor));
 camera.position.copy(controls.target).add(offset.normalize().multiplyScalar(dist));
 controls.update();requestRender();
}
function update(viewState){
 if(!renderer||!viewState)return;
 lastState=viewState;
 if(modelType!==viewState.model){buildFigure(viewState.model);loadRealModel(viewState.model);}
 showAllNames=viewState.mode==='explore'&&!!viewState.threeNames;
 const matched=new Set(viewState.matched||[]);
 const hinted=viewState.mode==='label'?(viewState.highlightId||null):viewState.mode==='missions'?(viewState.highlightId||null):null;
 for(const part of bridge.parts){
  const record=markerNodes.get(part.id);if(!record)continue;
  const {halo,core,center,label}=record;
  const completed=viewState.mode==='label'&&matched.has(part.id);
  const selected=viewState.selected===part.id||viewState.armed===part.id;
  const highlight=hinted===part.id;
  const wrong=viewState.errorId===part.id;
  const c=wrong?markerWarn:highlight?markerHint:completed?markerFinished:selected?markerBase:markerBase;
  halo.material.color.copy(c);
  halo.material.opacity=(wrong||highlight)?0.95:0.63;
  core.material.color.set(wrong?0xa0374f:highlight?0x9a5b22:completed?0x8375d6:selected?0x389a97:0x0b4657);
  center.material.color.set(completed?0xffffff:highlight?0xffe4b7:0xc5fff4);
  label.visible=showAllNames||(viewState.mode==='explore'&&viewState.selected===part.id);
 }
 resize();requestRender();
}
function setup(){
 if(!bridge||!mount||!stage)throw new Error('3D bridge or stage missing');
 if(!window.WebGLRenderingContext)throw new Error('WebGL is unavailable');
 scene=new THREE.Scene();
 scene.fog=new THREE.FogExp2(background,.013);
 camera=new THREE.PerspectiveCamera(37,1,.1,75);
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.27;
 renderer.setClearColor(background,0);
 renderer.domElement.setAttribute('aria-label','3D anatomical model. Drag to orbit, scroll to zoom, tap markers to identify body parts.');
 renderer.domElement.setAttribute('role','img');
 renderer.domElement.style.touchAction='none';
 mount.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xdceeff,0x6c5060,2.5));
 const key=new THREE.DirectionalLight(0xffe3d5,2.7);key.position.set(3,7,7);scene.add(key);
 const fill=new THREE.DirectionalLight(0x8ab6ff,1.7);fill.position.set(-6,2,-4);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xd7d2ff,1.1);rim.position.set(-3,4,-6);scene.add(rim);
 const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1.48,1.56,.14,64),new THREE.MeshStandardMaterial({color:0x273b52,metalness:.17,roughness:.72}));
 plinth.position.y=-3.68;scene.add(plinth);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.52,.018,6,90),new THREE.MeshBasicMaterial({color:0x81e2d7,transparent:true,opacity:.65}));
 ring.position.y=-3.61;ring.rotation.x=Math.PI/2;scene.add(ring);
 const grid=new THREE.GridHelper(11,24,0x314b62,0x25374c);grid.position.y=-3.75;
 grid.material.transparent=true;grid.material.opacity=.25;scene.add(grid);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=false;
 controls.enablePan=true;
 controls.rotateSpeed=.75;controls.zoomSpeed=.9;
 controls.minDistance=5;controls.maxDistance=24;
 controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI-.03;
 controls.addEventListener('change',requestRender);
 resetCamera();
 raycaster=new THREE.Raycaster();
 buildMarkers();
 renderer.domElement.addEventListener('pointerdown',onPointerDown);
 renderer.domElement.addEventListener('pointerup',onPointerUp);
 renderer.domElement.addEventListener('pointercancel',()=>{pointer=null;});
 mount.addEventListener('contextmenu',e=>e.preventDefault());
 const bind=(id,fn)=>document.getElementById(id)?.addEventListener('click',fn);
 bind('center3dBtn',resetCamera);
 bind('rotateLeft3dBtn',()=>rotateCamera(Math.PI/4));
 bind('rotateRight3dBtn',()=>rotateCamera(-Math.PI/4));
 bind('zoomIn3dBtn',()=>zoomCamera(.77));
 bind('zoomOut3dBtn',()=>zoomCamera(1.30));
 document.querySelectorAll('.three-toolbar button').forEach(button=>{button.disabled=false;});
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
 if(observer)observer.observe(mount);
 else window.addEventListener('resize',resize);
 if(message)message.hidden=true;
 window.BodyAtlas3D={update,hitTest,resetCamera,rotateCamera,zoomCamera,goToSide,ready:true};
 update(bridge.getState());
 if(bridge.getState().orientation==='back')goToSide('back');
 requestAnimationFrame(resize);
}
try{setup();}catch(err){notifyFailure(err);}
