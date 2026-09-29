# Sistema Espejo (VNC Viewer)

Un visor VNC moderno, múltiple y basado en cuadrículas construido con Electron, React y noVNC. Diseñado para monitorear múltiples computadoras de forma simultánea, permitiendo a los administradores observar las pantallas en tiempo real y tomar el control cuando sea necesario.

##  Características Principales

- **Monitoreo Simultáneo (Grid View):** Observa múltiples pantallas al mismo tiempo en una cuadrícula auto-ajustable.
- **Vista de Foco (Focus View):** Amplía una pantalla en específico para verla en gran tamaño y con mayor detalle.
- **Modo "Solo Lectura" por Defecto:** Al conectarse, el visor no interfiere con el usuario remoto (no envía clics ni teclado).
- **Toma de Control Bajo Demanda:** Un interruptor en cada pantalla permite tomar el control (enviar clics y tecleos) de forma consciente.
- **Gestión Avanzada de Conexión:** 
  - Proxy local interno que traduce de WebSocket a TCP.
  - Prevención de bloqueos con *Timeouts* de conexión (10 segundos).
  - Reconexión automática con backoff exponencial.
  - Interfaz amigable con *Overlays* de estado ("Conectando...", "Contraseña Incorrecta", "Desconectado").
- **Diseño Moderno:** Interfaz pulida y fluida utilizando Tailwind CSS.

##  Stack Tecnológico

- **Framework de Escritorio:** [Electron](https://www.electronjs.org/) (empaquetado con [electron-vite](https://electron-vite.org/)).
- **Frontend (Renderer):** [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/).
- **Motor VNC:** [noVNC](https://novnc.com/) (Cliente VNC implementado en JavaScript usando HTML5 Canvas).
- **Manejo del Estado:** [Zustand](https://github.com/pmndrs/zustand).

##  Arquitectura del Sistema

El protocolo VNC nativo (RFB) funciona sobre **TCP**, pero los navegadores (y por ende, la capa visual de Electron) solo soportan conexiones por **WebSocket**. Para solucionar esto, el proyecto utiliza una arquitectura de dos partes:

1. **Proceso Principal (Main Process - Node.js):**
   - Ejecuta un servidor local (`vnc-proxy.js`) que actúa como puente.
   - Recibe la conexión WebSocket desde el Frontend.
   - Crea un Socket TCP hacia la máquina destino (ej. `100.75.72.27:5900`).
   - Traduce y reenvía los datos bidireccionalmente entre el WebSocket y el TCP.
   
2. **Proceso de Renderizado (Frontend - React):**
   - El servicio `vncManager.js` pide al Proceso Principal que abra un Proxy para una IP y Puerto específicos.
   - Una vez abierto, inicializa `noVNC` apuntando al WebSocket local (`ws://127.0.0.1:<puerto>`).
   - `noVNC` se encarga de dibujar los píxeles en un `<canvas>` de HTML5 y capturar los eventos del ratón/teclado.

##  Requisitos Previos

- **Node.js** (v18 o superior).
- **pnpm** (Gestor de paquetes).
- **Máquinas Destino:** Deben tener instalado y ejecutándose un **Servidor VNC** (como TightVNC, UltraVNC, etc.) configurado en el puerto estándar (5900).
- **Conectividad:** La PC donde se ejecuta "Sistema Espejo" debe poder alcanzar por red a las máquinas destino (ej. estar en la misma red local o conectadas mediante una VPN como **Tailscale**).

### Configuración recomendada en el Servidor VNC destino
Para que el usuario remoto (el dueño físico de la computadora) siempre tenga la prioridad sobre el control del ratón, se recomienda activar en el Servidor VNC (ej. TightVNC) la opción: **"Block remote input on local activity"** o **"Local input priority"**.

##  Instalación y Ejecución

1. Clona o descarga este repositorio.
2. Abre una terminal en la carpeta raíz del proyecto (`vnc-viewer`).
3. Instala las dependencias:
   ```bash
   pnpm install
   ```
4. Inicia la aplicación en modo desarrollo:
   ```bash
   pnpm run dev
   ```
5. Para construir/compilar la aplicación para producción (generar un `.exe`):
   ```bash
   pnpm run build
   ```

##  Estructura del Código

- `/src/main/`: Código del backend de Electron.
  - `index.js`: Archivo principal que arranca Electron.
  - `vnc-proxy.js`: **El corazón de la conexión.** Levanta servidores WebSocket efímeros que se conectan por TCP al destino.
- `/src/renderer/src/`: Código del Frontend en React.
  - `/components/`: Componentes visuales.
    - `VncCell.jsx`: El contenedor principal de cada pantalla VNC. Coordina los Overlays, el Toolbar y el Canvas.
    - `/VncCell/`: Subcomponentes de VncCell (Overlays, FocusToolbar, StatusBadge).
    - `FocusView.jsx`: La vista ampliada cuando se da doble clic o se expande una pantalla.
  - `/services/vncManager.js`: Orquestador. Habla con el Main Process para levantar proxies y maneja el ciclo de vida (reconectar, desconectar) de la librería `noVNC`.
  - `/store/useAppStore.js`: Almacén global de estado (hosts, configuración, cuadrícula) usando Zustand.

---
*Desarrollado para facilitar el soporte y la supervisión de equipos de forma centralizada y no intrusiva.*
