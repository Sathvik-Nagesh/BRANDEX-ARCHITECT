import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, FolderKanban, Layers, FileText,
  GitBranch, MessageSquare, Brain, FileSignature, Rocket,
  LayoutTemplate, Package, Settings, Search, PanelLeftClose,
  PanelLeft, Sparkles, ReceiptText, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, FolderKanban, Layers, FileText,
  GitBranch, MessageSquare, Brain, FileSignature, Rocket,
  LayoutTemplate, Package, Settings, Search, Sparkles, ReceiptText, BookOpen
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, setSidebarCollapsed, setCommandPaletteOpen } = useAppStore()

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  const mainItems = NAV_ITEMS.filter(i => !['settings'].includes(i.id))
  const bottomItems = NAV_ITEMS.filter(i => ['settings'].includes(i.id))

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <motion.aside
      className={cn(
        'h-full flex flex-col bg-[hsl(var(--sidebar))] border-r border-border',
        'select-none relative z-10'
      )}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo & Brand */}
      <div className="h-[var(--titlebar-height)] flex items-center px-4 titlebar-drag">
        <div className="flex items-center gap-2.5 titlebar-no-drag">
          <div className="w-7 h-7 rounded-lg bg-brandex-navy flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-semibold text-foreground whitespace-nowrap tracking-tight">
                  Brandex Architect
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-3 mb-1">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg text-muted-foreground',
            'hover:bg-[hsl(var(--sidebar-hover))] transition-colors duration-150',
            sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
          )}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between flex-1 overflow-hidden"
              >
                <span className="text-caption">Search</span>
                <kbd className="text-[10px] text-muted-foreground/60 bg-background border border-border rounded px-1.5 py-0.5 font-mono">
                  ⌘K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto custom-scrollbar space-y-0.5">
        {mainItems.map((item) => {
          const Icon = iconMap[item.icon]
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative',
                sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
                active
                  ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-foreground))]'
                  : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-foreground'
              )}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* AI Workspace button */}
      <div className="px-3 mb-1">
        <button
          onClick={() => navigate('/ai')}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg transition-all duration-150',
            sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
            location.pathname === '/ai'
              ? 'bg-brandex-navy text-white'
              : 'text-brandex-navy hover:bg-brandex-light'
          )}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[13px] font-medium whitespace-nowrap"
              >
                AI Workspace
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Divider */}
      <div className="px-3">
        <div className="border-t border-border" />
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 py-2 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = iconMap[item.icon]
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg transition-all duration-150',
                sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
                active
                  ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-foreground))]'
                  : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-foreground'
              )}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>

      {/* Collapse toggle */}
      <div className="px-3 pb-3">
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg py-2 text-muted-foreground',
            'hover:bg-[hsl(var(--sidebar-hover))] hover:text-foreground transition-colors duration-150',
            sidebarCollapsed ? 'justify-center px-2' : 'px-3'
          )}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-[13px] font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
