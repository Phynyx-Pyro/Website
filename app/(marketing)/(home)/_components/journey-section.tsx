'use client'

import { AnimatedSection } from '../../_components/animated-section'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'
import {
  ArrowRight,
  BadgeCheck,
  CalendarPlus,
  ClipboardCheck,
  DoorOpen,
  UserPlus,
} from 'lucide-react'

const stages = [
  {
    icon: UserPlus,
    num: '01',
    title: 'Lead',
    description: 'An inquiry enters with its source and campaign context attached.',
  },
  {
    icon: CalendarPlus,
    num: '02',
    title: 'Appointment Request',
    description: 'The prospect takes a real scheduling step—not just another click.',
  },
  {
    icon: BadgeCheck,
    num: '03',
    title: 'Confirmed',
    description: 'The appointment is booked and its confirmation status is visible.',
  },
  {
    icon: DoorOpen,
    num: '04',
    title: 'Day 1 Show',
    description: 'Your team records whether the new patient arrived for the visit.',
  },
  {
    icon: ClipboardCheck,
    num: '05',
    title: 'Start Care',
    description: 'The practice records the next-care decision in its system.',
  },
]

export function JourneySection() {
  return (
    <section id="system-walkthrough" className="relative scroll-mt-24 overflow-hidden py-14 lg:py-[88px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <AnimatedSection>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">The measurable journey</p>
            <h2 className="max-w-[720px] text-[36px] font-bold leading-[.98] tracking-[-.04em] lg:text-[52px]">
              One Path. Five Stages Your Practice Can Actually See
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <p className="max-w-[370px] pb-2 text-[15px] leading-[1.6] text-warm lg:text-[16px]">
              PhynyxPro connects campaign activity to the operational stages that
              matter, while your team verifies the patient outcomes only it can know.
            </p>
          </AnimatedSection>
        </div>

        <div className="relative mt-12 hidden lg:block">
          <div className="dashline absolute left-0 right-0 top-[26px] h-px" />
          <div className="absolute top-[22px] h-[9px] w-[9px] rounded-full bg-flame shadow-[0_0_12px_3px_rgba(255,107,53,.6)] animate-travel" />
          <div className="relative grid grid-cols-5 gap-5">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              const highlighted = index === 3
              return (
                <AnimatedSection key={stage.num} delay={index * 85} className="pr-4">
                  <div>
                    <span className={`flex h-[54px] w-[54px] items-center justify-center rounded-full ${highlighted ? 'bg-phoenix text-white shadow-[0_0_0_8px_rgba(212,85,42,.14)]' : 'border border-phoenix/30 bg-ivory text-phoenix'}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className={`mt-4 text-[10.5px] font-bold uppercase tracking-[.14em] ${highlighted ? 'text-phoenix' : 'text-warm'}`}>Stage {stage.num}</p>
                    <h3 className="mt-1 text-[17px] font-bold leading-tight">{stage.title}</h3>
                    <p className="mt-2 max-w-[205px] text-[13px] leading-[1.45] text-warm">{stage.description}</p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>

        <div className="relative mt-9 space-y-6 pl-14 lg:hidden">
          <div className="dashv absolute bottom-6 left-[26px] top-3 w-px" aria-hidden="true" />
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const highlighted = index === 3
            return (
              <AnimatedSection key={stage.num} delay={index * 60} className="relative">
                <div>
                  <span className={`absolute -left-14 flex h-11 w-11 items-center justify-center rounded-full ${highlighted ? 'bg-phoenix text-white shadow-[0_0_0_7px_rgba(212,85,42,.15)]' : 'border border-phoenix/30 bg-ivory text-phoenix'}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className={`text-[9.5px] font-bold uppercase tracking-[.14em] ${highlighted ? 'text-phoenix' : 'text-warm'}`}>Stage {stage.num}</p>
                  <h3 className="text-[16px] font-bold">{stage.title}</h3>
                  <p className="mt-1 text-[13px] leading-[1.45] text-warm">{stage.description}</p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

        <AnimatedSection delay={220}>
          <div className="mt-11 flex flex-col items-start gap-4 border-t border-black/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[570px] text-[13px] leading-[1.55] text-warm">
              3-minute fit check → 30-minute diagnostic. Bring the numbers you have.
              Missing data is part of what we&apos;ll map.
            </p>
            <AssessmentCtaLink
              placement="homepage_journey"
              industry="chiropractic"
              data-cta-placement="homepage_journey"
              className="group inline-flex shrink-0 items-center gap-3 rounded-lg bg-phoenix px-6 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              Book My Patient Acquisition Diagnostic
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </AssessmentCtaLink>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
