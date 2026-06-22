import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { proposals } from '../database/schema/generated'
import { clients } from '../database/schema/clients'
import { eq, desc } from 'drizzle-orm'

export function registerProposalHandlers() {
  ipcMain.handle('proposals:list', async () => {
    try {
      // Join with clients to get client name
      const result = await db
        .select({
          id: proposals.id,
          title: proposals.title,
          status: proposals.status,
          updatedAt: proposals.updatedAt,
          clientName: clients.name
        })
        .from(proposals)
        .leftJoin(clients, eq(proposals.clientId, clients.id))
        .orderBy(desc(proposals.updatedAt))
        
      return result
    } catch (error) {
      console.error('Failed to get proposals:', error)
      return []
    }
  })

  ipcMain.handle('proposals:create', async (_, data) => {
    try {
            const id = crypto.randomUUID()
      
      await db.insert(proposals).values({
        id,
        projectId: data.projectId,
        clientId: data.clientId,
        title: data.title,
        status: data.status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }).run()

      return { id, success: true }
    } catch (error) {
      console.error('Failed to create proposal:', error)
      throw error
    }
  })

  ipcMain.handle('proposals:delete', async (_, id: string) => {
    try {
      await db.update(proposals).set({ deletedAt: new Date() }).where(eq(proposals.id, id)).run()
      return true
    } catch (error) {
      console.error('Failed to delete proposal:', error)
      throw error
    }
  })
}
