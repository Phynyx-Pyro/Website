import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('homepage hero uses the approved promise, support, and diagnostic explanation', async () => {
  const source = await readSource(
    '../app/(marketing)/(home)/_components/hero-section.tsx',
  )

  assert.match(source, /From Ad Click to/)
  assert.match(source, /First Visit/)
  assert.match(
    source,
    /We run your Meta ads and connect rapid response, booking, reminders, and team handoffs\. Track each lead from campaign source through confirmed appointments, first visits, and starts of care\./,
  )
  assert.match(source, /Get My New-Patient Growth Snapshot/)
  assert.match(source, /what improving it could mean\. About 3 minutes\./)
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
  assert.match(headerSource, /event\.key === 'Escape'/)
  assert.match(headerSource, /event\.key !== 'Tab'/)
  assert.match(headerSource, /mobileMenuRef/)
  assert.match(headerSource, /menu\?\.querySelectorAll<HTMLElement>/)
  assert.match(headerSource, /last\.focus\(\)/)
  assert.match(headerSource, /first\.focus\(\)/)
  assert.match(headerSource, /mobileMenuButtonRef\.current\?\.focus\(\)/)
})

test('assessment validates contact fields and explains snapshot value, timing, and privacy', async () => {
  const source = await readSource(
    '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
  )

  assert.match(source, /isValidContactEmail\(form\.email\)/)
  assert.match(source, /isValidContactPhone\(form\.phone\)/)
  assert.match(source, /aria-describedby=\{emailInvalid \? 'assessment-email-error'/)
  assert.match(source, /aria-describedby=\{phoneInvalid \? 'assessment-phone-error'/)
  assert.match(source, /stepHeadingRef\.current\?\.focus\(\)/)
  assert.match(source, /href="\/privacy-policy"/)
  assert.match(source, /About 3 minutes/)
  assert.match(source, /Immediate KPI snapshot/)
  assert.match(source, /30-Minute Diagnostic/i)
  assert.match(source, /\$300K–\$499,999/)
  assert.match(source, /\$2,000–\$2,999\/mo/)
  assert.match(source, /The best fit is determined by the ability to act, not revenue alone\./)
})

test('launch page headings and support opening use the approved copy', async () => {
  const expected = [
    ['../app/(marketing)/growth-system/_components/growth-system-client.tsx', 'Ads, Follow-Up, and Reporting—Working as One System'],
    ['../app/(marketing)/industries/_components/industries-hub-client.tsx', 'Built for Chiropractic.'],
    ['../app/(marketing)/industries/chiropractic/_components/chiropractic-client.tsx', 'A Patient Acquisition System Built Around Your Front Desk'],
    ['../app/(marketing)/industries/dental-medspa/_components/dental-medspa-client.tsx', 'Turn More Consultation Inquiries Into Attended Visits'],
    ['../app/(marketing)/industries/home-services/_components/home-services-client.tsx', 'Turn More Inquiries Into Scheduled Estimates and Jobs'],
    ['../app/(marketing)/about/_components/about-client.tsx', 'Built With a Practicing Chiropractor’s Perspective'],
    ['../app/(marketing)/pyro-ember/_components/pyro-ember-client.tsx', 'Ember handles approved inquiries and scheduling requests. PYRO keeps the record, follow-up, and team handoff connected.'],
    ['../app/(marketing)/support/_components/support-client.tsx', 'Send a question about PhynyxPro or your PYRO account.'],
  ]

  for (const [path, copy] of expected) {
    assert.ok((await readSource(path)).includes(copy), `${path} should include approved copy`)
  }
})

test('brand colors meet the contrast targets for their assigned surfaces', async () => {
  const [source, problemSource, growthSource, timelineSource, fitSource, pyroSource, growthPageSource] = await Promise.all([
    readSource('../tailwind.config.ts'),
    readSource('../app/(marketing)/(home)/_components/problem-reframe.tsx'),
    readSource('../app/(marketing)/(home)/_components/growth-system.tsx'),
    readSource('../app/(marketing)/(home)/_components/implementation-timeline.tsx'),
    readSource('../app/(marketing)/(home)/_components/fit-and-faq.tsx'),
    readSource('../app/(marketing)/pyro-ember/_components/pyro-ember-client.tsx'),
    readSource('../app/(marketing)/growth-system/_components/growth-system-client.tsx'),
  ])

  const luminance = (hex) => {
    const rgb = hex.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
    const linear = rgb.map((channel) => (
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    ))
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
  }
  const contrast = (foreground, background) => {
    const lighter = Math.max(luminance(foreground), luminance(background))
    const darker = Math.min(luminance(foreground), luminance(background))
    return (lighter + 0.05) / (darker + 0.05)
  }

  assert.ok(contrast('FFFFFF', 'B84420') >= 4.5)
  assert.ok(contrast('FFFFFF', '923416') >= 4.5)
  assert.ok(contrast('923416', 'EEE4D6') >= 4.5)
  assert.ok(contrast('FF6B35', '0E0D0C') >= 4.5)
  assert.ok(contrast('FF6B35', '1A1918') >= 4.5)
  assert.ok(contrast('B84420', 'EEE4D6') < 4.5)
  assert.ok(contrast('FFFFFF', 'FF6B35') < 4.5)

  assert.match(source, /phoenix: '#B84420'/)
  assert.match(source, /flame: '#FF6B35'/)
  assert.match(source, /ember: '#923416'/)
  assert.match(source, /linen: '#EEE4D6'/)
  assert.match(source, /night: '#0E0D0C'/)
  assert.match(source, /coal: '#1A1918'/)

  for (const linenSource of [problemSource, growthSource, timelineSource, fitSource]) {
    assert.doesNotMatch(linenSource, /text-phoenix\/70/)
  }
  assert.match(problemSource, /text-ember lg:mb-5">The reframe/)
  assert.match(growthSource, /text-ember lg:mb-5">The PhynyxPro system/)
  assert.match(timelineSource, /tracking-\[\.2em\] text-ember/)
  assert.match(fitSource, /text-ember lg:mb-5">Selective fit/)
  assert.match(fitSource, /text-ember lg:mb-6">Straight answers/)

  assert.match(growthPageSource, /text-ember">Pillar Two/)
  assert.match(growthPageSource, /text-flame">Ember AI · Example conversation/)
  assert.match(growthPageSource, /bg-phoenix\/20 px-3 py-2 text-\[12px\] text-flame/)
  assert.match(growthPageSource, /text-flame">Pillar Three/)
  assert.match(pyroSource, /text-flame mb-4">PYRO by PhynyxPro/)
  assert.match(pyroSource, /bg-phoenix\/15 text-flame/)
  assert.match(pyroSource, /text-\[12px\] text-flame/)

  assert.doesNotMatch(growthSource, /bg-flame text-white/)
  assert.match(growthSource, /bg-phoenix text-white/)
  assert.doesNotMatch(await readSource('../app/(marketing)/(home)/_components/pyro-section.tsx'), /bg-flame[^"']*text-white/)
})
