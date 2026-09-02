import { Metadata } from 'next'
import { SupportClient } from './_components/support-client'

export const metadata: Metadata = {
  title: 'Support — PhynyxPro',
  description: 'Get help with your PhynyxPro account, PYRO platform, or general inquiries.',
}

export default function SupportPage() {
  return <SupportClient />
}
