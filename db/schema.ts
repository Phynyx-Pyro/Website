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
    payloadHash: text('payload_hash'),
    ghlContactId: text('ghl_contact_id'),
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
    payloadHash: text('payload_hash'),
    status: text('status').notNull().default('new'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('idx_support_requests_created_at').on(table.createdAt)],
)

export const publicFormRateLimits = sqliteTable(
  'public_form_rate_limits',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('idx_public_form_rate_limits_expires_at').on(table.expiresAt)],
)

export const bookingHandoffs = sqliteTable(
  'booking_handoffs',
  {
    tokenHash: text('token_hash').primaryKey(),
    submissionId: text('submission_id').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    claimedAt: integer('claimed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('idx_booking_handoffs_submission_id').on(table.submissionId),
    index('idx_booking_handoffs_expires_at').on(table.expiresAt),
  ],
)
