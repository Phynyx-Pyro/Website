import { Metadata } from 'next'
import { AboutClient } from './_components/about-client'

export const metadata: Metadata = {
  title: 'About PhynyxPro — Built by a Chiropractor Who Lived the Problems',
  description: 'Andrew Higdon built PhynyxPro after experiencing the same frustration every practice owner knows. Learn about our story, team, and philosophy.',
}

export default function AboutPage() {
  return <AboutClient />
}
