import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
  ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY,
  buildAssessmentHref,
  buildAssessmentRedirectUrl,
  buildAssessmentStartHref,
  captureAssessmentAttribution,
  captureAssessmentSessionAttribution,
  getAssessmentAttribution,
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
  normalizeAssessmentEntryPoint,
  normalizeAssessmentLandingPath,
  normalizeWebsiteSessionId,
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
    '?utm_source=meta&utm_campaign=fall&gclid=google-123&dclid=display-123&gbraid=gbraid-123&wbraid=wbraid-123&fbclid=facebook-123&msclkid=bing-123&ttclid=tiktok-123&twclid=twitter-123&li_fat_id=linkedin-123&email=private%40example.com&unknown=drop-me',
    'homepage_hero',
    '/',
  )
  const url = new URL(href, 'https://phynyxpro.example')

  assert.equal(url.pathname, '/growth-assessment')
  assert.equal(url.searchParams.get('utm_source'), 'meta')
  assert.equal(url.searchParams.get('utm_campaign'), 'fall')
  assert.equal(url.searchParams.get('gclid'), 'google-123')
  assert.equal(url.searchParams.get('dclid'), 'display-123')
  assert.equal(url.searchParams.get('gbraid'), 'gbraid-123')
  assert.equal(url.searchParams.get('wbraid'), 'wbraid-123')
  assert.equal(url.searchParams.get('fbclid'), 'facebook-123')
  assert.equal(url.searchParams.get('msclkid'), 'bing-123')
  assert.equal(url.searchParams.get('ttclid'), 'tiktok-123')
  assert.equal(url.searchParams.get('twclid'), 'twitter-123')
  assert.equal(url.searchParams.get('li_fat_id'), 'linkedin-123')
  assert.equal(url.searchParams.get('assessment_entry'), 'homepage_hero')
  assert.equal(url.searchParams.get('assessment_landing_path'), '/')
  assert.equal(url.searchParams.has('email'), false)
  assert.equal(url.searchParams.has('unknown'), false)
})

test('pre-hydration assessment handoff recovers same-origin attribution and healthcare audience', () => {
  const startHref = buildAssessmentStartHref('homepage_hero', 'chiropractic')
  const destination = buildAssessmentRedirectUrl(
    `https://phynyxpro.example${startHref}&audience=healthcare`,
    'https://phynyxpro.example/?utm_source=meta&gclid=google-123&email=drop-me',
  )

  assert.equal(destination.pathname, '/growth-assessment')
  assert.equal(destination.searchParams.get('utm_source'), 'meta')
  assert.equal(destination.searchParams.get('gclid'), 'google-123')
  assert.equal(destination.searchParams.get('assessment_entry'), 'homepage_hero')
  assert.equal(destination.searchParams.get('assessment_landing_path'), '/')
  assert.equal(destination.searchParams.get('industry'), 'chiropractic')
  assert.equal(destination.searchParams.get('audience'), 'healthcare')
  assert.equal(destination.searchParams.has('email'), false)
})

