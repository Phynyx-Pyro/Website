import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../lib/booking-session.ts', import.meta.url)

async function loadBookingSessionModule(db, schema) {
  const predicateCalls = { eq: [], gte: [] }
  globalThis.__BOOKING_SESSION_TEST_STUBS__ = { db, schema, predicateCalls }
  const loaded = await importTypeScriptModule(moduleUrl, [
    [
      "import { and, eq, gt, gte, isNull, lt, ne, or } from 'drizzle-orm'",
      'const and = (...values) => values; const eq = (...values) => { globalThis.__BOOKING_SESSION_TEST_STUBS__.predicateCalls.eq.push(values); return values }; const gt = (...values) => values; const gte = (...values) => { globalThis.__BOOKING_SESSION_TEST_STUBS__.predicateCalls.gte.push(values); return values }; const isNull = (value) => value; const lt = (...values) => values; const ne = (...values) => values; const or = (...values) => values',
    ],
    [
      "import { getDb } from '@/db'",
      'const getDb = () => globalThis.__BOOKING_SESSION_TEST_STUBS__.db',
    ],
    [
      "import { bookingHandoffs, growthAssessments } from '@/db/schema'",
      'const { bookingHandoffs, growthAssessments } = globalThis.__BOOKING_SESSION_TEST_STUBS__.schema',
    ],
    [
      "import { hashText } from './public-form-security'",
      "const hashText = async () => 'hashed-token'",
    ],
  ])
  return { ...loaded, __predicateCalls: predicateCalls }
}

function bookingDb({ fitPath = 'investment-context', supersedingAssessment } = {}) {
  const assessmentCreatedAt = new Date('2026-09-04T12:00:00.000Z')
  const assessmentUpdatedAt = new Date('2026-09-04T12:00:30.000Z')
  const handoffCreatedAt = new Date('2026-09-04T12:02:00.000Z')
  const schema = {
    bookingHandoffs: {
      tokenHash: 'tokenHash',
      submissionId: 'submissionId',
      claimedAt: 'claimedAt',
      expiresAt: 'expiresAt',
      createdAt: 'createdAt',
    },
    growthAssessments: {
      id: 'id',
      status: 'status',
      ghlContactId: 'ghlContactId',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      phone: 'phone',
      fitPath: 'fitPath',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
  let selectCount = 0
  let updateCount = 0
  const updateValues = []
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            selectCount += 1
            if (selectCount === 1) {
              return [{ submissionId: 'submission-test', createdAt: handoffCreatedAt }]
            }
            if (selectCount === 2) {
              return [
                  {
                    contactId: 'contact-test',
                    firstName: 'QA',
                    lastName: 'Tester',
                    email: 'qa@example.test',
                    phone: '+13125550100',
                    fitPath,
                    createdAt: assessmentCreatedAt,
                    updatedAt: assessmentUpdatedAt,
                  },
                ]
            }
            return supersedingAssessment ? [{ id: supersedingAssessment.id }] : []
          },
        }),
      }),
    }),
    update: () => ({
      set: (values) => ({
        where: () => ({
          returning: async () => {
            updateCount += 1
            updateValues.push(values)
            return [{ submissionId: 'submission-test' }]
          },
        }),
      }),
    }),
  }
  return {
    db,
    schema,
    selectCount: () => selectCount,
    updateCount: () => updateCount,
    updateValues,
    assessmentCreatedAt,
    assessmentUpdatedAt,
    handoffCreatedAt,
  }
}

test.afterEach(() => {
  delete globalThis.__BOOKING_SESSION_TEST_STUBS__
})

test('booking handoff reserves the token before acknowledgement work', async () => {
  const fixture = bookingDb()
  const { claimBookingSession } = await loadBookingSessionModule(
    fixture.db,
    fixture.schema,
  )
  let callbackContact

  const contact = await claimBookingSession('a'.repeat(64), async (value) => {
    assert.equal(fixture.updateCount(), 1)
    assert.ok(fixture.updateValues[0].claimedAt instanceof Date)
    callbackContact = value
  })

  assert.equal(callbackContact.fitPath, 'investment-context')
  assert.equal(callbackContact.submissionId, 'submission-test')
  assert.equal(contact.submissionId, 'submission-test')
  assert.equal(contact.contactId, 'contact-test')
  assert.equal(fixture.updateCount(), 1)
})

