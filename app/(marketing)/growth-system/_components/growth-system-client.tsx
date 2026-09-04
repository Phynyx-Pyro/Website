'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { Target, MessageSquare, BarChart3, ArrowRight, Zap, Calendar, TrendingUp, Users, Bot, LineChart } from 'lucide-react'

const pipeline = [
  { label: 'Attract', icon: Target, desc: 'People discover your business' },
  { label: 'Respond', icon: MessageSquare, desc: 'Ember engages instantly' },
  { label: 'Request', icon: Calendar, desc: 'Appointment is booked' },
  { label: 'Track', icon: LineChart, desc: 'Attribution is documented' },
  { label: 'Reactivate', icon: Users, desc: 'Past leads re-engage' },
  { label: 'Improve', icon: TrendingUp, desc: 'System gets smarter' },
]

export function GrowthSystemClient() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">The Growth System</p>
            <h1 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight text-ink max-w-[800px]">
              One connected system.<br />
              <span className="text-phoenix">Three outcomes.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[19px] leading-[1.65] text-warm">
              Most agencies sell isolated tactics. PhynyxPro connects advertising, follow-up, and operations into a single system where every piece reinforces the others.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Visibility Pipeline */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-3">Visibility At Every Stage</p>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[600px]">
              From first impression to booked appointment — and beyond.
            </h2>
          </AnimatedSection>

          <div className="mt-14 relative">
            <div className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-px bg-phoenix/20" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {pipeline.map((step, i) => (
                <AnimatedSection key={step?.label ?? i} delay={i * 100}>
                  <div className="relative text-center group">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-ivory shadow-lg group-hover:shadow-xl transition-shadow">
                      <step.icon className="h-8 w-8 text-phoenix" />
                    </div>
                    <p className="mt-4 text-[15px] font-semibold text-ink">{step?.label}</p>
                    <p className="mt-1 text-[13px] text-warm leading-[1.5]">{step?.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 1: Attract */}
      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <AnimatedSection className="lg:col-span-7">
              <div className="relative rounded-xl overflow-hidden shadow-lift bg-linen">
                <div className="aspect-[16/10] relative">
                  <Image src="/images/ad-creative.jpg" alt="PhynyxPro managed advertising campaign creative" fill className="object-cover" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                  {[{ label: 'Impressions', val: '24.8K' }, { label: 'Clicks', val: '1,420' }, { label: 'Cost/Lead', val: '$12.30' }].map((m) => (
                    <div key={m?.label} className="flex-1 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-center shadow">
                      <p className="text-[18px] font-bold text-ink">{m?.val}</p>
                      <p className="text-[11px] text-warm">{m?.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-5" delay={150}>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Pillar One</p>
              </div>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Attract</h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-warm">
                Managed advertising, offer strategy, and creative — built for your market. We handle the campaigns that put your business in front of people actively searching for what you offer.
              </p>
              <ul className="mt-6 space-y-3">
                {['Paid search & social campaigns', 'Offer strategy & ad creative', 'Landing pages built to convert', 'Budget optimization & scaling'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-ink">
                    <Zap className="h-4 w-4 text-phoenix mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pillar 2: Convert */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <AnimatedSection className="lg:col-span-5 order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Pillar Two</p>
              </div>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Convert</h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-warm">
                CRM, automated follow-up, and appointment workflows that turn interest into bookings. Every inquiry gets a response in seconds — not hours.
              </p>
              <ul className="mt-6 space-y-3">
                {['CRM pipeline management', 'Automated SMS & email follow-up', 'AI-powered instant response (Ember)', 'Appointment booking workflows'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-ink">
                    <Zap className="h-4 w-4 text-phoenix mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-7 order-1 lg:order-2" delay={150}>
              <div className="relative rounded-xl overflow-hidden shadow-lift bg-ivory">
                <div className="aspect-[16/10] relative">
                  <Image src="/images/ember-human-headset.jpg" alt="Ember handling lead qualification and appointment booking" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-top" />
                </div>
                <div className="absolute bottom-4 right-4 w-[260px] rounded-xl bg-night/90 backdrop-blur-md p-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-4 w-4 text-phoenix" />
                    <p className="text-[12px] font-semibold text-phoenix">Ember AI</p>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-white/10 px-3 py-2 text-[12px] text-white/80">Hi! I&apos;d like to book a new patient exam.</div>
                    <div className="rounded-lg bg-phoenix/20 px-3 py-2 text-[12px] text-phoenix/90">Absolutely! I have openings this Thursday at 10am or 2pm. Which works best?</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pillar 3: Operate & Scale */}
      <section className="bg-night grain-dark text-white py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <AnimatedSection className="lg:col-span-7">
              <div className="relative rounded-xl overflow-hidden bg-coal/50 border border-white/10 shadow-xl">
                <div className="aspect-[16/10] relative">
                  <Image src="/images/business-owner.jpg" alt="Revenue operations dashboard and reporting" fill className="object-cover opacity-60" />
                </div>
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="flex gap-3 w-full">
                    {[{ label: 'Revenue Attributed', val: '$184K' }, { label: 'ROAS', val: '6.2x' }, { label: 'Appointments', val: '312' }].map((m) => (
                      <div key={m?.label} className="flex-1 rounded-lg bg-coal/80 backdrop-blur border border-white/10 px-3 py-3 text-center">
                        <p className="text-[20px] font-bold text-phoenix">{m?.val}</p>
                        <p className="text-[11px] text-white/60">{m?.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-5" delay={150}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-phoenix" />
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">Pillar Three</p>
              </div>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-white">Operate & Scale</h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-white/70">
                AI employees, database reactivation, systems coaching, and attribution that proves ROI. Know exactly which dollar produced which patient.
              </p>
              <ul className="mt-6 space-y-3">
                {['PYRO CRM & automation platform', 'Ember AI voice & chat employees', 'Database reactivation campaigns', 'Full-funnel attribution reporting'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-white/90">
                    <Zap className="h-4 w-4 text-phoenix mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">The system is the advantage.</h2>
            <p className="mt-5 max-w-[580px] mx-auto text-[17px] leading-[1.65] text-warm">
              Isolated tactics create isolated results. When advertising, follow-up, and operations share the same data and the same strategy, every piece makes the others more effective.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/growth-assessment" className="inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                Book a Growth Assessment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/results" className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                See Results
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}