test('pre-hydration assessment handoff ignores cross-origin attribution and unknown audiences', () => {
  const destination = buildAssessmentRedirectUrl(
    'https://phynyxpro.example/growth-assessment/start?assessment_entry=header_desktop&audience=financial',
    'https://attacker.example/?utm_source=spoofed&gclid=spoofed',
  )

  assert.equal(destination.searchParams.has('utm_source'), false)
  assert.equal(destination.searchParams.has('gclid'), false)
  assert.equal(destination.searchParams.has('audience'), false)
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

test('redirected first-touch landing persists for a later direct assessment visit', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const storage = createMemoryStorage()
  const redirected = buildAssessmentRedirectUrl(
    'https://phynyxpro.example/growth-assessment/start?assessment_entry=dental_medspa_hero',
    'https://phynyxpro.example/industries/dental-medspa?utm_source=meta&gclid=google-123',
  )

  try {
    globalThis.window = {
      location: {
        href: redirected.href,
        origin: redirected.origin,
        pathname: redirected.pathname,
        search: redirected.search,
      },
      sessionStorage: storage,
    }
    globalThis.document = {
      referrer: 'https://phynyxpro.example/industries/dental-medspa',
    }

    captureAssessmentAttribution()
    assert.equal(
      readAssessmentSessionAttribution(storage).landingPath,
      '/industries/dental-medspa',
    )

    const direct = new URL(
      'https://phynyxpro.example/growth-assessment',
    )
    globalThis.window.location = {
      href: direct.href,
      origin: direct.origin,
      pathname: direct.pathname,
      search: direct.search,
    }

    const laterAttribution = getAssessmentAttribution()
    assert.equal(
      laterAttribution.landingPage,
      'https://phynyxpro.example/industries/dental-medspa',
    )
    assert.equal(laterAttribution.utmSource, 'meta')
    assert.equal(laterAttribution.gclid, 'google-123')
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})

test('entry points, CTA origins, landing paths, and session IDs reject unsafe values', () => {
  assert.equal(
    normalizeAssessmentEntryPoint(' Header_Desktop '),
    'header_desktop',
  )
  assert.equal(normalizeAssessmentCtaOrigin(' Growth-System_Hero '), '')
  assert.equal(normalizeAssessmentEntryPoint('email@example.com'), '')
  assert.equal(normalizeAssessmentEntryPoint('invented_reporting_bucket'), '')
  assert.equal(normalizeAssessmentLandingPath('/industries/chiropractic?private=1'), '/industries/chiropractic')
  assert.equal(normalizeAssessmentLandingPath('//attacker.example/path'), '')
  assert.equal(normalizeAssessmentLandingPath('https://attacker.example/path'), '')
  assert.equal(
    normalizeWebsiteSessionId(' AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE '),
    'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
  )
  assert.equal(normalizeWebsiteSessionId('aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee'), '')
  assert.equal(normalizeWebsiteSessionId('not-a-session-id'), '')
})

test('first-touch campaign and referrer survive internal navigation to a diagnostic CTA', () => {
  const storage = createMemoryStorage()
  const longCampaign = `fall-${'x'.repeat(600)}`
  const firstTouch = captureAssessmentSessionAttribution(
    `?utm_source=meta&utm_campaign=${longCampaign}&gclid=google-123&dclid=display-123&gbraid=gbraid-123&wbraid=wbraid-123&fbclid=facebook-123&msclkid=bing-123&ttclid=tiktok-123&twclid=twitter-123&li_fat_id=linkedin-123&email=private%40example.com&unknown=drop-me`,
    '/industries/home-services?ignored=1',
    storage,
    'https://search.example/results?email=private%40example.com#sensitive',
  )

  const afterInternalNavigation = captureAssessmentSessionAttribution(
    '?utm_source=should-not-replace-first-touch',
    '/growth-system',
    storage,
    'https://phynyxpro.example/industries/home-services?internal=1',
  )
  const href = buildAssessmentHref(
    '',
    'growth_system_final',
    '/growth-system',
    afterInternalNavigation,
  )
  const url = new URL(href, 'https://phynyxpro.example')

  assert.deepEqual(afterInternalNavigation, firstTouch)
  assert.equal(firstTouch.referrer, 'https://search.example/results')
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
      referrer: 'javascript:alert(1)',
      utm_source: '  search\u0007  ',
      email: 'private@example.com',
      assessment_entry: 'stale_entry',
    }),
  )

  assert.match(ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY, /:v1$/)
  assert.match(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY, /:v1$/)
  assert.deepEqual(readAssessmentSessionAttribution(storage), {
    landingPath: '/results',
    utm_source: 'search',
  })
})

test('stored first touch cannot be replaced by a later handoff or internal referrer', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const storage = createMemoryStorage()
  storage.setItem(
    ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
    JSON.stringify({ landingPath: '/original-entry' }),
  )

  try {
    const currentUrl = new URL(
      'https://phynyxpro.example/growth-assessment?assessment_landing_path=/later-page',
    )
    globalThis.window = {
      location: {
        href: currentUrl.href,
        origin: currentUrl.origin,
        pathname: currentUrl.pathname,
        search: currentUrl.search,
      },
      sessionStorage: storage,
    }
    globalThis.document = {
      referrer: 'https://phynyxpro.example/internal-navigation',
    }

    const attribution = getAssessmentAttribution()
    assert.equal(
      attribution.landingPage,
      'https://phynyxpro.example/original-entry',
    )
    assert.equal(attribution.referrer, '')
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})

