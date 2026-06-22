import { ipcMain } from 'electron'
import { documentRepository } from '../repositories/documentRepository'
import { decisionRepository } from '../repositories/decisionRepository'
import { meetingRepository } from '../repositories/meetingRepository'

export function registerKnowledgeHandlers() {
  // Documents
  ipcMain.handle('documents:getByProject', (_, projectId: string) => {
    return documentRepository.findByProjectId(projectId)
  })
  ipcMain.handle('documents:create', (_, data) => {
    return documentRepository.create(data)
  })
  ipcMain.handle('documents:update', (_, { id, data }) => {
    return documentRepository.update(id, data)
  })

  // Decisions
  ipcMain.handle('decisions:list', () => {
    return decisionRepository.findAll()
  })
  ipcMain.handle('decisions:getByProject', (_, projectId: string) => {
    return decisionRepository.findByProjectId(projectId)
  })
  ipcMain.handle('decisions:create', (_, data) => {
    return decisionRepository.create(data)
  })

  // Meetings
  ipcMain.handle('meetings:list', () => {
    return meetingRepository.findAll()
  })
  ipcMain.handle('meetings:getByProject', (_, projectId: string) => {
    return meetingRepository.findByProjectId(projectId)
  })
  ipcMain.handle('meetings:create', (_, data) => {
    return meetingRepository.create(data)
  })
}
