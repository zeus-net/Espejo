export const FocusToolbar = ({
  host,
  activeStatus,
  attempt,
  controlMode,
  onClearFocus,
  onConnect,
  onDisconnect,
  onToggleControlMode
}) => {
  return (
    <div className="relative z-30 h-11 bg-surface-900/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 no-drag">
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClearFocus()
          }}
          className="flex items-center gap-2 text-xs font-semibold text-surface-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-sm active:scale-95"
          title="Volver a cuadrícula (ESC)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="15" y1="8" x2="1" y2="8" />
            <polyline points="8,15 1,8 8,1" />
          </svg>
          Volver
        </button>

        <div className="w-px h-4 bg-white/10" />

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-white drop-shadow-md">{host.name}</span>
          <span className="text-[10px] font-mono text-surface-500 bg-surface-950/40 px-2 py-0.5 rounded border border-white/5">
            {host.ip}:{host.port || 5900}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            activeStatus === 'connected' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' :
            activeStatus === 'connecting' || activeStatus === 'reconnecting' ? 'bg-amber-400 animate-pulse' :
            'bg-red-500'
          }`} />
          <span className="text-[10px] text-surface-400">
            {activeStatus === 'connected' ? 'Conectado' :
             activeStatus === 'connecting' ? 'Conectando...' :
             activeStatus === 'reconnecting' ? `Reconectando (${attempt})` :
             'Desconectado'}
          </span>
        </div>

        {/* Connect / Disconnect buttons inside focus toolbar */}
        {activeStatus !== 'connected' && activeStatus !== 'connecting' ? (
          <button
            onClick={(e) => { e.stopPropagation(); onConnect() }}
            className="text-[11px] text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg transition-all"
          >
            Conectar
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onDisconnect() }}
            className="text-[11px] text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
          >
            Desconectar
          </button>
        )}

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Toggle Control Mode Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleControlMode()
          }}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
            controlMode
              ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
              : 'text-surface-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title={controlMode ? "Desactivar control y volver a solo lectura" : "Activar control remoto"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {controlMode ? (
              // Mouse icon to indicate interaction
              <>
                <rect x="5" y="2" width="14" height="20" rx="7" />
                <line x1="12" y1="6" x2="12" y2="10" />
              </>
            ) : (
              // Eye off or Lock icon to indicate read-only
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
          {controlMode ? "Control: ON" : "Solo Lectura"}
        </button>

        <span className="text-[10px] text-surface-600 border border-surface-700 rounded px-1.5 py-0.5 ml-1">
          ESC
        </span>
      </div>
    </div>
  )
}
