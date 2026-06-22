import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { systemSettings } from '../database/schema/system'
import { eq, and } from 'drizzle-orm'

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', async (_, category: string, key?: string) => {
    try {
      if (key) {
        const result = await db.select().from(systemSettings).where(
          and(eq(systemSettings.category, category), eq(systemSettings.key, key))
        ).limit(1)
        return result[0] || null
      } else {
        return await db.select().from(systemSettings).where(eq(systemSettings.category, category))
      }
    } catch (error) {
      console.error('Failed to get settings:', error)
      return null
    }
  })

  ipcMain.handle('settings:set', async (_, category: string, key: string, value: any) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      const existing = await db.select().from(systemSettings).where(
        and(eq(systemSettings.category, category), eq(systemSettings.key, key))
      ).limit(1)

      if (existing.length > 0) {
        await db.update(systemSettings).set({
          value: stringValue,
          updatedAt: new Date()
        }).where(eq(systemSettings.id, existing[0].id)).run()
      } else {
        await db.insert(systemSettings).values({
          id: crypto.randomUUID(),
          category,
          key,
          value: stringValue,
          createdAt: new Date(),
          updatedAt: new Date()
        }).run()
      }
      return true
    } catch (error) {
      console.error('Failed to set settings:', error)
      return false
    }
  })
}
