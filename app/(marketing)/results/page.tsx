import { Metadata } from 'next'
import { ResultsClient } from './_components/results-client'

export const metadata: Metadata = {
  title: 'Results — Documented Outcomes, Not Promises',
  description: 'How PhynyxPro measures success: full-funnel attribution from advertising investment to revenue, with documented methodology.',
}

export default function ResultsPage() {
  return <ResultsClient />
}
