'use client'

import { AnimatedSection } from '../../_components/animated-section'
import { Clock } from 'lucide-react'

export function ProblemReframe() {
  return (
    <section className="relative overflow-hidden bg-linen py-14 lg:py-[92px]">
      <p className="font-hand pointer-events-none absolute left-[46px] top-[64px] -rotate-[7deg] text-[26px] font-semibold text-phoenix/70 hidden lg:block">
        this is where the money dies →
      </p>
      <p className="font-hand -rotate-[3deg] text-[21px] font-semibold text-phoenix px-5 lg:hidden mb-4">
        this is where the money dies
      </p>
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 px-5 lg:px-10">
        <div className="lg:col-span-5">
          <AnimatedSection>
            <p className="mb-4 lg:mb-5 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">The reframe</p>
            <h2 className="text-[38px] lg:text-[58px] font-bold leading-[.96] tracking-[-.04em]">
              The problem<br />happens <span className="text-phoenix">after</span><br />the lead.
            </h2>
            <p className="mt-4 lg:mt-6 max-w-[400px] text-[15.5px] lg:text-[17.5px] leading-[1.6] text-warm">
              Most practices don&apos;t have a lead problem. They have a response problem, a qualification problem, and a follow-up problem — and every one of them is invisible on a dashboard that only counts form fills.
            </p>
            <p className="mt-4 lg:mt-5 max-w-[400px] text-[15.5px] lg:text-[17.5px] leading-[1.6] text-warm">
              Interest is easy to buy. Appointments are engineered.
            </p>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-7 relative">
          <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-4">
            <AnimatedSection className="flex-1">
              <div className="rounded-xl border border-black/10 bg-white p-5 lg:p-6 lift-sm h-full">
                <p className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[.14em] text-warm">Leads generated</p>
                <p className="mt-2 text-[40px] lg:text-[62px] font-bold leading-none tracking-[-.05em]">100</p>
                <div className="mt-3 lg:mt-4 grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_: unknown, i: number) => (
                    <span key={i} className="h-2 rounded-sm bg-phoenix" />
                  ))}
                </div>
                <p className="mt-3 lg:mt-4 text-[13px] leading-snug text-warm">Ad spend works. The inbox fills.</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150} className="flex-1 ml-6 lg:ml-0">
              <div className="rounded-xl border border-black/10 bg-white p-5 lg:p-6 lift-sm h-full">
                <p className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[.14em] text-warm">Reached in time</p>
                <p className="mt-2 text-[40px] lg:text-[62px] font-bold leading-none tracking-[-.05em] text-warm/70">31</p>
                <div className="mt-3 lg:mt-4 grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_: unknown, i: number) => (
                    <span key={i} className={`h-2 rounded-sm ${i < 3 ? 'bg-phoenix' : 'bg-black/10'}`} />
                  ))}
                </div>
                <p className="mt-3 lg:mt-4 text-[13px] leading-snug text-warm">Manual follow-up, business hours only.</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300} className="flex-1 ml-12 lg:ml-0">
              <div className="rounded-xl border-2 border-dashed border-phoenix/40 bg-phoenix/[.06] p-5 lg:p-6 h-full">
                <p className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[.14em] text-phoenix">Actually booked</p>
                <p className="mt-2 text-[40px] lg:text-[62px] font-bold leading-none tracking-[-.05em] text-phoenix">?</p>
                <div className="mt-3 lg:mt-4 grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_: unknown, i: number) => (
                    <span key={i} className="h-2 rounded-sm" style={{ backgroundColor: `rgba(212, 85, 42, ${0.3 - i * 0.02})` }} />
                  ))}
                </div>
                <p className="mt-3 lg:mt-4 text-[13px] leading-snug text-phoenix/80">Unmeasured. Unattributed. Unrepeatable.</p>
              </div>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={450}>
            <div className="mt-6 lg:absolute lg:-bottom-9 lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-2.5 lg:gap-3 rounded-full border border-black/10 bg-white px-4 lg:px-5 py-2.5 lift-sm">
              <Clock className="w-3 h-3 text-phoenix" />
              <p className="text-[12px] lg:text-[13px] font-semibold">
                Average first response: <span className="text-phoenix">4 hrs 12 min</span> — the window closes in 5.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
