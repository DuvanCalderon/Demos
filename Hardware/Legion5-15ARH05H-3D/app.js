/* LegionLab 3D · Lenovo Legion 5 15ARH05H / 82B1
   Modelo didáctico, escala y colocación aproximadas.
   Datos de secuencia: Lenovo Legion 5 (15,05) HMM, capítulo 4.
*/
"use strict";
const $=id=>document.getElementById(id);
const STORE="legionlab_82b1_v1";
let saved={routes:[],quizzes:[]};
try {const old=JSON.parse(localStorage.getItem(STORE)||"null");if(old&&Array.isArray(old.routes)&&Array.isArray(old.quizzes))saved=old;}catch(e){}
const completedRoutes=new Set(saved.routes), completedQuizzes=new Set(saved.quizzes);
function save(){try{localStorage.setItem(STORE,JSON.stringify({routes:[...completedRoutes],quizzes:[...completedQuizzes]}));}catch(e){}}
const PARTS={
 cover:{symbol:"▰",name:"Cubierta inferior",desc:"Es la tapa desmontable que protege el interior. El manual del Legion 5 (15,05) describe 11 tornillos: 7 de M2 × L8 y 4 de M2 × L4, antes de liberar las pestañas.",risk:"Nunca fuerces las pestañas con un destornillador metálico."},
 caseScrew:{symbol:"⊕",name:"Tornillos de la tapa",desc:"Los 11 tornillos no tienen todos la misma longitud. Hay 7 largos M2 × 8 y 4 cortos M2 × 4; registra dónde va cada uno al desmontar.",risk:"Un tornillo largo en un orificio corto puede perforar o romper la carcasa."},
 battery:{symbol:"▰",name:"Batería interna",desc:"Batería recargable Li-Polymer. Esta familia tiene variantes de 60 Wh u 80 Wh; la captura de Windows no determina cuál posee tu unidad.",risk:"No la dobles, perfores, calientes ni abras. Si está hinchada o dañada, detén el trabajo."},
 batteryConnector:{symbol:"⚡",name:"Conector de batería",desc:"Conecta el paquete de batería con la placa. Se desconecta antes de manipular RAM, SSD o ventiladores. El manual indica tirar del conector, NO de los cables.",risk:"No desconectes tirando de los hilos: podrías arrancarlos."},
 motherboard:{symbol:"▦",name:"Placa base",desc:"La tarjeta principal integra el procesador Ryzen 7, circuitos de alimentación, conectores, ranuras de RAM y almacenamiento.",risk:"Muy sensible a descargas electrostáticas; evita tocar contactos y soldaduras."},
 cpu:{symbol:"◆",name:"AMD Ryzen 7 4800H",desc:"Procesador identificado en tu captura de Windows. Ejecuta instrucciones y genera calor que debe transferirse al sistema de refrigeración.",risk:"En un portátil no es un chip de cambio sencillo; no fuerces su extracción."},
 gpu:{symbol:"◇",name:"Subsistema gráfico",desc:"El Legion 5 15ARH05H usa circuitos gráficos y refrigeración compartida. La captura no confirma el chip gráfico dedicado específico.",risk:"No intentes despegar ni desoldar el chip gráfico."},
 heat:{symbol:"〰",name:"Disipador y heatpipes",desc:"Transportan calor del procesador y del chip gráfico hacia las zonas de ventilación. El HMM indica aflojar seis fijaciones para retirar el disipador.",risk:"Manipular pasta y pads térmicos requiere conocer materiales, espesores y orden de apriete. No se incluye como tarea de principiante."},
 fan:{symbol:"✺",name:"Ventiladores",desc:"Dos turbinas llevan aire hacia las salidas de refrigeración. Para el procedimiento de extracción, el HMM señala cables y cinco tornillos para el conjunto de ventiladores.",risk:"Nunca permitas que giren libremente por un chorro de aire comprimido; inmoviliza sus aspas y evita líquidos."},
 fanConnector:{symbol:"⌁",name:"Conectores de ventilación",desc:"Pequeños conectores eléctricos de los ventiladores a la placa. Hay que desconectarlos antes de retirar el conjunto.",risk:"Desconecta por la ficha; tirar del cable o usar fuerza excesiva puede dañar el puerto."},
 fanScrew:{symbol:"⊕",name:"Tornillos de ventiladores",desc:"El manual identifica cinco tornillos M2 × L4.5 durante la extracción del conjunto de ventiladores.",risk:"No mezclar con los tornillos de la cubierta inferior."},
 ram:{symbol:"▥",name:"RAM SO-DIMM",desc:"El modelo admite dos ranuras de memoria DDR4-3200 SO-DIMM. Los módulos se sujetan con pestañas laterales y entran inclinados por una muesca.",risk:"No toques los contactos dorados ni fuerces la muesca en sentido incorrecto."},
 ramShield:{symbol:"▧",name:"Blindaje de RAM",desc:"Cubierta metálica protectora sobre los módulos de memoria. Se retira antes de liberar las pestañas de los módulos.",risk:"Puede tener pequeñas pestañas; levantarla a la fuerza puede doblarla."},
 ssd:{symbol:"▰",name:"SSD M.2 NVMe",desc:"Almacenamiento de estado sólido. Esta familia admite unidades M.2 2242/2280 PCIe NVMe según configuración; no confundas NVMe con una unidad SATA M.2.",risk:"Desconecta primero la batería y retira el tornillo de fijación antes de deslizar la unidad."},
 plate:{symbol:"▤",name:"Placa protectora de SSD",desc:"Cubierta metálica para el SSD M.2. El HMM documenta tres tornillos para retirarla, con posibles variaciones entre configuraciones.",risk:"No desprendas bruscamente láminas o pads térmicos asociados."},
 plateScrew:{symbol:"⊕",name:"Tornillos de placa SSD",desc:"Tres tornillos sujetan la placa protectora M.2 en el procedimiento del manual.",risk:"Guárdalos separados de los tornillos de chasis y ventiladores."},
 ssdScrew:{symbol:"⊕",name:"Tornillo de SSD",desc:"Un tornillo M2 × L3 fija la unidad M.2 en el procedimiento del manual.",risk:"Un tornillo demasiado largo puede dañar el separador o la placa."},
 hdd:{symbol:"▣",name:"Bahía de HDD / 2.º SSD",desc:"Las variantes de este Legion 5 permiten HDD SATA de 2,5″ + SSD M.2, o dos SSD M.2. La escena visualiza una bahía representativa, no confirma el disco instalado.",risk:"No sustituir la batería o retirar soportes sin comprobar la variante exacta."},
 ports:{symbol:"⌘",name:"Puertos y conectores",desc:"Los conectores laterales y traseros permiten alimentación, vídeo, USB, red y audio. La geometría 3D es simplificada.",risk:"Revisa siempre la ubicación real de conectores antes de abrir o apoyar el portátil."}
};
const PARTORDER=["cover","caseScrew","battery","batteryConnector","motherboard","cpu","gpu","heat","fan","fanConnector","fanScrew","ram","ramShield","ssd","plate","plateScrew","ssdScrew","hdd"];
const STEP=(id,title,desc,tool,target,count=1,hint="")=>({id,title,desc,tool,target,count,hint});
function sequence(route){
 const steps=[
 STEP("prepare","Preparar un trabajo seguro","Confirma que el equipo está completamente apagado, sin cargador y con la superficie protegida contra electricidad estática.","none","none",1,"No basta con suspender Windows: apaga el equipo por completo y desconecta el cargador."),
 STEP("caseScrewsOff","Aflojar los 11 tornillos","Con el equipo apagado y boca abajo, retira 11 tornillos de la cubierta: 7 M2×L8 y 4 M2×L4. Practica tocando cada tornillo 3D o con el botón.","driver","caseScrew",11,"Usa punta Phillips adecuada. Haz un mapa de posiciones y longitudes: este modelo combina siete largos y cuatro cortos."),
 STEP("coverOff","Liberar la cubierta inferior","Con una herramienta plástica, ve liberando las pestañas de la tapa sin doblarla. En el simulador basta tocar la cubierta.","pry","cover",1,"La palanca plástica reduce el riesgo de rayar o deformar los clips. No uses fuerza bruta."),
 STEP("batteryOff","Desconectar la batería","Identifica la ficha entre batería y placa. Desconecta por el cuerpo del conector, sin tirar de los cables.","hand","batteryConnector",1,"El HMM dice explícitamente: tirar de la ficha, nunca del cable.")
 ];
 if(route==="ram")steps.push(
 STEP("ramShieldOff","Retirar el blindaje de RAM","Levanta cuidadosamente la cubierta metálica protectora de la RAM.","hand","ramShield",1,"Busca la tapa metálica sobre las ranuras de memoria."),
 STEP("ramOff","Extraer el módulo SO-DIMM","Libera las pestañas laterales y saca el módulo inclinado, sin tocar sus contactos.","hand","ram",1,"La muesca es asimétrica: nunca debe entrar por la fuerza."),
 STEP("ramOn","Volver a insertar la RAM","Alinea la muesca, introduce el módulo inclinado y asegúralo con las pestañas.","hand","ram",1,"Confirma que el módulo queda asegurado por ambos clips."),
 STEP("ramShieldOn","Reinstalar el blindaje","Devuelve la protección metálica a su posición original.","hand","ramShield",1,"Comprueba que no pellizca cables ni toca los contactos de forma indebida.")
 );
 if(route==="ssd"||route==="fans")steps.push(
 STEP("plateScrewsOff","Retirar los 3 tornillos de la placa M.2","La placa metálica del SSD está sujetada por tres tornillos en el procedimiento del manual.","driver","plateScrew",3,"Cuenta tres tornillos y guárdalos separados del chasis."),
 STEP("plateOff","Retirar la placa metálica del SSD","Levanta la cubierta sin despegar bruscamente los materiales térmicos.","hand","plate",1,"Antes de mover la placa revisa si hay láminas o almohadillas térmicas.")
 );
 if(route==="ssd")steps.push(
 STEP("ssdScrewOff","Liberar el tornillo del SSD","Retira el tornillo de fijación M2×L3 de la unidad M.2.","driver","ssdScrew",1,"Una sola fijación retiene el módulo M.2."),
 STEP("ssdOff","Retirar la unidad M.2","Sostén la unidad por sus bordes y deslízala suavemente fuera de la ranura.","hand","ssd",1,"No dobles el PCB ni toques los contactos dorados."),
 STEP("ssdOn","Volver a insertar la unidad M.2","Alinea muesca y ranura e inserta el SSD con una ligera inclinación.","hand","ssd",1,"La muesca decide la orientación; no fuerces la tarjeta."),
 STEP("ssdScrewOn","Fijar otra vez el SSD","Vuelve a colocar el tornillo M2×L3 sin apretarlo excesivamente.","driver","ssdScrew",1,"Asegura que el módulo quede paralelo y sujeto.")
 );
 if(route==="fans")steps.push(
 STEP("fanCablesOff","Desconectar cables de ventiladores","Desenchufa las fichas de los ventiladores de la placa base con cuidado.","hand","fanConnector",1,"Toma las fichas plásticas, no los cables."),
 STEP("fanScrewsOff","Extraer las 5 fijaciones del sistema de ventilación","Retira los cinco tornillos M2×L4.5 de los ventiladores según el procedimiento del HMM.","driver","fanScrew",5,"No mezcles estos cinco tornillos con los de la tapa o el SSD."),
 STEP("fanOff","Levantar el conjunto de ventiladores","Retira el conjunto solo cuando los conectores y tornillos estén libres.","hand","fan",1,"Los ventiladores podrían tener pestañas o cables próximos: revisa el manual físico antes de moverlos."),
 STEP("fanClean","Limpiar ventiladores de forma segura","Simula una limpieza ligera con brocha suave mientras las aspas permanecen inmovilizadas.","brush","fan",1,"Retira polvo superficial; evita líquidos y aire comprimido que los haga girar sin control. El disipador profundo requiere técnico."),
 STEP("fanOn","Reinstalar los ventiladores","Coloca los ventiladores en su posición original sin atrapar cables.","hand","fan",1,"Verifica que no rocen ninguna pieza."),
 STEP("fanScrewsOn","Reponer los 5 tornillos de ventiladores","Coloca los cinco tornillos M2×L4.5.","driver","fanScrew",5,"Reutiliza el tipo y posición correctos."),
 STEP("fanCablesOn","Reconectar cables de ventiladores","Asienta cuidadosamente las fichas de ventilador en sus conectores.","hand","fanConnector",1,"Comprueba que las dos conexiones estén firmes antes de cerrar.")
 );
 if(route==="ssd"||route==="fans")steps.push(
 STEP("plateOn","Reinstalar la placa metálica M.2","Coloca de nuevo la placa protectora sin desplazar pads o cintas.","hand","plate",1,"La posición de la placa puede variar según la combinación de discos."),
 STEP("plateScrewsOn","Reponer los tres tornillos M.2","Fija la placa protectora con sus tres tornillos originales.","driver","plateScrew",3,"No cambies longitudes ni aprietes en exceso.")
 );
 steps.push(
 STEP("batteryOn","Reconectar batería al terminar","Con los módulos en su sitio, conecta de nuevo la ficha de la batería.","hand","batteryConnector",1,"No fuerces la ficha. Verifica antes que no hay piezas sueltas."),
 STEP("coverOn","Cerrar la cubierta inferior","Alinea el perímetro y encaja las pestañas sin pellizcar cables.","hand","cover",1,"No debería requerir golpes ni presión excesiva."),
 STEP("caseScrewsOn","Reinstalar los 11 tornillos","Restituye cada tornillo en su orificio correcto: 7 largos y 4 cortos.","driver","caseScrew",11,"Un tornillo largo en posición corta puede causar daños. Mantén tu mapa de tornillos."),
 STEP("inspect","Revisar el reensamblaje","Confirma que no quedan tornillos sueltos, los conectores están colocados y la cubierta está cerrada. Termina la práctica.","none","none",1,"Una inspección final evita fallos al encender.")
 );
 return steps;
}
const QUIZ=[
 {id:"q1",level:"basic",title:"Antes del primer tornillo",q:"¿Qué debes hacer antes de abrir el portátil?",a:["Ponerlo en suspensión","Apagarlo, desconectar cargador y controlar ESD","Quitar primero el ventilador","Dejar la batería cargando"],c:1,why:"El HMM exige apagar y desconectar la alimentación; además advierte de electricidad estática.",hint:"¿Quieres que haya energía circulando durante la reparación?"},
 {id:"q2",level:"basic",title:"La tapa inferior",q:"¿Cuántos tornillos de tapa describe el manual del Legion 5 (15,05)?",a:["6","8","11","15"],c:2,why:"El manual indica 11 tornillos antes de liberar las pestañas de la cubierta inferior.",hint:"Son más de diez y hay dos longitudes."},
 {id:"q3",level:"basic",title:"Una herramienta adecuada",q:"¿Con qué es preferible liberar clips de la cubierta inferior?",a:["Destornillador afilado como palanca","Palanca plástica adecuada","Punta de un cuchillo","Cable de cobre"],c:1,why:"La herramienta plástica reduce el riesgo de rayar y romper las pestañas.",hint:"Busca una opción que no sea metálica ni cortante."},
 {id:"q4",level:"middle",title:"Longitudes de tornillos",q:"¿Qué combinación indica el manual para la cubierta?",a:["11 idénticos M3×L5","7 M2×L8 y 4 M2×L4","4 M2×L8 y 7 M2×L4","8 M2×L4 y 3 M2×L3"],c:1,why:"La tapa tiene siete tornillos de longitud 8 mm y cuatro de 4 mm, ambos diámetro M2.",hint:"Hay más tornillos largos que cortos."},
 {id:"q5",level:"middle",title:"La memoria RAM",q:"¿Qué tipo de ranura de memoria usa esta familia?",a:["Dos SO-DIMM DDR4-3200","DIMM de escritorio DDR5","Memoria eMMC integrada","Solo una ranura DDR3"],c:0,why:"La ficha PSREF del 15ARH05H indica dos ranuras SO-DIMM DDR4-3200.",hint:"Son memorias de formato portátil, no DIMM de torre."},
 {id:"q6",level:"middle",title:"El cable delicado",q:"¿Cómo debes desconectar la batería interna?",a:["Tirar fuerte de los cables","Cortar el cable para evitar energía","Tomar con cuidado la ficha del conector","Dejarla conectada al retirar RAM"],c:2,why:"El HMM advierte de desconectar sujetando el conector, no tirando de los cables.",hint:"El cable no es el mango."},
 {id:"q7",level:"advanced",title:"Almacenamiento y variantes",q:"¿Qué opciones de almacenamiento documenta Lenovo para la familia?",a:["Solo HDD SATA","Solo SSD soldado","HDD 2,5″ + M.2 o bien dos M.2 según variante","Tres HDD 3,5″"],c:2,why:"La ficha PSREF muestra combinaciones HDD 2,5 pulgadas + SSD M.2 o doble SSD M.2.",hint:"La configuración cambia con la batería y la variante."},
 {id:"q8",level:"advanced",title:"Tornillos del SSD",q:"En el procedimiento del HMM, ¿cuántos tornillos se retiran para la placa protectora M.2 y para el propio SSD?",a:["Placa 3; SSD 1","Placa 11; SSD 5","Placa 1; SSD 3","Ninguno"],c:0,why:"El manual muestra tres fijaciones para la placa metálica y una M2×L3 para el módulo SSD.",hint:"La cubierta usa más de uno, el módulo solo uno."},
 {id:"q9",level:"advanced",title:"Limpieza del ventilador",q:"¿Cuál es el enfoque más prudente al retirar polvo?",a:["Usar agua sobre la placa","Dejar girar las aspas al máximo con aire comprimido","Inmovilizar aspas y limpiar suavemente, sin líquidos","Abrir y perforar la batería"],c:2,why:"Evita sobrevelocidad del ventilador, líquidos y esfuerzos sobre los conectores. El mantenimiento térmico profundo requiere experiencia.",hint:"La velocidad excesiva y los líquidos son enemigos del hardware."}
];
const routes=["ram","ssd","fans"];
const state={route:"ram",steps:[],step:0,count:0,tool:"hand",selected:"cover",hint:false,exploded:false,rotate:false,labels:true,checks:{off:false,unplug:false,esd:false},
coverPresent:true,batteryConnected:true,ramShieldPresent:true,ramPresent:true,platePresent:true,ssdPresent:true,ssdFastener:true,fansPresent:true,fanConnectors:true,fanCleaned:false,
caseScrews:new Set(),plateScrews:new Set(),fanScrews:new Set(),activeTab:"lab",quizLevel:"basic",quizIndex:0,quizChoice:null,quizReveal:false,quizHint:false};
let renderer3D=null;
function inform(msg,kind=""){const el=$("feedback");el.textContent=msg;el.className="status"+(kind?" "+kind:"")}
function refreshScore(){const total=routes.length+QUIZ.length,n=completedRoutes.size+completedQuizzes.size;$("topScore").textContent=Math.round(n/total*100)+"%"}
function initState(route){
 state.route=route;state.steps=sequence(route);state.step=0;state.count=0;state.tool="hand";state.hint=false;state.exploded=false;
 for(const k of ["off","unplug","esd"])state.checks[k]=false;
 for(const k of ["coverPresent","batteryConnected","ramShieldPresent","ramPresent","platePresent","ssdPresent","ssdFastener","fansPresent","fanConnectors"])state[k]=true;
 state.fanCleaned=false;
 state.caseScrews=new Set();state.plateScrews=new Set();state.fanScrews=new Set();
 document.querySelectorAll("[data-safety]").forEach(el=>el.checked=false);
 document.querySelectorAll("[data-route]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.route===route)));
 $("explodeView").setAttribute("aria-pressed","false");
 $("explodeView").textContent="⬡ Vista explotada";
 inform("Práctica lista. Marca la preparación de seguridad y realiza el primer paso.");
 updateUI();if(renderer3D)renderer3D.sync(true);
}
function current(){return state.steps[state.step]||null}
function updateUI(){
 const s=current(),n=state.steps.length,done=state.step>=n,percent=done?100:Math.round((state.step+state.count/Math.max(1,s.count))/n*100);
 $("stepBar").style.width=percent+"%";$("stepPercent").textContent=percent+"% completado";$("stepIndex").textContent=done?"✓ COMPLETADO":"PASO "+(state.step+1)+" / "+n;
 $("stepTitle").textContent=done?"¡Equipo reensamblado!":s.title;
 $("stepDesc").textContent=done?"Completaste la secuencia de práctica, desmontaje y ensamblaje. Ahora puedes explorar otra ruta.":s.desc;
 $("stepCounter").textContent=!done&&s.count>1?(state.count+" de "+s.count+" operaciones · "+(s.id.includes("caseScrews")?"7 tornillos largos + 4 cortos":s.id.includes("fanScrews")?"5 tornillos del sistema de ventilación":"3 tornillos del blindaje")):"";
 $("checklist").classList.toggle("hidden",!s||s.id!=="prepare");
 $("doStep").disabled=done;
 $("doStep").textContent=done?"✓ Práctica completada":s.id==="prepare"?"Confirmar preparación ✓":s.id==="inspect"?"Finalizar revisión ✓":s.count>1?"Aplicar herramienta ("+(state.count+1)+"/"+s.count+") →":"Ejecutar con "+toolName(s.tool)+" →";
 $("stepTip").classList.toggle("hidden",!state.hint||done);
 $("stepTip").textContent=done?"":s.hint;
 $("stepList").innerHTML=state.steps.map((x,i)=>'<div class="step-line '+(i===state.step?"active":i<state.step?"done":"")+'"><span class="num">'+(i<state.step?"✓":i+1)+'</span><span>'+escapeHTML(x.title)+'</span></div>').join("");
 const active=$("stepList").querySelector(".step-line.active");if(active)active.scrollIntoView({block:"nearest",behavior:"auto"});
 document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===state.tool)));
 if(renderer3D)renderer3D.sync();
}
function toolName(id){return {none:"sin herramienta",hand:"mano / pinza",driver:"destornillador",pry:"palanca plástica",brush:"brocha"}[id]||id}
function isSafetyReady(){return Object.values(state.checks).every(Boolean)}
function next(){state.step++;state.count=0;state.hint=false;const finished=state.step>=state.steps.length;if(finished){completedRoutes.add(state.route);save();refreshScore();inform("✓ ¡Bien hecho! Completaste y reensamblaste la práctica de "+state.route.toUpperCase()+".","good")}else{inform("✓ Paso completado. Ahora: "+current().title,"good");selectedPart(PARTS[current().target]?current().target:"cover")}updateUI();if(renderer3D)renderer3D.sync(true)}
function selectedPart(id){if(PARTS[id]){state.selected=id;const p=PARTS[id];$("partName").textContent=p.name;$("partDescription").textContent=p.desc;$("partExtraTitle").textContent="¿Qué debes recordar?";$("partExtra").textContent=p.desc;$("partRisk").textContent="⚠ "+p.risk;document.querySelectorAll("[data-part]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.part===id)));if(renderer3D)renderer3D.highlight()}}
function setStepEffect(id,index){
 function moveOne(set,count,add){let chosen=Number.isInteger(index)?index:undefined;if(chosen===undefined || (add?set.has(chosen):!set.has(chosen)))chosen=Array.from({length:count},(_,i)=>i).find(i=>add?!set.has(i):set.has(i));if(chosen===undefined)return false;if(add)set.add(chosen);else set.delete(chosen);return true}
 switch(id){
 case "caseScrewsOff":return moveOne(state.caseScrews,11,true);
 case "caseScrewsOn":return moveOne(state.caseScrews,11,false);
 case "plateScrewsOff":return moveOne(state.plateScrews,3,true);
 case "plateScrewsOn":return moveOne(state.plateScrews,3,false);
 case "fanScrewsOff":return moveOne(state.fanScrews,5,true);
 case "fanScrewsOn":return moveOne(state.fanScrews,5,false);
 case "coverOff":state.coverPresent=false;break;
 case "coverOn":state.coverPresent=true;break;
 case "batteryOff":state.batteryConnected=false;break;
 case "batteryOn":state.batteryConnected=true;break;
 case "ramShieldOff":state.ramShieldPresent=false;break;
 case "ramShieldOn":state.ramShieldPresent=true;break;
 case "ramOff":state.ramPresent=false;break;
 case "ramOn":state.ramPresent=true;break;
 case "plateOff":state.platePresent=false;break;
 case "plateOn":state.platePresent=true;break;
 case "ssdScrewOff":state.ssdFastener=false;break;
 case "ssdScrewOn":state.ssdFastener=true;break;
 case "ssdOff":state.ssdPresent=false;break;
 case "ssdOn":state.ssdPresent=true;break;
 case "fanCablesOff":state.fanConnectors=false;break;
 case "fanCablesOn":state.fanConnectors=true;break;
 case "fanOff":state.fansPresent=false;break;
 case "fanOn":state.fansPresent=true;break;
 case "fanClean":state.fanCleaned=true;break;
 }
 return true;
}
function attempt(objectKey=null,index=null){
 const step=current();if(!step){inform("La práctica ya terminó. Elige una ruta nueva o reiníciala.","good");return}
 if(step.id==="prepare"&&!isSafetyReady()){inform("Faltan comprobaciones de seguridad. Marca las tres casillas antes de continuar.","bad");return}
 if(step.tool!=="none"&&state.tool!==step.tool){inform("Herramienta incorrecta. Para este paso selecciona: "+toolName(step.tool)+".","bad");return}
 if(objectKey&&objectKey!==step.target){selectedPart(objectKey);inform("Esa pieza no corresponde al paso actual. Objetivo: "+(PARTS[step.target]?.name||step.title)+".","bad");return}
 if(step.id==="inspect"&& (state.caseScrews.size||!state.coverPresent||!state.batteryConnected)){inform("Falta cerrar y verificar el equipo antes de completar.","bad");return}
 if(step.id==="prepare"||step.id==="inspect"){next();return}
 if(!setStepEffect(step.id,index)){inform("Ese tornillo ya está en el estado correcto. Selecciona otro.","bad");return}
 state.count++;
 if(renderer3D)renderer3D.sync(true);
 if(state.count>=step.count){next()}else{inform("✓ Acción "+state.count+"/"+step.count+". Continúa con los tornillos restantes.","good");updateUI()}
}
function changeTool(tool){state.tool=tool;document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===tool)));inform("Herramienta seleccionada: "+toolName(tool)+".")}
function tab(name){
 state.activeTab=name;document.querySelectorAll(".tab").forEach(el=>el.classList.toggle("active",el.id==="tab-"+name));document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===name)));
 window.scrollTo({top:0,behavior:"smooth"});if(name==="lab"&&renderer3D)renderer3D.resize();
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function cards(){
 const make=id=>{const p=PARTS[id];return '<article class="part-card"><div class="symbol">'+p.symbol+'</div><h3>'+escapeHTML(p.name)+'</h3><p>'+escapeHTML(p.desc)+'</p><div class="pill">Precaución</div><p>'+escapeHTML(p.risk)+'</p><button class="btn soft" data-viewpart="'+id+'" style="margin-top:12px">Ver en 3D</button></article>'};
 $("overviewCards").innerHTML=["batteryConnector","ram","ssd","fan","heat","caseScrew"].map(make).join("");
 $("allCards").innerHTML=PARTORDER.map(make).join("");
 $("quickParts").innerHTML=["cover","batteryConnector","ram","ssd","fan","heat","cpu","hdd"].map(id=>'<button data-part="'+id+'" aria-pressed="false">'+escapeHTML(PARTS[id].name)+'</button>').join("");
}
let quizPos=0,quizLevel="basic",quizChoice=null,quizReveal=false,quizHint=false;
function qs(){return QUIZ.filter(q=>q.level===quizLevel)}
function qCurrent(){return qs()[quizPos]}
function drawQuiz(){
 const q=qCurrent();$("quizIndex").textContent="PREGUNTA "+(quizPos+1)+" / "+qs().length+(completedQuizzes.has(q.id)?" · ✓ DOMINADA":"");$("quizTitle").textContent=q.title;$("quizPrompt").textContent=q.q;
 document.querySelectorAll("[data-level]").forEach(b=>{const yes=b.dataset.level===quizLevel;b.setAttribute("aria-pressed",String(yes));b.classList.toggle("soft",yes)});
 $("quizOptions").innerHTML=q.a.map((answer,i)=>'<button class="quiz-answer '+(quizChoice!==null||quizReveal?(i===q.c?"correct":quizChoice===i?"wrong":""):"")+'" data-answer="'+i+'" '+(quizChoice!==null||quizReveal?'disabled':'')+'><b>'+String.fromCharCode(65+i)+'</b>'+escapeHTML(answer)+'</button>').join("");
 const fb=$("quizFeedback");fb.classList.toggle("hidden",quizChoice===null&&!quizReveal&&!quizHint);
 if(quizHint&&quizChoice===null&&!quizReveal){fb.className="quiz-feedback";fb.textContent="Pista: "+q.hint}
 else if(quizChoice!==null||quizReveal){fb.className="quiz-feedback "+(quizChoice===q.c&&!quizReveal?"good":"bad");fb.textContent=(quizReveal?"Solución revelada. ":quizChoice===q.c?"✓ ¡Correcto! ":"Respuesta incorrecta. ")+q.why}
 const solved=qs().filter(x=>completedQuizzes.has(x.id)).length;$("quizBar").style.width=solved/qs().length*100+"%";$("quizCount").textContent=solved+" / "+qs().length+" acertadas en este nivel.";
}
function reply(n){if(quizChoice!==null||quizReveal)return;quizChoice=n;const q=qCurrent();if(n===q.c){completedQuizzes.add(q.id);save();refreshScore()}drawQuiz()}
function qReset(){quizChoice=null;quizReveal=false;quizHint=false;drawQuiz()}
function qMove(){quizPos=(quizPos+1)%qs().length;qReset()}
document.addEventListener("click",e=>{
 const route=e.target.closest("[data-route]");if(route){initState(route.dataset.route);return}
 const tool=e.target.closest("[data-tool]");if(tool){changeTool(tool.dataset.tool);return}
 const page=e.target.closest("[data-tab]");if(page){tab(page.dataset.tab);return}
 const part=e.target.closest("[data-part]");if(part){selectedPart(part.dataset.part);return}
 const view=e.target.closest("[data-viewpart]");if(view){tab("lab");selectedPart(view.dataset.viewpart);if(state.coverPresent&&!state.exploded&&!["cover","caseScrew"].includes(view.dataset.viewpart)){state.exploded=true;$("explodeView").setAttribute("aria-pressed","true");$("explodeView").textContent="▣ Vista ensamblada";if(renderer3D)renderer3D.sync(true)}if(renderer3D)renderer3D.focus(view.dataset.viewpart);return}
 const level=e.target.closest("[data-level]");if(level){quizLevel=level.dataset.level;quizPos=0;qReset();return}
 const answer=e.target.closest("[data-answer]");if(answer){reply(Number(answer.dataset.answer));return}
});
document.querySelectorAll("[data-safety]").forEach(check=>check.addEventListener("change",()=>{state.checks[check.dataset.safety]=check.checked;inform(isSafetyReady()?"✓ Verificaciones de seguridad listas.":"Completa las tres comprobaciones de seguridad.")}));
$("doStep").addEventListener("click",()=>attempt());
$("stepHint").addEventListener("click",()=>{if(!current()){inform("¡Terminaste la ruta!");return}state.hint=!state.hint;updateUI()});
$("restartRoute").addEventListener("click",()=>initState(state.route));
$("resetEverything").addEventListener("click",()=>{if(!confirm("¿Borrar todas las prácticas y respuestas completadas?"))return;completedRoutes.clear();completedQuizzes.clear();save();refreshScore();initState(state.route);qReset();inform("Progreso borrado. Nuevo comienzo.")});
$("quizHint").addEventListener("click",()=>{quizHint=true;drawQuiz()});
$("quizSolution").addEventListener("click",()=>{quizReveal=true;quizChoice=null;drawQuiz()});
$("quizRetry").addEventListener("click",qReset);
$("quizNext").addEventListener("click",qMove);
$("resetCamera").addEventListener("click",()=>{if(renderer3D)renderer3D.resetCamera();else inform("La escena 3D necesita Three.js cargado.","bad")});
$("explodeView").addEventListener("click",()=>{state.exploded=!state.exploded;$("explodeView").setAttribute("aria-pressed",String(state.exploded));$("explodeView").textContent=state.exploded?"▣ Vista ensamblada":"⬡ Vista explotada";if(renderer3D)renderer3D.sync(true)});
$("spinView").addEventListener("click",()=>{state.rotate=!state.rotate;$("spinView").setAttribute("aria-pressed",String(state.rotate));$("spinView").textContent=state.rotate?"⏸ Detener giro":"↻ Autogiro";if(renderer3D)renderer3D.spin(state.rotate)});
$("toggleLabels").addEventListener("click",()=>{state.labels=!state.labels;$("toggleLabels").setAttribute("aria-pressed",String(state.labels));$("toggleLabels").textContent=state.labels?"▧ Etiquetas":"▧ Mostrar etiquetas";if(renderer3D)renderer3D.sync()});
function start3D(THREE,OrbitControls){
 const viewport=$("viewport");
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,1,.1,140);
 camera.position.set(9.6,10.2,11.8);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.45;
 renderer.setClearColor(0x081522,0);
 viewport.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=true;controls.minDistance=5;controls.maxDistance=28;controls.target.set(0,0,0);
 scene.add(new THREE.HemisphereLight(0xb7deff,0x172136,2.55));
 const sun=new THREE.DirectionalLight(0xf5fcff,3.4);sun.position.set(3,11,8);scene.add(sun);
 const fill=new THREE.PointLight(0x4aeccd,72,26);fill.position.set(-6,4,-3);scene.add(fill);
 const world=new THREE.Group();scene.add(world);
 const mat=(color,metalness=.2,roughness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const M={chassis:mat(0x192b3a,.55,.34),bottom:mat(0x101722,.3,.43),edge:mat(0x314859,.6,.36),board:mat(0x126274,.24,.55),copper:mat(0xc88957,.8,.29),silver:mat(0x8d9ba5,.72,.28),darkMetal:mat(0x3d4a58,.72,.33),battery:mat(0x252d35,.12,.78),green:mat(0x247e61,.35,.5),chip:mat(0x192d40,.45,.3),gold:mat(0xeec479,.68,.3),fan:mat(0x293744,.3,.42),fanBlade:mat(0x425566,.35,.4),outline:mat(0x51687c,.7,.3)};
 const objects=new Map(), hitMeshes=[],labelSprites=[];
 function box(w,h,d,material,x=0,y=0,z=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);return mesh}
 function cylinder(radius,height,material,x=0,y=0,z=0,segments=32){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material);mesh.position.set(x,y,z);return mesh}
 function group(key,base=[0,0,0]){const g=new THREE.Group();g.position.set(...base);g.userData.base=new THREE.Vector3(...base);g.userData.goal=new THREE.Vector3(...base);g.userData.key=key;world.add(g);if(!objects.has(key))objects.set(key,[]);objects.get(key).push(g);return g}
 function add(g,mesh,key=g.userData.key,index=null){g.add(mesh);mesh.userData.pickKey=key;mesh.userData.pickIndex=index;if(mesh.isMesh)hitMeshes.push(mesh);return mesh}
 function screw(key,base,index){const g=group(key,base);const m=add(g,cylinder(.088,.058,M.silver,0,0,0,12),key,index);
  add(g,box(.14,.009,.02,M.darkMetal,0,.037,0),key,index);add(g,box(.02,.009,.14,M.darkMetal,0,.038,0),key,index);g.userData.index=index;return g}
 function textSprite(s,base,size=1){
  const c=document.createElement("canvas");c.width=512;c.height=100;const ctx=c.getContext("2d");ctx.fillStyle="rgba(7,25,37,.88)";ctx.beginPath();ctx.roundRect(2,4,508,91,20);ctx.fill();ctx.strokeStyle="#66dbc8";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#e5fff7";ctx.font="bold 36px Arial";ctx.textAlign="center";ctx.fillText(s,256,64);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sp.scale.set(size*2.5,size*.49,1);sp.position.set(...base);sp.renderOrder=20;scene.add(sp);labelSprites.push(sp);return sp;
 }
 function segment(g,a,b,r,material,key){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),direction=v2.clone().sub(v1);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),10),material);m.position.copy(v1).add(v2).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());add(g,m,key);return m}
 // Chassis and representative motherboard, viewed from the removable lower cover.
 const body=group("motherboard");
 add(body,box(10.25,.28,6.68,M.chassis,0,-.11,0));
 add(body,box(10.02,.045,6.48,M.edge,0,.051,0));
 add(body,box(9.35,.075,4.55,M.board,0,.13,-.36));
 for(let i=0;i<25;i++){
  const x=-4.2+(i%9)*.92,z=-2.12+Math.floor(i/9)*1.05;
  add(body,box(.34,.028,.16,i%3?M.darkMetal:M.silver,x,.19,z));
 }
 for(let i=0;i<32;i++){
  const x=-4.4+(i%8)*1.17,z=-1.93+Math.floor(i/8)*.7;
  add(body,box(.35,.006,.012,M.gold,x,.183,z));
 }
 // Back thermal pipes, CPU and GPU: schematic locations.
 const cp=group("cpu",[.15,.29,-.75]);add(cp,box(.85,.09,.88,M.chip));add(cp,box(.7,.011,.73,M.silver,0,.06,0));
 const gp=group("gpu",[-1.35,.28,-.65]);add(gp,box(.9,.09,.84,M.chip));add(gp,box(.73,.01,.64,M.silver,0,.055,0));
 const heat=group("heat");
 for(const [x1,z1,x2,z2] of [[-.95,-.65,-3.35,-2.03],[.65,-.78,3.32,-2.06],[-.9,-.81,3.34,-2.25],[.15,-.6,-3.32,-2.31]])
 segment(heat,[x1,.51,z1],[x2,.51,z2],.095,M.copper,"heat");
 add(heat,box(2.3,.17,.55,M.copper,-.25,.51,-.79));
 for(const x of [-4.15,4.15])for(let j=0;j<12;j++)add(heat,box(.68,.22,.037,M.darkMetal,x,.48,-2.78+j*.034));
 // Twin fans with radial blades.
 const fans=group("fan");
 for(const cx of [-3.72,3.72]){
  const fan=new THREE.Group();fan.position.set(cx,.43,-1.97);fans.add(fan);
  const ring=add(fan,new THREE.Mesh(new THREE.TorusGeometry(.83,.095,11,44),M.fan),"fan");
  ring.rotation.x=-Math.PI/2;
  add(fan,cylinder(.19,.12,M.silver,0,.04,0),"fan");
  for(let i=0;i<14;i++){const theta=i*Math.PI*2/14;const blade=box(.47,.055,.12,M.fanBlade,Math.cos(theta)*.47,0,Math.sin(theta)*.47);blade.rotation.y=theta+.5;add(fan,blade,"fan")}
  for(let j=0;j<13;j++){add(fan,box(.048,.055,.05,M.outline,cx<0?-.97:.97,.05,-.55+j*.095),"fan")}
 }
 const fanCable=group("fanConnector");for(const x of [-2.7,2.7]){
  add(fanCable,box(.39,.11,.22,M.gold,x,.39,-1.47));
  add(fanCable,box(.2,.035,.18,M.battery,x,.48,-1.47));
 }
 const battery=group("battery",[0,.33,2.24]);
 add(battery,box(7.4,.37,1.25,M.battery));
 for(let i=0;i<5;i++)add(battery,box(1.25,.004,.72,M.darkMetal,-2.85+i*1.43,.195,0));
 const battWire=group("batteryConnector",[-.62,.38,1.45]);
 add(battWire,box(.53,.14,.28,M.gold));add(battWire,box(.6,.026,.14,M.darkMetal,0,.1,.02));
 segment(battWire,[-.3,.02,.08],[-.72,.02,.42],.038,M.gold,"batteryConnector");
 const ram=group("ram",[.65,.3,.32]);
 for(let k=0;k<2;k++){add(ram,box(1.65,.12,.35,M.green,0,.04,k*.36-.19));for(let i=0;i<11;i++)add(ram,box(.1,.01,.1,M.chip,-.7+i*.14,.112,k*.36-.19))}
 const shield=group("ramShield",[.65,.57,.32]);add(shield,box(2.15,.09,1.2,M.silver));add(shield,box(1.8,.008,.08,M.darkMetal,0,.06,-.42));
 const ssd=group("ssd",[3.04,.28,.52]);add(ssd,box(.7,.065,1.82,M.green));for(let i=0;i<5;i++)add(ssd,box(.52,.008,.17,M.chip,0,.038,-.6+i*.29));add(ssd,box(.48,.01,.16,M.gold,0,.039,.82));
 const plate=group("plate",[3.06,.51,.52]);add(plate,box(1.34,.09,2.15,M.silver));add(plate,box(1.04,.01,.29,M.darkMetal,0,.051,.5));
 const hard=group("hdd",[-3,.28,1.33]);add(hard,box(2.33,.27,1.8,M.darkMetal));add(hard,box(1.83,.012,.95,M.silver,0,.144,0));
 const ports=group("ports");for(let i=0;i<4;i++){add(ports,box(.58,.18,.25,M.darkMetal,-2.8+i*1.85,.07,-3.41))}
 const caseScrews=[];
 const caseXY=[[-4.6,-2.92],[-2.7,-2.92],[0,-2.92],[2.7,-2.92],[4.6,-2.92],[-4.62,0],[4.62,0],[-4.58,2.9],[-1.45,2.9],[1.45,2.9],[4.58,2.9]];
 caseXY.forEach(([x,z],i)=>caseScrews.push(screw("caseScrew",[x,.89,z],i)));
 const plateScrews=[];
 [[-.53,-.89],[.53,-.89],[0,.91]].forEach(([x,z],i)=>plateScrews.push(screw("plateScrew",[3.06+x,.635,.52+z],i)));
 const fanScrews=[];
 [[-4.43,-2.52],[-3.25,-1.1],[-3.26,-2.67],[3.25,-1.1],[4.42,-2.51]].forEach(([x,z],i)=>fanScrews.push(screw("fanScrew",[x,.63,z],i)));
 const ssdScrew=screw("ssdScrew",[3.04,.405,1.41],0);
 const cover=group("cover",[0,.74,0]);
 add(cover,box(10.13,.19,6.58,M.bottom));
 for(let x=-4.15;x<=4.15;x+=.38)for(let z=-2.56;z<-.48;z+=.35)add(cover,box(.14,.011,.12,M.darkMetal,x,.1,z));
 for(let x=-4.15;x<=4.15;x+=.4)add(cover,box(.16,.009,.02,M.edge,x,.1,2.75));
 // Part labels overlay (not perfectly positioned relative to a manufactured unit).
 const labels=[
 textSprite("VENTILADORES",[-3.55,1.05,-2.88],.82),
 textSprite("BATERÍA",[0,1.04,2.2],.7),
 textSprite("RAM SO-DIMM",[.72,1.02,.35],.75),
 textSprite("SSD M.2",[3.12,1.03,.55],.69),
 textSprite("Ryzen 7",[-.02,1.00,-.75],.64)
 ];
 // Mark stages and visuals with groups moving, not destructive geometry rebuilds.
 const objectsKeys=new Map([...objects].map(([id,v])=>[id,v]));
 function movePart(id,visible,offset=[0,0,0]){
  const list=objectsKeys.get(id)||[];
  for(const obj of list){
   obj.visible=visible;
   const base=obj.userData.base;
   obj.userData.goal.set(base.x+offset[0],base.y+offset[1],base.z+offset[2]);
  }
 }
 function sync(jump=false){
  const open=!state.coverPresent,exp=state.exploded;
  movePart("cover",true,open?[-8.8,1.7,.1]:exp?[0,3,0]:[0,0,0]);
  const seeInside=open||exp;
  // Show cover as a faint silhouette for exploded inspection only.
  const coverGroup=objectsKeys.get("cover")[0];
  coverGroup.traverse(mesh=>{if(mesh.isMesh && mesh.material===M.bottom)mesh.material.transparent=exp&&!open,mesh.material.opacity=exp&&!open?.20:1});
  movePart("battery",seeInside,state.batteryConnected?exp?[0,.65,0]:[0,0,0]:exp?[0,.65,0]:[0,0,0]);
  movePart("batteryConnector",seeInside,state.batteryConnected?[0,0,0]:[0,.25,.68]);
  movePart("ram",seeInside&&state.ramPresent,exp?[0,.4,0]:[0,0,0]);
  movePart("ramShield",seeInside, state.ramShieldPresent?(exp?[0,1.3,0]:[0,0,0]):[5.9,1.15,.2]);
  movePart("ssd",seeInside&&state.ssdPresent,exp?[.25,.38,0]:[0,0,0]);
  movePart("plate",seeInside,state.platePresent?(exp?[0,1.25,0]:[0,0,0]):[6.4,1.1,-.9]);
  movePart("fan",seeInside,state.fansPresent?(exp?[0,.55,0]:[0,0,0]):[7.1,1.2,-2.0]);
  movePart("fanConnector",seeInside, state.fanConnectors?[0,0,0]:[0,.24,.32]);
  for(const id of ["motherboard","cpu","gpu","heat","hdd","ports"])movePart(id,true);
  objectsKeys.get("caseScrew").forEach((g,i)=>{g.visible=!state.caseScrews.has(i);g.userData.goal.copy(g.userData.base)});
  objectsKeys.get("plateScrew").forEach((g,i)=>{g.visible=seeInside&&state.platePresent&&!state.plateScrews.has(i);g.userData.goal.copy(g.userData.base)});
  objectsKeys.get("fanScrew").forEach((g,i)=>{g.visible=seeInside&&state.fansPresent&&!state.fanScrews.has(i);g.userData.goal.copy(g.userData.base)});
  // The SSD screw is initially installed; show it unless removed.
  ssdScrew.visible=seeInside&&state.ssdPresent&&state.ssdFastener&&!state.platePresent;
  if(!open&&!exp){
   for(const id of ["battery","batteryConnector","ram","ramShield","ssd","plate","fan","fanConnector","cpu","gpu","heat","hdd","ports"])for(const o of objectsKeys.get(id)||[])o.visible=false;
  }
  labels.forEach((label,i)=>{label.visible=state.labels&&seeInside&&([
   state.fansPresent,true,state.ramShieldPresent,state.platePresent,true
  ][i]);});
  if(jump)for(const groups of objectsKeys.values())for(const g of groups)g.position.copy(g.userData.goal);
  highlight();
 }
 function highlight(){
  const id=state.selected||current()?.target;
  const list=objectsKeys.get(id)||[];
  selection.visible=false;
  let obj=list.find(g=>g.visible);if(!obj)return;
  const b=new THREE.Box3().setFromObject(obj);
  if(b.isEmpty())return;
  const sz=new THREE.Vector3(),center=new THREE.Vector3();b.getSize(sz);b.getCenter(center);
  selection.visible=true;selection.position.set(center.x,Math.max(.3,b.max.y+.08),center.z);
  selection.scale.set(Math.max(.30,sz.x*1.15),Math.max(.30,sz.z*1.13),1);
 }
 const selection=new THREE.Mesh(new THREE.RingGeometry(.47,.54,56),new THREE.MeshBasicMaterial({color:0x69f8d8,transparent:true,opacity:.82,side:THREE.DoubleSide,depthTest:false}));
 selection.rotation.x=-Math.PI/2;selection.renderOrder=17;scene.add(selection);
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();renderer.setSize(Math.max(1,w),Math.max(1,h),false)}
 function shown(mesh){for(let n=mesh;n;n=n.parent){if(!n.visible)return false}return true}
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let start=null;
 renderer.domElement.addEventListener("pointerdown",e=>{start={x:e.clientX,y:e.clientY,pointerId:e.pointerId}});
 renderer.domElement.addEventListener("pointerup",e=>{
  if(!start||start.pointerId!==e.pointerId)return;
  const distance=Math.hypot(e.clientX-start.x,e.clientY-start.y);start=null;if(distance>8)return;
  const rect=renderer.domElement.getBoundingClientRect();if(!rect.width||!rect.height)return;
  pointer.x=(e.clientX-rect.left)/rect.width*2-1;pointer.y=-(e.clientY-rect.top)/rect.height*2+1;
  ray.setFromCamera(pointer,camera);
  const hit=ray.intersectObjects(hitMeshes,false).find(x=>shown(x.object)&&x.object.userData.pickKey);
  if(!hit)return;
  const key=hit.object.userData.pickKey,idx=hit.object.userData.pickIndex;
  selectedPart(key);
  const s=current();if(s&&s.target===key){attempt(key,idx)}else if(s){inform("Seleccionaste «"+PARTS[key].name+"». Para continuar debes trabajar sobre: "+(PARTS[s.target]?.name||s.title)+".")}
 });
 renderer.domElement.addEventListener("pointercancel",()=>{start=null});
 renderer.domElement.addEventListener("pointermove",e=>{if(e.buttons)return;const r=renderer.domElement.getBoundingClientRect();if(!r.width)return;pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-(e.clientY-r.top)/r.height*2+1;ray.setFromCamera(pointer,camera);renderer.domElement.style.cursor=ray.intersectObjects(hitMeshes,false).some(x=>shown(x.object))?"pointer":"grab"});
 window.addEventListener("resize",resize);
 if(window.ResizeObserver)new ResizeObserver(resize).observe(viewport);
 function cameraHome(){camera.position.set(9.6,10.2,11.8);controls.target.set(0,0,0);controls.update()}
 function focus(id){
  const g=(objectsKeys.get(id)||[]).find(g=>g.visible);if(!g){inform("Para ver esta pieza, primero retira la cubierta o activa la vista explotada.");return}
  const b=new THREE.Box3().setFromObject(g);if(b.isEmpty())return;const p=new THREE.Vector3();b.getCenter(p);controls.target.copy(p);camera.position.copy(p).add(new THREE.Vector3(6,7,8));controls.update();
 }
 const clock=new THREE.Clock();
 const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 function animate(){
  requestAnimationFrame(animate);const dt=Math.min(.05,clock.getDelta());
  for(const groups of objectsKeys.values())for(const g of groups)g.position.lerp(g.userData.goal,Math.min(1,dt*7));
    if(selection.visible&&!reduced)selection.material.opacity=.55+.3*Math.sin(performance.now()*.003);
  controls.update();renderer.render(scene,camera);
 }
 resize();sync(true);animate();
 return {sync,highlight,resize,resetCamera:cameraHome,focus,spin(v){controls.autoRotate=v;controls.autoRotateSpeed=1.1}};
}
cards();initState("ram");selectedPart("cover");refreshScore();drawQuiz();
(async()=>{
 try{
  const THREE=await import("three");
  const module=await import("three/addons/controls/OrbitControls.js");
  renderer3D=start3D(THREE,module.OrbitControls);
  $("loading3d").classList.add("hidden");$("engineBadge").textContent="● WEBGL 3D ACTIVO";
  $("engineBadge").style.borderColor="#48a88d";
 }catch(error){
  console.error("Error al iniciar Three.js:",error);
  $("loading3d").innerHTML="No se pudo cargar Three.js. Comprueba tu conexión o navegador.<br><br>Las misiones, instrucciones y preguntas siguen disponibles con el botón «Realizar paso».";
  $("engineBadge").textContent="MODO TEXTO";
 }
})();
