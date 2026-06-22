import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'

export const snapshots = sqliteTable('snapshots', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  snapshotData: text('snapshot_data').notNull(), // JSON string
  createdAt: text('created_at').notNull()
})
