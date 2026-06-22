import { BaseRepository } from './base'
import { decisions } from '../database/schema/knowledge'
import { eq, isNull, and } from 'drizzle-orm'
import { memoryEngine } from '../services/knowledge/MemoryEngine'

export type InsertDecision = typeof decisions.$inferInsert
export type SelectDecision = typeof decisions.$inferSelect

export class DecisionRepository extends BaseRepository<typeof decisions> {
  constructor() {
    super(decisions)
  }

  findAll(): SelectDecision[] {
    return this.db.select().from(this.table).where(isNull(this.table.deletedAt)).all()
  }

  findByProjectId(projectId: string): SelectDecision[] {
    return this.db.select().from(this.table).where(and(eq(this.table.projectId, projectId), isNull(this.table.deletedAt))).all()
  }

  create(data: Omit<InsertDecision, 'id' | 'createdAt' | 'updatedAt'>): SelectDecision {
    const now = this.getTimestamp()
    const id = this.generateId()
    
    this.db.insert(this.table).values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    }).run()

    // Trigger Memory Engine asynchronously
    memoryEngine.processEntityUpdate(data.projectId, 'Decision', `Decision: ${data.decision}. Reason: ${data.reason}`)
    
    return this.db.select().from(this.table).where(eq(this.table.id, id)).get()!
  }
}

export const decisionRepository = new DecisionRepository()
