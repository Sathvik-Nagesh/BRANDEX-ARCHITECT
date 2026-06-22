import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqlite } from './connection'
import * as path from 'path'
import { app } from 'electron'

export function runMigrations() {
  try {
    const isDev = !app.isPackaged
    // In dev, migrations are in the root drizzle folder. In prod, they should be in resources or bundled.
    // Assuming they are shipped alongside the app
    const migrationsFolder = isDev
      ? path.join(process.cwd(), 'drizzle')
      : path.join(process.resourcesPath, 'drizzle')

    console.log(`Running migrations from ${migrationsFolder}`)
    migrate(db, { migrationsFolder })
    console.log('Migrations completed successfully.')
  } catch (error) {
    console.error('Failed to run migrations', error)
    throw error
  }
}
