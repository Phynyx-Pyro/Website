export const GHL_BOOKING_URL =
  'https://link.phynyxpro.com/widget/booking/NX2pJFAx51yOcaNIdNjL'

export type BookingContact = {
  contactId: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export function isBookingContact(value: unknown): value is BookingContact {
  if (!value || typeof value !== 'object') return false

  const contact = value as Record<string, unknown>
  return (
    typeof contact.contactId === 'string' &&
    contact.contactId.length > 0 &&
    typeof contact.firstName === 'string' &&
    contact.firstName.length > 0 &&
    typeof contact.lastName === 'string' &&
    typeof contact.email === 'string' &&
    contact.email.length > 0 &&
    typeof contact.phone === 'string'
  )
}

export function buildGhlBookingUrl(contact: BookingContact) {
  const url = new URL(GHL_BOOKING_URL)
  const fields = [
    ['contact_id', contact.contactId],
    ['first_name', contact.firstName],
    ['last_name', contact.lastName],
    ['email', contact.email],
    ['phone', contact.phone],
  ] as const

  for (const [key, value] of fields) {
    if (value) url.searchParams.set(key, value)
  }

  return url.toString()
}
