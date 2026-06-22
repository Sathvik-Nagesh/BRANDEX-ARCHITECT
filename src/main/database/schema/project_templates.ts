import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const project_templates = sqliteTable('project_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  features_json: text('features_json'),
  deliverables_json: text('deliverables_json'),
  tasks_json: text('tasks_json'),
  createdAt: text('created_at').notNull()
})
