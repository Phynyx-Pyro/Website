'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, ArrowDown, BarChart3, DollarSign, Users, Calendar, TrendingUp, ShieldCheck, Eye } from 'lucide-react'

const funnelSteps = [
  { label: 'Advertising Investment', icon: DollarSign, desc: 'What you spend on campaigns' },
  { label: 'Leads Generated', icon: Users, desc: 'People who express interest' },
  { label: 'Appointment Requests', icon: Calendar, desc: 'Inquiries that become bookings' },
  { label: 'Appointments Attended', icon: ShieldCheck, desc: 'People who actually show up' },
  { label: 'New Patients / Customers', icon: TrendingUp, desc: 'Conversions that generate revenue' },
  { label: 'Attributable Revenue', icon: BarChart3, desc: 'Dollars tied to your investment' },
]

export function ResultsClient() {
  return (
    <main>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">Results</p>
            <h1 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight text-ink max-w-[800px]">
              Documented outcomes.<br /><span className="text-phoenix">Not promises.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[19px] leading-[1.65] text-warm">
              We measure every step from advertising dollar to attributable revenue. If we can&apos;t prove it, we don&apos;t claim it.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-3">Measurement Framework</p>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[600px]">
              Full-funnel attribution. Every dollar accounted for.
            </h2>
            <p className="mt-4 max-w-[540px] text-[17px] leading-[1.65] text-warm">
              Most agencies report on clicks and impressions. We report on the only metric that matters: did your investment produce revenue?
            </p>
          </AnimatedSection>
          <div className="mt-14 max-w-[600px] mx-auto">
            {funnelSteps.map((step, i) => (
              <AnimatedSection key={step?.label ?? i} delay={i * 80}>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ivory shadow-lg shrink-0">
                    <step.icon className="h-6 w-6 text-phoenix" />
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-ink">{step?.label}</p>
                    <p className="text-[13px] text-warm">{step?.desc}</p>
                  </div>
                </div>
                {i < funnelSteps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-phoenix/40" />
                  </div>
                )}
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <Eye className="h-8 w-8 text-phoenix mb-4" />
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Transparency is the methodology.</h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-warm">
                Every client gets access to the same dashboards we use. You see what we spend, what it generates, and where each lead is in the pipeline — in real time.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                We don&apos;t cherry-pick metrics. We don&apos;t aggregate across clients to create misleading averages. Your data is your data, and we report on all of it.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative bg-linen">
                  <Image src="/images/business-owner.jpg" alt="Business owner reviewing growth metrics" fill className="object-cover" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="bg-night grain-dark text-white py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-white text-center">What every client report includes.</h2>
          </AnimatedSection>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Advertising Spend', desc: 'Exact dollar amounts across every platform and campaign.' },
              { title: 'Lead Volume & Source', desc: 'Where leads came from and which campaigns produced them.' },
              { title: 'Response Time', desc: 'How fast each inquiry was contacted — by human or by Ember.' },
              { title: 'Appointment Conversion', desc: 'Leads that became appointment requests, and the percentage that booked.' },
              { title: 'Show Rate', desc: 'How many booked appointments were actually attended.' },
              { title: 'Revenue Attribution', desc: 'Dollars generated, tied back to the specific campaign that started the journey.' },
            ].map((item, i) => (
              <AnimatedSection key={item?.title ?? i} delay={i * 80}>
                <div className="rounded-xl border border-white/10 bg-coal/40 p-6 hover:border-phoenix/30 transition-colors">
                  <h3 className="text-[17px] font-semibold text-white">{item?.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-white/65">{item?.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Ready to see what documented growth looks like?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              A growth assessment shows you exactly where appointments are being lost — and how the system fixes it.
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
