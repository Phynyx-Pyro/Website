import { Metadata } from 'next'
import { GrowthSystemClient } from './_components/growth-system-client'

export const metadata: Metadata = {
  title: 'The PhynyxPro Growth System — Attract, Convert, Operate & Scale',
  description: 'One connected system. Three outcomes. Managed advertising, automated follow-up, AI employees, and attribution that proves ROI.',
}

export default function GrowthSystemPage() {
  return <GrowthSystemClient />
}
