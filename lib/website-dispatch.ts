import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { growthAssessments, websiteCreatedIdentities, websiteDispatchLocks, websiteDispatchReceipts } from '@/db/schema'
import { grantCreatedContact, requireContactGrant, requireIntakeSession, type IntakeSession } from './intake-session'
import { hashText, normalizePhone, PublicFormError } from './public-form-security'
import { prepareRecoveryDispatch, enrollRecoveryDispatch, RecoveryDispatchError } from './website-recovery'
import { GHL_CONTACT_FIELD_KEYS, type GhlGrowthAssessment } from './ghl'

export type Contact = { id: string; locationId: string; email?: string; phone?: string; tags?: string[]; dnd?: boolean; dndSettings?: Record<string, { status?: string }>; customFields?: Array<{ id: string; value?: unknown }> }
type Opportunity = { id: string; contactId?: string; contact?: { id: string }; pipelineId: string; pipelineStageId: string; status: string }
export type DispatchResult = { state: string; synced: boolean; recovery: string }
const API = 'https://services.leadconnectorhq.com'
const VERSION = '2021-07-28'
const TEST_TAG = 'test:website-integration'
const HOLD_TAGS = ['automation:pause', 'stop bot', 'human handover']

// Both gates are required. The old flag alone never enters the legacy adapter.
// Live mode is deliberately unavailable until the recovery consumer is accepted.
export function dispatchAdmitted(email: string, phone: string) {
  const modeApproved = (env.WEBSITE_CRM_MODE === 'test' && env.WEBSITE_TEST_SUPPRESSION_APPROVED === 'true') ||
    (env.WEBSITE_CRM_MODE === 'acceptance' && Boolean(env.WEBSITE_ACCEPTANCE_CONTACT_ID) && env.WEBSITE_ACCEPTANCE_WORKFLOWS_APPROVED === 'true' && env.WEBSITE_RECOVERY_DISPATCH_ENABLED === 'true')
  return env.WEBSITE_CRM_DISPATCH_ENABLED === 'true' && modeApproved &&
    Boolean(env.WEBSITE_CRM_TEST_EMAIL && env.WEBSITE_CRM_TEST_PHONE) &&
    email === env.WEBSITE_CRM_TEST_EMAIL?.trim().toLowerCase() &&
    phone === normalizePhone(env.WEBSITE_CRM_TEST_PHONE || '')
}

class DispatchHold extends Error {
  constructor(readonly code: string) { super(code) }
}

