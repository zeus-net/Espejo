import { systemService } from './systemService'

class VncConnection {
  constructor(host, onStatusChange) {
    this.host = host
    this.onStatusChange = onStatusChange
    
    this.rfb = null
    this.status = 'disconnected'
    this.attempt = 0
    this.timer = null
    this.intentional = false
    this.domContainer = null
    this.connectSeq = 0
    this.isControlling = false
    
    // Reconnection Configuration
    this.INITIAL_DELAY = 3000
    this.MAX_DELAY = 30000
    this.FACTOR = 1.5
  }

  updateStatus(newStatus) {
    this.status = newStatus
    if (this.onStatusChange) {
      this.onStatusChange(this.host.id, newStatus, this.attempt)
    }
  }

  setContainer(domContainer) {
    this.domContainer = domContainer
  }

  async connect() {
    this.cleanup()
    this.intentional = false
    this.updateStatus('connecting')

    const seq = ++this.connectSeq

    try {
      console.log(`[vncManager] Iniciando proceso de conexión hacia ${this.host.ip}:${this.host.port || 5900}...`)
      // 1. Start the proxy in the main process
      console.log(`[vncManager] Solicitando proxy al proceso principal...`)
      const result = await systemService.startProxy(this.host.id, this.host.ip, this.host.port || 5900)
      console.log(`[vncManager] Respuesta del proxy recibida:`, result)
      if (seq !== this.connectSeq || this.intentional) return

      if (!result.success) {
        throw new Error(result.error || 'Failed to start VNC proxy.')
      }

      // 2. Give the proxy WS server a brief moment to spin up
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (seq !== this.connectSeq || this.intentional) return

      // If we don't have a container yet, wait up to 5 seconds for a container to mount and register
      if (!this.domContainer) {
        console.log(`[vncManager] No DOM container for "${this.host.name}" yet. Waiting for registration...`)
        let waitTime = 0
        while (!this.domContainer && waitTime < 5000) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          waitTime += 100
          if (seq !== this.connectSeq || this.intentional) return
        }
        
        if (!this.domContainer) {
          throw new Error('Timeout waiting for canvas container mount.')
        }
        console.log(`[vncManager] Canvas container mounted and registered for "${this.host.name}".`)
      }

      if (seq !== this.connectSeq || this.intentional || !this.domContainer) return

      // 3. Clear container of old elements
      while (this.domContainer.firstChild) {
        this.domContainer.removeChild(this.domContainer.firstChild)
      }

      // 4. Dynamically import noVNC (it is an ESM package)
      const { default: RFB } = await import('@novnc/novnc')

      if (seq !== this.connectSeq || this.intentional || !this.domContainer) return

      // 5. Instantiate RFB
      console.log(`[vncManager] Creando cliente noVNC hacia ws://127.0.0.1:${result.wsPort}. ¿Tiene contraseña guardada?: ${this.host.password ? 'SÍ' : 'NO'}`)
      const rfb = new RFB(this.domContainer, `ws://127.0.0.1:${result.wsPort}`, {
        credentials: { password: this.host.password || '' }
      })

      // Standard optimization settings
      rfb.viewOnly = !this.isControlling
      rfb.scaleViewport = true
      rfb.resizeSession = false
      rfb.showDotCursor = false
      rfb.clipViewport = false
      rfb.qualityLevel = 9
      rfb.compressionLevel = 1

      // 6. Connect Event listeners
      rfb.addEventListener('connect', () => {
        if (seq !== this.connectSeq || this.intentional) return
        console.log(`[vncManager] Connected to "${this.host.name}"`)
        this.attempt = 0
        this.updateStatus('connected')
      })

      rfb.addEventListener('disconnect', (e) => {
        if (seq !== this.connectSeq || this.intentional) return
        console.log(`[vncManager] Disconnected from "${this.host.name}"`, e.detail)
        this.rfb = null
        
        this.updateStatus('disconnected')
        if (!e.detail?.clean) {
          this.scheduleReconnect()
        }
      })

      rfb.addEventListener('securityfailure', (e) => {
        if (seq !== this.connectSeq || this.intentional) return
        console.error(`[vncManager] ⛔ FALLO DE AUTENTICACIÓN para "${this.host.name}" (Contraseña incorrecta o requerida):`, e.detail)
        this.updateStatus('auth_error')
        // Do not auto-reconnect on bad credentials
      })

      this.rfb = rfb
    } catch (error) {
      if (seq !== this.connectSeq || this.intentional) return
      console.error(`[vncManager] Connection error for "${this.host.name}":`, error)
      this.updateStatus('error')
      this.scheduleReconnect()
    }
  }

  setControlMode(isControlling) {
    this.isControlling = isControlling
    if (this.rfb) {
      this.rfb.viewOnly = !isControlling
    }
  }

  scheduleReconnect() {
    if (this.intentional) return
    
    this.attempt++
    const delay = Math.min(this.INITIAL_DELAY * Math.pow(this.FACTOR, this.attempt - 1), this.MAX_DELAY)
    console.log(`[vncManager] Reconnecting "${this.host.name}" in ${Math.round(delay / 1000)}s (attempt ${this.attempt})`)
    
    this.updateStatus('reconnecting')
    
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (!this.intentional) {
        this.connect()
      }
    }, delay)
  }

  async disconnect() {
    this.intentional = true
    this.cleanup()
    this.attempt = 0
    this.updateStatus('disconnected')

    try {
      await systemService.stopProxy(this.host.id)
    } catch (e) {
      /* ignore */
    }
  }

  cleanup() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.rfb) {
      try {
        this.rfb.disconnect()
      } catch (e) {
        /* ignore */
      }
      this.rfb = null
    }
  }

  destroy() {
    this.intentional = true
    this.cleanup()
  }
}

