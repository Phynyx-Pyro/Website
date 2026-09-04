import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../app/api/booking-session/route.ts', import.meta.url)

class TestPublicFormError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

class TestGhlStaleBookingHandoffError extends Error {}

async function loadBookingSessionRoute(stubs) {
  globalThis.__BOOKING_SESSION_ROUTE_TEST_STUBS__ = stubs
  return importTypeScriptModule(moduleUrl, [
    [
      `import {
  BOOKING_COOKIE_NAME,
  claimBookingSession,
  readCookie,
  serializeBookingCookie,
} from '@/lib/booking-session'`,
      `const {
  BOOKING_COOKIE_NAME,
  claimBookingSession,
  readCookie,
  serializeBookingCookie,
} = globalThis.__BOOKING_SESSION_ROUTE_TEST_STUBS__`,
    ],
    [
      `import {
  GhlStaleBookingHandoffError,
  setGrowthAssessmentInvestmentAcknowledged,
  verifyGrowthAssessmentBookingHandoff,
} from '@/lib/ghl'`,
      `const {
  GhlStaleBookingHandoffError,
  setGrowthAssessmentInvestmentAcknowledged,
  verifyGrowthAssessmentBookingHandoff,
} = globalThis.__BOOKING_SESSION_ROUTE_TEST_STUBS__`,
    ],
    [
      `import {
  PublicFormError,
  assertSameOrigin,
  enforcePublicFormRateLimit,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'`,
      `const {
  PublicFormError,
  assertSameOrigin,
  enforcePublicFormRateLimit,
  publicFormErrorResponse,
  readBoundedJson,
} = globalThis.__BOOKING_SESSION_ROUTE_TEST_STUBS__`,
    ],
  ])
}

function routeFixture({
  fitPath = 'investment-context',
  verificationError,
  acknowledgementError,
} = {}) {
  const state = {
    acknowledgementContactIds: [],
    acknowledgementSubmissionIds: [],
    verificationContactIds: [],
    claimCompleted: false,
  }
  const contact = {
    submissionId: 'submission-test',
    contactId: 'contact-test',
    firstName: 'QA',
    lastName: 'Tester',
    email: 'qa@example.test',
    phone: '+13125550100',
    fitPath,
  }

  return {
    state,
    stubs: {
      BOOKING_COOKIE_NAME: 'phynyx_booking',
      GhlStaleBookingHandoffError: TestGhlStaleBookingHandoffError,
      PublicFormError: TestPublicFormError,
      assertSameOrigin() {},
      async enforcePublicFormRateLimit() {},
      async readBoundedJson(request) {
        return request.json()
      },
      publicFormErrorResponse(error) {
        return Response.json(
          { success: false, code: error.code, message: error.message },
          { status: error.status, headers: { 'Cache-Control': 'no-store' } },
        )
      },
      readCookie(cookieHeader, name) {
        assert.equal(name, 'phynyx_booking')
        return cookieHeader?.includes('phynyx_booking=token') ? 'token' : ''
      },
      serializeBookingCookie(token, requestUrl, maxAgeSeconds) {
        assert.equal(token, '')
        assert.match(requestUrl, /^https:\/\/example\.test\//)
        assert.equal(maxAgeSeconds, 0)
        return 'phynyx_booking=; Path=/; Max-Age=0'
      },
      async claimBookingSession(token, beforeClaim) {
        assert.equal(token, 'token')
        await beforeClaim(contact)
        state.claimCompleted = true
        return contact
      },
      async setGrowthAssessmentInvestmentAcknowledged(contactId, submissionId) {
        state.acknowledgementContactIds.push(contactId)
        state.acknowledgementSubmissionIds.push(submissionId)
        if (acknowledgementError) throw acknowledgementError
      },
      async verifyGrowthAssessmentBookingHandoff(contactId, value) {
        state.verificationContactIds.push(contactId)
        assert.equal(value.email, contact.email)
        assert.equal(value.phone, contact.phone)
        if (verificationError) throw verificationError
      },
    },
  }
}

function bookingRequest(body) {
  return new Request('https://example.test/api/booking-session', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: 'phynyx_booking=token',
    },
    body: JSON.stringify(body),
  })
}

test.afterEach(() => {
  delete globalThis.__BOOKING_SESSION_ROUTE_TEST_STUBS__
})

test('investment-context calendar access requires an explicit boolean acknowledgement', async () => {
  for (const body of [{}, { investmentContextAcknowledged: 'true' }]) {
    const fixture = routeFixture()
    const { POST } = await loadBookingSessionRoute(fixture.stubs)

    const response = await POST(bookingRequest(body))
    const payload = await response.json()

    assert.equal(response.status, 400)
    assert.equal(payload.code, 'INVESTMENT_ACKNOWLEDGEMENT_REQUIRED')
    assert.deepEqual(fixture.state.acknowledgementContactIds, [])
    assert.deepEqual(fixture.state.acknowledgementSubmissionIds, [])
    assert.deepEqual(fixture.state.verificationContactIds, ['contact-test'])
    assert.equal(fixture.state.claimCompleted, false)
  }
})

