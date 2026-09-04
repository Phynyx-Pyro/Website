'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Waveform } from '../../_components/waveform'
import { AnimatedSection } from '../../_components/animated-section'

const qualificationBubbles = [
  { speaker: 'Ember', text: 'What brings you in today?', isEmber: true },
  { speaker: 'Caller', text: "I’ve been having shoulder pain for a few weeks.", isEmber: false },
  { speaker: 'Ember', text: 'Got it. Is it on your left, right, or both sides?', isEmber: true },
]

const appointmentBubbles = [
  { speaker: 'Caller', text: 'Thursday morning works.', isEmber: false },
  { speaker: 'Ember', text: 'You’re all set for Thursday at 9:30am.', isEmber: true },
]

const crmUpdates = [
  'Contact created',
  'Lead source: Website',
  'Interest: New Patient',
  'Appt: Thu 9:30am',
  'Reminder: SMS + Email',
]

function ConversationBubble({
  speaker,
  text,
  isEmber,
}: {
  speaker: string
  text: string
  isEmber: boolean
}) {
  return (
    <div className={`rounded-lg border border-white/10 px-3 py-2.5 ${isEmber ? 'bg-white/[.055]' : 'bg-white/[.10]'}`}>
      <p className={`text-[10px] font-bold ${isEmber ? 'text-flame' : 'text-white/55'}`}>{speaker}</p>
      <p className="mt-1 text-[11.5px] leading-[1.4] text-white/85">{text}</p>
    </div>
  )
}

