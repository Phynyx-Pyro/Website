import { buildPageMetadata } from '@/lib/page-metadata'
import { ResultsClient } from './_components/results-client'

export const metadata = buildPageMetadata({
  title: 'Measurement Framework',
  description: 'See how PhynyxPro connects available campaign, response, appointment, and outcome data across the acquisition journey.',
  path: '/results',
})

export default function ResultsPage() {
  return <ResultsClient />
}
