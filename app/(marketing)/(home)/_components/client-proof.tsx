'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { Quote } from 'lucide-react'

export function ClientProof() {
  return (
    <section className="relative overflow-hidden py-14 lg:py-[92px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <AnimatedSection>
            <h2 className="max-w-[560px] text-[32px] lg:text-[46px] font-bold leading-[1] tracking-[-.04em]">
              What operators say once the system is running.
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <p className="max-w-[300px] pb-2 text-[12.5px] lg:text-[15.5px] leading-[1.6] text-warm">
              Illustrative placements shown. Live quotes publish only with named, approved permission.
            </p>
          </AnimatedSection>
        </div>

        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Video testimonial */}
          <AnimatedSection className="lg:col-span-5">
            <article className="relative overflow-hidden rounded-2xl bg-ink lift">
              <div className="relative h-[210px] lg:h-[330px]">
                <Image src="/images/video-still.jpg" alt="Video testimonial" fill className="object-cover opacity-85" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <button className="absolute left-1/2 top-[40%] lg:top-[42%] flex h-14 lg:h-16 w-14 lg:w-16 -translate-x-1/2 items-center justify-center rounded-full bg-phoenix text-white shadow-[0_0_0_12px_rgba(255,107,53,.16)]">
                <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                <p className="text-[9.5px] lg:text-[10.5px] font-bold uppercase tracking-[.14em] text-flame">Video · 2:14</p>
                <p className="mt-1 lg:mt-1.5 text-[19px] lg:text-[21px] font-bold leading-tight text-white">
                  &ldquo;The front desk stopped drowning.&rdquo;
                </p>
              </div>
            </article>
          </AnimatedSection>

          {/* Quote 1 */}
          <AnimatedSection delay={150} className="lg:col-span-4">
            <article className="lg:-mt-5 rounded-2xl border border-black/10 bg-white p-6 lg:p-7 lift-sm h-full">
              <Quote className="w-5 lg:w-6 h-5 lg:h-6 text-phoenix/35" />
              <p className="mt-3 lg:mt-4 text-[17px] lg:text-[19px] font-semibold leading-[1.42] tracking-[-.01em]">
                &ldquo;We went from chasing leads to reviewing a calendar. That&apos;s the whole difference.&rdquo;
              </p>
              <div className="mt-5 lg:mt-6 flex items-center gap-3.5">
                <div className="relative h-11 lg:h-12 w-11 lg:w-12 rounded-full overflow-hidden ring-2 ring-phoenix/35">
                  <Image src="/images/headshot-2.jpg" alt="Client" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-[13.5px] lg:text-[14px] font-semibold">Practice owner</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-warm">Chiropractic · 2 locations</p>
                </div>
              </div>
            </article>
          </AnimatedSection>

          {/* Quote 2 */}
          <AnimatedSection delay={300} className="lg:col-span-3">
            <article className="lg:mt-6 rounded-2xl border border-black/10 bg-ink p-6 lg:p-7 text-white lift grain-dark h-full">
              <Quote className="w-5 lg:w-6 h-5 lg:h-6 text-flame/60" />
              <p className="mt-3 lg:mt-4 text-[17px] font-semibold leading-[1.45]">
                &ldquo;Ember booked three patients before I opened the door.&rdquo;
              </p>
              <div className="mt-5 lg:mt-6 flex items-center gap-3.5">
                <div className="relative h-11 lg:h-12 w-11 lg:w-12 rounded-full overflow-hidden ring-2 ring-flame/50">
                  <Image src="/images/headshot-1.jpg" alt="Client" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-[13.5px] lg:text-[14px] font-semibold">Clinic director</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-white/60">Medspa · Southeast</p>
                </div>
              </div>
            </article>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
