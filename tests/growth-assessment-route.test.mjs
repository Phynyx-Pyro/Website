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

function createDb(existing, supersedingAssessment = null) {
  const updateCalls = []
  return {
    updateCalls,
    db: {
      insert: () => ({
        values: () => ({
          onConflictDoNothing: () => ({ returning: async () => [] }),
        }),
      }),
      select: (projection) => ({
        from: () => ({
          where: () => ({
            limit: async () =>
              projection?.id && Object.keys(projection).length === 1
                ? supersedingAssessment
                  ? [supersedingAssessment]
                  : []
                : [existing],
          }),
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
  const predicateCalls = { eq: [], gte: [], ne: [] }
  globalThis.__GROWTH_ROUTE_TEST_STUBS__ = { ...stubs, predicateCalls }
  const loaded = await importTypeScriptModule(moduleUrl, [
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
  GhlStaleBookingHandoffError,
  isGhlContactNotFoundError,
  resolveGrowthAssessmentContact,
  syncGrowthAssessmentMetadata,
  verifyGrowthAssessmentBookingHandoff,
} from '@/lib/ghl'`,
      `const {
  GhlIdentityConflictError,
  GhlStaleBookingHandoffError,
  isGhlContactNotFoundError,
  resolveGrowthAssessmentContact,
  syncGrowthAssessmentMetadata,
  verifyGrowthAssessmentBookingHandoff,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      "import { assessGrowthFit, type FitAssessment } from '@/lib/growth-assessment'",
      'const { assessGrowthFit } = globalThis.__GROWTH_ROUTE_TEST_STUBS__',
    ],
    [
      `import {
  buildGrowthAssessmentPayloadHashes,
  growthAssessmentPayloadHashMatches,
} from '@/lib/growth-assessment-idempotency'`,
      `const {
  buildGrowthAssessmentPayloadHashes,
  growthAssessmentPayloadHashMatches,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      `import {
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
  normalizeAssessmentEntryPoint,
  normalizeWebsiteSessionId,
} from '@/lib/assessment-attribution'`,
      `const {
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
  normalizeAssessmentEntryPoint,
  normalizeWebsiteSessionId,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      `import {
  PublicFormError,
  enforcePublicFormRateLimit,
  normalizePhone,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'`,
      `const {
  PublicFormError,
  enforcePublicFormRateLimit,
  normalizePhone,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} = globalThis.__GROWTH_ROUTE_TEST_STUBS__`,
    ],
    [
      "import { and, eq, gte, ne } from 'drizzle-orm'",
      'const { and } = globalThis.__GROWTH_ROUTE_TEST_STUBS__; const eq = (...values) => { globalThis.__GROWTH_ROUTE_TEST_STUBS__.predicateCalls.eq.push(values); return values }; const gte = (...values) => { globalThis.__GROWTH_ROUTE_TEST_STUBS__.predicateCalls.gte.push(values); return values }; const ne = (...values) => { globalThis.__GROWTH_ROUTE_TEST_STUBS__.predicateCalls.ne.push(values); return values }',
    ],
  ])
  return { ...loaded, __predicateCalls: predicateCalls }
}

test.afterEach(() => {
  delete globalThis.__GROWTH_ROUTE_TEST_STUBS__
})

test('a new blank-range submission stops after the compatibility lookup', async () => {
  class PublicFormError extends Error {
    constructor(status, code, message) {
      super(message)
      this.status = status
      this.code = code
    }
  }
  let dbRead = false
  let dbWrite = false
  const { POST } = await loadRoute({
    getDb: () => ({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => {
              dbRead = true
              return []
            },
          }),
        }),
      }),
      insert: () => {
        dbWrite = true
        throw new Error('database insert should not be reached')
      },
      update: () => {
        dbWrite = true
        throw new Error('database update should not be reached')
      },
    }),
    growthAssessments: new Proxy({}, { get: (_target, property) => property }),
    issueBookingSession: async () => '',
    GhlIdentityConflictError: class extends Error {},
    GhlStaleBookingHandoffError: class extends Error {},
    isGhlContactNotFoundError: () => false,
    resolveGrowthAssessmentContact: async () => null,
    syncGrowthAssessmentMetadata: async () => {},
    verifyGrowthAssessmentBookingHandoff: async () => {},
    assessGrowthFit: () => ({
      path: 'investment-context',
      tag: 'fit:nurture',
      summary: 'Context required.',
    }),
    buildGrowthAssessmentPayloadHashes: async () => ({ current: 'new-hash' }),
    growthAssessmentPayloadHashMatches: () => false,
    minimizeAttributionUrl: (value) => value ?? '',
    normalizeAssessmentCtaOrigin: (value) => value ?? '',
    normalizeAssessmentEntryPoint: (value) => value ?? '',
    normalizeWebsiteSessionId: (value) => value ?? '',
    PublicFormError,
    enforcePublicFormRateLimit: async () => {},
    normalizePhone: () => '+13125550100',
    normalizeSubmissionId: (value) => value,
    publicFormErrorResponse: (error) =>
      Response.json(
        { code: error.code, message: error.message },
        { status: error.status },
      ),
    readBoundedJson: (request) => request.json(),
    and: (...conditions) => conditions,
    eq: (...values) => values,
  })

  const response = await POST(
    new Request('https://phynyx.example/api/growth-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        firstName: 'QA',
        email: 'qa@example.test',
        phone: '(312) 555-0100',
        businessName: 'QA Company',
        industry: 'dental',
        annualRevenue: '',
        monthlyBudget: '',
      }),
    }),
  )

  assert.equal(response.status, 400)
  assert.equal((await response.json()).code, 'REQUIRED_FIELDS')
  assert.equal(dbRead, true)
  assert.equal(dbWrite, false)
})

