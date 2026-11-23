# Anatomía del Legion 5

Banco de diagnóstico interactivo para el Lenovo Legion 5 15ARH05H, tipo 82B1, con Ryzen 7 4800H. Se abre en [GitHub Pages](https://duvancalderon.github.io/Demos/Hardware/Legion5-Componentes-3D/). Para usarlo sin conexión, descarga [el laboratorio completo](./legion5-lab.zip), extrae la carpeta y abre `index.html`. No requiere instalación ni CDN.

## Primer experimento

1. En Explorar, el equipo comienza apagado, abierto y con la batería aislada. Arrastra el HDD a la bandeja.
2. Abre **Alimentación**, conecta la batería, cierra la cubierta y pulsa **Encender y comprobar**. El SSD permite iniciar el sistema y el diagnóstico indica que el HDD está ausente.
3. Apaga el equipo, abre la cubierta y desconecta la batería. Arrastra el HDD de la bandeja a SATA. Puedes hacer la misma maniobra con **Destino** e **Instalar en el destino**.
4. Compara con la retirada del SSD o de ambos módulos de RAM. Examina la placa y las capas térmicas usando **Despiece**.

El fondo gira con un dedo o con el botón izquierdo. Rueda y pellizco controlan el zoom, y el botón derecho o dos dedos desplazan la cámara. Con foco en la escena, usa flechas, +, − y C. Cuando WebGL no está disponible, un rasterizador Canvas dibuja las mismas mallas y usa la misma cámara en 3D ligero. El plano 2D, el inventario y los botones permiten practicar las mismas reglas sin WebGL.

Cada modo guarda su montaje en el navegador. Práctica guiada compara dos arranques con el HDD fuera y dentro. Las cuatro misiones piden obtener resultados observables. Las pistas y las soluciones explicadas no otorgan crédito. Repetir un caso conserva las misiones acreditadas. Reiniciar laboratorio borra los datos de esta aplicación tras confirmación.

## Modelo y alcance

- El escenario selecciona un SSD NVMe de sistema, un HDD de 2,5″ de datos, una batería de 60 Wh y dos SO-DIMM de 8 GB. Lenovo documenta variantes de almacenamiento y de batería. La referencia suministrada identifica la familia y la CPU. Las capacidades de RAM y batería del escenario y la GPU concreta no se deducen de esa captura.
- Dos módulos iguales en ranuras distintas habilitan doble canal en este modelo. El deslizador compara la demanda propuesta con la RAM instalada. Los resultados son teóricos y omiten la reserva del sistema y la paginación.
- Las reglas distinguen energía, inicialización de memoria, sistema arrancable y disponibilidad de datos y Wi-Fi. Tras un fallo, el banco finaliza la prueba. Tornillos, blindajes y conexiones auxiliares se agrupan en las maniobras. La sección de referencias del simulador explica las precauciones de servicio.
- Las piezas se construyen con geometría y texturas originales. Las posiciones y dimensiones son aproximadas. El despiece y el giro de ventiladores son ilustrativos. La simulación usa encajes geométricos y reglas discretas, sin motor térmico, eléctrico ni de colisiones de cuerpos rígidos.

## Archivos y dependencias

| Archivo | Función |
| --- | --- |
| `index.html`, `styles.css` | Interfaz y diseño adaptativo |
| `engine.js` | Estado, ranuras, reglas de servicio, arranque y objetivos |
| `model.js` | Escena Three.js, piezas, raycasting y cámara |
| `canvas-renderer.js` | Renderizador 3D ligero para navegadores sin WebGL |
| `graphics.js` | Plano SVG manipulable, iconografía y fichas técnicas |
| `app.js` | Controles de puntero y teclado, progreso, vistas y accesibilidad |
| `vendor/` | Three.js r160 y OrbitControls incluidos, con licencia MIT |

[Three.js r160](https://github.com/mrdoob/three.js/tree/r160) se distribuye con su [licencia MIT](./vendor/LICENSE-three.txt). OrbitControls conserva su implementación con una envoltura de script local para poder abrir el laboratorio directamente desde el ZIP.

## Referencias

- [Lenovo PSREF del 15ARH05H, memoria, bahías y baterías](https://psref.lenovo.com/syspool/Sys/PDF/Legion/Lenovo_Legion_5_15ARH05H/Lenovo_Legion_5_15ARH05H_Spec.pdf)
- [Lenovo, manual de mantenimiento para el tipo 82B1](https://pcsupport.lenovo.com/us/en/products/laptops-and-netbooks/legion-series/legion-5-15arh05h/82b1/document-userguide/doc_userguide)
- [Lenovo, vídeos de servicio de la familia](https://support.lenovo.com/us/en/solutions/ht510415)
- [AMD, Ryzen 7 4800H](https://www.amd.com/es/support/downloads/drivers.html/processors/ryzen/ryzen-4000-series/amd-ryzen-7-4800h.html)
- [LaptopMedia, disposición interior de la familia Legion 5 de 15″](https://laptopmedia.com/highlights/inside-lenovo-legion-5-15-disassembly-and-upgrade-options/)
