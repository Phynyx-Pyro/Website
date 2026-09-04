import { Metadata } from 'next'
import { IndustriesHubClient } from './_components/industries-hub-client'

export const metadata: Metadata = {
  title: 'Industries',
  description: 'Explore how PhynyxPro’s response, booking, and recorded-outcome workflows can be configured for appointment-driven businesses.',
}

export default function IndustriesPage() {
  return <IndustriesHubClient />
}
