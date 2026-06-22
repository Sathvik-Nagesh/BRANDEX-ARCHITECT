import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { documents } from '../database/schema/documents'
import { decisions, memoryEntries } from '../database/schema/knowledge'
import { meetings } from '../database/schema/meetings'
import { eq, isNull, and } from 'drizzle-orm'
import crypto from 'crypto'

export function registerKnowledgeHandlers() {
  // Documents
  ipcMain.handle('documents:getByProject', (_, projectId: string) => {
    return db.select().from(documents).where(and(eq(documents.projectId, projectId), isNull(documents.deletedAt))).all()
  })
  ipcMain.handle('documents:create', (_, data) => {
    const id = crypto.randomUUID()
    const now = new Date()
    db.insert(documents).values({ ...data, id, createdAt: now, updatedAt: now }).run()
    return db.select().from(documents).where(eq(documents.id, id)).get()
  })
  ipcMain.handle('documents:update', (_, { id, data }) => {
    const now = new Date()
    db.update(documents).set({ ...data, updatedAt: now }).where(eq(documents.id, id)).run()
    return db.select().from(documents).where(eq(documents.id, id)).get()
  })

  // Decisions
  ipcMain.handle('decisions:list', () => {
    return db.select().from(decisions).where(isNull(decisions.deletedAt)).all()
  })
  ipcMain.handle('decisions:getByProject', (_, projectId: string) => {
    return db.select().from(decisions).where(and(eq(decisions.projectId, projectId), isNull(decisions.deletedAt))).all()
  })
  ipcMain.handle('decisions:create', (_, data) => {
    const id = crypto.randomUUID()
    const now = new Date()
    db.insert(decisions).values({ ...data, id, createdAt: now, updatedAt: now }).run()
    return db.select().from(decisions).where(eq(decisions.id, id)).get()
  })
  ipcMain.handle('decisions:delete', (_, id: string) => {
    db.update(decisions).set({ deletedAt: new Date() }).where(eq(decisions.id, id)).run()
    return true
  })

  // Meetings
  ipcMain.handle('meetings:list', () => {
    return db.select().from(meetings).where(isNull(meetings.deletedAt)).all()
  })
  ipcMain.handle('meetings:getByProject', (_, projectId: string) => {
    return db.select().from(meetings).where(and(eq(meetings.projectId, projectId), isNull(meetings.deletedAt))).all()
  })
  ipcMain.handle('meetings:create', (_, data) => {
    const id = crypto.randomUUID()
    const now = new Date()
    db.insert(meetings).values({ ...data, id, createdAt: now, updatedAt: now }).run()
    return db.select().from(meetings).where(eq(meetings.id, id)).get()
  })
  ipcMain.handle('meetings:delete', (_, id: string) => {
    db.update(meetings).set({ deletedAt: new Date() }).where(eq(meetings.id, id)).run()
    return true
  })
}
