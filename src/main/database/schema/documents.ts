import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'
import { features } from './features'

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  featureId: text('feature_id').references(() => features.id, { onDelete: 'set null' }), // Optional feature link
  type: text('type').notNull(), // prd, tdd, api-design, user-stories, etc.
  title: text('title').notNull(),
  currentVersionId: text('current_version_id'), // Set after a version is created
  status: text('status').notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})

export const documentVersions = sqliteTable('document_versions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  content: text('content').notNull(), // TipTap JSON or Markdown
  changeSummary: text('change_summary'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull() // Immutable
})
