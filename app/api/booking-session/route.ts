import {
  BOOKING_COOKIE_NAME,
  claimBookingSession,
  readCookie,
  serializeBookingCookie,
} from '@/lib/booking-session'
import {
  GhlStaleBookingHandoffError,
  setGrowthAssessmentInvestmentAcknowledged,
  verifyGrowthAssessmentBookingHandoff,
} from '@/lib/ghl'
import {
  PublicFormError,
  assertSameOrigin,
  enforcePublicFormRateLimit,
  publicFormErrorResponse,
  readBoundedJson,
} from '@/lib/public-form-security'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    await enforcePublicFormRateLimit({
      request,
      scope: 'booking-session',
      identity: '',
    })
    const payload = await readBoundedJson(request, 1_024)
    const investmentContextAcknowledged =
      payload.investmentContextAcknowledged === true
    const token = readCookie(request.headers.get('cookie'), BOOKING_COOKIE_NAME)
    const bookingContact = await claimBookingSession(token, async (contact) => {
      try {
        await verifyGrowthAssessmentBookingHandoff(contact.contactId, contact)
        if (contact.fitPath === 'calendar') return
        if (contact.fitPath !== 'investment-context') {
          throw new PublicFormError(
            409,
            'BOOKING_PATH_UNAVAILABLE',
            'We could not verify the assessment path. Please submit the assessment again.',
          )
        }
        if (!investmentContextAcknowledged) {
          throw new PublicFormError(
            400,
            'INVESTMENT_ACKNOWLEDGEMENT_REQUIRED',
            'Please acknowledge the investment context before opening the calendar.',
          )
        }
        await setGrowthAssessmentInvestmentAcknowledged(
          contact.contactId,
          contact.submissionId,
        )
      } catch (error) {
        if (error instanceof GhlStaleBookingHandoffError) {
          throw new PublicFormError(
            409,
            'BOOKING_SESSION_STALE',
            'A newer assessment replaced this calendar handoff. Please use the latest assessment result.',
          )
        }
        throw error
      }
    })

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
      {
        success: true,
        bookingContact: {
          contactId: bookingContact.contactId,
          firstName: bookingContact.firstName,
          lastName: bookingContact.lastName,
          email: bookingContact.email,
          phone: bookingContact.phone,
        },
      },
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
