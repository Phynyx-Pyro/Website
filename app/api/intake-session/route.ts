import { createIntakeSession, readIntakeSession } from '@/lib/intake-session'
import { enforcePublicFormRateLimit, PublicFormError, publicFormErrorResponse, readBoundedJson } from '@/lib/public-form-security'

export async function POST(request: Request) {
  try {
    await readBoundedJson(request, 256)
    await enforcePublicFormRateLimit({ request, scope: 'intake-session', identity: '' })
    const existing = await readIntakeSession(request)
    const headers = new Headers({ 'Cache-Control': 'no-store' })
    if (!existing) headers.set('Set-Cookie', await createIntakeSession(request))
    return Response.json({ success: true }, { headers })
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    // Do not log database query bindings, cookies, or capability hashes.
    return Response.json({ success: false, message: 'We could not start a secure form session. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
