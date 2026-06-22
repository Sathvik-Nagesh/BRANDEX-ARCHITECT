import { Minus, Square, X, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.brandexAPI?.window.isMaximized().then(setIsMaximized)
    const unsubscribe = window.brandexAPI?.window.onMaximizedChange(setIsMaximized)
    return () => unsubscribe?.()
  }, [])

  return (
    <div className="h-[var(--titlebar-height)] flex items-center justify-end titlebar-drag bg-background border-b border-border/50 px-2 gap-1" style={{ WebkitAppRegion: 'drag' } as any}>
      <button
        onClick={() => window.brandexAPI?.window.minimize()}
        className="titlebar-no-drag w-8 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
      >
        <Minus className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
      </button>
      <button
        onClick={() => window.brandexAPI?.window.maximize()}
        className="titlebar-no-drag w-8 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
      >
        {isMaximized ? (
          <Copy className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <Square className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
        )}
      </button>
      <button
        onClick={() => window.brandexAPI?.window.close()}
        className="titlebar-no-drag w-8 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
      </button>
    </div>
  )
}
