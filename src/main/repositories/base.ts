import { db } from '../database/connection'
import { eq, isNull } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { SQLiteTable } from 'drizzle-orm/sqlite-core'

export class BaseRepository<T extends SQLiteTable> {
  constructor(protected table: T) {}

  protected get db() {
    return db
  }

  protected generateId() {
    return uuidv4()
  }

  protected getTimestamp() {
    return new Date()
  }
}
