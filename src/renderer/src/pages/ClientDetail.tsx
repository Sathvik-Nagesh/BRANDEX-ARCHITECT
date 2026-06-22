import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClient } from '../hooks/queries/useClients'
import { useProjectsByClient } from '../hooks/queries/useProjects'
import { PageTransition } from '../components/shared/PageTransition'
import { Button } from '../components/ui/button'
import { ArrowLeft, Building2, Mail, Phone, MapPin, Plus, Sparkles, FileText, Activity } from 'lucide-react'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { StatusBadge } from '../components/shared/StatusBadge'
import { ClientModal } from '../components/clients/ClientModal'
import { ProjectModal } from '../components/projects/ProjectModal'
import { toast } from 'sonner'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'documents' | 'activity'>('overview')
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const { data: client, isLoading: loadingClient } = useClient(id || '')
  const { data: projects, isLoading: loadingProjects } = useProjectsByClient(id || '')

  if (loadingClient || !client) {
    return <div className="p-8">Loading client profile...</div>
  }

  return (
    <PageTransition className="flex flex-col h-full bg-background overflow-hidden">
      {/* CRM-style Header */}
      <div className="border-b bg-muted/10 p-8 pb-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
        
        <div className="flex justify-between items-start pb-8">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl shadow-sm border border-primary/20">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-heading text-foreground">{client.name}</h1>
                <StatusBadge status={client.status} />
              </div>
              <h2 className="text-lg text-muted-foreground flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4" /> {client.company || 'Independent'}
                {client.industry && <span className="text-sm px-2 py-0.5 bg-muted rounded-md ml-2">{client.industry}</span>}
              </h2>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {client.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {client.email}</span>}
                {client.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {client.phone}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsClientModalOpen(true)}>Edit Profile</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => {
              toast.success('Navigating to proposal generator...')
              navigate('/proposals')
            }}>
              <Sparkles className="w-4 h-4 mr-2 text-white" />
              Generate Proposal
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b-2 border-transparent">
          <div onClick={() => setActiveTab('overview')} className={`px-1 py-3 border-b-2 font-medium cursor-pointer ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Overview</div>
          <div onClick={() => setActiveTab('projects')} className={`px-1 py-3 border-b-2 font-medium cursor-pointer ${activeTab === 'projects' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Projects ({projects?.length || 0})</div>
          <div onClick={() => setActiveTab('documents')} className={`px-1 py-3 border-b-2 font-medium cursor-pointer ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Documents</div>
          <div onClick={() => setActiveTab('activity')} className={`px-1 py-3 border-b-2 font-medium cursor-pointer ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Activity</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div>
          
          {/* Overview & Projects Section */}
          {(activeTab === 'overview' || activeTab === 'projects') && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="typo-heading">Active Projects</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsProjectModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> New Project
                </Button>
              </div>
              
              {loadingProjects ? (
                <div>Loading...</div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="border rounded-xl p-4 card-hover cursor-pointer">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <ActionableEmptyState 
                  icon={Building2}
                  title="No projects yet"
                  description="Create a project to start organizing features, documents, and meetings for this client."
                  primaryAction={{
                    label: "Create Project",
                    onClick: () => setIsProjectModalOpen(true),
                    icon: Plus
                  }}
                />
              )}
            </section>
          )}

          {/* Documents Section */}
          {activeTab === 'documents' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="typo-heading mb-4">Client Documents</h3>
              <ActionableEmptyState 
                icon={FileText}
                title="No documents yet"
                description="Proposals, SOWs, and requirements documents for this client will appear here."
                primaryAction={{
                  label: "Generate Proposal",
                  onClick: () => navigate('/proposals'),
                  icon: Sparkles
                }}
              />
            </section>
          )}

          {/* Activity Section */}
          {(activeTab === 'overview' || activeTab === 'activity') && (
            <section className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="typo-heading mb-4">Recent Activity</h3>
              <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/10 flex flex-col items-center gap-3">
                <Activity className="w-8 h-8 text-muted-foreground/30" />
                Timeline will appear here once project activity begins.
              </div>
            </section>
          )}

        </div>
      </div>

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} editClient={client} />
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} defaultClientId={client.id} />
    </PageTransition>
  )
}
