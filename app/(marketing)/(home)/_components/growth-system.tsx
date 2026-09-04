'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, Check, CircleCheck, Users } from 'lucide-react'

const phynyxOwns = [
  'Campaign, offer, creative, and landing-page operation',
  'PYRO pipeline, response, booking, and reminder workflows',
  'Ember configuration with defined human-handoff rules',
  'Source-to-stage reporting and an operating review cadence',
]

const practiceOwns = [
  'Access, approvals, calendar rules, and new-patient capacity',
  'Accurate services, FAQs, and escalation guidance',
  'A person available when a conversation needs human judgment',
  'Consistent Confirmed, Day 1 Show, and Start Care updates',
]

export function GrowthSystem() {
  return (
    <section className="relative overflow-hidden bg-linen pb-14 pt-14 lg:pb-[104px] lg:pt-[92px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <AnimatedSection>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix lg:mb-5">The PhynyxPro system</p>
              <h2 className="text-[38px] font-bold leading-[.95] tracking-[-.042em] lg:text-[58px]">
                One operating system. <span className="block">Three jobs.</span>
              </h2>
            </AnimatedSection>
          </div>
          <div className="pb-2 lg:col-span-5">
            <AnimatedSection delay={100}>
              <p className="text-[15.5px] leading-[1.6] text-warm lg:text-[17px]">
                PhynyxPro is not just the ad account. It connects demand generation,
                the workflow after the click, and the practice-verified outcomes used
                to improve the system.
              </p>
            </AnimatedSection>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          <AnimatedSection>
            <article className="relative h-full rounded-2xl border border-black/10 bg-white p-6 lift-sm lg:p-7">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-bold tracking-[.14em] text-phoenix">01</span>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-warm">Attract</span>
              </div>
              <h3 className="mt-3 text-[25px] font-bold leading-[1.02] tracking-[-.03em] lg:mt-4 lg:text-[30px]">Build demand for your market.</h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-warm lg:text-[15px]">
                Managed paid acquisition, offer strategy, creative, and landing pages
                designed for chiropractic new-patient demand.
              </p>
              <div className="relative mt-6 h-[205px] lg:mt-7 lg:h-[244px]">
                <div className="absolute left-0 top-0 w-[142px] -rotate-[3deg] overflow-hidden rounded-lg border border-black/10 bg-ink lift-sm lg:w-[162px]">
                  <div className="relative h-[112px] lg:h-[130px]">
                    <Image src="/images/ad-creative.jpg" alt="Example chiropractic campaign creative" fill className="object-cover opacity-90" />
                  </div>
                  <p className="px-2.5 py-2 text-[10px] font-semibold leading-snug text-white">A clear offer for a local patient need.</p>
                </div>
                <div className="absolute right-0 top-9 w-[165px] rotate-[2deg] rounded-lg border border-black/10 bg-white p-3.5 lift-sm lg:w-[182px]">
                  <p className="text-[9.5px] font-bold uppercase tracking-[.12em] text-warm">Campaign path</p>
                  {['Offer', 'Creative', 'Landing page'].map((item) => (
                    <p key={item} className="mt-2.5 flex items-center gap-2 text-[11px] font-semibold">
                      <CircleCheck className="h-3.5 w-3.5 text-phoenix" aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <article className="relative h-full rounded-2xl border border-black/10 bg-ink p-6 text-white lift grain-dark lg:-mt-8 lg:p-7">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-bold tracking-[.14em] text-flame">02</span>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-white/60">Convert</span>
              </div>
              <h3 className="mt-3 text-[25px] font-bold leading-[1.02] tracking-[-.03em] lg:mt-4 lg:text-[30px]">Give every good inquiry a next step.</h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-white/70 lg:text-[15px]">
                PYRO coordinates response, qualification, booking, confirmation,
                reminders, and the handoff to your team.
              </p>
              <ol className="mt-6 space-y-2.5 lg:mt-7">
                {['New lead enters PYRO', 'Ember begins the approved conversation', 'Appointment request reaches the calendar', 'Confirmation, reminders, and human handoff'].map((item, index) => (
                  <li key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[.045] px-3.5 py-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${index === 2 ? 'bg-flame text-white' : 'bg-white/[.08] text-white/60'}`}>{index + 1}</span>
                    <span className="text-[11.5px] font-medium leading-[1.35] text-white/85">{item}</span>
                  </li>
                ))}
              </ol>
              <p className="font-hand mt-5 rotate-[-2deg] text-right text-[19px] font-semibold text-flame">one accountable handoff</p>
            </article>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <article className="relative h-full rounded-2xl border border-black/10 bg-white p-6 lift-sm lg:mt-4 lg:p-7">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-bold tracking-[.14em] text-phoenix">03</span>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-warm">Operate &amp; improve</span>
              </div>
              <h3 className="mt-3 text-[25px] font-bold leading-[1.02] tracking-[-.03em] lg:mt-4 lg:text-[30px]">Use the full journey to make decisions.</h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-warm lg:text-[15px]">
                Review campaign activity alongside the appointment and patient stages
                your practice records—without presenting ad-platform leads as outcomes.
              </p>
              <div className="mt-6 rounded-lg border border-black/10 bg-ivory p-4 lg:mt-7">
                <p className="text-[9.5px] font-bold uppercase tracking-[.14em] text-warm">Decision record</p>
                {[
                  ['Campaign source', 'Captured'],
                  ['Appointment status', 'Updated'],
                  ['Show / start outcome', 'Practice verified'],
                ].map(([label, status], index) => (
                  <div key={label} className={`mt-3 flex items-center justify-between gap-3 ${index > 0 ? 'border-t border-black/[.07] pt-3' : ''}`}>
                    <span className="text-[11.5px] font-semibold text-ink">{label}</span>
                    <span className="text-right text-[10.5px] font-bold text-phoenix">{status}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-[1.45] text-warm">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-phoenix" aria-hidden="true" />
                The review starts with stage definitions everyone agrees on.
              </p>
            </article>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={160}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-black/10 bg-white lift-sm lg:mt-14">
            <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-black/10">
              <div className="p-6 lg:p-8">
                <p className="text-[10.5px] font-bold uppercase tracking-[.16em] text-phoenix">PhynyxPro installs and operates</p>
                <ul className="mt-4 space-y-3">
                  {phynyxOwns.map((item) => (
                    <li key={item} className="flex gap-3 text-[13.5px] leading-[1.5] text-ink/85 lg:text-[14px]">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-phoenix" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-black/10 bg-ivory/70 p-6 lg:border-t-0 lg:p-8">
                <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[.16em] text-warm">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Your practice provides
                </p>
                <ul className="mt-4 space-y-3">
                  {practiceOwns.map((item) => (
                    <li key={item} className="flex gap-3 text-[13.5px] leading-[1.5] text-ink/80 lg:text-[14px]">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-warm" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
