import React, { useState } from 'react'
import { Plus, GitPullRequest, ArrowRight, Activity, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionableEmptyState } from '../../shared/ActionableEmptyState'
import { toast } from 'sonner'

export function ChangeRequestsTab({ projectId }: { projectId: string }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newReq, setNewReq] = useState({ title: '', description: '' })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!newReq.title || !newReq.description) {
      toast.error('Title and description required')
      return
    }
    
    setIsAnalyzing(true)
    try {
      const res = await window.brandexAPI?.intelligence.analyzeChangeRequest(newReq.description)
      if (res) {
        setRequests(prev => [...prev, {
          id: Date.now().toString(),
          title: newReq.title,
          description: newReq.description,
          status: 'Analyzed',
          impact: res
        }])
        setNewReq({ title: '', description: '' })
        setIsAdding(false)
        toast.success('AI Analysis complete')
      } else {
        throw new Error("Analysis failed")
      }
    } catch (e) {
      toast.error('Failed to analyze change request')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Scope Change Requests</h2>
          <p className="text-sm text-muted-foreground">Manage and analyze client requested changes to scope.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" /> Log Request
        </Button>
      </div>

      {isAdding && (
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg">New Change Request</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Request Title</label>
            <Input 
              value={newReq.title} 
              onChange={e => setNewReq({...newReq, title: e.target.value})} 
              placeholder="e.g. Add Stripe Payment Gateway" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Description / Notes</label>
            <textarea 
              className="w-full h-32 p-3 text-sm bg-background border rounded-lg resize-none"
              placeholder="The client emailed asking to add Stripe instead of Razorpay..."
              value={newReq.description} 
              onChange={e => setNewReq({...newReq, description: e.target.value})} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing Impact...' : 'Analyze with AI Architect'}
            </Button>
          </div>
        </div>
      )}

      {requests.length === 0 && !isAdding ? (
        <ActionableEmptyState
          icon={GitPullRequest}
          title="No scope changes requested"
          description="When the client asks for something outside the original PRD, log it here to get an AI cost and timeline estimation."
          primaryAction={{
            label: "Log Change Request",
            onClick: () => setIsAdding(true),
            icon: Plus
          }}
        />
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-background border rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{req.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                </div>
                <div className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                  {req.status}
                </div>
              </div>
              
              {req.impact && (
                <div className="bg-slate-50 border rounded-lg p-4 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    <h5 className="font-semibold text-slate-800">AI Impact Analysis</h5>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white border p-3 rounded-lg flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 ${req.impact.complexity === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Complexity</div>
                        <div className="font-semibold">{req.impact.complexity}</div>
                      </div>
                    </div>
                    <div className="bg-white border p-3 rounded-lg flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Additional Time</div>
                        <div className="font-semibold">+{req.impact.additionalHours} Hours</div>
                      </div>
                    </div>
                    <div className="bg-white border p-3 rounded-lg flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Suggested Cost</div>
                        <div className="font-semibold">₹{req.impact.suggestedCost.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-700 bg-white border p-3 rounded-lg">
                    <span className="font-semibold mr-2">Summary:</span>
                    {req.impact.impactSummary}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Reject</Button>
                    <Button size="sm">Approve & Generate Invoice</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
