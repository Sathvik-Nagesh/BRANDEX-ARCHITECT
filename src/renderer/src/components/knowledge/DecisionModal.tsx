import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Scale } from 'lucide-react'
import { toast } from 'sonner'

export function DecisionModal({ isOpen, onClose, projectId }: { isOpen: boolean, onClose: () => void, projectId?: string }) {
  const [decision, setDecision] = useState('')
  const [context, setContext] = useState('')
  const [reason, setReason] = useState('')
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!decision) throw new Error("Decision is required")
      return await window.brandexAPI?.decisions.create({ 
        projectId: projectId || null,
        decision,
        context,
        reason,
        status: 'Active'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['decisions', projectId] })
      }
      toast.success('Decision logged successfully!')
      onClose()
      setDecision('')
      setContext('')
      setReason('')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-md shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2"><Scale className="w-4 h-4 text-primary" /> Log Decision</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">What was decided? <span className="text-red-500">*</span></label>
            <Input placeholder="e.g. Use React for frontend" value={decision} onChange={e => setDecision(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Context / Problem</label>
            <textarea 
              className="w-full bg-background border rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="What were you trying to solve?" 
              value={context} 
              onChange={e => setContext(e.target.value)} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reasoning</label>
            <textarea 
              className="w-full bg-background border rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Why was this option chosen?" 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
            />
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !decision}>
            {createMutation.isPending ? 'Logging...' : 'Log Decision'}
          </Button>
        </div>
      </div>
    </div>
  )
}
