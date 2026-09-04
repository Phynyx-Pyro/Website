import { Metadata } from 'next'
import { DentalMedspaClient } from './_components/dental-medspa-client'

export const metadata: Metadata = {
  title: 'Dental & Medspa Growth System',
  description: 'Connect inquiry response, staff handoff, scheduling, reminders, and recorded outcomes for dental and medspa workflows.',
}

export default function DentalMedspaPage() {
  return <DentalMedspaClient />
}
