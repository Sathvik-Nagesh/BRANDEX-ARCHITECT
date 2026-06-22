import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'

export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  decision: text('decision').notNull(),
  reason: text('reason').notNull(),
  alternatives: text('alternatives'),
  impact: text('impact'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})

export const memoryEntries = sqliteTable('memory_entries', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // project_summary, feature_summary, client_summary, decision_summary, meeting_summary
  content: text('content').notNull(),
  summary: text('summary'),
  searchableText: text('searchable_text').notNull(), // Plain text for FTS5 indexing
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})
