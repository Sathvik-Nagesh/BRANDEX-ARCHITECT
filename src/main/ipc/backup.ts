import { app, dialog, ipcMain, BrowserWindow } from 'electron'
import AdmZip from 'adm-zip'
import * as path from 'path'
import * as fs from 'fs'

export function registerBackupHandlers() {
  ipcMain.handle('backup:create', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window found')

      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Save Workspace Backup',
        defaultPath: `Brandex_Backup_${new Date().toISOString().split('T')[0]}.brandexbackup`,
        filters: [{ name: 'Brandex Backup', extensions: ['brandexbackup'] }]
      })

      if (canceled || !filePath) return { success: false, canceled: true }

      const userDataPath = app.getPath('userData')
      const zip = new AdmZip()

      // Add database files
      const dbFiles = ['brandex.db', 'brandex.db-wal', 'brandex.db-shm']
      dbFiles.forEach(file => {
        const fullPath = path.join(userDataPath, file)
        if (fs.existsSync(fullPath)) {
          zip.addLocalFile(fullPath)
        }
      })

      // Add assets folder if it exists
      const assetsPath = path.join(userDataPath, 'assets')
      if (fs.existsSync(assetsPath)) {
        zip.addLocalFolder(assetsPath, 'assets')
      }

      // Write zip to disk
      zip.writeZip(filePath)

      return { success: true, filePath }
    } catch (error) {
      console.error('Backup creation failed', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('backup:restore', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window found')

      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: 'Restore Workspace Backup',
        filters: [{ name: 'Brandex Backup', extensions: ['brandexbackup'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return { success: false, canceled: true }

      const filePath = filePaths[0]
      const userDataPath = app.getPath('userData')
      
      const zip = new AdmZip(filePath)
      
      // Before extraction, we should ideally close DB connections, but SQLite in WAL mode can handle being overwritten
      // if the application restarts immediately.
      
      // Extract all to userData path, overwriting existing
      zip.extractAllTo(userDataPath, true)

      // Restart app to load new database cleanly
      app.relaunch()
      app.exit(0)

      return { success: true }
    } catch (error) {
      console.error('Backup restoration failed', error)
      return { success: false, error: String(error) }
    }
  })
}
