(function startLab(){
  'use strict';
  const B=window.LegionBench,G=window.LegionGraphics;
  const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
  const storeKey='learningstudio.legion.components.v1';
  let writable=true, stored=null;
  try{stored=JSON.parse(localStorage.getItem(storeKey));}catch{stored=null;}
  const names=['free','guide',...Object.keys(B.missions)];
  const sessions={};for(const key of names)sessions[key]=B.valid(stored?.sessions?.[key])?stored.sessions[key]:B.fresh(key);
  let mode=names.includes(stored?.mode)?stored.mode:'free';
  let currentCase=B.missions[stored?.currentCase]?stored.currentCase:'post';
  let badges=new Set(Array.isArray(stored?.badges)?stored.badges.filter(k=>Object.hasOwn(B.missions,k)):[]);
  const ui={
    selected:Object.hasOwn(B.parts,stored?.selected||'')?stored.selected:'ramA',view:stored?.view==='2d'?'2d':'3d',
    labels:stored?.labels!==false,explode:stored?.explode===true,
    paused:typeof stored?.paused==='boolean'?stored.paused:matchMedia('(prefers-reduced-motion: reduce)').matches,low:stored?.low===true
  };
  const state=()=>sessions[mode], el3=$('#canvas3'),el2=$('#plan'),stage=$('#stage'),tray=$('#tray'),dialog=$('#dialog');
  let v3=null,view=null,unavailable=false,hintLevel=0,ticket=null,secondTouch=false,dragId=null,markers=[],savedTarget=null;
  const touches=new Set();
  function persist(){
    try{localStorage.setItem(storeKey,JSON.stringify({sessions,mode,currentCase,badges:[...badges],...ui}));writable=true;}
    catch{writable=false;}
    $('#save-status').textContent=writable?'Progreso guardado en este navegador':'Progreso temporal de esta pestaña';
  }
  function icons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=G.icon(el.dataset.icon);});}
  icons();
  if(location.protocol==='file:'){
    for(const a of all('a[href="../../"]'))a.href='https://duvancalderon.github.io/Demos/';
    $('#download').hidden=true;
  }
  function feedback(msg,error=false){
    $('#message').textContent=msg;$('#feedback').dataset.kind=error?'error':'ok';
    const msgBox=$('#quick-message');if(dialog.open&&msgBox)msgBox.textContent=msg;
  }
  function select(id){if(!Object.hasOwn(B.parts,id))return;ui.selected=id;savedTarget=null;render();}
  function reposition(){
    if(!view||!markers.length)return;
    const bounds=stage.getBoundingClientRect();
    for(const m of markers){
      const p=m.slot?view.projectSlot(m.id):view.projectPart(m.id);
      const visible=p&&p.x>6&&p.x<bounds.width-6&&p.y>9&&p.y<bounds.height-8;
      m.el.hidden=!visible;if(!visible)continue;
      m.el.style.left=p.x+'px';m.el.style.top=(p.y-(m.slot?0:10))+'px';
    }
  }
  function buildMarkers(){
    const root=$('#markers');root.replaceChildren();markers=[];
    if(!view)return;
    let ids=dragId?Object.keys(B.slots):ui.labels?[...new Set(['thermal','battery','hdd','ssd',ui.selected])]:[];
    if(!dragId&&stage.clientWidth<455)ids=ids.filter(id=>id===ui.selected||id==='hdd'||id==='thermal');
    for(const id of ids){
      const el=document.createElement('span');
      if(dragId){
        const slot=B.slots[id],compatible=slot.type===B.parts[dragId].type;
        const occupied=Object.entries(state().location).some(([part,loc])=>part!==dragId&&loc===id);
        el.className='mark target '+(compatible&&!occupied?'good':'bad');el.dataset.socket=id;el.textContent=slot.name;
      }else{
        el.className='mark'+(id===ui.selected?' selected':'');el.dataset.anchor=id;el.textContent=B.parts[id].short;
      }
      root.append(el);markers.push({id,slot:!!dragId,el});
    }
    reposition();
  }
  const v2=G.planar(el2,reposition);
  function changeView(which,save=true){
    if(ticket||dragId)cancelDrag();
    if(view)view.active(false);
    if(which==='3d'&&!unavailable&&!v3){
      el3.hidden=false;
      try{v3=window.createLegionModel(el3,reposition,()=>{unavailable=true;changeView('2d');feedback('Se perdió el contexto 3D. Tu montaje sigue disponible en el plano.',true);});}
      catch{unavailable=true;}
    }
    ui.view=which==='3d'&&v3&&!unavailable?'3d':'2d';
    view=ui.view==='3d'?v3:v2;
    el3.hidden=ui.view!=='3d';el2.toggleAttribute('hidden',ui.view==='3d');view.active(true);
    $('#v3').disabled=unavailable;$('#v3').setAttribute('aria-pressed',String(ui.view==='3d'));$('#v2').setAttribute('aria-pressed',String(ui.view==='2d'));
    $('#view-name').textContent=ui.view==='3d'?(v3.software?'Perspectiva · 3D ligero':'Perspectiva'):'Vista superior';
    $('#gesture-help').textContent=ui.view==='3d'?'Gira desde el fondo · Rueda o pellizco para acercar':'Arrastra módulos · Usa + y − para el zoom';
    const lightView=ui.view==='3d'&&v3?.software;
    $('#gl-notice').hidden=!unavailable&&!lightView;
    if(unavailable)$('#gl-notice').textContent='Se activó el plano 2D. Conserva las piezas, los encajes y todas las pruebas.';
    else if(lightView)$('#gl-notice').textContent='WebGL no está disponible. El modo 3D ligero dibuja el mismo montaje con Canvas.';
    render(save);view.resize();
  }
  const options=Object.entries(B.slots).map(([id,p])=>`<option value="${id}">${p.name}</option>`).join('');
  $('#slot-select').innerHTML=options;
  $('#case-select').innerHTML=Object.entries(B.missions).map(([id,m])=>`<option value="${id}">${m.name}</option>`).join('');
  $('#inventory').innerHTML=Object.entries(B.parts).map(([id,p])=>`<button type="button" data-id="${id}" aria-label="Inspeccionar ${p.name}"><span class="inv-num">${p.number}</span>${G.icon(p.icon)}<span>${p.short}</span></button>`).join('');
  function status(id){
    const s=state(),p=B.parts[id];
    if(p.home)return s.location[id]?'Instalada en '+B.slots[s.location[id]].name:'En la bandeja';
    if(id==='battery')return s.battery?'Conector acoplado':'Conector aislado';
    if(id==='cpu'||id==='gpu')return 'Soldado a la placa';
    return id==='thermal'?'Instalado sobre CPU y GPU':'Instalada en el chasis';
  }
  function renderPiece(){
    const id=ui.selected,p=B.parts[id],s=state(),out=p.home&&!s.location[id];
    $('#ins-title').textContent=p.name;$('#ins-class').textContent=p.family;$('#ins-spec').textContent=p.spec;$('#ins-desc').textContent=p.function;
    $('#ins-experiment').textContent=p.experiment;$('#ins-status').textContent=status(id);$('#ins-count').textContent=p.number+' / 10';
    $('#specimen').innerHTML=G.specimen(id);$('#slot-choice').hidden=!out;
    if(out){
      const free=Object.keys(B.slots).find(k=>B.slots[k].type===p.type&&!Object.values(s.location).includes(k));
      $('#slot-select').value=savedTarget||free||p.home;
    }
    let label,icon;
    if(p.home){label=out?'Instalar en el destino':'Extraer pieza';icon=out?'insert':'extract';}
    else if(id==='battery'){label=s.battery?'Desconectar batería':'Conectar batería';icon='plug';}
    else if(id==='board'){label='Inspeccionar ranuras';icon='plan';}
    else{label=ui.explode?'Reunir capas':'Separar capas';icon='layers';}
    $('#piece-action').innerHTML=G.icon(icon)+label;
    for(const b of all('#inventory button'))b.setAttribute('aria-pressed',String(b.dataset.id===id));
    const removed=B.removable.filter(k=>!s.location[k]);
    const trayHTML=removed.map(k=>`<button class="tray-chip${k===id?' active':''}" data-tray="${k}" title="Seleccionar o arrastrar ${B.parts[k].name}">${B.parts[k].short}</button>`).join('');
    const trayParts=$('#tray-parts');if(trayParts.innerHTML!==trayHTML)trayParts.innerHTML=trayHTML;
    tray.classList.toggle('has-parts',removed.length>0);
  }
  const serviceInfo={
    cover:{icon:'layers',name:'Cubierta',attr:'open',yes:'Abierta',no:'Cerrada',on:'Cerrar cubierta',off:'Abrir cubierta'},
    battery:{icon:'battery',name:'Batería',attr:'battery',yes:'Conectada',no:'Aislada',on:'Desconectar batería',off:'Conectar batería'},
    ac:{icon:'plug',name:'Cargador',attr:'ac',yes:'Enchufado',no:'Fuera',on:'Retirar cargador',off:'Enchufar cargador'}
  };
  function renderPower(){
    const s=state(),v=B.stats(s);
    for(const btn of all('[data-service]')){
      const p=serviceInfo[btn.dataset.service],yes=s[p.attr];
      btn.innerHTML=G.icon(p.icon)+`<span><strong>${p.name}</strong><small>${yes?p.yes:p.no}</small></span>`;
      btn.setAttribute('aria-label',(yes?p.on:p.off)+' · '+(yes?p.yes:p.no));btn.title=yes?p.on:p.off;
      btn.setAttribute('aria-pressed',String(yes));
    }
    const report=s.last?.msg||'Cierra la cubierta y comprueba el montaje.';
    $('#boot-title').textContent=s.on?'Equipo encendido':s.last?'Resultado de la prueba':'Equipo apagado';
    $('#boot-report').textContent=report;
    for(const el of all('#boot,#quick-boot'))el.innerHTML=G.icon('power')+(s.on?'Apagar equipo':'Encender y comprobar');
    $('#ram-total').textContent=v.ram+' GB';$('#channels').textContent=v.channels;$('#disks').textContent=v.disks;
    $('#load').value=s.load;$('#load-value').textContent=s.load+' GB';
    const diff=s.load-v.ram;
    $('#load-report').textContent=diff>0?`La aplicación pide ${diff} GB más que la RAM instalada. El cálculo excluye el sistema y la paginación.`:`La aplicación cabe en la RAM instalada. Margen teórico de ${-diff} GB antes de reservar memoria para el sistema.`;
    $('#score-value').textContent=badges.size+' / 4';
  }
  function renderTask(){
    const s=state(),m=B.missions[mode],g=mode==='guide';
    $('#task-panel').hidden=mode==='free';$('#case-label').hidden=!m;
    all('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===mode||(b.dataset.mode==='missions'&&!!m)));});
    if(mode==='free')return;
    if(m)$('#case-select').value=mode;
    $('#task-title').textContent=g?(s.won?'Práctica completada':B.guided[s.step][0]):m.level;
    $('#task-body').textContent=g?(s.won?'Has arrancado sin el HDD y luego has recuperado los datos al reinstalarlo.':B.guided[s.step][1]):m.goal;
    $('#task-progress').textContent=s.won?'✓ Completada':g?'Paso '+(s.step+1)+' de '+B.guided.length:mode==='build'?'Montaje inicial':s.witness?'Referencia registrada':'Falta observar el caso inicial';
    $('#hint').disabled=s.won;$('#solution').disabled=s.won;
  }
  function render(save=true){
    if(!view)return;
    renderPiece();renderPower();renderTask();
    $('#explode').setAttribute('aria-pressed',String(ui.explode));$('#labels').setAttribute('aria-pressed',String(ui.labels));
    view.setState(state(),ui);buildMarkers();
    if(save)persist();
  }
  function apply(action,result){
    if(!result.ok){feedback(result.msg,true);return;}
    const s=state(),was=s.won,oldStep=s.step;
    B.record(s,mode,action);if(s.won&&B.missions[mode])badges.add(mode);
    let msg=result.msg;
    if(!was&&s.won)msg+=' '+(mode==='guide'?'Práctica guiada completada.':'Misión completada: '+B.missions[mode].name+'.');
    else if(mode==='guide'&&s.step!==oldStep)msg+=' Siguiente paso: '+B.guided[s.step][0]+'.';
    if(s.step!==oldStep||(!was&&s.won))clearHint();
    savedTarget=null;render();feedback(msg,action==='boot'&&s.last&&s.last.code!=='ok');
  }
  function move(id,dest){apply('move',B.move(state(),id,dest));}
  function service(id){apply(id,B.service(state(),id));}
  function runBoot(){apply('boot',B.boot(state()));}
  function clearHint(){hintLevel=0;$('#hint-readout').hidden=true;$('#hint-readout').textContent='';}
  function changeMode(k){
    cancelDrag();mode=k;if(B.missions[k])currentCase=k;clearHint();savedTarget=null;render();
    feedback(mode==='free'?'Exploración libre. Se recuperó el montaje de tu mesa.':mode==='guide'?'Guía activa. Sigue el objetivo que aparece sobre el modelo.':'Caso activo: '+B.missions[mode].name+'.');
  }
  function toggleExplode(){
    ui.explode=!ui.explode;render();
    feedback(ui.explode?(ui.view==='3d'?'Despiece activo. Las capas se separan para inspeccionar CPU, GPU y ranuras.':'En el plano por capas se muestran los chips bajo los tubos de calor.'):'Vista de conjunto. El montaje conserva su estado.');
  }
  function openDialog(title,markup){
    $('#dialog-title').textContent=title;$('#dialog-body').innerHTML=markup;
    if(!dialog.open)dialog.showModal();
  }
  function closeDialog(){dialog.close();}
  function quickPower(){
    openDialog('Alimentación y arranque',`<div class="quick-controls">${Object.keys(serviceInfo).map(k=>`<button data-service="${k}"></button>`).join('')}</div><button id="quick-boot" class="boot"></button><p id="quick-message" role="status"></p>`);
    renderPower();$('#quick-message').textContent=state().last?.msg||'Prepara la alimentación y cierra la cubierta para probar el equipo.';
  }
  function settings(){
    openDialog('Ajustes de vista',`<button data-setting="paused" class="setting" aria-pressed="${ui.paused}">Pausar giro de ventiladores <strong>${ui.paused?'Sí':'No'}</strong></button><button data-setting="low" class="setting" aria-pressed="${ui.low}">Resolución 3D reducida <strong>${ui.low?'Sí':'No'}</strong></button><p>En 3D también puedes girar con las flechas y hacer zoom con + y − al enfocar el modelo. En el plano, las flechas desplazan la vista.</p><p><strong>Girar cámara</strong></p><div class="dialog-actions"><button data-turn="-1">← Izquierda</button><button data-turn="1">Derecha →</button></div>`);
  }
  function resetPrompt(total){
    openDialog(total?'Reiniciar laboratorio':'Repetir este caso',`<p>${total?'Se borrarán los montajes, las misiones completadas y los ajustes de este laboratorio en este navegador.':'El caso volverá a su montaje inicial. Conservarás las misiones que ya acreditaste.'}</p><div class="dialog-actions"><button data-confirm="${total?'all':'case'}" class="danger">Reiniciar</button><button data-dismiss>Cancelar</button></div>`);
  }
  $('#close-dialog').onclick=closeDialog;
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
  $('#dialog-body').addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;
    if(btn.hasAttribute('data-dismiss'))return closeDialog();
    if(btn.dataset.service)return service(btn.dataset.service);
    if(btn.id==='quick-boot')return runBoot();
    if(btn.dataset.turn){view.rotate(Number(btn.dataset.turn)*.25,0);return;}
    if(btn.dataset.setting){const k=btn.dataset.setting;ui[k]=!ui[k];btn.setAttribute('aria-pressed',String(ui[k]));btn.querySelector('strong').textContent=ui[k]?'Sí':'No';render();return;}
    if(btn.dataset.confirm){
      closeDialog();cancelDrag();
      if(btn.dataset.confirm==='all'){
        names.forEach(k=>sessions[k]=B.fresh(k));badges.clear();mode='free';currentCase='post';
        Object.assign(ui,{selected:'ramA',explode:false,labels:true,paused:matchMedia('(prefers-reduced-motion: reduce)').matches,low:false});changeView('3d');
      }else sessions[mode]=B.fresh(mode);
      clearHint();savedTarget=null;view.home();render();feedback('Mesa reiniciada. Puedes volver a practicar.');
    }
  });
  $('#help').onclick=()=>openDialog('Guía del banco','<ul><li><strong>Inspecciona.</strong> Toca una pieza del modelo o elige su nombre en Componentes. Usa Despiece para ver los chips bajo la refrigeración.</li><li><strong>Extrae y monta.</strong> Con el equipo apagado, sin cargador, abierto y con la batería aislada, arrastra el módulo a la bandeja. Para devolverlo, arrástralo desde su ficha hasta la ranura o usa el selector Destino.</li><li><strong>Prueba el arranque.</strong> Conecta una fuente, cierra la cubierta y pulsa Encender y comprobar. El banco corta la prueba tras un fallo.</li><li><strong>Mueve la cámara.</strong> Arrastra el fondo con un dedo. Usa dos dedos para zoom y desplazamiento, o rueda y botón derecho con ratón. C centra la vista.</li></ul><p>Cada modo conserva su propia mesa. Las fuentes y las simplificaciones están al pie del laboratorio.</p>');
  $('#options').onclick=settings;$('#quick-power').onclick=quickPower;
  all('[data-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.mode==='missions'?currentCase:b.dataset.mode));
  $('#score').onclick=()=>changeMode(currentCase);$('#case-select').onchange=e=>changeMode(e.target.value);
  $('#v3').onclick=()=>changeView('3d');$('#v2').onclick=()=>changeView('2d');
  $('#home').onclick=()=>{view.home();feedback('Vista centrada.');};
  $('#zoom-in').onclick=()=>view.zoom(1.22);$('#zoom-out').onclick=()=>view.zoom(1/1.22);
  $('#explode').onclick=toggleExplode;$('#labels').onclick=()=>{ui.labels=!ui.labels;render();};
  $('#inventory').onclick=e=>{const b=e.target.closest('[data-id]');if(b)select(b.dataset.id);};
  $('#tray-parts').onclick=e=>{const b=e.target.closest('[data-tray]');if(b&&!dragId)select(b.dataset.tray);};
  $('#slot-select').onchange=e=>{savedTarget=e.target.value;};
  $('#piece-action').onclick=()=>{
    const id=ui.selected,p=B.parts[id],s=state();
    if(p.home)return move(id,s.location[id]?null:$('#slot-select').value);
    if(id==='battery')return service('battery');
    if(id==='board')return openDialog('Ranuras de la placa',`<ul>${Object.entries(B.slots).map(([k,slot])=>{const name=B.removable.find(id=>s.location[id]===k);return '<li><strong>'+slot.name+'</strong> · '+(name?B.parts[name].name:'Libre')+'</li>';}).join('')}</ul>`);
    toggleExplode();
  };
  $('#service-controls').onclick=e=>{const b=e.target.closest('[data-service]');if(b)service(b.dataset.service);};
  $('#boot').onclick=runBoot;
  $('#load').oninput=e=>{state().load=Number(e.target.value);renderPower();persist();};
  $('#reset-all').onclick=()=>resetPrompt(true);$('#repeat').onclick=()=>resetPrompt(false);
  $('#hint').onclick=()=>{
    const s=state(),hint=$('#hint-readout');
    const guideHints=[
      ['Busca el control Cubierta.','En Alimentación, pulsa Cubierta cuando el cargador esté fuera.'],
      ['Una batería conectada sigue alimentando la placa.','Pulsa Batería mientras la cubierta está abierta.'],
      ['El disco de datos ocupa la bahía grande delantera.','Selecciona HDD SATA y pulsa Extraer pieza.'],
      ['El sistema vive en el SSD. Deja ese módulo en M.2.','Reconecta la batería, cierra la cubierta y enciende con el HDD en la bandeja.'],
      ['Vuelve al montaje con dos unidades.','Apaga, abre, aísla, instala el HDD en SATA, reconecta batería, cierra y enciende.']
    ];
    const list=mode==='guide'?guideHints[s.step]:B.missions[mode].hints;
    hintLevel=Math.min(hintLevel+1,list.length);hint.textContent='Pista '+hintLevel+' / '+list.length+' · '+list[hintLevel-1];hint.hidden=false;
  };
  $('#solution').onclick=()=>{const el=$('#hint-readout');el.textContent=mode==='guide'?'Retira el HDD con la batería aislada. Usa el SSD para un arranque sin HDD. Apaga y repite el montaje con el HDD para recuperar sus datos.':B.missions[mode].solution;el.hidden=false;};
  function inside(el,x,y){const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
  function cancelDrag(){
    ticket=null;secondTouch=false;touches.clear();
    if(dragId&&view)view.clearDrag();dragId=null;
    stage.classList.remove('dragging');tray.classList.remove('over');$('#drag-ghost').hidden=true;
    if(view)buildMarkers();
  }
  function down(e){
    if(e.button!==0)return;
    const chip=e.target.closest?.('[data-tray]'),surface=e.target===el3||e.target===el2||el2.contains(e.target);
    if(!surface&&!chip)return;
    if(e.pointerType==='touch'){
      touches.add(e.pointerId);
      if(touches.size>1){secondTouch=true;ticket=null;if(dragId){dragId=null;view.clearDrag();stage.classList.remove('dragging');tray.classList.remove('over');$('#drag-ghost').hidden=true;buildMarkers();}return;}
    }
    const id=chip?chip.dataset.tray:view.pick(e.clientX,e.clientY);
    ticket={pointer:e.pointerId,id,chip:!!chip,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    if(chip)tray.setPointerCapture?.(e.pointerId);
    else if(ui.view==='2d')el2.setPointerCapture?.(e.pointerId);
  }
  function pointerMove(e){
    const t=ticket;if(!t||e.pointerId!==t.pointer||secondTouch)return;
    if(!t.moved&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<6)return;
    t.moved=true;
    if(t.id&&B.parts[t.id]?.home){
      e.stopPropagation();e.preventDefault();
      const lock=B.whyLocked(state());
      if(lock){if(!t.warned){feedback(lock,true);t.warned=true;}return;}
      if(!dragId){ui.selected=t.id;savedTarget=null;dragId=t.id;renderPiece();buildMarkers();stage.classList.add('dragging');}
      const overTray=inside(tray,e.clientX,e.clientY),overStage=inside(stage,e.clientX,e.clientY);
      tray.classList.toggle('over',overTray);
      const socket=overStage?view.slotAt(e.clientX,e.clientY):null;
      if(overStage)view.drag(dragId,e.clientX,e.clientY);
      for(const marker of markers)marker.el.classList.toggle('hover-target',marker.slot&&marker.id===socket);
      const ghost=$('#drag-ghost');ghost.hidden=false;ghost.textContent=B.parts[dragId].short+(overTray?' → Bandeja':socket?' → '+B.slots[socket].name:'');ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
    }else if(ui.view==='2d'){view.pan(e.clientX-t.lastX,e.clientY-t.lastY);}
    t.lastX=e.clientX;t.lastY=e.clientY;
  }
  function up(e){
    if(e.pointerType==='touch'){touches.delete(e.pointerId);if(secondTouch){if(!touches.size)secondTouch=false;return;}}
    const t=ticket;if(!t||t.pointer!==e.pointerId)return;ticket=null;
    if(e.type==='pointercancel'){cancelDrag();return;}
    if(dragId){
      const id=dragId,overTray=inside(tray,e.clientX,e.clientY);
      const dest=inside(stage,e.clientX,e.clientY)?view.slotAt(e.clientX,e.clientY):null;
      cancelDrag();
      if(overTray)move(id,null);else if(dest)move(id,dest);
      else{render();feedback('Suelta la pieza sobre una ranura o dentro de la bandeja. Se conserva su posición.',true);}
    }else if(!t.moved&&t.id)select(t.id);
  }
  document.addEventListener('pointerdown',down,true);
  document.addEventListener('pointermove',pointerMove,{capture:true,passive:false});
  document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  window.addEventListener('blur',()=>{if(ticket||dragId)cancelDrag();});
  [el2,el3].forEach(el=>el.addEventListener('keydown',e=>{
    const k=e.key;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','c','C','Escape'].includes(k)){
      e.preventDefault();
      if(k==='Escape')cancelDrag();else if(k.toLowerCase()==='c')view.home();
      else if(k==='+'||k==='=')view.zoom(1.18);else if(k==='-')view.zoom(1/1.18);
      else view.rotate(k==='ArrowLeft'?-.18:k==='ArrowRight'?.18:0,k==='ArrowUp'?-.13:k==='ArrowDown'?.13:0);
    }
  }));
  if('ResizeObserver'in window)new ResizeObserver(()=>{view?.resize();reposition();}).observe(stage);
  else window.addEventListener('resize',()=>{view?.resize();reposition();});
  changeView(ui.view);
})();
