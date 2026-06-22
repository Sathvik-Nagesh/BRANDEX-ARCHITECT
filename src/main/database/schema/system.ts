import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(), // UUID
  key: text('key').notNull().unique(), // e.g. "theme", "ai_config", "company_info"
  category: text('category').notNull(), // 'general', 'theme', 'ai', 'company', 'brand_assets', 'document_defaults', 'export', 'feature_flags'
  value: text('value').notNull(), // JSON string payload
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})
