import { db } from '../../database/connection'
import { memoryEntries } from '../../database/schema/knowledge'
import { AIFactory } from '../ai'

export class MemoryEngine {
  /**
   * Process a new entity creation (Decision, Meeting, Document)
   * Automatically summarizes it and stores in memory_entries
   */
  async processEntityUpdate(projectId: string, entityType: string, content: string, title?: string) {
    try {
      const provider = await AIFactory.getActiveProvider()
      
      const prompt = `
      You are an AI Memory Engine for a project management system.
      Summarize the following ${entityType} for long-term project memory.
      Extract only the most crucial requirements, decisions, and context.
      Keep it under 3 sentences.
      
      Content:
      ${content}
      `
      
      const summary = await provider.generateText(prompt)
      
      const searchableText = `${title ? title + '\n' : ''}${summary}`

      db.insert(memoryEntries).values({
        id: crypto.randomUUID(),
        projectId,
        type: `${entityType}_summary`,
        content: content,
        summary: summary,
        searchableText: searchableText,
        createdAt: new Date(),
        updatedAt: new Date()
      }).run()

      return true
    } catch (error) {
      console.error('Failed to process memory entry:', error)
      return false
    }
  }

  // Future: Background task to re-summarize entire project state 
}

export const memoryEngine = new MemoryEngine()
