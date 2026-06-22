import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const clauses = sqliteTable('clauses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // Payment Terms, Scope Change Policy, etc.
  content: text('content').notNull(), // Markdown or rich text
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('Draft'), // Draft, Approved, Archived
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})

export const clauseVersions = sqliteTable('clause_versions', {
  id: text('id').primaryKey(),
  clauseId: text('clause_id').notNull().references(() => clauses.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  version: integer('version').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})
