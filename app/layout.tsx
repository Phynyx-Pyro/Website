import { Space_Grotesk, Caveat } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Script from 'next/script'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  weight: ['500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PhynyxPro — More Appointments, Not Just More Leads',
    template: '%s | PhynyxPro',
  },
  description:
    'PhynyxPro builds the demand, the conversion infrastructure, and the revenue operations that turn interest into a full calendar — and proves what it produced.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'PhynyxPro — More Appointments, Not Just More Leads',
    description:
      'A proof-led growth system for appointment-driven practices. Attract the right demand. Convert interest before it goes cold. Operate with evidence.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
    siteName: 'PhynyxPro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhynyxPro — More Appointments, Not Just More Leads',
    description:
      'A proof-led growth system for appointment-driven practices.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${caveat.variable} font-sans antialiased bg-ivory grain`}
      >
        {children}
        <Toaster />
        <Script
          id="ghl-external-tracking"
          src="https://link.phynyxpro.com/js/external-tracking.js"
          data-tracking-id="tk_82ef560d06d74a06987702f8cfae1770"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
