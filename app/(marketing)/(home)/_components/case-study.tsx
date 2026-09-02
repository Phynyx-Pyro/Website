'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight } from 'lucide-react'

const metrics = [
  { label: 'Appointment requests / mo', before: '38', after: '96' },
  { label: 'Show rate', before: '61%', after: '83%' },
  { label: 'First response', before: '4h 12m', after: '41s' },
  { label: 'Cost per attended visit', before: '$214', after: '$88' },
]

export function CaseStudy() {
  return (
    <section className="relative overflow-hidden py-14 lg:py-[96px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left: copy */}
          <div className="lg:col-span-5 relative">
            <AnimatedSection>
              <p className="mb-4 lg:mb-5 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">
                Documented outcome · Chiropractic
              </p>
              <h2 className="text-[36px] lg:text-[52px] font-bold leading-[.97] tracking-[-.04em]">
                A calendar that filled itself for 90 days.
              </h2>
              <p className="mt-4 lg:mt-6 max-w-[420px] text-[15.5px] lg:text-[17px] leading-[1.6] text-warm">
                A two-doctor practice in a mid-size market. Same ad budget. Same team.
                One connected system replacing four disconnected tools and a voicemail box.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="mt-6 lg:mt-8 rounded-xl border border-black/10 bg-white p-5 lg:p-6 lift-sm">
                <div className="flex items-start gap-3.5 lg:gap-4">
                  <div className="relative h-12 lg:h-14 w-12 lg:w-14 rounded-full overflow-hidden ring-2 ring-phoenix/40 shrink-0">
                    <Image src="/images/headshot-1.jpg" alt="Practice owner" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[15px] lg:text-[16.5px] font-semibold leading-[1.45]">
                      &ldquo;We stopped guessing. Every inquiry gets answered, and I can finally see which ad paid for which patient.&rdquo;
                    </p>
                    <p className="mt-2 lg:mt-3 text-[11.5px] lg:text-[13px] font-medium text-warm">
                      Practice owner · Chiropractic · Midwest{' '}
                      <span className="ml-1.5 rounded bg-black/[.06] px-1.5 py-0.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-wide">Illustrative</span>
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <p className="font-hand mt-4 lg:absolute lg:-bottom-11 lg:left-1 -rotate-[4deg] text-[19px] lg:text-[21px] font-semibold text-phoenix">
              same spend — different operating system
            </p>
          </div>

          {/* Right: artifact collage */}
          <div className="lg:col-span-7">
            <AnimatedSection className="relative h-auto lg:h-[520px]">
            {/* Image card */}
              <div className="lg:absolute lg:left-0 lg:top-0 lg:w-[330px] overflow-hidden rounded-xl border border-black/10 bg-white lg:-rotate-[2deg] lift">
                <div className="relative h-[190px] lg:h-[204px]">
                  <Image src="/images/founder.jpg" alt="Owner reviewing dashboards" fill className="object-cover" />
                </div>
                <p className="px-4 py-3 text-[12px] font-medium text-warm">Weekly review · spend, bookings, attendance</p>
              </div>

            {/* Metrics card */}
              <div className="mt-4 lg:mt-0 lg:absolute lg:right-0 lg:top-[26px] lg:w-[356px] lg:rotate-[1.5deg] rounded-xl border border-black/10 bg-white p-5 lift">
                <p className="text-[9.5px] lg:text-[10.5px] font-bold uppercase tracking-[.14em] text-warm">Before → after · 90 days</p>
                <div className="mt-3.5 lg:mt-4 space-y-3 lg:space-y-3.5">
                  {metrics?.map((m: any, i: number) => (
                    <div key={m?.label} className={`flex items-center justify-between ${i < (metrics?.length ?? 0) - 1 ? 'border-b border-black/[.06] pb-2.5 lg:pb-3' : ''}`}>
                      <span className="text-[12.5px] lg:text-[13.5px] font-medium">{m?.label}</span>
                      <span className="text-[13.5px] lg:text-[15px] font-bold">
                        <span className="text-warm/70 line-through">{m?.before}</span>
                        <ArrowRight className="inline mx-1 lg:mx-1.5 w-2.5 h-2.5 text-phoenix" />
                        <span className="text-phoenix">{m?.after}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            {/* Reactivation card */}
              <div className="mt-4 lg:mt-0 lg:absolute lg:bottom-[46px] lg:left-[52px] lg:w-[300px] lg:-rotate-[1deg] rounded-xl border border-black/10 bg-ink p-5 text-white lift grain-dark">
                <p className="text-[10px] lg:text-[10.5px] font-bold uppercase tracking-[.14em] text-white/55">Reactivation campaign</p>
                <p className="mt-2.5 text-[13px] leading-snug text-white/80">
                  &ldquo;Hi Dana — it&apos;s been a while since your last visit. Want me to find you a time this week?&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-4 text-[11.5px]">
                  <span className="font-bold text-flame">1,842 contacted</span>
                  <span className="text-white/50">·</span>
                  <span className="font-bold text-flame">207 rebooked</span>
                </div>
              </div>

            {/* Revenue card */}
              <div className="mt-4 lg:mt-0 lg:absolute lg:bottom-0 lg:right-[24px] lg:w-[224px] lg:rotate-[2deg] rounded-xl border border-phoenix/30 bg-phoenix px-5 py-4 text-white lift">
                <p className="text-[9.5px] lg:text-[10.5px] font-bold uppercase tracking-[.14em] text-white/75">Attributed revenue</p>
                <p className="mt-1 text-[30px] lg:text-[32px] font-bold leading-none tracking-[-.04em]">$418,200</p>
                <p className="mt-1.5 text-[11px] lg:text-[11.5px] text-white/80">Tied to campaigns, not guessed</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
