import { ipcMain } from 'electron'
import { clientRepository } from '../repositories/clientRepository'

export function registerClientHandlers() {
  ipcMain.handle('clients:list', () => {
    return clientRepository.findAll()
  })

  ipcMain.handle('clients:get', (_, id: string) => {
    return clientRepository.findById(id)
  })

  ipcMain.handle('clients:create', (_, data) => {
    return clientRepository.create(data)
  })

  ipcMain.handle('clients:update', (_, { id, data }) => {
    return clientRepository.update(id, data)
  })

  ipcMain.handle('clients:delete', (_, id: string) => {
    clientRepository.softDelete(id)
    return { success: true }
  })
}
