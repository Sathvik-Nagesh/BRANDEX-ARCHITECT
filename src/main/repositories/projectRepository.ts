import { BaseRepository } from './base'
import { projects } from '../database/schema/projects'
import { eq, isNull, and } from 'drizzle-orm'

export type InsertProject = typeof projects.$inferInsert
export type SelectProject = typeof projects.$inferSelect

export class ProjectRepository extends BaseRepository<typeof projects> {
  constructor() {
    super(projects)
  }

  findAll(): SelectProject[] {
    return this.db.select().from(this.table).where(isNull(this.table.deletedAt)).all()
  }

  findByClientId(clientId: string): SelectProject[] {
    return this.db.select().from(this.table).where(and(eq(this.table.clientId, clientId), isNull(this.table.deletedAt))).all()
  }

  findById(id: string): SelectProject | undefined {
    return this.db.select().from(this.table).where(and(eq(this.table.id, id), isNull(this.table.deletedAt))).get()
  }

  create(data: Omit<InsertProject, 'id' | 'createdAt' | 'updatedAt'>): SelectProject {
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

  update(id: string, data: Partial<Omit<InsertProject, 'id' | 'createdAt' | 'updatedAt'>>): SelectProject | undefined {
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

export const projectRepository = new ProjectRepository()
