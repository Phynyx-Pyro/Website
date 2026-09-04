import { getDb } from '@/db'
import { growthAssessments } from '@/db/schema'
import { issueBookingSession } from '@/lib/booking-session'
import {
  GhlIdentityConflictError,
  GhlStaleBookingHandoffError,
  isGhlContactNotFoundError,
  resolveGrowthAssessmentContact,
  syncGrowthAssessmentMetadata,
  verifyGrowthAssessmentBookingHandoff,
} from '@/lib/ghl'
import { assessGrowthFit, type FitAssessment } from '@/lib/growth-assessment'
import {
  buildGrowthAssessmentPayloadHashes,
  growthAssessmentPayloadHashMatches,
} from '@/lib/growth-assessment-idempotency'
import {
  minimizeAttributionUrl,
  normalizeAssessmentCtaOrigin,
  normalizeAssessmentEntryPoint,
  normalizeWebsiteSessionId,
} from '@/lib/assessment-attribution'
import {
  PublicFormError,
  enforcePublicFormRateLimit,
  normalizePhone,
  normalizeSubmissionId,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'
import { and, eq, gte, ne } from 'drizzle-orm'

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
  'under-250k',
  '250k-500k',
  '500k-1m',
  '1m-5m',
  '5m-plus',
])

const ALLOWED_BUDGET = new Set([
  'under-1k',
  '1k-3k',
  '3k-5k',
  '5k-10k',
  '10k-plus',
])

const ALLOWED_CHALLENGES = new Set([
  'not-enough-leads',
  'leads-not-converting',
  'no-show-rate',
  'no-attribution',
  'follow-up',
  'scaling',
])

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function cleanAttributionValue(value: unknown) {
  return typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, MAX_LENGTHS.attributionValue)
    : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function optionalAllowed(value: string, values: Set<string>, label: string) {
  if (!value || values.has(value)) return value
  throw new PublicFormError(400, 'INVALID_FIELD', `Please select a valid ${label}.`)
}

