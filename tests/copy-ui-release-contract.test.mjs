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
  const resultUpdate = source.indexOf('setAssessmentResult({', bookingRequest)

  assert.ok(assessmentRequest >= 0)
  assert.ok(bookingRequest > assessmentRequest)
  assert.ok(resultUpdate > bookingRequest)
  assert.match(
    source.slice(bookingRequest, resultUpdate),
    /body:\s*'\{\}'/,
  )
  assert.match(source, /onClick=\{\(\) => setCalendarVisible\(true\)\}/)
  assert.doesNotMatch(
    source,
    /investmentContextAcknowledged|recording acknowledgement|record your acknowledgement/i,
  )
})

test('assessment readiness inputs are visibly required and submitted from the structured form', async () => {
  const source = await readFile(assessmentClientUrl, 'utf8')

  for (const id of [
    'assessment-first-name',
    'assessment-email',
    'assessment-phone',
    'assessment-business-name',
    'assessment-industry',
    'assessment-annual-revenue',
    'assessment-monthly-budget',
    'assessment-capacity',
    'assessment-decision-role',
    'assessment-implementation-timing',
    'assessment-follow-up-owner',
  ]) {
    assert.match(
      source,
      new RegExp(`<(?:input|select|SelectField) id=["']${id}["'][^>]*\\brequired\\b`),
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
    'capacity',
    'decisionRole',
    'implementationTiming',
    'followUpOwner',
  ]) {
    assert.match(source, new RegExp(`${field}: string`))
  }
  assert.match(source, /Object\.entries\(form\)/)
  assert.match(source, /snapshot: snapshotInput, consent, website, submissionId/)
})

test('development previews calculate locally without saving contact data', async () => {
  const source = await readFile(assessmentClientUrl, 'utf8')

  assert.match(source, /developmentPreviewRef\.current = true/)
  assert.match(source, /if \(developmentPreviewRef\.current\) \{/)
  assert.match(source, /const snapshot = calculateGrowthSnapshot\(snapshotInput\)/)
  assert.match(source, /Preview mode:.*not saved or sent to the CRM\./s)
  assert.match(source, /Preview mode does not create a CRM contact or appointment\./)
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
