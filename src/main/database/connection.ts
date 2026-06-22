import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import * as path from 'path'
import * as schema from './schema'
import * as fs from 'fs'

// Setup database path inside the user data directory
let dbPath = 'brandex.db'
if (app) {
  const userDataPath = app.getPath('userData')
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }
  dbPath = path.join(userDataPath, 'brandex.db')
}

// Initialize SQLite connection
const sqlite = new Database(dbPath)

// Performance optimizations for SQLite
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('synchronous = NORMAL')
sqlite.pragma('foreign_keys = ON')

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema })

// Function to initialize FTS5 table if it doesn't exist
export function initFTS() {
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
      content,
      type UNINDEXED,
      project_id UNINDEXED,
      entity_id UNINDEXED,
      tokenize='porter unicode61'
    );
  `)
}

// Initialize FTS on startup
initFTS()

export { sqlite }
