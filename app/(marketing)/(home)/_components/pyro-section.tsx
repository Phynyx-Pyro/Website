'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Waveform } from '../../_components/waveform'
import { AnimatedSection } from '../../_components/animated-section'
import { CheckCircle } from 'lucide-react'

const chatBubbles = [
  { speaker: 'Ember', text: 'What brings you in today?', isEmber: true },
  { speaker: 'Caller', text: "I've been having shoulder pain for a few weeks.", isEmber: false },
  { speaker: 'Ember', text: 'Got it. Is it on your left, right, or both sides?', isEmber: true },
  { speaker: 'Caller', text: 'Thursday morning works.', isEmber: false },
  { speaker: 'Ember', text: "You're all set for Thursday at 9:30am.", isEmber: true },
]

export function PyroSection() {
  return (
    <section className="slant-top relative overflow-hidden bg-night text-white grain-dark">
      <div className="pointer-events-none absolute left-[-160px] top-[120px] h-[520px] w-[520px] rounded-full bg-flame/[.09] blur-[100px]" />
      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10 pb-14 lg:pb-[104px] pt-14 lg:pt-[92px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left copy */}
          <div className="lg:col-span-4 lg:pr-4">
            <AnimatedSection>
              <p className="mb-4 lg:mb-6 text-[10px] lg:text-[12px] font-bold uppercase tracking-[.18em] text-flame">
                PYRO — the revenue-operations engine
              </p>
              <h2 className="text-[38px] lg:text-[50px] font-bold leading-[.97] tracking-[-.04em]">
                The response layer behind every good inquiry.
              </h2>
              <p className="mt-4 lg:mt-6 text-[15.5px] lg:text-[17px] leading-[1.65] text-white/70">
                Ember is the AI voice and chat receptionist that qualifies, books, and updates your systems — then hands off cleanly to your team.
              </p>
              <Link
                href="/pyro-ember"
                className="group mt-6 lg:mt-8 inline-flex items-center gap-3 text-[15px] lg:text-[16px] font-semibold text-flame"
              >
                See Ember in Action
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <div className="mt-8 lg:mt-10 flex items-center gap-5 lg:gap-6 border-t border-white/10 pt-6">
                <div><p className="text-[26px] font-bold tracking-[-.03em]">41s</p><p className="text-[11px] uppercase tracking-[.1em] text-white/55">Median answer</p></div>
                <div className="h-8 w-px bg-white/12" />
                <div><p className="text-[26px] font-bold tracking-[-.03em]">24/7</p><p className="text-[11px] uppercase tracking-[.1em] text-white/55">Coverage</p></div>
                <div className="h-8 w-px bg-white/12" />
                <div><p className="text-[26px] font-bold tracking-[-.03em]">0</p><p className="text-[11px] uppercase tracking-[.1em] text-white/55">Missed calls</p></div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right: journey visualization */}
          <div className="lg:col-span-8">
            {/* Column headers - desktop */}
            <div className="hidden lg:grid grid-cols-5 gap-3 pb-6 text-center text-[13px] font-medium text-white/70">
              <span>Active Call</span><span>Qualification</span><span>Appointment</span><span>CRM Update</span><span>Handoff</span>
            </div>

            {/* Waveform + Ember icon */}
            <AnimatedSection>
              <div className="flex items-center mt-4 lg:mt-0">
                <div className="relative shrink-0">
                  <span className="absolute inset-0 h-[54px] lg:h-[62px] w-[54px] lg:w-[62px] rounded-full border border-flame/40" style={{ animation: 'ringpulse 3.4s cubic-bezier(.2,.6,.3,1) infinite' }} />
                  <span className="absolute inset-0 h-[54px] lg:h-[62px] w-[54px] lg:w-[62px] rounded-full border border-flame/40" style={{ animation: 'ringpulse 3.4s cubic-bezier(.2,.6,.3,1) infinite', animationDelay: '1.1s' }} />
                  <span className="relative z-10 flex h-[54px] lg:h-[62px] w-[54px] lg:w-[62px] items-center justify-center overflow-hidden rounded-full border border-flame bg-night glow">
                    <Image src="/images/ember-avatar.png" alt="Ember, the PYRO AI receptionist" fill className="object-cover object-top" />
                  </span>
                </div>
                <Waveform size="large" className="ml-3 h-[104px] lg:h-[140px] flex-1" />
              </div>
              <p className="mt-2 text-[12.5px] font-semibold text-white/80">
                Ember · <span className="text-flame">Active call · 02:14</span>
              </p>
            </AnimatedSection>

            {/* Chat bubbles */}
            <div className="mt-6 lg:mt-8 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">Qualification</p>
              {chatBubbles?.map((bubble: any, i: number) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className={`rounded-lg border border-white/10 p-3.5 ${bubble?.isEmber ? 'bg-white/[.05]' : 'ml-8 bg-white/[.10]'}`}>
                    <p className={`text-[9.5px] font-bold ${bubble?.isEmber ? 'text-flame' : 'text-white/60'}`}>{bubble?.speaker}</p>
                    <p className="mt-1 text-[13px] leading-snug text-white/85">{bubble?.text}</p>
                  </div>
                </AnimatedSection>
              ))}
              <AnimatedSection delay={500}>
                <div className="ml-8 flex items-center gap-2 rounded-lg bg-phoenix px-3.5 py-3">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-[12.5px] font-bold">Appointment Confirmed</span>
                </div>
              </AnimatedSection>
            </div>

            {/* CRM Update card */}
            <AnimatedSection delay={600}>
              <div className="mt-6 rounded-xl border border-white/12 bg-coal p-4">
                <p className="text-[12px] font-bold">CRM Update</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/85">
                  {[
                    'Contact created',
                    'Lead source: Website',
                    'Interest: New Patient',
                    'Appt: Thu 9:30am',
                    'Reminder: SMS + Email',
                  ].map((item: string) => (
                    <p key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-2.5 h-2.5 text-phoenix shrink-0" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Handoff */}
            <AnimatedSection delay={700}>
              <div className="mt-6 lg:mt-8 flex items-center gap-5 border-t border-white/12 pt-6 lg:pt-8">
                <div className="relative shrink-0">
                  <span className="absolute -inset-1.5 rounded-full border border-flame/35" style={{ animation: 'ringpulse 3.4s cubic-bezier(.2,.6,.3,1) infinite' }} />
                  <div className="relative h-[90px] lg:h-[112px] w-[90px] lg:w-[112px] rounded-full overflow-hidden ring-2 ring-flame">
                    <Image src="/images/receptionist.jpg" alt="Live receptionist" fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-flame">Handoff</p>
                  <p className="mt-1 text-[19px] font-bold leading-tight">Live receptionist takes over.</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-white/70">
                    Warm, briefed, and holding the full transcript.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
