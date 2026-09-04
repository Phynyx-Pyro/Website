import { buildPageMetadata } from '@/lib/page-metadata'
import { SupportClient } from './_components/support-client'

export const metadata = buildPageMetadata({
  title: 'Contact & Support',
  description: 'Record an account, PYRO platform, or general inquiry for review.',
  path: '/support',
})

export default function SupportPage() {
  return <SupportClient />
}
