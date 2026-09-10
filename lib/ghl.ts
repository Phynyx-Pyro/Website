import { env } from 'cloudflare:workers'
import type { AssessmentAttribution } from './assessment-attribution'
import type { FitAssessment } from './growth-assessment'
import { normalizePhoneForComparison } from './public-form-security'
import { CONSENT_VERSION, CONSENT_DISCLOSURES, type ContactConsent } from './contact-consent'

const GHL_API_URL = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = 'v3'
const WEBSITE_FORM_NAME = 'growth-assessment'
const WEBSITE_FORM_VERSION = 'v1'

export const GHL_CONTACT_FIELD_KEYS = {
  submissionId: 'contact.website_submission_id',
  formName: 'contact.website_form_name',
  formVersion: 'contact.website_form_version',
  conversionPage: 'contact.website_conversion_page',
  ctaOrigin: 'contact.website_cta_origin',
  industry: 'contact.assessment_industry',
  revenueRange: 'contact.assessment_revenue_range',
  primaryChallenge: 'contact.assessment_primary_challenge',
  currentMarketing: 'contact.assessment_current_marketing',
  budgetRange: 'contact.assessment_budget_range',
  fitResult: 'contact.assessment_fit_result',
  investmentContextAcknowledged:
    'contact.investment_context_acknowledged',
  emailMarketingConsent: 'contact.email_marketing_consent',
  smsMarketingConsent: 'contact.sms_marketing_consent',
  consentCapturedAt: 'contact.consent_captured_at_utc',
  consentDisclosureVersion: 'contact.consent_disclosure_version',
  consentSourcePage: 'contact.consent_source_page',
  firstLandingPage: 'contact.website_first_landing_page',
  originalReferrer: 'contact.website_original_referrer',
  attributionSnapshot: 'contact.website_attribution_snapshot',
} as const

export const GHL_OPPORTUNITY_FIELD_KEYS = {
  submissionId: 'opportunity.website_submission_id_snapshot',
  leadIntent: 'opportunity.lead_intent',
  primaryServiceInterest: 'opportunity.primary_service_interest',
  qualifiedBudgetRange: 'opportunity.qualified_budget_range',
  decisionTimeframe: 'opportunity.decision_timeframe',
  nextActionAt: 'opportunity.next_action_at_utc',
} as const

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
  consent?: ContactConsent
}

type ContactSummary = {
  id?: string
  email?: string
  phone?: string
  customFields?: CustomFieldValue[]
}

type ContactResponse = {
  contact?: ContactSummary
}

type NotesResponse = {
  notes?: Array<{ id?: string; body?: string }>
}

type CustomFieldValue = {
  id?: string
  key?: string
  value?: unknown
  fieldValue?: unknown
}

type CustomFieldDefinition = {
  id?: string
  fieldKey?: string
}

type CustomFieldsResponse = {
  customFields?: CustomFieldDefinition[]
}

type OpportunitySummary = {
  id?: string
}

type OpportunitiesResponse = {
  opportunities?: OpportunitySummary[]
}

class GhlRequestError extends Error {
  readonly operation: string
  readonly status: number

