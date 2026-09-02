'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, Stethoscope, Wrench, Smile, Building2 } from 'lucide-react'

const industries = [
  {
    slug: '/industries/chiropractic',
    title: 'Chiropractic',
    tagline: 'Where PhynyxPro proved the model.',
    desc: 'Built by a practicing chiropractor who experienced the same follow-up failures every practice owner knows. Chiropractic is where the system was born.',
    image: '/images/industry-chiro.jpg',
    icon: Stethoscope,
    proof: 'Proven',
  },
  {
    slug: '/industries/home-services',
    title: 'Home Services',
    tagline: 'Fill your calendar, not just your inbox.',
    desc: 'Roofing, plumbing, HVAC — service businesses that run on booked jobs. The same system that converts patients converts customers.',
    image: '/images/industry-home.jpg',
    icon: Wrench,
    proof: 'Built for',
  },
  {
    slug: '/industries/dental-medspa',
    title: 'Dental & Medspa',
    tagline: 'More patients. Faster follow-up. Measurable growth.',
    desc: 'High-value appointments, competitive markets, and patients who expect instant communication. PhynyxPro delivers all three.',
    image: '/images/industry-dental.jpg',
    icon: Smile,
    proof: 'Built for',
  },
  {
    slug: '/growth-assessment',
    title: 'Other Service Businesses',
    tagline: 'If your business runs on appointments, we should talk.',
    desc: 'The PhynyxPro Growth System works for any appointment-driven business. Tell us about yours.',
    image: '/images/industry-other.jpg',
    icon: Building2,
    proof: 'Expanding',
  },
]

export function IndustriesHubClient() {
  return (
    <main>
      <section className="bg-ivory grain-subtle pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <AnimatedSection>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-warm mb-4">Industries</p>
            <h1 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight text-ink max-w-[800px]">
              Proven in chiropractic.<br />
              <span className="text-phoenix">Built for every appointment-driven business.</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[19px] leading-[1.65] text-warm">
              The PhynyxPro Growth System was born in chiropractic — and built to scale across every industry where booked appointments mean revenue.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-linen py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-8">
            {industries.map((ind, i) => (
              <AnimatedSection key={ind?.title ?? i} delay={i * 120}>
                <Link href={ind?.slug ?? '#'} className="group block h-full">
                  <div className="relative h-full rounded-xl overflow-hidden bg-ivory shadow-lg hover:shadow-xl transition-all">
                    <div className="aspect-[16/9] relative">
                      <Image src={ind?.image ?? ''} alt={ind?.title ?? 'Industry'} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                          <ind.icon className="h-3.5 w-3.5" />
                          {ind?.proof}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-[22px] font-semibold text-ink group-hover:text-phoenix transition-colors">{ind?.title}</h3>
                      <p className="mt-1 text-[15px] font-medium text-phoenix">{ind?.tagline}</p>
                      <p className="mt-3 text-[14.5px] leading-[1.6] text-warm">{ind?.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-phoenix group-hover:gap-2 transition-all">
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory grain-subtle py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <AnimatedSection>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.15] text-ink">Not sure if PhynyxPro is right for your industry?</h2>
            <p className="mt-4 max-w-[500px] mx-auto text-[17px] leading-[1.65] text-warm">
              If your business runs on booked appointments, we should talk. A growth assessment takes 15 minutes and costs nothing.
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
