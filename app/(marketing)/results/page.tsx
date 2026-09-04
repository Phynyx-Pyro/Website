import { Metadata } from 'next'
import { ResultsClient } from './_components/results-client'

export const metadata: Metadata = {
  title: 'Measurement Framework',
  description: 'See how PhynyxPro connects available campaign, response, appointment, and outcome data across the acquisition journey.',
}

export default function ResultsPage() {
  return <ResultsClient />
}
