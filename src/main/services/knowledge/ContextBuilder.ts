import { db } from '../../database/connection'
import { memoryEntries, decisions } from '../../database/schema/knowledge'
import { documents } from '../../database/schema/documents'
import { meetings } from '../../database/schema/meetings'
import { eq, desc } from 'drizzle-orm'

export class ContextBuilder {
  /**
   * Automatically gathers the project's historical context to inject into AI prompts.
   */
  async buildProjectContext(projectId: string): Promise<string> {
    try {
      // 1. Get Project Summaries
      const memories = db.select()
        .from(memoryEntries)
        .where(eq(memoryEntries.projectId, projectId))
        .orderBy(desc(memoryEntries.createdAt))
        .limit(10)
        .all()

      // 2. Get Recent Decisions
      const recentDecisions = db.select()
        .from(decisions)
        .where(eq(decisions.projectId, projectId))
        .orderBy(desc(decisions.createdAt))
        .limit(5)
        .all()

      // Build context package
      let context = '--- PROJECT CONTEXT PACKAGE ---\n\n'
      
      if (memories.length > 0) {
        context += 'RECENT MEMORY SUMMARY:\n'
        memories.forEach(m => {
          context += `- [${m.type}] ${m.summary}\n`
        })
        context += '\n'
      }

      if (recentDecisions.length > 0) {
        context += 'RECENT DECISIONS:\n'
        recentDecisions.forEach(d => {
          context += `- ${d.decision} (Reason: ${d.reason})\n`
        })
        context += '\n'
      }

      context += '-------------------------------\n'
      
      return context
    } catch (error) {
      console.error('Failed to build project context:', error)
      return '' // Return empty context on failure rather than blocking
    }
  }
}

export const contextBuilder = new ContextBuilder()
