import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function ProposalModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  
  const queryClient = useQueryClient()

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => window.brandexAPI?.clients.list()
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => window.brandexAPI?.projects.list()
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title || !clientId || !projectId) throw new Error("Title, Client, and Project are required")
      return await window.brandexAPI?.proposals?.create?.({ 
        title,
        clientId,
        projectId,
        status: 'Draft',
        content: 'Proposal content goes here...'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast.success('Proposal created successfully!')
      onClose()
      setTitle('')
      setClientId('')
      setProjectId('')
    },
    onError: (err: any) => {
      toast.error('Failed to create proposal: ' + err.message)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-md shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generate Proposal</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Proposal Title <span className="text-red-500">*</span></label>
            <Input placeholder="e.g. Acme Corp Web Redesign" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Select Client <span className="text-red-500">*</span></label>
            <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm" value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="" disabled>Choose a client...</option>
              {clients?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Select Project <span className="text-red-500">*</span></label>
            <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm" value={projectId} onChange={e => setProjectId(e.target.value)}>
              <option value="" disabled>Choose a project...</option>
              {projects?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !title || !clientId || !projectId}>
            {createMutation.isPending ? 'Generating...' : 'Generate AI Proposal'}
          </Button>
        </div>
      </div>
    </div>
  )
}
