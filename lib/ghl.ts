import { env } from 'cloudflare:workers'
import type { AssessmentAttribution } from './assessment-attribution'
import type { FitAssessment } from './growth-assessment'
import { normalizePhoneForComparison } from './public-form-security'

const GHL_API_URL = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = 'v3'

export type GhlGrowthAssessment = {
  submissionId: string
  submittedAt: string
  submissionType: 'full-assessment' | 'homepage-quick-form'
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  industry: string
  annualRevenue: string
  biggestChallenge: string
  currentMarketing: string
  monthlyBudget: string
  attribution: AssessmentAttribution
  fit: FitAssessment
}

type ContactSummary = {
  id?: string
  email?: string
  phone?: string
}

type ContactResponse = {
  contact?: ContactSummary
}

type NotesResponse = {
  notes?: Array<{ body?: string }>
}

class GhlRequestError extends Error {
  readonly status: number

  constructor(path: string, status: number) {
    const operation = new URL(path, GHL_API_URL).pathname
    super(`GoHighLevel request failed for ${operation} with status ${status}.`)
    this.name = 'GhlRequestError'
    this.status = status
  }
}

export class GhlIdentityConflictError extends Error {
  constructor() {
    super('The submitted contact details do not match the existing CRM contact.')
    this.name = 'GhlIdentityConflictError'
  }
}

function ghlHeaders(contentType = false) {
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim()
  if (!token) throw new Error('GoHighLevel integration token is unavailable.')

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    Version: GHL_API_VERSION,
  }
}

async function ghlGet<T>(path: string, allowNotFound = false): Promise<T | null> {
  const response = await fetch(`${GHL_API_URL}${path}`, {
    headers: ghlHeaders(),
    signal: AbortSignal.timeout(10_000),
  })

  if (allowNotFound && response.status === 404) return null
  if (!response.ok) throw new GhlRequestError(path, response.status)
  return (await response.json()) as T
}

async function ghlPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${GHL_API_URL}${path}`, {
    method: 'POST',
    headers: ghlHeaders(true),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) throw new GhlRequestError(path, response.status)
  return (await response.json()) as T
}

function contactMatchesPhone(contact: ContactSummary, submittedPhone: string) {
  const existingPhone = normalizePhoneForComparison(contact.phone ?? '')
  const expectedPhone = normalizePhoneForComparison(submittedPhone)
  return Boolean(existingPhone && expectedPhone && existingPhone === expectedPhone)
}

async function findDuplicateContact(locationId: string, email: string) {
  const query = new URLSearchParams({ locationId, email })
  const result = await ghlGet<ContactResponse>(
    `/contacts/search/duplicate?${query.toString()}`,
    true,
  )
  const summary = result?.contact
  if (!summary?.id) return null

  const detailed = await ghlGet<ContactResponse>(
    `/contacts/${encodeURIComponent(summary.id)}`,
  )
  return detailed?.contact ?? summary
}

async function createOrMatchContact(input: GhlGrowthAssessment, locationId: string) {
  const existing = await findDuplicateContact(locationId, input.email)
  if (existing) {
    if (!existing.id || !contactMatchesPhone(existing, input.phone)) {
      throw new GhlIdentityConflictError()
    }
    return { contactId: existing.id, isNew: false }
  }

  try {
    const created = await ghlPost<ContactResponse>('/contacts/', {
      locationId,
      firstName: input.firstName,
      lastName: input.lastName || undefined,
      email: input.email,
      phone: input.phone,
      companyName: input.businessName || undefined,
      source: 'PhynyxPro Website',
    })
    const contactId = created.contact?.id
    if (!contactId) throw new Error('GoHighLevel did not return a contact ID.')
    return { contactId, isNew: true }
  } catch (error) {
    if (!(error instanceof GhlRequestError) || ![400, 409, 422].includes(error.status)) {
      throw error
    }

    const racedDuplicate = await findDuplicateContact(locationId, input.email)
    if (!racedDuplicate?.id) throw error
    if (!contactMatchesPhone(racedDuplicate, input.phone)) {
      throw new GhlIdentityConflictError()
    }
    return { contactId: racedDuplicate.id, isNew: false }
  }
}

function present(label: string, value: string) {
  return `${label}: ${value || 'Not provided'}`
}

function buildAssessmentNote(input: GhlGrowthAssessment) {
  const { attribution, fit } = input
  return [
    `Submission ID: ${input.submissionId}`,
    `Submitted: ${input.submittedAt}`,
    `Form: ${input.submissionType}`,
    '',
    `Website assessment: ${fit.path === 'calendar' ? 'Good fit — show calendar immediately' : 'Investment context required before calendar'}`,
    `Assessment basis: ${fit.summary}`,
    '',
    present('Business', input.businessName),
    present('Industry', input.industry),
    present('Annual revenue', input.annualRevenue),
    present('Monthly marketing budget', input.monthlyBudget),
    present('Biggest challenge', input.biggestChallenge),
    present('Current marketing', input.currentMarketing),
    '',
    present('Submitting page', attribution.landingPage),
    present('Referrer', attribution.referrer),
    present('UTM source', attribution.utmSource),
    present('UTM medium', attribution.utmMedium),
    present('UTM campaign', attribution.utmCampaign),
    present('UTM content', attribution.utmContent),
    present('UTM term', attribution.utmTerm),
    present('Google click ID', attribution.gclid),
    present('Facebook click ID', attribution.fbclid),
  ].join('\n')
}

export async function resolveGrowthAssessmentContact(input: GhlGrowthAssessment) {
  const locationId = env.GHL_LOCATION_ID?.trim()
  if (!locationId) throw new Error('GoHighLevel location ID is unavailable.')

  return createOrMatchContact(input, locationId)
}

export async function syncNewGrowthAssessmentMetadata(
  contactId: string,
  input: GhlGrowthAssessment,
) {
  const encodedContactId = encodeURIComponent(contactId)

  const formTag =
    input.submissionType === 'full-assessment'
      ? 'growth-assessment-full'
      : 'growth-assessment-quick'

  await ghlPost(`/contacts/${encodedContactId}/tags`, {
    tags: ['website-lead', 'growth-assessment', formTag, input.fit.tag],
  })

  const marker = `Submission ID: ${input.submissionId}`
  const existingNotes = await ghlGet<NotesResponse>(
    `/contacts/${encodedContactId}/notes`,
  )
  const noteAlreadyExists = existingNotes?.notes?.some((note) =>
    note.body?.split('\n').includes(marker),
  )

  if (!noteAlreadyExists) {
    await ghlPost(`/contacts/${encodedContactId}/notes`, {
      title: 'Website Growth Assessment',
      body: buildAssessmentNote(input),
      pinned: false,
    })
  }
}
