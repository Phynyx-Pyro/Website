'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../../_components/animated-section'
import { Waveform } from '../../../_components/waveform'
import { ArrowRight, Zap, Stethoscope, Clock, Phone, Bot, BarChart3, Users } from 'lucide-react'

const painPoints = [
  { icon: Clock, title: 'Slow Follow-Up', desc: 'New patient inquiries sit for hours or days. By the time someone calls back, the prospect has booked elsewhere.' },
  { icon: Phone, title: 'Missed Calls After Hours', desc: 'Most inquiries come when your front desk is closed. No answer means no appointment.' },
  { icon: Users, title: 'Leads Without Appointments', desc: 'Your ad campaigns generate interest, but interest without a system produces clicks — not patients.' },
  { icon: BarChart3, title: 'No Attribution', desc: 'You know you spent money on marketing. You have no idea which campaigns produced which patients.' },
]

export function ChiropracticClient() {
  return (
    <main>
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
                Built by a chiropractor.<br />
                <span className="text-phoenix">Proven in chiropractic.</span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-[1.65] text-warm">
                Andrew Higdon was — and remains — a practicing chiropractor. He built PhynyxPro after living the same frustration every practice owner knows: leads come in, then quietly slip through the cracks.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/growth-assessment" className="inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
                  Book a Growth Assessment <ArrowRight className="h-4 w-4" />
                </Link>
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
              The problems every chiropractic practice knows.
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
                The PhynyxPro Growth System connects your advertising directly to your appointment calendar. When a new patient inquiry comes in — by phone, chat, or form — Ember responds in seconds. The CRM tracks every interaction. And you see exactly which campaigns produce real patients.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Managed advertising targeting your ideal patients',
                  'Ember AI responds to inquiries 24/7',
                  'Automated follow-up sequences',
                  'CRM pipeline with full attribution',
                  'Database reactivation for past patients',
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
                  <Image src="/images/industry-chiro.jpg" alt="Chiropractic practice growth with PhynyxPro" fill className="object-cover" />
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
              Meet Ember. Your after-hours front desk.
            </h2>
            <p className="mt-4 max-w-[520px] mx-auto text-[17px] leading-[1.65] text-white/70">
              When a potential patient calls after hours, Ember answers. Qualifies them. Books the appointment. Updates your CRM. By morning, you have new patients on your calendar.
            </p>
            <div className="mt-8">
              <Waveform className="justify-center" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <Link href="/pyro-ember" className="mt-10 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              See Ember in Action <ArrowRight className="h-4 w-4" />
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
              A 15-minute growth assessment shows you exactly where patients are being lost and how the system fixes it.
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
