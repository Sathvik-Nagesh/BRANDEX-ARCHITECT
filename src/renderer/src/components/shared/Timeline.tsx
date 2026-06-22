import React from 'react'
import { motion } from 'framer-motion'
import { CircleDot } from 'lucide-react'

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: Date
  type: 'creation' | 'update' | 'decision' | 'meeting' | 'ai'
  actor?: string
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null

  return (
    <div className="relative border-l border-border ml-3 space-y-6 pb-4">
      {events.map((event, index) => (
        <motion.div 
          key={event.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative pl-6"
        >
          <div className="absolute -left-2 top-1 bg-background">
            <CircleDot className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{event.title}</span>
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(event.date)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
