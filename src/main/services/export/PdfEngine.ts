import { BrowserWindow } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

export class PdfEngine {
  /**
   * Generates a high-quality, print-ready PDF using Electron's native printToPDF.
   * Renders the HTML directly to avoid external puppeteer dependencies.
   */
  async generatePdf(htmlContent: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a hidden browser window for rendering
      const win = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      // Load a minimal HTML wrapper around the provided content
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @page { margin: 2cm; }
              body { font-family: 'Inter', system-ui, sans-serif; -webkit-print-color-adjust: exact; }
              /* Inject Tailwind typography styles manually or link to a built css file here */
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `

      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`)

      win.webContents.on('did-finish-load', async () => {
        try {
          const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: { marginType: 'default' }
          })
          
          fs.writeFileSync(outputPath, pdfData)
          win.close()
          resolve(outputPath)
        } catch (error) {
          win.close()
          reject(error)
        }
      })
    })
  }
}

export const pdfEngine = new PdfEngine()
