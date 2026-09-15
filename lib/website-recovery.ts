import { env } from 'cloudflare:workers'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { websiteDispatchReceipts } from '@/db/schema'
import type { Contact } from './website-dispatch'
import type { GhlGrowthAssessment } from './ghl'

// Existing reviewed website workflows, not a new workflow or a public endpoint.
export const RECOVERY_WORKFLOWS = {
  incomplete: { id: '7780711c-043e-40a6-8d49-92210c96fcd9', name: '002a - Incomplete Assessment Recovery' },
  completed: { id: '2bf5b127-8c2d-4200-973c-aec295397aaa', name: '002b - Assessment Complete & Booking Recovery' },
  voice: { id: '45d9da71-533d-43d7-9dce-07232fc5ad3b', name: '002c - Consented Voice Outreach' },
  sms: { id: '7fa97577-9208-45bd-823f-3eed0e25ac09', name: '002d - Consented SMS Conversation' },
} as const

export class RecoveryDispatchError extends Error {
  constructor(readonly code: string) { super(code) }
}

type Api = <T>(path: string, method?: string, body?: unknown) => Promise<T>
type Context = {
  input: GhlGrowthAssessment; locationId: string; contactId: string; opportunityId: string | null;
  stage: string; now: Date; api: Api; formVersionField: { id: string; fieldValue: string };
  mutate: <T>(path: string, method: string, body: unknown) => Promise<T>;
  readProtection: () => Promise<Contact>;
  channelState: (contact: Contact, input: GhlGrowthAssessment, channel: string) => string;
}
const enabled = () => env.WEBSITE_RECOVERY_DISPATCH_ENABLED === 'true' &&
  env.WEBSITE_CRM_MODE === 'acceptance' && env.WEBSITE_ACCEPTANCE_WORKFLOWS_APPROVED === 'true'

async function receipt(c: Context, channel: string, state: string, detail: string) {
  const key = `${c.locationId}:${c.input.submissionId}:${c.stage}:${channel}`
  const db = getDb()
  await db.insert(websiteDispatchReceipts).values({ key, submissionId: c.input.submissionId,
    stage: c.stage, channel, locationId: c.locationId, contactId: c.contactId,
    opportunityId: c.opportunityId, state, detail, createdAt: c.now, updatedAt: new Date(),
  }).onConflictDoNothing()
  await db.update(websiteDispatchReceipts).set({ state, detail, updatedAt: new Date() })
    .where(eq(websiteDispatchReceipts.key, key))
}

async function acknowledged(c: Context, channel: string, workflow: string, method: 'POST' | 'DELETE') {
  // Persist intent BEFORE the external operation. A lost/malformed response is
  // never retried: the enclosing CRM receipt retains its durable contact lock.
  await receipt(c, channel, method === 'DELETE' ? 'exit_requested' : 'enrollment_requested', workflow)
  const result = await c.mutate<{ succeeded?: boolean; succeded?: boolean }>(
    `/contacts/${encodeURIComponent(c.contactId)}/workflow/${encodeURIComponent(workflow)}`, method, {})
  if (result.succeeded !== true && result.succeded !== true) throw new RecoveryDispatchError('workflow_acknowledgment_missing')
  await receipt(c, channel, method === 'DELETE' ? 'exit_acknowledged' : 'enrollment_acknowledged', workflow)
}

/** Must execute under the CRM dispatcher's non-expiring per-contact claim. */
export async function prepareRecoveryDispatch(c: Context) {
  if (!enabled()) return false
  const inventory = await c.api<{ workflows: Array<{ id: string; name: string; status: string; locationId: string }> }>(
    `/workflows/?locationId=${encodeURIComponent(c.locationId)}`)
  for (const workflow of Object.values(RECOVERY_WORKFLOWS)) {
    if (!inventory.workflows?.some(w => w.id === workflow.id && w.name === workflow.name &&
      w.status === 'published' && w.locationId === c.locationId)) throw new RecoveryDispatchError('workflow_configuration_required')
  }
  await c.readProtection()
  // UI-supported positive filter: legacy Contact Tag triggers require v1.
  // Set company-v2 FIRST, in a separate acknowledged request. No tag/identity
  // override can stand in for this reviewed trigger contract.
  await c.mutate(`/contacts/${encodeURIComponent(c.contactId)}`, 'PUT', { customFields: [c.formVersionField] })
  const versionReadback = await c.readProtection()
  if (!versionReadback.customFields?.some(f => f.id === c.formVersionField.id && f.value === 'company-v2')) {
    throw new RecoveryDispatchError('company_discriminator_unconfirmed')
  }
  // Marker is origin/state, never an event pulse or ownership credential.
  await c.mutate(`/contacts/${encodeURIComponent(c.contactId)}/tags`, 'POST', { tags: ['source:phynyx-company'] })
  // A fresh intentional event replaces pending acquisition follow-up only after
  // all four removals are acknowledged. Never remove booking/no-show workflows.
  for (const [name, workflow] of Object.entries(RECOVERY_WORKFLOWS)) {
    await c.readProtection()
    await acknowledged(c, `exit-${name}`, workflow.id, 'DELETE')
  }
  return true
}

export async function enrollRecoveryDispatch(c: Context, prepared: boolean) {
  let enrolled = 0
  for (const channel of ['email', 'sms', 'voice']) {
    const contact = await c.readProtection()
    let state = c.channelState(contact, c.input, channel)
    // Keep the established workflow's marketing-SMS / AI-voice qualification.
    if (state === 'awaiting_workflow_activation' && channel !== 'email') {
      if (c.stage !== 'completed') state = 'not_applicable'
      else if (!contact.tags?.includes(channel === 'sms' ? 'consent:sms-marketing' : 'consent:ai-voice')) state = 'consent_required'
    }
    if (!prepared || state !== 'awaiting_workflow_activation') {
      await receipt(c, channel, state, prepared ? 'current_channel_guard' : 'workflow_activation_required')
      continue
    }
    const workflow = channel === 'email' ? (c.stage === 'completed' ? RECOVERY_WORKFLOWS.completed : RECOVERY_WORKFLOWS.incomplete)
      : channel === 'sms' ? RECOVERY_WORKFLOWS.sms : RECOVERY_WORKFLOWS.voice
    await acknowledged(c, channel, workflow.id, 'POST')
    enrolled++
  }
  // An API acknowledgment is NOT proof of active membership, sends or delivery.
  return enrolled ? 'enrollment_acknowledged' : c.input.submissionType === 'full-assessment' && c.input.fit.path === 'foundation'
    ? 'foundation' : prepared ? 'channel_suppressed' : env.WEBSITE_CRM_MODE === 'test' ? 'suppressed' : 'awaiting_workflow_activation'
}
