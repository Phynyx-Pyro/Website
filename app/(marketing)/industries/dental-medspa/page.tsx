import { Metadata } from 'next'
import { DentalMedspaClient } from './_components/dental-medspa-client'

export const metadata: Metadata = {
  title: 'Dental & Medspa Growth System — PhynyxPro',
  description: 'More patients. Faster follow-up. Measurable growth. The PhynyxPro Growth System for dental practices and medspas.',
}

export default function DentalMedspaPage() {
  return <DentalMedspaClient />
}
