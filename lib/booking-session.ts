import { and, eq, gt, isNull, lt } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookingHandoffs, growthAssessments } from '@/db/schema'
import { hashText } from './public-form-security'
import { contactVerificationRequired, requireContactGrant, type IntakeSession } from './intake-session'

export const BOOKING_COOKIE_NAME = 'phynyx_booking'
const BOOKING_SESSION_TTL_MS = 15 * 60_000

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function serializeBookingCookie(
  token: string,
  requestUrl: string,
  maxAgeSeconds = BOOKING_SESSION_TTL_MS / 1_000,
) {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : ''
  return `${BOOKING_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`
}

export function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return ''

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    const key = part.slice(0, separator).trim()
    if (key !== name) continue
    return part.slice(separator + 1).trim()
  }

  return ''
}

export async function issueBookingSession(submissionId: string, requestUrl: string, session: IntakeSession) {
  const now = new Date()
  const token = randomToken()
  const tokenHash = await hashText(token)
  const db = getDb()
  const [assessment] = await db.select().from(growthAssessments).where(and(
    eq(growthAssessments.id, submissionId),
    eq(growthAssessments.intakeSessionHash, session.tokenHash),
    eq(growthAssessments.status, 'crm-synced'),
  )).limit(1)
  if (!assessment?.ghlContactId) throw contactVerificationRequired()
  await requireContactGrant(session, assessment.ghlContactId, assessment.email, assessment.phone)

  await db.delete(bookingHandoffs).where(lt(bookingHandoffs.expiresAt, now))
  await db.insert(bookingHandoffs).values({
    tokenHash,
    submissionId,
    intakeSessionHash: session.tokenHash,
    expiresAt: new Date(now.getTime() + BOOKING_SESSION_TTL_MS),
    claimedAt: null,
    createdAt: now,
  })

  return serializeBookingCookie(token, requestUrl)
}

export async function claimBookingSession(token: string, session: IntakeSession | null) {
  if (!session || !/^[0-9a-f]{64}$/.test(token)) return null

  const tokenHash = await hashText(token)
  const now = new Date()
  const db = getDb()
  const [claimed] = await db
    .update(bookingHandoffs)
    .set({ claimedAt: now })
    .where(
      and(
        eq(bookingHandoffs.tokenHash, tokenHash),
        eq(bookingHandoffs.intakeSessionHash, session.tokenHash),
        isNull(bookingHandoffs.claimedAt),
        gt(bookingHandoffs.expiresAt, now),
      ),
    )
    .returning({ submissionId: bookingHandoffs.submissionId })

  if (!claimed) return null

  const [assessment] = await db
    .select({
      contactId: growthAssessments.ghlContactId,
      firstName: growthAssessments.firstName,
      lastName: growthAssessments.lastName,
      email: growthAssessments.email,
      phone: growthAssessments.phone,
    })
    .from(growthAssessments)
    .where(
      and(
        eq(growthAssessments.id, claimed.submissionId),
        eq(growthAssessments.status, 'crm-synced'),
        eq(growthAssessments.intakeSessionHash, session.tokenHash),
      ),
    )
    .limit(1)

  if (!assessment?.contactId) return null
  await requireContactGrant(session, assessment.contactId, assessment.email, assessment.phone)

  return {
    contactId: assessment.contactId,
    firstName: assessment.firstName,
    lastName: assessment.lastName,
    email: assessment.email,
    phone: assessment.phone,
  }
}