test('legacy deployed session attribution migrates without losing first touch', () => {
  const storage = createMemoryStorage()
  const sessionId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  storage.setItem(
    'phynyx:assessment-attribution:v1',
    JSON.stringify({
      landingPage:
        'https://phynyxpro.example/industries/chiropractic?private=drop',
      referrer: 'https://search.example/results?q=drop',
      ctaOrigin: 'chiropractic-hero',
      sessionId,
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'legacy-campaign',
      gclid: 'legacy-google-click',
      msclkid: 'legacy-microsoft-click',
    }),
  )

  assert.deepEqual(readAssessmentSessionAttribution(storage), {
    landingPath: '/industries/chiropractic',
    referrer: 'https://search.example/results',
    entryPoint: 'chiropractic-hero',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'legacy-campaign',
    gclid: 'legacy-google-click',
    msclkid: 'legacy-microsoft-click',
  })
  assert.equal(
    storage.getItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY),
    sessionId,
  )
  assert.ok(storage.getItem(ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY))
})

test('coexisting storage generations retain legacy first touch and current-only fields', () => {
  const storage = createMemoryStorage()
  const sessionId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  storage.setItem(
    ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
    JSON.stringify({
      landingPath: '/newer-navigation',
      referrer: 'https://phynyxpro.example/internal',
      entryPoint: 'growth_system_final',
      utm_source: 'newer-source',
      wbraid: 'current-only-wbraid',
    }),
  )
  storage.setItem(
    'phynyx:assessment-attribution:v1',
    JSON.stringify({
      landingPage: 'https://phynyxpro.example/original-landing?private=drop',
      referrer: 'https://search.example/original?q=drop',
      ctaOrigin: 'chiropractic-hero',
      sessionId,
      utmSource: 'legacy-google',
      gclid: 'legacy-click',
    }),
  )

  assert.deepEqual(readAssessmentSessionAttribution(storage), {
    landingPath: '/original-landing',
    referrer: 'https://search.example/original',
    entryPoint: 'chiropractic-hero',
    utm_source: 'legacy-google',
    gclid: 'legacy-click',
    wbraid: 'current-only-wbraid',
  })
  assert.equal(
    storage.getItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY),
    sessionId,
  )
})

test('deployed CTA query tokens remain readable while current tokens take precedence', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const storage = createMemoryStorage()

  try {
    const setLocation = (search) => {
      const currentUrl = new URL(
        `https://phynyxpro.example/growth-assessment${search}`,
      )
      globalThis.window = {
        location: {
          href: currentUrl.href,
          origin: currentUrl.origin,
          pathname: currentUrl.pathname,
          search: currentUrl.search,
        },
        sessionStorage: storage,
      }
    }
    globalThis.document = { referrer: '' }

    setLocation('?cta=chiropractic-hero')
    assert.equal(getAssessmentAttribution().entryPoint, 'chiropractic-hero')

    setLocation('?cta=unknown-legacy-placement')
    assert.equal(getAssessmentAttribution().entryPoint, '')

    setLocation('?assessment_entry=homepage_hero&cta=chiropractic-hero')
    assert.equal(getAssessmentAttribution().entryPoint, 'homepage_hero')
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})

