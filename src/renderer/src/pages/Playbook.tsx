import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MOTION } from '@/lib/constants'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageTransition } from '@/components/shared/PageTransition'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Target, Code, Palette, SearchCheck, Rocket, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const categories = [
  { id: 'Sales', icon: Target, desc: 'Discovery questions, scripts, objection handling' },
  { id: 'Project Management', icon: BookOpen, desc: 'Kickoff, communication, delivery process' },
  { id: 'Development', icon: Code, desc: 'Coding standards, architecture, security' },
  { id: 'Design', icon: Palette, desc: 'UI guidelines, branding standards' },
  { id: 'QA', icon: SearchCheck, desc: 'Testing checklists, release checklists' },
  { id: 'Deployment', icon: Rocket, desc: 'Deployment process, post-launch checklist' }
]

export default function Playbook() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [content, setContent] = useState('')
  const [activeEntry, setActiveEntry] = useState<any>(null)
  
  const queryClient = useQueryClient()

  const { data: playbookEntries } = useQuery({
    queryKey: ['playbook'],
    queryFn: async () => window.brandexAPI?.playbook.list()
  })

  useEffect(() => {
    const entries = playbookEntries || []
    const entry = entries.find((e: any) => e.category === activeCategory)
    if (entry) {
      setActiveEntry(entry)
      setContent(entry.content)
    } else {
      setActiveEntry(null)
      setContent('')
    }
  }, [activeCategory, playbookEntries])

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await window.brandexAPI?.playbook.save({
        id: activeEntry?.id,
        category: activeCategory,
        title: `${activeCategory} Standards`,
        content
      })
    },
    onSuccess: () => {
      toast.success(`${activeCategory} playbook updated!`)
      queryClient.invalidateQueries({ queryKey: ['playbook'] })
    },
    onError: (err: any) => {
      toast.error(`Error saving playbook: ${err.message}`)
      console.error(err)
    }
  })

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Agency Playbook" 
          description="Centralized standard operating procedures. AI uses this context to automatically structure new projects."
        />
      </div>

      <div className="px-8 pb-8 flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar */}
        <motion.div 
          className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2"
          variants={MOTION.stagger}
          initial="initial"
          animate="animate"
        >
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              variants={MOTION.listItem}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-left p-4 rounded-xl transition-colors border ${
                activeCategory === cat.id ? 'bg-primary/5 border-primary/20 shadow-sm' : 'border-transparent hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-primary' : ''}`} />
                <span className={`font-semibold ${activeCategory === cat.id ? 'text-primary' : ''}`}>{cat.id}</span>
              </div>
              <p className="text-xs opacity-80 pl-7">{cat.desc}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Editor */}
        <div className="flex-1 bg-card border rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b flex justify-between items-center bg-muted/10">
            <h3 className="font-semibold text-lg">{activeCategory} Guidelines</h3>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !content.trim()}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Playbook'}
            </Button>
          </div>
          <div className="flex-1 p-0">
            <textarea
              className="w-full h-full p-6 bg-transparent border-none resize-none focus:outline-none focus:ring-0 custom-scrollbar leading-relaxed"
              placeholder={`Write the standard operating procedures and guidelines for ${activeCategory}...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
