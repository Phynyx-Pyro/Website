'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Shield, AlertCircle, DollarSign } from 'lucide-react'
import { getAssessmentAttribution } from '@/lib/assessment-attribution'
import {
  isBookingContact,
  type BookingContact,
} from '@/lib/ghl-booking'
import { BookingCalendar } from './booking-calendar'
import { useAssessmentPrefill } from '../../_components/assessment-prefill-provider'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  industry: string
  annualRevenue: string
  biggestChallenge: string
  currentMarketing: string
  monthlyBudget: string
}

const initialForm: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  industry: '',
  annualRevenue: '',
  biggestChallenge: '',
  currentMarketing: '',
  monthlyBudget: '',
}

type FitPath = 'calendar' | 'investment-context'

type AssessmentResult = {
  path: FitPath
  bookingContact: BookingContact
}

export function GrowthAssessmentClient() {
  const { prefill, clearPrefill } = useAssessmentPrefill()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null)
  const [investmentAccepted, setInvestmentAccepted] = useState(false)
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const submissionIdRef = useRef('')
  const prefillAppliedRef = useRef(false)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const resultPath = assessmentResult?.path ?? null

  useEffect(() => {
    if (!prefill || prefillAppliedRef.current) return
    prefillAppliedRef.current = true

    setForm((current) => ({
      ...current,
      firstName: prefill.firstName,
      lastName: prefill.lastName,
      email: prefill.email,
      phone: prefill.phone,
    }))
    setStep(prefill.phone.trim().length > 0 ? 2 : 1)
    clearPrefill()
  }, [clearPrefill, prefill])

  useEffect(() => {
    if (!resultPath) return

    window.scrollTo({ top: 0, behavior: 'smooth' })
    const frame = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [resultPath, investmentAccepted])

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...(prev ?? {}), [field]: value }))
  }

  const canProceed1 = (form?.firstName?.trim?.()?.length ?? 0) > 0 && (form?.email?.trim?.()?.length ?? 0) > 0 && (form?.phone?.trim?.()?.length ?? 0) > 0
  const canProceed2 = (form?.businessName?.trim?.()?.length ?? 0) > 0 && (form?.industry?.trim?.()?.length ?? 0) > 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (!submissionIdRef.current) submissionIdRef.current = crypto.randomUUID()
      const res = await fetch('/api/growth-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website,
          submissionId: submissionIdRef.current,
          attribution: getAssessmentAttribution(),
        }),
      })
      const result = (await res.json().catch(() => null)) as {
        code?: string
        message?: string
        bookingReady?: boolean
        fit?: { path?: FitPath }
      } | null
      if (!res.ok) {
        if (result?.code === 'SUBMISSION_CONFLICT') {
          submissionIdRef.current = ''
        }
        throw new Error(result?.message ?? 'Submission failed')
      }
      if (result?.fit?.path !== 'calendar' && result?.fit?.path !== 'investment-context') {
        throw new Error('We could not determine the next step. Please try again.')
      }
      if (!result.bookingReady) {
        throw new Error('We could not prepare the secure calendar handoff. Please try again.')
      }

      const bookingResponse = await fetch('/api/booking-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const bookingResult = (await bookingResponse.json().catch(() => null)) as {
        message?: string
        bookingContact?: unknown
      } | null
      const bookingContact = bookingResult?.bookingContact

      if (!bookingResponse.ok || !isBookingContact(bookingContact)) {
        throw new Error('We could not connect your assessment to the calendar. Please try again.')
      }
      setAssessmentResult({
        path: result.fit.path,
        bookingContact,
      })
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (assessmentResult) {
    const { path: resultPath, bookingContact } = assessmentResult
    const showCalendar = resultPath === 'calendar' || investmentAccepted

    return (
      <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-[920px] px-6 text-center" aria-live="polite">
          <AnimatedSection>
            {showCalendar ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-phoenix mx-auto mb-6" />
                <h1 ref={resultHeadingRef} tabIndex={-1} className="text-[clamp(32px,5vw,48px)] font-bold leading-tight text-ink outline-none">
                  {resultPath === 'calendar'
                    ? 'Your business looks ready for the next step.'
                    : 'Let’s see if the numbers and the strategy make sense.'}
                </h1>
                <p className="mt-4 mx-auto max-w-[660px] text-[17px] leading-[1.65] text-warm">
                  Thank you, {bookingContact.firstName || 'there'}. Choose a convenient time below for a focused discovery call with PhynyxPro.
                </p>
                <BookingCalendar contact={bookingContact} />
                <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-phoenix hover:underline">
                  Back to Home <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <div className="mx-auto max-w-[720px] rounded-2xl bg-white p-7 md:p-10 shadow-xl">
                <DollarSign className="h-14 w-14 text-phoenix mx-auto mb-5" />
                <h1 ref={resultHeadingRef} tabIndex={-1} className="text-[clamp(30px,5vw,42px)] font-bold leading-tight text-ink outline-none">
                  Before we book, let&apos;s make sure the investment fits.
                </h1>
                <p className="mt-4 text-[16px] leading-[1.65] text-warm">
                  Based on what you shared, your business may be early for the full PhynyxPro system. That does not automatically mean we cannot help—but we want the costs to be completely clear before you schedule.
                </p>

                <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
                  {[
                    { label: 'One-time buildout', value: '$1,000' },
                    { label: 'Monthly retainer', value: '$1,500/mo' },
                    { label: 'Lead generation', value: '$1,500–$2,500/mo' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-ink/10 bg-ivory p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[.08em] text-warm">{item.label}</p>
                      <p className="mt-1.5 text-[20px] font-bold text-ink">{item.value}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[14px] leading-[1.6] text-warm">
                  Expected total: approximately <strong className="text-ink">$4,000–$5,000 in month one</strong>, then <strong className="text-ink">$3,000–$4,000 per month</strong>. The discovery call is still free and is simply to determine whether moving forward makes sense.
                </p>

                <button
                  type="button"
                  onClick={() => setInvestmentAccepted(true)}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-4 text-[15px] font-semibold text-white shadow-lg transition-colors hover:bg-ember"
                >
                  I understand the investment — show me the calendar
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/" className="mt-5 inline-flex text-[13px] font-semibold text-warm hover:text-ink">
                  Not right now — return home
                </Link>
              </div>
            )}
          </AnimatedSection>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-ivory grain-subtle min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <AnimatedSection>
            <h1 className="text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight text-ink">
              Let&apos;s find out if PhynyxPro is the <span className="text-phoenix">right growth partner.</span>
            </h1>
            <p className="mt-5 max-w-[560px] mx-auto text-[17px] leading-[1.65] text-warm">
              A 15-minute qualified conversation — not a sales pitch. We&apos;ll review your current marketing, lead flow, and operations, then tell you honestly whether we can help.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-[13px] text-warm">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-phoenix" /> Takes about 3 minutes</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-phoenix" /> No obligation</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20 md:pb-28">
        <form
          name="growth-assessment-full"
          onSubmit={handleSubmit}
          className="mx-auto max-w-[600px] px-6"
        >
          <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="assessment-website">Website</label>
            <input
              id="assessment-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
          <input type="hidden" name="firstName" value={form.firstName} />
          <input type="hidden" name="lastName" value={form.lastName} />
          <input type="hidden" name="email" value={form.email} />
          <input type="hidden" name="phone" value={form.phone} />
          <input type="hidden" name="businessName" value={form.businessName} />
          <input type="hidden" name="industry" value={form.industry} />
          <input type="hidden" name="annualRevenue" value={form.annualRevenue} />
          <input type="hidden" name="biggestChallenge" value={form.biggestChallenge} />
          <input type="hidden" name="currentMarketing" value={form.currentMarketing} />
          <input type="hidden" name="monthlyBudget" value={form.monthlyBudget} />
          {/* Progress */}
          <div
            className="flex items-center gap-2 mb-8"
            role="progressbar"
            aria-label="Growth assessment progress"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
          >
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-phoenix' : 'bg-ink/10'
              }`} />
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <AnimatedSection>
              <div className="rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="text-[22px] font-semibold text-ink mb-6">About you</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="assessment-first-name" className="block text-[13px] font-medium text-ink mb-1.5">First Name *</label>
                      <input id="assessment-first-name" type="text" value={form?.firstName ?? ''} onChange={(e) => update('firstName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Andrew" />
                    </div>
                    <div>
                      <label htmlFor="assessment-last-name" className="block text-[13px] font-medium text-ink mb-1.5">Last Name</label>
                      <input id="assessment-last-name" type="text" value={form?.lastName ?? ''} onChange={(e) => update('lastName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Higdon" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="assessment-email" className="block text-[13px] font-medium text-ink mb-1.5">Email *</label>
                    <input id="assessment-email" type="email" value={form?.email ?? ''} onChange={(e) => update('email', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="andrew@example.com" />
                  </div>
                  <div>
                    <label htmlFor="assessment-phone" className="block text-[13px] font-medium text-ink mb-1.5">Phone *</label>
                    <input id="assessment-phone" type="tel" value={form?.phone ?? ''} onChange={(e) => update('phone', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="(555) 123-4567" />
                  </div>
                </div>
                <button type="button" onClick={() => canProceed1 && setStep(2)} disabled={!canProceed1} className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canProceed1 ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}>
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </AnimatedSection>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <AnimatedSection>
              <div className="rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="text-[22px] font-semibold text-ink mb-6">About your business</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="assessment-business-name" className="block text-[13px] font-medium text-ink mb-1.5">Business Name *</label>
                    <input id="assessment-business-name" type="text" value={form?.businessName ?? ''} onChange={(e) => update('businessName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Your Practice or Company" />
                  </div>
                  <div>
                    <label htmlFor="assessment-industry" className="block text-[13px] font-medium text-ink mb-1.5">Industry *</label>
                    <select id="assessment-industry" value={form?.industry ?? ''} onChange={(e) => update('industry', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
                      <option value="">Select your industry</option>
                      <option value="chiropractic">Chiropractic</option>
                      <option value="dental">Dental</option>
                      <option value="medspa">Medspa / Aesthetics</option>
                      <option value="home-services">Home Services (HVAC, Roofing, Plumbing)</option>
                      <option value="other-healthcare">Other Healthcare</option>
                      <option value="other-service">Other Service Business</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assessment-annual-revenue" className="block text-[13px] font-medium text-ink mb-1.5">Annual Revenue</label>
                    <select id="assessment-annual-revenue" value={form?.annualRevenue ?? ''} onChange={(e) => update('annualRevenue', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
                      <option value="">Select range</option>
                      <option value="under-250k">Under $250K</option>
                      <option value="250k-500k">$250K – $500K</option>
                      <option value="500k-1m">$500K – $1M</option>
                      <option value="1m-5m">$1M – $5M</option>
                      <option value="5m-plus">$5M+</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={() => canProceed2 && setStep(3)} disabled={!canProceed2} className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canProceed2 ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <AnimatedSection>
              <div className="rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="text-[22px] font-semibold text-ink mb-6">Your growth context</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="assessment-biggest-challenge" className="block text-[13px] font-medium text-ink mb-1.5">Biggest challenge right now</label>
                    <select id="assessment-biggest-challenge" value={form?.biggestChallenge ?? ''} onChange={(e) => update('biggestChallenge', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
                      <option value="">Select one</option>
                      <option value="not-enough-leads">Not enough leads</option>
                      <option value="leads-not-converting">Leads aren&apos;t converting to appointments</option>
                      <option value="no-show-rate">High no-show rate</option>
                      <option value="no-attribution">Can&apos;t track what&apos;s working</option>
                      <option value="follow-up">Slow or inconsistent follow-up</option>
                      <option value="scaling">Ready to scale but systems aren&apos;t in place</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assessment-current-marketing" className="block text-[13px] font-medium text-ink mb-1.5">Current marketing approach</label>
                    <textarea id="assessment-current-marketing" value={form?.currentMarketing ?? ''} onChange={(e) => update('currentMarketing', e?.target?.value ?? '')} rows={3} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition resize-none" placeholder="What are you doing for marketing today? (Google Ads, social, referrals, etc.)" />
                  </div>
                  <div>
                    <label htmlFor="assessment-monthly-budget" className="block text-[13px] font-medium text-ink mb-1.5">Monthly marketing budget</label>
                    <select id="assessment-monthly-budget" value={form?.monthlyBudget ?? ''} onChange={(e) => update('monthlyBudget', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
                      <option value="">Select range</option>
                      <option value="under-1k">Under $1,000/mo</option>
                      <option value="1k-3k">$1,000 – $3,000/mo</option>
                      <option value="3k-5k">$3,000 – $5,000/mo</option>
                      <option value="5k-10k">$5,000 – $10,000/mo</option>
                      <option value="10k-plus">$10,000+/mo</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="mt-4 flex items-center gap-2 text-[13px] text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-ember transition-colors disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                </div>

                <p className="mt-4 text-[12px] text-warm text-center">
                  Your information is kept private. We&apos;ll only use it to assess fit and reach out if we believe we can help.
                </p>
              </div>
            </AnimatedSection>
          )}
        </form>
      </section>
    </main>
  )
}
