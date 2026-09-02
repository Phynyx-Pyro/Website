'use client'

import { AnimatedSection } from '../../_components/animated-section'
import { Megaphone, MousePointerClick, Inbox, Flame, CalendarCheck, GitBranch, TrendingUp } from 'lucide-react'

const beats = [
  { icon: Megaphone, num: '01', title: 'The ad appears', desc: 'Offer and creative matched to a real local intent.', highlight: false },
  { icon: MousePointerClick, num: '02', title: 'The tap', desc: 'A landing page built to ask one thing.', highlight: false },
  { icon: Inbox, num: '03', title: 'The inquiry lands', desc: 'Form, call, or chat \u2014 same pipe, same second.', highlight: false },
  { icon: Flame, num: '04', title: 'Ember responds', desc: 'Under 60 seconds. Any hour. Every time.', highlight: true },
  { icon: CalendarCheck, num: '05', title: 'The booking', desc: 'A real slot on a real calendar, confirmed.', highlight: false },
  { icon: GitBranch, num: '06', title: 'CRM handoff', desc: 'The card moves. Your team picks it up warm.', highlight: false },
  { icon: TrendingUp, num: '07', title: 'Revenue attributed', desc: 'Back to the ad that started it.', highlight: false },
]

export function JourneySection() {
  return (
    <section className="relative overflow-hidden py-14 lg:py-[86px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <AnimatedSection>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">Anatomy of one inquiry</p>
              <h2 className="max-w-[640px] text-[36px] lg:text-[52px] font-bold leading-[.98] tracking-[-.04em]">
                Watch the machine work, second by second.
              </h2>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={100}>
            <p className="max-w-[330px] pb-2 text-[15px] lg:text-[16px] leading-[1.6] text-warm">
              Seven beats from the moment someone taps an ad to the moment revenue is attributed back to it.
            </p>
          </AnimatedSection>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden lg:block relative mt-16">
          <div className="dashline absolute left-0 right-0 top-[26px] h-px" />
          <div className="absolute top-[22px] h-[9px] w-[9px] rounded-full bg-flame shadow-[0_0_12px_3px_rgba(255,107,53,.6)] animate-travel" />
          <div className="relative grid grid-cols-7 gap-3">
            {beats?.map((beat: any, i: number) => {
              const Icon = beat?.icon
              return (
                <AnimatedSection key={beat?.num} delay={i * 80} className="pr-3">
                  <span className={`flex h-[54px] w-[54px] items-center justify-center rounded-full ${
                    beat?.highlight
                      ? 'bg-phoenix text-white shadow-[0_0_0_8px_rgba(212,85,42,.14)]'
                      : 'border border-phoenix/30 bg-ivory text-phoenix'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <p className={`mt-4 text-[10.5px] font-bold uppercase tracking-[.14em] ${beat?.highlight ? 'text-phoenix' : 'text-warm'}`}>
                    Beat {beat?.num}
                  </p>
                  <p className="mt-1 text-[16px] font-bold leading-tight">{beat?.title}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-warm">{beat?.desc}</p>
                </AnimatedSection>
              )
            })}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="lg:hidden relative mt-8 pl-14">
          <div className="dashv absolute left-[26px] top-3 bottom-6 w-px" />
          {beats?.map((beat: any, i: number) => {
            const Icon = beat?.icon
            return (
              <AnimatedSection key={beat?.num} delay={i * 60} className="relative mb-6">
                <span className={`absolute -left-14 flex h-11 w-11 items-center justify-center rounded-full ${
                  beat?.highlight
                    ? 'bg-phoenix text-white shadow-[0_0_0_7px_rgba(212,85,42,.15)]'
                    : 'border border-phoenix/30 bg-ivory text-phoenix'
                }`}>
                  <Icon className="w-4 h-4" />
                </span>
                <p className={`text-[9.5px] font-bold uppercase tracking-[.14em] ${beat?.highlight ? 'text-phoenix' : 'text-warm'}`}>
                  Beat {beat?.num}
                </p>
                <p className="text-[16px] font-bold">{beat?.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-warm">{beat?.desc}</p>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
