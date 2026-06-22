import React, { useState } from 'react'
import { Plus, Search, CheckSquare, Presentation, Printer, Sparkles } from 'lucide-react'
import { PageTransition } from '../components/shared/PageTransition'
import { PageHeader } from '../components/shared/PageHeader'
import { ActionableEmptyState } from '../components/shared/ActionableEmptyState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function Onboarding() {
  const [search, setSearch] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => window.brandexAPI?.projects.list() || []
  })

  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => window.brandexAPI?.clients.list() })
  const { data: features = [] } = useQuery({ queryKey: ['features'], queryFn: () => window.brandexAPI?.features.list() })

  const handleExportPDF = async (project: any) => {
    toast.loading('Generating Onboarding Package...')
    const client = clients.find((c:any) => c.id === project.clientId)
    const projectFeatures = features.filter((f:any) => f.projectId === project.id)

    const brandSettings = await window.brandexAPI?.settings.get('brand')
    const companySettings = await window.brandexAPI?.settings.get('company')
    const getS = (arr: any[], k: string) => arr?.find((s:any) => s.key === k)?.value || ''
    
    const logoUrl = getS(brandSettings, 'main_logo')
    const companyName = getS(companySettings, 'company_name')

    const html = `
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
          * { box-sizing: border-box; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
          .header img { max-height: 80px; margin-bottom: 20px; }
          .title { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
          .subtitle { font-size: 18px; color: #64748b; margin-top: 8px; }
          .section { margin-top: 40px; }
          .section-title { font-size: 20px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; color: #0f172a; }
          .info-grid { display: flex; flex-wrap: wrap; gap: 20px; background: #f8fafc; padding: 24px; border-radius: 12px; }
          .info-item { min-width: 200px; flex: 1; }
          .info-item h4 { margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
          .info-item p { margin: 0; font-size: 16px; font-weight: 600; color: #0f172a; }
          ul.feature-list { list-style: none; padding: 0; margin: 0; }
          ul.feature-list li { padding: 16px; background: #f8fafc; margin-bottom: 8px; border-radius: 8px; font-weight: 500; font-size: 14px; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" />` : `<h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">${companyName || 'Brandex'}</h1>`}
          <h2 class="title">Client Onboarding Package</h2>
          <p class="subtitle">Welcome to ${companyName || 'Brandex'}! Let's get started on ${project.name}.</p>
        </div>

        <div class="section">
          <div class="info-grid">
            <div class="info-item">
              <h4>Project Name</h4>
              <p>${project.name}</p>
            </div>
            <div class="info-item">
              <h4>Client</h4>
              <p>${client?.name || 'Unknown Client'}</p>
            </div>
            <div class="info-item">
              <h4>Status</h4>
              <p>${project.status}</p>
            </div>
            <div class="info-item">
              <h4>Start Date</h4>
              <p>${new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Project Scope & Features</h3>
          ${projectFeatures.length > 0 ? `
            <ul class="feature-list">
              ${projectFeatures.map((f:any) => `<li><strong>${f.title}</strong><br/><span style="color:#64748b; font-size: 12px;">${f.description || 'No description provided'}</span></li>`).join('')}
            </ul>
          ` : `<p style="color: #64748b;">No specific features mapped yet. We will finalize these during our discovery phase.</p>`}
        </div>

        <div class="section">
          <h3 class="section-title">Next Steps Checklist</h3>
          <ul class="feature-list" style="border-left-color: #10b981;">
            <li>✓ Review and sign the proposal and statement of work.</li>
            <li>✓ Pay the initial deposit invoice to secure your slot.</li>
            <li>✓ Complete the discovery questionnaire.</li>
            <li>✓ Schedule and attend the kickoff call.</li>
          </ul>
        </div>
      </body>
      </html>
    `

    try {
      const filePath = await window.brandexAPI?.export.pdf(html, `${project.name.replace(/\s+/g, '_')}_Onboarding.pdf`)
      toast.dismiss()
      if (filePath) {
        toast.success(`Saved to ${filePath}`)
      }
    } catch(e) {
      toast.dismiss()
      toast.error('Failed to export PDF')
    }
  }

  const headerActions = (
    <Button onClick={() => console.log('Generate Package')}>
      <Sparkles className="w-4 h-4 mr-2" />
      Auto-Generate Package
    </Button>
  )

  const filteredProjects = projects.filter((p: any) => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Onboarding Automation" 
          description="Generate client welcome packages, checklists, and process outlines instantly."
          actions={headerActions}
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-sm text-muted-foreground">Loading onboarding packages...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-12">
            <ActionableEmptyState
              icon={Presentation}
              title="No projects found"
              description="Create a project first to automatically generate a welcome package."
              primaryAction={{
                label: "Go to Projects",
                onClick: () => {},
                icon: Plus
              }}
            />
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search onboarding packages..." 
                  className="pl-9 bg-background"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((pkg: any) => (
                <div key={pkg.id} className="bg-card border rounded-xl p-5 card-hover transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Presentation className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{pkg.name} Onboarding</h3>
                        <p className="text-xs text-muted-foreground">Status: Active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between items-center text-sm mt-auto">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckSquare className="w-4 h-4" /> 5 Client Requirements
                    </span>
                    <Button variant="default" size="sm" onClick={() => handleExportPDF(pkg)}>
                      <Printer className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
