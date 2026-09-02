'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'

export function GrowthSystem() {
  return (
    <section className="relative overflow-hidden bg-linen pb-14 lg:pb-[110px] pt-14 lg:pt-[92px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-10">
          <div className="lg:col-span-7">
            <AnimatedSection>
              <p className="mb-4 lg:mb-5 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">The growth system</p>
              <h2 className="text-[38px] lg:text-[58px] font-bold leading-[.95] tracking-[-.042em]">
                One connected system.<br />Three outcomes.
              </h2>
            </AnimatedSection>
          </div>
          <div className="lg:col-span-5 pb-3">
            <AnimatedSection delay={100}>
              <p className="text-[15.5px] lg:text-[17px] leading-[1.6] text-warm">
                Attract the right demand. Convert interest before it goes cold. Operate with the systems and evidence you need to scale.
              </p>
            </AnimatedSection>
          </div>
        </div>

        <div className="mt-8 lg:mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Attract */}
          <AnimatedSection>
            <article className="relative rounded-2xl border border-black/10 bg-white p-6 lg:p-7 lift-sm h-full">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-bold tracking-[.14em] text-phoenix">01</span>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-warm">Attract</span>
              </div>
              <h3 className="mt-3 lg:mt-4 text-[25px] lg:text-[30px] font-bold leading-[1.02] tracking-[-.03em]">
                Demand built for your market.
              </h3>
              <p className="mt-2.5 lg:mt-3.5 text-[14.5px] lg:text-[15px] leading-[1.6] text-warm">
                Managed advertising, offer strategy, and creative that bring the right people in — not the cheapest clicks.
              </p>
              <div className="relative mt-5 lg:mt-7 h-[168px] lg:h-[236px]">
                <div className="absolute left-0 top-0 w-[128px] lg:w-[152px] -rotate-[3deg] overflow-hidden rounded-lg border border-black/10 bg-ink lift-sm">
                  <div className="relative h-[104px] lg:h-[124px]">
                    <Image src="/images/ad-creative.jpg" alt="Ad creative preview" fill className="object-cover opacity-90" />
                  </div>
                  <p className="px-2 lg:px-2.5 py-1.5 lg:py-2 text-[9px] lg:text-[10px] font-semibold text-white">
                    Back pain shouldn&apos;t run your life.
                  </p>
                </div>
                <div className="absolute right-0 top-6 lg:top-9 w-[152px] lg:w-[172px] rotate-[2deg] rounded-lg border border-black/10 bg-white p-3 lg:p-3.5 lift-sm">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[.12em] text-warm">Campaign performance</p>
                  <p className="mt-1.5 lg:mt-2 text-[10.5px] lg:text-[11px] font-semibold text-[#1E7A42]">+31% qualified inquiries</p>
                  <div className="mt-2.5 lg:mt-3 flex items-end gap-1.5">
                    {[4,7,5,10,8,14].map((h: number, i: number) => (
                      <span key={i} className="w-3 rounded-sm bg-phoenix" style={{ height: `${h}px`, opacity: 0.25 + i * 0.15 }} />
                    ))}
                  </div>
                  <p className="mt-2 lg:mt-3 text-[9px] lg:text-[10px] text-warm">Cost / lead</p>
                  <p className="text-[17px] lg:text-[19px] font-bold tracking-[-.03em]">$42.50</p>
                </div>
              </div>
            </article>
          </AnimatedSection>

          {/* Convert */}
          <AnimatedSection delay={150}>
            <article className="relative lg:-mt-8 rounded-2xl border border-black/10 bg-ink p-6 lg:p-7 text-white lift grain-dark h-full">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-bold tracking-[.14em] text-flame">02</span>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-white/60">Convert</span>
              </div>
              <h3 className="mt-3 lg:mt-4 text-[25px] lg:text-[30px] font-bold leading-[1.02] tracking-[-.03em]">
                Interest becomes a next step.
              </h3>
              <p className="mt-2.5 lg:mt-3.5 text-[14.5px] lg:text-[15px] leading-[1.6] text-white/70">
                CRM, automated follow-up, and appointment workflows that respond before the moment passes.
              </p>
              <div className="relative mt-5 lg:mt-7 h-[190px] lg:h-[268px]">
                <div className="absolute left-0 top-0 w-[168px] lg:w-[196px] -rotate-[2deg] rounded-lg border border-white/12 bg-white/[.06] p-3 lg:p-3.5">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[.12em] text-white/50">Follow-up sequence</p>
                  <div className="mt-2 lg:mt-2.5 space-y-1.5 lg:space-y-2 text-[10px] lg:text-[10.5px]">
                    <p className="flex items-center gap-2">⚡ Instant SMS · 0 min</p>
                    <p className="flex items-center gap-2">📞 Ember call · 2 min</p>
                    <p className="flex items-center gap-2">✉️ Email recap · 10 min</p>
                    <p className="flex items-center gap-2 text-white/50">⏰ Nudge · day 2</p>
                  </div>
                </div>
                <div className="absolute right-0 top-[74px] lg:top-[104px] w-[156px] lg:w-[188px] rotate-[2deg] rounded-lg border border-white/12 bg-coal p-3 lg:p-3.5 lift-dark">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[.12em] text-white/50">Appointment</p>
                  <div className="mt-2 lg:mt-2.5 grid grid-cols-4 gap-1 text-center text-[9.5px] lg:text-[10px]">
                    <span className="rounded bg-white/[.06] py-1.5">9:00</span>
                    <span className="rounded bg-white/[.06] py-1.5">9:20</span>
                    <span className="rounded bg-flame py-1.5 font-bold text-white">2:30</span>
                    <span className="rounded bg-white/[.06] py-1.5">3:10</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-2 w-[150px] lg:w-[176px] -rotate-[1deg] rounded-lg border border-flame/45 bg-[#12341F] px-3.5 py-2.5 lg:py-3">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[.12em] text-white/60">Booked</p>
                  <p className="mt-0.5 lg:mt-1 text-[14px] lg:text-[15px] font-bold">Thu · 2:30 PM</p>
                </div>
                <p className="font-hand absolute bottom-3 lg:bottom-[86px] right-1 lg:right-[6px] rotate-[5deg] text-[17px] lg:text-[19px] font-semibold leading-tight text-flame">
                  no cold leads<br />left behind
                </p>
              </div>
            </article>
          </AnimatedSection>

          {/* Operate & Scale */}
          <AnimatedSection delay={300}>
            <article className="relative lg:mt-4 rounded-2xl border border-black/10 bg-white p-6 lg:p-7 lift-sm h-full">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-bold tracking-[.14em] text-phoenix">03</span>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-warm">Operate & Scale</span>
              </div>
              <h3 className="mt-3 lg:mt-4 text-[25px] lg:text-[30px] font-bold leading-[1.02] tracking-[-.03em]">
                Know what drives revenue.
              </h3>
              <p className="mt-2.5 lg:mt-3.5 text-[14.5px] lg:text-[15px] leading-[1.6] text-warm">
                AI employees, reactivation, coaching, and attribution that tie spend to attended appointments.
              </p>
              <div className="mt-5 lg:mt-7 rounded-lg border border-black/10 bg-ivory p-4">
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[.14em] text-warm">90-day outcomes</p>
                <div className="mt-3 lg:mt-3.5 space-y-3 lg:space-y-3.5">
                  {[
                    { label: 'Contact rate', value: 94 },
                    { label: 'Appointment show rate', value: 81 },
                    { label: 'Lead response under 1 min', value: 99 },
                  ].map((item: any) => (
                    <div key={item?.label}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] lg:text-[12.5px] font-medium">{item?.label}</span>
                        <span className="text-[12px] lg:text-[12.5px] font-bold text-phoenix">{item?.value}%</span>
                      </div>
                      <div className="mt-1 lg:mt-1.5 h-1.5 rounded-full bg-black/[.07]">
                        <div className="h-full rounded-full bg-phoenix" style={{ width: `${item?.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 lg:mt-4 flex items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 lift-sm">
                <div>
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[.12em] text-warm">Attributed revenue</p>
                  <p className="text-[20px] lg:text-[22px] font-bold tracking-[-.03em]">$418,200</p>
                </div>
                <span className="rounded-full bg-phoenix/10 px-2.5 py-1 text-[10.5px] lg:text-[11px] font-bold text-phoenix">+22% QoQ</span>
              </div>
            </article>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
