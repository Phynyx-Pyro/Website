import { getDb } from '@/db'
import { growthAssessments } from '@/db/schema'
import { syncGrowthAssessmentToGhl } from '@/lib/ghl'
import { assessGrowthFit } from '@/lib/growth-assessment'
import { and, desc, eq, gte, inArray } from 'drizzle-orm'

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

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function allowed(value: string, values: Set<string>) {
  return values.has(value) ? value : ''
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>
    const firstName = clean(payload.firstName, MAX_LENGTHS.firstName)
    const lastName = clean(payload.lastName, MAX_LENGTHS.lastName)
    const email = clean(payload.email, MAX_LENGTHS.email).toLowerCase()
    const phone = clean(payload.phone, MAX_LENGTHS.phone)
    const businessName = clean(payload.businessName, MAX_LENGTHS.businessName)
    const industry = clean(payload.industry, MAX_LENGTHS.industry)
    const annualRevenue = allowed(
      clean(payload.annualRevenue, MAX_LENGTHS.annualRevenue),
      ALLOWED_REVENUE,
    )
    const monthlyBudget = allowed(
      clean(payload.monthlyBudget, MAX_LENGTHS.monthlyBudget),
      ALLOWED_BUDGET,
    )
    const biggestChallenge = clean(
      payload.biggestChallenge,
      MAX_LENGTHS.biggestChallenge,
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

    if (!firstName || !email) {
      return Response.json(
        { success: false, message: 'Name and email are required.' },
        { status: 400 },
      )
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    const now = new Date()
    const db = getDb()
    const submissionType =
      phone && businessName && industry ? 'full-assessment' : 'homepage-quick-form'
    const fit = assessGrowthFit(annualRevenue, monthlyBudget)
    const retryCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1_000)
    const [pendingSubmission] = await db
      .select({ id: growthAssessments.id })
      .from(growthAssessments)
      .where(
        and(
          eq(growthAssessments.email, email),
          inArray(growthAssessments.status, ['new', 'crm-sync-failed']),
          gte(growthAssessments.createdAt, retryCutoff),
        ),
      )
      .orderBy(desc(growthAssessments.createdAt))
      .limit(1)
    const id = pendingSubmission?.id ?? crypto.randomUUID()

    const storedValues = {
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
      status: 'crm-pending',
      updatedAt: now,
    } as const

    if (pendingSubmission) {
      await db
        .update(growthAssessments)
        .set(storedValues)
        .where(eq(growthAssessments.id, id))
    } else {
      await db.insert(growthAssessments).values({
        id,
        ...storedValues,
        createdAt: now,
      })
    }

    try {
      await syncGrowthAssessmentToGhl({
        submissionId: id,
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
      })

      await db
        .update(growthAssessments)
        .set({ status: 'crm-synced', updatedAt: new Date() })
        .where(eq(growthAssessments.id, id))
    } catch (error) {
      await db
        .update(growthAssessments)
        .set({ status: 'crm-sync-failed', updatedAt: new Date() })
        .where(eq(growthAssessments.id, id))
      console.error('GoHighLevel growth assessment sync failed', error)
      return Response.json(
        {
          success: false,
          message:
            'Your assessment was saved, but we could not finish the handoff. Please try again.',
        },
        { status: 502 },
      )
    }

    return Response.json({
      success: true,
      id,
      crmSynced: true,
      fit: { path: fit.path },
    })
  } catch (error) {
    console.error('Growth assessment submission failed', error)
    return Response.json(
      { success: false, message: 'We could not save your assessment. Please try again.' },
      { status: 500 },
    )
  }
}
