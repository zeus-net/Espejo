import { useRef, useEffect } from 'react'
import { vncManager } from '../services/vncManager'

/**
 * useVncCanvas
 * A React hook that links a physical DOM container to the active VNC connection in vncManager.
 * This guarantees separation of concerns: React handles the mounting of the div,
 * while the singleton vncManager handles low-level canvas injection and lifecycle.
 *
 * @param {string} hostId - Unique ID of the VNC host
 * @returns {React.RefObject} containerRef - Bind this to the target rendering div
 */
export const useVncCanvas = (hostId) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!hostId) return

    // Immediately register the canvas container with the connection manager on mount
    if (containerRef.current) {
      vncManager.registerCanvas(hostId, containerRef.current)
    }

    return () => {
      // Detach container ref on unmount (but do not destroy connection to prevent reflow drops)
      vncManager.registerCanvas(hostId, null)
    }
  }, [hostId])

  return containerRef
}
