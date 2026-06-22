import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Button } from '../ui/button'

interface ActionableEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
}

export function ActionableEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  primaryAction, 
  secondaryAction 
}: ActionableEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed bg-muted/20"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-6">{description}</p>
      
      <div className="flex items-center gap-3">
        {primaryAction && (
          <Button onClick={primaryAction.onClick} className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant="outline" className="rounded-lg">
            {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
