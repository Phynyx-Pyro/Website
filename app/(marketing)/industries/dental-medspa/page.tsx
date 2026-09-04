import { buildPageMetadata } from '@/lib/page-metadata'
import { DentalMedspaClient } from './_components/dental-medspa-client'

export const metadata = buildPageMetadata({
  title: 'Dental & Medspa Growth System',
  description: 'Connect inquiry response, staff handoff, scheduling, reminders, and recorded outcomes for dental and medspa workflows.',
  path: '/industries/dental-medspa',
})

export default function DentalMedspaPage() {
  return <DentalMedspaClient />
}
