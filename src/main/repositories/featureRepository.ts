import { BaseRepository } from '../repositories/base'
import { features } from '../database/schema/features'
import { eq, isNull, and } from 'drizzle-orm'

export type InsertFeature = typeof features.$inferInsert
export type SelectFeature = typeof features.$inferSelect

export class FeatureRepository extends BaseRepository<typeof features> {
  constructor() {
    super(features)
  }

  findAll(): SelectFeature[] {
    return this.db.select().from(this.table).where(isNull(this.table.deletedAt)).all()
  }

  findByProjectId(projectId: string): SelectFeature[] {
    return this.db.select().from(this.table).where(and(eq(this.table.projectId, projectId), isNull(this.table.deletedAt))).all()
  }

  findById(id: string): SelectFeature | undefined {
    return this.db.select().from(this.table).where(and(eq(this.table.id, id), isNull(this.table.deletedAt))).get()
  }

  create(data: Omit<InsertFeature, 'id' | 'createdAt' | 'updatedAt'>): SelectFeature {
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

  update(id: string, data: Partial<Omit<InsertFeature, 'id' | 'createdAt' | 'updatedAt'>>): SelectFeature | undefined {
    this.db.update(this.table).set({
      ...data,
      updatedAt: this.getTimestamp()
    }).where(eq(this.table.id, id)).run()
    
    return this.findById(id)
  }

  softDelete(id: string): void {
    this.db.update(this.table).set({
      deletedAt: this.getTimestamp()
    }).where(eq(this.table.id, id)).run()
  }
}

export const featureRepository = new FeatureRepository()
