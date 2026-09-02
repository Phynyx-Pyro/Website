import { Metadata } from 'next'
import { PyroEmberClient } from './_components/pyro-ember-client'

export const metadata: Metadata = {
  title: 'PYRO & Ember — AI-Powered Revenue Operations by PhynyxPro',
  description: 'Meet Ember, your AI employee. PYRO by PhynyxPro powers CRM, automation, AI voice and chat, database reactivation, and full-funnel attribution.',
}

export default function PyroEmberPage() {
  return <PyroEmberClient />
}
