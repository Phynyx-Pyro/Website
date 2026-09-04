'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, Heart, Target, Shield, Eye, Users } from 'lucide-react'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'

const values = [
  { icon: Eye, title: 'Transparency', desc: 'Connected reporting is designed to keep available spend, lead, appointment, and recorded-outcome data visible in one place.' },
  { icon: Target, title: 'Outcomes Over Activity', desc: 'We connect campaign and response metrics to appointment status and business-recorded outcomes when the source data is available.' },
  { icon: Shield, title: 'Fit Before Scope', desc: 'The fit check compares stated revenue and monthly marketing budget with initial thresholds. The working diagnostic reviews the wider operating context.' },
  { icon: Heart, title: 'Operator Perspective', desc: 'Andrew Higdon, DC, is a practicing chiropractor. That perspective keeps the work grounded in real handoffs and team capacity.' },
]

export function AboutClient() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <AnimatedSection className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl bg-ink text-white shadow-lift grain-dark">
                <div className="relative flex aspect-[3/4] flex-col justify-between p-7 sm:p-9">
                  <div className="relative h-12 w-12">
                    <Image src="/images/pyro-icon.png" alt="" fill className="object-contain" />
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[.16em] text-flame">Operator perspective</p>
                    <p className="mt-4 text-[31px] font-bold leading-[1.04] tracking-[-.04em] sm:text-[38px]">
                      Measure the handoffs the team can influence.
                    </p>
                    <div className="mt-7 border-t border-white/10 pt-5">
                      <p className="text-[17px] font-bold">Andrew Higdon, DC</p>
                      <p className="mt-1 text-[12px] text-white/55">Founder · Practicing chiropractor</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-7" delay={150}>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">About PhynyxPro</p>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-ink">
                Led by a practicing chiropractor. <span className="text-phoenix">Focused on the handoffs.</span>
              </h1>
              <p className="mt-6 text-[19px] leading-[1.65] text-warm">
                Andrew Higdon, DC, is a practicing chiropractor and the founder of PhynyxPro. His operator perspective shapes a system centered on what happens between first inquiry, appointment request, attendance, and the recorded outcome.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                PhynyxPro is designed to connect advertising, response, booking, reminders, and outcome reporting. PYRO coordinates the workflow, with Ember as the AI receptionist inside the platform.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                The operating principle is simple: make the workflow inspectable, distinguish recorded outcomes from assumptions, and improve the handoffs the business can control.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[500px]">
              What we believe.
            </h2>
          </AnimatedSection>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <AnimatedSection key={v?.title ?? i} delay={i * 100}>
                <div className="rounded-xl bg-ivory p-7 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <v.icon className="h-7 w-7 text-phoenix mb-4" />
                  <h3 className="text-[18px] font-semibold text-ink">{v?.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-warm">{v?.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <Users className="h-8 w-8 text-phoenix mb-4" />
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
                A working model built for clarity.
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-warm">
                The engagement model emphasizes documented responsibilities, visible handoffs, and a shared review cadence so the business and the operating team can work from the same record.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                Platform access, integrations, managed services, and communication paths are defined for each engagement during the diagnostic and documented in the client agreement.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative">
                  <Image src="/images/client-team.jpg" alt="" fill className="object-cover" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-ink">
                    Illustrative workspace
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
              Let&apos;s find out if we&apos;re the right fit.
            </h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check. If there may be a match, continue to a working diagnostic with last month&apos;s acquisition numbers.
            </p>
            <AssessmentCtaLink
              placement="about_final"
              data-cta-placement="about-final"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors"
            >
              Book My Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
            </AssessmentCtaLink>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
