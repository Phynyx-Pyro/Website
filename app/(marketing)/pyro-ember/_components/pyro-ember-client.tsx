'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'
import { Waveform } from '../../_components/waveform'
import { ArrowRight, Bot, Phone, MessageSquare, CalendarCheck, BarChart3, Database, Clock, Shield, Headphones } from 'lucide-react'

const features = [
  { icon: Phone, title: 'AI Voice Agent', desc: 'Ember can support configured inbound-call workflows, gather approved details, and route appointment requests.' },
  { icon: MessageSquare, title: 'AI Chat & SMS', desc: 'Configured inbound and transactional SMS and chat workflows can gather approved details and coordinate appointment requests, with defined staff handoff rules.' },
  { icon: CalendarCheck, title: 'Appointment Coordination', desc: 'Connect approved calendars and scheduling rules so Ember can capture preferences or appointment requests; the configured calendar or staff workflow handles confirmation.' },
  { icon: Database, title: 'Database Reactivation', desc: 'Permission-based outreach can be configured only for eligible existing contacts with recorded channel consent and no opt-out.' },
  { icon: BarChart3, title: 'CRM & Pipeline', desc: 'Track connected leads from first touch through recorded appointment outcomes in one working view.' },
  { icon: Shield, title: 'Attribution Engine', desc: 'Connect available campaign, contact, and outcome data so the team can review where inquiries move or stall.' },
]

const chatDemo = [
  { from: 'prospect', text: 'Hi, I saw your ad. Do you have any openings this week?' },
  { from: 'ember', text: 'Welcome! I can capture a scheduling preference for the team. Are you looking for a morning or afternoon appointment?' },
  { from: 'prospect', text: 'Afternoon works better. Thursday or Friday if possible.' },
  { from: 'ember', text: 'I can submit a request for Thursday afternoon or Friday afternoon. Which would you prefer?' },
  { from: 'prospect', text: 'Thursday afternoon, please.' },
  { from: 'ember', text: 'I\'ve captured that request. The team can confirm the available time and next steps.' },
]

