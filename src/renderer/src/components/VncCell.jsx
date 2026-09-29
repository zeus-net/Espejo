import { useRef, useEffect, useState, memo, useCallback } from 'react'
import { useVncCanvas } from '../hooks/useVncCanvas'
import { useAppStore } from '../store/useAppStore'

import { FocusToolbar } from './VncCell/FocusToolbar'
import { HoverOverlays } from './VncCell/HoverOverlays'
import { ConnectionOverlays } from './VncCell/ConnectionOverlays'
import { AuthOverlay } from './VncCell/AuthOverlay'

const VncCell = memo(function VncCell({ host, onClick }) {
  const containerRef = useVncCanvas(host.id)
  const [passwordInput, setPasswordInput] = useState('')
  
  const updateHost = useAppStore((s) => s.updateHost)
  const connectionStatus = useAppStore((s) => s.connectionStatus)
  const connectHost = useAppStore((s) => s.connectHost)
  const disconnectHost = useAppStore((s) => s.disconnectHost)
  const focusedHostId = useAppStore((s) => s.focusedHostId)
  const clearFocus = useAppStore((s) => s.clearFocus)

  // Unpack status and attempt count from unified Zustand store connectionStatus
  const conn = connectionStatus[host.id] || { status: 'disconnected', attempt: 0 }
  const activeStatus = conn.status
  const attempt = conn.attempt

  const controlMode = useAppStore((s) => s.controlMode[host.id] || false)
  const toggleControlMode = useAppStore((s) => s.toggleControlMode)

  const isFocused = focusedHostId === host.id

  const connect = useCallback(() => {
    connectHost(host.id, containerRef.current)
  }, [host.id, connectHost, containerRef])

  const disconnect = useCallback(() => {
    disconnectHost(host.id)
  }, [host.id, disconnectHost])

  // ESC key to exit focus view when this cell is maximized
  useEffect(() => {
    if (!isFocused) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearFocus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, clearFocus])

  // Handle re-authentication
  const handleReauth = useCallback((newPassword) => {
    if (!newPassword.trim()) return
    updateHost(host.id, { password: newPassword })
    setPasswordInput('')
    // Reconnect with new password after state propagates
    setTimeout(() => connect(), 100)
  }, [host.id, updateHost, connect])

  return (
    <div
      className={
        isFocused
          ? "fixed inset-x-0 top-9 bottom-0 bg-black flex flex-col z-30 animate-fade-in no-drag"
          : "relative w-full h-full bg-surface-900 overflow-hidden group cursor-pointer"
      }
      onClick={isFocused ? undefined : onClick}
    >
      {/* Focus toolbar (only visible when this cell is maximized) */}
      {isFocused && (
        <FocusToolbar
          host={host}
          activeStatus={activeStatus}
          attempt={attempt}
          controlMode={controlMode}
          onClearFocus={clearFocus}
          onConnect={connect}
          onDisconnect={disconnect}
          onToggleControlMode={() => toggleControlMode(host.id)}
        />
      )}

      {/* noVNC renders its canvas here. */}
      <div 
        ref={containerRef} 
        className={isFocused ? "vnc-container flex-1 bg-black relative" : "vnc-container pointer-events-none"} 
      />

      {/* --- Hover overlay badges: only show when NOT focused --- */}
      {!isFocused && (
        <HoverOverlays 
          host={host}
          activeStatus={activeStatus}
          attempt={attempt}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      )}

      {/* --- Connection state overlays --- */}
      <ConnectionOverlays
        host={host}
        activeStatus={activeStatus}
        attempt={attempt}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      {/* --- Auth error overlay --- */}
      <AuthOverlay 
        host={host}
        activeStatus={activeStatus}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        onReauth={handleReauth}
      />
    </div>
  )
})

export default VncCell
