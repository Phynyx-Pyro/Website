'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedSection } from '../../_components/animated-section'
import { Clock, Lock, Ban, ArrowRight } from 'lucide-react'

const PREFILL_STORAGE_KEY = 'phynyx-growth-assessment-prefill'
const ATTRIBUTION_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const

export function CtaSection() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form?.firstName?.trim() || !form?.email?.trim()) return
    setSubmitting(true)

    try {
      window.sessionStorage.setItem(PREFILL_STORAGE_KEY, JSON.stringify(form))
    } catch {
      // Continue without prefill if browser storage is unavailable.
    }

    const currentParams = new URLSearchParams(window.location.search)
    const attributionParams = new URLSearchParams()
    for (const key of ATTRIBUTION_QUERY_KEYS) {
      const value = currentParams.get(key)
      if (value) attributionParams.set(key, value)
    }

    const query = attributionParams.toString()
    router.push(query ? `/growth-assessment?${query}` : '/growth-assessment')
  }

  return (
    <section className="relative overflow-hidden bg-ink py-14 lg:py-[92px] text-white grain-dark">
      <div className="pointer-events-none absolute right-[-140px] top-[-80px] h-[460px] w-[460px] rounded-full bg-flame/[.10] blur-[100px]" />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 px-5 lg:px-10">
        <div className="lg:col-span-6">
          <AnimatedSection>
            <p className="mb-4 lg:mb-5 text-[11px] font-bold uppercase tracking-[.2em] text-flame">Growth assessment</p>
            <h2 className="text-[36px] lg:text-[54px] font-bold leading-[.96] tracking-[-.042em]">
              Let&apos;s find out if PhynyxPro is the right growth partner.
            </h2>
            <p className="mt-4 lg:mt-6 max-w-[480px] text-[15.5px] lg:text-[17.5px] leading-[1.65] text-white/70">
              A 15-minute qualified conversation — not a sales pitch. We&apos;ll review your marketing, lead flow, and operations, then tell you honestly whether we can help.
            </p>
            <div className="mt-6 lg:mt-8 flex flex-wrap items-center gap-5 lg:gap-7 text-[12.5px] lg:text-[13.5px] text-white/70">
              <span className="flex items-center gap-2 lg:gap-2.5"><Clock className="w-3.5 h-3.5 text-flame" /> 15 minutes</span>
              <span className="flex items-center gap-2 lg:gap-2.5"><Lock className="w-3.5 h-3.5 text-flame" /> Confidential</span>
              <span className="hidden lg:flex items-center gap-2.5"><Ban className="w-3.5 h-3.5 text-flame" /> No pitch deck</span>
            </div>
          </AnimatedSection>
        </div>

        <div className="lg:col-span-6">
          <AnimatedSection delay={200}>
            <form name="growth-assessment-quick" onSubmit={handleSubmit} className="rounded-2xl border border-white/12 bg-white p-6 lg:p-8 text-ink lift">
              <div className="flex items-center justify-between">
                  <p className="text-[17px] lg:text-[19px] font-bold tracking-[-.02em]">Start your assessment</p>
                  <span className="text-[10px] lg:text-[11.5px] font-bold uppercase tracking-[.12em] text-warm">Step 1 of 3</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <span className="h-1 flex-1 rounded-full bg-phoenix" />
                  <span className="h-1 flex-1 rounded-full bg-black/10" />
                  <span className="h-1 flex-1 rounded-full bg-black/10" />
                </div>
                <div className="mt-5 lg:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[12px] lg:text-[12.5px] font-semibold">First name</span>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Andrew"
                      value={form?.firstName ?? ''}
                      onChange={(e: any) => setForm({ ...(form ?? {}), firstName: e?.target?.value ?? '' })}
                      className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/60 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12px] lg:text-[12.5px] font-semibold">Last name</span>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Higdon"
                      value={form?.lastName ?? ''}
                      onChange={(e: any) => setForm({ ...(form ?? {}), lastName: e?.target?.value ?? '' })}
                      className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/60 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                    />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="text-[12px] lg:text-[12.5px] font-semibold">Work email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@practice.com"
                    value={form?.email ?? ''}
                    onChange={(e: any) => setForm({ ...(form ?? {}), email: e?.target?.value ?? '' })}
                    className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/60 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="text-[12px] lg:text-[12.5px] font-semibold">Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={form?.phone ?? ''}
                    onChange={(e: any) => setForm({ ...(form ?? {}), phone: e?.target?.value ?? '' })}
                    className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/60 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting || !form?.firstName?.trim() || !form?.email?.trim()}
                  className="mt-5 lg:mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-phoenix py-4 text-[15px] font-semibold text-white hover:bg-ember transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Continuing...' : 'Continue'}
                  {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              <p className="mt-3.5 lg:mt-4 text-center text-[11px] lg:text-[11.5px] text-warm">
                Your information is used only to evaluate fit for a Growth Assessment.
              </p>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
