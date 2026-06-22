import { ipcMain } from 'electron'
import { featureRepository } from '../repositories/featureRepository'

export function registerFeatureHandlers() {
  ipcMain.handle('features:list', () => {
    return featureRepository.findAll()
  })

  ipcMain.handle('features:getByProject', (_, projectId: string) => {
    return featureRepository.findByProjectId(projectId)
  })

  ipcMain.handle('features:get', (_, id: string) => {
    return featureRepository.findById(id)
  })

  ipcMain.handle('features:create', (_, data) => {
    return featureRepository.create(data)
  })

  ipcMain.handle('features:update', (_, { id, data }) => {
    return featureRepository.update(id, data)
  })

  ipcMain.handle('features:delete', (_, id: string) => {
    featureRepository.softDelete(id)
    return { success: true }
  })
}
