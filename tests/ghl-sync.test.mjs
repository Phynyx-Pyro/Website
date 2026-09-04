import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../lib/ghl.ts', import.meta.url)
const originalFetch = globalThis.fetch

async function loadGhlModule() {
  globalThis.__PHENYX_TEST_ENV__ = {
    GHL_LOCATION_ID: 'location-test',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token-never-sent',
  }
  return importTypeScriptModule(moduleUrl, [
    [
      "import { env } from 'cloudflare:workers'",
      'const env = globalThis.__PHENYX_TEST_ENV__',
    ],
    [
      "import { normalizePhoneForComparison } from './public-form-security'",
      "const normalizePhoneForComparison = (value) => { const digits = String(value).replace(/\\D/g, ''); return digits.length === 10 ? `1${digits}` : digits }",
    ],
  ])
}

function assessmentInput() {
  return {
    submissionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    submittedAt: '2026-09-04T00:00:00.000Z',
    submissionType: 'full-assessment',
    firstName: 'QA',
    lastName: 'Tester',
    email: 'qa@example.test',
    phone: '+13125550100',
    businessName: 'QA Company',
    industry: 'dental',
    annualRevenue: '500k-1m',
    biggestChallenge: 'not-enough-leads',
    currentMarketing: 'Referrals',
    monthlyBudget: '3k-5k',
    attribution: {
      landingPage: 'https://phynyx.example/growth-assessment',
      referrer: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
      gclid: '',
      fbclid: '',
    },
    fit: {
      path: 'calendar',
      tag: 'website-fit-qualified',
      summary: 'Qualified by the deterministic website rules.',
    },
  }
}

test.afterEach(() => {
  globalThis.fetch = originalFetch
})

test('matching existing contacts are resolved without any CRM mutation', async () => {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET' })
    if (String(url).includes('/contacts/search/duplicate')) {
      return Response.json({ contact: { id: 'existing-contact' } })
    }
    if (String(url).endsWith('/contacts/existing-contact')) {
      return Response.json({
        contact: { id: 'existing-contact', email: 'qa@example.test', phone: '(312) 555-0100' },
      })
    }
    throw new Error(`Unexpected request: ${url}`)
  }

  const { resolveGrowthAssessmentContact } = await loadGhlModule()
  const result = await resolveGrowthAssessmentContact(assessmentInput())

  assert.deepEqual(result, { contactId: 'existing-contact', isNew: false })
  assert.deepEqual(calls.map((call) => call.method), ['GET', 'GET'])
  assert.equal(calls.some((call) => call.url.endsWith('/tags')), false)
  assert.equal(calls.some((call) => call.url.endsWith('/notes')), false)
})

test('CRM lookup errors omit submitted identity from logs and error messages', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 500 })
  const { resolveGrowthAssessmentContact } = await loadGhlModule()

  await assert.rejects(resolveGrowthAssessmentContact(assessmentInput()), (error) => {
    assert.equal(error.message.includes('qa@example.test'), false)
    assert.equal(error.message.includes('location-test'), false)
    assert.equal(error.message.includes('?'), false)
    assert.match(error.message, /\/contacts\/search\/duplicate/)
    return true
  })
})

test('metadata retries skip an assessment note that already has the submission marker', async () => {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ url: String(url), method: init.method ?? 'GET', body })
    if (String(url).endsWith('/tags')) return Response.json({ tags: [] })
    if (String(url).endsWith('/notes') && !init.method) {
      return Response.json({
        notes: [{ body: 'Submission ID: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa\nSaved' }],
      })
    }
    throw new Error(`Unexpected request: ${url}`)
  }

  const { syncNewGrowthAssessmentMetadata } = await loadGhlModule()
  await syncNewGrowthAssessmentMetadata('new-contact', assessmentInput())

  assert.deepEqual(calls.map((call) => call.method), ['POST', 'GET'])
  assert.equal(
    calls.filter((call) => call.url.endsWith('/notes') && call.method === 'POST').length,
    0,
  )
})
