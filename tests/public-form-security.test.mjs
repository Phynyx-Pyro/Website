import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../lib/public-form-security.ts', import.meta.url)

async function loadSecurityModule(db = {}) {
  globalThis.__PHENYX_TEST_ENV__ = { DB: db }
  return importTypeScriptModule(moduleUrl, [
    [
      "import { env } from 'cloudflare:workers'",
      'const env = globalThis.__PHENYX_TEST_ENV__',
    ],
  ])
}

test('submission IDs are mandatory UUIDs and normalize safely', async () => {
  const { normalizeSubmissionId } = await loadSecurityModule()

  assert.equal(
    normalizeSubmissionId('AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  )
  assert.throws(() => normalizeSubmissionId(undefined), { code: 'INVALID_SUBMISSION_ID' })
  assert.throws(() => normalizeSubmissionId('same-value-every-time'), {
    code: 'INVALID_SUBMISSION_ID',
  })
})

test('bounded JSON parsing enforces origin, media type, and streamed size', async () => {
  const { readBoundedJson } = await loadSecurityModule()
  const validHeaders = {
    Origin: 'https://phynyx.example',
    'Content-Type': 'application/json',
  }

  const parsed = await readBoundedJson(
    new Request('https://phynyx.example/api/support', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ message: 'hello' }),
    }),
    128,
  )
  assert.deepEqual(parsed, { message: 'hello' })

  await assert.rejects(
    readBoundedJson(
      new Request('https://phynyx.example/api/support', {
        method: 'POST',
        headers: { ...validHeaders, Origin: 'https://attacker.example' },
        body: '{}',
      }),
      128,
    ),
    { code: 'INVALID_ORIGIN' },
  )

  await assert.rejects(
    readBoundedJson(
      new Request('https://phynyx.example/api/support', {
        method: 'POST',
        headers: { ...validHeaders, 'Content-Type': 'application/jsonp' },
        body: '{}',
      }),
      128,
    ),
    { code: 'UNSUPPORTED_MEDIA_TYPE' },
  )

  await assert.rejects(
    readBoundedJson(
      new Request('https://phynyx.example/api/support', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({ message: 'x'.repeat(256) }),
      }),
      64,
    ),
    { code: 'PAYLOAD_TOO_LARGE' },
  )
})

test('a rejected client rate limit does not consume the shared global budget', async () => {
  const statements = []
  const db = {
    prepare(sql) {
      statements.push(sql)
      return {
        bind() {
          return {
            async first() {
              return { count: 999, expires_at: Date.now() + 60_000 }
            },
            async run() {},
          }
        },
      }
    },
  }
  const { enforcePublicFormRateLimit } = await loadSecurityModule(db)

  await assert.rejects(
    enforcePublicFormRateLimit({
      request: new Request('https://phynyx.example/api/support', {
        headers: { 'CF-Connecting-IP': '203.0.113.8' },
      }),
      scope: 'support',
      identity: 'lead@example.test',
    }),
    { code: 'RATE_LIMITED' },
  )

  assert.equal(statements.length, 1)
  assert.match(statements[0], /INSERT INTO public_form_rate_limits/)
})
