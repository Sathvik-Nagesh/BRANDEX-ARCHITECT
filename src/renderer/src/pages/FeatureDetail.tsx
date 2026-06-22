import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GitCommit, FileText, Sparkles, BrainCircuit, Users } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { Button } from '../components/ui/button'
import { StatusBadge } from '../components/shared/StatusBadge'
import { useFeature } from '../hooks/queries/useFeatures'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { RichTextEditor } from '../components/shared/RichTextEditor'

export default function FeatureDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: feature, isLoading } = useFeature(id || '')

  if (isLoading || !feature) return <div className="p-8">Loading feature details...</div>

  return (
    <PageTransition className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b p-6 pb-0 bg-muted/5">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Feature</span>
              <span className="text-muted-foreground">•</span>
              <StatusBadge status={feature.status} />
            </div>
            <h1 className="typo-display text-2xl">{feature.name}</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <GitCommit className="w-4 h-4" /> Compare Versions
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 border-0 shadow-sm">
              <Sparkles className="w-4 h-4" /> AI Actions
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b-2 border-transparent">
          <div className="px-1 py-3 border-b-2 border-primary font-medium text-primary">Requirements</div>
          <div className="px-1 py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground cursor-pointer">Technical Design</div>
          <div className="px-1 py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground cursor-pointer">Scope History</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-muted/5 custom-scrollbar flex gap-6">
        
        {/* Main Editor Area */}
        <div className="flex-1 bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> Feature Requirements Document
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Draft v1</span>
          </div>
          <div className="flex-1 overflow-auto bg-card">
            <RichTextEditor 
              content={feature.description || ''} 
              onChange={(c) => console.log('Updated content', c)} 
              placeholder="Write the requirements, user stories, and acceptance criteria..."
            />
          </div>
        </div>

        {/* Right Sidebar - Metadata & Links */}
        <div className="w-80 space-y-6 shrink-0">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Details</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Priority</span>
                <span className="capitalize font-medium">{feature.priority}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Assignee</span>
                <span className="flex items-center gap-1 font-medium"><Users className="w-3 h-3" /> Unassigned</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Copilot Suggestions
            </h4>
            <ul className="text-sm space-y-2 text-indigo-800">
              <li className="hover:underline cursor-pointer flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0"></span>
                Generate User Stories
              </li>
              <li className="hover:underline cursor-pointer flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0"></span>
                Identify Edge Cases
              </li>
              <li className="hover:underline cursor-pointer flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0"></span>
                Draft Technical Architecture
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </PageTransition>
  )
}
