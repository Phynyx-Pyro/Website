import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildGhlBookingUrl,
  buildGhlPrefillMessage,
  GHL_BOOKING_URL,
  isBookingContact,
} from '../lib/ghl-booking.ts'
import { minimizeAttributionUrl } from '../lib/assessment-attribution.ts'

const contact = {
  contactId: 'contact_123',
  firstName: 'Craig & Co',
  lastName: "O'Phoenix",
  email: 'craig+assessment@example.com',
  phone: '+1 (555) 123-4567',
}

test('buildGhlBookingUrl never places CRM identity in the URL', () => {
  const url = new URL(buildGhlBookingUrl())

  assert.equal(`${url.origin}${url.pathname}`, GHL_BOOKING_URL)
  assert.equal(url.search, '')
})

test('buildGhlPrefillMessage uses the widget message channel for exact CRM identity', () => {
  const message = buildGhlPrefillMessage(
    contact,
    'https://phynyxpro.example/growth-assessment',
    'https://google.com/',
    'calendar-frame',
  )

  assert.equal(message[0], 'query-params')
  assert.deepEqual(message[1], {
    contact_id: contact.contactId,
    first_name: contact.firstName,
    last_name: contact.lastName,
    email: contact.email,
    phone: contact.phone,
  })
  assert.equal(message[4], 'calendar-frame')
})

test('buildGhlPrefillMessage omits a blank optional last name', () => {
  const message = buildGhlPrefillMessage(
    { ...contact, lastName: '' },
    'https://phynyxpro.example/growth-assessment',
    '',
    'calendar-frame',
  )

  assert.equal('last_name' in message[1], false)
})

test('isBookingContact rejects a response without a CRM contact ID', () => {
  assert.equal(isBookingContact(contact), true)
  assert.equal(isBookingContact({ ...contact, contactId: '' }), false)
})

test('minimizeAttributionUrl removes query strings, fragments, and unsafe schemes', () => {
  assert.equal(
    minimizeAttributionUrl('https://example.com/path?token=secret#details'),
    'https://example.com/path',
  )
  assert.equal(minimizeAttributionUrl('javascript:alert(1)'), '')
  assert.equal(minimizeAttributionUrl('not a URL'), '')
})
