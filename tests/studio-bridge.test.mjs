import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const secret = 'test-server-secret-with-at-least-32-bytes'
const visitorOrigin = 'https://studio.example.test'
const backendUrl = 'https://backend.example.test/api/studio-bridge'
const intakeCookie = `__Host-phynyx_intake=${'a'.repeat(64)}`
const bookingCookie = `phynyx_booking=${'b'.repeat(64)}`

function testDb() {
  const nonces = new Set()
  return {
    nonces,
    prepare(sql) {
      assert.match(sql, /ON CONFLICT\(key\) DO NOTHING RETURNING key/)
      return {
        bind(key) {
          return {
            async first() {
              if (nonces.has(key)) return null
              nonces.add(key)
              return { key }
            },
          }
        },
      }
    },
  }
}

async function loadBridge(env) {
  globalThis.__STUDIO_BRIDGE_TEST_ENV__ = env
  return importTypeScriptModule(new URL('../lib/studio-bridge.ts', import.meta.url), [
    ["import { env } from 'cloudflare:workers'", 'const env = globalThis.__STUDIO_BRIDGE_TEST_ENV__'],
  ])
}

async function signedRequest({
  action = 'intake', body = '{}', cookie = '', origin = visitorOrigin,
  signatureSecret = secret, timestamp = Date.now().toString(),
  nonce = randomBytes(16).toString('hex'), clientAddress = '203.0.113.10',
  contentType = action === 'booking' ? '' : 'application/json',
  browserOrigin = undefined,
} = {}) {
  const bytes = Buffer.from(body)
  const normalizedContentType = contentType.split(';', 1)[0].trim().toLowerCase()
  const hash = Buffer.from(await crypto.subtle.digest('SHA-256', bytes)).toString('hex')
  const signed = JSON.stringify([
    'phynyx-studio-bridge-v1', timestamp, nonce, action, origin,
    clientAddress, cookie, normalizedContentType, hash,
  ])
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(signatureSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed))).toString('hex')
  const headers = {
    'X-Phynyx-Bridge-Action': action,
    'X-Phynyx-Bridge-Timestamp': timestamp,
    'X-Phynyx-Bridge-Nonce': nonce,
    'X-Phynyx-Bridge-Signature': signature,
    'X-Phynyx-Bridge-Visitor-Origin': origin,
    'X-Phynyx-Bridge-Client-Address': clientAddress,
  }
  if (cookie) headers.Cookie = cookie
  if (contentType) headers['Content-Type'] = contentType
  if (browserOrigin !== undefined) headers.Origin = browserOrigin
  return new Request(backendUrl, { method: 'POST', headers, body: body || undefined })
}

test.afterEach(() => { delete globalThis.__STUDIO_BRIDGE_TEST_ENV__ })

test('bridge stays closed without both server-only bindings', async () => {
  for (const env of [{}, { STUDIO_BRIDGE_SECRET: secret },
    { STUDIO_BRIDGE_SECRET: secret, STUDIO_BRIDGE_ORIGIN: 'http://studio.example.test' },
    { STUDIO_BRIDGE_SECRET: secret, STUDIO_BRIDGE_ORIGIN: 'not-a-url' }]) {
    const { authenticateStudioBridge } = await loadBridge(env)
    await assert.rejects(authenticateStudioBridge(await signedRequest()),
      { status: 404, code: 'BRIDGE_DISABLED' })
  }
})

test('signed intake and booking requests retain cookies and existing handler origin', async () => {
  const db = testDb()
  const { authenticateStudioBridge } = await loadBridge({
    STUDIO_BRIDGE_SECRET: secret, STUDIO_BRIDGE_ORIGIN: visitorOrigin, DB: db,
  })
  const intake = await authenticateStudioBridge(await signedRequest())
  assert.equal(intake.action, 'intake')
  assert.equal(intake.internalRequest.url, 'https://backend.example.test/api/intake-session')
  assert.equal(intake.internalRequest.headers.get('origin'), 'https://backend.example.test')
  assert.deepEqual(await intake.internalRequest.json(), {})
  const assessmentPayload = { firstName: 'QA', submissionId: crypto.randomUUID() }
  const assessment = await authenticateStudioBridge(await signedRequest({
    action: 'assessment', body: JSON.stringify(assessmentPayload), cookie: intakeCookie,
  }))
  assert.equal(assessment.internalRequest.url, 'https://backend.example.test/api/growth-assessment')
  assert.equal(assessment.internalRequest.headers.get('cookie'), intakeCookie)
  assert.deepEqual(await assessment.internalRequest.json(), assessmentPayload)
  const bothCookies = `${intakeCookie}; ${bookingCookie}`
  const booking = await authenticateStudioBridge(await signedRequest({
    action: 'booking', body: '', cookie: bothCookies,
  }))
  assert.equal(booking.internalRequest.headers.get('cookie'), bothCookies)
  assert.equal(booking.internalRequest.headers.get('cf-connecting-ip'), '203.0.113.10')
  assert.equal(booking.internalRequest.url, 'https://backend.example.test/api/booking-session')
  const browserBooking = await authenticateStudioBridge(await signedRequest({
    action: 'booking', body: '{}', cookie: bothCookies,
    contentType: 'Application/JSON; charset=UTF-8',
  }))
  assert.equal(browserBooking.internalRequest.headers.get('content-type'), 'application/json')
  assert.equal(await browserBooking.internalRequest.text(), '{}')
  assert.equal(db.nonces.size, 4)
})

