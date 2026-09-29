export const AuthOverlay = ({ host, activeStatus, passwordInput, setPasswordInput, onReauth }) => {
  if (activeStatus !== 'auth_error') return null

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/90 gap-3 p-6 z-20 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-red-400">
          <rect x="5" y="8" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 8V5.5C7 3.84 8.34 2.5 10 2.5C11.66 2.5 13 3.84 13 5.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="13" r="1" fill="currentColor" />
        </svg>
      </div>
      <span className="text-xs text-red-400 font-medium">Contraseña incorrecta</span>
      <span className="text-[10px] text-surface-500">{host.name}</span>
      <input
        type="password"
        value={passwordInput}
        onChange={(e) => setPasswordInput(e.target.value)}
        className="bg-surface-800 text-white text-xs rounded-lg px-3 py-2 border border-surface-600 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 w-full max-w-[200px] transition-all"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onReauth(e.target.value)
        }}
        placeholder="Nueva contraseña VNC"
        autoFocus
      />
      <button
        onClick={() => onReauth(passwordInput)}
        className="text-[11px] font-medium bg-accent-500 hover:bg-accent-400 text-white px-4 py-1.5 rounded-lg transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
