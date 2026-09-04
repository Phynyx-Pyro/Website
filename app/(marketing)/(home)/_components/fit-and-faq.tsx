'use client'

import { useState } from 'react'
import { AnimatedSection } from '../../_components/animated-section'
import { Check, CircleCheck, CircleMinus, Minus, Plus } from 'lucide-react'

const goodFit = [
  'An established chiropractic practice with consistent patient flow',
  'Capacity for additional new-patient evaluations',
  'Prepared to fund paid acquisition and the operating system around it',
  'Willing to keep confirmation, show, and start-care stages current',
]

const notYet = [
  'No room on the calendar for new-patient evaluations',
  'Looking only for the cheapest possible lead',
  'Unable to assign a human owner for escalations and outcome updates',
]

const faqs = [
  {
    q: 'What happens after I click?',
    a: 'You’ll complete a short fit check that takes about three minutes. If there appears to be a fit, you can choose a time for a working diagnostic. Bring last month’s spend, leads, appointment requests, shows, and starts.',
  },
  {
    q: 'Is PhynyxPro just ad management?',
    a: 'No. Paid acquisition is one part of the system. PhynyxPro also coordinates the post-click workflow—response, qualification, booking, reminders, handoff, and stage reporting—through PYRO.',
  },
  {
    q: 'How does Ember work with our team?',
    a: 'Ember is the AI receptionist inside PYRO. It follows the practice-approved conversation and scheduling rules, then hands off when a person should take over. Your team remains responsible for clinical judgment and patient care.',
  },
  {
    q: 'Do we have to replace our current CRM?',
    a: 'The diagnostic maps your current tools before any recommendation is made. What can be connected or consolidated depends on the platforms, permissions, and workflow already in place.',
  },
  {
    q: 'What does this cost?',
    a: 'The public site does not quote a package before scope and operational fit are reviewed. The diagnostic separates implementation, ongoing system operation, and paid media so the investment can be evaluated clearly.',
  },
  {
    q: 'Do you guarantee patient volume?',
    a: 'No. PhynyxPro can install and operate the acquisition system, but patient volume and care decisions depend on market conditions, media investment, practice capacity, team execution, and clinical fit.',
  },
]

export function FitAndFaq() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <section className="relative overflow-hidden bg-linen py-14 lg:py-[92px]">
      <p className="font-hand pointer-events-none absolute right-[54px] top-[70px] hidden rotate-[5deg] text-[25px] font-semibold text-phoenix/70 lg:block">
        fit protects both sides
      </p>
      <p className="font-hand mb-4 -rotate-[2deg] px-5 text-[20px] font-semibold text-phoenix lg:hidden">
        fit protects both sides
      </p>

      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <AnimatedSection>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix lg:mb-5">Selective fit</p>
              <h2 className="text-[34px] font-bold leading-[.98] tracking-[-.04em] lg:text-[48px]">
                Built for established chiropractic practices.
              </h2>
              <p className="mt-4 max-w-[430px] text-[15.5px] leading-[1.6] text-warm lg:mt-5 lg:text-[17px]">
                The fit check compares stated revenue and monthly marketing budget with
                initial thresholds. The working diagnostic reviews demand, capacity,
                operating participation, and the wider context.
              </p>
            </AnimatedSection>

            <div className="mt-6 space-y-4 lg:mt-8">
              <AnimatedSection delay={100}>
                <div className="rounded-xl border border-black/10 bg-white p-5 lift-sm lg:p-6">
                  <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[.12em] text-[#1E7A42] lg:text-[13px]">
                    <CircleCheck className="h-4 w-4" aria-hidden="true" /> Strong fit signals
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[14px] text-ink/85 lg:text-[15px]">
                    {goodFit.map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check className="mt-1.5 h-3 w-3 shrink-0 text-phoenix" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="rounded-xl border border-black/10 bg-white/60 p-5 lg:p-6">
                  <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[.12em] text-warm lg:text-[13px]">
                    <CircleMinus className="h-4 w-4" aria-hidden="true" /> Probably not yet
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[14px] text-warm lg:text-[15px]">
                    {notYet.map((item) => (
                      <li key={item} className="flex gap-3">
                        <Minus className="mt-2 h-3 w-3 shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pt-2">
            <AnimatedSection>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix lg:mb-6">Straight answers</p>
            </AnimatedSection>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index
                const panelId = `homepage-faq-panel-${index}`
                const buttonId = `homepage-faq-button-${index}`
                return (
                  <AnimatedSection key={faq.q} delay={index * 50}>
                    <div className="py-4 lg:py-6">
                      <button
                        id={buttonId}
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex w-full items-start justify-between gap-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix focus-visible:ring-offset-4 focus-visible:ring-offset-linen"
                      >
                        <span className="text-[16px] font-semibold tracking-[-.01em] lg:text-[20px] lg:tracking-[-.02em]">{faq.q}</span>
                        {isOpen ? (
                          <Minus className="mt-1.5 h-3.5 w-3.5 shrink-0 text-phoenix lg:mt-2" aria-hidden="true" />
                        ) : (
                          <Plus className="mt-1 h-3.5 w-3.5 shrink-0 text-phoenix" aria-hidden="true" />
                        )}
                      </button>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                        className="mt-2.5"
                      >
                        <p className="max-w-[590px] text-[13.5px] leading-[1.6] text-warm lg:text-[15.5px]">{faq.a}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
