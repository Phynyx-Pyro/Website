import { confirmWebsiteVerification } from '@/lib/website-verification'
import { PublicFormError, publicFormErrorResponse, readBoundedJson } from '@/lib/public-form-security'

export async function POST(request: Request) {
  try {
    const body = await readBoundedJson(request, 512)
    return await confirmWebsiteVerification(request, typeof body.token === 'string' ? body.token : '')
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    return Response.json({ verified: false, message: 'Verification could not finish. Request a new link from your assessment.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
