import { and, eq, gt, gte, isNull, lt, ne, or } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookingHandoffs, growthAssessments } from '@/db/schema'
import { hashText } from './public-form-security'

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

export async function issueBookingSession(submissionId: string, requestUrl: string) {
  const now = new Date()
  const token = randomToken()
  const tokenHash = await hashText(token)
  const db = getDb()

  await db.delete(bookingHandoffs).where(lt(bookingHandoffs.expiresAt, now))
  await db.insert(bookingHandoffs).values({
    tokenHash,
    submissionId,
    expiresAt: new Date(now.getTime() + BOOKING_SESSION_TTL_MS),
    claimedAt: null,
    createdAt: now,
  })

  return serializeBookingCookie(token, requestUrl)
}

type ClaimableBookingContact = {
  submissionId: string
  contactId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  fitPath: string | null
}

export async function claimBookingSession(
  token: string,
  beforeClaim?: (contact: ClaimableBookingContact) => Promise<void>,
) {
  if (!/^[0-9a-f]{64}$/.test(token)) return null

  const tokenHash = await hashText(token)
  const now = new Date()
  const db = getDb()
  const [handoff] = await db
    .select({ submissionId: bookingHandoffs.submissionId })
    .from(bookingHandoffs)
    .where(
      and(
        eq(bookingHandoffs.tokenHash, tokenHash),
        isNull(bookingHandoffs.claimedAt),
        gt(bookingHandoffs.expiresAt, now),
      ),
    )
    .limit(1)

  if (!handoff) return null

  const [assessment] = await db
    .select({
      contactId: growthAssessments.ghlContactId,
      firstName: growthAssessments.firstName,
      lastName: growthAssessments.lastName,
      email: growthAssessments.email,
      phone: growthAssessments.phone,
      fitPath: growthAssessments.fitPath,
      createdAt: growthAssessments.createdAt,
      updatedAt: growthAssessments.updatedAt,
    })
    .from(growthAssessments)
    .where(
      and(
        eq(growthAssessments.id, handoff.submissionId),
        eq(growthAssessments.status, 'crm-synced'),
      ),
    )
    .limit(1)

  if (!assessment?.contactId) return null

  // Once another assessment for this CRM contact starts writing metadata,
  // an older handoff must fail closed even if that newer write stops before
  // advancing the CRM's final submission marker. A later-created assessment
  // or an older assessment retried after this assessment finished syncing
  // both count. Using the assessment's sync timestamp keeps the guard intact
  // when an exact retry issues a replacement handoff token later.
  const [supersedingAssessment] = await db
    .select({ id: growthAssessments.id })
    .from(growthAssessments)
    .where(
      and(
        or(
          eq(growthAssessments.ghlContactId, assessment.contactId),
          and(
            eq(growthAssessments.email, assessment.email),
            eq(growthAssessments.phone, assessment.phone),
          ),
        ),
        ne(growthAssessments.id, handoff.submissionId),
        or(
          gte(growthAssessments.createdAt, assessment.createdAt),
          gte(growthAssessments.updatedAt, assessment.updatedAt),
        ),
      ),
    )
    .limit(1)

  if (supersedingAssessment) return null

  const bookingContact = {
    submissionId: handoff.submissionId,
    contactId: assessment.contactId,
    firstName: assessment.firstName,
    lastName: assessment.lastName,
    email: assessment.email,
    phone: assessment.phone,
    fitPath: assessment.fitPath,
  }

  const [claimed] = await db
    .update(bookingHandoffs)
    .set({ claimedAt: now })
    .where(
      and(
        eq(bookingHandoffs.tokenHash, tokenHash),
        isNull(bookingHandoffs.claimedAt),
        gt(bookingHandoffs.expiresAt, now),
      ),
    )
    .returning({ submissionId: bookingHandoffs.submissionId })

  if (!claimed) return null

  try {
    await beforeClaim?.(bookingContact)
    return bookingContact
  } catch (error) {
    // The claim is a short reservation while required external work runs. If
    // that work fails, release only this reservation so the visitor can retry;
    // concurrent requests cannot both reach the external write.
    await db
      .update(bookingHandoffs)
      .set({ claimedAt: null })
      .where(
        and(
          eq(bookingHandoffs.tokenHash, tokenHash),
          eq(bookingHandoffs.claimedAt, now),
        ),
      )
      .returning({ submissionId: bookingHandoffs.submissionId })
    throw error
  }
}