test('bad signature, mismatched browser origin, and replay never reach a handler twice', async () => {
  const db = testDb()
  const { authenticateStudioBridge } = await loadBridge({
    STUDIO_BRIDGE_SECRET: secret, STUDIO_BRIDGE_ORIGIN: visitorOrigin, DB: db,
  })
  await assert.rejects(authenticateStudioBridge(await signedRequest({ signatureSecret: 'wrong-secret' })),
    { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    browserOrigin: 'https://attacker.example.test',
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    origin: 'https://attacker.example.test',
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    timestamp: String(Date.now() - 61_000),
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  const signed = await signedRequest()
  const tampered = new Request(signed, { body: '{"changed":true}' })
  await assert.rejects(authenticateStudioBridge(tampered),
    { status: 403, code: 'BRIDGE_FORBIDDEN' })
  assert.equal(db.nonces.size, 0)
  const nonce = randomBytes(16).toString('hex')
  await authenticateStudioBridge(await signedRequest({ nonce }))
  await assert.rejects(authenticateStudioBridge(await signedRequest({ nonce })),
    { status: 409, code: 'BRIDGE_REPLAYED' })
})

test('cookie allowlist and required session cookies fail closed', async () => {
  const db = testDb()
  const { authenticateStudioBridge } = await loadBridge({
    STUDIO_BRIDGE_SECRET: secret, STUDIO_BRIDGE_ORIGIN: visitorOrigin, DB: db,
  })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'assessment', cookie: '',
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'booking', body: '', cookie: intakeCookie,
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'booking', body: '{ }', cookie: `${intakeCookie}; ${bookingCookie}`,
    contentType: 'application/json',
  })), { status: 400, code: 'UNEXPECTED_BRIDGE_BODY' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'booking', body: '{}', cookie: `${intakeCookie}; ${bookingCookie}`,
    contentType: 'text/plain',
  })), { status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'support', cookie: intakeCookie,
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'support', origin: 'https://attacker.example.test',
  })), { status: 403, code: 'BRIDGE_FORBIDDEN' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    action: 'support', contentType: 'text/plain',
  })), { status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    cookie: `${intakeCookie}; ${intakeCookie}`,
  })), { status: 400, code: 'INVALID_BRIDGE_COOKIE' })
  await assert.rejects(authenticateStudioBridge(await signedRequest({
    cookie: `${intakeCookie}; highlevel_session=unrelated`,
  })), { status: 400, code: 'INVALID_BRIDGE_COOKIE' })
  assert.equal(db.nonces.size, 0)
})

test('bridge route preserves handler responses and dispatches support without cookies', async () => {
  const db = testDb()
  const bridge = await loadBridge({
    STUDIO_BRIDGE_SECRET: secret, STUDIO_BRIDGE_ORIGIN: visitorOrigin, DB: db,
  })
  globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__ = {
    authenticateStudioBridge: bridge.authenticateStudioBridge,
    StudioBridgeError: bridge.StudioBridgeError,
    intake: async () => Response.json({ success: true }, { status: 201, headers: {
      'Set-Cookie': `${intakeCookie}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      'Cache-Control': 'no-store',
    } }),
    assessment: async () => { throw new Error('wrong handler') },
    booking: async (request) => {
      assert.equal(request.url, 'https://backend.example.test/api/booking-session')
      assert.equal(await request.text(), '{}')
      return Response.json({ success: true }, { headers: {
        'Set-Cookie': 'phynyx_booking=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
        'Cache-Control': 'no-store',
      } })
    },
    support: async (request) => {
      assert.equal(request.url, 'https://backend.example.test/api/support')
      assert.equal(request.headers.get('origin'), 'https://backend.example.test')
      assert.equal(request.headers.get('cookie'), null)
      assert.deepEqual(await request.json(), {
        submissionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        name: 'QA Tester', email: 'qa@example.test', message: 'Please help.',
      })
      return Response.json({ success: true },
        { headers: { 'Cache-Control': 'no-store' } })
    },
  }
  const { POST } = await importTypeScriptModule(new URL('../app/api/studio-bridge/route.ts', import.meta.url), [
    ["import { POST as intake } from '@/app/api/intake-session/route'", 'const { intake } = globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__'],
    ["import { POST as assessment } from '@/app/api/growth-assessment/route'", 'const { assessment } = globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__'],
    ["import { POST as booking } from '@/app/api/booking-session/route'", 'const { booking } = globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__'],
    ["import { POST as support } from '@/app/api/support/route'", 'const { support } = globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__'],
    ["import { authenticateStudioBridge, StudioBridgeError } from '@/lib/studio-bridge'", 'const { authenticateStudioBridge, StudioBridgeError } = globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__'],
  ])
  const response = await POST(await signedRequest())
  assert.equal(response.status, 201)
  assert.equal(response.headers.get('set-cookie'), `${intakeCookie}; Path=/; HttpOnly; Secure; SameSite=Strict`)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const bookingResponse = await POST(await signedRequest({
    action: 'booking', body: '{}', cookie: `${intakeCookie}; ${bookingCookie}`,
    contentType: 'Application/JSON; charset=UTF-8',
  }))
  assert.equal(bookingResponse.status, 200)
  assert.equal(bookingResponse.headers.get('set-cookie'),
    'phynyx_booking=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0')
  const supportPayload = {
    submissionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'QA Tester', email: 'qa@example.test', message: 'Please help.',
  }
  const supportResponse = await POST(await signedRequest({
    action: 'support', body: JSON.stringify(supportPayload),
  }))
  assert.equal(supportResponse.status, 200)
  assert.equal(supportResponse.headers.get('set-cookie'), null)
  assert.equal(supportResponse.headers.get('cache-control'), 'no-store')
  const rejectedCookieResponse = await POST(await signedRequest({
    action: 'support', body: JSON.stringify(supportPayload), cookie: intakeCookie,
  }))
  assert.equal(rejectedCookieResponse.status, 403)
  delete globalThis.__STUDIO_BRIDGE_ROUTE_STUBS__
})
