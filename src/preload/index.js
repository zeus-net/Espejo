const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Host Management ---
  getHosts: () => ipcRenderer.invoke('hosts:get'),
  saveHosts: (hosts) => ipcRenderer.invoke('hosts:save', hosts),

  // --- VNC Proxy Control ---
  startProxy: (hostId, ip, port) => ipcRenderer.invoke('vnc:start-proxy', hostId, ip, port),
  stopProxy: (hostId) => ipcRenderer.invoke('vnc:stop-proxy', hostId),
  stopAllProxies: () => ipcRenderer.invoke('vnc:stop-all'),

  // --- Window Controls ---
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),

  // Listen for maximize/unmaximize state changes
  onMaximizedChange: (callback) => {
    const handler = (_, value) => callback(value)
    ipcRenderer.on('window:maximized-change', handler)
    return () => ipcRenderer.removeListener('window:maximized-change', handler)
  }
})