test('an exact historical blank-range submission can finish its interrupted retry', async () => {
  const submissionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  const originalCreatedAt = new Date('2026-07-01T10:00:00.000Z')
  const existing = {
    id: submissionId,
    payloadHash: 'legacy-matching-hash',
    ghlContactId: null,
    status: 'crm-sync-failed',
    annualRevenue: null,
    monthlyBudget: null,
    fitPath: null,
    createdAt: originalCreatedAt,
    updatedAt: new Date('2026-07-01T10:01:00.000Z'),
  }
  const { db } = createDb(existing)
  const syncCalls = []

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
    GhlIdentityConflictError: class extends Error {},
    GhlStaleBookingHandoffError: class extends Error {},
    isGhlContactNotFoundError: () => false,
    resolveGrowthAssessmentContact: async () => ({
      contactId: 'historical-contact',
      isNew: false,
    }),
    syncGrowthAssessmentMetadata: async (contactId, input) => {
      syncCalls.push({ contactId, input })
    },
    verifyGrowthAssessmentBookingHandoff: async () => {},
    assessGrowthFit: () => ({
      path: 'investment-context',
      tag: 'fit:nurture',
      summary: 'Context required.',
    }),
    buildGrowthAssessmentPayloadHashes: async () => ({
      current: 'legacy-matching-hash',
    }),
    growthAssessmentPayloadHashMatches: () => true,
    minimizeAttributionUrl: (value) => value ?? '',
    normalizeAssessmentCtaOrigin: (value) => value ?? '',
    normalizeAssessmentEntryPoint: (value) => value ?? '',
    normalizeWebsiteSessionId: (value) => value ?? '',
    PublicFormError,
    enforcePublicFormRateLimit: async () => {},
    normalizePhone: () => '+13125550100',
    normalizeSubmissionId: (value) => value,
    publicFormErrorResponse: (error) =>
      Response.json({ code: error.code }, { status: error.status }),
    readBoundedJson: (request) => request.json(),
    and: (...conditions) => conditions,
    eq: (...values) => values,
  })

  const response = await POST(
    new Request('https://phynyx.example/api/growth-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        firstName: 'Legacy',
        email: 'legacy@example.test',
        phone: '(312) 555-0100',
        businessName: 'Legacy Company',
        industry: 'dental',
        annualRevenue: '',
        monthlyBudget: '',
      }),
    }),
  )

  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.fit.path, 'investment-context')
  assert.equal(syncCalls.length, 1)
  assert.equal(syncCalls[0].contactId, 'historical-contact')
  assert.equal(syncCalls[0].input.annualRevenue, '')
  assert.equal(syncCalls[0].input.monthlyBudget, '')
  assert.equal(syncCalls[0].input.submittedAt, originalCreatedAt.toISOString())
})

