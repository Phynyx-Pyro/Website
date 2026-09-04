'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedSection } from '../../_components/animated-section'
import { useAssessmentPrefill } from '../../_components/assessment-prefill-provider'
import { ArrowRight, CalendarClock, ClipboardList, Clock3 } from 'lucide-react'
import {
  buildAssessmentHref,
  captureAssessmentSessionAttribution,
} from '@/lib/assessment-attribution'
import { trackFunnelEvent } from '@/lib/funnel-events'

export function CtaSection() {
  const router = useRouter()
  const { stagePrefill } = useAssessmentPrefill()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitted = new FormData(event.currentTarget)
    const prefill = {
      firstName: String(submitted.get('firstName') ?? ''),
      lastName: String(submitted.get('lastName') ?? ''),
      email: String(submitted.get('email') ?? ''),
      phone: String(submitted.get('phone') ?? ''),
    }

    if (!prefill.firstName.trim() || !prefill.email.trim() || !prefill.phone.trim()) return
    setSubmitting(true)
    stagePrefill(prefill)
    trackFunnelEvent('diagnostic_cta_click', { placement: 'homepage_final_form' })

    const currentSearch = window.location.search
    const currentPath = window.location.pathname
    const assessmentHref = buildAssessmentHref(
      currentSearch,
      'homepage_final_form',
      currentPath,
      captureAssessmentSessionAttribution(currentSearch, currentPath),
    )
    const nextUrl = new URL(assessmentHref, window.location.origin)
    nextUrl.searchParams.set('industry', 'chiropractic')
    router.push(`${nextUrl.pathname}?${nextUrl.searchParams.toString()}`)
  }

  return (
    <section id="diagnostic" className="relative overflow-hidden bg-ink py-14 text-white grain-dark lg:py-[92px]">
      <div className="pointer-events-none absolute right-[-140px] top-[-80px] h-[460px] w-[460px] rounded-full bg-flame/[.10] blur-[100px]" />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-9 px-5 lg:grid-cols-12 lg:gap-12 lg:px-10">
        <div className="lg:col-span-6">
          <AnimatedSection>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-flame lg:mb-5">Patient acquisition diagnostic</p>
            <h2 className="text-[36px] font-bold leading-[.96] tracking-[-.042em] lg:text-[54px]">
              Bring the funnel numbers. Map the next move.
            </h2>
            <p className="mt-5 max-w-[540px] text-[15.5px] leading-[1.65] text-white/70 lg:mt-6 lg:text-[17.5px]">
              Start with a short fit check. If there is a potential match, choose a time
              for a working diagnostic focused on the handoffs between
              paid lead and patient outcome.
            </p>
            <div className="mt-7 grid gap-4 text-[12.5px] text-white/70 sm:grid-cols-3 lg:mt-8 lg:text-[13px]">
              <span className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
                3-minute fit check
              </span>
              <span className="flex items-start gap-2.5">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
                Working diagnostic
              </span>
              <span className="flex items-start gap-2.5">
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
                Bring last month&apos;s stage data
              </span>
            </div>
          </AnimatedSection>
        </div>

        <div className="lg:col-span-6">
          <AnimatedSection delay={160}>
            <form
              name="growth-assessment-quick"
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/12 bg-white p-6 text-ink lift lg:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[17px] font-bold tracking-[-.02em] lg:text-[19px]">Start the fit check</p>
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-warm lg:text-[11px]">Contact details</span>
              </div>
              <p className="mt-2 text-[12px] leading-[1.5] text-warm lg:text-[13px]">
                Enter your details here, then complete the practice questions on the next screen.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-6">
                <label className="block">
                  <span className="text-[12px] font-semibold lg:text-[12.5px]">First name *</span>
                  <input
                    required
                    autoComplete="given-name"
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/55 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold lg:text-[12.5px]">Last name</span>
                  <input
                    autoComplete="family-name"
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/55 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                  />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-[12px] font-semibold lg:text-[12.5px]">Work email *</span>
                <input
                  required
                  autoComplete="email"
                  type="email"
                  name="email"
                  placeholder="you@practice.com"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/55 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[12px] font-semibold lg:text-[12.5px]">Phone number *</span>
                <input
                  required
                  autoComplete="tel"
                  type="tel"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-black/12 bg-ivory px-3.5 py-3 text-[14px] placeholder:text-warm/55 focus:outline-none focus:ring-2 focus:ring-phoenix/30"
                />
              </label>
              <button
                type="submit"
                disabled={submitting || !form.firstName.trim() || !form.email.trim() || !form.phone.trim()}
                data-cta-placement="homepage-final-form"
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-phoenix px-5 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:text-[15px]"
              >
                {submitting ? 'Opening the fit check…' : 'Book My Patient Acquisition Diagnostic'}
                {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
              <p className="mt-4 text-center text-[11px] leading-[1.5] text-warm lg:text-[11.5px]">
                Your information is used only to evaluate fit and coordinate the diagnostic.
              </p>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
