import { ipcMain, dialog } from 'electron'
import { pdfEngine } from '../services/export/PdfEngine'
import { docxEngine } from '../services/export/DocxEngine'

export function registerExportHandlers() {
  ipcMain.handle('export:pdf', async (_, htmlContent: string, defaultName: string = 'Proposal.pdf') => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save PDF Export',
      defaultPath: defaultName,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    })

    if (canceled || !filePath) return null

    return pdfEngine.generatePdf(htmlContent, filePath)
  })

  ipcMain.handle('export:docx', async (_, sections: any[], defaultName: string = 'Proposal.docx') => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save DOCX Export',
      defaultPath: defaultName,
      filters: [{ name: 'Word Documents', extensions: ['docx'] }]
    })

    if (canceled || !filePath) return null

    return docxEngine.generateDocx(sections, filePath)
  })
}
