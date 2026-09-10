import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateGrowthSnapshot,
  parseGrowthSnapshotInput,
} from '../lib/growth-snapshot.ts'

function metric(value, confidence = 'exact') {
  return { value, confidence }
}

function input(overrides = {}) {
  return {
    metrics: {
      leads: metric(80),
      contacted: metric(50),
      booked: metric(28),
      confirmed: metric(24),
      showed: metric(20),
      started: metric(12),
      adSpend: metric(2400),
      averageStartValue: metric(1200, 'estimate'),
      ...overrides,
    },
    responseTime: '5-15-minutes',
    followUpAttempts: '4-6',
    attributionCoverage: 'some',
  }
}

test('calculates core conversion and acquisition KPIs from raw counts', () => {
  const result = calculateGrowthSnapshot(input())
  assert.equal(result.trackedCoreMetrics, 6)
  assert.equal(result.exactCoreMetrics, 6)
  assert.equal(result.rates.leadToBookRate, 0.35)
  assert.equal(result.rates.bookToShowRate, 20 / 28)
  assert.equal(result.rates.showToStartRate, 0.6)
  assert.equal(result.rates.leadToStartRate, 0.15)
  assert.equal(result.costs.perStart, 200)
})

test('finds the largest visible drop and projects a conservative scenario', () => {
  const result = calculateGrowthSnapshot(input())
  assert.deepEqual(result.largestDrop, {
    from: 'contacted',
    to: 'booked',
    conversionRate: 28 / 50,
  })
  assert.ok(result.improvement)
  assert.ok(Math.abs(result.improvement.additionalStarts - (5 * 12 / 28)) < 0.0001)
  assert.ok(Math.abs(result.improvement.estimatedValue - (5 * 12 / 28 * 1200)) < 0.0001)
})

test('treats not-tracked entries as visibility gaps without inventing rates', () => {
  const result = calculateGrowthSnapshot(input({
    contacted: metric(null, 'not-tracked'),
    started: metric(null, 'not-tracked'),
  }))
  assert.equal(result.trackedCoreMetrics, 4)
  assert.equal(result.rates.contactRate, null)
  assert.equal(result.rates.leadToStartRate, null)
  assert.equal(result.costs.perStart, null)
  assert.equal(result.improvement, null)
})

test('does not present impossible monthly sequences as conversion rates', () => {
  const result = calculateGrowthSnapshot(input({ booked: metric(90) }))
  assert.equal(result.rates.leadToBookRate, null)
})

test('parser rejects malformed or out-of-range public input', () => {
  assert.ok(parseGrowthSnapshotInput(input()))
  assert.equal(parseGrowthSnapshotInput(input({ leads: metric(-1) })), null)
  assert.equal(parseGrowthSnapshotInput(input({ leads: metric('80') })), null)
  assert.equal(parseGrowthSnapshotInput({ ...input(), responseTime: 'whenever' }), null)
})
