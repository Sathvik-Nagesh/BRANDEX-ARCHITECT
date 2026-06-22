import { ipcMain } from 'electron'
import { generateDemoData } from '../database/demo'
import { db } from '../database/connection'
import { clients } from '../database/schema/clients'
import { projects } from '../database/schema/projects'
import { features } from '../database/schema/features'
import { documents } from '../database/schema/documents'
import { invoices } from '../database/schema/invoices'
import { proposals } from '../database/schema/generated'
import { eq, desc, like, or } from 'drizzle-orm'

export function registerSystemHandlers() {
  ipcMain.handle('system:generateDemoData', () => {
    return generateDemoData()
  })

  ipcMain.handle('system:getDashboardStats', async () => {
    try {
      // Basic counts
      const clientsList = await db.select().from(clients)
      const projectsList = await db.select().from(projects)
      const featuresCount = (await db.select().from(features)).length
      const docsCount = (await db.select().from(documents)).length
      
      const invoicesList = await db.select().from(invoices)
      const proposalsList = await db.select().from(proposals)

      // BI Metrics Calculation
      const activeClients = clientsList.filter(c => c.status === 'active').length
      const activeProjectsCount = projectsList.filter(p => p.status === 'active').length
      const deliveredProjects = projectsList.filter(p => p.status === 'completed').length
      
      const proposalCount = proposalsList.length
      const wonProposals = proposalsList.filter(p => p.status === 'accepted').length
      const winRate = proposalCount > 0 ? Math.round((wonProposals / proposalCount) * 100) : 0

      const pendingInvoices = invoicesList.filter(i => i.status !== 'paid').length
      const totalRevenue = invoicesList.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
      
      // AMC Revenue (assuming AMC costs are stored somewhere, we'll mock it for now or rely on specific invoices)
      const amcRevenue = invoicesList.filter(i => i.status === 'paid' && i.terms?.toLowerCase().includes('amc')).reduce((sum, i) => sum + (i.total || 0), 0)

      // Get recent active projects
      const activeProjects = await db.select()
        .from(projects)
        .where(eq(projects.status, 'active'))
        .orderBy(desc(projects.updatedAt))
        .limit(5)

      // Recent docs
      const recentDocs = await db.select()
        .from(documents)
        .orderBy(desc(documents.updatedAt))
        .limit(5)

      return {
        stats: {
          clients: clientsList.length,
          projects: projectsList.length,
          features: featuresCount,
          documents: docsCount
        },
        bi: {
          activeClients,
          activeProjects: activeProjectsCount,
          deliveredProjects,
          proposalCount,
          pendingInvoices,
          amcRevenue,
          totalRevenue,
          winRate
        },
        activeProjects,
        recentDocs
      }
    } catch (e) {
      console.error(e)
      return null
    }
  })

  ipcMain.handle('system:search', async (_, query: string) => {
    try {
      if (!query || query.length < 2) return []

      const searchTerm = `%${query}%`
      const results: any[] = []

      // Search Clients
      const c = await db.select().from(clients).where(like(clients.name, searchTerm))
      c.forEach((item: any) => results.push({ id: item.id, title: item.name, type: 'client', snippet: item.industry }))

      // Search Projects
      const p = await db.select().from(projects).where(or(like(projects.name, searchTerm), like(projects.description, searchTerm)))
      p.forEach((item: any) => results.push({ id: item.id, title: item.name, type: 'project', snippet: item.description }))

      // Search Features
      const f = await db.select().from(features).where(like(features.title, searchTerm))
      f.forEach((item: any) => results.push({ id: item.id, title: item.title, type: 'feature', snippet: item.description }))

      // Search Documents
      const d = await db.select().from(documents).where(or(like(documents.title, searchTerm), like(documents.content, searchTerm)))
      d.forEach((item: any) => results.push({ id: item.id, title: item.title, type: 'document', snippet: item.content?.substring(0, 100) }))

      return results
    } catch (e) {
      console.error('Search failed:', e)
      return []
    }
  })
}
