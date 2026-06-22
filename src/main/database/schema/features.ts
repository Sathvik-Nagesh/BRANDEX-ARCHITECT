import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'

export const features = sqliteTable('features', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'), // draft, review, approved, building, testing, released
  priority: text('priority').notNull().default('medium'), // low, medium, high, critical
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})

export const featureVersions = sqliteTable('feature_versions', {
  id: text('id').primaryKey(),
  featureId: text('feature_id').notNull().references(() => features.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  changes: text('changes'), // Change summary
  snapshot: text('snapshot').notNull(), // JSON serialization of the feature state at this version
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull() // Immutable
})
