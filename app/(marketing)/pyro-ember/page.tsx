import { Metadata } from 'next'
import { PyroEmberClient } from './_components/pyro-ember-client'

export const metadata: Metadata = {
  title: 'PYRO & Ember — Patient-Acquisition Operations',
  description:
    'See how PYRO connects response, qualification, booking, reminders, and outcome reporting—with Ember as the AI receptionist inside the platform.',
}

export default function PyroEmberPage() {
  return <PyroEmberClient />
}
