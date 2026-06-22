import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FolderKanban, Calendar, Sparkles, Download, Copy, Upload } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { StatusBadge } from '../components/shared/StatusBadge'
import { useProjects } from '../hooks/queries/useProjects'
import { useClients } from '../hooks/queries/useClients'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProjectModal } from '../components/projects/ProjectModal'

export default function Projects() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: projects, isLoading: loadingProjects } = useProjects()
  const { data: clients } = useClients()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getClientName = (id: string) => clients?.find(c => c.id === id)?.name || 'Unknown Client'

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    getClientName(p.clientId).toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleImport = async () => {
    try {
      const result = await window.brandexAPI?.projects.import()
      if (result?.success) {
        toast.success('Project imported successfully!')
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      } else if (!result?.canceled) {
        toast.error('Failed to import project')
      }
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleExport = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    try {
      const result = await window.brandexAPI?.projects.export(projectId)
      if (result?.success) {
        toast.success('Project exported successfully!')
      } else if (!result?.canceled) {
        toast.error('Failed to export project')
      }
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleClone = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    try {
      const result = await window.brandexAPI?.projects.clone(projectId)
      if (result?.success) {
        toast.success('Project cloned successfully!')
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      } else if (!result?.canceled) {
        toast.error('Failed to clone project')
      }
    } catch (err) {
      toast.error(String(err))
    }
  }

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleImport}>
        <Upload className="w-4 h-4 mr-2" />
        Import Project
      </Button>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Project
      </Button>
    </div>
  )

  if (loadingProjects) return <div className="p-8 text-muted-foreground">Loading projects...</div>

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Projects" 
          description="Manage all active projects, view health, and track progress."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {projects?.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={FolderKanban}
              title="No active projects"
              description="Start tracking your first project to unlock the AI Copilot and Project Command Center."
              primaryAction={{
                label: "Create Project",
                onClick: () => setIsModalOpen(true),
                icon: Plus
              }}
              secondaryAction={{
                label: "Import .brandexproject",
                onClick: handleImport
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects by name or client..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-card border rounded-xl p-5 card-hover cursor-pointer flex flex-col group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={project.status} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleClone(e, project.id)} title="Clone Project">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleExport(e, project.id)} title="Export Project">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mt-2 pr-8">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{getClientName(project.clientId)}</p>
                  
                  {project.description && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-6">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Copilot Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProjects.length === 0 && search && (
               <div className="text-center py-12 text-muted-foreground">
                 No projects match your search.
               </div>
            )}
          </div>
        )}
      </div>

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </PageTransition>
  )
}
