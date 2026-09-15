import { env } from 'cloudflare:workers'
import { and, eq, gt } from 'drizzle-orm'
import { getDb } from '@/db'
import { growthAssessments, intakeContactGrants, websiteVerifications } from '@/db/schema'
import { createIntakeSession, readIntakeSession, requireIntakeSession } from './intake-session'
import { enforcePublicFormRateLimit, hashText, normalizePhone, normalizePhoneForComparison, PublicFormError } from './public-form-security'
import { exactMatches, websiteGhlApi } from './website-dispatch'

const invalid = () => new PublicFormError(400, 'VERIFICATION_UNAVAILABLE', 'This verification request is unavailable or expired. Request a new link from your assessment.')
const enabled = () => env.WEBSITE_VERIFICATION_ENABLED === 'true' && Boolean(env.WEBSITE_ACCEPTANCE_CONTACT_ID)

export async function requestWebsiteVerification(request: Request, submissionId: string) {
  if (!enabled()) throw invalid()
  const session = await readIntakeSession(request)
  if (!session) throw invalid()
  const db = getDb()
  const [submission] = await db.select().from(growthAssessments).where(and(eq(growthAssessments.id, submissionId), eq(growthAssessments.intakeSessionHash, session.tokenHash))).limit(1)
  if (!submission) throw invalid()
  await enforcePublicFormRateLimit({ request, scope: 'verification', identity: submission.email })
  const generic = { accepted: true, message: 'If these details are eligible, a verification link will be sent to the matching stored email. No CRM ownership is granted until you confirm it.' }
  const [prior] = await db.select().from(websiteVerifications).where(eq(websiteVerifications.submissionId, submissionId)).limit(1)
  if (prior) return generic // one send per event, including uncertain sends; a fresh assessment can request a new link
  const locationId = env.GHL_LOCATION_ID
  const emails = await exactMatches(locationId, 'email', submission.email)
  const phones = await exactMatches(locationId, 'phone', submission.phone)
  if (emails.length !== 1 || phones.length !== 1 || emails[0].id !== phones[0].id || emails[0].id !== env.WEBSITE_ACCEPTANCE_CONTACT_ID) return generic
  const { contact } = await websiteGhlApi<{ contact: { id: string; locationId: string; email: string; phone: string; dnd?: boolean; dndSettings?: Record<string, { status?: string }> } }>(`/contacts/${encodeURIComponent(emails[0].id)}`)
  if (contact.locationId !== locationId || contact.email?.toLowerCase().trim() !== submission.email || normalizePhone(contact.phone || '') !== submission.phone) return generic
  // Destination scope is an acceptance-test boundary, NOT proof of identity.
  if (contact.email !== env.WEBSITE_CRM_TEST_EMAIL || normalizePhone(contact.phone) !== normalizePhone(env.WEBSITE_CRM_TEST_PHONE || '')) return generic
  if (contact.dnd || Object.entries(contact.dndSettings || {}).some(([k,v]) => k.toLowerCase() === 'email' && v.status === 'active')) throw new PublicFormError(409, 'EMAIL_SUPPRESSED', 'Email verification cannot be sent while email contact is suppressed. Your report remains available.')
  const origin = new URL(env.SITE_URL || '').origin
  if (origin !== new URL(request.url).origin || !origin.startsWith('https://')) throw invalid()
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('')
  const tokenHash = await hashText(token), now = new Date()
  // Fragment is never sent in the page request or referrer. No GET confirmation.
  const link = `${origin}/verify#${token}`
  const inserted = await db.insert(websiteVerifications).values({ tokenHash, submissionId, requestSessionHash: session.tokenHash,
    contactId: contact.id, locationId, email: submission.email, phone: submission.phone,
    state: 'sending', createdAt: now, expiresAt: new Date(now.getTime() + 15 * 60_000) }).onConflictDoNothing().returning()
  if (inserted.length !== 1) return generic
  try {
    const receipt = await websiteGhlApi<{ messageId?: string; emailMessageId?: string }>('/conversations/messages', 'POST', {
      type: 'Email', contactId: contact.id, subject: 'Verify your PhynyxPro assessment',
      html: `<p>You requested verification for a new PhynyxPro assessment.</p><p><a href="${link}">Review and confirm your request</a></p><p>This single-use link expires in 15 minutes. If you did not request it, ignore this email. Verification does not grant marketing or AI voice consent.</p>`,
    })
    const messageId = receipt.messageId || receipt.emailMessageId
    if (!messageId) throw new Error('Unacknowledged send')
    await db.update(websiteVerifications).set({ state: 'sent', messageId }).where(eq(websiteVerifications.tokenHash, tokenHash))
    return generic // API acknowledgment is not delivery evidence
  } catch (error) {
    await db.update(websiteVerifications).set({ state: 'send_uncertain' }).where(eq(websiteVerifications.tokenHash, tokenHash))
    const code = error instanceof Error && 'code' in error && typeof error.code === 'string' && /^upstream_\d{3}$/.test(error.code) ? error.code : 'send_or_storage_unconfirmed'
    console.error('Website verification send unconfirmed', { submissionId, code })
    throw new PublicFormError(503, 'VERIFICATION_SEND_UNCONFIRMED', 'Verification email delivery could not be confirmed. Your report is saved; please do not repeatedly retry.')
  }
}

export async function confirmWebsiteVerification(request: Request, token: string) {
  if (!enabled() || !/^[0-9a-f]{64}$/.test(token)) throw invalid()
  await enforcePublicFormRateLimit({ request, scope: 'verification', identity: '' })
  const db = getDb(), tokenHash = await hashText(token)
  const [verification] = await db.select().from(websiteVerifications).where(and(eq(websiteVerifications.tokenHash, tokenHash), gt(websiteVerifications.expiresAt, new Date()))).limit(1)
  if (!verification || !['sent', 'send_uncertain'].includes(verification.state)) throw invalid()
  const { contact } = await websiteGhlApi<{ contact: { id: string; locationId: string; email?: string; phone?: string } }>(`/contacts/${encodeURIComponent(verification.contactId)}`)
  if (contact.id !== verification.contactId || contact.locationId !== verification.locationId || contact.email?.trim().toLowerCase() !== verification.email || normalizePhone(contact.phone || '') !== verification.phone) throw invalid()
  let session = await readIntakeSession(request), cookie: string | undefined
  if (!session) {
    cookie = await createIntakeSession(request)
    session = await readIntakeSession(new Request(request.url, { headers: { cookie: cookie.split(';')[0] } }))
  }
  if (!session) throw invalid()
  await requireIntakeSession(session)
  const claimed = await db.update(websiteVerifications).set({ state: 'claimed', claimedSessionHash: session.tokenHash }).where(and(
    eq(websiteVerifications.tokenHash, tokenHash), eq(websiteVerifications.state, verification.state), gt(websiteVerifications.expiresAt, new Date()),
  )).returning()
  if (claimed.length !== 1) throw invalid()
  // Audit retains requesting/claiming sessions and exact contact/identity scope.
  // A session on another device is granted only through this emailed capability.
  await db.insert(intakeContactGrants).values({ sessionHash: session.tokenHash, locationId: verification.locationId,
    contactId: verification.contactId, email: verification.email, phone: normalizePhoneForComparison(verification.phone) }).onConflictDoNothing()
  return Response.json({ verified: true, message: 'Verified for this browser for up to two hours. Return to your assessment here, or start a fresh assessment in this browser. No previous CRM information has been loaded.' },
    { headers: { 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) } })
}
