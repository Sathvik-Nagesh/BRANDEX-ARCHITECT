import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderKanban, FileText, Settings, Users, BrainCircuit } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export function CommandPalette() {
  const isOpen = useAppStore(state => state.commandPaletteOpen)
  const setOpen = useAppStore(state => state.setCommandPaletteOpen)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const { data: searchResults } = useQuery({
    queryKey: ['systemSearch', query],
    queryFn: async () => {
      if (query.length < 2) return null
      return await window.brandexAPI?.system.search(query)
    },
    enabled: query.length >= 2
  })

  // Static commands
  const defaultCommands = [
    { id: 'c1', title: 'Create new project', icon: FolderKanban, action: () => { setOpen(false); navigate('/projects') } },
    { id: 'c2', title: 'Add new client', icon: Users, action: () => { setOpen(false); navigate('/clients') } },
    { id: 'c3', title: 'Generate proposal', icon: FileText, action: () => { setOpen(false); navigate('/proposals') } },
    { id: 'c4', title: 'Open AI Copilot', icon: BrainCircuit, action: () => { setOpen(false); navigate('/ai') } },
    { id: 'c5', title: 'System Settings', icon: Settings, action: () => { setOpen(false); navigate('/settings') } },
  ]

  const displayItems = query.length >= 2 && searchResults ? searchResults.map((r: any) => ({
    id: r.id,
    title: r.title,
    subtitle: r.type,
    icon: r.type === 'project' ? FolderKanban : r.type === 'client' ? Users : FileText,
    action: () => {
      setOpen(false)
      navigate(`/${r.type}s/${r.id}`)
    }
  })) : defaultCommands

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, searchResults])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-card border shadow-2xl rounded-xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground"
              placeholder="Search projects, clients, documents, or run a command..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSelectedIndex(s => Math.min(s + 1, displayItems.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSelectedIndex(s => Math.max(s - 1, 0))
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  displayItems[selectedIndex]?.action()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  setOpen(false)
                }
              }}
            />
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-medium text-muted-foreground">ESC</kbd>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {displayItems.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
            ) : (
              displayItems.map((item, idx) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                    selectedIndex === idx ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${selectedIndex === idx ? 'text-primary-foreground/80' : 'text-muted-foreground'}`} />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.subtitle && <span className={`text-[10px] uppercase ${selectedIndex === idx ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{item.subtitle}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
