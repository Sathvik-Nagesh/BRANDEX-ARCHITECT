import React, { useState } from 'react'
import { Plus, Search, FileText, Download, LayoutTemplate, Printer, FileDown, Trash2 } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProposalModal } from '../components/proposals/ProposalModal'

export default function Proposals() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const res = await window.api.proposals.list()
      return res || []
    }
  })

  const filteredProposals = proposals?.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.clientName || '').toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleDeleteProposal = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this proposal?')) {
      try {
        await window.api.proposals.delete(id)
        toast.success('Proposal deleted')
        queryClient.invalidateQueries({ queryKey: ['proposals'] })
      } catch (err) {
        toast.error('Failed to delete proposal')
      }
    }
  }

  const handleExportPDF = async () => {
    // Basic test of the export IPC
    const html = `
      <div style="padding: 40px; font-family: sans-serif;">
        <h1 style="color: #4f46e5;">Brandex Architect</h1>
        <h2>Proposal for Web Development</h2>
        <p>This is a dynamically generated PDF proposal directly from the Live Preview engine.</p>
        <div style="margin-top: 50px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <h3>Pricing Summary</h3>
          <ul>
            <li>Discovery & Strategy: $5,000</li>
            <li>Design & Development: $15,000</li>
          </ul>
          <p><strong>Total: $20,000</strong></p>
        </div>
      </div>
    `
    await window.api.export.pdf(html, 'Brandex_Proposal.pdf')
  }

  const handleExportDocx = async () => {
    const sections = [
      { heading: 'Executive Summary', content: 'Brandex Architect provides top-tier software solutions.' },
      { heading: 'Scope of Work', content: '1. Frontend\n2. Backend\n3. Deployment' }
    ]
    await window.api.export.docx(sections, 'Brandex_Proposal.docx')
  }

  const headerActions = (
    <Button onClick={() => setIsModalOpen(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Create Proposal
    </Button>
  )

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading proposals...</div>

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Proposal Engine" 
          description="Generate highly-professional, print-ready proposals directly from project context and case studies."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {proposals?.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={LayoutTemplate}
              title="No proposals generated"
              description="Select a project and compile a custom proposal based on existing requirements."
              primaryAction={{
                label: "Create First Proposal",
                onClick: () => setIsModalOpen(true),
                icon: Plus
              }}
            />
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search proposals..." 
                  className="pl-9 bg-background"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredProposals.map((proposal: any) => (
                <div key={proposal.id} className="bg-card border rounded-xl p-5 card-hover flex justify-between items-center transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground">{proposal.clientName} • {new Date(proposal.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium capitalize">
                      {proposal.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleExportDocx}>
                      <FileDown className="w-4 h-4 mr-2" /> DOCX
                    </Button>
                    <Button variant="default" size="sm" onClick={handleExportPDF}>
                      <Printer className="w-4 h-4 mr-2" /> Print PDF
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-2" onClick={(e) => handleDeleteProposal(e, proposal.id)} title="Delete Proposal">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </PageTransition>
  )
}
