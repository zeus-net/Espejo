import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import TitleBar from './components/TitleBar'
import ToolBar from './components/ToolBar'
import VncGrid from './components/VncGrid'
import HostModal from './components/HostModal'
import HostList from './components/HostList'

export default function App() {
  const loadHosts = useAppStore((s) => s.loadHosts)

  // Load saved hosts from electron-store on mount
  useEffect(() => {
    loadHosts()
  }, [loadHosts])

  return (
    <div className="h-full w-full flex flex-col bg-surface-950 overflow-hidden">
      {/* Title bar (frameless window) */}
      <TitleBar />

      {/* Toolbar (always visible) */}
      <ToolBar />

      {/* Main content: grid view (cells maximize inline for instant persistence) */}
      <VncGrid />

      {/* Modals / Overlays */}
      <HostModal />
      <HostList />
    </div>
  )
}
