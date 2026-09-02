'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../../_components/animated-section'
import { ArrowRight, Wrench, Clock, Phone, CalendarCheck, BarChart3, Bot } from 'lucide-react'

export function HomeServicesClient() {
  return (
    <main>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <AnimatedSection>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Home Services</p>
              </div>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-ink">
                Fill your calendar.<br />
                <span className="text-phoenix">Not just your inbox.</span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-[1.65] text-warm">
                Roofing, plumbing, HVAC — your business runs on booked jobs. The same system that converts patients for chiropractic practices converts customers for service businesses.
              </p>
              <Link href="/growth-assessment" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                Book a Growth Assessment <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative">
                  <Image src="/images/home-services.jpg" alt="Home service professional on a job site" fill className="object-cover" />
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
              What the system does for home service businesses.
            </h2>
          </AnimatedSection>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Instant Lead Response', desc: 'Every inquiry gets a response in seconds — by Ember AI. No more missed calls turning into missed jobs.' },
              { icon: CalendarCheck, title: 'Booked Estimates & Jobs', desc: 'Automated scheduling gets prospects on your calendar before they call a competitor.' },
              { icon: Clock, title: '24/7 Availability', desc: 'Ember handles after-hours and weekend inquiries so you never lose a job to timing.' },
              { icon: BarChart3, title: 'Know Your Numbers', desc: 'Full attribution from ad spend to booked revenue. Know exactly what each campaign produces.' },
              { icon: Bot, title: 'AI Follow-Up', desc: 'Automated SMS and email sequences that re-engage leads who went quiet.' },
              { icon: Wrench, title: 'Built for Service', desc: 'Not a generic marketing tool. Workflows designed for estimate requests, job scheduling, and service follow-up.' },
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
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Ready to stop losing jobs to slow follow-up?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              A 15-minute growth assessment shows you where jobs are being lost and how the system fixes it.
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
