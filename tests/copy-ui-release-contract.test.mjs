import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const assessmentClientUrl = new URL(
  '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
  import.meta.url,
)
const bookingCalendarUrl = new URL(
  '../app/(marketing)/growth-assessment/_components/booking-calendar.tsx',
  import.meta.url,
)

test('polished assessment retains the deployed submission and booking handoff', async () => {
  const source = await readFile(assessmentClientUrl, 'utf8')
  const assessmentRequest = source.indexOf("fetch('/api/growth-assessment'")
  const bookingRequest = source.indexOf("fetch('/api/booking-session'")
  const resultUpdate = source.indexOf('setAssessmentResult({')

  assert.ok(assessmentRequest >= 0)
  assert.ok(bookingRequest > assessmentRequest)
  assert.ok(resultUpdate > bookingRequest)
  assert.match(
    source.slice(bookingRequest, resultUpdate),
    /body:\s*'\{\}'/,
  )
  assert.match(source, /onClick=\{\(\) => setInvestmentAccepted\(true\)\}/)
  assert.doesNotMatch(
    source,
    /investmentContextAcknowledged|recording acknowledgement|record your acknowledgement/i,
  )
})

test('assessment fit inputs are visibly required without changing submitted field names', async () => {
  const source = await readFile(assessmentClientUrl, 'utf8')

  for (const id of [
    'assessment-first-name',
    'assessment-email',
    'assessment-phone',
    'assessment-business-name',
    'assessment-industry',
    'assessment-annual-revenue',
    'assessment-monthly-budget',
  ]) {
    assert.match(
      source,
      new RegExp(`<(?:input|select) id=["']${id}["'][^>]*\\brequired\\b`),
      `${id} should be required`,
    )
  }

  for (const field of [
    'firstName',
    'lastName',
    'email',
    'phone',
    'businessName',
    'industry',
    'annualRevenue',
    'biggestChallenge',
    'currentMarketing',
    'monthlyBudget',
  ]) {
    assert.match(source, new RegExp(`name=["']${field}["']`))
  }
})

test('calendar keeps the deployed secure prefill lifecycle', async () => {
  const source = await readFile(bookingCalendarUrl, 'utf8')

  assert.match(source, /export function BookingCalendar\(\{ contact \}: \{ contact: BookingContact \}\)/)
  assert.match(source, /onLoad=\{sendSecurePrefill\}/)
  assert.match(source, /event\.origin !== GHL_BOOKING_ORIGIN/)
  assert.match(source, /event\.source !== iframeRef\.current\?\.contentWindow/)
  assert.doesNotMatch(source, /qualificationPath|funnel-events/)
})

test('backend-dependent funnel additions remain excluded', async () => {
  for (const file of [
    '../app/(marketing)/growth-assessment/start/route.ts',
    '../lib/funnel-events.ts',
    '../lib/growth-assessment-idempotency.ts',
  ]) {
    await assert.rejects(
      readFile(new URL(file, import.meta.url), 'utf8'),
      (error) => error?.code === 'ENOENT',
    )
  }
})
