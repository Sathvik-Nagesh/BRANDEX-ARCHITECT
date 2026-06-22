import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'
import { features } from './features'

export const deliverables = sqliteTable('deliverables', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  featureId: text('feature_id').references(() => features.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  category: text('category'),
  status: text('status').default('Not Started'), // Not Started, In Progress, Review, Delivered
  dueDate: text('due_date'),
  createdAt: text('created_at').notNull()
})
