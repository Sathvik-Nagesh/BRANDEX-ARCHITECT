import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { clients } from '../database/schema/clients'
import { eq, isNull } from 'drizzle-orm'
import crypto from 'crypto'

export function registerClientHandlers() {
  ipcMain.handle('clients:list', () => {
    return db.select().from(clients).where(isNull(clients.deletedAt)).all()
  })

  ipcMain.handle('clients:get', (_, id: string) => {
    return db.select().from(clients).where(eq(clients.id, id)).get()
  })

  ipcMain.handle('clients:create', (_, data) => {
    const id = crypto.randomUUID()
    const now = new Date()
    db.insert(clients).values({ ...data, id, createdAt: now, updatedAt: now }).run()
    return db.select().from(clients).where(eq(clients.id, id)).get()
  })

  ipcMain.handle('clients:update', (_, { id, data }) => {
    const now = new Date()
    db.update(clients).set({ ...data, updatedAt: now }).where(eq(clients.id, id)).run()
    return db.select().from(clients).where(eq(clients.id, id)).get()
  })

  ipcMain.handle('clients:delete', (_, id: string) => {
    db.update(clients).set({ deletedAt: new Date() }).where(eq(clients.id, id)).run()
    return { success: true }
  })
}
