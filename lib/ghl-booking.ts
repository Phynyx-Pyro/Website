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

export function buildGhlBookingUrl() {
  return GHL_BOOKING_URL
}

export function buildGhlPrefillMessage(
  contact: BookingContact,
  pageUrl: string,
  referrer: string,
  iframeId: string,
) {
  const params: Record<string, string> = {
    contact_id: contact.contactId,
    first_name: contact.firstName,
    email: contact.email,
    phone: contact.phone,
  }

  if (contact.lastName) params.last_name = contact.lastName

  return [
    'query-params',
    params,
    pageUrl,
    referrer,
    iframeId,
    { consent: null, isConsentExpected: false },
  ] as const
}
