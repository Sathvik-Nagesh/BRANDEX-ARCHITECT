import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Building2, UserPlus, FileText, ChevronRight, Upload, Download } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { StatusBadge } from '../components/shared/StatusBadge'
import { useClients } from '../hooks/queries/useClients'
import { ClientModal } from '../components/clients/ClientModal'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export default function Clients() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: clients, isLoading } = useClients()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  ) || []

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Company,Email,Phone,Status\nJohn Doe,Acme Corp,john@acme.com,+1234567890,lead\nJane Smith,Globex,jane@globex.com,,active"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "brandex_clients_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n')
        let imported = 0
        
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const [name, company, email, phone, status] = line.split(',')
          if (name) {
            await window.brandexAPI?.clients.create({ 
              name: name.trim(), 
              company: company?.trim() || '', 
              email: email?.trim() || '', 
              phone: phone?.trim() || '', 
              status: status?.trim() || 'lead' 
            })
            imported++
          }
        }
        
        toast.success(`Imported ${imported} clients successfully!`)
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleDownloadTemplate} title="Download CSV Template">
        <Download className="w-4 h-4 mr-2" /> Template
      </Button>
      <Button variant="outline" onClick={handleImportCSV} title="Import from CSV">
        <Upload className="w-4 h-4 mr-2" /> Import
      </Button>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Client
      </Button>
    </div>
  )

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading clients...</div>
  }

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Clients" 
          description="Manage your clients, contacts, and associated projects."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {clients?.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={Building2}
              title="No clients yet"
              description="Add your first client to start organizing projects and documents."
              primaryAction={{
                label: "Add Client",
                onClick: () => setIsModalOpen(true),
                icon: UserPlus
              }}
              secondaryAction={{
                label: "Import from CSV",
                onClick: handleImportCSV
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map(client => (
                <div 
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="bg-card border rounded-xl p-5 card-hover cursor-pointer flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">{client.company || 'Independent'}</p>
                      </div>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>
                  
                  <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> 0 Projects
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> 0 Docs
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
            {filteredClients.length === 0 && search && (
              <div className="text-center py-12 text-muted-foreground">
                No clients match your search.
              </div>
            )}
          </div>
        )}
      </div>

      <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </PageTransition>
  )
}
