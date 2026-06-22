import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { clients } from './clients'
import { projects } from './projects'

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  date: text('date').notNull(), // ISO Date string
  dueDate: text('due_date').notNull(), // ISO Date string
  currency: text('currency').notNull().default('INR'),
  status: text('status').notNull().default('Draft'), // Draft, Sent, Paid, Overdue, Cancelled
  notes: text('notes'),
  terms: text('terms'), // Compiled terms/clauses
  subtotal: real('subtotal').notNull().default(0),
  tax: real('tax').notNull().default(0),
  discount: real('discount').notNull().default(0),
  total: real('total').notNull().default(0),
  amountInWords: text('amount_in_words'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
})

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: real('quantity').notNull().default(1),
  rate: real('rate').notNull().default(0),
  amount: real('amount').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})
