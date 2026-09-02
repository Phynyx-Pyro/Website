'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../../_components/animated-section'
import { ArrowRight, Smile, Clock, Phone, CalendarCheck, BarChart3, Bot, Star } from 'lucide-react'

export function DentalMedspaClient() {
  return (
    <main>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <AnimatedSection>
              <div className="flex items-center gap-2 mb-4">
                <Smile className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Dental & Medspa</p>
              </div>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-ink">
                More patients.<br />
                <span className="text-phoenix">Faster follow-up.</span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-[1.65] text-warm">
                High-value appointments, competitive markets, and patients who expect instant communication. PhynyxPro delivers all three with a system designed for healthcare practices.
              </p>
              <Link href="/growth-assessment" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                Book a Growth Assessment <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative">
                  <Image src="/images/dental.jpg" alt="Modern dental practice" fill className="object-cover" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[600px]">
              Why dental and medspa practices choose PhynyxPro.
            </h2>
          </AnimatedSection>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Star, title: 'High-Value Appointments', desc: 'Cosmetic dentistry, Invisalign, medspa treatments — every missed appointment is significant revenue lost.' },
              { icon: Clock, title: 'Speed to Response', desc: 'Patients shopping for elective procedures book with whoever responds first. Ember responds in seconds.' },
              { icon: Phone, title: 'After-Hours Booking', desc: 'Most procedure inquiries happen after work hours. Ember qualifies and books while your team is home.' },
              { icon: CalendarCheck, title: 'Reduced No-Shows', desc: 'Automated confirmation and reminder sequences dramatically reduce appointment no-shows.' },
              { icon: BarChart3, title: 'Treatment Attribution', desc: 'Know which campaigns produce which treatments. Tie advertising spend directly to treatment revenue.' },
              { icon: Bot, title: 'Patient Reactivation', desc: 'Re-engage past patients who haven\'t booked in 6+ months with automated, personalized outreach.' },
            ].map((item, i) => (
              <AnimatedSection key={item?.title ?? i} delay={i * 80}>
                <div className="rounded-xl bg-ivory p-6 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <item.icon className="h-7 w-7 text-phoenix mb-4" />
                  <h3 className="text-[17px] font-semibold text-ink">{item?.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.6] text-warm">{item?.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Ready to fill your appointment book?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              A growth assessment shows you where patients are being lost and how the system brings them back.
            </p>
            <Link href="/growth-assessment" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Book a Growth Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}
