import { Brain, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function Memory() {
  return (
    <div className="p-8">
      <PageHeader
        title="Memory"
        description="The permanent project brain — search and browse organizational knowledge"
        actions={
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search memory..."
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 w-48"
            />
          </div>
        }
      />
      <EmptyState
        icon={Brain}
        title="Memory is empty"
        description="As you add projects, features, decisions, and meetings, the memory system builds automatically."
      />
    </div>
  )
}
