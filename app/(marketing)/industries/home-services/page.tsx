import { Metadata } from 'next'
import { HomeServicesClient } from './_components/home-services-client'

export const metadata: Metadata = {
  title: 'Home Services Growth System — PhynyxPro',
  description: 'Roofing, plumbing, HVAC — fill your calendar, not just your inbox. The PhynyxPro Growth System is built for service businesses that run on booked jobs.',
}

export default function HomeServicesPage() {
  return <HomeServicesClient />
}
