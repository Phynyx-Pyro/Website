'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight } from 'lucide-react'

const industries = [
  {
    num: '01',
    title: 'Chiropractic',
    desc: 'Where PhynyxPro proved the model.',
    href: '/industries/chiropractic',
    image: '/images/industry-chiro.jpg',
    proven: true,
    large: true,
  },
  {
    num: '02',
    title: 'Home Services',
    desc: 'Roofing, plumbing, HVAC \u2014 fill your calendar, not just your inbox.',
    href: '/industries/home-services',
    image: '/images/industry-home.jpg',
    proven: false,
    large: false,
  },
  {
    num: '03',
    title: 'Dental & Medspa',
    desc: 'More patients. Faster follow-up. Measurable growth.',
    href: '/industries/dental-medspa',
    image: '/images/industry-dental.jpg',
    proven: false,
    large: false,
  },
  {
    num: '04',
    title: 'Other Services',
    desc: 'If your business runs on appointments, we should talk.',
    href: '/industries',
    image: '/images/industry-other.jpg',
    proven: false,
    large: false,
  },
]

export function IndustryPathways() {
  return (
    <section className="relative overflow-hidden py-14 lg:py-[92px]">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <AnimatedSection>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">Industry pathways</p>
          <h2 className="max-w-[700px] text-[36px] lg:text-[52px] font-bold leading-[.96] tracking-[-.042em]">
            Proven in chiropractic. Built for every appointment-driven business.
          </h2>
        </AnimatedSection>

        <div className="mt-8 lg:mt-12">
          {/* Desktop: staggered grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {industries?.map((ind: any, i: number) => (
              <AnimatedSection key={ind?.title} delay={i * 100}>
                <Link href={ind?.href}>
                  <article className={`group relative overflow-hidden rounded-2xl bg-white lift-sm hover:lift transition-all ${
                    i === 0 ? '' : i === 1 ? 'mt-4' : i === 2 ? '-mt-2' : 'mt-8'
                  }`}>
                    <div className="relative h-[236px] overflow-hidden">
                      <Image src={ind?.image} alt={ind?.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      {ind?.large && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                      )}
                    </div>
                    {ind?.proven && (
                      <span className="absolute right-3 top-3 rounded-full bg-phoenix px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white">
                        Proven
                      </span>
                    )}
                    <div className="p-6">
                      <p className="text-[10.5px] font-bold uppercase tracking-[.14em] text-phoenix">Pathway {ind?.num}</p>
                      <h3 className="mt-1.5 text-[24px] font-bold tracking-[-.03em]">{ind?.title}</h3>
                      <p className="mt-2 text-[13.5px] leading-snug text-warm">{ind?.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-phoenix">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {/* Mobile: stacked */}
          <div className="lg:hidden space-y-4">
            {/* Chiropractic - large */}
            <AnimatedSection>
              <Link href={industries?.[0]?.href ?? '/industries/chiropractic'}>
                <article className="relative overflow-hidden rounded-2xl bg-ink lift">
                  <div className="relative h-[240px]">
                    <Image src="/images/industry-chiro.jpg" alt="Chiropractic" fill className="object-cover opacity-85" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-phoenix px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white">Proven</span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[9.5px] font-bold uppercase tracking-[.14em] text-flame">Pathway 01</p>
                    <h3 className="mt-1 text-[23px] font-bold tracking-[-.03em] text-white">Chiropractic</h3>
                    <p className="mt-1 text-[13px] text-white/80">Where PhynyxPro proved the model.</p>
                  </div>
                </article>
              </Link>
            </AnimatedSection>

            {/* Grid: home services + dental */}
            <div className="grid grid-cols-2 gap-4">
              {industries?.slice(1, 3)?.map((ind: any, i: number) => (
                <AnimatedSection key={ind?.title} delay={(i + 1) * 100}>
                  <Link href={ind?.href}>
                    <article className={`overflow-hidden rounded-2xl border border-black/10 bg-white lift-sm ${i === 1 ? 'mt-5' : ''}`}>
                      <div className="relative h-[124px]">
                        <Image src={ind?.image} alt={ind?.title} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] font-bold uppercase tracking-[.14em] text-phoenix">Pathway {ind?.num}</p>
                        <h3 className="mt-1 text-[17px] font-bold tracking-[-.03em]">{ind?.title}</h3>
                        <p className="mt-1 text-[12px] leading-snug text-warm">{ind?.desc}</p>
                      </div>
                    </article>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            {/* Other */}
            <AnimatedSection delay={300}>
              <Link href="/industries">
                <article className="flex items-center gap-4 overflow-hidden rounded-2xl border border-black/10 bg-white p-4 lift-sm">
                  <div className="relative h-[86px] w-[86px] shrink-0 rounded-xl overflow-hidden">
                    <Image src="/images/industry-other.jpg" alt="Other services" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.14em] text-phoenix">Pathway 04</p>
                    <h3 className="mt-1 text-[18px] font-bold tracking-[-.03em]">Other Services</h3>
                    <p className="mt-1 text-[12.5px] leading-snug text-warm">If your business runs on appointments, we should talk.</p>
                  </div>
                </article>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
