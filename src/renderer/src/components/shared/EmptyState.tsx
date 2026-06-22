import { motion } from 'framer-motion'
import { MOTION } from '@/lib/constants'
import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="empty-state"
      {...MOTION.fadeIn}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-6">{description}</p>
      {action && action}
    </motion.div>
  )
}
