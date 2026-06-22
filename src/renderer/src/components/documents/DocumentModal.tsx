import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function DocumentModal({ isOpen, onClose, projectId }: { isOpen: boolean, onClose: () => void, projectId?: string }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('PRD')
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required")
      return await window.brandexAPI?.documents.create({ 
        projectId: projectId || null,
        title,
        type,
        content: ''
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
      }
      toast.success('Document created successfully!')
      onClose()
      setTitle('')
      setType('PRD')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-md shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-muted/5">
          <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Create Document</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Title <span className="text-red-500">*</span></label>
            <Input placeholder="e.g. Q3 Roadmap" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document Type</label>
            <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
              <option value="PRD">Product Requirements Document (PRD)</option>
              <option value="SOW">Statement of Work (SOW)</option>
              <option value="Brief">Creative Brief</option>
              <option value="Meeting Notes">Meeting Notes</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !title}>
            {createMutation.isPending ? 'Creating...' : 'Create Document'}
          </Button>
        </div>
      </div>
    </div>
  )
}
