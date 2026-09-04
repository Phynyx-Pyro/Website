import { buildPageMetadata } from '@/lib/page-metadata'
import { PyroEmberClient } from './_components/pyro-ember-client'

export const metadata = buildPageMetadata({
  title: 'PYRO & Ember — Acquisition Operations',
  description:
    'See how PYRO connects response, qualification, booking, reminders, and outcome reporting—with Ember as the AI receptionist inside the platform.',
  path: '/pyro-ember',
})

export default function PyroEmberPage() {
  return <PyroEmberClient />
}
