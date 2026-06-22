import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import * as fs from 'fs'

export class DocxEngine {
  /**
   * Generates a native, editable Microsoft Word document for client review.
   */
  async generateDocx(sections: Array<{ heading: string, content: string }>, outputPath: string): Promise<string> {
    try {
      // Convert abstract sections into docx elements
      const children: any[] = []

      sections.forEach(section => {
        // Add Header
        children.push(
          new Paragraph({
            text: section.heading,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          })
        )

        // Add Content (simplified text-split for now, can be expanded to parse HTML/TipTap JSON)
        const paragraphs = section.content.split('\n\n')
        paragraphs.forEach(p => {
          if (p.trim()) {
            children.push(
              new Paragraph({
                children: [new TextRun(p.trim())],
                spacing: { after: 200 }
              })
            )
          }
        })
      })

      const doc = new Document({
        sections: [{
          properties: {},
          children
        }]
      })

      const buffer = await Packer.toBuffer(doc)
      fs.writeFileSync(outputPath, buffer)

      return outputPath
    } catch (error) {
      console.error('Failed to generate DOCX', error)
      throw error
    }
  }
}

export const docxEngine = new DocxEngine()
