import { requestWebsiteVerification } from '@/lib/website-verification'
import { normalizeSubmissionId, PublicFormError, publicFormErrorResponse, readBoundedJson } from '@/lib/public-form-security'

export async function POST(request: Request) {
  try {
    const body = await readBoundedJson(request, 512)
    return Response.json(await requestWebsiteVerification(request, normalizeSubmissionId(body.submissionId)), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    return Response.json({ accepted: false, message: 'Verification is temporarily unavailable. Your saved report remains available.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
