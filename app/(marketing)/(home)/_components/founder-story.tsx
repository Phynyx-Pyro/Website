'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowDownRight } from 'lucide-react'

export function FounderStory() {
  return (
    <section className="relative overflow-hidden py-14 lg:py-[96px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <AnimatedSection className="relative lg:col-span-6">
            <div className="absolute -left-2 -top-2 h-full w-full rounded-2xl border-2 border-phoenix/35 lg:-left-4 lg:-top-4" />
            <div className="relative flex min-h-[330px] w-full flex-col justify-between overflow-hidden rounded-2xl bg-ink p-7 text-white lift grain-dark lg:min-h-[440px] lg:p-10">
              <div className="flex items-start justify-between">
                <div className="relative h-12 w-12">
                  <Image src="/images/pyro-icon.png" alt="" fill className="object-contain" />
                </div>
                <ArrowDownRight className="h-8 w-8 text-flame/70" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[.16em] text-flame">Operator perspective</p>
                <p className="mt-4 max-w-[470px] text-[31px] font-bold leading-[1.02] tracking-[-.04em] sm:text-[38px] lg:text-[44px]">
                  Measure the handoffs the practice can influence.
                </p>
                <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/10 pt-5 text-[12px] font-medium text-white/55">
                  <span>Campaign → response</span>
                  <span>Request → show</span>
                  <span>Show → start</span>
                </div>
              </div>
            </div>
            <div className="relative -mt-7 ml-7 w-[250px] rounded-xl border border-black/10 bg-white px-4 py-3.5 lift lg:absolute lg:-bottom-7 lg:right-7 lg:ml-0 lg:w-[276px] lg:px-5 lg:py-4">
              <p className="text-[9.5px] font-bold uppercase tracking-[.14em] text-warm lg:text-[10.5px]">Founder &amp; operator</p>
              <p className="mt-1 text-[18px] font-bold tracking-[-.03em] lg:text-[20px]">Andrew Higdon, DC</p>
              <p className="mt-1 text-[12px] text-warm">Practicing chiropractor</p>
            </div>
          </AnimatedSection>

          <div className="relative lg:col-span-6 lg:pl-4">
            <AnimatedSection>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix lg:mb-5">Why the model is different</p>
              <h2 className="text-[36px] font-bold leading-[.98] tracking-[-.04em] lg:text-[50px]">
                Built Around the Realities of a Chiropractic Front Desk
              </h2>
              <p className="mt-5 text-[15.5px] leading-[1.65] text-warm lg:mt-6 lg:text-[17px]">
                Andrew Higdon, DC, is a practicing chiropractor and the founder of
                PhynyxPro. That operator perspective shapes the system: campaign
                reporting is only the beginning; response, appointment status, Day 1
                attendance, and the practice-recorded start decision complete the view.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.65] text-warm lg:text-[17px]">
                PhynyxPro operates the acquisition infrastructure. Your team retains
                clinical judgment, patient relationships, scheduling capacity, and the
                responsibility to keep real outcomes current.
              </p>
            </AnimatedSection>
            <p className="font-hand mt-5 rotate-[2deg] text-[20px] font-semibold text-phoenix lg:absolute lg:-bottom-7 lg:right-6 lg:mt-0 lg:rotate-[3deg] lg:text-[22px]">
              practice reality over vanity metrics.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