async function bookingReadyResponse(
  request: Request,
  submissionId: string,
  fit: FitAssessment,
) {
  const bookingCookie = await issueBookingSession(submissionId, request.url)
  return Response.json(
    {
      success: true,
      crmSynced: true,
      bookingReady: true,
      fit: { path: fit.path },
    },
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
    const entryPoint = normalizeAssessmentEntryPoint(rawAttribution.entryPoint)
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
      entryPoint,
      ctaOrigin:
        normalizeAssessmentCtaOrigin(rawAttribution.ctaOrigin) || entryPoint,
      sessionId: normalizeWebsiteSessionId(rawAttribution.sessionId),
      utmSource: cleanAttributionValue(rawAttribution.utmSource),
      utmMedium: cleanAttributionValue(rawAttribution.utmMedium),
      utmCampaign: cleanAttributionValue(rawAttribution.utmCampaign),
      utmContent: cleanAttributionValue(rawAttribution.utmContent),
      utmTerm: cleanAttributionValue(rawAttribution.utmTerm),
      gclid: cleanAttributionValue(rawAttribution.gclid),
      dclid: cleanAttributionValue(rawAttribution.dclid),
      gbraid: cleanAttributionValue(rawAttribution.gbraid),
      wbraid: cleanAttributionValue(rawAttribution.wbraid),
      fbclid: cleanAttributionValue(rawAttribution.fbclid),
      msclkid: cleanAttributionValue(rawAttribution.msclkid),
      ttclid: cleanAttributionValue(rawAttribution.ttclid),
      twclid: cleanAttributionValue(rawAttribution.twclid),
      liFatId: cleanAttributionValue(rawAttribution.liFatId),
    }

    if (
      !firstName ||
      !email ||
      !submittedPhone ||
      !businessName ||
      !industry
    ) {
      throw new PublicFormError(
        400,
        'REQUIRED_FIELDS',
        'Name, email, phone, business name, industry, annual revenue, and monthly marketing budget are required.',
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
    const submissionType = 'full-assessment' as const
    const fit = assessGrowthFit(annualRevenue, monthlyBudget)
    const now = new Date()
    const ghlInput = {
      submissionId,
      submittedAt: now.toISOString(),
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
      attribution,
      fit,
    }
    const payloadHashes = await buildGrowthAssessmentPayloadHashes(
      [
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
      ],
      attribution,
    )
    const payloadHash = payloadHashes.current
    const db = getDb()
    let inserted: { id: string } | undefined
    let preloadedExisting: typeof growthAssessments.$inferSelect | undefined

    if (!annualRevenue || !monthlyBudget) {
      const existingRows = await db
        .select()
        .from(growthAssessments)
        .where(eq(growthAssessments.id, submissionId))
        .limit(1)
      preloadedExisting = existingRows[0]

      if (!preloadedExisting) {
        throw new PublicFormError(
          400,
          'REQUIRED_FIELDS',
          'Name, email, phone, business name, industry, annual revenue, and monthly marketing budget are required.',
        )
      }
      if (
        !growthAssessmentPayloadHashMatches(
          preloadedExisting.payloadHash,
          payloadHashes,
        )
      ) {
        throw new PublicFormError(
          409,
          'SUBMISSION_CONFLICT',
          'This submission changed while it was being processed. Please try again.',
        )
      }
    } else {
      const insertedRows = await db
        .insert(growthAssessments)
        .values({
          id: submissionId,
          firstName,
          lastName,
          email,
          phone,
          businessName,
          industry,
          annualRevenue,
          biggestChallenge: biggestChallenge || null,
          currentMarketing: currentMarketing || null,
          monthlyBudget,
          submissionType,
          attributionJson: JSON.stringify(attribution),
          entryPoint: attribution.entryPoint || null,
          fitPath: fit.path,
          payloadHash,
          ghlContactId: null,
          status: 'crm-pending',
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing()
        .returning({ id: growthAssessments.id })
      inserted = insertedRows[0]
    }

    let resumeMetadataContactId = ''
    if (!inserted) {
      let retryClaimedForResolution = false
      const existing =
        preloadedExisting ??
        (
          await db
            .select()
            .from(growthAssessments)
            .where(eq(growthAssessments.id, submissionId))
            .limit(1)
        )[0]

      if (
        !existing ||
        !growthAssessmentPayloadHashMatches(existing.payloadHash, payloadHashes)
      ) {
        throw new PublicFormError(
          409,
          'SUBMISSION_CONFLICT',
          'This submission changed while it was being processed. Please try again.',
        )
      }

      const [supersedingAssessment] = await db
        .select({ id: growthAssessments.id })
        .from(growthAssessments)
        .where(
          and(
            ne(growthAssessments.id, existing.id),
            eq(growthAssessments.email, email),
            eq(growthAssessments.phone, phone),
            gte(growthAssessments.createdAt, existing.createdAt),
          ),
        )
        .limit(1)
      if (supersedingAssessment) {
        throw new PublicFormError(
          409,
          'SUBMISSION_SUPERSEDED',
          'A newer assessment replaced this submission. Please use the latest assessment result.',
        )
      }

      ghlInput.submittedAt = existing.createdAt.toISOString()

      if (existing.status === 'crm-synced' && existing.ghlContactId) {
        const existingFit = assessGrowthFit(
          existing.annualRevenue ?? '',
          existing.monthlyBudget ?? '',
        )

        let cachedContactError: unknown = null
        try {
          await verifyGrowthAssessmentBookingHandoff(
            existing.ghlContactId,
            ghlInput,
          )
        } catch (error) {
          cachedContactError = error
        }

        if (!cachedContactError) {
          if (existing.fitPath !== existingFit.path) {
            const [backfilled] = await db
              .update(growthAssessments)
              .set({ fitPath: existingFit.path })
              .where(
                and(
                  eq(growthAssessments.id, existing.id),
                  eq(growthAssessments.status, 'crm-synced'),
                  eq(growthAssessments.updatedAt, existing.updatedAt),
                ),
              )
              .returning({ id: growthAssessments.id })
            if (!backfilled) {
              throw new PublicFormError(
                409,
                'SUBMISSION_IN_PROGRESS',
                'Your assessment is already being processed. Please wait a moment and try again.',
              )
            }
          }
          return bookingReadyResponse(request, existing.id, existingFit)
        }

        if (cachedContactError instanceof GhlIdentityConflictError) {
          const [marked] = await db
            .update(growthAssessments)
            .set({
              status: 'contact-verification-required',
              fitPath: existingFit.path,
              updatedAt: now,
            })
            .where(
              and(
                eq(growthAssessments.id, existing.id),
                eq(growthAssessments.status, 'crm-synced'),
                eq(growthAssessments.updatedAt, existing.updatedAt),
              ),
            )
            .returning({ id: growthAssessments.id })
          if (!marked) {
            throw new PublicFormError(
              409,
              'SUBMISSION_IN_PROGRESS',
              'Your assessment is already being processed. Please wait a moment and try again.',
            )
          }
          return Response.json(
            {
              success: false,
              code: 'CRM_HANDOFF_FAILED',
              message:
                'Your assessment was saved, but we could not finish the secure calendar handoff. Please contact support or try again later.',
            },
            { status: 502, headers: { 'Cache-Control': 'no-store' } },
          )
        }

        if (cachedContactError instanceof GhlStaleBookingHandoffError) {
          throw new PublicFormError(
            409,
            'SUBMISSION_SUPERSEDED',
            'A newer assessment replaced this calendar handoff. Please use the latest assessment result.',
          )
        }

        if (
          !isGhlContactNotFoundError(
            cachedContactError,
            existing.ghlContactId,
          )
        ) {
          console.error(
            'GoHighLevel cached contact verification failed',
            cachedContactError,
          )
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

        const [claimed] = await db
          .update(growthAssessments)
          .set({
            ghlContactId: null,
            status: 'crm-pending',
            fitPath: existingFit.path,
            updatedAt: now,
          })
          .where(
            and(
              eq(growthAssessments.id, existing.id),
              eq(growthAssessments.status, 'crm-synced'),
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
        retryClaimedForResolution = true
      }

      if (!retryClaimedForResolution) {
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
          ['crm-metadata-pending', 'crm-metadata-failed'].includes(
            existing.status,
          )
        ) {
          resumeMetadataContactId = existing.ghlContactId
          const [claimed] = await db
            .update(growthAssessments)
            .set({
              status: 'crm-metadata-pending',
              attributionJson: JSON.stringify(attribution),
              entryPoint: attribution.entryPoint || null,
              fitPath: fit.path,
              payloadHash,
              updatedAt: now,
            })
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
          const [claimed] = await db
            .update(growthAssessments)
            .set({
              ghlContactId: null,
              status: 'crm-pending',
              attributionJson: JSON.stringify(attribution),
              entryPoint: attribution.entryPoint || null,
              fitPath: fit.path,
              payloadHash,
              updatedAt: now,
            })
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
    }

    let contactId = resumeMetadataContactId
    let metadataPending = Boolean(resumeMetadataContactId)
    try {
      if (!contactId) {
        const contact = await resolveGrowthAssessmentContact(ghlInput)
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
        await syncGrowthAssessmentMetadata(contactId, ghlInput)
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

        const contact = await resolveGrowthAssessmentContact(ghlInput)
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

        // Recover once. A second failure is recorded normally rather than
        // looping or creating additional CRM work.
        await syncGrowthAssessmentMetadata(contactId, ghlInput)
      }
    } catch (error) {
      const identityConflict = error instanceof GhlIdentityConflictError
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
        return Response.json(
          {
            success: false,
            code: 'CRM_HANDOFF_FAILED',
            message:
              'Your assessment was saved, but we could not finish the secure calendar handoff. Please contact support or try again later.',
          },
          { status: 502, headers: { 'Cache-Control': 'no-store' } },
        )
      }

      console.error('GoHighLevel growth assessment sync failed', error)
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

    return bookingReadyResponse(request, submissionId, fit)
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    console.error('Growth assessment submission failed', error)
    return Response.json(
      {
        success: false,
        message: 'We could not save your assessment. Please try again.',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
