import { Metadata } from 'next'
import { ChiropracticClient } from './_components/chiropractic-client'

export const metadata: Metadata = {
  title: 'Chiropractic Growth System — PhynyxPro',
  description: 'Built by a chiropractor, proven in chiropractic. The PhynyxPro Growth System was designed for practice owners who want more booked appointments, not just more leads.',
}

export default function ChiropracticPage() {
  return <ChiropracticClient />
}
