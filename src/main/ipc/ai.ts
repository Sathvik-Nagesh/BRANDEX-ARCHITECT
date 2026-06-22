import { ipcMain } from 'electron'
import { AIFactory } from '../services/ai'
import { db } from '../database/connection'
import { memoryEntries } from '../database/schema/knowledge'
import { eq, desc } from 'drizzle-orm'

export function registerAIHandlers() {
  ipcMain.handle('ai:chat', async (_, prompt: string, projectId?: string) => {
    try {
      const provider = await AIFactory.getActiveProvider()

      let context = ''
      if (projectId) {
        // Fetch project memory
        const memories = await db.select().from(memoryEntries)
          .where(eq(memoryEntries.projectId, projectId))
          .orderBy(desc(memoryEntries.createdAt))
          .limit(10)
        
        context = memories.map(m => `- ${m.entityType} ${m.action}: ${JSON.stringify(m.snapshot)}`).join('\n')
      }

      const fullPrompt = context 
        ? `Here is the relevant project context:\n${context}\n\nUser Prompt: ${prompt}`
        : prompt

      const response = await provider.generateText(fullPrompt)
      return response 
    } catch (error: any) {
      console.error('AI Chat failed:', error)
      return `❌ Failed to process AI request: ${error.message}`
    }
  })
}
