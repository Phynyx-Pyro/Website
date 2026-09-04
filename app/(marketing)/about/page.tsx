import { buildPageMetadata } from '@/lib/page-metadata'
import { AboutClient } from './_components/about-client'

export const metadata = buildPageMetadata({
  title: 'About',
  description: 'Meet the operator behind PhynyxPro and the principles guiding its acquisition workflows, reporting, and working model.',
  path: '/about',
})

export default function AboutPage() {
  return <AboutClient />
}
