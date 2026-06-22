import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const caseStudies = sqliteTable('case_studies', {
  id: text('id').primaryKey(),
  projectName: text('project_name').notNull(),
  industry: text('industry').notNull(),
  challenge: text('challenge').notNull(),
  solution: text('solution').notNull(),
  results: text('results').notNull(), // JSON array of stats/results
  screenshots: text('screenshots'), // JSON array of paths
  links: text('links'), // JSON array of URLs
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})
