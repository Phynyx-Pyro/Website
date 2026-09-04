import { Metadata } from 'next'
import { AboutClient } from './_components/about-client'

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet the operator behind PhynyxPro and the principles guiding its patient-acquisition workflows, reporting, and working model.',
}

export default function AboutPage() {
  return <AboutClient />
}
