'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { Waveform } from '../../_components/waveform'
import { ArrowRight, Bot, Phone, MessageSquare, CalendarCheck, BarChart3, Database, Clock, Shield, Headphones } from 'lucide-react'

const features = [
  { icon: Phone, title: 'AI Voice Agent', desc: 'Ember answers calls with a natural voice, qualifies prospects, and books appointments — 24 hours a day, 7 days a week.' },
  { icon: MessageSquare, title: 'AI Chat & SMS', desc: 'Instant text-based conversations that qualify, nurture, and convert — across SMS, web chat, and social messaging.' },
  { icon: CalendarCheck, title: 'Automated Booking', desc: 'Direct calendar integration. Ember doesn\'t just capture interest — it books the appointment and confirms it.' },
  { icon: Database, title: 'Database Reactivation', desc: 'Re-engage past patients and customers who haven\'t booked in months. Automated, personalized outreach at scale.' },
  { icon: BarChart3, title: 'CRM & Pipeline', desc: 'Every lead tracked from first touch to booked appointment. Full pipeline visibility with automated stage management.' },
  { icon: Shield, title: 'Attribution Engine', desc: 'Know exactly which campaigns produce which appointments. Tie every dollar spent to revenue generated.' },
]

const chatDemo = [
  { from: 'patient', text: 'Hi, I saw your ad for the new patient special. Do you have any openings this week?' },
  { from: 'ember', text: 'Welcome! Yes, we have several openings. To help find the best time for you — are you looking for a morning or afternoon appointment?' },
  { from: 'patient', text: 'Afternoon works better. Thursday or Friday if possible.' },
  { from: 'ember', text: 'I have Thursday at 2:30 PM and Friday at 3:00 PM available. Which would you prefer?' },
  { from: 'patient', text: 'Thursday at 2:30 please.' },
  { from: 'ember', text: 'You\'re all set for Thursday at 2:30 PM. I\'ll send a confirmation text with all the details. Is there anything else I can help with?' },
]

export function PyroEmberClient() {
  return (
    <main>
      {/* Hero — Dark cinema */}
      <section className="bg-night grain-dark text-white pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix mb-4">PYRO by PhynyxPro</p>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-white">
                Meet <span className="text-phoenix">Ember.</span><br />
                Your AI employee.
              </h1>
              <p className="mt-6 max-w-[480px] text-[19px] leading-[1.65] text-white/70">
                Ember answers calls, responds to texts, qualifies prospects, and books appointments — instantly, accurately, and around the clock. Part of the PYRO revenue operations platform.
              </p>
              <div className="mt-8">
                <Waveform className="opacity-60" />
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/growth-assessment" className="inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                  Book a Growth Assessment <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              {/* Ember floating portrait (transparent) + conversation card, side by side */}
              <div className="relative mx-auto max-w-[500px] lg:mr-0">
                {/* Soft glow disc behind Ember */}
                <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-phoenix/[.14] blur-[80px]" />
                <div className="pointer-events-none absolute right-4 top-4 h-[300px] w-[300px] rounded-full border border-white/[.06]" />

                {/* Ember + name tag */}
                <div className="relative flex justify-end">
                  <div className="relative w-[320px] sm:w-[380px]">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-white/10 bg-black/40 shadow-2xl">
                      <Image
                        src="/images/ember-human-headset.jpg"
                        alt="Ember, the PYRO AI voice and chat receptionist"
                        fill
                        priority
                        sizes="(min-width: 640px) 380px, 320px"
                        className="object-cover object-center"
                      />
                    </div>
                    {/* Name tag */}
                    <div className="absolute left-2 top-3 flex items-center gap-2 rounded-full border border-phoenix/30 bg-night/70 px-3.5 py-1.5 backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[12px] font-semibold text-white">Ember</span>
                      <span className="text-[11px] text-phoenix">Online</span>
                    </div>
                  </div>
                </div>

                {/* Conversation card — sits below Ember, not over her face */}
                <div className="relative -mt-6 w-[300px] sm:w-[340px] rounded-2xl border border-white/12 bg-coal/90 backdrop-blur-md p-4 shadow-2xl">
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-phoenix/20">
                      <Bot className="h-4 w-4 text-phoenix" />
                    </div>
                    <p className="text-[13px] font-semibold text-white">Live conversation</p>
                    <span className="ml-auto text-[10px] text-white/45">SMS</span>
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
              Everything PYRO does for your business.
            </h2>
            <p className="mt-4 max-w-[540px] text-[17px] leading-[1.65] text-warm">
              PYRO is the revenue operations engine inside the PhynyxPro Growth System. Ember is the AI employee that lives inside PYRO.
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
                Sounds human.<br />Works like a machine.
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-white/70">
                Ember\'s voice agent handles inbound calls with natural conversation. Callers don\'t realize they\'re speaking with AI until you tell them.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-white/70">
                Every call is recorded, transcribed, and logged in your CRM. Full visibility into what was said, what was booked, and what needs follow-up.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="rounded-2xl border border-white/10 bg-coal/60 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-phoenix/40">
                    <Image src="/images/ember-human-avatar.jpg" alt="Ember" fill sizes="40px" className="object-cover" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white leading-tight">Ember</p>
                    <p className="text-[11px] text-white/50">Active voice call</p>
                  </div>
                  <span className="ml-auto text-[13px] text-white/50">2:34</span>
                </div>
                <Waveform className="justify-center" />
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] text-white/50">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Call answered in 0.8 seconds</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-phoenix/80">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>Appointment booked: Thursday 2:30 PM</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <div className="max-w-[600px] mx-auto text-center">
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-3">PYRO Pricing</p>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">
                One platform. One price.
              </h2>
              <div className="mt-8 rounded-2xl bg-ivory p-8 shadow-xl">
                <p className="text-[48px] font-bold text-ink">$297<span className="text-[20px] font-normal text-warm">/mo</span></p>
                <p className="mt-2 text-[13px] font-medium text-phoenix">Legacy rate — locked for current clients</p>
                <p className="mt-4 text-[15px] leading-[1.6] text-warm">
                  Includes PYRO CRM, Ember AI voice and chat, automated workflows, pipeline management, database reactivation, and full attribution reporting.
                </p>
                <div className="mt-6 pt-6 border-t border-ink/10">
                  <p className="text-[13px] text-warm">PYRO is included as part of the PhynyxPro Growth System. Platform access is $297/mo. Managed services are quoted separately based on scope.</p>
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
              See Ember in action for your business.
            </h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Book a growth assessment and we\'ll show you exactly how Ember and PYRO would work in your business.
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
