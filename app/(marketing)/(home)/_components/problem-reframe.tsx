'use client'

import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, CalendarCheck, ClipboardCheck, MousePointerClick } from 'lucide-react'

const handoffs = [
  {
    label: 'Lead captured',
    title: 'The Campaign Did Its Job',
    description: 'Source and offer context enter the pipeline with the inquiry.',
    icon: MousePointerClick,
  },
  {
    label: 'Appointment request',
    title: 'The Handoff Decides What Happens Next',
    description: 'Response, qualification, and booking remove avoidable friction.',
    icon: CalendarCheck,
  },
  {
    label: 'Verified outcome',
    title: 'The Practice Closes the Loop',
    description: 'Confirmed, Day 1 Show, and Start Care are recorded separately.',
    icon: ClipboardCheck,
  },
]

export function ProblemReframe() {
  return (
    <section className="relative overflow-hidden bg-linen py-14 lg:py-[92px]">
      <p className="font-hand pointer-events-none absolute left-[46px] top-[64px] hidden -rotate-[7deg] text-[25px] font-semibold text-ember lg:block">
        this is where ad budget leaks →
      </p>
      <p className="font-hand mb-4 -rotate-[3deg] px-5 text-[20px] font-semibold text-ember lg:hidden">
        this is where ad budget leaks
      </p>

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-9 px-5 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <div className="lg:col-span-5">
          <AnimatedSection>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-ember lg:mb-5">The reframe</p>
            <h2 className="max-w-[520px] text-[38px] font-bold leading-[.96] tracking-[-.04em] lg:text-[58px]">
              Buying More Leads Cannot Fix What Happens <span className="text-phoenix">After the Click</span>
            </h2>
            <p className="mt-5 max-w-[470px] text-[15.5px] leading-[1.62] text-warm lg:mt-6 lg:text-[17px]">
              A campaign can fill the inbox while slow response, unclear qualification,
              scheduling friction, and inconsistent follow-up leave the calendar open.
              Lead count alone cannot tell you where the patient journey broke.
            </p>
          </AnimatedSection>
        </div>

        <div className="relative lg:col-span-7">
          <div className="grid gap-3 md:grid-cols-3 lg:gap-4">
            {handoffs.map((handoff, index) => {
              const Icon = handoff.icon
              return (
                <AnimatedSection key={handoff.label} delay={index * 120} className={index === 1 ? 'md:mt-7' : index === 2 ? 'md:mt-14' : ''}>
                  <article className={`h-full rounded-xl border bg-white p-5 lg:p-6 ${index === 2 ? 'border-phoenix/35 shadow-[0_14px_34px_-20px_rgba(212,85,42,.45)]' : 'border-black/10 lift-sm'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${index === 2 ? 'bg-phoenix text-white' : 'bg-phoenix/[.08] text-phoenix'}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {index < handoffs.length - 1 && <ArrowRight className="hidden h-4 w-4 text-phoenix/55 md:block" aria-hidden="true" />}
                    </div>
                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[.14em] text-warm">{handoff.label}</p>
                    <h3 className="mt-2 text-[18px] font-bold leading-[1.1] tracking-[-.02em]">{handoff.title}</h3>
                    <p className="mt-3 text-[13px] leading-[1.5] text-warm">{handoff.description}</p>
                  </article>
                </AnimatedSection>
              )
            })}
          </div>

          <AnimatedSection delay={420}>
            <p className="mx-auto mt-6 w-fit rounded-full border border-black/10 bg-white px-4 py-2.5 text-center text-[12px] font-semibold text-ink shadow-[0_8px_24px_-14px_rgba(20,19,18,.3)] lg:text-[13px]">
              A lead is a starting event—not a patient outcome.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
