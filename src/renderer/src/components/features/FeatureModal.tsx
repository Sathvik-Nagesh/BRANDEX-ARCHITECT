import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { toast } from 'sonner'

export function FeatureModal({ isOpen, onClose, projectId }: { isOpen: boolean, onClose: () => void, projectId?: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [status, setStatus] = useState('Icebox')
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required")
      return await window.brandexAPI?.features.create({ 
        projectId: projectId || null,
        title,
        description,
        status,
        priority,
        complexity: 'Medium'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['features', projectId] })
      }
      toast.success('Feature created successfully!')
      onClose()
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setStatus('Icebox')
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
          <h3 className="font-semibold">Add New Feature</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
            <Input placeholder="e.g. User Authentication" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="w-full bg-background border rounded-lg px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Brief description of what this feature does..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Icebox">Icebox</option>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !title}>
            {createMutation.isPending ? 'Saving...' : 'Create Feature'}
          </Button>
        </div>
      </div>
    </div>
  )
}
