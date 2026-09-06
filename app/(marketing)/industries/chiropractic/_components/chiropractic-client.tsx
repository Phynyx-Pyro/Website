'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../../_components/animated-section'
import { AssessmentCtaLink } from '../../../_components/assessment-cta-link'
import { Waveform } from '../../../_components/waveform'
import { ArrowRight, Zap, Stethoscope, Clock, Phone, Bot, BarChart3, Users } from 'lucide-react'

const painPoints = [
  { icon: Clock, title: 'Slow Follow-Up', desc: 'When follow-up waits, patient intent can cool or move elsewhere.' },
  { icon: Phone, title: 'Missed Calls After Hours', desc: 'After-hours and overflow inquiries can expose gaps in front-desk coverage.' },
  { icon: Users, title: 'Leads Without Appointments', desc: 'Your ad campaigns generate interest, but interest without a system produces clicks — not patients.' },
  { icon: BarChart3, title: 'Fragmented Attribution', desc: 'Disconnected systems can make it difficult to connect campaign activity with recorded patient outcomes.' },
]

export function ChiropracticClient() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <AnimatedSection>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Chiropractic</p>
              </div>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-ink">
                A patient acquisition system built around your front desk.
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-[1.65] text-warm">
                Andrew Higdon, DC, is a practicing chiropractor and PhynyxPro&apos;s founder/operator. The system focuses on the handoffs from first inquiry through Day 1 Show and Start Care.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <AssessmentCtaLink placement="chiropractic_hero" industry="chiropractic" className="inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                  Book My Patient Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
                </AssessmentCtaLink>
                <Link href="/growth-system" className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                  See the System
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative">
                  <Image src="/images/chiropractor.jpg" alt="Chiropractor treating a patient in a modern clinic" fill className="object-cover" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[600px]">
              Common handoff breakdowns in chiropractic practices.
            </h2>
          </AnimatedSection>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {painPoints.map((p, i) => (
              <AnimatedSection key={p?.title ?? i} delay={i * 100}>
                <div className="rounded-xl bg-ivory p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <p.icon className="h-7 w-7 text-phoenix mb-4" />
                  <h3 className="text-[18px] font-semibold text-ink">{p?.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-warm">{p?.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
                The system that closes the gap.
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-warm">
                PhynyxPro connects paid acquisition with response, qualification, appointment requests, staff confirmation, reminders, and reporting. When an inquiry arrives by phone, chat, or form, PYRO coordinates the workflow and Ember can handle the approved conversation. Connected records make it easier to review requests, confirmed appointments, shows, and starts.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Managed advertising built around agreed audiences and offers',
                  'Ember AI for configured response windows and channels',
                  'Transactional appointment coordination with defined staff handoffs',
                  'PYRO pipeline and recorded-outcome reporting',
                  'Permission-based reactivation for patient lists with recorded channel consent and no opt-out',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-ink">
                    <Zap className="h-4 w-4 text-phoenix mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative">
                  <Image src="/images/industry-chiro.jpg" alt="Illustrative chiropractic practice setting" fill className="object-cover" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Ember Section */}
      <section className="bg-night grain-dark text-white py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <Bot className="h-10 w-10 text-phoenix mx-auto mb-4" />
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-white">
              Meet Ember. Configured help for after-hours inquiries.
            </h2>
            <p className="mt-4 max-w-[520px] mx-auto text-[17px] leading-[1.65] text-white/70">
              When an inquiry arrives after hours, Ember can respond, gather approved details, and route an appointment request. PYRO records the known outcome, and your team can take over when human judgment is needed.
            </p>
            <div className="mt-8" aria-hidden="true">
              <Waveform className="justify-center" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <Link href="/pyro-ember" className="mt-10 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              See How PYRO &amp; Ember Work <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
              Ready to grow your practice?
            </h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check. If your practice may be a fit, the next step is a working diagnostic to review last month&apos;s spend, leads, appointment requests, shows, and starts.
            </p>
            <AssessmentCtaLink placement="chiropractic_final" industry="chiropractic" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Book My Patient Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
            </AssessmentCtaLink>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
