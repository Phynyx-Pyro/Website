import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAssessmentHref,
  buildAssessmentRedirectUrl,
  buildAssessmentStartHref,
  normalizeAssessmentEntryPoint,
  normalizeAssessmentLandingPath,
} from '../lib/assessment-attribution.ts'

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

test('assessment entry points and landing paths reject unsafe values', () => {
  assert.equal(normalizeAssessmentEntryPoint(' Mobile_Sticky '), 'mobile_sticky')
  assert.equal(normalizeAssessmentEntryPoint('email@example.com'), '')
  assert.equal(normalizeAssessmentLandingPath('/industries/chiropractic?private=1'), '/industries/chiropractic')
  assert.equal(normalizeAssessmentLandingPath('//attacker.example/path'), '')
  assert.equal(normalizeAssessmentLandingPath('https://attacker.example/path'), '')
})
