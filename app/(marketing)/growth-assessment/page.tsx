import { Metadata } from 'next'
import { GrowthAssessmentClient } from './_components/growth-assessment-client'

export const metadata: Metadata = {
  title: 'Book a Patient Acquisition Diagnostic',
  description:
    'Start with a 3-minute fit check, then use a roughly 45-minute working diagnostic to review your patient-acquisition numbers and next steps.',
}

export default function GrowthAssessmentPage() {
  return <GrowthAssessmentClient />
}
