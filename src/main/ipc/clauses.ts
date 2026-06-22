import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { eq, desc } from 'drizzle-orm'
import { clauses, clauseVersions } from '../database/schema/clauses'

export function registerClauseHandlers() {
  ipcMain.handle('clauses:list', async () => {
    return await db.select().from(clauses).orderBy(desc(clauses.updatedAt))
  })

  ipcMain.handle('clauses:get', async (_, id: string) => {
    const list = await db.select().from(clauses).where(eq(clauses.id, id))
    return list[0] || null
  })

  ipcMain.handle('clauses:create', async (_, data: any) => {
    const newClause = {
      ...data,
      id: crypto.randomUUID(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    db.transaction((tx) => {
      tx.insert(clauses).values(newClause).run()
      tx.insert(clauseVersions).values({
        id: crypto.randomUUID(),
        clauseId: newClause.id,
        content: newClause.content,
        version: 1,
        createdAt: new Date()
      }).run()
    })

    return newClause
  })

  ipcMain.handle('clauses:update', async (_, { id, data }: { id: string, data: any }) => {
    const existing = await db.select().from(clauses).where(eq(clauses.id, id))
    if (!existing.length) throw new Error('Clause not found')

    const newVersionNum = existing[0].version + 1

    const updated = {
      ...data,
      version: newVersionNum,
      updatedAt: new Date()
    }

    db.transaction((tx) => {
      tx.update(clauses).set(updated).where(eq(clauses.id, id)).run()
      tx.insert(clauseVersions).values({
        id: crypto.randomUUID(),
        clauseId: id,
        content: updated.content || existing[0].content,
        version: newVersionNum,
        createdAt: new Date()
      }).run()
    })

    return { ...existing[0], ...updated }
  })

  ipcMain.handle('clauses:delete', async (_, id: string) => {
    await db.delete(clauses).where(eq(clauses.id, id))
    return { success: true }
  })
}
