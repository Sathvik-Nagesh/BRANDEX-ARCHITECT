import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { projects } from '../database/schema/projects'
import { eq } from 'drizzle-orm'
import { projectRepository } from '../repositories/projectRepository'
import { healthEngine } from '../services/health/ProjectHealth'

export function registerProjectHandlers() {
  ipcMain.handle('projects:list', () => {
    return projectRepository.findAll()
  })

  ipcMain.handle('projects:getByClient', (_, clientId: string) => {
    return projectRepository.findByClientId(clientId)
  })

  ipcMain.handle('projects:get', (_, id: string) => {
    return projectRepository.findById(id)
  })

  ipcMain.handle('projects:create', (_, data: any) => {
    return projectRepository.create(data)
  })

  ipcMain.handle('projects:update', (_, { id, data }: { id: string; data: any }) => {
    return projectRepository.update(id, data)
  })

  ipcMain.handle('projects:delete', async (_, id: string) => {
    try {
      await db.delete(projects).where(eq(projects.id, id)).run()
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  })

  ipcMain.handle('projects:getHealth', async (_, id: string) => {
    return await healthEngine.evaluateProject(id)
  })
}
