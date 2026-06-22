import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Layers, ListTodo } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { FeatureModal } from '../components/features/FeatureModal'

export default function Features() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: features = [], isLoading } = useQuery({
    queryKey: ['features', 'list'],
    queryFn: () => window.brandexAPI?.features.list() || []
  })

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Feature
      </Button>
    </div>
  )

  const filteredFeatures = features.filter((f: any) => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="All Features" 
          description="Global view of all features across your active projects."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-sm text-muted-foreground">Loading features...</span>
          </div>
        ) : features.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={Layers}
              title="No features found"
              description="Features break down your projects into actionable deliverables."
              primaryAction={{
                label: "Create Feature",
                onClick: () => setIsModalOpen(true),
                icon: Plus
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search features..." 
                  className="pl-9 bg-background"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                <button className="px-3 py-1.5 bg-background shadow-sm rounded-md text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Board
                </button>
                <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors">
                  <ListTodo className="w-4 h-4" /> List
                </button>
              </div>
            </div>

            {/* Kanban Board Mockup */}
            <div className="flex gap-6 overflow-x-auto pb-4 h-[60vh] custom-scrollbar">
              {['pending', 'approved', 'building', 'completed'].map(column => {
                const columnFeatures = filteredFeatures.filter((f: any) => f.status === column)
                return (
                  <div key={column} className="flex-none w-80 bg-muted/20 border rounded-xl flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center bg-muted/40 rounded-t-xl">
                      <span className="font-semibold text-sm capitalize">{column}</span>
                      <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border shadow-sm">
                        {columnFeatures.length}
                      </span>
                    </div>
                    
                    <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                      {columnFeatures.map((feature: any) => (
                        <div 
                          key={feature.id}
                          onClick={() => navigate(`/features/${feature.id}`)}
                          className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <h4 className="font-medium text-sm mb-2">{feature.title}</h4>
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                              feature.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              feature.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                              feature.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {feature.priority}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate ml-2 max-w-[100px]">
                              {feature.description || 'No description'}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {columnFeatures.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-muted flex items-center justify-center rounded-lg text-xs text-muted-foreground">
                          Drop features here
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <FeatureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </PageTransition>
  )
}
