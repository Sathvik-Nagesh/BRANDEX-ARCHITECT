import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { DocumentModal } from '@/components/documents/DocumentModal'

export default function Documents() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="p-8">
      <PageHeader
        title="Documents"
        description="PRDs, technical designs, and implementation plans"
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brandex-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brandex-navy/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Document
          </button>
        }
      />
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Generate PRDs, technical designs, API designs, user stories, and more."
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brandex-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brandex-navy/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Document
          </button>
        }
      />
      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
