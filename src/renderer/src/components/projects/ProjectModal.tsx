import React, { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Sparkles, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export function ProjectModal({ isOpen, onClose, defaultClientId }: { isOpen: boolean, onClose: () => void, defaultClientId?: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState(defaultClientId || '')
  const [templateId, setTemplateId] = useState('')
  const [isAiMode, setIsAiMode] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: async () => window.brandexAPI?.clients.list() })
  const { data: templates } = useQuery({ queryKey: ['projectTemplates'], queryFn: async () => window.brandexAPI?.projectTemplates.list() })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Name is required")
      if (!clientId) throw new Error("Client is required")
      
      let reqJson = null
      let structure = null
      
      if (isAiMode && aiPrompt) {
        // Call AI Architect
        structure = await window.brandexAPI?.intelligence.generateProjectStructure(aiPrompt)
        reqJson = JSON.stringify(structure)
      } else if (templateId) {
        // Use Template
        const template = templates?.find((t: any) => t.id === templateId)
        if (template) {
          reqJson = JSON.stringify({ templateName: template.name })
        }
      }

      return await window.brandexAPI?.projects.create({ 
        name, 
        description, 
        clientId, 
        status: 'planning',
        requirementsJson: reqJson
      })
    },
    onSuccess: (newProject: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(isAiMode ? 'AI Architect configured your project!' : 'Project created successfully!')
      onClose()
      setName('')
      setDescription('')
      setClientId('')
      setAiPrompt('')
      setIsAiMode(false)
      navigate(`/projects/${newProject.id}`)
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Create New Project</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex bg-muted/30 p-1 rounded-lg">
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${!isAiMode ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setIsAiMode(false)}
            >
              Standard
            </button>
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${isAiMode ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setIsAiMode(true)}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Architect
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-medium">Project Name <span className="text-red-500">*</span></label>
              <Input placeholder="E-commerce Redesign" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Client <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 rounded-lg border bg-background text-sm" value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Select a client...</option>
                {clients?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            
            {!isAiMode && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-muted-foreground" />
                  Template
                </label>
                <select className="w-full h-10 px-3 rounded-lg border bg-background text-sm" value={templateId} onChange={e => setTemplateId(e.target.value)}>
                  <option value="">Blank Project</option>
                  {templates?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isAiMode ? (
            <div className="space-y-1.5 bg-primary/5 p-4 rounded-xl border border-primary/20">
              <label className="text-sm font-medium text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Client Requirements
              </label>
              <p className="text-xs text-muted-foreground mb-2">Describe what the client wants. AI will automatically generate features, deliverables, timelines, and PRDs using the Agency Playbook context.</p>
              <textarea 
                className="w-full h-24 p-3 text-sm bg-background border rounded-lg resize-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. A modern school website with a dedicated admissions portal and a parent dashboard..."
                value={aiPrompt} 
                onChange={e => setAiPrompt(e.target.value)} 
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full h-24 p-3 text-sm bg-background border rounded-lg resize-none"
                placeholder="Brief description of the project..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name || !clientId}>
            {createMutation.isPending ? 'Generating Architecture...' : isAiMode ? 'Generate Project' : 'Create Project'}
          </Button>
        </div>
      </div>
    </div>
  )
}
