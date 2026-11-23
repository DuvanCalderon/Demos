// Un único estado de montaje alimenta la vista 3D, el plano y el banco de pruebas.
window.LegionBench = (() => {
  const slots = {
    dimm1: { name: 'SO-DIMM 1', type: 'ram', x: -0.15, z: -0.29, w: 2.7, d: 0.75 },
    dimm2: { name: 'SO-DIMM 2', type: 'ram', x: -0.15, z: 0.65, w: 2.7, d: 0.75 },
    m2: { name: 'M.2 NVMe', type: 'ssd', x: -4.63, z: 0.57, w: 0.86, d: 2.48 },
    sata: { name: 'Bahía SATA', type: 'hdd', x: 4.18, z: 1.75, w: 2.55, d: 3.5 },
    wlan: { name: 'M.2 WLAN', type: 'wifi', x: -2.78, z: 0.53, w: 1.02, d: 0.97 }
  };
  const parts = {
    ramA: { name: 'Memoria RAM A', short: 'RAM A', icon: 'ram', type: 'ram', family: 'Memoria', spec: '8 GB · DDR4-3200', function: 'Guarda los datos que el procesador está usando ahora. Al apagar el portátil, esa información se pierde.', experiment: 'Quita los dos módulos e intenta arrancar. Vuelve a instalar uno y compara el resultado.', home: 'dimm1' },
    ramB: { name: 'Memoria RAM B', short: 'RAM B', icon: 'ram', type: 'ram', family: 'Memoria', spec: '8 GB · DDR4-3200', function: 'Este segundo módulo amplía la memoria disponible. Con los dos módulos iguales, el controlador puede usar dos canales.', experiment: 'Instala este módulo junto al otro y observa cómo cambian la capacidad y los canales.', home: 'dimm2' },
    ssd: { name: 'SSD de sistema', short: 'SSD M.2', icon: 'ssd', type: 'ssd', family: 'Almacenamiento', spec: 'M.2 2280 · PCIe NVMe', function: 'Contiene el sistema operativo del laboratorio. Conserva archivos al apagar el equipo y se comunica por PCIe.', experiment: 'Retíralo dejando el HDD instalado. La memoria puede superar el POST aunque el sistema no cargue.', home: 'm2' },
    hdd: { name: 'Disco de datos', short: 'HDD SATA', icon: 'disk', type: 'hdd', family: 'Almacenamiento', spec: '2,5 pulgadas · SATA', function: 'Guarda los archivos de datos en platos magnéticos. En este escenario el sistema operativo vive en el SSD.', experiment: 'Arranca con solo el SSD. El sistema puede cargar aunque los archivos del HDD estén fuera de alcance.', home: 'sata' },
    wifi: { name: 'Tarjeta inalámbrica', short: 'Wi-Fi', icon: 'wifi', type: 'wifi', family: 'Conectividad', spec: 'WLAN · Dos antenas', function: 'Une el portátil a una red inalámbrica. Sus dos cables finos llevan la señal entre la tarjeta y las antenas.', experiment: 'Arranca con la tarjeta en la bandeja. Comprueba qué función pierdes y cuáles siguen disponibles.', home: 'wlan' },
    battery: { name: 'Batería interna', short: 'Batería', icon: 'battery', family: 'Alimentación', spec: 'Variante ilustrada · 60 Wh', function: 'Suministra energía cuando el cargador está fuera. Su conector puede alimentar la placa aunque el equipo esté apagado.', experiment: 'Con el portátil apagado y sin cargador, cambia el conector. Prueba qué ocurre al arrancar sin ninguna fuente.', x: -1.14, z: 2.46, w: 6.23, d: 1.98 },
    thermal: { name: 'Módulo térmico', short: 'Refrigeración', icon: 'fan', family: 'Refrigeración', spec: 'Dos ventiladores · Tubos de calor', function: 'Los tubos llevan calor desde los chips hasta las aletas de los extremos. Los ventiladores empujan aire a través de ellas.', experiment: 'Separa las capas para localizar los chips que comparten este conjunto. El banco muestra el giro al arrancar.', x: -4.38, z: -2.37, w: 2.4, d: 2.47 },
    cpu: { name: 'Procesador Ryzen 7', short: 'CPU', icon: 'chip', family: 'Procesamiento', spec: 'AMD Ryzen 7 4800H · 8 núcleos', function: 'Ejecuta las instrucciones y usa la RAM como espacio de trabajo. Este procesador tiene 16 hilos y va soldado a la placa.', experiment: 'Activa el despiece para verlo debajo del conjunto térmico. Observa qué ocurre si le quitas toda la RAM.', x: 1.40, z: -2.15, w: 1.50, d: 1.25 },
    gpu: { name: 'Gráfica dedicada', short: 'GPU', icon: 'chip', family: 'Gráficos', spec: 'Chip soldado · Modelo variable', function: 'Procesa imágenes en paralelo y usa memoria de vídeo cercana. Comparte refrigeración con el procesador.', experiment: 'En la vista de despiece, sigue las rutas térmicas que unen los chips con ambos extremos.', x: -1.63, z: -2.03, w: 1.52, d: 1.34 },
    board: { name: 'Placa del sistema', short: 'Placa base', icon: 'board', family: 'Interconexión', spec: 'Plataforma AMD · Tipo 82B1', function: 'Sus pistas llevan datos y energía entre chips, ranuras y puertos. El conector y el protocolo de cada ranura determinan qué piezas admite.', experiment: 'Intenta colocar el SSD en la ranura WLAN. Aunque los dos se llaman M.2, su formato y uso son distintos.', x: 2.15, z: 0.35, w: 0.9, d: 1.28 }
  };
  Object.values(parts).forEach((p,i) => { p.number = String(i + 1).padStart(2,'0'); });
  const removable = Object.keys(parts).filter(id => parts[id].home);
  const missions = {
    post: { name:'Pantalla en negro', level:'Inicial', goal:'Reproduce el fallo del POST, instala al menos un módulo de RAM y arranca el sistema.', symptom:'no-ram', hints:['Antes de abrir el equipo, pulsa Encender y comprobar.','El POST necesita memoria. Una sola tarjeta DDR4 sirve en cualquiera de las dos ranuras.'], solution:'Comprueba el fallo inicial. Abre la cubierta, desconecta la batería e instala un módulo en una SO-DIMM libre. Conecta la batería, cierra y enciende.' },
    boot: { name:'El sistema no aparece', level:'Intermedio', goal:'Reproduce el arranque sin sistema y recupera el acceso al SSD y al disco de datos.', symptom:'no-os', hints:['¿Puede pasar el POST con un disco de datos y sin sistema? Haz la prueba inicial.','M.2 NVMe contiene el sistema de este banco. SATA contiene los datos.'], solution:'Enciende con la configuración inicial. Abre y aísla el equipo, instala el SSD en M.2 NVMe y conserva el HDD en SATA. Restablece la alimentación, cierra y enciende.' },
    dual: { name:'El segundo canal', level:'Intermedio', goal:'Mide el arranque con 8 GB y consigue uno con 16 GB en doble canal.', symptom:'single', hints:['Enciende primero con un único módulo para registrar la referencia.','Apaga y añade el segundo módulo de 8 GB a la SO-DIMM libre.'], solution:'Arranca con un módulo. Apaga, abre, aísla la batería e instala el otro módulo. Reconecta, cierra y comprueba los dos canales.' },
    build: { name:'Reconstrucción completa', level:'Avanzado', goal:'Desde la bandeja, monta los cinco módulos y arranca con batería, doble canal, datos y Wi-Fi.', hints:['La placa admite dos módulos de memoria, un SSD de sistema, un HDD y una tarjeta WLAN.','Distribuye la RAM libremente. Instala cada unidad en su interfaz y termina con alimentación por batería.'], solution:'Instala las dos memorias en sendas SO-DIMM, el SSD en M.2 NVMe, el HDD en SATA y Wi-Fi en WLAN. Conecta la batería, deja el cargador fuera, cierra y arranca.' }
  };
  const guided = [
    ['Abre la cubierta inferior','El equipo empieza apagado y sin cargador. Usa Cubierta para acceder al interior.'],
    ['Aísla la alimentación','Usa Batería para desconectar su conector interno.'],
    ['Retira solo el disco de datos','Arrastra el HDD a la bandeja. También puedes seleccionarlo y pulsar Extraer pieza.'],
    ['Arranca sin el HDD','Conecta la batería, cierra la cubierta y pulsa Encender y comprobar. Conserva el SSD instalado.'],
    ['Restituye los datos','Apaga, abre y aísla. Monta el HDD en SATA, reconecta la batería, cierra y vuelve a arrancar.']
  ];
  function fresh(mode='free') {
    const location = Object.fromEntries(removable.map(id => [id,parts[id].home]));
    if (mode==='post') location.ramA=location.ramB=null;
    if (mode==='dual') location.ramB=null;
    if (mode==='boot') location.ssd=null;
    if (mode==='build') removable.forEach(id=>{location[id]=null;});
    const opened = mode==='free'||mode==='build';
    return {location,open:opened,battery:!opened,ac:false,on:false,load:12,last:null,witness:false,step:0,won:false};
  }
  function stats(s) {
    const count = Number(Boolean(s.location.ramA)) + Number(Boolean(s.location.ramB));
    return { ram:count*8, channels:count, disks:Number(!!s.location.ssd)+Number(!!s.location.hdd), wifi:!!s.location.wifi, data:!!s.location.hdd };
  }
  function whyLocked(s) {
    if(s.on) return 'Apaga el equipo antes de manipular componentes.';
    if(s.ac) return 'Desenchufa el cargador antes de trabajar en el interior.';
    if(!s.open) return 'Abre la cubierta para acceder a las piezas.';
    if(s.battery) return 'Desconecta la batería interna antes de mover una pieza.';
    return '';
  }
  const fail = msg => ({ok:false,msg});
  const success = msg => ({ok:true,msg});
  function move(s,id,dest) {
    const p=parts[id];
    if(!p?.home) return fail('Esta pieza se inspecciona en su posición.');
    const lock=whyLocked(s);
    if(lock) return fail(lock);
    if(dest===s.location[id]) return fail(dest?'La pieza ya está en esa ranura.':'La pieza ya está en la bandeja.');
    if(dest!==null) {
      if(!slots[dest] || slots[dest].type!==p.type) return fail(p.short+' no encaja aquí. Usa '+Object.values(slots).filter(a=>a.type===p.type).map(a=>a.name).join(' o ')+'.');
      if(Object.values(s.location).includes(dest)) return fail(slots[dest].name+' está ocupada. Retira primero su módulo.');
    }
    s.location[id]=dest; s.last=null;
    return success(dest?p.short+' instalada en '+slots[dest].name+'.':p.short+' en la bandeja.');
  }
  function service(s,action) {
    if(action==='cover'){
      if(s.on||s.ac) return fail('Para abrir o cerrar, apaga el equipo y retira el cargador.');
      s.open=!s.open; s.last=null;
      return success(s.open?'Cubierta abierta. Ya puedes acceder al conector de batería.':'Cubierta cerrada. Puedes probar el arranque.');
    }
    if(action==='battery'){
      if(s.on||!s.open||s.ac) return fail('Apaga, retira el cargador y abre la cubierta para acceder al conector.');
      s.battery=!s.battery; s.last=null;
      return success(s.battery?'Batería conectada. El interior vuelve a tener alimentación.':'Batería aislada. Ya puedes mover módulos.');
    }
    if(action==='ac'){
      if(s.on||s.open) return fail('Para cambiar el cargador en este banco, apaga el equipo y cierra la cubierta.');
      s.ac=!s.ac; s.last=null;
      return success(s.ac?'Cargador conectado. La placa dispone de energía externa.':'Cargador desconectado.');
    }
    return fail('Acción desconocida.');
  }
  function boot(s) {
    if(s.on){s.on=false; s.last=null;return success('Equipo apagado. Ya puedes preparar otra prueba.');}
    if(s.open) return fail('Cierra la cubierta antes de hacer una prueba de arranque.');
    const v=stats(s);
    let code='ok', msg='Sistema iniciado desde el SSD. '+(v.data?'HDD de datos disponible.':'HDD de datos ausente.')+' '+(v.wifi?'Wi-Fi disponible.':'Wi-Fi ausente.');
    if(!s.battery&&!s.ac){code='no-power';msg='Sin alimentación. La placa no inicia el POST.';}
    else if(!v.ram){code='no-ram';msg='POST detenido. Falta memoria para inicializar el equipo.';}
    else if(!s.location.ssd){code='no-os';msg='POST superado. El firmware no encuentra un sistema en las unidades instaladas.';}
    s.on=code==='ok';
    s.last={code,ram:v.ram,disks:v.disks,msg};
    return success(msg);
  }
  function record(s,mode,action) {
    const v=stats(s), code=s.last?.code;
    if(mode==='guide'){
      const checks=[s.open,s.open&&!s.battery&&!s.ac,!s.location.hdd&&s.open,action==='boot'&&code==='ok'&&!v.data,action==='boot'&&code==='ok'&&v.data];
      if(checks[s.step]) s.step++;
      if(s.step===guided.length) s.won=true;
    }
    const m=missions[mode];
    if(!m||action!=='boot'||!code) return;
    if((m.symptom&&code===m.symptom)||(m.symptom==='single'&&code==='ok'&&v.ram===8)) s.witness=true;
    if(code!=='ok') return;
    const achieved={post:s.witness&&v.ram>0,boot:s.witness&&v.data,dual:s.witness&&v.channels===2,build:v.channels===2&&v.data&&v.wifi&&s.battery&&!s.ac};
    if(achieved[mode]) s.won=true;
  }
  function valid(s) {
    if(!s||!s.location||!['open','battery','ac','on','witness','won'].every(k=>typeof s[k]==='boolean')) return false;
    if(!Number.isInteger(s.step)||s.step<0||s.step>guided.length||!Number.isInteger(s.load)||s.load<2||s.load>24) return false;
    const seen=new Set();
    for(const id of removable){const d=s.location[id];if(d===null)continue;if(!slots[d]||slots[d].type!==parts[id].type||seen.has(d))return false;seen.add(d);}
    if(s.open&&(s.on||s.ac))return false;
    if(s.last!==null&&(!s.last||!['ok','no-ram','no-os','no-power'].includes(s.last.code)||typeof s.last.msg!=='string'))return false;
    return !s.on||(!s.open&&(s.ac||s.battery)&&stats(s).ram>0&&!!s.location.ssd&&s.last?.code==='ok');
  }
  function spot(s,id){const p=parts[id];return p?.home?slots[s.location[id]]:p;}
  return {parts,slots,removable,missions,guided,fresh,stats,whyLocked,move,service,boot,record,valid,spot};
})();
