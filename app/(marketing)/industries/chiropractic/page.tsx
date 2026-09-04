import { Metadata } from 'next'
import { ChiropracticClient } from './_components/chiropractic-client'

export const metadata: Metadata = {
  title: 'Patient Acquisition for Chiropractic Practices',
  description:
    'PhynyxPro connects paid acquisition with response, qualification, booking, reminders, and outcome tracking for established chiropractic practices.',
}

export default function ChiropracticPage() {
  return <ChiropracticClient />
}
