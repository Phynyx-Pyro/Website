import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../app/api/growth-assessment/route.ts', import.meta.url)

function awaitedQuery(returningRows = []) {
  const promise = Promise.resolve()
  return {
    returning: async () => returningRows,
    then: promise.then.bind(promise),
  }
}

function createDb(existing) {
  const updateCalls = []
  return {
    updateCalls,
    db: {
      insert: () => ({
        values: () => ({
          onConflictDoNothing: () => ({ returning: async () => [] }),
        }),
      }),
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => [existing] }),
        }),
      }),
      update: () => ({
        set: (values) => ({
          where: () => {
            updateCalls.push(values)
            return awaitedQuery([{ id: existing.id }])
          },
        }),
      }),
    },
  }
}

async function loadRoute(stubs) {
  globalThis.__CONSENT_MODULE__ = await importTypeScriptModule(new URL('../lib/contact-consent.ts', import.meta.url))
  globalThis.__GROWTH_ROUTE_TEST_STUBS__ = stubs
  return importTypeScriptModule(moduleUrl, [
    ["import { CONSENT_VERSION, CONSENT_DISCLOSURES, parseContactConsent } from '@/lib/contact-consent'", 'const { CONSENT_VERSION, CONSENT_DISCLOSURES, parseContactConsent } = globalThis.__CONSENT_MODULE__'],
    [
      "import { getDb } from '@/db'",
      'const { getDb } = globalThis.__GROWTH_ROUTE_TEST_STUBS__',
    ],
    [
      "import { growthAssessments } from '@/db/schema'",
      'const { growthAssessments } = globalThis.__GROWTH_ROUTE_TEST_STUBS__',
    ],
    [
      "import { issueBookingSession } from '@/lib/booking-session'",
      'const { issueBookingSession } = globalThis.__GROWTH_ROUTE_TEST_STUBS__',
    ],
    [
      `import {
  GhlIdentityConflictError,
  isGhlContactNotFoundError,
  resolveGrowthAssessmentContact,
  syncGrowthAssessmentMetadata,
} from '@/lib/ghl'`,
      `const {
  GhlIdentityConflictError,
  isGhlContactNotFoundError,
  resolveGrowthAssessmentContact,
  syncGrowthAssessmentMetadata,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      "import { assessGrowthFit, type FitAssessment } from '@/lib/growth-assessment'",
      'const { assessGrowthFit } = globalThis.__GROWTH_ROUTE_TEST_STUBS__',
    ],
    [
      `import {
  calculateGrowthSnapshot,
  parseGrowthSnapshotInput,
  type GrowthSnapshotResult,
} from '@/lib/growth-snapshot'`,
      `const {
  calculateGrowthSnapshot,
  parseGrowthSnapshotInput,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      `import {
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
} from '@/lib/assessment-attribution'`,
      `const {
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      `import {
  PublicFormError,
  canonicalPayloadHashInput,
  enforcePublicFormRateLimit,
  hashText,
  normalizePhone,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'`,
      `const {
  PublicFormError,
  canonicalPayloadHashInput,
  enforcePublicFormRateLimit,
  hashText,
  normalizePhone,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      "import { and, eq } from 'drizzle-orm'",
      'const { and, eq } = globalThis.__GROWTH_ROUTE_TEST_STUBS__',
    ],
  ])
}

test.afterEach(() => {
  delete globalThis.__GROWTH_ROUTE_TEST_STUBS__
})

test('a retry keeps its original submission time and recovers one stale contact ID', async () => {
  const submissionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  const originalCreatedAt = new Date('2026-08-01T12:34:56.789Z')
  const existing = {
    id: submissionId,
    payloadHash: 'matching-payload-hash',
    ghlContactId: 'stale-contact',
    status: 'crm-metadata-failed',
    annualRevenue: '500k-1m',
    monthlyBudget: '3k-5k',
    createdAt: originalCreatedAt,
    updatedAt: new Date('2026-08-01T12:35:00.000Z'),
  }
  const { db, updateCalls } = createDb(existing)
  const syncCalls = []
  const resolveCalls = []
  const staleContactError = new Error('stale contact')

  class GhlIdentityConflictError extends Error {}
  class PublicFormError extends Error {
    constructor(status, code, message) {
      super(message)
      this.status = status
      this.code = code
    }
  }

  const { POST } = await loadRoute({
    getDb: () => db,
    growthAssessments: new Proxy({}, { get: (_target, property) => property }),
    issueBookingSession: async () => 'booking-session=test; Path=/',
    GhlIdentityConflictError,
    isGhlContactNotFoundError: (error, contactId) =>
      error === staleContactError && contactId === 'stale-contact',
    resolveGrowthAssessmentContact: async (input) => {
      resolveCalls.push(input)
      return { contactId: 'replacement-contact', isNew: false }
    },
    syncGrowthAssessmentMetadata: async (contactId, input) => {
      syncCalls.push({ contactId, input })
      if (contactId === 'stale-contact') throw staleContactError
    },
    assessGrowthFit: () => ({
      path: 'calendar',
      tier: 'ready-now',
      tag: 'fit-ready-now',
      score: 7,
      summary: 'Qualified by test rules.',
    }),
    parseGrowthSnapshotInput: (value) => value,
    calculateGrowthSnapshot: () => ({ trackedCoreMetrics: 6 }),
    minimizeAttributionUrl: (value) => value,
    normalizeAssessmentCtaOrigin: (value) => value,
    PublicFormError,
    canonicalPayloadHashInput: () => 'canonical-payload',
    enforcePublicFormRateLimit: async () => {},
    hashText: async () => 'matching-payload-hash',
    normalizePhone: () => '+13125550100',
    normalizeSubmissionId: (value) => value,
    publicFormErrorResponse: (error) =>
      Response.json({ code: error.code }, { status: error.status }),
    readBoundedJson: (request) => request.json(),
    and: (...conditions) => conditions,
    eq: (...values) => values,
  })

  const request = new Request('https://phynyx.example/api/growth-assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      submissionId,
      firstName: 'QA',
      lastName: 'Tester',
      email: 'qa@example.test',
      phone: '(312) 555-0100',
      businessName: 'QA Company',
      industry: 'dental',
      annualRevenue: '500k-1m',
      monthlyBudget: '3k-5k',
      capacity: '6-10',
      decisionRole: 'owner',
      implementationTiming: 'within-30-days',
      followUpOwner: 'yes',
      biggestChallenge: 'not-enough-leads',
      currentMarketing: 'Referrals',
      snapshot: { valid: true },
      attribution: {
        conversionPage: 'https://phynyx.example/growth-assessment',
        landingPage: 'https://phynyx.example/',
      },
    }),
  })

  const response = await POST(request)
  assert.equal(response.status, 200)
  assert.equal((await response.json()).crmSynced, true)

  assert.deepEqual(
    syncCalls.map(({ contactId }) => contactId),
    ['stale-contact', 'replacement-contact'],
  )
  assert.equal(resolveCalls.length, 1)
  for (const { input } of [...syncCalls, ...resolveCalls.map((input) => ({ input }))]) {
    assert.equal(input.submittedAt, originalCreatedAt.toISOString())
  }

  assert.deepEqual(
    updateCalls.map(({ ghlContactId, status }) => ({ ghlContactId, status })),
    [
      { ghlContactId: undefined, status: 'crm-metadata-pending' },
      { ghlContactId: null, status: 'crm-pending' },
      { ghlContactId: 'replacement-contact', status: 'crm-metadata-pending' },
      { ghlContactId: 'replacement-contact', status: 'crm-synced' },
    ],
  )
})
