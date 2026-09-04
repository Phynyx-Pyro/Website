import { Metadata } from 'next'
import { HomeServicesClient } from './_components/home-services-client'

export const metadata: Metadata = {
  title: 'Home Services Growth System',
  description: 'Connect response, estimate requests, scheduling, follow-up, and recorded outcomes for appointment-driven home service businesses.',
}

export default function HomeServicesPage() {
  return <HomeServicesClient />
}
