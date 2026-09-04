import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
  buildAssessmentHref,
  buildAssessmentRedirectUrl,
  buildAssessmentStartHref,
  captureAssessmentSessionAttribution,
  getAssessmentAttribution,
  normalizeAssessmentEntryPoint,
  normalizeAssessmentLandingPath,
  readAssessmentSessionAttribution,
} from '../lib/assessment-attribution.ts'
import { ASSESSMENT_INDUSTRIES } from '../lib/assessment-industry.ts'

function createMemoryStorage() {
  const values = new Map()
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
}

test('assessment href preserves only whitelisted campaign and click identifiers', () => {
  const href = buildAssessmentHref(
    '?utm_source=meta&utm_campaign=fall&gclid=google-123&msclkid=bing-123&email=private%40example.com&unknown=drop-me',
    'hero_primary',
    '/',
  )
  const url = new URL(href, 'https://phynyxpro.example')

  assert.equal(url.pathname, '/growth-assessment')
  assert.equal(url.searchParams.get('utm_source'), 'meta')
  assert.equal(url.searchParams.get('utm_campaign'), 'fall')
  assert.equal(url.searchParams.get('gclid'), 'google-123')
  assert.equal(url.searchParams.get('msclkid'), 'bing-123')
  assert.equal(url.searchParams.get('assessment_entry'), 'hero_primary')
  assert.equal(url.searchParams.get('assessment_landing_path'), '/')
  assert.equal(url.searchParams.has('email'), false)
  assert.equal(url.searchParams.has('unknown'), false)
})

test('pre-hydration assessment handoff recovers attribution from a same-origin referrer', () => {
  const startHref = buildAssessmentStartHref('homepage_hero', 'chiropractic')
  const destination = buildAssessmentRedirectUrl(
    `https://phynyxpro.example${startHref}`,
    'https://phynyxpro.example/?utm_source=meta&gclid=google-123&email=drop-me',
  )

  assert.equal(destination.pathname, '/growth-assessment')
  assert.equal(destination.searchParams.get('utm_source'), 'meta')
  assert.equal(destination.searchParams.get('gclid'), 'google-123')
  assert.equal(destination.searchParams.get('assessment_entry'), 'homepage_hero')
  assert.equal(destination.searchParams.get('assessment_landing_path'), '/')
  assert.equal(destination.searchParams.get('industry'), 'chiropractic')
  assert.equal(destination.searchParams.has('email'), false)
})

test('pre-hydration assessment handoff ignores cross-origin referrer attribution', () => {
  const destination = buildAssessmentRedirectUrl(
    'https://phynyxpro.example/growth-assessment/start?assessment_entry=header_desktop',
    'https://attacker.example/?utm_source=spoofed&gclid=spoofed',
  )

  assert.equal(destination.searchParams.has('utm_source'), false)
  assert.equal(destination.searchParams.has('gclid'), false)
  assert.equal(destination.searchParams.get('assessment_entry'), 'header_desktop')
})

test('pre-hydration assessment handoff preserves every supported industry', () => {
  for (const industry of ASSESSMENT_INDUSTRIES) {
    const startHref = buildAssessmentStartHref('header_desktop', industry)
    const destination = buildAssessmentRedirectUrl(
      `https://phynyxpro.example${startHref}`,
      'https://phynyxpro.example/growth-system',
    )

    assert.equal(destination.searchParams.get('industry'), industry)
  }
})

test('assessment entry points and landing paths reject unsafe values', () => {
  assert.equal(normalizeAssessmentEntryPoint(' Mobile_Sticky '), 'mobile_sticky')
  assert.equal(normalizeAssessmentEntryPoint('email@example.com'), '')
  assert.equal(normalizeAssessmentLandingPath('/industries/chiropractic?private=1'), '/industries/chiropractic')
  assert.equal(normalizeAssessmentLandingPath('//attacker.example/path'), '')
  assert.equal(normalizeAssessmentLandingPath('https://attacker.example/path'), '')
})

test('first-touch campaign attribution survives internal navigation to a diagnostic CTA', () => {
  const storage = createMemoryStorage()
  const longCampaign = `fall-${'x'.repeat(600)}`
  const firstTouch = captureAssessmentSessionAttribution(
    `?utm_source=meta&utm_campaign=${longCampaign}&gclid=google-123&dclid=display-123&gbraid=gbraid-123&wbraid=wbraid-123&fbclid=facebook-123&msclkid=bing-123&ttclid=tiktok-123&twclid=twitter-123&li_fat_id=linkedin-123&email=private%40example.com&unknown=drop-me`,
    '/industries/home-services?ignored=1',
    storage,
  )

  const afterInternalNavigation = captureAssessmentSessionAttribution(
    '?utm_source=should-not-replace-first-touch',
    '/growth-system',
    storage,
  )
  const href = buildAssessmentHref(
    '',
    'growth_system_final',
    '/growth-system',
    afterInternalNavigation,
  )
  const url = new URL(href, 'https://phynyxpro.example')

  assert.deepEqual(afterInternalNavigation, firstTouch)
  assert.equal(url.searchParams.get('utm_source'), 'meta')
  assert.equal(url.searchParams.get('utm_campaign').length, 500)
  assert.equal(url.searchParams.get('gclid'), 'google-123')
  assert.equal(url.searchParams.get('dclid'), 'display-123')
  assert.equal(url.searchParams.get('gbraid'), 'gbraid-123')
  assert.equal(url.searchParams.get('wbraid'), 'wbraid-123')
  assert.equal(url.searchParams.get('fbclid'), 'facebook-123')
  assert.equal(url.searchParams.get('msclkid'), 'bing-123')
  assert.equal(url.searchParams.get('ttclid'), 'tiktok-123')
  assert.equal(url.searchParams.get('twclid'), 'twitter-123')
  assert.equal(url.searchParams.get('li_fat_id'), 'linkedin-123')
  assert.equal(url.searchParams.get('assessment_landing_path'), '/industries/home-services')
  assert.equal(url.searchParams.get('assessment_entry'), 'growth_system_final')
  assert.equal(url.searchParams.has('email'), false)
  assert.equal(url.searchParams.has('unknown'), false)
})

test('session attribution storage is versioned and discards unknown or unsafe data', () => {
  const storage = createMemoryStorage()
  storage.setItem(
    ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
    JSON.stringify({
      landingPath: '/results\u0000?private=1',
      utm_source: '  search\u0007  ',
      email: 'private@example.com',
      assessment_entry: 'stale_entry',
    }),
  )

  assert.match(ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY, /:v1$/)
  assert.deepEqual(readAssessmentSessionAttribution(storage), {
    landingPath: '/results',
    utm_source: 'search',
  })
})

test('direct assessment query attribution is sanitized and length-limited', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document

  try {
    globalThis.window = {
      location: {
        href: `https://phynyxpro.example/growth-assessment?utm_source=%00paid&utm_campaign=${'x'.repeat(600)}`,
        origin: 'https://phynyxpro.example',
        search: `?utm_source=%00paid&utm_campaign=${'x'.repeat(600)}`,
      },
    }
    globalThis.document = { referrer: '' }

    const attribution = getAssessmentAttribution()
    assert.equal(attribution.utmSource, 'paid')
    assert.equal(attribution.utmCampaign.length, 500)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})
