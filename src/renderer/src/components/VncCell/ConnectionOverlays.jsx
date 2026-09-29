export const ConnectionOverlays = ({ host, activeStatus, attempt, onConnect, onDisconnect }) => {
  return (
    <>
      {/* --- Disconnected overlay --- */}
      {(activeStatus === 'disconnected' || activeStatus === 'error') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/85 z-20 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-surface-800/80 flex items-center justify-center mb-3 border border-white/5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-surface-500">
              <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="9" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <line x1="8" y1="13" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            </svg>
          </div>
          <span className="text-xs text-surface-400 font-medium">{host.name}</span>
          <span className="text-[10px] text-surface-600 mt-0.5">Sin conexión</span>
          <button
            onClick={(e) => { e.stopPropagation(); onConnect() }}
            className="mt-3 text-[11px] font-medium text-accent-400 hover:text-accent-300 hover:bg-accent-500/10 px-3 py-1.5 rounded-lg transition-all"
          >
            Conectar
          </button>
        </div>
      )}

      {/* --- Reconnecting overlay --- */}
      {activeStatus === 'reconnecting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/70 z-20">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-3" />
          <span className="text-xs text-amber-400 font-medium">Reconectando...</span>
          <span className="text-[10px] text-surface-500 mt-0.5">Intento {attempt}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDisconnect() }}
            className="mt-3 text-[11px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all pointer-events-auto"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* --- Connecting overlay --- */}
      {activeStatus === 'connecting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/70 z-20">
          <div className="w-8 h-8 border-2 border-accent-400/30 border-t-accent-400 rounded-full animate-spin mb-3" />
          <span className="text-xs text-accent-400 font-medium">Conectando...</span>
          <span className="text-[10px] text-surface-500 mt-0.5">{host.ip}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDisconnect() }}
            className="mt-3 text-[11px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all pointer-events-auto"
          >
            Cancelar
          </button>
        </div>
      )}
    </>
  )
}
