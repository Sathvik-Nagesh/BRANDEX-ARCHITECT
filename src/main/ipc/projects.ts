import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { projects } from '../database/schema/projects'
import { eq, isNull, and } from 'drizzle-orm'
import crypto from 'crypto'
import { evaluateProject } from '../services/health/ProjectHealth'

export function registerProjectHandlers() {
  ipcMain.handle('projects:list', () => {
    return db.select().from(projects).where(isNull(projects.deletedAt)).all()
  })

  ipcMain.handle('projects:getByClient', (_, clientId: string) => {
    return db.select().from(projects).where(and(eq(projects.clientId, clientId), isNull(projects.deletedAt))).all()
  })

  ipcMain.handle('projects:get', (_, id: string) => {
    return db.select().from(projects).where(eq(projects.id, id)).get()
  })

  ipcMain.handle('projects:create', (_, data: any) => {
    const id = crypto.randomUUID()
    const now = new Date()
    db.insert(projects).values({ ...data, id, createdAt: now, updatedAt: now }).run()
    return db.select().from(projects).where(eq(projects.id, id)).get()
  })

  ipcMain.handle('projects:update', (_, { id, data }: { id: string; data: any }) => {
    const now = new Date()
    db.update(projects).set({ ...data, updatedAt: now }).where(eq(projects.id, id)).run()
    return db.select().from(projects).where(eq(projects.id, id)).get()
  })

  ipcMain.handle('projects:delete', async (_, id: string) => {
    try {
      await db.update(projects).set({ deletedAt: new Date() }).where(eq(projects.id, id)).run()
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  })

  ipcMain.handle('projects:getHealth', async (_, id: string) => {
    return await evaluateProject(id)
  })
}
