import React, { useState } from 'react'
import { Plus, Search, BrainCircuit, Target, Scale, Zap } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { DecisionModal } from '../components/knowledge/DecisionModal'

export default function Decisions() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ['decisions', 'list'],
    queryFn: () => window.brandexAPI?.knowledge.decisions.list() || []
  })

  const headerActions = (
    <Button onClick={() => setIsModalOpen(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Log Decision
    </Button>
  )

  const filteredDecisions = decisions.filter((d: any) => 
    d.decision?.toLowerCase().includes(search.toLowerCase()) || 
    d.reason?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Decision Log" 
          description="A chronological record of architectural, product, and business decisions."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-sm text-muted-foreground">Loading decisions...</span>
          </div>
        ) : decisions.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={Target}
              title="No decisions logged"
              description="Record why you made important choices so future context isn't lost."
              primaryAction={{
                label: "Log First Decision",
                onClick: () => setIsModalOpen(true),
                icon: Plus
              }}
            />
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search decisions..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredDecisions.map((decision: any) => (
                <div key={decision.id} className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {decision.decision}
                    </h3>
                    <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {new Date(decision.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5" /> Context
                      </h4>
                      <p className="text-sm text-foreground/80">{decision.context || 'No specific context recorded.'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> Reason
                      </h4>
                      <p className="text-sm text-foreground/90 font-medium">{decision.reason}</p>
                    </div>
                    <div className="md:col-span-2 pt-4 border-t">
                      <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Impact & Consequences
                      </h4>
                      <p className="text-sm text-foreground/80">Logged to Project ID: {decision.projectId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <DecisionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </PageTransition>
  )
}
