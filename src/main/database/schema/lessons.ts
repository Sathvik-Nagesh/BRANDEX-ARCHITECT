import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  whatWentWell: text('what_went_well'),
  whatWentWrong: text('what_went_wrong'),
  delaysCause: text('delays_cause'),
  recommendations: text('recommendations'),
  createdAt: text('created_at').notNull()
})
