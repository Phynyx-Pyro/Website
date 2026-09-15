import { getDb } from '@/db'
import { growthAssessments } from '@/db/schema'
import { issueBookingSession } from '@/lib/booking-session'
import { contactVerificationRequired, readIntakeSession, requireContactGrant, type IntakeSession } from '@/lib/intake-session'
import {
  GhlIdentityConflictError,
  isGhlContactNotFoundError,
  resolveGrowthAssessmentContact,
  syncGrowthAssessmentMetadata,
} from '@/lib/ghl'
import { assessGrowthFit, type FitAssessment } from '@/lib/growth-assessment'
import {
  calculateGrowthSnapshot,
  parseGrowthSnapshotInput,
  type GrowthSnapshotResult,
} from '@/lib/growth-snapshot'
import { CONSENT_VERSION, CONSENT_DISCLOSURES, parseContactConsent } from '@/lib/contact-consent'
import {
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
} from '@/lib/assessment-attribution'
import {
  PublicFormError,
  canonicalPayloadHashInput,
  enforcePublicFormRateLimit,
  hashText,
  normalizePhone,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'
import { and, eq } from 'drizzle-orm'

const MAX_REQUEST_BYTES = 24 * 1_024
const PROCESSING_LEASE_MS = 2 * 60_000

const MAX_LENGTHS = {
  firstName: 80,
  lastName: 80,
  email: 254,
  phone: 40,
  businessName: 160,
  industry: 80,
  annualRevenue: 80,
  biggestChallenge: 120,
  currentMarketing: 2_000,
  monthlyBudget: 80,
  capacity: 80,
  decisionRole: 80,
  implementationTiming: 80,
  followUpOwner: 80,
  landingPage: 2_048,
  referrer: 2_048,
  attributionValue: 500,
} as const

const ALLOWED_INDUSTRIES = new Set([
  'chiropractic',
  'dental',
  'medspa',
  'home-services',
  'other-healthcare',
  'other-service',
])

const ALLOWED_REVENUE = new Set([
  'under-200k',
  '200k-300k',
  '300k-500k',
  '500k-1m',
  '1m-plus',
])

const ALLOWED_BUDGET = new Set([
  'under-1k',
  '1k-2k',
  '2k-3k',
  '3k-5k',
  '5k-plus',
])

const ALLOWED_CAPACITY = new Set(['none', '1-5', '6-10', '11-20', '20-plus'])
const ALLOWED_DECISION_ROLES = new Set(['owner', 'partner', 'influencer', 'researching'])
const ALLOWED_TIMING = new Set([
  'within-30-days',
  '31-60-days',
  '61-90-days',
  'later',
  'researching',
])
const ALLOWED_FOLLOW_UP_OWNERS = new Set(['yes', 'unsure', 'no'])

const ALLOWED_CHALLENGES = new Set([
  'not-enough-leads',
  'leads-not-converting',
  'no-show-rate',
  'no-attribution',
  'follow-up',
  'scaling',
])

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function cleanAttributionValue(value: unknown) {
  return clean(value, MAX_LENGTHS.attributionValue).replace(
    /[\u0000-\u001f\u007f]/g,
    '',
  )
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function optionalAllowed(value: string, values: Set<string>, label: string) {
  if (!value || values.has(value)) return value
  throw new PublicFormError(400, 'INVALID_FIELD', `Please select a valid ${label}.`)
}

async function assessmentResultResponse(
  request: Request,
  submissionId: string,
  fit: FitAssessment,
  snapshot: GrowthSnapshotResult | null,
  session: IntakeSession,
) {
  const responseBody = {
    success: true,
    crmSynced: true,
    bookingReady: fit.path !== 'foundation',
    fit: {
      path: fit.path,
      tier: fit.tier,
      score: fit.score,
      summary: fit.summary,
    },
    snapshot,
  }

  if (fit.path === 'foundation') {
    return Response.json(responseBody, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const bookingCookie = await issueBookingSession(submissionId, request.url, session)
  return Response.json(
    responseBody,
    {
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': bookingCookie,
      },
    },
  )
}

export async function POST(request: Request) {
  try {
    const payload = await readBoundedJson(request, MAX_REQUEST_BYTES)
    const isPartial = payload.submissionType === 'homepage-quick-form'
    const consent = parseContactConsent(payload.consent)
    const partialResponse = () => Response.json({ success: true, crmSynced: true }, { headers: { 'Cache-Control': 'no-store' } })

    if (clean(payload.website, 200)) {
      return Response.json(
        { success: true, ignored: true },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const firstName = clean(payload.firstName, MAX_LENGTHS.firstName)
    const lastName = clean(payload.lastName, MAX_LENGTHS.lastName)
    const email = clean(payload.email, MAX_LENGTHS.email).toLowerCase()
    const submittedPhone = clean(payload.phone, MAX_LENGTHS.phone)
    const phone = normalizePhone(submittedPhone)
    const businessName = clean(payload.businessName, MAX_LENGTHS.businessName)
    const industry = optionalAllowed(
      clean(payload.industry, MAX_LENGTHS.industry),
      ALLOWED_INDUSTRIES,
      'industry',
    )
    const annualRevenue = optionalAllowed(
      clean(payload.annualRevenue, MAX_LENGTHS.annualRevenue),
      ALLOWED_REVENUE,
      'annual revenue range',
    )
    const monthlyBudget = optionalAllowed(
      clean(payload.monthlyBudget, MAX_LENGTHS.monthlyBudget),
      ALLOWED_BUDGET,
      'monthly budget range',
    )
    const capacity = optionalAllowed(
      clean(payload.capacity, MAX_LENGTHS.capacity),
      ALLOWED_CAPACITY,
      'new-patient capacity',
    )
    const decisionRole = optionalAllowed(
      clean(payload.decisionRole, MAX_LENGTHS.decisionRole),
      ALLOWED_DECISION_ROLES,
      'decision-making role',
    )
    const implementationTiming = optionalAllowed(
      clean(payload.implementationTiming, MAX_LENGTHS.implementationTiming),
      ALLOWED_TIMING,
      'implementation timing',
    )
    const followUpOwner = optionalAllowed(
      clean(payload.followUpOwner, MAX_LENGTHS.followUpOwner),
      ALLOWED_FOLLOW_UP_OWNERS,
      'follow-up owner',
    )
    const biggestChallenge = optionalAllowed(
      clean(payload.biggestChallenge, MAX_LENGTHS.biggestChallenge),
      ALLOWED_CHALLENGES,
      'business challenge',
    )
    const currentMarketing = clean(
      payload.currentMarketing,
      MAX_LENGTHS.currentMarketing,
    )
    const rawAttribution =
      typeof payload.attribution === 'object' && payload.attribution
        ? (payload.attribution as Record<string, unknown>)
        : {}
    const rawCtaOrigin = cleanAttributionValue(rawAttribution.ctaOrigin)
    const rawSessionId = cleanAttributionValue(rawAttribution.sessionId)
    const attribution = {
      conversionPage: minimizeAttributionUrl(
        clean(rawAttribution.conversionPage, MAX_LENGTHS.landingPage),
      ),
      landingPage: minimizeAttributionUrl(
        clean(rawAttribution.landingPage, MAX_LENGTHS.landingPage),
      ),
      referrer: minimizeAttributionUrl(
        clean(rawAttribution.referrer, MAX_LENGTHS.referrer),
      ),
      ctaOrigin: normalizeAssessmentCtaOrigin(rawCtaOrigin),
      sessionId: SESSION_ID_PATTERN.test(rawSessionId) ? rawSessionId : '',
      utmSource: cleanAttributionValue(rawAttribution.utmSource),
      utmMedium: cleanAttributionValue(rawAttribution.utmMedium),
      utmCampaign: cleanAttributionValue(rawAttribution.utmCampaign),
      utmContent: cleanAttributionValue(rawAttribution.utmContent),
      utmTerm: cleanAttributionValue(rawAttribution.utmTerm),
      gclid: cleanAttributionValue(rawAttribution.gclid),
      fbclid: cleanAttributionValue(rawAttribution.fbclid),
      msclkid: cleanAttributionValue(rawAttribution.msclkid),
    }

    const snapshotInput = isPartial
      ? null
      : parseGrowthSnapshotInput(payload.snapshot)
    const snapshotResult = snapshotInput
      ? calculateGrowthSnapshot(snapshotInput)
      : null

    if (
      !firstName ||
      !email ||
      !submittedPhone ||
      (!isPartial && (
        !businessName ||
        !industry ||
        !annualRevenue ||
        !monthlyBudget ||
        !capacity ||
        !decisionRole ||
        !implementationTiming ||
        !followUpOwner ||
        !snapshotInput
      ))
    ) {
      throw new PublicFormError(
        400,
        'REQUIRED_FIELDS',
        'Complete each required practice, readiness, and snapshot field.',
      )
    }

    if (!isValidEmail(email)) {
      throw new PublicFormError(
        400,
        'INVALID_EMAIL',
        'Please enter a valid email address.',
      )
    }

    if (!phone) {
      throw new PublicFormError(
        400,
        'INVALID_PHONE',
        'Please enter a valid phone number, including the area code.',
      )
    }

    const submissionId = normalizeSubmissionId(payload.submissionId)
    await enforcePublicFormRateLimit({
      request,
      scope: 'growth-assessment',
      identity: email,
    })
    const session = await readIntakeSession(request)
    if (!session) throw contactVerificationRequired()
    const submissionType = isPartial ? 'homepage-quick-form' as const : 'full-assessment' as const
    const fit = assessGrowthFit({
      annualRevenue,
      monthlyBudget,
      capacity,
      decisionRole,
      implementationTiming,
      followUpOwner,
      trackedMetricCount: snapshotResult?.trackedCoreMetrics ?? 0,
    })
    const now = new Date()
    let submittedAt = now
    const payloadHash = await hashText(
      canonicalPayloadHashInput([
        firstName,
        lastName,
        email,
        phone,
        businessName,
        industry,
        annualRevenue,
        biggestChallenge,
        currentMarketing,
        monthlyBudget,
        capacity,
        decisionRole,
        implementationTiming,
        followUpOwner,
        snapshotInput,
        snapshotResult,
        attribution,
        submissionType,
        consent,
      ]),
    )
    const db = getDb()
    const [inserted] = await db
      .insert(growthAssessments)
      .values({
        id: submissionId,
        firstName,
        lastName,
        email,
        phone,
        businessName,
        industry,
        annualRevenue: annualRevenue || null,
        biggestChallenge: biggestChallenge || null,
        currentMarketing: currentMarketing || null,
        monthlyBudget: monthlyBudget || null,
        funnelSnapshot: snapshotInput ? JSON.stringify(snapshotInput) : null,
        snapshotResult: snapshotResult ? JSON.stringify(snapshotResult) : null,
        readinessSnapshot: isPartial
          ? null
          : JSON.stringify({ capacity, decisionRole, implementationTiming, followUpOwner }),
        submissionType,
        payloadHash,
        consentSnapshot: JSON.stringify({ consent, version: CONSENT_VERSION, disclosures: CONSENT_DISCLOSURES, capturedAt: now.toISOString(), source: attribution.conversionPage }),
        ghlContactId: null,
        intakeSessionHash: session.tokenHash,
        status: 'crm-pending',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: growthAssessments.id })

    let resumeMetadataContactId = ''
    if (!inserted) {
      const [existing] = await db
        .select()
        .from(growthAssessments)
        .where(eq(growthAssessments.id, submissionId))
        .limit(1)

      if (!existing || existing.payloadHash !== payloadHash) {
        throw new PublicFormError(
          409,
          'SUBMISSION_CONFLICT',
          'This submission changed while it was being processed. Please try again.',
        )
      }

      // Legacy rows and another browser's UUID/payload never confer ownership.
      // Reject without changing the other session's record or processing lease.
      if (existing.intakeSessionHash !== session.tokenHash) throw contactVerificationRequired()
      if (existing.ghlContactId) {
        await requireContactGrant(session, existing.ghlContactId, email, phone)
      }

      submittedAt = existing.createdAt

      if (existing.status === 'crm-synced' && existing.ghlContactId) {
        if (isPartial) return partialResponse()
        return assessmentResultResponse(
          request,
          existing.id,
          fit,
          snapshotResult,
          session,
        )
      }

      if (
        ['crm-pending', 'crm-metadata-pending'].includes(existing.status) &&
        now.getTime() - existing.updatedAt.getTime() < PROCESSING_LEASE_MS
      ) {
        throw new PublicFormError(
          409,
          'SUBMISSION_IN_PROGRESS',
          'Your assessment is already being processed. Please wait a moment and try again.',
        )
      }

      if (
        existing.ghlContactId &&
        ['crm-metadata-pending', 'crm-metadata-failed'].includes(existing.status)
      ) {
        resumeMetadataContactId = existing.ghlContactId
        const [claimed] = await db
          .update(growthAssessments)
          .set({ status: 'crm-metadata-pending', updatedAt: now })
          .where(
            and(
              eq(growthAssessments.id, submissionId),
              eq(growthAssessments.status, existing.status),
              eq(growthAssessments.updatedAt, existing.updatedAt),
            ),
          )
          .returning({ id: growthAssessments.id })

        if (!claimed) {
          throw new PublicFormError(
            409,
            'SUBMISSION_IN_PROGRESS',
            'Your assessment is already being processed. Please wait a moment and try again.',
          )
        }
      } else {
        if (!['crm-sync-failed', 'crm-pending'].includes(existing.status)) {
          throw contactVerificationRequired()
        }
        const [claimed] = await db
          .update(growthAssessments)
          .set({ ghlContactId: null, status: 'crm-pending', updatedAt: now })
          .where(
            and(
              eq(growthAssessments.id, submissionId),
              eq(growthAssessments.status, existing.status),
              eq(growthAssessments.updatedAt, existing.updatedAt),
            ),
          )
          .returning({ id: growthAssessments.id })

        if (!claimed) {
          throw new PublicFormError(
            409,
            'SUBMISSION_IN_PROGRESS',
            'Your assessment is already being processed. Please wait a moment and try again.',
          )
        }
      }
    }

    const ghlInput = {
      submissionId,
      submittedAt: submittedAt.toISOString(),
      submissionType,
      firstName,
      lastName,
      email,
      phone,
      businessName,
      industry,
      annualRevenue,
      biggestChallenge,
      currentMarketing,
      monthlyBudget,
      capacity,
      decisionRole,
      implementationTiming,
      followUpOwner,
      snapshotInput,
      snapshotResult,
      attribution,
      fit,
      consent,
    }

    let contactId = resumeMetadataContactId
    let metadataPending = Boolean(resumeMetadataContactId)
    try {
      if (!contactId) {
        const contact = await resolveGrowthAssessmentContact(ghlInput, session)
        contactId = contact.contactId
        metadataPending = true
        await db
          .update(growthAssessments)
          .set({
            ghlContactId: contactId,
            status: 'crm-metadata-pending',
            updatedAt: new Date(),
          })
          .where(eq(growthAssessments.id, submissionId))
      }

      try {
        await syncGrowthAssessmentMetadata(contactId, ghlInput, session)
      } catch (error) {
        const cachedContactWasRemoved =
          Boolean(resumeMetadataContactId) &&
          contactId === resumeMetadataContactId &&
          isGhlContactNotFoundError(error, contactId)

        if (!cachedContactWasRemoved) throw error

        await db
          .update(growthAssessments)
          .set({
            ghlContactId: null,
            status: 'crm-pending',
            updatedAt: new Date(),
          })
          .where(eq(growthAssessments.id, submissionId))

        contactId = ''
        metadataPending = false

        const contact = await resolveGrowthAssessmentContact(ghlInput, session)
        contactId = contact.contactId
        metadataPending = true
        await db
          .update(growthAssessments)
          .set({
            ghlContactId: contactId,
            status: 'crm-metadata-pending',
            updatedAt: new Date(),
          })
          .where(eq(growthAssessments.id, submissionId))

        // This is intentionally a single recovery attempt. A second failure is
        // recorded normally instead of looping or creating more CRM work.
        await syncGrowthAssessmentMetadata(contactId, ghlInput, session)
      }
    } catch (error) {
      const identityConflict = error instanceof GhlIdentityConflictError ||
        (error instanceof PublicFormError && error.code === 'CONTACT_VERIFICATION_REQUIRED')
      await db
        .update(growthAssessments)
        .set({
          ghlContactId: metadataPending && contactId ? contactId : null,
          status: identityConflict
            ? 'contact-verification-required'
            : metadataPending
              ? 'crm-metadata-failed'
              : 'crm-sync-failed',
          updatedAt: new Date(),
        })
        .where(eq(growthAssessments.id, submissionId))

      if (identityConflict) {
        return publicFormErrorResponse(contactVerificationRequired())
      }

      console.error('GoHighLevel growth assessment sync failed')
      return Response.json(
        {
          success: false,
          code: 'CRM_HANDOFF_FAILED',
          message:
            'Your assessment was saved, but we could not finish the handoff. Please try again.',
        },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    await db
      .update(growthAssessments)
      .set({
        ghlContactId: contactId,
        status: 'crm-synced',
        updatedAt: new Date(),
      })
      .where(eq(growthAssessments.id, submissionId))

    return isPartial
      ? partialResponse()
      : assessmentResultResponse(request, submissionId, fit, snapshotResult, session)
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    console.error('Growth assessment submission failed')
    return Response.json(
      {
        success: false,
        message: 'We could not save your assessment. Please try again.',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
