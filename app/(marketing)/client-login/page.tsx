import { buildPageMetadata } from '@/lib/page-metadata'
import { ClientLoginClient } from './_components/client-login-client'

export const metadata = buildPageMetadata({
  title: 'Client Login',
  description: 'Access your PhynyxPro client dashboard, CRM, and reporting.',
  path: '/client-login',
  index: false,
})

export default function ClientLoginPage() {
  return <ClientLoginClient />
}
