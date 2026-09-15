import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

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
    funnelSnapshot: text('funnel_snapshot'),
    snapshotResult: text('snapshot_result'),
    readinessSnapshot: text('readiness_snapshot'),
    submissionType: text('submission_type').notNull(),
    payloadHash: text('payload_hash'),
    consentSnapshot: text('consent_snapshot'),
    // Append-only submitted evidence; NULL on historical records (no backfill).
    submissionSnapshot: text('submission_snapshot'),
    journeyState: text('journey_state'),
    recoveryState: text('recovery_state'),
    ghlContactId: text('ghl_contact_id'),
    intakeSessionHash: text('intake_session_hash'),
    status: text('status').notNull().default('new'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('idx_growth_assessments_created_at').on(table.createdAt),
    index('idx_growth_assessments_email').on(table.email),
    index('idx_growth_assessments_recovery_journey').on(table.recoveryState, table.journeyState),
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
    intakeSessionHash: text('intake_session_hash'),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    claimedAt: integer('claimed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('idx_booking_handoffs_submission_id').on(table.submissionId),
    index('idx_booking_handoffs_expires_at').on(table.expiresAt),
  ],
)

export const intakeSessions = sqliteTable('intake_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_intake_sessions_expires_at').on(table.expiresAt)])

export const intakeContactGrants = sqliteTable('intake_contact_grants', {
  sessionHash: text('session_hash').notNull().references(() => intakeSessions.tokenHash, { onDelete: 'cascade' }),
  locationId: text('location_id').notNull(),
  contactId: text('contact_id').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
}, (table) => [primaryKey({ columns: [table.sessionHash, table.locationId, table.contactId] })])

// No backfill: only newly admitted events receive dispatch receipts.
export const websiteDispatchReceipts = sqliteTable('website_dispatch_receipts', {
  key: text('key').primaryKey(),
  submissionId: text('submission_id').notNull(),
  stage: text('stage').notNull(),
  channel: text('channel').notNull(),
  locationId: text('location_id').notNull(),
  contactId: text('contact_id'),
  opportunityId: text('opportunity_id'),
  state: text('state').notNull(),
  detail: text('detail'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, table => [index('idx_website_dispatch_submission').on(table.submissionId)])

// No expiring lease: an unknown external write outcome requires reconciliation.
export const websiteDispatchLocks = sqliteTable('website_dispatch_locks', {
  key: text('key').primaryKey(),
  receiptKey: text('receipt_key').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

// Creation receipts protect against lagging GHL search indexes across submissions.
// These mappings never confer an ownership grant by themselves.
export const websiteCreatedIdentities = sqliteTable('website_created_identities', {
  key: text('key').primaryKey(),
  contactId: text('contact_id').notNull(),
})

export const websiteVerifications = sqliteTable('website_verifications', {
  tokenHash: text('token_hash').primaryKey(),
  submissionId: text('submission_id').notNull(),
  requestSessionHash: text('request_session_hash').notNull(),
  contactId: text('contact_id').notNull(),
  locationId: text('location_id').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  state: text('state').notNull(),
  messageId: text('message_id'),
  claimedSessionHash: text('claimed_session_hash'),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, table => [uniqueIndex('idx_website_verification_submission_once').on(table.submissionId)])
