import { Metadata } from 'next'
import { ClientLoginClient } from './_components/client-login-client'

export const metadata: Metadata = {
  title: 'Client Login',
  description: 'Access your PhynyxPro client dashboard, CRM, and reporting.',
}

export default function ClientLoginPage() {
  return <ClientLoginClient />
}
