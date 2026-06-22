import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'

export const change_requests = sqliteTable('change_requests', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requestedBy: text('requested_by'),
  reason: text('reason'),
  impactAnalysis: text('impact_analysis'),
  costImpact: real('cost_impact').default(0),
  timelineImpactHours: integer('timeline_impact_hours').default(0),
  riskLevel: text('risk_level'),
  status: text('status').default('Draft'), // Draft, Pending Review, Approved, Rejected, Implemented
  createdAt: text('created_at').notNull()
})
