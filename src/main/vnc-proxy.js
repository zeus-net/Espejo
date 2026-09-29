import { WebSocketServer } from 'ws'
import net from 'net'
import { ipcMain } from 'electron'

class VncProxyManager {
  constructor() {
    /** @type {Map<string, { wss: WebSocketServer, tcpSocket: net.Socket|null, wsPort: number }>} */
    this.proxies = new Map()
  }

  /**
   * Start a WebSocket-to-TCP proxy for a VNC host.
   * The proxy bridges noVNC (WebSocket) in the renderer to the VNC server (TCP).
   * @param {string} hostId - Unique host identifier
   * @param {string} ip - VNC server IP address
   * @param {number} port - VNC server TCP port (default 5900)
   * @returns {Promise<number>} The WebSocket port that noVNC should connect to
   */
  async startProxy(hostId, ip, port) {
    // Stop existing proxy for this host if any
    this.stopProxy(hostId)

    return new Promise((resolve, reject) => {
      // Create WebSocket server on OS-assigned random port
      const wss = new WebSocketServer({ host: '127.0.0.1', port: 0 }, () => {
        const wsPort = wss.address().port
        console.log(`[VncProxy] Proxy started for "${hostId}" on ws://127.0.0.1:${wsPort} -> ${ip}:${port}`)

        this.proxies.set(hostId, { wss, wsPort, tcpSocket: null })

        // Handle incoming WebSocket connections from noVNC
        wss.on('connection', (ws) => {
          console.log(`[VncProxy] noVNC client connected for "${hostId}"`)

          // Create TCP connection to the VNC server
          const tcpSocket = net.createConnection({ host: ip, port: port })

          // Set connection timeout to 10 seconds
          tcpSocket.setTimeout(10000)

          tcpSocket.on('connect', () => {
            console.log(`[VncProxy] TCP connected to ${ip}:${port} for "${hostId}"`)
            tcpSocket.setTimeout(0) // Disable timeout once connected
          })

          tcpSocket.on('timeout', () => {
            console.error(`[VncProxy] TCP connection timeout (10s) to ${ip}:${port} for "${hostId}"`)
            tcpSocket.destroy()
          })

          // Store the TCP socket reference
          const proxy = this.proxies.get(hostId)
          if (proxy) proxy.tcpSocket = tcpSocket

          // --- Bidirectional data forwarding ---

          // TCP (VNC server) -> WebSocket (noVNC renderer)
          tcpSocket.on('data', (data) => {
            const readableData = data.slice(0, 32).toString('ascii').replace(/[\x00-\x1F\x7F-\xFF]/g, '.');
            console.log(`[VncProxy] TCP received data from VNC server for "${hostId}" (${data.length} bytes, starts with: "${readableData}")`)
            try {
              if (ws.readyState === 1) { // ws.OPEN
                ws.send(data)
              } else {
                console.warn(`[VncProxy] WebSocket not open (state: ${ws.readyState}) for "${hostId}", drop TCP data`)
              }
            } catch (e) {
              console.error(`[VncProxy] Error forwarding TCP->WS for "${hostId}":`, e.message)
            }
          })

          // WebSocket (noVNC renderer) -> TCP (VNC server)
          ws.on('message', (data) => {
            const len = data.length !== undefined ? data.length : (data.byteLength !== undefined ? data.byteLength : 0);
            console.log(`[VncProxy] WS received message from noVNC client for "${hostId}" (${len} bytes)`)
            try {
              if (!tcpSocket.destroyed) {
                const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
                tcpSocket.write(buffer)
              } else {
                console.warn(`[VncProxy] TCP socket destroyed for "${hostId}", drop WS message`)
              }
            } catch (e) {
              console.error(`[VncProxy] Error forwarding WS->TCP for "${hostId}":`, e.message)
            }
          })

          // --- Connection lifecycle ---

          tcpSocket.on('close', () => {
            console.log(`[VncProxy] TCP closed for "${hostId}"`)
            if (ws.readyState === ws.OPEN) ws.close()
          })

          tcpSocket.on('error', (err) => {
            console.error(`[VncProxy] TCP error for "${hostId}":`, err.message)
            if (ws.readyState === ws.OPEN) ws.close()
          })

          ws.on('close', () => {
            console.log(`[VncProxy] WS closed for "${hostId}"`)
            if (!tcpSocket.destroyed) tcpSocket.destroy()
          })

          ws.on('error', (err) => {
            console.error(`[VncProxy] WS error for "${hostId}":`, err.message)
            if (!tcpSocket.destroyed) tcpSocket.destroy()
          })
        })

        resolve(wsPort)
      })

      wss.on('error', (err) => {
        console.error(`[VncProxy] WS server creation error for "${hostId}":`, err.message)
        reject(err)
      })
    })
  }

  /**
   * Stop the proxy for a specific host.
   * @param {string} hostId
   */
  stopProxy(hostId) {
    const proxy = this.proxies.get(hostId)
    if (proxy) {
      console.log(`[VncProxy] Stopping proxy for "${hostId}"`)

      // Destroy TCP socket
      if (proxy.tcpSocket && !proxy.tcpSocket.destroyed) {
        proxy.tcpSocket.destroy()
      }

      // Close all connected WebSocket clients
      proxy.wss.clients.forEach((client) => {
        try { client.close() } catch (e) { /* ignore */ }
      })

      // Close the WebSocket server
      try { proxy.wss.close() } catch (e) { /* ignore */ }

      this.proxies.delete(hostId)
    }
  }

  /**
   * Stop all active proxies.
   */
  stopAll() {
    for (const hostId of this.proxies.keys()) {
      this.stopProxy(hostId)
    }
  }

  /**
   * Get the WebSocket port for a running proxy.
   * @param {string} hostId
   * @returns {number|null}
   */
  getProxyPort(hostId) {
    const proxy = this.proxies.get(hostId)
    return proxy ? proxy.wsPort : null
  }
}

const proxyManager = new VncProxyManager()

export function registerProxyHandlers() {
  ipcMain.handle('vnc:start-proxy', async (_, hostId, ip, port) => {
    try {
      const wsPort = await proxyManager.startProxy(hostId, ip, port || 5900)
      return { success: true, wsPort }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('vnc:stop-proxy', (_, hostId) => {
    proxyManager.stopProxy(hostId)
    return { success: true }
  })

  ipcMain.handle('vnc:stop-all', () => {
    proxyManager.stopAll()
    return { success: true }
  })
}

export { proxyManager }