export async function websiteGhlApi<T>(path: string, method = 'GET', body?: unknown, created = false): Promise<T> {
  const token = env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim()
  if (!token) throw new DispatchHold('runtime_token_missing')
  const response = await fetch(API + path, {
    method, headers: { Authorization: `Bearer ${token}`, Version: VERSION, Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(10_000),
  })
  // Do not log upstream response bodies, contact details or credentials.
  if (!response.ok || (created && response.status !== 201)) throw new DispatchHold(`upstream_${response.status}`)
  return await response.json() as T
}

const api = websiteGhlApi

export async function exactMatches(locationId: string, field: 'email' | 'phone', value: string) {
  const result = await api<{ contacts: Contact[]; total: number }>('/contacts/search', 'POST', {
    locationId, filters: [{ field, operator: 'eq', value }], pageLimit: 2,
  })
  if (!Array.isArray(result.contacts) || typeof result.total !== 'number' || result.total > 1 || result.total !== result.contacts.length) {
    throw new DispatchHold('verification_required')
  }
  for (const c of result.contacts) {
    if (!c.id || c.locationId !== locationId || (field === 'email'
      ? c.email?.trim().toLowerCase() !== value : normalizePhone(c.phone || '') !== value)) throw new DispatchHold('verification_required')
  }
  return result.contacts
}

function identityMatches(c: Contact, input: GhlGrowthAssessment, location: string) {
  return c.id && c.locationId === location && c.email?.trim().toLowerCase() === input.email && normalizePhone(c.phone || '') === input.phone
}

function suppressed(c: Contact) {
  return c.dnd === true || HOLD_TAGS.some(t => c.tags?.includes(t))
}

// Used by the future recovery consumer as well as the CRM adapter. Never clears
// flags, consent or operator state. Test contacts are always suppressed.
export function recoveryChannelState(c: Contact, input: GhlGrowthAssessment, channel: string) {
  if (suppressed(c) || c.tags?.includes(TEST_TAG)) return 'suppressed'
  const dndChannel = channel === 'voice' ? 'call' : channel
  if (Object.entries(c.dndSettings || {}).some(([name, value]) => name.toLowerCase() === dndChannel && value.status === 'active')) return 'suppressed'
  if (c.tags?.includes('appt:booked')) return 'booked'
  if (input.submissionType === 'full-assessment' && input.fit.path === 'foundation') return 'foundation'
  if (channel === 'sms' && !input.consent?.smsMarketing) return 'consent_required'
  if (channel === 'voice' && !input.consent?.aiVoice) return 'consent_required'
  return 'awaiting_workflow_activation'
}

/** One receipt per stage and channel. Never scans/replays historical captures. */
export async function dispatchWebsiteSubmission(input: GhlGrowthAssessment, session: IntakeSession): Promise<DispatchResult> {
  await requireIntakeSession(session)
  const db = getDb()
  const [assessment] = await db.select().from(growthAssessments).where(eq(growthAssessments.id, input.submissionId)).limit(1)
  if (!assessment || assessment.intakeSessionHash !== session.tokenHash) throw new DispatchHold('verification_required')
  if (!dispatchAdmitted(input.email, input.phone)) return { state: assessment.status, synced: false, recovery: 'verification_pending' }
  // An old pending row is not new consent to activate dispatch.
  if (!assessment.status.startsWith('dispatch-')) return { state: assessment.status, synced: false, recovery: assessment.recoveryState || 'verification_pending' }
  const locationId = env.GHL_LOCATION_ID?.trim(), pipelineId = env.GHL_PIPELINE_ID?.trim(), stageId = env.GHL_PIPELINE_STAGE_ID?.trim()
  if (!locationId || !pipelineId || !stageId) return { state: 'dispatch-configuration-required', synced: false, recovery: 'held' }
  const stage = input.submissionType === 'homepage-quick-form' ? 'quick-capture' : 'completed'
  const key = `${locationId}:${input.submissionId}:${stage}:crm`
  const now = new Date()
  const [inserted] = await db.insert(websiteDispatchReceipts).values({ key, submissionId: input.submissionId,
    stage, channel: 'crm', locationId, state: 'processing', createdAt: now, updatedAt: now }).onConflictDoNothing().returning()
  if (!inserted) {
    const [receipt] = await db.select().from(websiteDispatchReceipts).where(eq(websiteDispatchReceipts.key, key)).limit(1)
    // A genuine email grant may release only a verification hold. Never take
    // over a processing/uncertain receipt or replay a historical capture.
    let claimed = false
    if (receipt?.state === 'held' && receipt.detail === 'parallel_or_unreconciled_submission' && !receipt.contactId) {
      const rows = await db.update(websiteDispatchReceipts).set({ state: 'processing', updatedAt: now }).where(and(
        eq(websiteDispatchReceipts.key, key), eq(websiteDispatchReceipts.state, 'held'), eq(websiteDispatchReceipts.detail, 'parallel_or_unreconciled_submission'),
      )).returning()
      claimed = rows.length === 1
    }
    if (receipt?.state === 'held' && receipt.detail === 'verification_required') {
      try {
        await requireContactGrant(session, env.WEBSITE_ACCEPTANCE_CONTACT_ID || '', input.email, input.phone)
        const rows = await db.update(websiteDispatchReceipts).set({ state: 'processing', updatedAt: now }).where(and(
          eq(websiteDispatchReceipts.key, key), eq(websiteDispatchReceipts.state, 'held'), eq(websiteDispatchReceipts.detail, 'verification_required'),
        )).returning()
        claimed = rows.length === 1
      } catch { /* Still unverified; return only the saved submission. */ }
    }
    if (!claimed) return { state: `dispatch-${receipt?.state || 'reconcile'}`, synced: receipt?.state === 'applied', recovery: assessment.recoveryState || 'held' }
  }
  let contactId: string | null = null, opportunityId: string | null = null, mutationStarted = false
  const acquired: string[] = []
  const save = async (state: string, detail: string, recovery = 'held') => {
    await db.update(websiteDispatchReceipts).set({ state, detail, contactId, opportunityId, updatedAt: new Date() }).where(eq(websiteDispatchReceipts.key, key))
    await db.update(growthAssessments).set({ status: `dispatch-${state}`, recoveryState: recovery,
      ghlContactId: contactId, updatedAt: new Date() }).where(eq(growthAssessments.id, input.submissionId))
    return { state: `dispatch-${state}`, synced: state === 'applied', recovery }
  }
  const lock = async (lockKey: string) => {
    const [claim] = await db.insert(websiteDispatchLocks).values({ key: lockKey, receiptKey: key, createdAt: new Date() }).onConflictDoNothing().returning()
    if (!claim) throw new DispatchHold('parallel_or_unreconciled_submission')
    acquired.push(lockKey)
  }
  const release = async () => {
    for (const lockKey of acquired) await db.delete(websiteDispatchLocks).where(and(eq(websiteDispatchLocks.key, lockKey), eq(websiteDispatchLocks.receiptKey, key)))
  }
  const mutate = async <T>(path: string, method: string, body: unknown, created = false) => {
    // Persist before any external mutation. If the response is lost, retain the
    // identity/contact lock until an operator reconciles the exact receipt.
    await db.update(websiteDispatchReceipts).set({ detail: `${method} ${path.split('/').filter(Boolean)[0]}`, updatedAt: new Date() }).where(eq(websiteDispatchReceipts.key, key))
    mutationStarted = true
    return api<T>(path, method, body, created)
  }
  try {
    const identityKeys = await Promise.all([`email:${input.email}`, `phone:${input.phone}`].map(async v => `${locationId}:${await hashText(v)}`))
    for (const identityKey of identityKeys.sort()) await lock(identityKey)
    const emailMatches = await exactMatches(locationId, 'email', input.email)
    const phoneMatches = await exactMatches(locationId, 'phone', input.phone)
    const candidates = new Set([...emailMatches, ...phoneMatches].map(c => c.id))
    for (const identityKey of identityKeys) {
      const [local] = await db.select().from(websiteCreatedIdentities).where(eq(websiteCreatedIdentities.key, identityKey)).limit(1)
      if (local) candidates.add(local.contactId)
    }
    if (candidates.size > 1) throw new DispatchHold('verification_required')
    const existingId = [...candidates][0]
    const acceptance = env.WEBSITE_CRM_MODE === 'acceptance'
    if (acceptance && existingId !== env.WEBSITE_ACCEPTANCE_CONTACT_ID) throw new DispatchHold('verification_required')
    // Verify all required destination configuration before creating a contact.
    const pipelines = await api<{ pipelines: Array<{ id: string; stages: Array<{ id: string }> }> }>(`/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`)
    if (!pipelines.pipelines?.some(p => p.id === pipelineId && p.stages?.some(s => s.id === stageId))) throw new DispatchHold('pipeline_configuration_required')
    const fields = await api<{ customFields: Array<{ id: string; fieldKey: string }> }>(`/locations/${encodeURIComponent(locationId)}/customFields?model=all`)
    const definitions = new Map(fields.customFields?.map(f => [f.fieldKey, f.id]))
    const field = (name: string, value: string) => {
      const id = definitions.get(name)
      if (!id) throw new DispatchHold('custom_field_configuration_required')
      return { id, fieldValue: value }
    }
    // Existing fields only; stage is encoded in the durable receipt, not a new field.
    const eventField = field(GHL_CONTACT_FIELD_KEYS.submissionId, input.submissionId)
    const metadata = [field(GHL_CONTACT_FIELD_KEYS.formName, 'growth-assessment'), field(GHL_CONTACT_FIELD_KEYS.formVersion, acceptance ? 'company-v2' : 'v1'),
      field(GHL_CONTACT_FIELD_KEYS.conversionPage, input.attribution.conversionPage)]
    if (stage === 'completed') metadata.push(field(GHL_CONTACT_FIELD_KEYS.industry, input.industry),
      field(GHL_CONTACT_FIELD_KEYS.revenueRange, input.annualRevenue), field(GHL_CONTACT_FIELD_KEYS.budgetRange, input.monthlyBudget),
      field(GHL_CONTACT_FIELD_KEYS.fitResult, input.fit.path === 'foundation' ? 'nurture' : 'qualified'))
    let contact: Contact
    if (existingId) {
      // Typed details never confer access to an existing identity.
      await requireContactGrant(session, existingId, input.email, input.phone)
      contact = (await api<{ contact: Contact }>(`/contacts/${encodeURIComponent(existingId)}`)).contact
      if (!identityMatches(contact, input, locationId)) throw new DispatchHold('verification_required')
      // Test mode must never modify a real contact, even with a valid grant.
      if (!acceptance && (!contact.tags?.includes(TEST_TAG) || !contact.tags.includes('automation:pause') || contact.dnd !== true)) throw new DispatchHold('test_suppression_missing')
      contactId = existingId
    } else {
      const result = await mutate<{ contact: Contact }>('/contacts/', 'POST', {
        locationId, firstName: `Synthetic — ${input.firstName}`, lastName: input.lastName,
        email: input.email, phone: input.phone, companyName: input.businessName || 'Synthetic Website Test — Not a Lead',
        source: 'PhynyxPro Website Synthetic Test', dnd: true,
        tags: [TEST_TAG, 'automation:pause', 'source:phynyx-website'],
      }, true)
      contact = result.contact
      if (!contact || !identityMatches(contact, input, locationId)) throw new DispatchHold('creation_receipt_invalid')
      // Persist returned identity before further work; never derive a grant from search.
      contactId = contact.id
      await save('processing', 'contact_created')
      for (const identityKey of identityKeys) await db.insert(websiteCreatedIdentities).values({ key: identityKey, contactId }).onConflictDoNothing()
      await grantCreatedContact(session, contactId, input.email, input.phone)
    }
    await lock(`${locationId}:contact:${contactId}`)
    const readProtection = async () => {
      await requireContactGrant(session, contactId!, input.email, input.phone)
      const current = (await api<{ contact: Contact }>(`/contacts/${encodeURIComponent(contactId!)}`)).contact
      if (!identityMatches(current, input, locationId)) throw new DispatchHold('verification_required')
      if (!acceptance && (!current.tags?.includes(TEST_TAG) || !current.tags.includes('automation:pause') || current.dnd !== true)) throw new DispatchHold('test_suppression_missing')
      if (acceptance && suppressed(current)) throw new DispatchHold('suppressed')
      if (current.tags?.some(t => ['appt:booked', 'stop bot', 'human handover'].includes(t))) throw new DispatchHold('protected_journey')
      const appointments = await api<{ events: Array<{ appointmentStatus?: string; startTime?: string }> }>(`/contacts/${encodeURIComponent(contactId!)}/appointments`)
      // Preserve historical appointments; only upcoming/undated active bookings
      // block a fresh acquisition handoff. Unknown dates fail closed.
      if (!Array.isArray(appointments.events) || appointments.events.some(e => {
        if (['cancelled', 'canceled', 'showed', 'noshow', 'no-show', 'invalid'].includes(e.appointmentStatus || '')) return false
        const at = Date.parse(e.startTime || '')
        // Date strings without an offset use account time; a one-day guard
        // prevents treating a near-term booking as past due to timezone ambiguity.
        return !Number.isFinite(at) || at >= Date.now() - 24 * 60 * 60_000
      })) throw new DispatchHold('protected_appointment')
      return current
    }
    contact = await readProtection()
    const query = new URLSearchParams({ locationId, contactId, pipelineId, status: 'all', limit: '100' })
    const opportunities = await api<{ opportunities: Opportunity[]; meta?: { total?: number; nextPage?: unknown } }>(`/opportunities/search?${query}`)
    const opps = opportunities.opportunities
    if (!Array.isArray(opps) || opps.length > 1 || (opportunities.meta?.total ?? opps.length) > opps.length || opportunities.meta?.nextPage) throw new DispatchHold('opportunity_review_required')
    const nurtureStage = env.WEBSITE_RETURNING_NURTURE_STAGE_ID?.trim()
    const allowedNurture = env.WEBSITE_RETURNING_NURTURE_APPROVED === 'true' && nurtureStage &&
      pipelines.pipelines.some(p => p.id === pipelineId && p.stages.some(s => s.id === nurtureStage))
    if (opps.some(o => o.pipelineId !== pipelineId || (o.contactId || o.contact?.id) !== contactId || o.status !== 'open' ||
      (o.pipelineStageId !== stageId && !(allowedNurture && o.pipelineStageId === nurtureStage)))) throw new DispatchHold('protected_opportunity')
    opportunityId = opps[0]?.id || null
    const recoveryContext = { input, locationId, contactId, opportunityId, stage, now,
      formVersionField: field(GHL_CONTACT_FIELD_KEYS.formVersion, 'company-v2'), api, mutate, readProtection: async () => {
        const current = await readProtection()
        const latest = await api<{ opportunities: Opportunity[]; meta?: { total?: number; nextPage?: unknown } }>(`/opportunities/search?${query}`)
        if (!Array.isArray(latest.opportunities) || latest.opportunities.length > 1 || latest.meta?.nextPage ||
          (latest.meta?.total ?? latest.opportunities.length) > latest.opportunities.length ||
          (opportunityId && latest.opportunities[0]?.id !== opportunityId) ||
          latest.opportunities.some(o => o.pipelineId !== pipelineId || (o.contactId || o.contact?.id) !== contactId || o.status !== 'open' ||
            (o.pipelineStageId !== stageId && !(allowedNurture && o.pipelineStageId === nurtureStage)))) throw new DispatchHold('protected_opportunity')
        return current
      }, channelState: recoveryChannelState }
    // The version discriminator and marker precede opportunity creation and legacy event fields/tags.
    const recoveryPrepared = await prepareRecoveryDispatch(recoveryContext)
    if (!opportunityId) {
      const created = await mutate<{ opportunity: Opportunity }>('/opportunities/', 'POST', {
        locationId, contactId, pipelineId, pipelineStageId: stageId, status: 'open',
        name: `${acceptance ? 'Website assessment' : 'Synthetic Website Test'} — ${input.businessName || input.firstName}`,
      }, true)
      if (!created.opportunity?.id || created.opportunity.pipelineId !== pipelineId || (created.opportunity.contactId || created.opportunity.contact?.id) !== contactId) throw new DispatchHold('opportunity_receipt_invalid')
      opportunityId = created.opportunity.id
      await save('processing', 'opportunity_created')
    }
    // Cancel only reviewed acquisition workflows before changing their context.
    // No CRM identity, owner, opportunity state, DND or existing consent reset.
    recoveryContext.opportunityId = opportunityId
    const priorCompleted = contact.tags?.some(t => ['sales:booking-followup', 'sales:nurture', 'fit:qualified', 'fit:nurture'].includes(t))
    await readProtection()
    // A new partial attempt can describe current progress without erasing the
    // last completed qualification fields or any immutable assessment history.
    if (!(stage === 'quick-capture' && priorCompleted)) {
      await mutate(`/contacts/${encodeURIComponent(contactId)}`, 'PUT', { customFields: metadata })
    }
    const next = stage === 'quick-capture' ? 'sales:assessment-incomplete' : input.fit.path === 'foundation' ? 'sales:nurture' : 'sales:booking-followup'
    const remove = ['sales:assessment-incomplete', 'sales:booking-followup', 'sales:nurture'].filter(t => t !== next)
    if (stage === 'completed') remove.push(input.fit.path === 'foundation' ? 'fit:qualified' : 'fit:nurture')
    await mutate(`/contacts/${encodeURIComponent(contactId)}/tags`, 'DELETE', { tags: remove })
    await mutate(`/contacts/${encodeURIComponent(contactId)}/tags`, 'POST', { tags: ['source:phynyx-website', 'automation:phynyx-web-v1', 'form:growth-assessment', 'intent:assessment', next,
      ...(acceptance && input.consent?.smsService ? ['consent:sms-service'] : []),
      ...(stage === 'completed' ? [input.fit.path === 'foundation' ? 'fit:nurture' : 'fit:qualified'] : [])] })
    // Marketing/voice consent stays in the submission snapshot; existing CRM
    // consent must ALSO permit those channels. No silent enrollment opt-in.
    await readProtection()
    await mutate(`/contacts/${encodeURIComponent(contactId)}`, 'PUT', { customFields: [eventField] })
    const recovery = await enrollRecoveryDispatch(recoveryContext, recoveryPrepared)
    const result = await save('applied', 'crm_capture_verified_by_responses', recovery)
    await release()
    return result
  } catch (error) {
    const detail = error instanceof DispatchHold || error instanceof RecoveryDispatchError ? error.code : error instanceof PublicFormError ? 'verification_required' : 'upstream_or_storage_failure'
    // Lost responses and partial mutations hold the locks. No blind write retry.
    const result = await save(mutationStarted ? 'reconcile' : 'held', detail, detail === 'verification_required' ? 'verification_pending' : 'held')
    if (!mutationStarted) await release()
    console.error('Website dispatch held', { submissionId: input.submissionId, stage, code: detail })
    return result
  }
}
