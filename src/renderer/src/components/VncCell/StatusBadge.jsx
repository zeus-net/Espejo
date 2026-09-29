export const StatusBadge = ({ status, attempt }) => {
  const config = {
    connected: { color: 'bg-emerald-400', shadow: 'shadow-emerald-400/50', label: 'Conectado' },
    connecting: { color: 'bg-blue-400 animate-pulse', shadow: 'shadow-blue-400/50', label: 'Conectando...' },
    reconnecting: { color: 'bg-amber-400 animate-pulse', shadow: 'shadow-amber-400/50', label: `Reconectando (${attempt})` },
    disconnected: { color: 'bg-surface-500', shadow: '', label: 'Desconectado' },
    auth_error: { color: 'bg-red-500', shadow: 'shadow-red-500/50', label: 'Error de auth' },
    error: { color: 'bg-red-500 animate-pulse', shadow: 'shadow-red-500/50', label: 'Error' }
  }

  const c = config[status] || config.disconnected

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-surface-300 font-medium hidden group-hover:inline transition-opacity">
        {c.label}
      </span>
      <span className={`w-2 h-2 rounded-full ${c.color} shadow-lg ${c.shadow}`} />
    </div>
  )
}
