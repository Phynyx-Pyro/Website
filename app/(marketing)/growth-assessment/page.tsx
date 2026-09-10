import { buildPageMetadata } from '@/lib/page-metadata'
import { GrowthAssessmentClient } from './_components/growth-assessment-client'

export const metadata = buildPageMetadata({
  title: 'Get Your Growth Snapshot',
  description:
    'Build a 3-minute growth snapshot, see your visible conversion rates and largest drop-off, then choose the right next step.',
  path: '/growth-assessment',
})

export default function GrowthAssessmentPage() {
  return <GrowthAssessmentClient />
}
