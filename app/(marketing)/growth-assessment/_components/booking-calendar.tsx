'use client'

import Script from 'next/script'

export const BOOKING_URL =
  'https://link.phynyxpro.com/widget/booking/NX2pJFAx51yOcaNIdNjL'

export function BookingCalendar() {
  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl">
        <iframe
          id="NX2pJFAx51yOcaNIdNjL_1788462690940"
          src={BOOKING_URL}
          allow="payment"
          title="Book your PhynyxPro discovery call"
          className="min-h-[780px] w-full"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
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
          href={BOOKING_URL}
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
