'use client'

import { AnimatedSection } from '../../_components/animated-section'

const stages = [
  {
    period: 'Before day one',
    title: 'Onboarding complete',
    description:
      'We confirm the inputs, access, and approvals required to start the core build.',
    details: [
      'Confirm offer, capacity, locations, and handoff owners',
      'Receive advertising, CRM, calendar, domain, and reporting access',
      'Collect required brand assets, approvals, and business details',
    ],
  },
  {
    period: 'Days 1–3',
    title: 'Campaign build',
    description:
      'We build the campaign strategy, Meta lead flow, creative, and source tracking.',
    details: [
      'Campaign strategy and offer path',
      'Meta lead ads, forms, copy, and creative setup',
      'Tracking and source structure',
    ],
  },
  {
    period: 'Days 4–7',
    title: 'System configuration',
    description:
      'We connect the pipeline, calendar, automations, and included handoff rules.',
    details: [
      'PYRO pipeline and calendar connection',
      'Follow-up, reminders, and status automation',
      'Ember and staff handoff rules where included',
    ],
  },
  {
    period: 'Days 8–10',
    title: 'QA and launch-ready',
    description:
      'We test the end-to-end journey, confirm ownership, and prepare for a controlled launch.',
    details: [
      'End-to-end lead and booking tests',
      'Team ownership and escalation review',
      'Final approvals and controlled launch preparation',
    ],
  },
] as const

export function ImplementationTimeline() {
  return (
    <section
      id="implementation-timeline"
      className="relative overflow-hidden bg-linen py-14 lg:py-[92px]"
      aria-labelledby="implementation-timeline-heading"
    >
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <AnimatedSection className="lg:col-span-7">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">
              THE FIRST 7–10 DAYS
            </p>
            <h2
              id="implementation-timeline-heading"
              className="max-w-[720px] text-[36px] font-bold leading-[.98] tracking-[-.04em] lg:text-[52px]"
            >
              Your core acquisition system, built in 7–10 days.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100} className="lg:col-span-5 lg:pb-1">
            <p className="max-w-[520px] text-[15.5px] leading-[1.65] text-warm lg:text-[17px]">
              The build window begins once onboarding inputs, account access, and required approvals
              are complete. From there, we build the campaign, Meta lead flow, pipeline, follow-up,
              and handoff process.
            </p>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={160} className="mt-8 lg:mt-12">
          <ol className="grid overflow-hidden rounded-2xl border border-black/10 bg-white/80 lg:grid-cols-4">
            {stages.map((stage, index) => (
              <li
                key={stage.period}
                className={`relative p-5 sm:p-6 lg:min-h-[340px] lg:p-7 ${
                  index < stages.length - 1
                    ? 'border-b border-black/10 lg:border-b-0 lg:border-r'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-phoenix text-[12px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <p className="text-[10.5px] font-bold uppercase tracking-[.16em] text-phoenix">
                    {stage.period}
                  </p>
                </div>

                <h3 className="mt-5 text-[23px] font-bold leading-[1.05] tracking-[-.03em]">
                  {stage.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-warm">
                  {stage.description}
                </p>

                <ul className="mt-5 space-y-2.5 border-t border-black/[.08] pt-5">
                  {stage.details.map((detail) => (
                    <li key={detail} className="flex gap-2.5 text-[12.5px] leading-[1.45] text-ink/80">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-phoenix" aria-hidden="true" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </AnimatedSection>

        <AnimatedSection delay={220}>
          <p className="mt-5 max-w-[900px] border-l-2 border-phoenix/50 pl-4 text-[12.5px] leading-[1.6] text-warm lg:mt-6 lg:text-[13.5px]">
            7–10 days is the standard core-build window after complete onboarding. Missing access,
            delayed approvals or client inputs, carrier/A2P registration, and other third-party
            dependencies can move the live-launch date.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
