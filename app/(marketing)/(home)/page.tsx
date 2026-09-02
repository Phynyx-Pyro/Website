import { HeroSection } from './_components/hero-section'
import { TrustStrip } from './_components/trust-strip'
import { ProblemReframe } from './_components/problem-reframe'
import { JourneySection } from './_components/journey-section'
import { GrowthSystem } from './_components/growth-system'
import { CaseStudy } from './_components/case-study'
import { PyroSection } from './_components/pyro-section'
import { IndustryPathways } from './_components/industry-pathways'
import { FounderStory } from './_components/founder-story'
import { ClientProof } from './_components/client-proof'
import { FitAndFaq } from './_components/fit-and-faq'
import { CtaSection } from './_components/cta-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ProblemReframe />
      <JourneySection />
      <GrowthSystem />
      <CaseStudy />
      <PyroSection />
      <IndustryPathways />
      <FounderStory />
      <ClientProof />
      <FitAndFaq />
      <CtaSection />
    </>
  )
}
