import assert from 'node:assert/strict'
import test from 'node:test'
import { assessGrowthFit } from '../lib/growth-assessment.ts'

const ready = {
  annualRevenue: '300k-500k',
  monthlyBudget: '2k-3k',
  capacity: '6-10',
  decisionRole: 'owner',
  implementationTiming: 'within-30-days',
  followUpOwner: 'yes',
  trackedMetricCount: 5,
}

test('ready practices reach the calendar with the lower economic signals', () => {
  const result = assessGrowthFit(ready)
  assert.equal(result.path, 'calendar')
  assert.equal(result.tier, 'ready-now')
  assert.equal(result.score, 7)
})

test('serious emerging practices can still reach a readiness review', () => {
  const result = assessGrowthFit({
    ...ready,
    annualRevenue: '200k-300k',
    monthlyBudget: '1k-2k',
    capacity: '1-5',
  })
  assert.equal(result.path, 'readiness-review')
  assert.equal(result.tier, 'emerging')
})

test('hard operating constraints route to foundation guidance', () => {
  for (const input of [
    { ...ready, capacity: 'none' },
    { ...ready, decisionRole: 'researching' },
    { ...ready, implementationTiming: 'researching' },
    { ...ready, followUpOwner: 'no' },
    { ...ready, annualRevenue: 'under-200k', monthlyBudget: 'under-1k' },
  ]) {
    const result = assessGrowthFit(input)
    assert.equal(result.path, 'foundation')
    assert.equal(result.tier, 'foundation')
  }
})

test('published revenue and paid-media ranges are non-overlapping and required', async () => {
  const { readFile } = await import('node:fs/promises')
  const source = await readFile(
    new URL(
      '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
      import.meta.url,
    ),
    'utf8',
  )

  for (const label of [
    'Under $200K',
    '$200K–$299,999',
    '$300K–$499,999',
    '$500K–$999,999',
    '$1M or more',
    'Under $1,000/mo',
    '$1,000–$1,999/mo',
    '$2,000–$2,999/mo',
    '$3,000–$4,999/mo',
    '$5,000/mo or more',
  ]) {
    assert.ok(source.includes(label), `Missing non-overlapping label: ${label}`)
  }
})
