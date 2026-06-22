import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { projects } from './projects'
import { clients } from './clients'

export const proposals = sqliteTable('proposals', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'), // draft, sent, accepted, rejected
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})

export const proposalSections = sqliteTable('proposal_sections', {
  id: text('id').primaryKey(),
  proposalId: text('proposal_id').notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  sectionType: text('section_type').notNull(), // About, Scope, Timeline, Pricing
  title: text('title').notNull(),
  content: text('content').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})

export const onboardingPackages = sqliteTable('onboarding_packages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' })
})

export const onboardingSections = sqliteTable('onboarding_sections', {
  id: text('id').primaryKey(),
  packageId: text('package_id').notNull().references(() => onboardingPackages.id, { onDelete: 'cascade' }),
  sectionType: text('section_type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})
