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
