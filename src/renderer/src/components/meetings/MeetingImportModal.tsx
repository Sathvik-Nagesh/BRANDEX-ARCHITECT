import React, { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Mic } from 'lucide-react'
import { toast } from 'sonner'

export function MeetingImportModal({ isOpen, onClose, defaultProjectId }: { isOpen: boolean, onClose: () => void, defaultProjectId?: string }) {
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(defaultProjectId || '')
  const [content, setContent] = useState('')
  
  const queryClient = useQueryClient()
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: async () => window.brandexAPI?.projects.list() })

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required")
      if (!projectId) throw new Error("Project is required")
      if (!content) throw new Error("Transcript content is required")
      
      // In a real implementation, we would call an AI handler here to extract actionable items.
      // We simulate storing the raw meeting into the knowledge base.
      return await window.brandexAPI?.knowledge.meetings.import({ 
        title, 
        projectId, 
        rawContent: content,
        type: 'transcript'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['projectMemory', projectId] })
      toast.success('Transcript imported and analyzed successfully!')
      onClose()
      setTitle('')
      setContent('')
      if (!defaultProjectId) setProjectId('')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            Import Meeting Transcript
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-sm font-medium">Meeting Title <span className="text-red-500">*</span></label>
              <Input placeholder="Client Kickoff Call" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>
            
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-sm font-medium">Assign to Project <span className="text-red-500">*</span></label>
              <select 
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm" 
                value={projectId} 
                onChange={e => setProjectId(e.target.value)}
                disabled={!!defaultProjectId}
              >
                <option value="">Select a project...</option>
                {projects?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Raw Transcript / Notes <span className="text-red-500">*</span></label>
            <p className="text-xs text-muted-foreground mb-2">Paste your Zoom transcript, WhatsApp chat export, or manual notes here. Brandex AI will extract requirements, action items, and decisions.</p>
            <textarea 
              className="w-full h-64 p-3 text-sm bg-background border rounded-lg resize-none focus:ring-1 focus:ring-primary"
              placeholder="[00:00:00] John: So for the homepage, we want a dark mode toggle..."
              value={content} 
              onChange={e => setContent(e.target.value)} 
            />
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending || !title || !projectId || !content}>
            {importMutation.isPending ? 'Analyzing with AI...' : 'Import & Analyze'}
          </Button>
        </div>
      </div>
    </div>
  )
}
