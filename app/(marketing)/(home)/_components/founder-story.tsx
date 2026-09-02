'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'

export function FounderStory() {
  return (
    <section className="relative overflow-hidden bg-linen py-14 lg:py-[96px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
          {/* Portrait */}
          <AnimatedSection className="lg:col-span-6 relative">
            <div className="absolute -left-2 lg:-left-4 -top-2 lg:-top-4 h-full w-full rounded-2xl border-2 border-phoenix/35" />
            <div className="relative h-[240px] lg:h-[440px] w-full rounded-2xl overflow-hidden lift">
              <Image src="/images/founder.jpg" alt="Andrew Higdon, founder of PhynyxPro" fill className="object-cover" />
            </div>
            <div className="relative -mt-8 ml-8 lg:absolute lg:-bottom-7 lg:right-7 w-[220px] lg:w-[262px] rounded-xl border border-black/10 bg-white px-4 lg:px-5 py-3.5 lg:py-4 lift">
              <p className="text-[9.5px] lg:text-[10.5px] font-bold uppercase tracking-[.14em] text-warm">Founder</p>
              <p className="mt-0.5 lg:mt-1 text-[17px] lg:text-[19px] font-bold tracking-[-.03em]">Andrew Higdon, DC</p>
              <p className="mt-0.5 lg:mt-1 text-[11.5px] lg:text-[12.5px] text-warm">Practicing chiropractor · Operator</p>
            </div>
          </AnimatedSection>

          {/* Copy */}
          <div className="lg:col-span-6 relative lg:pl-4">
            <AnimatedSection>
              <p className="mb-4 lg:mb-5 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">Why we exist</p>
              <h2 className="text-[36px] lg:text-[50px] font-bold leading-[.98] tracking-[-.04em]">
                Built by a chiropractor who lived the problems.
              </h2>
              <p className="mt-4 lg:mt-6 text-[15.5px] lg:text-[17.5px] leading-[1.65] text-warm">
                Andrew Higdon was — and remains — a practicing chiropractor. He built PhynyxPro after living the frustration every practice owner knows: leads come in, then quietly slip through the cracks.
              </p>
              <p className="mt-4 text-[15.5px] lg:text-[17.5px] leading-[1.65] text-warm">
                Every part of this system was built to solve a problem he had first, in his own clinic, with his own money on the line.
              </p>
              <Link
                href="/about"
                className="group mt-6 lg:mt-8 inline-flex items-center gap-3 text-[15px] lg:text-[16px] font-semibold text-phoenix"
              >
                Read the full story
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </AnimatedSection>
            <p className="font-hand mt-4 lg:absolute lg:-bottom-4 lg:right-6 rotate-[2deg] lg:rotate-[3deg] text-[20px] lg:text-[22px] font-semibold text-phoenix">
              not from a marketing desk.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
