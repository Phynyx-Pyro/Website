import { getDb } from '@/db'
import { supportRequests } from '@/db/schema'

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>
    const name = clean(payload.name, 160)
    const email = clean(payload.email, 254).toLowerCase()
    const subject = clean(payload.subject, 200)
    const message = clean(payload.message, 5_000)

    if (!name || !email || !message) {
      return Response.json(
        { success: false, message: 'Name, email, and message are required.' },
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

    await getDb().insert(supportRequests).values({
      id,
      name,
      email,
      subject: subject || null,
      message,
      createdAt: now,
      updatedAt: now,
    })

    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Support request submission failed', error)
    return Response.json(
      { success: false, message: 'We could not send your message. Please try again.' },
      { status: 500 },
    )
  }
}
