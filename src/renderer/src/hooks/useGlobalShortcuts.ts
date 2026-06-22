import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'

export function useGlobalShortcuts() {
  const navigate = useNavigate()
  const { setCommandPaletteOpen, commandPaletteOpen } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input or textarea
      const activeElement = document.activeElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || (activeElement as HTMLElement).isContentEditable)) {
        // Allow escape to close command palette even if focused somewhere else
        if (e.key === 'Escape' && commandPaletteOpen) {
          setCommandPaletteOpen(false)
        }
        return
      }

      // Ctrl+K (or Cmd+K) - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }

      // Ctrl+N - New Project
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        navigate('/projects?action=new')
      }

      // Ctrl+Shift+N - New Client
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        navigate('/clients?action=new')
      }

      // Ctrl+D - New Document
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        navigate('/documents?action=new')
      }

      // Ctrl+/ - AI Copilot
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        navigate('/ai')
      }
      
      // Ctrl+P - Generate Proposal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        navigate('/proposals?action=new')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, commandPaletteOpen, setCommandPaletteOpen])
}
