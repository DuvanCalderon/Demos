# WSL Lab — Windows, Ubuntu y Bash (recreación educativa) 🐧

Simulador de terminal para practicar cómo utilizar **Windows Subsystem for Linux (WSL)** desde PowerShell, desplazarte entre Ubuntu y Windows y trabajar con un sistema de archivos virtual.

**[▶ Abrir WSL Lab en GitHub Pages](https://duvancalderon.github.io/Demos/Terminal-y-Linea-de-Comandos/06-WSL-Lab/)** · [← Índice de Terminal](../) · [← Catálogo general](../../)

## Funciones

- Terminal simulada de **PowerShell y Ubuntu Bash**, con transiciones mediante `wsl` y `exit`.
- **12 misiones progresivas** que se validan al ejecutar las acciones dentro del simulador.
- Comandos WSL: `wsl --status`, `wsl -l -v`, `wsl`, `wsl --version`, `wsl --shutdown`.
- Comandos de Ubuntu: `pwd`, `ls -la`, `cd`, `mkdir`, `touch`, `cat`, `whoami`, `uname`, `exit`.
- Navegación entre `/home/student` y `/mnt/c/Users/Student/Documents`, con archivos y directorios **totalmente virtuales**.
- Pistas, soluciones orientativas, progreso, XP, historial con ↑/↓, reinicio parcial y restauración del laboratorio.
- Guarda el estado mediante `localStorage` cuando el navegador lo permite. Sin dependencias externas.

## Cómo utilizarlo

Abre el `index.html` o el enlace de GitHub Pages. Comienza por `wsl --status` desde PowerShell. Usa la terminal para completar cada misión y pulsa **Comprobar misión**. El menú lateral permite regresar a los retos anteriores; el progreso se conserva automáticamente si el navegador permite almacenamiento.

**Seguridad:** los comandos se interpretan en JavaScript como una simulación didáctica. No se ejecutan PowerShell, Bash o Linux reales, ni se modifica ningún archivo del computador.

## Transparencia sobre el origen

La página de Notion contiene el archivo `laboratorio_wsl_bash_notion_v3.html`, pero el conector no entregó su contenido HTML descargable. **Esta implementación es una recreación independiente, no una copia exacta del original.** Se conserva el adjunto original en Notion sin editarlo. Si más adelante se proporciona su HTML, puede sustituirse esta recreación sin cambiar la URL.

[Notion — WSL Lab original](https://app.notion.com/p/41960fb53673804f93bae6a2d656cb09) · [GitHub — Código](https://github.com/DuvanCalderon/Demos/tree/main/Terminal-y-Linea-de-Comandos/06-WSL-Lab)
