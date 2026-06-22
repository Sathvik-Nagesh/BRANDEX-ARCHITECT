import React, { useState } from 'react'
import { Plus, BrainCircuit, ThumbsUp, ThumbsDown, Lightbulb, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionableEmptyState } from '../../shared/ActionableEmptyState'
import { toast } from 'sonner'

export function LessonsLearnedTab({ projectId }: { projectId: string }) {
  const [lessons, setLessons] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ well: '', wrong: '', delays: '', recommendations: '' })

  const handleSave = () => {
    if (!form.well && !form.wrong) {
      toast.error('Please enter at least one point')
      return
    }
    
    setLessons(prev => [...prev, {
      id: Date.now().toString(),
      ...form,
      createdAt: new Date().toISOString()
    }])
    setForm({ well: '', wrong: '', delays: '', recommendations: '' })
    setIsAdding(false)
    toast.success('Post-mortem lesson saved to agency playbook')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Post-Mortem & Lessons Learned</h2>
          <p className="text-sm text-muted-foreground">Document what worked and what failed to improve the AI Architect for next time.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" /> Log Post-Mortem
        </Button>
      </div>

      {isAdding && (
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            New Lesson Learned
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-500" /> What went well?
              </label>
              <textarea 
                className="w-full h-24 p-3 text-sm bg-background border rounded-lg resize-none"
                placeholder="The UI phase was incredibly fast..."
                value={form.well} 
                onChange={e => setForm({...form, well: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-500" /> What went wrong?
              </label>
              <textarea 
                className="w-full h-24 p-3 text-sm bg-background border rounded-lg resize-none"
                placeholder="We underestimated the API integration..."
                value={form.wrong} 
                onChange={e => setForm({...form, wrong: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Cause of any delays?
              </label>
              <textarea 
                className="w-full h-24 p-3 text-sm bg-background border rounded-lg resize-none"
                placeholder="Client took 5 days to provide credentials..."
                value={form.delays} 
                onChange={e => setForm({...form, delays: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Recommendations for next time
              </label>
              <textarea 
                className="w-full h-24 p-3 text-sm bg-background border rounded-lg resize-none"
                placeholder="Always ask for API docs during onboarding..."
                value={form.recommendations} 
                onChange={e => setForm({...form, recommendations: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 border-t mt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Lesson</Button>
          </div>
        </div>
      )}

      {lessons.length === 0 && !isAdding ? (
        <ActionableEmptyState
          icon={BrainCircuit}
          title="No lessons logged yet"
          description="Log a post-mortem to feed the AI playbook so Brandex doesn't make the same mistakes twice."
          primaryAction={{
            label: "Log Post-Mortem",
            onClick: () => setIsAdding(true),
            icon: Plus
          }}
        />
      ) : (
        <div className="space-y-4">
          {lessons.map(lesson => (
            <div key={lesson.id} className="bg-background border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3 mb-2">
                <span className="text-sm text-muted-foreground">Logged on {new Date(lesson.createdAt).toLocaleDateString()}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">Playbook Updated</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {lesson.well && (
                  <div>
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-500"/> Went Well</h5>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{lesson.well}</p>
                  </div>
                )}
                {lesson.wrong && (
                  <div>
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-1"><ThumbsDown className="w-3.5 h-3.5 text-red-500"/> Went Wrong</h5>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{lesson.wrong}</p>
                  </div>
                )}
                {lesson.delays && (
                  <div>
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-1"><AlertCircle className="w-3.5 h-3.5 text-amber-500"/> Delays</h5>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{lesson.delays}</p>
                  </div>
                )}
                {lesson.recommendations && (
                  <div>
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-1"><Lightbulb className="w-3.5 h-3.5 text-amber-400"/> Recommendations</h5>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{lesson.recommendations}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
