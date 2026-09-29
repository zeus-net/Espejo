import { useMemo } from 'react'

/**
 * Calculates CSS Grid classes based on the number of active hosts.
 * Optimized for VNC multi-screen viewing with consistent cell sizing.
 * @param {number} count - Number of hosts to display
 * @returns {string} Tailwind CSS grid classes
 */
export const useGridLayout = (count) => {
  return useMemo(() => {
    if (count <= 0) return 'grid-cols-1 grid-rows-1'
    if (count === 1) return 'grid-cols-1 grid-rows-1'
    if (count === 2) return 'grid-cols-2 grid-rows-1'
    if (count <= 4) return 'grid-cols-2 grid-rows-2'
    if (count <= 6) return 'grid-cols-3 grid-rows-2'
    if (count <= 9) return 'grid-cols-3 grid-rows-3'
    return 'grid-cols-4 grid-rows-3' // up to 12, covers the 10 required
  }, [count])
}
