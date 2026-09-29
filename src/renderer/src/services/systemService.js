/**
 * SystemService
 * Decouples the renderer from window.electronAPI by acting as an interface/adapter.
 * Fallbacks are provided so the app won't crash if loaded in a web browser without Electron.
 */

const getApi = () => window.electronAPI || {}

export const systemService = {
  // --- Host Management ---
  getHosts: async () => {
    const api = getApi()
    if (api.getHosts) return await api.getHosts()
    
    // Web fallback using localStorage
    const saved = localStorage.getItem('espejo_hosts')
    return saved ? JSON.parse(saved) : []
  },

  saveHosts: async (hosts) => {
    const api = getApi()
    if (api.saveHosts) return await api.saveHosts(hosts)
    
    // Web fallback using localStorage
    localStorage.setItem('espejo_hosts', JSON.stringify(hosts))
    return { success: true }
  },

  // --- VNC Proxy Control ---
  startProxy: async (hostId, ip, port) => {
    const api = getApi()
    if (api.startProxy) return await api.startProxy(hostId, ip, port)
    
    // Web fallback (cannot start VNC TCP proxies in browser directly)
    console.warn('[SystemService] Web environment: startProxy is mocked.')
    return { success: false, error: 'VNC proxy not supported in standard web browser.' }
  },

  stopProxy: async (hostId) => {
    const api = getApi()
    if (api.stopProxy) return await api.stopProxy(hostId)
    return { success: true }
  },

  stopAllProxies: async () => {
    const api = getApi()
    if (api.stopAllProxies) return await api.stopAllProxies()
    return { success: true }
  },

  // --- Window Controls ---
  minimizeWindow: () => {
    const api = getApi()
    if (api.minimizeWindow) api.minimizeWindow()
  },

  maximizeWindow: () => {
    const api = getApi()
    if (api.maximizeWindow) api.maximizeWindow()
  },

  closeWindow: () => {
    const api = getApi()
    if (api.closeWindow) api.closeWindow()
  },

  isMaximized: async () => {
    const api = getApi()
    if (api.isMaximized) return await api.isMaximized()
    return false
  },

  onMaximizedChange: (callback) => {
    const api = getApi()
    if (api.onMaximizedChange) return api.onMaximizedChange(callback)
    
    // No-op cleanup function for web
    return () => {}
  }
}
