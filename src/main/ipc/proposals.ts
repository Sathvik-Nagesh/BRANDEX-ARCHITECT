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
      const { v4: uuidv4 } = require('uuid')
      const id = uuidv4()
      
      await db.insert(proposals).values({
        id,
        clientId: data.clientId,
        title: data.title,
        status: data.status || 'Draft',
        content: data.content || '',
        amount: data.amount || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }).run()

      return { id, success: true }
    } catch (error) {
      console.error('Failed to create proposal:', error)
      throw error
    }
  })
}
