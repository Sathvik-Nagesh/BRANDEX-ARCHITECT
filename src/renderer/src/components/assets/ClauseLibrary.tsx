import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, CheckCircle2, Archive, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/shared/StatusBadge'

export function ClauseLibrary() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', category: '', content: '' })

  const { data: clauses, isLoading } = useQuery({
    queryKey: ['clauses'],
    queryFn: async () => {
      return await window.brandexAPI?.clauses.list()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => window.brandexAPI?.clauses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clauses'] })
      toast.success('Clause created successfully')
      setEditingId(null)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => window.brandexAPI?.clauses.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clauses'] })
      toast.success('Clause updated successfully')
      setEditingId(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => window.brandexAPI?.clauses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clauses'] })
      toast.success('Clause deleted')
    }
  })

  const handleAddNew = () => {
    setEditingId('new')
    setEditForm({ title: 'New Clause', category: 'General', content: '' })
  }

  const handleEdit = (clause: any) => {
    setEditingId(clause.id)
    setEditForm({ title: clause.title, category: clause.category, content: clause.content })
  }

  const handleSave = () => {
    if (editingId === 'new') {
      createMutation.mutate(editForm)
    } else if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm })
    }
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading clause library...</div>

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between bg-muted/10">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Clause Library
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage reusable legal and commercial clauses</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Clause
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex gap-6">
        {/* List */}
        <div className="w-1/2 flex flex-col gap-3">
          {clauses?.length === 0 && editingId !== 'new' && (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
              No clauses found. Create your first clause.
            </div>
          )}
          {clauses?.map((c: any) => (
            <div 
              key={c.id} 
              className={`p-4 border rounded-xl cursor-pointer transition-colors ${editingId === c.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              onClick={() => handleEdit(c)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground">{c.title}</h4>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{c.category}</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{c.content}</p>
            </div>
          ))}
        </div>

        {/* Editor */}
        {editingId && (
          <div className="w-1/2 flex flex-col gap-4 bg-muted/20 p-6 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{editingId === 'new' ? 'Create New Clause' : 'Edit Clause'}</h3>
              <div className="flex gap-2">
                {editingId !== 'new' && (
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(editingId)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Title</label>
                <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category</label>
                <Input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="e.g. Payment Terms, Scope Change" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Content (Supports Variables like {'{{client_name}}'})</label>
                <textarea 
                  value={editForm.content} 
                  onChange={e => setEditForm({...editForm, content: e.target.value})}
                  className="w-full min-h-[250px] p-3 text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter the legal clause text here..."
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Clause
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
