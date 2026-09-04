import { getDb } from '@/db'
import { growthAssessments } from '@/db/schema'
import { issueBookingSession } from '@/lib/booking-session'
import {
  GhlIdentityConflictError,
  resolveGrowthAssessmentContact,
  syncNewGrowthAssessmentMetadata,
} from '@/lib/ghl'
import { assessGrowthFit, type FitAssessment } from '@/lib/growth-assessment'
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
    const attribution = {
      landingPage: clean(rawAttribution.landingPage, MAX_LENGTHS.landingPage),
      referrer: clean(rawAttribution.referrer, MAX_LENGTHS.referrer),
      utmSource: clean(rawAttribution.utmSource, MAX_LENGTHS.attributionValue),
      utmMedium: clean(rawAttribution.utmMedium, MAX_LENGTHS.attributionValue),
      utmCampaign: clean(rawAttribution.utmCampaign, MAX_LENGTHS.attributionValue),
      utmContent: clean(rawAttribution.utmContent, MAX_LENGTHS.attributionValue),
      utmTerm: clean(rawAttribution.utmTerm, MAX_LENGTHS.attributionValue),
      gclid: clean(rawAttribution.gclid, MAX_LENGTHS.attributionValue),
      fbclid: clean(rawAttribution.fbclid, MAX_LENGTHS.attributionValue),
    }

    if (!firstName || !email || !submittedPhone || !businessName || !industry) {
      throw new PublicFormError(
        400,
        'REQUIRED_FIELDS',
        'Name, email, phone, business name, and industry are required.',
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
        attribution,
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
        submissionType,
        payloadHash,
        ghlContactId: null,
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

      if (existing.status === 'crm-synced' && existing.ghlContactId) {
        return bookingReadyResponse(
          request,
          existing.id,
          assessGrowthFit(existing.annualRevenue ?? '', existing.monthlyBudget ?? ''),
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

    let contactId = resumeMetadataContactId
    let metadataPending = Boolean(resumeMetadataContactId)
    try {
      if (!contactId) {
        const contact = await resolveGrowthAssessmentContact(ghlInput)
        contactId = contact.contactId

        if (!contact.isNew) {
          await db
            .update(growthAssessments)
            .set({
              ghlContactId: contactId,
              status: 'crm-synced',
              updatedAt: new Date(),
            })
            .where(eq(growthAssessments.id, submissionId))

          return bookingReadyResponse(request, submissionId, fit)
        }

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

      await syncNewGrowthAssessmentMetadata(contactId, ghlInput)
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
