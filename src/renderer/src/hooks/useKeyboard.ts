import { useCallback, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

export function useKeyboard() {
  const { toggleCommandPalette } = useAppStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd + K → Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    },
    [toggleCommandPalette]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
