import { BaseRepository } from './base'
import { documents } from '../database/schema/documents'
import { eq, isNull, and } from 'drizzle-orm'

export type InsertDocument = typeof documents.$inferInsert
export type SelectDocument = typeof documents.$inferSelect

export class DocumentRepository extends BaseRepository<typeof documents> {
  constructor() {
    super(documents)
  }

  findByProjectId(projectId: string): SelectDocument[] {
    return this.db.select().from(this.table).where(and(eq(this.table.projectId, projectId), isNull(this.table.deletedAt))).all()
  }

  findById(id: string): SelectDocument | undefined {
    return this.db.select().from(this.table).where(and(eq(this.table.id, id), isNull(this.table.deletedAt))).get()
  }

  create(data: Omit<InsertDocument, 'id' | 'createdAt' | 'updatedAt'>): SelectDocument {
    const now = this.getTimestamp()
    const id = this.generateId()
    
    this.db.insert(this.table).values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    }).run()
    
    return this.findById(id)!
  }

  update(id: string, data: Partial<Omit<InsertDocument, 'id' | 'createdAt' | 'updatedAt'>>): SelectDocument | undefined {
    this.db.update(this.table).set({
      ...data,
      updatedAt: this.getTimestamp()
    }).where(eq(this.table.id, id)).run()
    
    return this.findById(id)
  }
}

export const documentRepository = new DocumentRepository()
