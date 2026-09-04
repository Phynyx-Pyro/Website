import { Metadata } from 'next'
import { GrowthSystemClient } from './_components/growth-system-client'

export const metadata: Metadata = {
  title: 'Growth System — Attract, Convert, Operate & Improve',
  description: 'One connected system for managed advertising, follow-up, and campaign, response, booking, and recorded-outcome visibility.',
}

export default function GrowthSystemPage() {
  return <GrowthSystemClient />
}
