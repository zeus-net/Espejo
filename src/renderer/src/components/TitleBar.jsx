import { useState, useEffect } from 'react'
import logo from '../assets/logo.png'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check initial maximized state
    window.electronAPI?.isMaximized().then(setIsMaximized)

    // Listen for maximize/unmaximize changes
    const unsub = window.electronAPI?.onMaximizedChange((value) => {
      setIsMaximized(value)
    })

    return () => {
      if (unsub) unsub()
    }
  }, [])

  return (
    <div className="h-9 bg-gradient-to-r from-surface-900 via-surface-900 to-surface-850 flex items-center justify-between px-3 select-none drag border-b border-white/5">
      {/* App branding */}
      <div className="flex items-center gap-2.5 no-drag">
        <div className="w-6 h-6 rounded-md overflow-hidden bg-surface-950 flex items-center justify-center shadow-md border border-white/10">
          <img src={logo} alt="ZeusEye Logo" className="w-full h-full object-cover scale-110" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-surface-300">
          ZeusEye
        </span>
        <span className="text-[10px] text-surface-600 font-medium">
          VNC Viewer
        </span>
      </div>

      {/* Window controls */}
      <div className="flex items-center gap-0.5 no-drag">
        {/* Minimize */}
        <button
          onClick={() => window.electronAPI?.minimizeWindow()}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-surface-400 hover:text-white transition-colors duration-150"
          title="Minimizar"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" rx="0.5" />
          </svg>
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={() => window.electronAPI?.maximizeWindow()}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-surface-400 hover:text-white transition-colors duration-150"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2.5" y="0.5" width="7" height="7" rx="1" />
              <rect x="0.5" y="2.5" width="7" height="7" rx="1" fill="var(--tw-gradient-from, #0f172a)" />
              <rect x="0.5" y="2.5" width="7" height="7" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="0.5" y="0.5" width="9" height="9" rx="1" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          onClick={() => window.electronAPI?.closeWindow()}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-red-500/80 text-surface-400 hover:text-white transition-colors duration-150"
          title="Cerrar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  )
}
