import assert from 'node:assert/strict'
import test from 'node:test'
import { calculatePublicFunnel } from '../lib/public-funnel-calculator.ts'

test('shows only rates and counts derived from entered numbers', () => {
  assert.deepEqual(calculatePublicFunnel({ inquiries: '80', booked: '28', attended: '20' }), {
    inquiries: 80,
    booked: 28,
    attended: 20,
    bookingRate: 0.35,
    attendanceRate: 20 / 28,
    notBooked: 52,
    didNotAttend: 8,
    largestGap: 'booking',
  })
})

test('rejects missing, impossible, fractional, and oversized counts', () => {
  for (const input of [
    { inquiries: '', booked: '2', attended: '1' },
    { inquiries: '2', booked: '3', attended: '1' },
    { inquiries: '3', booked: '2', attended: '3' },
    { inquiries: '3.5', booked: '2', attended: '1' },
    { inquiries: '0', booked: '0', attended: '0' },
    { inquiries: '10000001', booked: '2', attended: '1' },
  ]) assert.equal(calculatePublicFunnel(input), null)
})

test('handles zero bookings without inventing an attendance opportunity', () => {
  const result = calculatePublicFunnel({ inquiries: '10', booked: '0', attended: '0' })
  assert.equal(result?.bookingRate, 0)
  assert.equal(result?.attendanceRate, 0)
  assert.equal(result?.largestGap, 'booking')
})
