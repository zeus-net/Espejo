import { useAppStore } from '../store/useAppStore'
import { useGridLayout } from '../hooks/useGridLayout'
import VncCell from './VncCell'

export default function VncGrid() {
  const hosts = useAppStore((s) => s.hosts)
  const setFocused = useAppStore((s) => s.setFocused)
  const gridClass = useGridLayout(hosts.length)

  if (hosts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-surface-950">
        {/* Empty state */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-white/5 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-surface-600">
            <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="20" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="3" y="20" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="20" y="20" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-medium text-surface-300">No hay hosts configurados</h2>
          <p className="text-xs text-surface-500 max-w-xs">
            Agrega hosts VNC para comenzar a monitorear tus equipos remotos en tiempo real.
          </p>
        </div>
        <button
          onClick={() => useAppStore.getState().openAddModal()}
          className="flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 active:scale-95"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="1" x2="6" y2="11" />
            <line x1="1" y1="6" x2="11" y2="6" />
          </svg>
          Agregar primer host
        </button>
      </div>
    )
  }

  return (
    <div className={`grid ${gridClass} flex-1 min-h-0 overflow-hidden gap-[2px] bg-surface-950 p-[2px]`}>
      {hosts.map((host) => (
        <div key={host.id} className="w-full h-full relative overflow-hidden">
          <VncCell
            host={host}
            onClick={() => setFocused(host.id)}
          />
        </div>
      ))}
    </div>
  )
}
