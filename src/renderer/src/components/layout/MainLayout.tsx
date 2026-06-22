import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TitleBar } from './TitleBar'
import { CommandPalette } from '../shared/CommandPalette'
import { useGlobalShortcuts } from '../../hooks/useGlobalShortcuts'

export function MainLayout() {
  useGlobalShortcuts()

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* TitleBar */}
      <TitleBar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Command Palette overlay */}
      <CommandPalette />
    </div>
  )
}
