import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Custom PointerSensor to prevent dnd-kit from hijacking clicks on interactive elements
class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }) => {
        const element = event.target
        const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A']
        if (
          interactiveTags.includes(element.tagName) ||
          element.closest('button') ||
          element.closest('a')
        ) {
          return false // Ignore drag activation for buttons/links
        }
        return true
      }
    }
  ]
}

function SortableHostItem({ host, onEdit, onRemove, onConnect, onDisconnect, status }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: host.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  }

  const statusConfig = {
    connected: { dot: 'bg-emerald-400 shadow-emerald-400/50', text: 'Conectado', textColor: 'text-emerald-400' },
    connecting: { dot: 'bg-blue-400 animate-pulse', text: 'Conectando...', textColor: 'text-blue-400' },
    reconnecting: { dot: 'bg-amber-400 animate-pulse', text: 'Reconectando', textColor: 'text-amber-400' },
    disconnected: { dot: 'bg-surface-500', text: 'Desconectado', textColor: 'text-surface-500' },
    auth_error: { dot: 'bg-red-500', text: 'Error auth', textColor: 'text-red-400' },
    error: { dot: 'bg-red-500', text: 'Error', textColor: 'text-red-400' }
  }

  const s = statusConfig[status] || statusConfig.disconnected
  const isConnected = status === 'connected' || status === 'connecting' || status === 'reconnecting'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-800/50 border border-white/5 hover:border-white/10 group transition-all"
    >
      {/* Drag handle */}
      <button
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-surface-600 hover:text-surface-400 transition-colors"
        {...attributes}
        {...listeners}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="3" cy="2" r="1" />
          <circle cx="9" cy="2" r="1" />
          <circle cx="3" cy="6" r="1" />
          <circle cx="9" cy="6" r="1" />
          <circle cx="3" cy="10" r="1" />
          <circle cx="9" cy="10" r="1" />
        </svg>
      </button>

      {/* Status dot */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 shadow-lg ${s.dot}`} />

      {/* Host info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white truncate">{host.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-surface-500 truncate">
            {host.ip}:{host.port || 5900}
          </span>
          <span className={`text-[10px] ${s.textColor}`}>{s.text}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Connect / Disconnect */}
        {isConnected ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onDisconnect(host.id)
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
            title="Desconectar"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="8" height="8" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onConnect(host.id)
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"
            title="Conectar"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="1,0 10,5 1,10" />
            </svg>
          </button>
        )}

        {/* Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onEdit(host)
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-surface-400 hover:text-white transition-colors"
          title="Editar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M8.5 1.5l2 2-7 7H1.5V8.5z" />
          </svg>
        </button>

        {/* Remove */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove(host.id)
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-colors"
          title="Eliminar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <line x1="2" y1="3" x2="10" y2="3" />
            <path d="M4 3V2a1 1 0 011-1h2a1 1 0 011 1v1" />
            <path d="M3 3l.5 7.5a1 1 0 001 .5h3a1 1 0 001-.5L9 3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function HostList() {
  const showHostList = useAppStore((s) => s.showHostList)
  const closeHostList = useAppStore((s) => s.closeHostList)
  const hosts = useAppStore((s) => s.hosts)
  const connectionStatus = useAppStore((s) => s.connectionStatus)
  const reorderHosts = useAppStore((s) => s.reorderHosts)
  const removeHost = useAppStore((s) => s.removeHost)
  const openEditModal = useAppStore((s) => s.openEditModal)
  const openAddModal = useAppStore((s) => s.openAddModal)

  const sensors = useSensors(
    useSensor(SmartPointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ESC to close
  useEffect(() => {
    if (!showHostList) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeHostList()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showHostList, closeHostList])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = hosts.findIndex((h) => h.id === active.id)
      const newIndex = hosts.findIndex((h) => h.id === over.id)
      reorderHosts(arrayMove(hosts, oldIndex, newIndex))
    }
  }

  const connectHost = useAppStore((s) => s.connectHost)
  const disconnectHost = useAppStore((s) => s.disconnectHost)

  const handleConnect = (hostId) => {
    connectHost(hostId)
  }

  const handleDisconnect = (hostId) => {
    disconnectHost(hostId)
  }

  if (!showHostList) return null

  return (
    <div
      className="fixed inset-x-0 top-9 bottom-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) closeHostList() }}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-[360px] max-w-[85vw] glass-heavy border-r border-white/5 flex flex-col animate-slide-in shadow-2xl shadow-black/50 no-drag"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Hosts VNC</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeHostList()
                openAddModal()
              }}
              className="text-[11px] font-medium text-accent-400 hover:bg-accent-500/10 px-2.5 py-1 rounded-lg transition-all"
            >
              + Agregar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeHostList()
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-surface-400 hover:text-white transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="2" x2="10" y2="10" />
                <line x1="10" y1="2" x2="2" y2="10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Host list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {hosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
              <div className="w-12 h-12 rounded-xl bg-surface-800/50 flex items-center justify-center border border-white/5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-surface-600">
                  <rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="6" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="10" y1="15" x2="10" y2="18" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <span className="text-xs text-surface-500">No hay hosts configurados</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeHostList()
                  openAddModal()
                }}
                className="text-[11px] font-medium text-accent-400 hover:bg-accent-500/10 px-3 py-1.5 rounded-lg transition-all"
              >
                Agregar host
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={hosts.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                {hosts.map((host) => (
                  <SortableHostItem
                    key={host.id}
                    host={host}
                    status={connectionStatus[host.id]?.status || 'disconnected'}
                    onEdit={(h) => { closeHostList(); openEditModal(h) }}
                    onRemove={removeHost}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        {hosts.length > 0 && (
          <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-surface-500">
              {hosts.length} host{hosts.length !== 1 ? 's' : ''} • Arrastra para reordenar
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
