'use client'

import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'
import { ArrowRight, ArrowDown, BarChart3, DollarSign, Users, Calendar, TrendingUp, ShieldCheck, Eye } from 'lucide-react'

const funnelSteps = [
  { label: 'Advertising Investment', icon: DollarSign, desc: 'What you spend on campaigns' },
  { label: 'Leads Generated', icon: Users, desc: 'People who express interest' },
  { label: 'Appointment Requests', icon: Calendar, desc: 'Inquiries that take a scheduling step' },
  { label: 'Confirmed Appointments', icon: ShieldCheck, desc: 'Requests with a booked time recorded' },
  { label: 'Appointments Attended', icon: Eye, desc: 'Confirmed appointments recorded as attended' },
  { label: 'Recorded Customers / Outcomes', icon: TrendingUp, desc: 'Recorded care or service outcomes' },
  { label: 'Revenue Context', icon: BarChart3, desc: 'Recorded revenue associated with available source data' },
]

export function ResultsClient() {
  return (
    <div>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">Measurement Approach</p>
            <h1 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight text-ink max-w-[800px]">
              See the full journey.<br /><span className="text-phoenix">Not just the first click.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[19px] leading-[1.65] text-warm">
              PhynyxPro connects available campaign, response, appointment, and outcome data so your team can see where follow-up needs attention.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-3">Measurement Framework</p>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink max-w-[600px]">
              From campaign spend to recorded outcomes.
            </h2>
            <p className="mt-4 max-w-[540px] text-[17px] leading-[1.65] text-warm">
              Clicks and impressions are only the beginning. We connect early indicators to appointment and revenue outcomes when the underlying data is available.
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
                Connected reporting keeps available spend, lead, appointment, and outcome data visible in one place.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                The reporting approach keeps first-touch metrics and downstream outcomes visible together, using the records available from your connected systems.
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
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-white text-center">What the reporting view is designed to include.</h2>
          </AnimatedSection>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Advertising Spend', desc: 'Available spend by connected platform and campaign.' },
              { title: 'Lead Volume & Source', desc: 'Available source and campaign records for captured leads.' },
              { title: 'Response Time', desc: 'Response-time records for inquiries on connected channels.' },
              { title: 'Request Rate', desc: 'How many captured leads took an appointment-request step.' },
              { title: 'Confirmation Rate', desc: 'How many appointment requests became confirmed bookings.' },
              { title: 'Show Rate', desc: 'How many confirmed appointments were recorded as attended.' },
              { title: 'Revenue Context', desc: 'Recorded revenue associated with available source and campaign data.' },
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
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Ready to map your current acquisition path?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check. If aligned, bring last month&apos;s spend, leads, requests, completed appointments or jobs, and recorded outcomes to the working diagnostic.
            </p>
            <AssessmentCtaLink placement="results_final" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Book My Acquisition Diagnostic <ArrowRight className="h-4 w-4" />
            </AssessmentCtaLink>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
