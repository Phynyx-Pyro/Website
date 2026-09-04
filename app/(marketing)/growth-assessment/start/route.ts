import { buildAssessmentRedirectUrl } from '@/lib/assessment-attribution'

export function GET(request: Request) {
  const destination = buildAssessmentRedirectUrl(
    request.url,
    request.headers.get('referer') ?? '',
  )

  return Response.redirect(destination, 307)
}
