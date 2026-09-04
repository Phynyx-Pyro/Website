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

const completeAttribution = {
  conversionPage: 'https://phynyxpro.example/growth-assessment',
  landingPage: 'https://phynyxpro.example/industries/dental-medspa',
  referrer: 'https://search.example/results',
  entryPoint: 'dental_medspa_hero',
  ctaOrigin: 'dental_medspa_hero',
  sessionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'fall',
  utmContent: 'hero',
  utmTerm: 'dental growth',
  gclid: 'google-123',
  dclid: 'display-123',
  gbraid: 'gbraid-123',
  wbraid: 'wbraid-123',
  fbclid: 'facebook-123',
  msclkid: 'bing-123',
  ttclid: 'tiktok-123',
  twclid: 'twitter-123',
  liFatId: 'linkedin-123',
}

const emptyAttribution = Object.fromEntries(
  Object.keys(completeAttribution).map((key) => [key, '']),
)

function polishedV2Shape(attribution) {
  return {
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    entryPoint: attribution.entryPoint,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    dclid: attribution.dclid,
    gbraid: attribution.gbraid,
    wbraid: attribution.wbraid,
    fbclid: attribution.fbclid,
    msclkid: attribution.msclkid,
    ttclid: attribution.ttclid,
    twclid: attribution.twclid,
    liFatId: attribution.liFatId,
  }
}

function productionV1Shape(attribution) {
  return {
    conversionPage: attribution.conversionPage,
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    ctaOrigin: attribution.ctaOrigin,
    sessionId: attribution.sessionId,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    msclkid: attribution.msclkid,
  }
}

function legacyShape(attribution) {
  return {
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
  }
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )
  return Buffer.from(digest).toString('hex')
}

async function historicalHash(attributionShape, version = '') {
  const digest = await sha256(
    JSON.stringify([...formValues, attributionShape]),
  )
  return `${version}${digest}`
}

test('v3 hashes cover the complete attribution contract and support an unversioned v3 retry', async () => {
  const hashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    completeAttribution,
  )
  const independentlyComputed = await historicalHash(completeAttribution)

  assert.equal(hashes.current, `v3:${independentlyComputed}`)
  assert.equal(hashes.unversionedCurrent, independentlyComputed)
  assert.equal(growthAssessmentPayloadHashMatches(hashes.current, hashes), true)
  assert.equal(
    growthAssessmentPayloadHashMatches(hashes.unversionedCurrent, hashes),
    true,
  )
})

test('every conversion, CTA, session, campaign, and click field contributes to the v3 hash', async () => {
  const baseline = await buildGrowthAssessmentPayloadHashes(
    formValues,
    emptyAttribution,
  )

  for (const field of Object.keys(completeAttribution)) {
    const hashes = await buildGrowthAssessmentPayloadHashes(formValues, {
      ...emptyAttribution,
      [field]: completeAttribution[field],
    })
    assert.notEqual(hashes.current, baseline.current, `${field} must affect v3`)
  }
})

test('a polished-v2 row remains retryable after the route aliases CTA origin to its entry point', async () => {
  const retryAttribution = {
    ...completeAttribution,
    conversionPage: '',
    ctaOrigin: completeAttribution.entryPoint,
    sessionId: '',
  }
  const storedHash = await historicalHash(
    polishedV2Shape(retryAttribution),
    'v2:',
  )
  const unversionedStoredHash = storedHash.slice('v2:'.length)
  const hashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    retryAttribution,
  )

  assert.equal(hashes.polishedV2, storedHash)
  assert.equal(hashes.unversionedPolishedV2, unversionedStoredHash)
  assert.equal(hashes.polishedV2Compatible, true)
  assert.equal(growthAssessmentPayloadHashMatches(storedHash, hashes), true)
  assert.equal(
    growthAssessmentPayloadHashMatches(unversionedStoredHash, hashes),
    true,
  )
})

