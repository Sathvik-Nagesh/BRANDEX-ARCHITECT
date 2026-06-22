import { BaseRepository } from './base'
import { clients } from '../database/schema/clients'
import { eq, isNull, and } from 'drizzle-orm'

export type InsertClient = typeof clients.$inferInsert
export type SelectClient = typeof clients.$inferSelect

export class ClientRepository extends BaseRepository<typeof clients> {
  constructor() {
    super(clients)
  }

  findAll(): SelectClient[] {
    return this.db.select().from(this.table).where(isNull(this.table.deletedAt)).all()
  }

  findById(id: string): SelectClient | undefined {
    return this.db.select().from(this.table).where(and(eq(this.table.id, id), isNull(this.table.deletedAt))).get()
  }

  create(data: Omit<InsertClient, 'id' | 'createdAt' | 'updatedAt'>): SelectClient {
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

  update(id: string, data: Partial<Omit<InsertClient, 'id' | 'createdAt' | 'updatedAt'>>): SelectClient | undefined {
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

export const clientRepository = new ClientRepository()
