import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  isFirstRun: boolean
  setIsFirstRun: (firstRun: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      isFirstRun: true,
      setIsFirstRun: (firstRun) => set({ isFirstRun: firstRun })
    }),
    {
      name: 'brandex-app-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, isFirstRun: state.isFirstRun })
    }
  )
)
