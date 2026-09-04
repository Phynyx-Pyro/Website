'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../../_components/animated-section'
import { ArrowRight, Wrench, Clock, Phone, CalendarCheck, BarChart3, Bot } from 'lucide-react'
import { AssessmentCtaLink } from '../../../_components/assessment-cta-link'

export function HomeServicesClient() {
  return (
    <div>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <AnimatedSection>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Home Services</p>
              </div>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-ink">
                Connect the inquiry.<br />
                <span className="text-phoenix">To scheduled work.</span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-[1.65] text-warm">
                Roofing, plumbing, and HVAC businesses depend on timely handoffs from inquiry to estimate request, scheduled work, and recorded outcome. PhynyxPro connects that workflow.
              </p>
              <AssessmentCtaLink
                placement="home_services_hero"
                data-cta-placement="home-services-hero"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors"
              >
                Book My Patient Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
              </AssessmentCtaLink>
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
              { icon: Phone, title: 'Prompt Lead Response', desc: 'Ember can support configured phone, SMS, and chat workflows, with staff handoff when needed.' },
              { icon: CalendarCheck, title: 'Estimate & Job Requests', desc: 'Connected scheduling can offer approved availability and capture the next requested step.' },
              { icon: Clock, title: 'After-Hours Coverage', desc: 'Configured workflows can acknowledge after-hours and weekend inquiries and route follow-up.' },
              { icon: BarChart3, title: 'Connected Reporting', desc: 'Bring available ad, lead, booking, and recorded revenue data into one review path.' },
              { icon: Bot, title: 'Approved Follow-Up', desc: 'Configured SMS and email sequences can re-engage eligible leads who have gone quiet.' },
              { icon: Wrench, title: 'Service Workflows', desc: 'The workflow can be configured around estimate requests, job scheduling, and service follow-up.' },
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
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Ready to tighten the path from inquiry to scheduled work?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check. If there may be a match, continue to a roughly 45-minute working diagnostic using last month&apos;s acquisition numbers.
            </p>
            <AssessmentCtaLink
              placement="home_services_final"
              data-cta-placement="home-services-final"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors"
            >
              Book My Patient Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
            </AssessmentCtaLink>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
