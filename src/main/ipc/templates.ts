import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { templates } from '../database/schema/templates'
import { eq, desc } from 'drizzle-orm'

export function registerTemplateHandlers() {
  ipcMain.handle('templates:list', async () => {
    let result = await db.select().from(templates).orderBy(desc(templates.updatedAt))
    
    // Auto-seed if empty
    if (result.length === 0) {
      const now = new Date()
      const premiumTemplates = [
        {
          id: crypto.randomUUID(),
          name: 'Strategic Discovery Report',
          type: 'Report',
          variables: JSON.stringify(['client_name', 'project_name', 'target_audience']),
          content: `<div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto;"><h1 style="color: #0f172a; font-size: 36px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px;">Strategic Discovery Report</h1><p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">Prepared for <strong>{{client_name}}</strong> | Project: <strong>{{project_name}}</strong></p></div>`,
          createdAt: now,
          updatedAt: now
        },
        {
          id: crypto.randomUUID(),
          name: 'Technical Architecture SOW',
          type: 'SOW',
          variables: JSON.stringify(['client_name', 'project_name']),
          content: `<div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto;"><h1 style="color: #0f172a; font-size: 36px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px;">Statement of Work (SOW)</h1><p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">Technical Implementation for <strong>{{project_name}}</strong></p></div>`,
          createdAt: now,
          updatedAt: now
        }
      ]
      for (const t of premiumTemplates) {
        await db.insert(templates).values(t).run()
      }
      result = await db.select().from(templates).orderBy(desc(templates.updatedAt))
    }
    
    return result
  })

  ipcMain.handle('templates:get', async (_, id: string) => {
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1)
    return result[0] || null
  })

  ipcMain.handle('templates:create', async (_, data: any) => {
    const id = crypto.randomUUID()
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

  ipcMain.handle('templates:update', async (_, { id, data }: { id: string, data: any }) => {
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
