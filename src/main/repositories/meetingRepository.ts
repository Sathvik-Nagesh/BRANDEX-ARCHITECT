import { BaseRepository } from './base'
import { meetings } from '../database/schema/meetings'
import { eq, isNull, and } from 'drizzle-orm'
import { memoryEngine } from '../services/knowledge/MemoryEngine'

export type InsertMeeting = typeof meetings.$inferInsert
export type SelectMeeting = typeof meetings.$inferSelect

export class MeetingRepository extends BaseRepository<typeof meetings> {
  constructor() {
    super(meetings)
  }

  findAll(): SelectMeeting[] {
    return this.db.select().from(this.table).where(isNull(this.table.deletedAt)).all()
  }

  findByProjectId(projectId: string): SelectMeeting[] {
    return this.db.select().from(this.table).where(and(eq(this.table.projectId, projectId), isNull(this.table.deletedAt))).all()
  }

  create(data: Omit<InsertMeeting, 'id' | 'createdAt' | 'updatedAt'>): SelectMeeting {
    const now = this.getTimestamp()
    const id = this.generateId()
    
    this.db.insert(this.table).values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    }).run()

    // Trigger Memory Engine
    memoryEngine.processEntityUpdate(data.projectId, 'Meeting', data.rawContent, data.title)
    
    return this.db.select().from(this.table).where(eq(this.table.id, id)).get()!
  }
}

export const meetingRepository = new MeetingRepository()
