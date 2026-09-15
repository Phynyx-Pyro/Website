import { env } from 'cloudflare:workers'
import { and, eq, gt, lte } from 'drizzle-orm'
import { getDb } from '@/db'
import { intakeContactGrants, intakeSessions } from '@/db/schema'
import { hashText, normalizePhoneForComparison, PublicFormError } from './public-form-security'

function cookieName(request: Request) {
  return new URL(request.url).protocol === 'https:' ? '__Host-phynyx_intake' : 'phynyx_intake'
}
const SESSION_TTL_MS = 2 * 60 * 60_000
export type IntakeSession = { tokenHash: string }

export function contactVerificationRequired() {
  return new PublicFormError(403, 'CONTACT_VERIFICATION_REQUIRED',
    'To protect your contact information, our team must verify this request before changing existing CRM records or opening a prefilled calendar. Please contact support; retrying alone will not verify ownership.')
}

function cookieToken(request: Request) {
  const name = cookieName(request)
  const values = (request.headers.get('cookie') || '').split(';')
    .map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`))
  // Duplicate cookies can be introduced by sibling paths/domains; fail closed.
  if (values.length !== 1) return ''
  const token = values[0].slice(name.length + 1)
  return /^[0-9a-f]{64}$/.test(token) ? token : ''
}

export async function requireIntakeSession(session: IntakeSession) {
  if (!/^[0-9a-f]{64}$/.test(session.tokenHash)) throw contactVerificationRequired()
  const [found] = await getDb().select().from(intakeSessions).where(and(
    eq(intakeSessions.tokenHash, session.tokenHash), gt(intakeSessions.expiresAt, new Date()),
  )).limit(1)
  if (!found) throw contactVerificationRequired()
}

export async function readIntakeSession(request: Request): Promise<IntakeSession | null> {
  const token = cookieToken(request)
  if (!token) return null
  const session = { tokenHash: await hashText(token) }
  try { await requireIntakeSession(session) } catch (error) {
    if (error instanceof PublicFormError) return null
    throw error
  }
  return session
}

export async function createIntakeSession(request: Request) {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  const now = new Date()
  const db = getDb()
  await db.delete(intakeSessions).where(lte(intakeSessions.expiresAt, now))
  await db.insert(intakeSessions).values({
    tokenHash: await hashText(token), expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  })
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${secure}`
}

function identity(email: string, phone: string) {
  const locationId = env.GHL_LOCATION_ID?.trim()
  if (!locationId) throw new Error('GoHighLevel location ID is unavailable.')
  return { locationId, email: email.trim().toLowerCase(), phone: normalizePhoneForComparison(phone) }
}

// Called only for a validated 201 Created receipt from the create-only CRM API.
// Knowing an email/phone or possessing a submission UUID never creates a grant.
export async function grantCreatedContact(session: IntakeSession, contactId: string, email: string, phone: string) {
  await requireIntakeSession(session)
  // Retry only persistence of the already-validated receipt, never CRM creation.
  // If storage stays unavailable, human verification is required: duplicate
  // lookup on a later request must not manufacture creation provenance.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await getDb().insert(intakeContactGrants).values({
        sessionHash: session.tokenHash, contactId, ...identity(email, phone),
      }).onConflictDoNothing()
      return
    } catch {
      if (attempt === 2) throw contactVerificationRequired()
    }
  }
}

export async function requireContactGrant(session: IntakeSession, contactId: string, email: string, phone: string) {
  await requireIntakeSession(session)
  const expected = identity(email, phone)
  const [grant] = await getDb().select().from(intakeContactGrants).where(and(
    eq(intakeContactGrants.sessionHash, session.tokenHash),
    eq(intakeContactGrants.locationId, expected.locationId),
    eq(intakeContactGrants.contactId, contactId),
    eq(intakeContactGrants.email, expected.email),
    eq(intakeContactGrants.phone, expected.phone),
  )).limit(1)
  if (!grant) throw contactVerificationRequired()
}
