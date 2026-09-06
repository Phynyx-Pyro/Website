import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('homepage hero uses the approved promise, support, and diagnostic explanation', async () => {
  const source = await readSource(
    '../app/(marketing)/(home)/_components/hero-section.tsx',
  )

  assert.match(source, /Turn more ad leads into/)
  assert.match(source, /patients who show up\./)
  assert.match(
    source,
    /We run your Meta ads and connect rapid response, booking, reminders, and team handoffs\. Track each lead from campaign source through confirmed appointments, first visits, and starts of care\./,
  )
  assert.match(source, /3-minute fit check → 30-minute diagnostic\./)
  assert.match(source, /Bring the numbers you have\. Missing data is part of what we’ll map\./)
  assert.match(source, /id="homepage-primary-cta"/)
  assert.match(source, /xl:grid-cols-12/)
  assert.doesNotMatch(source, /lg:grid-cols-12/)
})

test('mobile diagnostic bar preserves attribution and yields to page content and navigation', async () => {
  const [stickySource, ctaSource, headerSource] = await Promise.all([
    readSource('../app/(marketing)/(home)/_components/mobile-diagnostic-cta.tsx'),
    readSource('../app/(marketing)/_components/assessment-cta-link.tsx'),
    readSource('../app/(marketing)/_components/site-header.tsx'),
  ])

  assert.match(stickySource, /placement="homepage_mobile_sticky"/)
  assert.match(stickySource, /data-ui-placement="homepage_mobile_sticky"/)
  assert.match(stickySource, /data-mobile-diagnostic-sticky="true"/)
  assert.match(stickySource, /document\.getElementById\('diagnostic'\)/)
  assert.match(stickySource, /document\.querySelector\('footer'\)/)
  assert.match(stickySource, /phynyx:mobile-menu/)
  assert.match(ctaSource, /homepage_mobile_sticky: 'homepage-hero'/)
  assert.match(headerSource, /event\.key !== 'Escape'/)
  assert.match(headerSource, /mobileMenuButtonRef\.current\?\.focus\(\)/)
})

test('assessment validates contact fields and explains timing, thresholds, and privacy', async () => {
  const source = await readSource(
    '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
  )

  assert.match(source, /isValidContactEmail\(form\.email\)/)
  assert.match(source, /isValidContactPhone\(form\.phone\)/)
  assert.match(source, /aria-describedby=\{emailInvalid \? 'assessment-email-error'/)
  assert.match(source, /aria-describedby=\{phoneInvalid \? 'assessment-phone-error'/)
  assert.match(source, /stepHeadingRef\.current\?\.focus\(\)/)
  assert.match(source, /href="\/privacy-policy"/)
  assert.match(source, /3-minute fit check/)
  assert.match(source, /30-minute diagnostic/)
  assert.match(source, /\$500K in annual revenue and \$3K in planned monthly marketing budget/)
  assert.match(source, /These are fit criteria, not package prices\./)
})

test('launch page headings and support opening use the approved copy', async () => {
  const expected = [
    ['../app/(marketing)/growth-system/_components/growth-system-client.tsx', 'Ads, follow-up, and reporting—working as one system.'],
    ['../app/(marketing)/industries/_components/industries-hub-client.tsx', 'Built for chiropractic.'],
    ['../app/(marketing)/industries/chiropractic/_components/chiropractic-client.tsx', 'A patient acquisition system built around your front desk.'],
    ['../app/(marketing)/industries/dental-medspa/_components/dental-medspa-client.tsx', 'Turn more consultation inquiries into attended visits.'],
    ['../app/(marketing)/industries/home-services/_components/home-services-client.tsx', 'Turn more inquiries into scheduled estimates and jobs.'],
    ['../app/(marketing)/about/_components/about-client.tsx', 'Built with a practicing chiropractor’s perspective.'],
    ['../app/(marketing)/pyro-ember/_components/pyro-ember-client.tsx', 'Ember handles approved inquiries and scheduling requests. PYRO keeps the record, follow-up, and team handoff connected.'],
    ['../app/(marketing)/support/_components/support-client.tsx', 'Send a question about PhynyxPro or your PYRO account.'],
  ]

  for (const [path, copy] of expected) {
    assert.ok((await readSource(path)).includes(copy), `${path} should include approved copy`)
  }
})

test('brand action colors meet white-text contrast targets', async () => {
  const source = await readSource('../tailwind.config.ts')

  const contrast = (hex) => {
    const rgb = hex.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
    const linear = rgb.map((channel) => (
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    ))
    const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
    return 1.05 / (luminance + 0.05)
  }

  assert.ok(contrast('B84420') >= 4.5)
  assert.ok(contrast('923416') >= 4.5)
  assert.match(source, /phoenix: '#B84420'/)
  assert.match(source, /ember: '#923416'/)
})
