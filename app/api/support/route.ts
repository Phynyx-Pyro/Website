import { getDb } from '@/db'
import { supportRequests } from '@/db/schema'
import {
  PublicFormError,
  canonicalPayloadHashInput,
  enforcePublicFormRateLimit,
  hashText,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'
import { eq } from 'drizzle-orm'

const MAX_REQUEST_BYTES = 12 * 1_024

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  try {
    const payload = await readBoundedJson(request, MAX_REQUEST_BYTES)

    if (clean(payload.website, 200)) {
      return Response.json(
        { success: true, ignored: true },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const name = clean(payload.name, 160)
    const email = clean(payload.email, 254).toLowerCase()
    const subject = clean(payload.subject, 200)
    const message = clean(payload.message, 5_000)

    if (!name || !email || !message) {
      throw new PublicFormError(
        400,
        'REQUIRED_FIELDS',
        'Name, email, and message are required.',
      )
    }

    if (!isValidEmail(email)) {
      throw new PublicFormError(
        400,
        'INVALID_EMAIL',
        'Please enter a valid email address.',
      )
    }

    const id = normalizeSubmissionId(payload.submissionId)
    await enforcePublicFormRateLimit({ request, scope: 'support', identity: email })
    const payloadHash = await hashText(
      canonicalPayloadHashInput([name, email, subject, message]),
    )
    const now = new Date()
    const db = getDb()
    const [inserted] = await db
      .insert(supportRequests)
      .values({
        id,
        name,
        email,
        subject: subject || null,
        message,
        payloadHash,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: supportRequests.id })

    if (!inserted) {
      const [existing] = await db
        .select({ payloadHash: supportRequests.payloadHash })
        .from(supportRequests)
        .where(eq(supportRequests.id, id))
        .limit(1)

      if (!existing || existing.payloadHash !== payloadHash) {
        throw new PublicFormError(
          409,
          'SUBMISSION_CONFLICT',
          'This message changed while it was being sent. Please try again.',
        )
      }
    }

    return Response.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    console.error('Support request submission failed', error)
    return Response.json(
      { success: false, message: 'We could not send your message. Please try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
