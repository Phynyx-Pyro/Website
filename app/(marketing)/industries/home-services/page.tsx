import { buildPageMetadata } from '@/lib/page-metadata'
import { HomeServicesClient } from './_components/home-services-client'

export const metadata = buildPageMetadata({
  title: 'Home Services Growth System',
  description: 'Connect response, estimate requests, scheduling, follow-up, and recorded outcomes for appointment-driven home service businesses.',
  path: '/industries/home-services',
})

export default function HomeServicesPage() {
  return <HomeServicesClient />
}
