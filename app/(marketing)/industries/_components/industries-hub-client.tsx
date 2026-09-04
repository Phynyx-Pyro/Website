'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, Stethoscope, Wrench, Smile, Building2 } from 'lucide-react'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'

const industries = [
  {
    slug: '/industries/chiropractic',
    title: 'Chiropractic',
    tagline: 'Built around the chiropractic patient journey.',
    desc: 'A practicing chiropractor’s operator perspective informs the handoffs from first inquiry through Day 1 Show and Start Care.',
    image: '/images/industry-chiro.jpg',
    icon: Stethoscope,
    proof: 'Chiropractic-first',
    assessment: false,
    action: 'Learn more',
  },
  {
    slug: '/industries/home-services',
    title: 'Home Services',
    tagline: 'Connect the inbox to scheduled work.',
    desc: 'For roofing, plumbing, and HVAC workflows that need a clearer path from inquiry to estimate request, scheduled work, and recorded outcome.',
    image: '/images/industry-home.jpg',
    icon: Wrench,
    proof: 'Adaptable for',
    assessment: false,
    action: 'Learn more',
  },
  {
    slug: '/industries/dental-medspa',
    title: 'Dental & Medspa',
    tagline: 'Connect inquiry, follow-up, and appointment status.',
    desc: 'For dental and medspa workflows that benefit from prompt response, approved follow-up, scheduling, and recorded-outcome visibility.',
    image: '/images/industry-dental.jpg',
    icon: Smile,
    proof: 'Adaptable for',
    assessment: false,
    action: 'Learn more',
  },
  {
    slug: '/growth-assessment',
    title: 'Other Service Businesses',
    tagline: 'See whether the workflow fits your business.',
    desc: 'Appointment-driven businesses can use the fit check to compare stated revenue and planned marketing budget with the initial thresholds.',
    image: '/images/industry-other.jpg',
    icon: Building2,
    proof: 'Fit check',
    assessment: true,
    action: 'Book My Acquisition Diagnostic',
  },
]

export function IndustriesHubClient() {
  return (
    <div>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">Industries</p>
            <h1 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight text-ink max-w-[800px]">
              Chiropractic-first.<br />
              <span className="text-phoenix">Adaptable to appointment-driven workflows.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[19px] leading-[1.65] text-warm">
              Explore how the same response, booking, and recorded-outcome framework can be configured for different appointment-driven businesses.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-8">
            {industries.map((ind, i) => {
              const card = (
                <div className="relative h-full rounded-xl overflow-hidden bg-ivory shadow-lg hover:shadow-xl transition-all">
                  <div className="aspect-[16/9] relative">
                    <Image src={ind?.image ?? ''} alt={ind?.title ?? 'Industry'} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                        <ind.icon className="h-3.5 w-3.5" />
                        {ind?.proof}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[22px] font-semibold text-ink group-hover:text-phoenix transition-colors">{ind?.title}</h3>
                    <p className="mt-1 text-[15px] font-medium text-phoenix">{ind?.tagline}</p>
                    <p className="mt-3 text-[14.5px] leading-[1.6] text-warm">{ind?.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-phoenix group-hover:gap-2 transition-all">
                      {ind?.action} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              )

              return (
                <AnimatedSection key={ind?.title ?? i} delay={i * 120}>
                  {ind.assessment ? (
                    <AssessmentCtaLink
                      placement="industries_other_card"
                      industry="other-service"
                      data-cta-placement="industries_other_card"
                      className="group block h-full"
                    >
                      {card}
                    </AssessmentCtaLink>
                  ) : (
                    <Link href={ind?.slug ?? '#'} className="group block h-full">
                      {card}
                    </Link>
                  )}
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Not sure if PhynyxPro is right for your industry?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check. If there may be a match, continue to a working diagnostic with your current acquisition numbers and handoff questions.
            </p>
            <AssessmentCtaLink
              placement="industries_final"
              data-cta-placement="industries_final"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors"
            >
              Book My Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
            </AssessmentCtaLink>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
