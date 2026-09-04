import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildGrowthAssessmentPayloadHashes,
  growthAssessmentPayloadHashMatches,
} from '../lib/growth-assessment-idempotency.ts'

const formValues = [
  'QA',
  'Tester',
  'qa@example.test',
  '+13125550100',
  'QA Company',
  'dental',
  '500k-1m',
  'not-enough-leads',
  'Referrals',
  '3k-5k',
]

const legacyAttribution = {
  landingPage: 'https://phynyx.example/growth-assessment',
  referrer: '',
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'fall',
  utmContent: '',
  utmTerm: '',
  gclid: 'google-123',
  fbclid: '',
}

const currentEmptyExtension = {
  landingPage: legacyAttribution.landingPage,
  referrer: legacyAttribution.referrer,
  entryPoint: '',
  utmSource: legacyAttribution.utmSource,
  utmMedium: legacyAttribution.utmMedium,
  utmCampaign: legacyAttribution.utmCampaign,
  utmContent: legacyAttribution.utmContent,
  utmTerm: legacyAttribution.utmTerm,
  gclid: legacyAttribution.gclid,
  dclid: '',
  gbraid: '',
  wbraid: '',
  fbclid: legacyAttribution.fbclid,
  msclkid: '',
  ttclid: '',
  twclid: '',
  liFatId: '',
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )
  return Buffer.from(digest).toString('hex')
}

test('a retry matches a pre-deployment row with legacy attribution JSON', async () => {
  const legacyStoredHash = await sha256(
    JSON.stringify([...formValues, legacyAttribution]),
  )
  const legacyStoredRow = {
    payloadHash: legacyStoredHash,
    attributionJson: JSON.stringify(legacyAttribution),
  }
  const retryHashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    currentEmptyExtension,
  )

  assert.match(retryHashes.current, /^v2:[0-9a-f]{64}$/)
  assert.equal(
    growthAssessmentPayloadHashMatches(legacyStoredRow.payloadHash, retryHashes),
    true,
  )
  assert.notEqual(legacyStoredRow.attributionJson, null)
})

test('legacy compatibility cannot hide a newly supplied attribution value', async () => {
  const legacyStoredHash = await sha256(
    JSON.stringify([...formValues, legacyAttribution]),
  )
  const changedRetryHashes = await buildGrowthAssessmentPayloadHashes(formValues, {
    ...currentEmptyExtension,
    gbraid: 'new-click-id',
  })

  assert.equal(
    growthAssessmentPayloadHashMatches(legacyStoredHash, changedRetryHashes),
    false,
  )
})

test('unversioned hashes from the immediately previous schema remain retryable', async () => {
  const retryHashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    currentEmptyExtension,
  )

  assert.equal(
    growthAssessmentPayloadHashMatches(
      retryHashes.unversionedCurrent,
      retryHashes,
    ),
    true,
  )
})
