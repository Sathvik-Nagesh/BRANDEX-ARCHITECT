import React, { useState } from 'react'
import { Plus, Camera, History, FileJson, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionableEmptyState } from '../../shared/ActionableEmptyState'
import { toast } from 'sonner'

export function SnapshotsTab({ projectId }: { projectId: string }) {
  const [snapshots, setSnapshots] = useState<any[]>([])

  const handleTakeSnapshot = () => {
    toast.success('Snapshot created successfully')
    setSnapshots(prev => [...prev, {
      id: Date.now().toString(),
      name: `V1 Production Milestone`,
      createdAt: new Date().toISOString(),
      size: '14.2 KB'
    }])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Project Snapshots</h2>
          <p className="text-sm text-muted-foreground">Freeze the current project state (Features, Docs, Pricing) as a restorable milestone.</p>
        </div>
        <Button onClick={handleTakeSnapshot}>
          <Camera className="w-4 h-4 mr-2" /> Take Snapshot
        </Button>
      </div>

      {snapshots.length === 0 ? (
        <ActionableEmptyState
          icon={History}
          title="No snapshots yet"
          description="Take a snapshot before major scope changes to maintain a point-in-time record of the project."
          primaryAction={{
            label: "Take First Snapshot",
            onClick: handleTakeSnapshot,
            icon: Camera
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snapshots.map(snap => (
            <div key={snap.id} className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">{snap.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Taken {new Date(snap.createdAt).toLocaleString()} • {snap.size}</p>
                </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                  <History className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