test('acknowledging investment context writes CRM state before returning calendar contact', async () => {
  const fixture = routeFixture()
  const { POST } = await loadBookingSessionRoute(fixture.stubs)

  const response = await POST(
    bookingRequest({ investmentContextAcknowledged: true }),
  )
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(fixture.state.acknowledgementContactIds, ['contact-test'])
  assert.deepEqual(fixture.state.acknowledgementSubmissionIds, [
    'submission-test',
  ])
  assert.deepEqual(fixture.state.verificationContactIds, ['contact-test'])
  assert.equal(fixture.state.claimCompleted, true)
  assert.deepEqual(payload, {
    success: true,
    bookingContact: {
      contactId: 'contact-test',
      firstName: 'QA',
      lastName: 'Tester',
      email: 'qa@example.test',
      phone: '+13125550100',
    },
  })
  assert.equal(payload.bookingContact.fitPath, undefined)
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('calendar-qualified contacts do not require or record investment acknowledgement', async () => {
  const fixture = routeFixture({ fitPath: 'calendar' })
  const { POST } = await loadBookingSessionRoute(fixture.stubs)

  const response = await POST(bookingRequest({}))

  assert.equal(response.status, 200)
  assert.deepEqual(fixture.state.acknowledgementContactIds, [])
  assert.deepEqual(fixture.state.acknowledgementSubmissionIds, [])
  assert.deepEqual(fixture.state.verificationContactIds, ['contact-test'])
  assert.equal(fixture.state.claimCompleted, true)
})

test('unknown or missing fit paths fail closed without consuming the handoff', async () => {
  for (const fitPath of [null, 'legacy-unknown']) {
    const fixture = routeFixture({ fitPath })
    const { POST } = await loadBookingSessionRoute(fixture.stubs)

    const response = await POST(
      bookingRequest({ investmentContextAcknowledged: true }),
    )
    const payload = await response.json()

    assert.equal(response.status, 409)
    assert.equal(payload.code, 'BOOKING_PATH_UNAVAILABLE')
    assert.deepEqual(fixture.state.acknowledgementContactIds, [])
    assert.deepEqual(fixture.state.acknowledgementSubmissionIds, [])
    assert.deepEqual(fixture.state.verificationContactIds, ['contact-test'])
    assert.equal(fixture.state.claimCompleted, false)
  }
})

test('an older handoff cannot acknowledge a newer CRM submission', async () => {
  const fixture = routeFixture({
    acknowledgementError: new TestGhlStaleBookingHandoffError(),
  })
  const { POST } = await loadBookingSessionRoute(fixture.stubs)

  const response = await POST(
    bookingRequest({ investmentContextAcknowledged: true }),
  )
  const payload = await response.json()

  assert.equal(response.status, 409)
  assert.equal(payload.code, 'BOOKING_SESSION_STALE')
  assert.deepEqual(fixture.state.acknowledgementContactIds, ['contact-test'])
  assert.deepEqual(fixture.state.acknowledgementSubmissionIds, [
    'submission-test',
  ])
  assert.equal(fixture.state.claimCompleted, false)
})

test('an older qualified handoff cannot bypass a newer investment gate', async () => {
  const fixture = routeFixture({
    fitPath: 'calendar',
    verificationError: new TestGhlStaleBookingHandoffError(),
  })
  const { POST } = await loadBookingSessionRoute(fixture.stubs)

  const response = await POST(bookingRequest({}))
  const payload = await response.json()

  assert.equal(response.status, 409)
  assert.equal(payload.code, 'BOOKING_SESSION_STALE')
  assert.deepEqual(fixture.state.verificationContactIds, ['contact-test'])
  assert.deepEqual(fixture.state.acknowledgementContactIds, [])
  assert.equal(fixture.state.claimCompleted, false)
})

test('a stale booking contact fails before acknowledgement or calendar access', async () => {
  const fixture = routeFixture({
    verificationError: new Error('cached CRM contact was removed'),
  })
  const { POST } = await loadBookingSessionRoute(fixture.stubs)
  const originalConsoleError = console.error
  console.error = () => {}
  let response
  try {
    response = await POST(
      bookingRequest({ investmentContextAcknowledged: true }),
    )
  } finally {
    console.error = originalConsoleError
  }

  assert.equal(response.status, 500)
  assert.deepEqual(fixture.state.verificationContactIds, ['contact-test'])
  assert.deepEqual(fixture.state.acknowledgementContactIds, [])
  assert.deepEqual(fixture.state.acknowledgementSubmissionIds, [])
  assert.equal(fixture.state.claimCompleted, false)
})
