import { Metadata } from 'next'
import { IndustriesHubClient } from './_components/industries-hub-client'

export const metadata: Metadata = {
  title: 'Industries — PhynyxPro Growth System',
  description: 'Proven in chiropractic. Built for every appointment-driven business. Explore how PhynyxPro drives growth for your industry.',
}

export default function IndustriesPage() {
  return <IndustriesHubClient />
}
