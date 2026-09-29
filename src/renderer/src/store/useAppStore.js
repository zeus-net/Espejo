import { create } from 'zustand'
import { systemService } from '../services/systemService'
import { vncManager } from '../services/vncManager'

export const useAppStore = create((set, get) => ({
  // --- Host Data ---
  hosts: [],
  // connectionStatus tracks the status of each connection: { [hostId]: { status: string, attempt: number } }
  connectionStatus: {},   
  focusedHostId: null,
  controlMode: {}, // { [hostId]: boolean } - true means interaction enabled, false is viewOnly
  viewOnlyGlobal: false,

  // --- UI State ---
  showAddModal: false,
  showHostList: false,
  editingHost: null,

  // --- Host Management ---
  setHosts: (hosts) => set({ hosts }),

  addHost: (host) => {
    set((state) => ({ hosts: [...state.hosts, host] }))
    const { hosts } = get()
    systemService.saveHosts(hosts)
  },

  removeHost: (hostId) => {
    // 1. Terminate and clean up VNC connection
    vncManager.removeConnection(hostId)

    // 2. Update state and save
    set((state) => {
      const nextStatus = { ...state.connectionStatus }
      delete nextStatus[hostId]
      return {
        hosts: state.hosts.filter((h) => h.id !== hostId),
        connectionStatus: nextStatus
      }
    })
    
    setTimeout(() => {
      const { hosts } = get()
      systemService.saveHosts(hosts)
    }, 0)
  },

  updateHost: (hostId, updates) => {
    set((state) => ({
      hosts: state.hosts.map((h) => (h.id === hostId ? { ...h, ...updates } : h))
    }))
    
    setTimeout(() => {
      const { hosts } = get()
      systemService.saveHosts(hosts)
      
      // If the password or other parameters changed, trigger connection refresh if active
      const activeConn = vncManager.connections.get(hostId)
      if (activeConn && activeConn.status !== 'disconnected') {
        const updatedHost = get().hosts.find(h => h.id === hostId)
        if (updatedHost) {
          vncManager.connect(updatedHost, activeConn.domContainer)
        }
      }
    }, 0)
  },

  reorderHosts: (newHosts) => {
    set({ hosts: newHosts })
    systemService.saveHosts(newHosts)
  },

  // --- Connection Control Actions ---
  setStatus: (hostId, status, attempt = 0) =>
    set((state) => ({
      connectionStatus: { 
        ...state.connectionStatus, 
        [hostId]: { status, attempt } 
      }
    })),

  connectHost: (hostId, domContainer = null) => {
    const host = get().hosts.find(h => h.id === hostId)
    if (host) {
      vncManager.connect(host, domContainer)
    }
  },

  disconnectHost: (hostId) => {
    vncManager.disconnect(hostId)
  },

  connectAll: () => {
    const { hosts } = get()
    hosts.forEach((host) => {
      vncManager.connect(host, null)
    })
  },

  disconnectAll: () => {
    vncManager.disconnectAll()
  },

  // --- Focus View ---
  setFocused: (hostId) => set({ focusedHostId: hostId }),
  clearFocus: () => set({ focusedHostId: null }),

  // --- View Only & Control Toggle ---
  toggleViewOnly: () => set((state) => ({ viewOnlyGlobal: !state.viewOnlyGlobal })),
  toggleControlMode: (hostId) => set((state) => {
    const isControlling = !state.controlMode[hostId]
    vncManager.setControlMode(hostId, isControlling)
    return { controlMode: { ...state.controlMode, [hostId]: isControlling } }
  }),

  // --- UI Modals ---
  openAddModal: () => set({ showAddModal: true, showHostList: false, editingHost: null }),
  openEditModal: (host) => set({ showAddModal: true, showHostList: false, editingHost: host }),
  closeModal: () => set({ showAddModal: false, editingHost: null }),
  openHostList: () => set({ showHostList: true, showAddModal: false }),
  closeHostList: () => set({ showHostList: false }),

  // --- Persistence ---
  loadHosts: async () => {
    try {
      const hosts = await systemService.getHosts()
      if (hosts && Array.isArray(hosts)) {
        set({ hosts })
      }
    } catch (e) {
      console.error('[Store] Error loading hosts:', e)
    }
  },

  persistHosts: () => {
    const { hosts } = get()
    systemService.saveHosts(hosts)
  }
}))

// Register the vncManager listener to seamlessly pipe connection status updates back into Zustand.
vncManager.registerStoreCallback((hostId, status, attempt) => {
  useAppStore.getState().setStatus(hostId, status, attempt)
})
