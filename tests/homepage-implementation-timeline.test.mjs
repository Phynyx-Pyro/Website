import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const timelineUrl = new URL(
  '../app/(marketing)/(home)/_components/implementation-timeline.tsx',
  import.meta.url,
)

test('homepage presents the standard 7–10 day implementation timeline', async () => {
  const source = await readFile(timelineUrl, 'utf8')
  const normalizedSource = source.replace(/\s+/g, ' ')

  for (const copy of [
    'THE FIRST 7–10 DAYS',
    'Your core acquisition system, built in 7–10 days.',
    'The build window begins once onboarding inputs, account access, and required approvals are complete. From there, we build the campaign, Meta lead flow, pipeline, follow-up, and handoff process.',
    'Before day one',
    'Onboarding complete',
    'Confirm offer, capacity, locations, and handoff owners',
    'Receive advertising, CRM, calendar, domain, and reporting access',
    'Collect required brand assets, approvals, and business details',
    'Days 1–3',
    'Campaign build',
    'Campaign strategy and offer path',
    'Days 4–7',
    'System configuration',
    'Days 8–10',
    'QA and launch-ready',
    'Meta lead ads, forms, copy, and creative setup',
    'Tracking and source structure',
    'PYRO pipeline and calendar connection',
    'Follow-up, reminders, and status automation',
    'Ember and staff handoff rules where included',
    'End-to-end lead and booking tests',
    'Team ownership and escalation review',
    'Final approvals and controlled launch preparation',
    '7–10 days is the standard core-build window after complete onboarding. Missing access, delayed approvals or client inputs, carrier/A2P registration, and other third-party dependencies can move the live-launch date.',
  ]) {
    assert.ok(normalizedSource.includes(copy), `Missing approved timeline copy: ${copy}`)
  }

  assert.doesNotMatch(source, /first 30 days|first month|Week [1-4]|business days/i)
  assert.equal(source.match(/period: /g)?.length, 4)

  const periods = ['Before day one', 'Days 1–3', 'Days 4–7', 'Days 8–10']
  const positions = periods.map((period) => source.indexOf(`period: '${period}'`))
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right))
})

test('homepage renders the renamed implementation timeline component', async () => {
  const source = await readFile(
    new URL('../app/(marketing)/(home)/page.tsx', import.meta.url),
    'utf8',
  )

  assert.match(
    source,
    /import \{ ImplementationTimeline \} from '\.\/_components\/implementation-timeline'/,
  )
  assert.match(source, /<ImplementationTimeline \/>/)
  assert.doesNotMatch(source, /FirstThirtyDays|first-30-days/)

  const growthSystem = source.indexOf('<GrowthSystem />')
  const timeline = source.indexOf('<ImplementationTimeline />')
  const pyro = source.indexOf('<PyroSection />')
  assert.ok(growthSystem >= 0 && growthSystem < timeline && timeline < pyro)
})
