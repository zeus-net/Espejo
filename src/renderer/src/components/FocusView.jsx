import { useRef, useEffect, useCallback } from 'react'
import { useVncConnection } from '../hooks/useVncConnection'
import { useAppStore } from '../store/useAppStore'

export default function FocusView() {
  const focusedHostId = useAppStore((s) => s.focusedHostId)
  const hosts = useAppStore((s) => s.hosts)
  const clearFocus = useAppStore((s) => s.clearFocus)
  const connectionStatus = useAppStore((s) => s.connectionStatus)

  const host = hosts.find((h) => h.id === focusedHostId)
  const containerRef = useRef(null)
  const { status, attempt, connect, disconnect } = useVncConnection(
    host || { id: '__noop__', name: '', ip: '', port: 5900 },
    containerRef
  )

  const activeStatus = connectionStatus[host?.id] || status

  // Auto-connect when entering focus view
  useEffect(() => {
    if (host) {
      connect()
    }
  }, [host?.id, connect])

  // ESC key to exit focus view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearFocus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearFocus])

  if (!host) return null

  return (
    <div className="flex-1 flex flex-col bg-surface-950 animate-fade-in">
      {/* Focus toolbar (styled to match main toolbar for visual harmony) */}
      <div className="h-11 bg-surface-900/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 no-drag">
        <div className="flex items-center gap-3">
          <button
            onClick={clearFocus}
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

          {/* Connect / Disconnect */}
          {activeStatus !== 'connected' && activeStatus !== 'connecting' ? (
            <button
              onClick={connect}
              className="text-[11px] text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg transition-all"
            >
              Conectar
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="text-[11px] text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
            >
              Desconectar
            </button>
          )}

          <span className="text-[10px] text-surface-600 border border-surface-700 rounded px-1.5 py-0.5">
            ESC
          </span>
        </div>
      </div>

      {/* Full-screen VNC view */}
      <div className="flex-1 relative bg-black">
        <div ref={containerRef} className="vnc-container" />

        {/* Connecting overlay */}
        {(activeStatus === 'connecting' || activeStatus === 'reconnecting') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/70 z-10">
            <div className="w-12 h-12 border-2 border-accent-400/30 border-t-accent-400 rounded-full animate-spin mb-4" />
            <span className="text-sm text-accent-400 font-medium">
              {activeStatus === 'connecting' ? 'Conectando...' : `Reconectando (intento ${attempt})`}
            </span>
            <span className="text-xs text-surface-500 mt-1">{host.ip}</span>
          </div>
        )}

        {/* Disconnected overlay */}
        {(activeStatus === 'disconnected' || activeStatus === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/85 z-10">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/80 flex items-center justify-center mb-4 border border-white/5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-surface-500">
                <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-sm text-surface-400">Sin conexión</span>
            <button
              onClick={connect}
              className="mt-4 text-xs font-medium bg-accent-500 hover:bg-accent-400 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Conectar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
