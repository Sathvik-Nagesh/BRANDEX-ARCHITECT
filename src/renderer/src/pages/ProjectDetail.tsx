import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, BrainCircuit, Activity, AlertCircle, FileText, 
  Sparkles, Plus, Mic, CheckCircle2, Circle, Clock, MessageSquare, Send
} from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { StatusBadge } from '../components/shared/StatusBadge'
import { useProject } from '../hooks/queries/useProjects'
import { useClient } from '../hooks/queries/useClients'
import { useFeaturesByProject } from '../hooks/queries/useFeatures'
import { Timeline, TimelineEvent } from '../components/shared/Timeline'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { DeliverablesTab } from '../components/projects/tabs/DeliverablesTab'
import { ChangeRequestsTab } from '../components/projects/tabs/ChangeRequestsTab'
import { LessonsLearnedTab } from '../components/projects/tabs/LessonsLearnedTab'
import { SnapshotsTab } from '../components/projects/tabs/SnapshotsTab'
import { MeetingImportModal } from '../components/meetings/MeetingImportModal'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  const { data: project, isLoading: pLoading } = useProject(id || '')
  const { data: client } = useClient(project?.clientId || '')
  const { data: features, isLoading: fLoading } = useFeaturesByProject(id || '')

  const { data: healthData } = useQuery({
    queryKey: ['projectHealth', id],
    queryFn: async () => window.brandexAPI?.projects.getHealth(id!)
  })

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return
    const msg = chatInput
    setChatInput('')
    setChatHistory(prev => [...prev, { role: 'user', content: msg }])
    setIsTyping(true)
    try {
      const response = await window.brandexAPI?.ai.chat(`Context: Project ${project?.name}. ${msg}`)
      setChatHistory(prev => [...prev, { role: 'ai', content: response }])
    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error: ' + e.message }])
    } finally {
      setIsTyping(false)
    }
  }

  if (pLoading || !project) return <div className="p-8">Loading Command Center...</div>

  const openFeatures = features?.filter(f => f.status !== 'released' && f.status !== 'cancelled') || []
  const completedFeatures = features?.filter(f => f.status === 'released') || []

  // Mock timeline events for visual display
  const timelineEvents: TimelineEvent[] = [
    { id: '1', title: 'Project Created', description: 'Initial project setup completed.', date: new Date(project.createdAt), type: 'creation' }
  ]

  return (
    <PageTransition className="flex h-full overflow-hidden bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Project Header (Sticky) */}
        <div className="border-b bg-background/95 backdrop-blur z-10 p-6 pb-0 flex flex-col justify-between shrink-0">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate('/projects')} className="hover:text-foreground flex items-center transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Projects
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate(`/clients/${client?.id}`)} className="hover:text-foreground transition-colors">
              {client?.name || 'Unknown Client'}
            </button>
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="typo-display text-3xl mb-2 flex items-center gap-3">
                {project.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <StatusBadge status={project.status} />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Activity className="w-3.5 h-3.5" /> Healthy
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> 
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Mic className="w-4 h-4" /> Import Meeting
              </Button>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> New Feature
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 shadow-sm border-0">
                <Sparkles className="w-4 h-4" /> Generate PRD
              </Button>
            </div>
          </div>

          <div className="flex gap-6 border-b-2 border-transparent overflow-x-auto custom-scrollbar">
            {['Overview', 'Features', 'Deliverables', 'Documents', 'Change Requests', 'Lessons Learned', 'Snapshots'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab} {tab === 'Features' && `(${features?.length || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-muted/5">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
              
              {/* Left Column: Metrics & Current State */}
              <div className="col-span-12 xl:col-span-8 space-y-6">
                
                {/* AI Insights Banner */}
                {healthData?.reasons && healthData.reasons.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 flex gap-4"
                  >
                    <div className="shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">Project Health Insights</h4>
                      <p className="text-sm text-indigo-700 leading-relaxed">
                        {healthData.reasons.join(' ')}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-card border rounded-xl p-5 card-hover">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Circle className="w-4 h-4" /> Open Features
                    </div>
                    <div className="text-3xl font-semibold">{openFeatures.length}</div>
                  </div>
                  <div className="bg-card border rounded-xl p-5 card-hover">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
                    </div>
                    <div className="text-3xl font-semibold">{completedFeatures.length}</div>
                  </div>
                  <div className="bg-card border rounded-xl p-5 card-hover">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> Blockers / Risks
                    </div>
                    <div className="text-3xl font-semibold">0</div>
                  </div>
                </div>

                {/* Features List Preview */}
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b flex justify-between items-center bg-muted/20">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" /> Priority Features
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('Features')}>View All</Button>
                  </div>
                  <div className="p-0">
                    {fLoading ? <div className="p-5 text-muted-foreground">Loading...</div> : 
                     openFeatures.length > 0 ? (
                      <div className="divide-y">
                        {openFeatures.slice(0, 5).map(f => (
                          <div key={f.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/features/${f.id}`)}>
                            <div>
                              <p className="font-medium">{f.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{f.priority} Priority</p>
                            </div>
                            <StatusBadge status={f.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">No open features.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Knowledge & Timeline */}
              <div className="col-span-12 xl:col-span-4 space-y-6">
                
                {/* Knowledge Panel */}
                <div className="bg-card border rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 pb-3 border-b">
                    <BrainCircuit className="w-4 h-4 text-primary" /> Project Context
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm">{project.description || 'No description provided.'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Objectives</h4>
                      <p className="text-sm text-muted-foreground italic">AI will summarize objectives here based on documentation.</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-card border rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold mb-5 flex items-center gap-2 pb-3 border-b">
                    <Activity className="w-4 h-4 text-primary" /> Activity Timeline
                  </h3>
                  <Timeline events={timelineEvents} />
                </div>

              </div>
            </div>
          )}
          
          {activeTab === 'Deliverables' && <DeliverablesTab projectId={project.id} />}
          {activeTab === 'Change Requests' && <ChangeRequestsTab projectId={project.id} />}
          {activeTab === 'Lessons' && <LessonsLearnedTab projectId={project.id} />}
          {activeTab === 'Snapshots' && <SnapshotsTab projectId={project.id} />}

          {!['Overview', 'Deliverables', 'Change Requests', 'Lessons', 'Snapshots'].includes(activeTab) && (
            <div className="flex items-center justify-center h-[60vh]">
              <ActionableEmptyState 
                icon={activeTab === 'Documents' ? FileText : BrainCircuit}
                title={`${activeTab} workspace`}
                description={`The ${activeTab.toLowerCase()} interface is ready to be populated.`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Persistent AI Copilot Sidebar (Collapsible in real app) */}
      <div className="w-80 border-l bg-card flex flex-col shrink-0 z-20 shadow-xl hidden lg:flex">
        <div className="p-4 border-b flex items-center gap-2 bg-muted/30">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Project Copilot</h2>
        </div>
        
        <div className="flex-1 overflow-auto p-4 custom-scrollbar flex flex-col gap-3">
          <div className="text-xs text-center text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Today</div>
          
          <div className="bg-muted/50 rounded-xl rounded-tl-sm p-3 max-w-[90%] text-sm">
            Hi! I have context on {project.name}. I can generate PRDs, summarize recent meetings, or analyze scope changes. What do you need?
          </div>
          
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`rounded-xl p-3 max-w-[90%] text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground self-end rounded-tr-sm' : 'bg-muted/50 rounded-tl-sm self-start'}`}>
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="bg-muted/50 rounded-xl rounded-tl-sm p-3 max-w-[90%] text-sm text-muted-foreground self-start">
              Thinking...
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-background">
          <div className="relative">
            <Input 
              className="pr-10 rounded-full bg-muted/50 border-muted-foreground/20" 
              placeholder="Ask copilot..." 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage()
              }}
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50"
              onClick={handleSendMessage}
              disabled={isTyping || !chatInput.trim()}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <MeetingImportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultProjectId={project.id}
      />
    </PageTransition>
  )
}