test('a synced legacy row backfills its fit path before issuing a handoff', async () => {
  const submissionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  const existing = {
    id: submissionId,
    payloadHash: 'matching-payload-hash',
    ghlContactId: 'verified-contact',
    status: 'crm-synced',
    annualRevenue: '500k-1m',
    monthlyBudget: '3k-5k',
    fitPath: null,
    createdAt: new Date('2026-08-01T12:34:56.789Z'),
    updatedAt: new Date('2026-08-01T12:35:00.000Z'),
  }
  const { db, updateCalls } = createDb(existing)
  const events = []

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
    issueBookingSession: async () => {
      events.push('booking-issued')
      return 'booking-session=test; Path=/'
    },
    GhlIdentityConflictError: class extends Error {},
    GhlStaleBookingHandoffError: class extends Error {},
    isGhlContactNotFoundError: () => false,
    resolveGrowthAssessmentContact: async () => {
      throw new Error('contact resolution should not run')
    },
    syncGrowthAssessmentMetadata: async () => {
      throw new Error('metadata sync should not run')
    },
    verifyGrowthAssessmentBookingHandoff: async (contactId) => {
      assert.equal(contactId, 'verified-contact')
      events.push('contact-verified')
    },
    assessGrowthFit: () => ({
      path: 'calendar',
      tag: 'fit:qualified',
      summary: 'Qualified.',
    }),
    buildGrowthAssessmentPayloadHashes: async () => ({
      current: 'matching-payload-hash',
    }),
    growthAssessmentPayloadHashMatches: () => true,
    minimizeAttributionUrl: (value) => value ?? '',
    normalizeAssessmentCtaOrigin: (value) => value ?? '',
    normalizeAssessmentEntryPoint: (value) => value ?? '',
    normalizeWebsiteSessionId: (value) => value ?? '',
    PublicFormError,
    enforcePublicFormRateLimit: async () => {},
    normalizePhone: () => '+13125550100',
    normalizeSubmissionId: (value) => value,
    publicFormErrorResponse: (error) =>
      Response.json({ code: error.code }, { status: error.status }),
    readBoundedJson: (request) => request.json(),
    and: (...conditions) => conditions,
    eq: (...values) => values,
  })

  const response = await POST(
    new Request('https://phynyx.example/api/growth-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        firstName: 'QA',
        email: 'qa@example.test',
        phone: '(312) 555-0100',
        businessName: 'QA Company',
        industry: 'dental',
        annualRevenue: '500k-1m',
        monthlyBudget: '3k-5k',
      }),
    }),
  )

  assert.equal(response.status, 200)
  assert.deepEqual(events, ['contact-verified', 'booking-issued'])
  assert.equal(updateCalls[0].fitPath, 'calendar')
})

test('a synced retry replaces a deleted cached contact before issuing a handoff', async () => {
  const submissionId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  const staleContactError = new Error('cached contact was deleted')
  const existing = {
    id: submissionId,
    payloadHash: 'matching-payload-hash',
    ghlContactId: 'deleted-contact',
    status: 'crm-synced',
    annualRevenue: '500k-1m',
    monthlyBudget: '3k-5k',
    fitPath: 'calendar',
    createdAt: new Date('2026-08-01T12:34:56.789Z'),
    updatedAt: new Date('2026-08-01T12:35:00.000Z'),
  }
  const { db, updateCalls } = createDb(existing)
  const syncContactIds = []

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
    GhlStaleBookingHandoffError: class extends Error {},
    isGhlContactNotFoundError: (error, contactId) =>
      error === staleContactError && contactId === 'deleted-contact',
    resolveGrowthAssessmentContact: async () => ({
      contactId: 'replacement-contact',
      isNew: false,
    }),
    syncGrowthAssessmentMetadata: async (contactId) => {
      syncContactIds.push(contactId)
    },
    verifyGrowthAssessmentBookingHandoff: async () => {
      throw staleContactError
    },
    assessGrowthFit: () => ({
      path: 'calendar',
      tag: 'fit:qualified',
      summary: 'Qualified.',
    }),
    buildGrowthAssessmentPayloadHashes: async () => ({
      current: 'matching-payload-hash',
    }),
    growthAssessmentPayloadHashMatches: () => true,
    minimizeAttributionUrl: (value) => value ?? '',
    normalizeAssessmentCtaOrigin: (value) => value ?? '',
    normalizeAssessmentEntryPoint: (value) => value ?? '',
    normalizeWebsiteSessionId: (value) => value ?? '',
    PublicFormError,
    enforcePublicFormRateLimit: async () => {},
    normalizePhone: () => '+13125550100',
    normalizeSubmissionId: (value) => value,
    publicFormErrorResponse: (error) =>
      Response.json({ code: error.code }, { status: error.status }),
    readBoundedJson: (request) => request.json(),
    and: (...conditions) => conditions,
    eq: (...values) => values,
  })

  const response = await POST(
    new Request('https://phynyx.example/api/growth-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        firstName: 'QA',
        email: 'qa@example.test',
        phone: '(312) 555-0100',
        businessName: 'QA Company',
        industry: 'dental',
        annualRevenue: '500k-1m',
        monthlyBudget: '3k-5k',
      }),
    }),
  )

  assert.equal(response.status, 200)
  assert.deepEqual(syncContactIds, ['replacement-contact'])
  assert.deepEqual(
    updateCalls.map(({ ghlContactId, status }) => ({ ghlContactId, status })),
    [
      { ghlContactId: null, status: 'crm-pending' },
      { ghlContactId: 'replacement-contact', status: 'crm-metadata-pending' },
      { ghlContactId: 'replacement-contact', status: 'crm-synced' },
    ],
  )
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
    GhlStaleBookingHandoffError: class extends Error {},
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
    verifyGrowthAssessmentBookingHandoff: async () => {},
    assessGrowthFit: () => ({
      path: 'calendar',
      tag: 'fit:qualified',
      summary: 'Qualified by test rules.',
    }),
    buildGrowthAssessmentPayloadHashes: async () => ({
      current: 'matching-payload-hash',
    }),
    growthAssessmentPayloadHashMatches: () => true,
    minimizeAttributionUrl: (value) => value,
    normalizeAssessmentCtaOrigin: (value) => value,
    normalizeAssessmentEntryPoint: (value) => value ?? '',
    normalizeWebsiteSessionId: (value) => value ?? '',
    PublicFormError,
    enforcePublicFormRateLimit: async () => {},
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
      biggestChallenge: 'not-enough-leads',
      currentMarketing: 'Referrals',
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

