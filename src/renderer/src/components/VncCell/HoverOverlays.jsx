import { StatusBadge } from './StatusBadge'

export const HoverOverlays = ({ host, activeStatus, attempt, onConnect, onDisconnect }) => {
  return (
    <>
      {/* --- Top badge (hover reveal) --- */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] font-medium text-white truncate max-w-[60%] drop-shadow-lg">
          {host.name}
        </span>
        <StatusBadge status={activeStatus} attempt={attempt} />
      </div>

      {/* --- Bottom info bar (hover reveal) --- */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-mono text-surface-400 drop-shadow-lg">
          {host.ip}:{host.port || 5900}
        </span>
        <div className="flex items-center gap-1 no-drag">
          {activeStatus !== 'connected' && activeStatus !== 'connecting' && activeStatus !== 'reconnecting' && (
            <button
              onClick={(e) => { e.stopPropagation(); onConnect() }}
              className="text-[10px] text-emerald-400 hover:bg-emerald-500/20 px-2 py-0.5 rounded transition-colors pointer-events-auto"
            >
              Conectar
            </button>
          )}
          {(activeStatus === 'connected' || activeStatus === 'connecting' || activeStatus === 'reconnecting') && (
            <button
              onClick={(e) => { e.stopPropagation(); onDisconnect() }}
              className="text-[10px] text-red-400 hover:bg-red-500/20 px-2 py-0.5 rounded transition-colors pointer-events-auto"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>

      {/* --- Active cell highlight --- */}
      {activeStatus === 'connected' && (
        <div className="absolute inset-0 ring-1 ring-accent-500/30 pointer-events-none z-10" />
      )}
    </>
  )
}
