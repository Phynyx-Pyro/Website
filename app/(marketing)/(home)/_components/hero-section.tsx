'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'
import { ArrowRight, ChevronDown, CircleCheck, Flame } from 'lucide-react'

const journey = [
  'Lead',
  'Appointment request',
  'Confirmed',
  'Day 1 show',
  'Start care',
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-10 pt-[84px] xl:pb-16">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-[760px] w-[880px] xl:block">
        <Image
          src="/images/hero-chiro.jpg"
          alt="Chiropractor caring for a patient in a modern clinic"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-8">
          <div className="pt-7 xl:col-span-6 xl:pt-16">
            <AnimatedSection>
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[.18em] text-phoenix">
                Patient acquisition for chiropractic practices
              </p>
            </AnimatedSection>

            <AnimatedSection delay={80}>
              <h1 className="max-w-[720px] text-[42px] font-bold leading-[.98] tracking-[-.045em] sm:text-[54px] xl:text-[69px]">
                Turn more ad leads into{' '}
                <span className="relative inline-block">
                  patients who show up.
                  <span className="absolute -bottom-1 left-0 h-[9px] w-full rounded-full bg-phoenix/25" aria-hidden="true" />
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={160}>
              <p className="mt-6 max-w-[650px] text-[16px] leading-[1.62] text-warm xl:text-[18px]">
                We run your Meta ads and connect rapid response, booking, reminders, and team handoffs. Track each lead from campaign source through confirmed appointments, first visits, and starts of care.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={240}>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                <AssessmentCtaLink
                  placement="homepage_hero"
                  industry="chiropractic"
                  data-cta-placement="homepage_hero"
                  id="homepage-primary-cta"
                  className="group inline-flex items-center gap-3 rounded-lg bg-ink px-6 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-coal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix focus-visible:ring-offset-2 focus-visible:ring-offset-ivory sm:text-[15px]"
                >
                  Book My Patient Acquisition Diagnostic
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </AssessmentCtaLink>
                <Link
                  href="#system-walkthrough"
                  className="group inline-flex items-center gap-2.5 text-[14px] font-semibold text-phoenix sm:text-[15px]"
                >
                  See how the system works
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-4 max-w-[620px] text-[12.5px] leading-[1.55] text-warm xl:text-[13px]">
                3-minute fit check → 30-minute diagnostic. We’ll map where inquiries stall and the next step to address it.
              </p>
              <p className="mt-2 max-w-[620px] text-[12.5px] font-medium leading-[1.55] text-ink/75 xl:text-[13px]">
                Bring the numbers you have. Missing data is part of what we’ll map.
              </p>
              <p className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold text-ink/75">
                <CircleCheck className="h-4 w-4 text-phoenix" aria-hidden="true" />
                Operator-led by Andrew Higdon, DC, a practicing chiropractor.
              </p>
            </AnimatedSection>
          </div>

          <div className="mt-1 min-w-0 xl:relative xl:col-span-6 xl:mt-0 xl:h-[650px]">
            <div className="relative h-[200px] overflow-hidden rounded-t-2xl xl:hidden">
              <Image
                src="/images/hero-chiro.jpg"
                alt="Chiropractor caring for a patient"
                fill
                className="object-cover object-[center_34%]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
            </div>

            <AnimatedSection delay={180} className="relative z-10 xl:absolute xl:bottom-10 xl:right-0 xl:w-full xl:max-w-[570px]">
              <div className="overflow-hidden rounded-b-2xl border border-white/10 bg-ink/95 text-white shadow-[0_24px_70px_-24px_rgba(20,19,18,.75)] backdrop-blur-sm xl:rounded-[15px]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 xl:px-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-phoenix/15 text-flame">
                      <Flame className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">PhynyxPro</p>
                      <p className="text-[13px] font-semibold">Patient acquisition operating system</p>
                    </div>
                  </div>
                  <span className="hidden text-[10px] font-medium text-white/45 sm:block">One connected journey</span>
                </div>

                <ol className="grid grid-cols-1 divide-y divide-white/10 px-4 sm:grid-cols-5 sm:divide-x sm:divide-y-0 sm:px-0">
                  {journey.map((stage, index) => (
                    <li key={stage} className="flex items-center gap-3 py-2.5 sm:min-h-[118px] sm:flex-col sm:items-start sm:gap-2 sm:px-3.5 sm:py-4">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${index === 3 ? 'bg-phoenix text-white' : 'border border-white/15 bg-white/[.04] text-white/65'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={`text-[12px] font-semibold leading-[1.2] ${index === 3 ? 'text-flame' : 'text-white/85'}`}>
                        {stage}
                      </span>
                    </li>
                  ))}
                </ol>

                <p className="border-t border-white/10 px-4 py-3.5 text-[12.5px] leading-[1.5] text-white/65 xl:px-5">
                  Campaign source stays attached while your team verifies show and start-care outcomes.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
