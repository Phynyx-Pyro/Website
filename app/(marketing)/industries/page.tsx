import { buildPageMetadata } from '@/lib/page-metadata'
import { IndustriesHubClient } from './_components/industries-hub-client'

export const metadata = buildPageMetadata({
  title: 'Industries',
  description: 'Explore how PhynyxPro’s response, booking, and recorded-outcome workflows can be configured for appointment-driven businesses.',
  path: '/industries',
})

export default function IndustriesPage() {
  return <IndustriesHubClient />
}