test('polished-v2 compatibility cannot hide newly supplied conversion, CTA, or session data', async () => {
  const historicalAttribution = {
    ...completeAttribution,
    conversionPage: '',
    ctaOrigin: '',
    sessionId: '',
  }
  const storedHash = await historicalHash(
    polishedV2Shape(historicalAttribution),
    'v2:',
  )

  for (const field of ['conversionPage', 'ctaOrigin', 'sessionId']) {
    const hashes = await buildGrowthAssessmentPayloadHashes(formValues, {
      ...historicalAttribution,
      [field]:
        field === 'ctaOrigin'
          ? 'independently_changed_cta'
          : completeAttribution[field],
    })
    assert.equal(hashes.polishedV2Compatible, false, field)
    assert.equal(growthAssessmentPayloadHashMatches(storedHash, hashes), false, field)
  }
})

test('an unversioned production-v1/962 row remains retryable with its exact field order', async () => {
  const retryAttribution = {
    ...completeAttribution,
    dclid: '',
    gbraid: '',
    wbraid: '',
    ttclid: '',
    twclid: '',
    liFatId: '',
  }
  const storedHash = await historicalHash(productionV1Shape(retryAttribution))
  const hashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    retryAttribution,
  )

  assert.equal(hashes.productionV1, storedHash)
  assert.equal(hashes.productionV1Compatible, true)
  assert.equal(growthAssessmentPayloadHashMatches(storedHash, hashes), true)
})

test('production-v1/962 compatibility rejects a distinct entry point or expanded click ID', async () => {
  const historicalAttribution = {
    ...completeAttribution,
    dclid: '',
    gbraid: '',
    wbraid: '',
    ttclid: '',
    twclid: '',
    liFatId: '',
  }
  const storedHash = await historicalHash(productionV1Shape(historicalAttribution))

  for (const field of [
    'entryPoint',
    'dclid',
    'gbraid',
    'wbraid',
    'ttclid',
    'twclid',
    'liFatId',
  ]) {
    const hashes = await buildGrowthAssessmentPayloadHashes(formValues, {
      ...historicalAttribution,
      [field]:
        field === 'entryPoint'
          ? 'independently_changed_entry'
          : completeAttribution[field],
    })
    assert.equal(hashes.productionV1Compatible, false, field)
    assert.equal(growthAssessmentPayloadHashMatches(storedHash, hashes), false, field)
  }
})

test('the oldest legacy row remains retryable only when every later field is empty', async () => {
  const retryAttribution = {
    ...emptyAttribution,
    landingPage: completeAttribution.landingPage,
    referrer: completeAttribution.referrer,
    utmSource: completeAttribution.utmSource,
    utmMedium: completeAttribution.utmMedium,
    utmCampaign: completeAttribution.utmCampaign,
    utmContent: completeAttribution.utmContent,
    utmTerm: completeAttribution.utmTerm,
    gclid: completeAttribution.gclid,
    fbclid: completeAttribution.fbclid,
  }
  const storedHash = await historicalHash(legacyShape(retryAttribution))
  const hashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    retryAttribution,
  )

  assert.equal(hashes.legacy, storedHash)
  assert.equal(hashes.legacyCompatible, true)
  assert.equal(growthAssessmentPayloadHashMatches(storedHash, hashes), true)

  for (const field of [
    'conversionPage',
    'entryPoint',
    'ctaOrigin',
    'sessionId',
    'dclid',
    'gbraid',
    'wbraid',
    'msclkid',
    'ttclid',
    'twclid',
    'liFatId',
  ]) {
    const changedHashes = await buildGrowthAssessmentPayloadHashes(formValues, {
      ...retryAttribution,
      [field]: completeAttribution[field],
    })
    assert.equal(changedHashes.legacyCompatible, false, field)
    assert.equal(
      growthAssessmentPayloadHashMatches(storedHash, changedHashes),
      false,
      field,
    )
  }
})

test('unrelated or malformed stored hashes never match', async () => {
  const hashes = await buildGrowthAssessmentPayloadHashes(
    formValues,
    emptyAttribution,
  )

  assert.equal(growthAssessmentPayloadHashMatches(null, hashes), false)
  assert.equal(growthAssessmentPayloadHashMatches('', hashes), false)
  assert.equal(growthAssessmentPayloadHashMatches('v3:not-a-digest', hashes), false)
  assert.equal(
    growthAssessmentPayloadHashMatches(`v4:${hashes.unversionedCurrent}`, hashes),
    false,
  )
})