test('assessment conversion attribution keeps first-touch context and a stable website session', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const storage = createMemoryStorage()
  const sessionId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'

  captureAssessmentSessionAttribution(
    '?utm_source=meta&utm_campaign=fall&gclid=google-123&dclid=display-123&gbraid=gbraid-123&wbraid=wbraid-123&fbclid=facebook-123&msclkid=bing-123&ttclid=tiktok-123&twclid=twitter-123&li_fat_id=linkedin-123',
    '/industries/home-services',
    storage,
    'https://search.example/results?query=private#section',
  )
  storage.setItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY, sessionId)
  const href = buildAssessmentHref(
    '',
    'growth_system_final',
    '/growth-system',
    readAssessmentSessionAttribution(storage),
  )

  try {
    const currentUrl = new URL(href, 'https://phynyxpro.example')
    globalThis.window = {
      location: {
        href: currentUrl.href,
        origin: currentUrl.origin,
        pathname: currentUrl.pathname,
        search: currentUrl.search,
      },
      sessionStorage: storage,
    }
    globalThis.document = {
      referrer: 'https://phynyxpro.example/growth-system?internal=1',
    }

    const attribution = getAssessmentAttribution()

    assert.equal(attribution.conversionPage, 'https://phynyxpro.example/growth-assessment')
    assert.equal(attribution.landingPage, 'https://phynyxpro.example/industries/home-services')
    assert.equal(attribution.referrer, 'https://search.example/results')
    assert.equal(attribution.entryPoint, 'growth_system_final')
    assert.equal(attribution.ctaOrigin, 'growth_system_final')
    assert.equal(attribution.sessionId, sessionId)
    assert.equal(attribution.utmSource, 'meta')
    assert.equal(attribution.utmCampaign, 'fall')
    assert.equal(attribution.gclid, 'google-123')
    assert.equal(attribution.dclid, 'display-123')
    assert.equal(attribution.gbraid, 'gbraid-123')
    assert.equal(attribution.wbraid, 'wbraid-123')
    assert.equal(attribution.fbclid, 'facebook-123')
    assert.equal(attribution.msclkid, 'bing-123')
    assert.equal(attribution.ttclid, 'tiktok-123')
    assert.equal(attribution.twclid, 'twitter-123')
    assert.equal(attribution.liFatId, 'linkedin-123')
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})

test('direct assessment query attribution is sanitized, minimized, and assigned a session', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const storage = createMemoryStorage()

  try {
    const href = `https://phynyxpro.example/growth-assessment?utm_source=%00paid&utm_campaign=${'x'.repeat(600)}`
    const currentUrl = new URL(href)
    globalThis.window = {
      location: {
        href,
        origin: currentUrl.origin,
        pathname: currentUrl.pathname,
        search: currentUrl.search,
      },
      sessionStorage: storage,
    }
    globalThis.document = {
      referrer: 'https://partner.example/referral?email=private%40example.com#fragment',
    }

    const attribution = getAssessmentAttribution()
    assert.equal(attribution.conversionPage, 'https://phynyxpro.example/growth-assessment')
    assert.equal(attribution.landingPage, 'https://phynyxpro.example/growth-assessment')
    assert.equal(attribution.referrer, 'https://partner.example/referral')
    assert.equal(attribution.utmSource, 'paid')
    assert.equal(attribution.utmCampaign.length, 500)
    assert.match(
      attribution.sessionId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
    assert.equal(
      storage.getItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY),
      attribution.sessionId,
    )
    assert.equal(getAssessmentAttribution().sessionId, attribution.sessionId)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})

test('direct assessment navigation retains stored campaign and click attribution', () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const storage = createMemoryStorage()

  captureAssessmentSessionAttribution(
    '?utm_source=meta&utm_campaign=first-touch&gclid=google-123&fbclid=facebook-123',
    '/results',
    storage,
    'https://search.example/results?q=private',
  )

  try {
    const currentUrl = new URL(
      'https://phynyxpro.example/growth-assessment',
    )
    globalThis.window = {
      location: {
        href: currentUrl.href,
        origin: currentUrl.origin,
        pathname: currentUrl.pathname,
        search: currentUrl.search,
      },
      sessionStorage: storage,
    }
    globalThis.document = { referrer: 'https://phynyxpro.example/results' }

    const attribution = getAssessmentAttribution()
    assert.equal(attribution.landingPage, 'https://phynyxpro.example/results')
    assert.equal(attribution.referrer, 'https://search.example/results')
    assert.equal(attribution.utmSource, 'meta')
    assert.equal(attribution.utmCampaign, 'first-touch')
    assert.equal(attribution.gclid, 'google-123')
    assert.equal(attribution.fbclid, 'facebook-123')
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})

test('attribution URLs retain only a safe HTTP(S) origin and path', () => {
  assert.equal(
    minimizeAttributionUrl(
      '\u0000 https://user:password@partner.example/referral?email=private%40example.com#fragment ',
    ),
    'https://partner.example/referral',
  )
  assert.equal(minimizeAttributionUrl('http://example.test/path?q=1'), 'http://example.test/path')
  assert.equal(minimizeAttributionUrl('javascript:alert(1)'), '')
  assert.equal(minimizeAttributionUrl('ftp://example.test/file'), '')
  assert.equal(minimizeAttributionUrl('not a url'), '')
})