test('failed acknowledgement work leaves the one-time token unclaimed', async () => {
  const fixture = bookingDb()
  const { claimBookingSession } = await loadBookingSessionModule(
    fixture.db,
    fixture.schema,
  )

  await assert.rejects(
    claimBookingSession('a'.repeat(64), async () => {
      throw new Error('CRM write failed')
    }),
    /CRM write failed/,
  )
  assert.equal(fixture.updateCount(), 2)
  assert.ok(fixture.updateValues[0].claimedAt instanceof Date)
  assert.deepEqual(fixture.updateValues[1], { claimedAt: null })
})

test('concurrent claims allow only one request to reach external work', async () => {
  const schema = bookingDb().schema
  let reserved = false
  let callbackCount = 0
  const db = {
    select: (projection) => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            if ('submissionId' in projection) {
              return [
                {
                  submissionId: 'submission-test',
                  createdAt: new Date('2026-09-04T12:01:00.000Z'),
                },
              ]
            }
            if ('contactId' in projection) {
              return [
                  {
                    contactId: 'contact-test',
                    firstName: 'QA',
                    lastName: 'Tester',
                    email: 'qa@example.test',
                    phone: '+13125550100',
                    fitPath: 'investment-context',
                    createdAt: new Date('2026-09-04T12:00:00.000Z'),
                    updatedAt: new Date('2026-09-04T12:00:30.000Z'),
                  },
                ]
            }
            return []
          },
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => {
            if (reserved) return []
            reserved = true
            return [{ submissionId: 'submission-test' }]
          },
        }),
      }),
    }),
  }
  const { claimBookingSession } = await loadBookingSessionModule(db, schema)
  const beforeClaim = async () => {
    callbackCount += 1
  }

  const results = await Promise.all([
    claimBookingSession('a'.repeat(64), beforeClaim),
    claimBookingSession('a'.repeat(64), beforeClaim),
  ])

  assert.equal(results.filter(Boolean).length, 1)
  assert.equal(callbackCount, 1)
})

test('malformed booking tokens are rejected before database access', async () => {
  const fixture = bookingDb()
  const { claimBookingSession } = await loadBookingSessionModule(
    fixture.db,
    fixture.schema,
  )

  assert.equal(await claimBookingSession('not-a-valid-token'), null)
  assert.equal(fixture.selectCount(), 0)
  assert.equal(fixture.updateCount(), 0)
})

test('a later same-identity assessment invalidates a handoff before contact resolution', async () => {
  const fixture = bookingDb({
    supersedingAssessment: {
      id: 'later-assessment-that-stopped-before-final-marker',
    },
  })
  const { claimBookingSession, __predicateCalls } = await loadBookingSessionModule(
    fixture.db,
    fixture.schema,
  )
  let callbackCount = 0

  const contact = await claimBookingSession('a'.repeat(64), async () => {
    callbackCount += 1
  })

  assert.equal(contact, null)
  assert.equal(fixture.selectCount(), 3)
  assert.equal(fixture.updateCount(), 0)
  assert.equal(callbackCount, 0)
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
})

test('an older assessment retried after sync but before a reissued handoff invalidates it', async () => {
  const fixture = bookingDb({
    supersedingAssessment: {
      id: 'older-assessment-retried-after-handoff',
    },
  })
  const { claimBookingSession, __predicateCalls } = await loadBookingSessionModule(
    fixture.db,
    fixture.schema,
  )
  let callbackCount = 0

  const contact = await claimBookingSession('a'.repeat(64), async () => {
    callbackCount += 1
  })

  assert.equal(contact, null)
  assert.equal(fixture.selectCount(), 3)
  assert.equal(fixture.updateCount(), 0)
  assert.equal(callbackCount, 0)
  assert.deepEqual(__predicateCalls.gte, [
    ['createdAt', fixture.assessmentCreatedAt],
    ['updatedAt', fixture.assessmentUpdatedAt],
  ])
  assert.ok(fixture.assessmentUpdatedAt < fixture.handoffCreatedAt)
})
