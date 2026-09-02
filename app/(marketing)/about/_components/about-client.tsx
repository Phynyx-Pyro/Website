'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, Heart, Target, Shield, Eye, Users } from 'lucide-react'

const values = [
  { icon: Eye, title: 'Transparency', desc: 'You see the same dashboards we do. No hidden metrics, no cherry-picked results. If we can\'t prove it, we don\'t claim it.' },
  { icon: Target, title: 'Outcomes Over Activity', desc: 'We measure booked appointments and attributable revenue — not impressions, clicks, or vanity metrics.' },
  { icon: Shield, title: 'Selective Partnership', desc: 'We add friction on purpose. PhynyxPro works best with established businesses serious about systems, not anyone with a credit card.' },
  { icon: Heart, title: 'Operator Empathy', desc: 'Our founder runs a practice. We understand the daily reality of appointment-driven businesses because we live it.' },
]

export function AboutClient() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <AnimatedSection className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[3/4] relative">
                  <Image src="/images/founder.jpg" alt="Andrew Higdon, founder of PhynyxPro and practicing chiropractor" fill className="object-cover" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-7" delay={150}>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">About PhynyxPro</p>
              <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-tight text-ink">
                Built by a chiropractor who <span className="text-phoenix">lived the problems.</span>
              </h1>
              <p className="mt-6 text-[19px] leading-[1.65] text-warm">
                Andrew Higdon was — and remains — a practicing chiropractor. He built PhynyxPro after experiencing the same frustration every practice owner knows: leads come in, then quietly slip through the cracks.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                After years of hiring agencies that delivered reports but not patients, Andrew built the system he wished existed — one that connects advertising directly to booked appointments, with AI handling the follow-up that humans consistently miss.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                Today, PhynyxPro serves appointment-driven businesses across multiple industries, but the philosophy remains the same: document everything, prove what works, and never claim what you can\'t verify.
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
                Small team. Deep expertise.
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-warm">
                PhynyxPro is deliberately small. We don\'t scale by adding account managers who don\'t understand your business. We scale by building systems that work without manual intervention.
              </p>
              <p className="mt-4 text-[17px] leading-[1.65] text-warm">
                Every client works directly with the team that builds and manages their system. No handoffs between departments. No layers of communication. Direct access to the people doing the work.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="relative rounded-xl overflow-hidden shadow-lift">
                <div className="aspect-[4/3] relative">
                  <Image src="/images/client-team.jpg" alt="PhynyxPro team collaboration" fill className="object-cover" />
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
              We\'re selective about who we work with — not because we\'re exclusive, but because the system works best for businesses that are ready for it.
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
