'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SmallWaveform } from '../../_components/waveform'
import { AnimatedSection } from '../../_components/animated-section'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-4 pt-[84px]">
      {/* Background hero image - desktop */}
      <div className="pointer-events-none absolute right-0 top-0 h-[700px] w-[880px] hidden lg:block">
        <Image
          src="/images/hero-chiro.jpg"
          alt="Chiropractor adjusting a patient in a modern clinic"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Copy */}
          <div className="lg:col-span-5 pt-6 lg:pt-14">
            <AnimatedSection>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-phoenix/30 bg-phoenix/[.07] px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-phoenix animate-blink" />
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-phoenix">
                  Proof-led growth system
                </span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-[43px] lg:text-[76px] font-bold leading-[.94] tracking-[-.042em]">
                More booked{' '}
                <br className="hidden lg:block" />
                appointments.
                <br />
                <span className="relative inline-block">
                  Fewer missed
                  <span className="absolute -bottom-1 left-0 h-[10px] w-full rounded-full bg-phoenix/25" />
                </span>
                <br />
                opportunities.
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mt-7 max-w-[430px] text-[16px] lg:text-[18px] leading-[1.6] text-warm">
                PhynyxPro builds the demand, the conversion infrastructure, and the
                revenue operations that turn interest into a full calendar — and
                proves what it produced.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                <Link
                  href="/growth-assessment"
                  className="group flex items-center gap-3 rounded-lg bg-ink px-7 py-4 text-[15px] font-semibold text-white lift-sm hover:bg-coal transition-colors"
                >
                  Book a Growth Assessment
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/pyro-ember" className="flex items-center gap-2.5 text-[15px] font-semibold text-phoenix">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-phoenix/40">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  See the System in Action
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <ul className="mt-10 grid max-w-[430px] grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[14.5px] font-medium">
                {[
                  'Attract the right demand',
                  'Qualify with clarity',
                  'Convert to appointments',
                  'Systemize repeatability',
                ].map((item: string) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <svg className="w-3 h-3 text-phoenix shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>

          {/* Right column - Visual composition */}
          <div className="lg:col-span-7 relative h-[430px] lg:h-[600px] mt-8 lg:mt-0">
            {/* Mobile hero image */}
            <div className="lg:hidden absolute inset-0">
              <Image
                src="/images/hero-chiro.jpg"
                alt="Chiropractor adjusting a patient"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-ivory/70 via-transparent to-ivory rounded-2xl" />
            </div>

            {/* Video frame */}
            <AnimatedSection delay={200} className="absolute right-0 lg:right-[92px] top-[30px] lg:top-[62px] w-[260px] lg:w-[540px] z-10">
              <div className="overflow-hidden rounded-[14px] border border-black/10 bg-ink lift">
                <div className="relative">
                  <div className="relative h-[140px] lg:h-[304px]">
                    <Image src="/images/video-still.jpg" alt="PhynyxPro system walkthrough" fill className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <button className="absolute left-1/2 top-1/2 flex h-11 lg:h-[62px] w-11 lg:w-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-phoenix text-white shadow-[0_0_0_10px_rgba(255,107,53,.18)]">
                    <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  <span className="text-[11px] font-medium text-white/70">0:18 / 1:36</span>
                  <span className="relative mx-1 h-[3px] flex-1 rounded-full bg-white/20">
                    <span className="absolute inset-y-0 left-0 w-[19%] rounded-full bg-phoenix" />
                    <span className="absolute -top-[3px] left-[19%] h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-phoenix" />
                  </span>
                </div>
              </div>
            </AnimatedSection>

            {/* Live pipeline card */}
            <AnimatedSection delay={300} className="hidden lg:block absolute left-[18px] top-[14px] z-20">
              <div className="rotate-[-3deg] rounded-lg border border-black/10 bg-white/90 px-3.5 py-2 backdrop-blur lift-sm">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-warm">Live pipeline</p>
                <p className="text-[15px] font-bold">14 appointments booked this week</p>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Artifact strip - desktop */}
        <div className="hidden lg:flex relative z-30 mt-6 items-start justify-center">
          {/* Campaign creative card */}
          <AnimatedSection delay={400}>
            <div className="w-[218px] -rotate-[2deg] overflow-hidden rounded-xl border border-black/10 bg-white lift">
              <p className="border-b border-black/5 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-warm">Campaign creative</p>
              <div className="relative m-3 overflow-hidden rounded-lg">
                <div className="relative h-[152px]">
                  <Image src="/images/ad-creative.jpg" alt="Campaign ad creative" fill className="object-cover" />
                </div>
                <div className="p-3 bg-ink">
                  <p className="text-[13px] font-bold leading-tight text-white">Back pain shouldn&apos;t run your life.</p>
                  <span className="mt-2 inline-block w-fit rounded bg-phoenix px-2.5 py-1 text-[9.5px] font-bold text-white">Book Your Visit</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3.5 pb-3 text-[10.5px] font-medium text-warm">
                <span>Meta · Local radius</span>
                <span className="font-bold text-phoenix">CTR 4.1%</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Landing page card */}
          <AnimatedSection delay={500}>
            <div className="-ml-6 mt-6 w-[210px] rotate-[1.5deg] overflow-hidden rounded-xl border border-black/10 bg-white lift">
              <p className="border-b border-black/5 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-warm">Landing page</p>
              <div className="p-3.5">
                <div className="mb-2.5 h-1.5 w-10 rounded bg-phoenix" />
                <p className="text-[15px] font-bold leading-[1.15]">Feel better. Move better. Live better.</p>
                <div className="mt-3 space-y-1.5"><div className="h-1.5 w-full rounded bg-black/[.07]" /><div className="h-1.5 w-4/5 rounded bg-black/[.07]" /></div>
                <p className="mt-3.5 text-[10.5px] font-semibold text-warm">Book your visit</p>
                <div className="mt-1.5 rounded-md border border-black/10 px-2 py-1.5"><div className="h-1.5 w-2/3 rounded bg-black/10" /></div>
                <span className="mt-2.5 block w-fit rounded bg-phoenix px-3 py-1.5 text-[10px] font-bold text-white">Schedule Now</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Conversation transcript card */}
          <AnimatedSection delay={600}>
            <div className="-ml-5 w-[248px] -rotate-[1deg] overflow-hidden rounded-xl border border-black/10 bg-white lift">
              <p className="border-b border-black/5 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-warm">Conversation transcript</p>
              <div className="space-y-2.5 p-3.5 text-[10.5px] leading-[1.45]">
                <p><span className="mr-1.5 font-bold text-phoenix">Ember</span><span className="text-ink/80">Hi! Thanks for reaching out. How can we help you today?</span></p>
                <p><span className="mr-1.5 font-bold text-ink">Caller</span><span className="text-ink/70">I&apos;ve been dealing with lower back pain for a few weeks.</span></p>
                <p><span className="mr-1.5 font-bold text-phoenix">Ember</span><span className="text-ink/80">I&apos;m sorry to hear that. Can I ask a few quick questions?</span></p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <SmallWaveform className="h-6 flex-1" />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Pipeline card */}
          <AnimatedSection delay={700}>
            <div className="-ml-6 mt-3 w-[330px] rotate-[1deg] overflow-hidden rounded-xl border border-black/10 bg-white lift">
              <p className="border-b border-black/5 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-warm">Pipeline</p>
              <div className="grid grid-cols-4 divide-x divide-black/5 text-[9px]">
                {[
                  { title: 'New Inquiry', items: ['New inquiry', '· Web Form', 'Today'], active: false },
                  { title: 'Qualified', items: ['Qualified', '· Conditions', '· Availability'], active: false },
                  { title: 'Appt Set', items: ['Appointment', '· Preferred time', 'Today'], active: false },
                  { title: 'Confirmed', items: ['Confirmed', '· Visit type', '· Reminders'], active: true },
                ].map((col: any) => (
                  <div key={col?.title} className={`p-2.5 ${col?.active ? 'bg-phoenix/[.06]' : ''}`}>
                    <p className={`mb-2 font-bold ${col?.active ? 'text-phoenix' : 'text-ink'}`}>{col?.title}</p>
                    <div className={`rounded border p-2 ${col?.active ? 'border-phoenix/30 bg-white' : 'border-black/10'}`}>
                      <p className={`font-semibold ${col?.active ? 'text-phoenix' : ''}`}>{col?.items?.[0]}</p>
                      {col?.items?.slice?.(1)?.map((item: string, i: number) => (
                        <p key={i} className="mt-1 text-warm">{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
