import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { toast } from 'sonner'

export function ClientModal({ isOpen, onClose, editClient }: { isOpen: boolean, onClose: () => void, editClient?: any }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  useEffect(() => {
    if (editClient && isOpen) {
      setName(editClient.name || '')
      setCompany(editClient.company || '')
      setEmail(editClient.email || '')
      setPhone(editClient.phone || '')
    } else if (isOpen) {
      setName('')
      setCompany('')
      setEmail('')
      setPhone('')
    }
  }, [editClient, isOpen])

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Name is required")
      if (editClient) {
        return await window.brandexAPI?.clients.update({
          id: editClient.id,
          data: { name, company, email, phone }
        })
      }
      return await window.brandexAPI?.clients.create({ name, company, email, phone, status: 'lead' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      if (editClient) {
        queryClient.invalidateQueries({ queryKey: ['client', editClient.id] })
      }
      toast.success(editClient ? 'Client updated successfully!' : 'Client created successfully!')
      onClose()
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
          <h3 className="font-semibold">{editClient ? 'Edit Client Profile' : 'Add New Client'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
            <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Company</label>
            <Input placeholder="Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone</label>
            <Input placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name}>
            {createMutation.isPending ? 'Saving...' : editClient ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </div>
    </div>
  )
}
