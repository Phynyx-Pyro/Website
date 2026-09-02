import { getDb } from '@/db'
import { growthAssessments } from '@/db/schema'

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
} as const

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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
    const id = crypto.randomUUID()

    await getDb().insert(growthAssessments).values({
      id,
      firstName,
      lastName,
      email,
      phone,
      businessName,
      industry,
      annualRevenue: clean(payload.annualRevenue, MAX_LENGTHS.annualRevenue) || null,
      biggestChallenge:
        clean(payload.biggestChallenge, MAX_LENGTHS.biggestChallenge) || null,
      currentMarketing:
        clean(payload.currentMarketing, MAX_LENGTHS.currentMarketing) || null,
      monthlyBudget: clean(payload.monthlyBudget, MAX_LENGTHS.monthlyBudget) || null,
      submissionType:
        phone && businessName && industry ? 'full-assessment' : 'homepage-quick-form',
      createdAt: now,
      updatedAt: now,
    })

    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Growth assessment submission failed', error)
    return Response.json(
      { success: false, message: 'We could not save your assessment. Please try again.' },
      { status: 500 },
    )
  }
}
