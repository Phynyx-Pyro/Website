import { buildPageMetadata } from '@/lib/page-metadata'
import { GrowthSystemClient } from './_components/growth-system-client'

export const metadata = buildPageMetadata({
  title: 'Growth System — Attract, Convert, Operate & Improve',
  description: 'One connected system for managed advertising, follow-up, and campaign, response, booking, and recorded-outcome visibility.',
  path: '/growth-system',
})

export default function GrowthSystemPage() {
  return <GrowthSystemClient />
}
