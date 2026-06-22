import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Proposal, Onboarding, AMC, Legal
  content: text('content').notNull(), // HTML, Markdown or JSON for TipTap
  variables: text('variables'), // JSON array of required variables (e.g., ["client_name", "project_scope"])
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // Brand, Legal, Content, Media
  key: text('key').notNull().unique(), // e.g. "main_logo", "company_profile"
  value: text('value'), // Text content if applicable
  fileData: blob('file_data', { mode: 'buffer' }), // Binary file data for images/pdfs
  mimeType: text('mime_type'), // image/png, application/pdf, etc.
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})