  constructor(path: string, status: number) {
    const operation = new URL(path, GHL_API_URL).pathname
    super(`GoHighLevel request failed for ${operation} with status ${status}.`)
    this.name = 'GhlRequestError'
    this.operation = operation
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

async function ghlPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${GHL_API_URL}${path}`, {
    method: 'PUT',
    headers: ghlHeaders(true),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) throw new GhlRequestError(path, response.status)
  return (await response.json()) as T
}

async function ghlDelete<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${GHL_API_URL}${path}`, {
    method: 'DELETE',
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
    ...(input.consent ? [
      `Consent version: ${CONSENT_VERSION}`,
      `Consent captured at: ${input.submittedAt}`,
      `Consent source: ${input.attribution.conversionPage}`,
      ...Object.entries(CONSENT_DISCLOSURES).map(([key, text]) => `${key}: ${input.consent?.[key as keyof ContactConsent] ? 'YES' : 'NO'} | ${text}`),
    ] : []),
    '',
    `Website assessment: ${fit.path === 'calendar' ? 'Ready now — show calendar after snapshot' : fit.path === 'readiness-review' ? 'Emerging — offer readiness review after snapshot' : 'Foundation first — do not show calendar'}`,
    `Assessment basis: ${fit.summary}`,
    '',
    present('Business', input.businessName),
    present('Industry', input.industry),
    present('Annual revenue', input.annualRevenue),
    present('Monthly marketing budget', input.monthlyBudget),
    present('Biggest challenge', input.biggestChallenge),
    present('Current marketing', input.currentMarketing),
    '',
    present('Submitting page', attribution.conversionPage),
    present('First landing page', attribution.landingPage),
    present('Original referrer', attribution.referrer),
    present('CTA origin', attribution.ctaOrigin),
    present('Website session ID', attribution.sessionId),
    present('UTM source', attribution.utmSource),
    present('UTM medium', attribution.utmMedium),
    present('UTM campaign', attribution.utmCampaign),
    present('UTM content', attribution.utmContent),
    present('UTM term', attribution.utmTerm),
    present('Google click ID', attribution.gclid),
    present('Facebook click ID', attribution.fbclid),
    present('Microsoft click ID', attribution.msclkid),
  ].join('\n')
}

function readGhlSyncConfiguration() {
  const locationId = env.GHL_LOCATION_ID?.trim()
  const pipelineId = env.GHL_PIPELINE_ID?.trim()
  const pipelineStageId = env.GHL_PIPELINE_STAGE_ID?.trim()

  if (!locationId) throw new Error('GoHighLevel location ID is unavailable.')
  if (!pipelineId) throw new Error('GoHighLevel pipeline ID is unavailable.')
  if (!pipelineStageId) {
    throw new Error('GoHighLevel pipeline stage ID is unavailable.')
  }

  return { locationId, pipelineId, pipelineStageId }
}

function buildAttributionSnapshot(input: GhlGrowthAssessment) {
  const { attribution } = input
  return JSON.stringify({
    source: 'phynyx-website',
    form: WEBSITE_FORM_NAME,
    formVersion: WEBSITE_FORM_VERSION,
    submittedAt: input.submittedAt,
    conversionPage: attribution.conversionPage,
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    ctaOrigin: attribution.ctaOrigin,
    sessionId: attribution.sessionId,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    msclkid: attribution.msclkid,
  })
}

function isPresentCustomFieldValue(value: unknown) {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return value !== null && value !== undefined
}

function customFieldDefinitionsByKey(result: CustomFieldsResponse | null) {
  const definitions = new Map<string, string>()
  for (const field of result?.customFields ?? []) {
    if (field.fieldKey && field.id) definitions.set(field.fieldKey, field.id)
  }
  return definitions
}

function contactHasCustomFieldValue(
  contact: ContactSummary | undefined,
  definitions: Map<string, string>,
  fieldKey: string,
) {
  const fieldId = definitions.get(fieldKey)
  if (!fieldId) return false

  return Boolean(
    contact?.customFields?.some((field) => {
      if (field.id !== fieldId && field.key !== fieldKey) return false
      return isPresentCustomFieldValue(field.fieldValue ?? field.value)
    }),
  )
}

type FieldEntry = {
  key: string
  value: string
}

function fieldEntry(key: string, value: string): FieldEntry {
  return { key, value }
}

function fieldEntryWhenPresent(key: string, value: string): FieldEntry | null {
  return value.trim() ? { key, value } : null
}

function resolveCustomFieldUpdates(
  entries: Array<FieldEntry | null>,
  definitions: Map<string, string>,
) {
  const updates = []

  for (const entry of entries) {
    if (!entry) continue
    const fieldId = definitions.get(entry.key)
    if (!fieldId) {
      throw new Error('GoHighLevel custom field configuration is incomplete.')
    }
    updates.push({ id: fieldId, fieldValue: entry.value })
  }

  return updates
}

function buildContactCustomFields(
  input: GhlGrowthAssessment,
  contact: ContactSummary | undefined,
  definitions: Map<string, string>,
) {
  const fitResult = input.fit.path === 'foundation' ? 'nurture' : 'qualified'
  const firstLandingPage = contactHasCustomFieldValue(
    contact,
    definitions,
    GHL_CONTACT_FIELD_KEYS.firstLandingPage,
  )
    ? ''
    : input.attribution.landingPage
  const originalReferrer = contactHasCustomFieldValue(
    contact,
    definitions,
    GHL_CONTACT_FIELD_KEYS.originalReferrer,
  )
    ? ''
    : input.attribution.referrer

  return resolveCustomFieldUpdates(
    [
      fieldEntry(GHL_CONTACT_FIELD_KEYS.formName, WEBSITE_FORM_NAME),
      fieldEntry(GHL_CONTACT_FIELD_KEYS.formVersion, WEBSITE_FORM_VERSION),
      fieldEntry(
        GHL_CONTACT_FIELD_KEYS.conversionPage,
        input.attribution.conversionPage,
      ),
      fieldEntry(GHL_CONTACT_FIELD_KEYS.ctaOrigin, input.attribution.ctaOrigin),
      fieldEntry(GHL_CONTACT_FIELD_KEYS.industry, input.industry),
      fieldEntry(GHL_CONTACT_FIELD_KEYS.revenueRange, input.annualRevenue),
      fieldEntry(
        GHL_CONTACT_FIELD_KEYS.primaryChallenge,
        input.biggestChallenge,
      ),
      fieldEntry(
        GHL_CONTACT_FIELD_KEYS.currentMarketing,
        input.currentMarketing,
      ),
      fieldEntry(GHL_CONTACT_FIELD_KEYS.budgetRange, input.monthlyBudget),
      fieldEntry(GHL_CONTACT_FIELD_KEYS.fitResult, fitResult),
      fieldEntryWhenPresent(
        GHL_CONTACT_FIELD_KEYS.firstLandingPage,
        firstLandingPage,
      ),
      fieldEntryWhenPresent(
        GHL_CONTACT_FIELD_KEYS.originalReferrer,
        originalReferrer,
      ),
      fieldEntry(
        GHL_CONTACT_FIELD_KEYS.attributionSnapshot,
        buildAttributionSnapshot(input),
      ),
    ],
    definitions,
  )
}

function buildOpportunityCustomFields(
  input: GhlGrowthAssessment,
  definitions: Map<string, string>,
) {
  return resolveCustomFieldUpdates(
    [
      fieldEntry(GHL_OPPORTUNITY_FIELD_KEYS.submissionId, input.submissionId),
      fieldEntry(GHL_OPPORTUNITY_FIELD_KEYS.leadIntent, 'assessment'),
      fieldEntry(
        GHL_OPPORTUNITY_FIELD_KEYS.primaryServiceInterest,
        'growth-system',
      ),
      fieldEntry(
        GHL_OPPORTUNITY_FIELD_KEYS.qualifiedBudgetRange,
        input.monthlyBudget,
      ),
    ],
    definitions,
  )
}

function buildOpportunityName(input: GhlGrowthAssessment) {
  const leadName = input.businessName || `${input.firstName} ${input.lastName}`.trim()
  return `${leadName} — Growth Assessment`
}

async function syncAssessmentNote(
  contactId: string,
  input: GhlGrowthAssessment,
  notes: NotesResponse | null,
) {
  const marker = `Submission ID: ${input.submissionId}`
  const body = buildAssessmentNote(input)
  const existing = notes?.notes?.find((note) =>
    note.body?.split('\n').includes(marker),
  )

  if (!existing) {
    await ghlPost(`/contacts/${contactId}/notes`, {
      title: 'Website Growth Assessment',
      body,
      pinned: false,
    })
    return
  }

  if (existing.id && existing.body !== body) {
    await ghlPut(`/contacts/${contactId}/notes/${encodeURIComponent(existing.id)}`, {
      title: 'Website Growth Assessment',
      body,
      pinned: false,
    })
  }
}

async function syncAssessmentOpportunity(
  contactId: string,
  input: GhlGrowthAssessment,
  opportunities: OpportunitiesResponse | null,
  customFields: Array<{ id: string; fieldValue: string }>,
  configuration: ReturnType<typeof readGhlSyncConfiguration>,
) {
  const existingOpportunity = opportunities?.opportunities?.find(
    (opportunity) => opportunity.id,
  )
  const commonFields = {
    pipelineId: configuration.pipelineId,
    name: buildOpportunityName(input),
    status: 'open',
    customFields,
  }

  if (existingOpportunity?.id) {
    await ghlPut(
      `/opportunities/${encodeURIComponent(existingOpportunity.id)}`,
      commonFields,
    )
    return
  }

  await ghlPost('/opportunities/', {
    ...commonFields,
    locationId: configuration.locationId,
    pipelineStageId: configuration.pipelineStageId,
    contactId,
  })
}

export async function resolveGrowthAssessmentContact(input: GhlGrowthAssessment) {
  const locationId = env.GHL_LOCATION_ID?.trim()
  if (!locationId) throw new Error('GoHighLevel location ID is unavailable.')

  return createOrMatchContact(input, locationId)
}

export function isGhlContactNotFoundError(error: unknown, contactId: string) {
  return (
    error instanceof GhlRequestError &&
    error.status === 404 &&
    error.operation === `/contacts/${encodeURIComponent(contactId)}`
  )
}

export async function syncGrowthAssessmentMetadata(
  contactId: string,
  input: GhlGrowthAssessment,
) {
  const configuration = readGhlSyncConfiguration()
  const encodedContactId = encodeURIComponent(contactId)
  const opportunityQuery = new URLSearchParams({
    locationId: configuration.locationId,
    pipelineId: configuration.pipelineId,
    contactId,
    status: 'open',
    order: 'added_asc',
    limit: '1',
  })
  const customFieldsQuery = new URLSearchParams({ model: 'all' })

  // Resolve the contact first so a stale persisted ID can be distinguished from
  // failures in the independent metadata lookups.
  const contactResult = await ghlGet<ContactResponse>(
    `/contacts/${encodedContactId}`,
  )
  const [notesResult, opportunitiesResult, customFieldsResult] =
    await Promise.all([
      ghlGet<NotesResponse>(`/contacts/${encodedContactId}/notes`),
      ghlGet<OpportunitiesResponse>(
        `/opportunities/search?${opportunityQuery.toString()}`,
      ),
      ghlGet<CustomFieldsResponse>(
        `/locations/${encodeURIComponent(configuration.locationId)}/customFields?${customFieldsQuery.toString()}`,
      ),
    ])

  const definitions = customFieldDefinitionsByKey(customFieldsResult)
  const contactCustomFields = buildContactCustomFields(
    input,
    contactResult?.contact,
    definitions,
  )
  const opportunityCustomFields = buildOpportunityCustomFields(
    input,
    definitions,
  )
  const enrollmentCustomFields = resolveCustomFieldUpdates(
    [fieldEntry(GHL_CONTACT_FIELD_KEYS.submissionId, input.submissionId)],
    definitions,
  )
  // Partial contact capture must not clear assessment answers or move a deal
  // backward. It emits a distinct signal only after its consent record is saved.
  if (input.submissionType === 'homepage-quick-form') {
    await syncAssessmentNote(encodedContactId, input, notesResult)
    await syncConsent(encodedContactId, input)
    if (!opportunitiesResult?.opportunities?.length) {
      await syncAssessmentOpportunity(contactId, input, opportunitiesResult, [], configuration)
    }
    if (!contactHasCustomFieldValue(contactResult?.contact, definitions, GHL_CONTACT_FIELD_KEYS.submissionId)) {
      await ghlPost(`/contacts/${encodedContactId}/tags`, { tags: ['source:phynyx-website', 'automation:phynyx-web-v1', 'sales:assessment-incomplete'] })
    }
    return
  }
  const fitTag =
    input.fit.path === 'foundation' ? 'fit:nurture' : 'fit:qualified'
  const opposingFitTag =
    input.fit.path === 'foundation' ? 'fit:qualified' : 'fit:nurture'

  // Mutations are deliberately sequential. If a request fails, no later write
  // is already in flight while the route records a retryable failure state.
  await ghlPut(`/contacts/${encodedContactId}`, {
    customFields: contactCustomFields,
  })
  await syncAssessmentNote(encodedContactId, input, notesResult)
  await syncAssessmentOpportunity(
    contactId,
    input,
    opportunitiesResult,
    opportunityCustomFields,
    configuration,
  )
  await syncConsent(encodedContactId, input)

  await ghlDelete(`/contacts/${encodedContactId}/tags`, {
    tags: [opposingFitTag],
  })

  await ghlPost(`/contacts/${encodedContactId}/tags`, {
    tags: [
      'source:phynyx-website',
      'form:growth-assessment',
      'intent:assessment',
      'automation:phynyx-web-v1',
      fitTag,
    ],
  })

  const nextSequence = input.fit.path === 'foundation' ? 'sales:nurture' : 'sales:booking-followup'
  const previousSequence = input.fit.path === 'foundation' ? 'sales:booking-followup' : 'sales:nurture'
  await ghlDelete(`/contacts/${encodedContactId}/tags`, { tags: ['sales:assessment-incomplete', previousSequence] })
  await ghlPost(`/contacts/${encodedContactId}/tags`, { tags: [nextSequence] })

  // Website Submission ID is the workflow re-entry signal. Write it only after
  // every other CRM record and tag is ready for the automation to consume.
  await ghlPut(`/contacts/${encodedContactId}`, {
    customFields: enrollmentCustomFields,
  })
}

async function syncConsent(contactId: string, input: GhlGrowthAssessment) {
  if (!input.consent) return
  const channels: Array<[keyof ContactConsent, string]> = [
    ['smsMarketing', 'consent:sms-marketing'],
    ['smsService', 'consent:sms-service'],
    ['aiVoice', 'consent:ai-voice'],
  ]
  const granted = channels.filter(([key]) => input.consent?.[key]).map(([, tag]) => tag)
  const declined = channels.filter(([key]) => !input.consent?.[key]).map(([, tag]) => tag)
  if (declined.length) await ghlDelete(`/contacts/${contactId}/tags`, { tags: declined })
  if (granted.length) await ghlPost(`/contacts/${contactId}/tags`, { tags: granted })
  // Never clear DND or an operator's pause when recording a form selection.
}

export const syncNewGrowthAssessmentMetadata = syncGrowthAssessmentMetadata
