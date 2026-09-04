import assert from 'node:assert/strict'
import test from 'node:test'
import { assessGrowthFit } from '../lib/growth-assessment.ts'

test('current qualification behavior requires both revenue and budget thresholds', () => {
  assert.equal(assessGrowthFit('500k-1m', '3k-5k').path, 'calendar')
  assert.equal(assessGrowthFit('1m-5m', '10k-plus').path, 'calendar')
  assert.equal(assessGrowthFit('250k-500k', '10k-plus').path, 'investment-context')
  assert.equal(assessGrowthFit('5m-plus', '1k-3k').path, 'investment-context')
  assert.equal(assessGrowthFit('', '').path, 'investment-context')
})

test('every published revenue and budget boundary maps deterministically', () => {
  const revenueRanges = [
    ['under-250k', false],
    ['250k-500k', false],
    ['500k-1m', true],
    ['1m-5m', true],
    ['5m-plus', true],
  ]
  const budgetRanges = [
    ['under-1k', false],
    ['1k-3k', false],
    ['3k-5k', true],
    ['5k-10k', true],
    ['10k-plus', true],
  ]

  for (const [revenue, revenueReady] of revenueRanges) {
    for (const [budget, budgetReady] of budgetRanges) {
      assert.equal(
        assessGrowthFit(revenue, budget).path,
        revenueReady && budgetReady ? 'calendar' : 'investment-context',
        `${revenue} with ${budget}`,
      )
    }
  }
})

test('published assessment ranges are non-overlapping and visibly required', async () => {
  const { readFile } = await import('node:fs/promises')
  const source = await readFile(
    new URL(
      '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
      import.meta.url,
    ),
    'utf8',
  )

  for (const label of [
    'Annual business revenue (last 12 months) *',
    '$250K – $499,999',
    '$500K – $999,999',
    '$1M – $4,999,999',
    '$5M or more',
    'Planned monthly marketing budget *',
    '$1,000 – $2,999/mo',
    '$3,000 – $4,999/mo',
    '$5,000 – $9,999/mo',
    '$10,000/mo or more',
  ]) {
    assert.ok(source.includes(label), `Missing non-overlapping label: ${label}`)
  }
})
