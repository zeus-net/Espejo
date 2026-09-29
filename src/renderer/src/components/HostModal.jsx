import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function HostModal() {
  const showAddModal = useAppStore((s) => s.showAddModal)
  const editingHost = useAppStore((s) => s.editingHost)
  const closeModal = useAppStore((s) => s.closeModal)
  const addHost = useAppStore((s) => s.addHost)
  const updateHost = useAppStore((s) => s.updateHost)
  const persistHosts = useAppStore((s) => s.persistHosts)

  const isEditing = !!editingHost

  const [form, setForm] = useState({
    name: '',
    ip: '',
    port: '5900',
    password: '',
    viewOnly: false
  })

  const [errors, setErrors] = useState({})

  // Populate form when editing
  useEffect(() => {
    if (editingHost) {
      setForm({
        name: editingHost.name || '',
        ip: editingHost.ip || '',
        port: String(editingHost.port || 5900),
        password: editingHost.password || '',
        viewOnly: editingHost.viewOnly || false
      })
    } else {
      setForm({ name: '', ip: '', port: '5900', password: '', viewOnly: false })
    }
    setErrors({})
  }, [editingHost, showAddModal])

  // ESC to close
  useEffect(() => {
    if (!showAddModal) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showAddModal, closeModal])

  const validate = useCallback(() => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!form.ip.trim()) newErrors.ip = 'La IP es requerida'
    const portNum = parseInt(form.port, 10)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      newErrors.port = 'Puerto inválido (1-65535)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleSave = useCallback(() => {
    if (!validate()) return

    const hostData = {
      name: form.name.trim(),
      ip: form.ip.trim(),
      port: parseInt(form.port, 10) || 5900,
      password: form.password,
      viewOnly: true
    }

    if (isEditing) {
      updateHost(editingHost.id, hostData)
    } else {
      addHost({
        ...hostData,
        id: crypto.randomUUID()
      })
    }

    persistHosts()
    closeModal()
  }, [form, isEditing, editingHost, addHost, updateHost, persistHosts, closeModal, validate])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!showAddModal) return null

  const fields = [
    { label: 'Nombre', name: 'name', placeholder: 'Ej: Servidor producción', type: 'text' },
    { label: 'IP Tailscale', name: 'ip', placeholder: '100.64.x.x', type: 'text' },
    { label: 'Puerto VNC', name: 'port', placeholder: '5900', type: 'text' }
  ]

  return (
    <div
      className="fixed inset-x-0 top-9 bottom-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
    >
      <div 
        className="glass-heavy rounded-xl w-[400px] max-w-[90vw] p-6 flex flex-col gap-5 animate-scale-in shadow-2xl shadow-black/50 no-drag"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {isEditing ? 'Editar host VNC' : 'Agregar host VNC'}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeModal()
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-surface-400 hover:text-white transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>

        {/* Form fields */}
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
              {field.label}
            </label>
            <input
              type={field.type}
              value={form[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`bg-surface-800/80 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 transition-all ${
                errors[field.name] ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-accent-500/50'
              }`}
              placeholder={field.placeholder}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            />
            {errors[field.name] && (
              <span className="text-[10px] text-red-400">{errors[field.name]}</span>
            )}
          </div>
        ))}

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
            Contraseña VNC
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="bg-surface-800/80 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/30 transition-all"
            placeholder="Contraseña del servidor VNC"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeModal()
            }}
            className="text-xs text-surface-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSave()
            }}
            className="text-xs font-medium bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-accent-500/20 active:scale-95"
          >
            {isEditing ? 'Guardar cambios' : 'Agregar host'}
          </button>
        </div>
      </div>
    </div>
  )
}