export function PyroEmberClient() {
  return (
    <div>
      {/* Hero — Dark cinema */}
      <section className="bg-night grain-dark text-white pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix mb-4">PYRO by PhynyxPro</p>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-white">
                Meet <span className="text-phoenix">Ember.</span><br />
                Your AI receptionist.
              </h1>
              <p className="mt-6 max-w-[480px] text-[19px] leading-[1.65] text-white/70">
                Ember handles approved inquiries and scheduling requests. PYRO keeps the record, follow-up, and team handoff connected.
              </p>
              <div className="mt-8" aria-hidden="true">
                <Waveform className="opacity-60" />
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <AssessmentCtaLink placement="pyro_hero" className="inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                  Book My Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
                </AssessmentCtaLink>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              {/* Ember portrait grounded into the conversation card */}
              <div className="relative mx-auto max-w-[500px] lg:mr-0">
                {/* Soft glow disc behind Ember */}
                <div className="pointer-events-none absolute left-1/2 top-0 aspect-square w-full max-w-[360px] -translate-x-1/2 rounded-full bg-phoenix/[.14] blur-[80px]" />
                <div className="pointer-events-none absolute left-1/2 top-4 aspect-square w-full max-w-[300px] -translate-x-1/2 rounded-full border border-white/[.06]" />

                {/* Ember + name tag */}
                <div className="relative flex justify-center">
                  <div className="relative w-full max-w-[320px] sm:max-w-[380px]">
                    <div className="relative aspect-square w-full drop-shadow-[0_28px_44px_rgba(0,0,0,.42)]">
                      <Image
                        src="/images/ember-human-transparent.png"
                        alt="Ember, the PYRO AI voice and chat receptionist"
                        fill
                        priority
                        sizes="(min-width: 640px) 380px, 320px"
                        className="object-contain object-bottom"
                        style={{
                          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
                          maskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
                        }}
                      />
                    </div>
                    {/* Name tag */}
                    <div className="absolute left-2 top-3 flex items-center gap-2 rounded-full border border-phoenix/30 bg-night/70 px-3.5 py-1.5 backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-phoenix" />
                      <span className="text-[12px] font-semibold text-white">Ember</span>
                      <span className="text-[11px] text-phoenix">Illustrative</span>
                    </div>
                  </div>
                </div>

                {/* Conversation card — overlaps the portrait fade, not her face */}
                <div className="relative z-10 mx-auto -mt-10 w-full max-w-[300px] sm:max-w-[340px] rounded-2xl border border-white/12 bg-coal/90 backdrop-blur-md p-4 shadow-2xl">
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-phoenix/20">
                      <Bot className="h-4 w-4 text-phoenix" />
                    </div>
                    <p className="text-[13px] font-semibold text-white">Example SMS workflow</p>
                    <span className="ml-auto text-[10px] text-white/45">Sample</span>
                  </div>
                  <div className="space-y-2.5">
                    {chatDemo.slice(0, 3).map((msg, i) => (
                      <div key={i} className={`flex ${msg?.from === 'ember' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[86%] rounded-xl px-3 py-2 text-[12px] leading-[1.5] ${
                          msg?.from === 'ember'
                            ? 'bg-phoenix/15 text-phoenix'
                            : 'bg-white/10 text-white/80'
                        }`}>
                          {msg?.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[600px]">
              How PYRO supports the acquisition workflow.
            </h2>
            <p className="mt-4 max-w-[540px] text-[17px] leading-[1.65] text-warm">
              PYRO is the operating platform inside the PhynyxPro system. Ember is the AI receptionist inside PYRO.
            </p>
          </AnimatedSection>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f?.title ?? i} delay={i * 80}>
                <div className="rounded-xl bg-linen p-6 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <f.icon className="h-7 w-7 text-phoenix mb-4" />
                  <h3 className="text-[17px] font-semibold text-ink">{f?.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.6] text-warm">{f?.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Demo */}
      <section className="bg-night grain-dark text-white py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <Headphones className="h-8 w-8 text-phoenix mb-4" />
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-white">
                Designed for natural conversation.<br />Built for clear handoff.
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-white/70">
                Ember can support configured inbound call flows, gather approved details, and route conversations to staff when human judgment is needed.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-white/70">
                When enabled, call summaries and recorded outcomes can be written to connected systems. Recording and transcription depend on business settings and applicable requirements.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="rounded-2xl border border-white/10 bg-coal/60 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-phoenix/40">
                    <Image src="/images/ember-human-avatar-transparent.png" alt="Ember" fill sizes="40px" className="object-cover" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white leading-tight">Ember</p>
                    <p className="text-[11px] text-white/50">Illustrative call workflow</p>
                  </div>
                  <span className="ml-auto text-[11px] text-white/50">Example</span>
                </div>
                <div aria-hidden="true">
                  <Waveform className="justify-center" />
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] text-white/50">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Configured route: Ember</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-phoenix/80">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>Example outcome: appointment request captured</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <div className="max-w-[600px] mx-auto text-center">
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-3">How access works</p>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
                Configured around the workflow.
              </h2>
              <div className="mt-8 rounded-2xl bg-ivory p-8 shadow-xl">
                <p className="text-[28px] font-bold text-ink">PYRO is deployed as part of PhynyxPro.</p>
                <p className="mt-4 text-[15px] leading-[1.6] text-warm">
                  Platform scope, integrations, and managed services are reviewed during the diagnostic and defined in the client agreement.
                </p>
                <div className="mt-6 pt-6 border-t border-ink/10">
                  <p className="text-[13px] text-warm">The diagnostic maps the current stack, required handoffs, and implementation scope before any agreement.</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
              Map PYRO and Ember into your current handoffs.
            </h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check. If the business may be a fit, the next step is a working diagnostic to review the current journey and next steps.
            </p>
            <AssessmentCtaLink placement="pyro_final" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Book My Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
            </AssessmentCtaLink>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
