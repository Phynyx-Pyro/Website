'use client'

import Script from 'next/script'
import {
  buildGhlBookingUrl,
  type BookingContact,
} from '@/lib/ghl-booking'

export function BookingCalendar({ contact }: { contact: BookingContact }) {
  const bookingUrl = buildGhlBookingUrl(contact)

  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl">
        <iframe
          id="NX2pJFAx51yOcaNIdNjL_1788462690940"
          src={bookingUrl}
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
