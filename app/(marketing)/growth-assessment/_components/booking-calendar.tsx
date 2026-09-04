'use client'

import { useCallback, useEffect, useRef } from 'react'
import Script from 'next/script'
import {
  buildGhlBookingUrl,
  buildGhlPrefillMessage,
  type BookingContact,
} from '@/lib/ghl-booking'
import { minimizeAttributionUrl } from '@/lib/assessment-attribution'
import { trackFunnelEvent } from '@/lib/funnel-events'

const GHL_BOOKING_ORIGIN = 'https://link.phynyxpro.com'
const GHL_IFRAME_ID = 'NX2pJFAx51yOcaNIdNjL_1788462690940'

export function BookingCalendar({
  contact,
  qualificationPath,
}: {
  contact: BookingContact
  qualificationPath: 'calendar' | 'investment-context'
}) {
  const bookingUrl = buildGhlBookingUrl()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const calendarViewTrackedRef = useRef(false)

  const sendSecurePrefill = useCallback(() => {
    const target = iframeRef.current?.contentWindow
    if (!target) return

    target.postMessage(
      buildGhlPrefillMessage(
        contact,
        minimizeAttributionUrl(window.location.href),
        minimizeAttributionUrl(document.referrer),
        GHL_IFRAME_ID,
      ),
      GHL_BOOKING_ORIGIN,
    )
  }, [contact])

  const handleCalendarLoad = useCallback(() => {
    sendSecurePrefill()
    if (calendarViewTrackedRef.current) return

    calendarViewTrackedRef.current = true
    trackFunnelEvent('calendar_view', { path: qualificationPath })
  }, [qualificationPath, sendSecurePrefill])

  useEffect(() => {
    const handleWidgetMessage = (event: MessageEvent) => {
      if (
        event.origin !== GHL_BOOKING_ORIGIN ||
        event.source !== iframeRef.current?.contentWindow ||
        !Array.isArray(event.data)
      ) {
        return
      }

      if (event.data[0] === 'fetch-query-params' || event.data[0] === 'iframeLoaded') {
        window.setTimeout(sendSecurePrefill, 0)
      }
    }

    window.addEventListener('message', handleWidgetMessage)
    return () => window.removeEventListener('message', handleWidgetMessage)
  }, [sendSecurePrefill])

  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl">
        <iframe
          ref={iframeRef}
          id={GHL_IFRAME_ID}
          src={bookingUrl}
          allow="payment"
          referrerPolicy="no-referrer"
          title="Book your PhynyxPro Patient Acquisition Diagnostic"
          className="min-h-[780px] w-full"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          onLoad={handleCalendarLoad}
        />
      </div>
      <Script
        id="ghl-calendar-embed"
        src="https://link.phynyxpro.com/js/form_embed.js"
        strategy="afterInteractive"
      />
      <p className="mt-4 text-center text-[13px] text-warm">
        Calendar not loading?{' '}
        <a
          href={bookingUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-phoenix hover:underline"
        >
          Open it in a new tab
        </a>
        .
      </p>
    </div>
  )
}
