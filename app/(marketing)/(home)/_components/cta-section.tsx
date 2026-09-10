'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedSection } from '../../_components/animated-section'
import { useAssessmentPrefill } from '../../_components/assessment-prefill-provider'
import { ArrowRight, CalendarClock, ClipboardList, Clock3 } from 'lucide-react'
import { getAssessmentAttribution } from '@/lib/assessment-attribution'
import { EMPTY_CONSENT } from '@/lib/contact-consent'
import { ContactConsentFields } from '../../_components/contact-consent'

const ATTRIBUTION_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'msclkid',
] as const

export function CtaSection() {
  const router = useRouter()
  const { stagePrefill } = useAssessmentPrefill()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [consent, setConsent] = useState(EMPTY_CONSENT)
  const [error, setError] = useState('')
  const submissionId = useRef('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitted = new FormData(event.currentTarget)
    const prefill = {
      firstName: String(submitted.get('firstName') ?? ''),
      lastName: String(submitted.get('lastName') ?? ''),
      email: String(submitted.get('email') ?? ''),
      phone: String(submitted.get('phone') ?? ''),
      consent,
    }

    if (!prefill.firstName.trim() || !prefill.email.trim() || !prefill.phone.trim()) return
    setSubmitting(true)
    setError('')
    try {
      if (!submissionId.current) submissionId.current = crypto.randomUUID()
      const response = await fetch('/api/growth-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prefill, submissionType: 'homepage-quick-form', submissionId: submissionId.current, industry: 'chiropractic', attribution: getAssessmentAttribution() }),
      })
      const result = await response.json() as { crmSynced?: boolean; code?: string; message?: string }
      if (!response.ok || !result.crmSynced) {
        if (result.code === 'SUBMISSION_CONFLICT') submissionId.current = ''
        throw new Error(result.message || 'We could not save your details. Please try again.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.')
      setSubmitting(false)
      return
    }
    stagePrefill(prefill)

    const currentParams = new URLSearchParams(window.location.search)
    const assessmentParams = new URLSearchParams()
    for (const key of ATTRIBUTION_QUERY_KEYS) {
      const value = currentParams.get(key)
      if (value) assessmentParams.set(key, value)
    }
    assessmentParams.set('cta', 'homepage-quick-form')
    assessmentParams.set('industry', 'chiropractic')
    router.push(`/growth-assessment?${assessmentParams.toString()}`)
  }

  return (
    <section id="diagnostic" className="relative overflow-hidden bg-ink py-14 text-white grain-dark lg:py-[92px]">
      <div className="pointer-events-none absolute right-[-140px] top-[-80px] h-[460px] w-[460px] rounded-full bg-flame/[.10] blur-[100px]" />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-9 px-5 lg:grid-cols-12 lg:gap-12 lg:px-10">
        <div className="lg:col-span-6">
          <AnimatedSection>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[.2em] text-flame lg:mb-5">Patient acquisition diagnostic</p>
            <h2 className="text-[36px] font-bold leading-[.96] tracking-[-.042em] lg:text-[54px]">
              Bring the Funnel Numbers. Map the Next Move
            </h2>
            <p className="mt-5 max-w-[540px] text-[15.5px] leading-[1.65] text-white/70 lg:mt-6 lg:text-[17.5px]">
              Use last month’s numbers or your best estimates. We’ll calculate the visible
              conversion rates, identify the largest drop-off, and show what a modest
              improvement could mean before you decide whether to book.
            </p>
            <div className="mt-7 grid gap-4 text-[12.5px] text-white/70 sm:grid-cols-3 lg:mt-8 lg:text-[13px]">
              <span className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
                3-minute growth snapshot
              </span>
              <span className="flex items-start gap-2.5">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
                30-minute diagnostic
              </span>
              <span className="flex items-start gap-2.5">
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
                Bring the numbers you have
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
                <p className="text-[17px] font-bold tracking-[-.02em] lg:text-[19px]">Build My Growth Snapshot</p>
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-warm lg:text-[11px]">Save progress</span>
              </div>
              <p className="mt-2 text-[12px] leading-[1.5] text-warm lg:text-[13px]">
                Save your progress here, then enter the practice and funnel numbers on the next screen.
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
              <ContactConsentFields value={consent} onChange={setConsent} />
              {error && <p role="alert" className="mt-3 text-[13px] text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !form.firstName.trim() || !form.email.trim() || !form.phone.trim()}
                data-cta-placement="homepage-quick-form"
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-phoenix px-5 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:text-[15px]"
              >
                {submitting ? 'Opening the snapshot…' : 'Start My 3-Minute Snapshot'}
                {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
              <p className="mt-4 text-center text-[11px] leading-[1.5] text-warm lg:text-[11.5px]">
                Your information is used to save the snapshot, evaluate fit, and coordinate a diagnostic only if you choose to book.
              </p>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