export function PyroSection() {
  return (
    <section className="slant-top relative overflow-hidden bg-night text-white grain-dark">
      <div className="pointer-events-none absolute left-[-160px] top-[80px] h-[520px] w-[520px] rounded-full bg-flame/[.08] blur-[100px]" />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-16 sm:px-6 lg:px-10 lg:pb-[92px] lg:pt-[88px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(245px,.82fr)_minmax(0,2.8fr)] lg:gap-8">
          <AnimatedSection className="lg:pr-2">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.16em] text-flame">
              PYRO — the revenue-operations engine
            </p>
            <h2 className="max-w-[420px] text-[38px] font-bold leading-[.99] tracking-[-.04em] sm:text-[44px] lg:text-[46px]">
              The response layer behind every good inquiry.
            </h2>
            <p className="mt-5 max-w-[390px] text-[15.5px] leading-[1.65] text-white/70 lg:text-[16px]">
              Ember is the AI voice and chat receptionist that qualifies, books, and updates your systems. Then seamlessly hands off to your team.
            </p>
            <Link
              href="/pyro-ember"
              className="group mt-7 inline-flex items-center gap-3 text-[15px] font-semibold text-flame lg:mt-8 lg:text-[16px]"
            >
              See Ember in Action
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={150} className="min-w-0">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-[8%] right-[6%] top-[142px] hidden h-px bg-gradient-to-r from-flame/15 via-flame/80 to-flame/15 shadow-[0_0_14px_rgba(255,107,53,.6)] lg:block"
                aria-hidden="true"
              />
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1.03fr_1.03fr_.95fr_.9fr] lg:gap-0">

              <li className="relative min-h-[310px] rounded-xl border border-white/10 bg-white/[.025] p-4 lg:min-h-[338px] lg:rounded-none lg:border-0 lg:bg-transparent lg:px-3 lg:py-0">
                <h3 className="text-center text-[12px] font-medium text-white/70">Active Call</h3>
                <div className="relative mt-3 min-h-[258px]">
                  <div className="pointer-events-none absolute left-[74px] right-[-12px] top-[70px] z-0 h-[104px] overflow-visible" aria-hidden="true">
                    <Waveform size="small" className="h-full w-full opacity-95" />
                  </div>
                  <div className="pointer-events-none absolute bottom-5 left-0 h-[210px] w-[158px] rounded-full bg-flame/[.12] blur-[38px]" aria-hidden="true" />
                  <div
                    className="absolute bottom-5 left-0 z-10 h-[222px] w-[164px] overflow-hidden"
                    style={{ WebkitMaskImage: 'linear-gradient(to bottom, #000 84%, transparent 100%)', maskImage: 'linear-gradient(to bottom, #000 84%, transparent 100%)' }}
                  >
                    <Image
                      src="/images/ember-human-headset.jpg"
                      alt="Ember, the PYRO AI voice and chat receptionist"
                      fill
                      sizes="(min-width: 1024px) 164px, 220px"
                      className="object-cover object-top mix-blend-lighten"
                    />
                  </div>
                  <p className="absolute bottom-0 left-0 z-20 text-[11.5px] font-semibold text-white/80">
                    Ember · <span className="text-flame">Active call · 02:14</span>
                  </p>
                </div>
              </li>

              <li className="relative rounded-xl border border-white/10 bg-white/[.025] p-4 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-l-white/10 lg:bg-transparent lg:px-3 lg:py-0">
                <h3 className="text-center text-[12px] font-medium text-white/70">Qualification</h3>
                <div className="relative z-10 mt-7 space-y-3 lg:mt-8">
                  {qualificationBubbles.map((bubble) => (
                    <ConversationBubble key={bubble.text} {...bubble} />
                  ))}
                  <div className="flex justify-center gap-3 pt-1" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-flame" />
                    <span className="h-2 w-2 rounded-full bg-flame" />
                    <span className="h-2 w-2 rounded-full bg-flame" />
                  </div>
                </div>
              </li>

              <li className="relative rounded-xl border border-white/10 bg-white/[.025] p-4 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-l-white/10 lg:bg-transparent lg:px-3 lg:py-0">
                <h3 className="text-center text-[12px] font-medium text-white/70">Appointment</h3>
                <div className="relative z-10 mt-7 space-y-3 lg:mt-8">
                  {appointmentBubbles.map((bubble) => (
                    <ConversationBubble key={bubble.text} {...bubble} />
                  ))}
                  <div className="flex items-center gap-2 rounded-lg bg-flame px-3 py-2.5 text-white shadow-[0_0_20px_rgba(255,107,53,.18)]">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-bold">Appointment Confirmed</span>
                  </div>
                </div>
              </li>

              <li className="relative rounded-xl border border-white/10 bg-white/[.025] p-4 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-l-white/10 lg:bg-transparent lg:px-3 lg:py-0">
                <h3 className="text-center text-[12px] font-medium text-white/70">CRM Update</h3>
                <div className="relative z-10 mt-7 rounded-lg border border-white/10 bg-white/[.055] p-3 lg:mt-10">
                  <p className="text-[11px] font-bold text-white">CRM Update</p>
                  <div className="mt-3 space-y-2">
                    {crmUpdates.map((item) => (
                      <p key={item} className="flex items-start gap-1.5 text-[10px] leading-[1.35] text-white/[.78]">
                        <CheckCircle className="mt-px h-3 w-3 shrink-0 text-flame" aria-hidden="true" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 rounded-md bg-flame px-2 py-2 text-center text-[10.5px] font-bold text-white">Updated</div>
                </div>
              </li>

              <li className="relative rounded-xl border border-white/10 bg-white/[.025] p-4 md:col-span-2 lg:col-span-1 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-l-white/10 lg:bg-transparent lg:px-3 lg:py-0">
                <h3 className="text-center text-[12px] font-medium text-white/70">Handoff</h3>
                <div className="relative z-10 mt-8 flex flex-col items-center text-center lg:mt-12">
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full border border-flame/40" style={{ animation: 'ringpulse 3.4s cubic-bezier(.2,.6,.3,1) infinite' }} aria-hidden="true" />
                    <div className="relative h-[126px] w-[126px] overflow-hidden rounded-full border-2 border-flame shadow-[0_0_28px_rgba(255,107,53,.24)]">
                      <Image src="/images/receptionist.jpg" alt="Live receptionist" fill sizes="126px" className="object-cover" />
                    </div>
                  </div>
                  <p className="mt-5 max-w-[150px] text-[13px] font-medium leading-[1.45] text-white/80">Live receptionist takes over</p>
                </div>
              </li>
              </ol>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
