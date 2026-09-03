import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildGhlBookingUrl,
  GHL_BOOKING_URL,
  isBookingContact,
} from '../lib/ghl-booking.ts'

const contact = {
  contactId: 'contact_123',
  firstName: 'Craig & Co',
  lastName: "O'Phoenix",
  email: 'craig+assessment@example.com',
  phone: '+1 (555) 123-4567',
}

test('buildGhlBookingUrl carries the exact CRM identity into the widget', () => {
  const url = new URL(buildGhlBookingUrl(contact))

  assert.equal(`${url.origin}${url.pathname}`, GHL_BOOKING_URL)
  assert.equal(url.searchParams.get('contact_id'), contact.contactId)
  assert.equal(url.searchParams.get('first_name'), contact.firstName)
  assert.equal(url.searchParams.get('last_name'), contact.lastName)
  assert.equal(url.searchParams.get('email'), contact.email)
  assert.equal(url.searchParams.get('phone'), contact.phone)
})

test('buildGhlBookingUrl omits blank optional values', () => {
  const url = new URL(
    buildGhlBookingUrl({ ...contact, lastName: '', phone: '' }),
  )

  assert.equal(url.searchParams.has('last_name'), false)
  assert.equal(url.searchParams.has('phone'), false)
})

test('isBookingContact rejects a response without a CRM contact ID', () => {
  assert.equal(isBookingContact(contact), true)
  assert.equal(isBookingContact({ ...contact, contactId: '' }), false)
})
