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
    default: 'PhynyxPro — Acquisition Operating System',
    template: '%s | PhynyxPro',
  },
  description:
    'PhynyxPro connects paid acquisition with response, qualification, booking, reminders, and verified outcome tracking.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'PhynyxPro — Acquisition Operating System',
    description:
      'An acquisition operating system connecting paid demand to booking and verified outcomes.',
    images: [{ url: '/og-image-v2.png', width: 1200, height: 630 }],
    type: 'website',
    siteName: 'PhynyxPro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhynyxPro — Acquisition Operating System',
    description:
      'An acquisition operating system connecting paid demand to booking and verified outcomes.',
    images: ['/og-image-v2.png'],
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
