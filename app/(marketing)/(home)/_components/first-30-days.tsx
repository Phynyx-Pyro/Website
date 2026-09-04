'use client'

import { AnimatedSection } from '../../_components/animated-section'

const stages = [
  {
    period: 'Week 1',
    title: 'Baseline and access',
    description:
      'We document your offer, available new-patient capacity, current funnel, and the account access needed to do the work.',
    details: [
      'Offer and capacity review',
      'Current lead-to-visit baseline',
      'Advertising, CRM, calendar, and reporting access',
    ],
  },
  {
    period: 'Week 2',
    title: 'Build and connect',
    description:
      'We assemble the campaign path and connect the systems that carry an inquiry from first response to a clean team handoff.',
    details: [
      'Campaign and landing-page path',
      'PYRO pipeline and calendar connection',
      'Ember and team handoff rules',
    ],
  },
  {
    period: 'Week 3',
    title: 'Test and train',
    description:
      'We test the patient journey before rollout and train your team on ownership, statuses, and escalation points.',
    details: [
      'Response and booking QA',
      'Reminder and escalation QA',
      'Team status and handoff training',
    ],
  },
  {
    period: 'Week 4',
    title: 'Launch and review',
    description:
      'We begin with a controlled rollout, verify attribution, and review early handoffs for gaps before activity expands.',
    details: [
      'Controlled campaign rollout',
      'Campaign-to-calendar attribution check',
      'Early handoff review',
    ],
  },
] as const

export function FirstThirtyDays() {
  return (
    <section
      id="first-30-days"
      className="relative overflow-hidden bg-linen py-14 lg:py-[92px]"
      aria-labelledby="first-30-days-heading"
    >
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <AnimatedSection className="lg:col-span-7">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">
              The first 30 days
            </p>
            <h2
              id="first-30-days-heading"
              className="max-w-[720px] text-[36px] font-bold leading-[.98] tracking-[-.04em] lg:text-[52px]"
            >
              A clear build sequence before the system scales.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100} className="lg:col-span-5 lg:pb-1">
            <p className="max-w-[520px] text-[15.5px] leading-[1.65] text-warm lg:text-[17px]">
              The first month moves from baseline to controlled rollout. Each stage has concrete
              deliverables your practice can inspect before the next one begins.
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
            Timing depends on timely account access, approvals, and practice participation. This is
            an implementation sequence, not a promise of patient volume or a guaranteed launch date.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
