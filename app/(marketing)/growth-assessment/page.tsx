import { buildPageMetadata } from '@/lib/page-metadata'
import { GrowthAssessmentClient } from './_components/growth-assessment-client'

export const metadata = buildPageMetadata({
  title: 'Free Funnel Check and Growth Snapshot',
  description:
    'Check inquiry-to-booking and booking-to-visit rates without sharing contact details, then build a fuller growth snapshot when you are ready.',
  path: '/growth-assessment',
})

export default function GrowthAssessmentPage() {
  return <GrowthAssessmentClient />
}
