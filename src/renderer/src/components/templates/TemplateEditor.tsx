import React, { useState } from 'react'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function TemplateEditor({ template, onBack }: { template: any, onBack: () => void }) {
  const queryClient = useQueryClient()
  const isNew = !template
  
  const [form, setForm] = useState({
    name: template?.name || 'New Template',
    type: template?.type || 'Proposal',
    content: template?.content || '',
    variables: template?.variables ? (typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables) : []
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form }
      if (isNew) return window.brandexAPI?.templates.create(payload)
      return window.brandexAPI?.templates.update(template.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template saved successfully')
      onBack()
    }
  })

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h2 className="font-bold text-lg">{isNew ? 'Create Template' : `Edit ${form.name}`}</h2>
            <p className="text-xs text-muted-foreground">{form.type} Template</p>
          </div>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-card border rounded-2xl p-6 shadow-sm grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name</label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <select className="w-full h-10 px-3 rounded-lg border bg-background" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Invoice</option>
              <option>Proposal</option>
              <option>SOW</option>
              <option>Report</option>
              <option>Onboarding</option>
              <option>Legal</option>
            </select>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> Template Content
            </h3>
            <p className="text-xs text-muted-foreground">Use {'{{variable_name}}'} to insert dynamic data.</p>
          </div>
          <textarea 
            className="flex-1 w-full p-4 border rounded-xl resize-none font-mono text-sm bg-muted/10 focus:outline-none focus:ring-2 focus:ring-primary/20 custom-scrollbar"
            value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
            placeholder="Type your HTML or plain text template here..."
          />
        </div>
      </div>
    </div>
  )
}
