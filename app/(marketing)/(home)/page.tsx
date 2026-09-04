import Link from 'next/link'
import { buildPageMetadata } from '@/lib/page-metadata'
import { HeroSection } from './_components/hero-section'
import { TrustStrip } from './_components/trust-strip'
import { ProblemReframe } from './_components/problem-reframe'
import { JourneySection } from './_components/journey-section'
import { GrowthSystem } from './_components/growth-system'
import { ImplementationTimeline } from './_components/implementation-timeline'
import { PyroSection } from './_components/pyro-section'
import { FounderStory } from './_components/founder-story'
import { FitAndFaq } from './_components/fit-and-faq'
import { CtaSection } from './_components/cta-section'
import { MobileDiagnosticCta } from './_components/mobile-diagnostic-cta'

export const metadata = buildPageMetadata({
  title: 'Chiropractic Growth System & Patient Acquisition',
  description:
    'PhynyxPro runs the ads and the system after the click—response, qualification, booking, reminders, and attribution from campaign to Day 1 Show.',
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ProblemReframe />
      <JourneySection />
      <GrowthSystem />
      <ImplementationTimeline />
      <PyroSection />
      <FounderStory />
      <FitAndFaq />
      <CtaSection />
      <div className="border-t border-white/10 bg-night px-6 py-5 text-center text-[12.5px] leading-[1.6] text-white/45">
        Not a chiropractic practice? Explore{' '}
        <Link href="/industries/home-services" className="text-white/65 transition-colors hover:text-flame">
          Home Services
        </Link>{' '}
        or{' '}
        <Link href="/industries/dental-medspa" className="text-white/65 transition-colors hover:text-flame">
          Dental &amp; Medspa
        </Link>
        .
      </div>
      <MobileDiagnosticCta />
    </>
  )
}
