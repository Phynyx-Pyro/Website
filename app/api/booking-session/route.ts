import {
  BOOKING_COOKIE_NAME,
  claimBookingSession,
  readCookie,
  serializeBookingCookie,
} from '@/lib/booking-session'
import {
  PublicFormError,
  assertSameOrigin,
  enforcePublicFormRateLimit,
  publicFormErrorResponse,
} from '@/lib/public-form-security'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    await enforcePublicFormRateLimit({
      request,
      scope: 'booking-session',
      identity: '',
    })
    const token = readCookie(request.headers.get('cookie'), BOOKING_COOKIE_NAME)
    const bookingContact = await claimBookingSession(token)

    if (!bookingContact) {
      return Response.json(
        {
          success: false,
          code: 'BOOKING_SESSION_UNAVAILABLE',
          message: 'Your secure calendar handoff expired. Please submit the assessment again.',
        },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
            'Set-Cookie': serializeBookingCookie('', request.url, 0),
          },
        },
      )
    }

    return Response.json(
      { success: true, bookingContact },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Set-Cookie': serializeBookingCookie('', request.url, 0),
        },
      },
    )
  } catch (error) {
    if (error instanceof PublicFormError) return publicFormErrorResponse(error)
    console.error('Booking handoff failed', error)
    return Response.json(
      {
        success: false,
        message: 'We could not securely open the calendar. Please submit again.',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