test('an older failed submission cannot overwrite a newer same-identity assessment', async () => {
  const submissionId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  const existing = {
    id: submissionId,
    email: 'qa@example.test',
    phone: '+13125550100',
    payloadHash: 'matching-payload-hash',
    ghlContactId: 'shared-contact',
    status: 'crm-metadata-failed',
    annualRevenue: '500k-1m',
    monthlyBudget: '3k-5k',
    fitPath: 'calendar',
    createdAt: new Date('2026-08-01T12:00:00.000Z'),
    updatedAt: new Date('2026-08-01T12:01:00.000Z'),
  }
  const newerAssessment = {
    id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  }
  const { db, updateCalls } = createDb(existing, newerAssessment)
  const externalEvents = []

  class PublicFormError extends Error {
    constructor(status, code, message) {
      super(message)
      this.status = status
      this.code = code
    }
  }

  const { POST, __predicateCalls } = await loadRoute({
    getDb: () => db,
    growthAssessments: new Proxy({}, { get: (_target, property) => property }),
    issueBookingSession: async () => {
      externalEvents.push('booking-issued')
      return 'booking-session=test; Path=/'
    },
    GhlIdentityConflictError: class extends Error {},
    GhlStaleBookingHandoffError: class extends Error {},
    isGhlContactNotFoundError: () => false,
    resolveGrowthAssessmentContact: async () => {
      externalEvents.push('contact-resolved')
      return { contactId: 'shared-contact', isNew: false }
    },
    syncGrowthAssessmentMetadata: async () => {
      externalEvents.push('metadata-synced')
    },
    verifyGrowthAssessmentBookingHandoff: async () => {
      externalEvents.push('contact-verified')
    },
    assessGrowthFit: () => ({
      path: 'calendar',
      tag: 'fit:qualified',
      summary: 'Qualified.',
    }),
    buildGrowthAssessmentPayloadHashes: async () => ({
      current: 'matching-payload-hash',
    }),
    growthAssessmentPayloadHashMatches: () => true,
    minimizeAttributionUrl: (value) => value ?? '',
    normalizeAssessmentCtaOrigin: (value) => value ?? '',
    normalizeAssessmentEntryPoint: (value) => value ?? '',
    normalizeWebsiteSessionId: (value) => value ?? '',
    PublicFormError,
    enforcePublicFormRateLimit: async () => {},
    normalizePhone: () => '+13125550100',
    normalizeSubmissionId: (value) => value,
    publicFormErrorResponse: (error) =>
      Response.json({ code: error.code }, { status: error.status }),
    readBoundedJson: (request) => request.json(),
    and: (...conditions) => conditions,
    eq: (...values) => values,
  })

  const response = await POST(
    new Request('https://phynyx.example/api/growth-assessment', {
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
      }),
    }),
  )

  assert.equal(response.status, 409)
  assert.equal((await response.json()).code, 'SUBMISSION_SUPERSEDED')
  assert.deepEqual(externalEvents, [])
  assert.deepEqual(updateCalls, [])
  assert.ok(
    __predicateCalls.eq.some(
      (values) =>
        values[0] === 'email' && values[1] === 'qa@example.test',
    ),
  )
  assert.ok(
    __predicateCalls.eq.some(
      (values) => values[0] === 'phone' && values[1] === '+13125550100',
    ),
  )
  assert.ok(
    __predicateCalls.ne.some(
      (values) => values[0] === 'id' && values[1] === submissionId,
    ),
  )
  assert.ok(
    __predicateCalls.gte.some(
      (values) =>
        values[0] === 'createdAt' && values[1] === existing.createdAt,
    ),
  )
})
