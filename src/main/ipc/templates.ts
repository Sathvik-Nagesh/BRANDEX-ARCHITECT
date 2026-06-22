import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { templates } from '../database/schema/templates'
import { eq, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export function registerTemplateHandlers() {
  ipcMain.handle('templates:list', async () => {
    return await db.select().from(templates).orderBy(desc(templates.updatedAt))
  })

  ipcMain.handle('templates:get', async (_, id: string) => {
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1)
    return result[0] || null
  })

  ipcMain.handle('templates:create', async (_, data: any) => {
    const id = uuidv4()
    const now = new Date()
    await db.insert(templates).values({
      id,
      name: data.name,
      type: data.type,
      content: data.content || '',
      variables: data.variables ? JSON.stringify(data.variables) : null,
      createdAt: now,
      updatedAt: now
    }).run()
    
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1)
    return result[0]
  })

  ipcMain.handle('templates:update', async (_, id: string, data: any) => {
    await db.update(templates).set({
      name: data.name,
      type: data.type,
      content: data.content,
      variables: data.variables ? JSON.stringify(data.variables) : null,
      updatedAt: new Date()
    }).where(eq(templates.id, id)).run()
    
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1)
    return result[0]
  })

  ipcMain.handle('templates:delete', async (_, id: string) => {
    await db.delete(templates).where(eq(templates.id, id)).run()
    return true
  })
}