class VncConnectionManager {
  constructor() {
    /** @type {Map<string, VncConnection>} */
    this.connections = new Map()
    /** @type {Map<string, HTMLDivElement>} */
    this.canvasContainers = new Map()
    this.onStoreStatusChange = null
  }

  /**
   * Registers a store listener callback to sync connection statuses
   * @param {Function} callback - function(hostId, status, attempt)
   */
  registerStoreCallback(callback) {
    this.onStoreStatusChange = callback
  }

  /**
   * Establishes VNC connection
   * @param {Object} host - The VNC host configuration
   * @param {HTMLDivElement} domContainer - Container element for canvas rendering
   */
  connect(host, domContainer) {
    let conn = this.connections.get(host.id)
    if (!conn) {
      conn = new VncConnection(host, (hostId, status, attempt) => {
        if (this.onStoreStatusChange) {
          this.onStoreStatusChange(hostId, status, attempt)
        }
      })
      this.connections.set(host.id, conn)
    }
    
    // Update host configuration parameters (e.g. if password edited)
    conn.host = host
    
    const container = domContainer || this.canvasContainers.get(host.id)
    if (container) {
      conn.setContainer(container)
    }

    // Connect asynchronously
    conn.connect()
  }

  /**
   * Attaches or updates the rendering DOM canvas container
   * @param {string} hostId 
   * @param {HTMLDivElement} domContainer 
   */
  registerCanvas(hostId, domContainer) {
    if (domContainer) {
      this.canvasContainers.set(hostId, domContainer)
    } else {
      this.canvasContainers.delete(hostId)
    }

    const conn = this.connections.get(hostId)
    if (conn) {
      conn.setContainer(domContainer)
      
      // If we are connecting but exited early or got a canvas late, trigger connect
      if (domContainer && conn.status === 'connecting' && !conn.rfb) {
        console.log(`[vncManager] Canvas registered for connecting host "${conn.host.name}". Resuming connection.`)
        conn.connect()
      }
    }
  }

  /**
   * Disconnects a specific VNC session
   * @param {string} hostId 
   */
  disconnect(hostId) {
    const conn = this.connections.get(hostId)
    if (conn) {
      conn.disconnect()
    }
  }

  /**
   * Toggles the control mode of an active or future session
   * @param {string} hostId 
   * @param {boolean} isControlling 
   */
  setControlMode(hostId, isControlling) {
    const conn = this.connections.get(hostId)
    if (conn) {
      conn.setControlMode(isControlling)
    }
  }

  /**
   * Clean up and destroy a VNC session (e.g., if a host is deleted)
   * @param {string} hostId 
   */
  removeConnection(hostId) {
    const conn = this.connections.get(hostId)
    if (conn) {
      conn.destroy()
      this.connections.delete(hostId)
    }
    this.canvasContainers.delete(hostId)
  }

  /**
   * Disconnects all active VNC sessions
   */
  disconnectAll() {
    for (const conn of this.connections.values()) {
      conn.disconnect()
    }
  }

  /**
   * Destroy and clean up all connections (on app shutdown)
   */
  destroyAll() {
    for (const conn of this.connections.values()) {
      conn.destroy()
    }
    this.connections.clear()
    this.canvasContainers.clear()
    systemService.stopAllProxies().catch(() => {})
  }
}

export const vncManager = new VncConnectionManager()
