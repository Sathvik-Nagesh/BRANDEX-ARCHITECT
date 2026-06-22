import React, { useState } from 'react'
import { Plus, Search, MessageSquare, Video, Mic, Calendar, Trash2 } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MeetingImportModal } from '../components/meetings/MeetingImportModal'

export default function Meetings() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings', 'list'],
    queryFn: () => window.brandexAPI?.knowledge.meetings.list() || []
  })

  const headerActions = (
    <Button onClick={() => setIsModalOpen(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Import Transcript
    </Button>
  )

  const filteredMeetings = meetings.filter((m: any) => 
    m.title?.toLowerCase().includes(search.toLowerCase()) || 
    m.rawContent?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteMeeting = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        await window.brandexAPI?.knowledge.meetings.delete(id)
        toast.success('Meeting deleted')
        queryClient.invalidateQueries({ queryKey: ['meetings', 'list'] })
      } catch (err) {
        toast.error('Failed to delete meeting')
      }
    }
  }

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Meeting Intelligence" 
          description="Import transcripts, chats, or notes and let AI extract requirements and tasks automatically."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-sm text-muted-foreground">Loading meetings...</span>
          </div>
        ) : meetings.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={Mic}
              title="No meetings imported"
              description="Paste a transcript, WhatsApp chat, or raw notes to extract structured intelligence."
              primaryAction={{
                label: "Import Transcript",
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
                placeholder="Search meetings..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeetings.map((meeting: any) => (
                <div key={meeting.id} className="group bg-card border rounded-xl p-5 card-hover cursor-pointer transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{meeting.title || 'Untitled Meeting'}</h3>
                        <p className="text-xs text-muted-foreground capitalize">Project ID: {meeting.projectId.substring(0,8)}...</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDeleteMeeting(e, meeting.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-4 h-4" /> {new Date(meeting.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-medium">
                      Stored in Memory
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MeetingImportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </PageTransition>
  )
}
