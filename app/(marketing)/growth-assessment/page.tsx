import { Metadata } from 'next'
import { GrowthAssessmentClient } from './_components/growth-assessment-client'

export const metadata: Metadata = {
  title: 'Book a Growth Assessment — PhynyxPro',
  description: 'A 15-minute qualified conversation — not a sales pitch. We review your current marketing, lead flow, and operations, then tell you honestly whether we can help.',
}

export default function GrowthAssessmentPage() {
  return <GrowthAssessmentClient />
}
