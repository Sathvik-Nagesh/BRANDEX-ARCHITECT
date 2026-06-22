import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const playbook = sqliteTable('playbook', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // Sales, PM, Development, Design, QA, Deployment
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})
