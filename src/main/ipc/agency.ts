import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { eq } from 'drizzle-orm'
import { project_templates, change_requests, playbook, deliverables, lessons, snapshots, projects } from '../database/schema'
import { v4 as uuidv4 } from 'uuid'

export function registerAgencyHandlers() {
  // --- PROJECT TEMPLATES ---
  ipcMain.handle('project_templates:list', async () => {
    return db.select().from(project_templates).all()
  })
  
  // --- CHANGE REQUESTS ---
  ipcMain.handle('change_requests:list', async (_, projectId: string) => {
    return db.select().from(change_requests).where(eq(change_requests.projectId, projectId)).all()
  })
  ipcMain.handle('change_requests:create', async (_, data: any) => {
    return db.insert(change_requests).values({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data
    }).returning().get()
  })
  
  // --- PLAYBOOK ---
  ipcMain.handle('playbook:list', async () => {
    return db.select().from(playbook).all()
  })
  ipcMain.handle('playbook:save', async (_, data: any) => {
    if (data.id) {
      return db.update(playbook).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(playbook.id, data.id)).returning().get()
    }
    
    // Prevent undefined 'id' from overwriting the uuidv4 generated id
    const { id, ...insertData } = data
    
    return db.insert(playbook).values({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...insertData
    }).returning().get()
  })
  
  // --- DELIVERABLES ---
  ipcMain.handle('deliverables:list', async (_, projectId: string) => {
    return db.select().from(deliverables).where(eq(deliverables.projectId, projectId)).all()
  })
  ipcMain.handle('deliverables:save', async (_, data: any) => {
    if (data.id) {
      return db.update(deliverables).set(data).where(eq(deliverables.id, data.id)).returning().get()
    }
    return db.insert(deliverables).values({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data
    }).returning().get()
  })
  
  // --- LESSONS LEARNED ---
  ipcMain.handle('lessons:list', async (_, projectId: string) => {
    return db.select().from(lessons).where(eq(lessons.projectId, projectId)).all()
  })
  ipcMain.handle('lessons:create', async (_, data: any) => {
    return db.insert(lessons).values({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data
    }).returning().get()
  })
  
  // --- SNAPSHOTS ---
  ipcMain.handle('snapshots:list', async (_, projectId: string) => {
    return db.select().from(snapshots).where(eq(snapshots.projectId, projectId)).all()
  })
  ipcMain.handle('snapshots:create', async (_, projectId: string, name: string) => {
    // Basic implementation: grab some project data and serialize it
    const project = db.select().from(projects).where(eq(projects.id, projectId)).get()
    const snapshotData = JSON.stringify(project) // Simple snapshot for now
    
    return db.insert(snapshots).values({
      id: uuidv4(),
      projectId,
      name,
      snapshotData,
      createdAt: new Date().toISOString()
    }).returning().get()
  })
}
