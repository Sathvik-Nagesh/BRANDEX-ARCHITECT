import React, { useState } from 'react'
import { Plus, FileText, FileSpreadsheet, FileSignature, Receipt, Presentation } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageTransition } from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TemplateEditor } from '@/components/templates/TemplateEditor'
import { toast } from 'sonner'

const iconMap: Record<string, any> = {
  'Invoice': Receipt,
  'Proposal': Presentation,
  'SOW': FileSignature,
  'Report': FileText,
  'Onboarding': FileSpreadsheet,
  'Legal': FileText
}

export default function Templates() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => window.brandexAPI?.templates.list() || []
  })

  const handleCreate = () => {
    setSelectedTemplate(null)
    setIsEditing(true)
  }

  const handleEdit = (t: any) => {
    setSelectedTemplate(t)
    setIsEditing(true)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this template?')) {
      await window.brandexAPI?.templates.delete(id)
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template deleted')
    }
  }

  if (isEditing) {
    return <TemplateEditor template={selectedTemplate} onBack={() => setIsEditing(false)} />
  }
  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Document Templates"
          description="Manage your reusable templates for proposals, invoices, and legal agreements."
          actions={
            <Button className="gap-2" onClick={handleCreate}>
              <Plus className="w-4 h-4" /> New Template
            </Button>
          }
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: any) => {
            const Icon = iconMap[template.type] || FileText
            return (
            <div key={template.id} className="bg-card border rounded-2xl p-6 card-hover group cursor-pointer flex flex-col" onClick={() => handleEdit(template)}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{template.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>{template.type}</span>
                  <span>•</span>
                  <span>Edited {new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-primary">Edit Template</span>
                <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(template.id, e)}>Delete</Button>
              </div>
            </div>
          )})}
        </div>
      </div>
    </PageTransition>
  )
}
