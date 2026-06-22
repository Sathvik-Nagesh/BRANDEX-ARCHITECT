import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const entityLinks = sqliteTable('entity_links', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull(),
  sourceType: text('source_type').notNull(), // 'project', 'feature', 'document', 'meeting', 'decision'
  targetId: text('target_id').notNull(),
  targetType: text('target_type').notNull(), // 'project', 'feature', 'document', 'meeting', 'decision'
  relationshipType: text('relationship_type').notNull().default('references'), // 'references', 'generates', 'blocks'
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})
