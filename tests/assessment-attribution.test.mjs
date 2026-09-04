import assert from 'node:assert/strict'
import test from 'node:test'
import {
  captureAssessmentAttribution,
  getAssessmentAttribution,
  normalizeAssessmentCtaOrigin,
} from '../lib/assessment-attribution.ts'

test('CTA origin accepts known labels and rejects arbitrary query content', () => {
  assert.equal(normalizeAssessmentCtaOrigin('homepage-hero'), 'homepage-hero')
  assert.equal(normalizeAssessmentCtaOrigin('person@example.com'), '')
})

test('session attribution preserves first touch and records the assessment CTA', () => {
  const values = new Map()
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document

  globalThis.window = {
    crypto: globalThis.crypto,
    location: {
      href:
        'https://phynyxpro.example/industries/chiropractic?utm_source=google&utm_medium=cpc&utm_campaign=fall-growth&utm_content=chiro-ad&utm_term=practice-growth&gclid=google-click&fbclid=facebook-click&msclkid=microsoft-click&private=do-not-store',
      search:
        '?utm_source=google&utm_medium=cpc&utm_campaign=fall-growth&utm_content=chiro-ad&utm_term=practice-growth&gclid=google-click&fbclid=facebook-click&msclkid=microsoft-click&private=do-not-store',
    },
    sessionStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  }
  globalThis.document = {
    referrer: 'https://search.example/results?q=private-search',
  }

  try {
    const firstTouch = captureAssessmentAttribution()
    assert.equal(
      firstTouch.landingPage,
      'https://phynyxpro.example/industries/chiropractic',
    )
    assert.equal(firstTouch.referrer, 'https://search.example/results')
    assert.equal(firstTouch.msclkid, 'microsoft-click')
    assert.match(firstTouch.sessionId, /^[0-9a-f-]{36}$/i)

    globalThis.window.location = {
      href:
        'https://phynyxpro.example/growth-assessment?cta=chiropractic-hero&utm_source=overwritten',
      search: '?cta=chiropractic-hero&utm_source=overwritten',
    }
    globalThis.document.referrer =
      'https://phynyxpro.example/industries/chiropractic'

    const conversion = getAssessmentAttribution()
    assert.equal(
      conversion.conversionPage,
      'https://phynyxpro.example/growth-assessment',
    )
    assert.equal(conversion.landingPage, firstTouch.landingPage)
    assert.equal(conversion.referrer, firstTouch.referrer)
    assert.equal(conversion.utmSource, 'google')
    assert.equal(conversion.gclid, 'google-click')
    assert.equal(conversion.fbclid, 'facebook-click')
    assert.equal(conversion.msclkid, 'microsoft-click')
    assert.equal(conversion.ctaOrigin, 'chiropractic-hero')
    assert.equal(conversion.sessionId, firstTouch.sessionId)

    const stored = [...values.values()].join(' ')
    assert.equal(stored.includes('private-search'), false)
    assert.equal(stored.includes('do-not-store'), false)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalDocument === undefined) delete globalThis.document
    else globalThis.document = originalDocument
  }
})
