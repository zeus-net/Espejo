import { useAppStore } from '../store/useAppStore'

export default function ToolBar() {
  const hosts = useAppStore((s) => s.hosts)
  const connectionStatus = useAppStore((s) => s.connectionStatus)
  const openAddModal = useAppStore((s) => s.openAddModal)
  const openHostList = useAppStore((s) => s.openHostList)

  const connectedCount = Object.values(connectionStatus).filter((c) => c?.status === 'connected').length
  const totalHosts = hosts.length

  const connectAll = useAppStore((s) => s.connectAll)
  const disconnectAll = useAppStore((s) => s.disconnectAll)

  const handleConnectAll = () => {
    connectAll()
  }

  const handleDisconnectAll = () => {
    disconnectAll()
  }

  return (
    <div className="h-11 bg-surface-900/80 backdrop-blur-sm border-b border-white/5 flex items-center gap-2 px-3">
      {/* Add host button */}
      <button
        id="btn-add-host"
        onClick={openAddModal}
        className="flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 active:scale-95"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="1" x2="6" y2="11" />
          <line x1="1" y1="6" x2="11" y2="6" />
        </svg>
        Agregar host
      </button>

      {/* Edit hosts */}
      <button
        id="btn-edit-hosts"
        onClick={openHostList}
        className="flex items-center gap-1.5 text-xs text-surface-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-200"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="1" width="10" height="2.5" rx="0.5" />
          <rect x="1" y="4.75" width="10" height="2.5" rx="0.5" />
          <rect x="1" y="8.5" width="10" height="2.5" rx="0.5" />
        </svg>
        Editar hosts
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Connection indicator */}
        {totalHosts > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-surface-400 mr-2">
            <div className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-surface-600'}`} />
            <span>
              {connectedCount}/{totalHosts}
            </span>
          </div>
        )}

        {/* Connect all */}
        <button
          id="btn-connect-all"
          onClick={handleConnectAll}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="1,0 10,5 1,10" />
          </svg>
          Conectar todos
        </button>

        {/* Disconnect all */}
        <button
          id="btn-disconnect-all"
          onClick={handleDisconnectAll}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="8" height="8" rx="1" />
          </svg>
          Desconectar
        </button>
      </div>
    </div>
  )
}
