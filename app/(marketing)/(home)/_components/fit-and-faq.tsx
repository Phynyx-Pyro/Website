'use client'

import { useState } from 'react'
import { AnimatedSection } from '../../_components/animated-section'
import { Check, Minus, Plus, CircleCheck, CircleMinus } from 'lucide-react'

const goodFit = [
  'Established business doing $250K+ annually',
  'Serious about systems, not just more leads',
  'Willing to change how the front desk operates',
  'Ready to invest in a multi-month build',
]

const notYet = [
  'Brand new business with no patient flow',
  'Shopping for the cheapest cost per lead',
  'Not ready for operational change',
]

const faqs = [
  {
    q: 'How fast do results show up?',
    a: 'Response time and booking rate move in the first two weeks. Attributable revenue is a 60\u201390 day conversation, and we say so up front.',
  },
  {
    q: 'Do we have to replace our CRM?',
    a: 'Not necessarily. PYRO integrates with major CRM platforms. In most cases we deploy alongside your existing tools, then consolidate where it makes sense.',
  },
  {
    q: 'Does Ember sound like a robot?',
    a: 'Ember uses natural conversational AI. Most callers can\'t tell the difference. We\'ll play you a real call recording during your Growth Assessment.',
  },
  {
    q: 'What does this cost?',
    a: 'It depends on the scope of the engagement. Growth Assessment calls are free, confidential, and focused on whether we\'re the right fit before pricing is discussed.',
  },
  {
    q: 'Who actually runs the account?',
    a: 'A dedicated strategist manages your campaigns, systems, and reporting. You\'ll have direct access and regular check-ins\u200a\u2014\u200anot a ticket queue.',
  },
]

export function FitAndFaq() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <section className="relative overflow-hidden bg-linen py-14 lg:py-[92px]">
      <p className="font-hand pointer-events-none absolute right-[54px] top-[70px] rotate-[5deg] text-[25px] font-semibold text-phoenix/70 hidden lg:block">
        we add friction on purpose
      </p>
      <p className="font-hand -rotate-[2deg] text-[20px] font-semibold text-phoenix px-5 lg:hidden mb-4">
        we add friction on purpose
      </p>
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left: Fit criteria */}
          <div className="lg:col-span-5">
            <AnimatedSection>
              <p className="mb-4 lg:mb-5 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">Selective fit</p>
              <h2 className="text-[34px] lg:text-[48px] font-bold leading-[.98] tracking-[-.04em]">
                Is PhynyxPro right for you?
              </h2>
              <p className="mt-4 lg:mt-5 max-w-[400px] text-[15.5px] lg:text-[17px] leading-[1.6] text-warm">
                We take on a limited number of partners. Honest qualification protects both sides.
              </p>
            </AnimatedSection>

            <div className="mt-6 lg:mt-8 space-y-4">
              <AnimatedSection delay={100}>
                <div className="rounded-xl border border-black/10 bg-white p-5 lg:p-6 lift-sm">
                  <p className="flex items-center gap-2 lg:gap-2.5 text-[11.5px] lg:text-[13px] font-bold uppercase tracking-[.12em] text-[#1E7A42]">
                    <CircleCheck className="w-4 h-4" /> Good fit
                  </p>
                  <ul className="mt-3 lg:mt-4 space-y-2 lg:space-y-2.5 text-[14px] lg:text-[15px] text-ink/85">
                    {goodFit?.map((item: string) => (
                      <li key={item} className="flex gap-2.5 lg:gap-3">
                        <Check className="w-3 h-3 text-phoenix mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="rounded-xl border border-black/10 bg-white/60 p-5 lg:p-6">
                  <p className="flex items-center gap-2 lg:gap-2.5 text-[11.5px] lg:text-[13px] font-bold uppercase tracking-[.12em] text-warm">
                    <CircleMinus className="w-4 h-4" /> Not yet
                  </p>
                  <ul className="mt-3 lg:mt-4 space-y-2 lg:space-y-2.5 text-[14px] lg:text-[15px] text-warm">
                    {notYet?.map((item: string) => (
                      <li key={item} className="flex gap-2.5 lg:gap-3">
                        <Minus className="w-3 h-3 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Right: FAQ */}
          <div className="lg:col-span-7 lg:pt-2">
            <AnimatedSection>
              <p className="mb-4 lg:mb-6 text-[11px] font-bold uppercase tracking-[.2em] text-phoenix">Straight answers</p>
            </AnimatedSection>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {faqs?.map((faq: any, i: number) => (
                <AnimatedSection key={i} delay={i * 60}>
                  <div className="py-4 lg:py-6">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      className="flex items-start justify-between gap-4 lg:gap-8 w-full text-left"
                    >
                      <p className="text-[16px] lg:text-[20px] font-semibold tracking-[-.01em] lg:tracking-[-.02em]">
                        {faq?.q}
                      </p>
                      {openFaq === i ? (
                        <Minus className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-phoenix mt-1.5 lg:mt-2 shrink-0" />
                      ) : (
                        <Plus className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-phoenix mt-1 shrink-0" />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        openFaq === i ? 'max-h-[300px] opacity-100 mt-2 lg:mt-2.5' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="max-w-[520px] text-[13.5px] lg:text-[15.5px] leading-[1.55] lg:leading-[1.6] text-warm">
                        {faq?.a}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
