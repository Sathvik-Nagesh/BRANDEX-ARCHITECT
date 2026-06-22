import React, { useState } from 'react'
import { Plus, Package, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionableEmptyState } from '../../shared/ActionableEmptyState'

export function DeliverablesTab({ projectId }: { projectId: string }) {
  const [deliverables, setDeliverables] = useState([
    { id: '1', name: 'UI/UX Figma Files', category: 'Design', status: 'Completed', dueDate: '2026-06-30' },
    { id: '2', name: 'Frontend Source Code', category: 'Development', status: 'In Progress', dueDate: '2026-07-15' },
    { id: '3', name: 'Database Schema', category: 'Architecture', status: 'Not Started', dueDate: '2026-07-20' }
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Project Deliverables</h2>
          <p className="text-sm text-muted-foreground">Track the tangible assets and code to be handed over.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Deliverable
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Deliverable Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deliverables.map(d => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <Package className="w-4 h-4 text-primary" />
                  {d.name}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{d.category}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(d.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                    ${d.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      d.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-slate-50 text-slate-700 border-slate-200'}
                  `}>
                    {d.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
