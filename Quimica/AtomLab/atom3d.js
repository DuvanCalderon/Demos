/**
 * AtomLab · Vista 3D educativa con Three.js.
 * El simulador químico (HTML clásico) es la fuente de verdad para p, n, e.
 * Las órbitas son una representación didáctica, no orbitales cuánticos reales.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const host = document.getElementById("threeViewport");
const flat = document.getElementById("atomSvg");
const controlsPanel = document.getElementById("threeControls");
const view3Button = document.getElementById("view3d");
const view2Button = document.getElementById("view2d");
const cameraButton = document.getElementById("resetCamera");
const motionButton = document.getElementById("toggleMotion");
const stageHelp = document.getElementById("stageHelp");
const stageMode = document.getElementById("stageMode");
const status = document.getElementById("threeStatus");
const bridge = window.AtomLabBridge;

if (!host || !flat || !bridge) throw Error("AtomLab: faltan elementos para la vista tridimensional.");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 120);
camera.position.set(2.2, 2.3, 10.1);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
renderer.setClearColor(0x0b1225, 0);
renderer.domElement.setAttribute("aria-label", "Átomo 3D. Arrastra para girar, usa la rueda para acercar y toca una partícula para retirarla.");
renderer.domElement.setAttribute("tabindex", "0");
host.appendChild(renderer.domElement);

const orbitControl = new OrbitControls(camera, renderer.domElement);
orbitControl.enableDamping = true;
orbitControl.dampingFactor = 0.085;
orbitControl.enablePan = false;
orbitControl.minDistance = 4.8;
orbitControl.maxDistance = 16;
orbitControl.minPolarAngle = 0.12;
orbitControl.maxPolarAngle = Math.PI - 0.12;
orbitControl.rotateSpeed = 0.65;
orbitControl.zoomSpeed = 0.8;

scene.add(new THREE.HemisphereLight(0xd8f5ff, 0x243d6c, 2.15));
const key = new THREE.PointLight(0xc4e2ff, 68, 23); key.position.set(3, 5, 7); scene.add(key);
const rim = new THREE.PointLight(0x4decd6, 37, 16); rim.position.set(-5, -2, -4); scene.add(rim);

const world = new THREE.Group();
scene.add(world);
const core = new THREE.Group();
const layers = new THREE.Group();
world.add(core, layers);
const protonMaterial = new THREE.MeshStandardMaterial({color:0xf36e96,roughness:.29,metalness:.12,emissive:0x8e123f,emissiveIntensity:.25});
const neutronMaterial = new THREE.MeshStandardMaterial({color:0x67aeff,roughness:.31,metalness:.12,emissive:0x16439a,emissiveIntensity:.27});
const electronMaterial = new THREE.MeshStandardMaterial({color:0x63f5d8,roughness:.23,metalness:.17,emissive:0x16a99f,emissiveIntensity:.75});
const haloMaterial = new THREE.MeshBasicMaterial({color:0x62f5dc,transparent:true,opacity:.11,blending:THREE.AdditiveBlending,depthWrite:false});
const ballGeometry = new THREE.SphereGeometry(1, 20, 16);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const pickables = [];
const rotators = [];

const starPositions = [];
for (let i = 0; i < 185; i++) {
 const a = (i * 2.399963229728653) % (Math.PI * 2);
 const r = 5 + (i % 29) * .35;
 starPositions.push(Math.cos(a)*r, Math.sin(a*1.7)*r*.8, -5 - (i%11)*1.3);
}
const starsGeo = new THREE.BufferGeometry();
starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions,3));
const stars = new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x7199bd,size:.035,transparent:true,opacity:.55,depthWrite:false}));
scene.add(stars);

function shellDistribution(total) {
 let n = total;
 return [2,8,8,2].map(max=>{const out=Math.min(max,n);n-=out;return out}).filter(Boolean);
}
function disposeGroup(group) {
 for (const child of [...group.children]) {
  group.remove(child);
  child.traverse(node=>{
   if (node.geometry && node.geometry !== ballGeometry) node.geometry.dispose();
   if (node.material && ![protonMaterial,neutronMaterial,electronMaterial,haloMaterial].includes(node.material)) {
    const materials=Array.isArray(node.material)?node.material:[node.material];
    materials.forEach(m=>m.dispose());
   }
  });
 }
}
function nucleonKind(i, p, n) {
 // Alternar colores en el núcleo para que ambos tipos se distingan.
 const total=p+n, expected=Math.round((i+1)*p/Math.max(1,total));
 const before=Math.round(i*p/Math.max(1,total));
 return expected>before?"p":"n";
}
function rebuild({p,n,e}) {
 disposeGroup(core);
 disposeGroup(layers);
 pickables.length=0;
 rotators.length=0;
 const total=p+n;
 const radius=total>33?.19:total>17?.215:.26;
 const centerRadius=Math.max(0.1,Math.min(.78,.30+.0105*total));
 for (let i=0;i<total;i++) {
  const kind=nucleonKind(i,p,n);
  const golden=2.3999632297*i;
  const t=(i+.5)/Math.max(total,1);
  const az=Math.acos(1-2*t);
  const r=centerRadius*Math.cbrt(t);
  const ball=new THREE.Mesh(ballGeometry,kind==="p"?protonMaterial:neutronMaterial);
  ball.scale.setScalar(radius);
  ball.position.set(r*Math.sin(az)*Math.cos(golden),r*Math.sin(az)*Math.sin(golden),r*Math.cos(az));
  ball.userData.particle=kind;
  core.add(ball);
  pickables.push(ball);
 }
 if (!total) {
  const guide = new THREE.Mesh(new THREE.SphereGeometry(.36,20,12),new THREE.MeshBasicMaterial({color:0x76a3be,wireframe:true,transparent:true,opacity:.28}));
  core.add(guide);
 }
 const caps=shellDistribution(e), radii=[1.32,2.05,2.74,3.41];
 caps.forEach((count,index)=>{
  const shell=new THREE.Group();
  shell.rotation.x=[.31,-.42,.68,-.56][index];
  shell.rotation.y=[-.1,.34,-.28,.49][index];
  layers.add(shell);
  const ringRadius=radii[index];
  const vertices=[];
  for(let k=0;k<=150;k++){
   const angle=k/150*Math.PI*2;
   vertices.push(new THREE.Vector3(Math.cos(angle)*ringRadius,Math.sin(angle)*ringRadius,0));
  }
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices),new THREE.LineBasicMaterial({color:0x719bb8,transparent:true,opacity:.48,depthWrite:false}));
  shell.add(line);
  const orbit=new THREE.Group();
  shell.add(orbit);
  for(let j=0;j<count;j++){
   const angle=-Math.PI/2+(2*Math.PI*j/count)+(index*.2);
   const ball=new THREE.Mesh(ballGeometry,electronMaterial);
   ball.scale.setScalar(.145);
   ball.position.set(Math.cos(angle)*ringRadius,Math.sin(angle)*ringRadius,0);
   ball.userData.particle="e";
   orbit.add(ball);
   pickables.push(ball);
   const glow=new THREE.Mesh(ballGeometry,haloMaterial);
   glow.scale.setScalar(.23);
   glow.position.copy(ball.position);
   orbit.add(glow);
  }
  rotators.push({node:orbit,speed:(index%2?-1:1)*(.18+index*.085)});
 });
}
function resize() {
 const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
 camera.aspect=width/height;
 camera.updateProjectionMatrix();
 renderer.setSize(width,height,false);
}
const reducedMotion=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let active3D=false, paused=!!reducedMotion;
function setMode(mode){
 const want3D=mode==="3d";
 active3D=want3D;
 host.classList.toggle("hidden",!want3D);
 flat.classList.toggle("hidden",want3D);
 controlsPanel.classList.toggle("hidden",!want3D);
 view3Button.setAttribute("aria-pressed",String(want3D));
 view2Button.setAttribute("aria-pressed",String(!want3D));
 view3Button.classList.toggle("active-view",want3D);
 view2Button.classList.toggle("active-view",!want3D);
 stageHelp.textContent=want3D?"Gira: arrastra · Zoom: rueda o pellizca · Quita: toca una esfera":"Núcleo: p⁺, n⁰ · Capas: e⁻";
 stageMode.textContent=want3D?"ESCENA 3D":"VISTA 2D";
 if(want3D){resize();orbitControl.update()}
}
function centerCamera(){
 camera.position.set(2.2,2.3,10.1);
 orbitControl.target.set(0,0,0);
 orbitControl.update();
}
function toggleMotion(){
 paused=!paused;
 motionButton.textContent=paused?"▶ Reanudar electrones":"⏸ Pausar electrones";
 motionButton.setAttribute("aria-pressed",String(paused));
}
function update(snapshot) {
 if(!snapshot)return;
 rebuild(snapshot);
}
window.Atom3D={update,setMode,is3D:()=>active3D,centerCamera,toggleMotion};
view3Button.disabled=false;
view3Button.title="Activar simulador 3D";
status.textContent="Three.js activo · Gira y acerca el átomo";
view3Button.addEventListener("click",()=>setMode("3d"));
view2Button.addEventListener("click",()=>setMode("2d"));
cameraButton.addEventListener("click",centerCamera);
motionButton.addEventListener("click",toggleMotion);
motionButton.textContent=paused?"▶ Reanudar electrones":"⏸ Pausar electrones";
host.addEventListener("dragover",event=>{event.preventDefault();event.dataTransfer.dropEffect="copy"});
host.addEventListener("drop",event=>{
 event.preventDefault();
 const kind=event.dataTransfer.getData("text/plain");
 if(["p","n","e"].includes(kind))bridge.drop(kind,event.clientX,event.clientY);
});
let down=null;
renderer.domElement.addEventListener("pointerdown",event=>{
 down={x:event.clientX,y:event.clientY,pointerId:event.pointerId};
});
renderer.domElement.addEventListener("pointerup",event=>{
 if(!down||down.pointerId!==event.pointerId)return;
 const distance=Math.hypot(event.clientX-down.x,event.clientY-down.y);
 down=null;
 if(distance>7 || !active3D)return;
 const box=renderer.domElement.getBoundingClientRect();
 mouse.x=((event.clientX-box.left)/box.width)*2-1;
 mouse.y=-((event.clientY-box.top)/box.height)*2+1;
 raycaster.setFromCamera(mouse,camera);
 const collision=raycaster.intersectObjects(pickables,false)[0];
 if(collision&&collision.object.userData.particle) {
  bridge.change(collision.object.userData.particle,-1);
 }
});
renderer.domElement.addEventListener("pointercancel",()=>{down=null});
renderer.domElement.addEventListener("pointermove",event=>{
 if(!active3D || (event.buttons&1))return;
 const box=renderer.domElement.getBoundingClientRect();
 mouse.x=((event.clientX-box.left)/box.width)*2-1;
 mouse.y=-((event.clientY-box.top)/box.height)*2+1;
 raycaster.setFromCamera(mouse,camera);
 const hit=raycaster.intersectObjects(pickables,false).some(x=>!!x.object.userData.particle);
 renderer.domElement.style.cursor=hit?"pointer":"grab";
});
renderer.domElement.addEventListener("pointerleave",()=>{renderer.domElement.style.cursor="grab"});
if(window.ResizeObserver){
 new ResizeObserver(resize).observe(host);
}else{window.addEventListener("resize",resize)}
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05);
 if(!document.hidden && active3D && !paused){
  for(const r of rotators)r.node.rotation.z+=r.speed*dt;
 }
 orbitControl.update();
 if(active3D && !document.hidden){
  renderer.render(scene,camera);
 }
}
update(bridge.snapshot());
setMode("3d");
resize();
animate();
