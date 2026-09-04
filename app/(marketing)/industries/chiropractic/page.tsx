import { buildPageMetadata } from '@/lib/page-metadata'
import { ChiropracticClient } from './_components/chiropractic-client'

export const metadata = buildPageMetadata({
  title: 'Chiropractic Marketing & Lead Follow-Up',
  description:
    'PhynyxPro connects paid acquisition with response, qualification, booking, reminders, and outcome tracking for established chiropractic practices.',
  path: '/industries/chiropractic',
})

export default function ChiropracticPage() {
  return <ChiropracticClient />
}
