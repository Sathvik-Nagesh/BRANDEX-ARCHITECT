import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { features } from '../database/schema/features'
import { eq, isNull, and } from 'drizzle-orm'
import crypto from 'crypto'

export function registerFeatureHandlers() {
  ipcMain.handle('features:list', () => {
    return db.select().from(features).where(isNull(features.deletedAt)).all()
  })

  ipcMain.handle('features:getByProject', (_, projectId: string) => {
    return db.select().from(features).where(and(eq(features.projectId, projectId), isNull(features.deletedAt))).all()
  })

  ipcMain.handle('features:get', (_, id: string) => {
    return db.select().from(features).where(eq(features.id, id)).get()
  })

  ipcMain.handle('features:create', (_, data) => {
    const id = crypto.randomUUID()
    const now = new Date()
    db.insert(features).values({ ...data, id, createdAt: now, updatedAt: now }).run()
    return db.select().from(features).where(eq(features.id, id)).get()
  })

  ipcMain.handle('features:update', (_, { id, data }) => {
    const now = new Date()
    db.update(features).set({ ...data, updatedAt: now }).where(eq(features.id, id)).run()
    return db.select().from(features).where(eq(features.id, id)).get()
  })

  ipcMain.handle('features:delete', (_, id: string) => {
    db.update(features).set({ deletedAt: new Date() }).where(eq(features.id, id)).run()
    return { success: true }
  })
}
