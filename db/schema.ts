import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const growthAssessments = sqliteTable(
  'growth_assessments',
  {
    id: text('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    businessName: text('business_name').notNull(),
    industry: text('industry').notNull(),
    annualRevenue: text('annual_revenue'),
    biggestChallenge: text('biggest_challenge'),
    currentMarketing: text('current_marketing'),
    monthlyBudget: text('monthly_budget'),
    submissionType: text('submission_type').notNull(),
    status: text('status').notNull().default('new'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('idx_growth_assessments_created_at').on(table.createdAt),
    index('idx_growth_assessments_email').on(table.email),
  ],
)

export const supportRequests = sqliteTable(
  'support_requests',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    status: text('status').notNull().default('new'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('idx_support_requests_created_at').on(table.createdAt)],
)
