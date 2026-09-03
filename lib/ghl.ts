import { env } from 'cloudflare:workers'
import type { AssessmentAttribution } from './assessment-attribution'
import type { FitAssessment } from './growth-assessment'

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

type UpsertContactResponse = {
  new?: boolean
  contact?: { id?: string }
}

class GhlRequestError extends Error {
  constructor(path: string, status: number) {
    super(`GoHighLevel request failed for ${path} with status ${status}.`)
    this.name = 'GhlRequestError'
  }
}

async function ghlPost<T>(path: string, body: unknown): Promise<T> {
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim()
  if (!token) throw new Error('GoHighLevel integration token is unavailable.')

  const response = await fetch(`${GHL_API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) throw new GhlRequestError(path, response.status)
  return (await response.json()) as T
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

export async function syncGrowthAssessmentToGhl(input: GhlGrowthAssessment) {
  const locationId = env.GHL_LOCATION_ID?.trim()
  if (!locationId) throw new Error('GoHighLevel location ID is unavailable.')

  const upsert = await ghlPost<UpsertContactResponse>('/contacts/upsert', {
    locationId,
    firstName: input.firstName,
    lastName: input.lastName || undefined,
    email: input.email,
    phone: input.phone || undefined,
    companyName: input.businessName || undefined,
    source: 'PhynyxPro Website',
    createNewIfDuplicateAllowed: false,
  })

  const contactId = upsert.contact?.id
  if (!contactId) throw new Error('GoHighLevel did not return a contact ID.')

  const formTag =
    input.submissionType === 'full-assessment'
      ? 'growth-assessment-full'
      : 'growth-assessment-quick'

  await Promise.all([
    ghlPost(`/contacts/${encodeURIComponent(contactId)}/tags`, {
      tags: ['website-lead', 'growth-assessment', formTag, input.fit.tag],
    }),
    ghlPost(`/contacts/${encodeURIComponent(contactId)}/notes`, {
      title: 'Website Growth Assessment',
      body: buildAssessmentNote(input),
      pinned: false,
    }),
  ])

  return { contactId, isNew: upsert.new === true }
}

