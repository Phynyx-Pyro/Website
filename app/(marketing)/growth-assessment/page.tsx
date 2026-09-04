import { buildPageMetadata } from '@/lib/page-metadata'
import { GrowthAssessmentClient } from './_components/growth-assessment-client'

export const metadata = buildPageMetadata({
  title: 'Book an Acquisition Diagnostic',
  description:
    'Start with a 3-minute fit check, then use a working diagnostic to review your acquisition numbers, handoffs, and next steps.',
  path: '/growth-assessment',
})

export default function GrowthAssessmentPage() {
  return <GrowthAssessmentClient />
}
