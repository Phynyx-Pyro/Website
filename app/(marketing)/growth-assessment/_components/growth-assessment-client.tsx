'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Shield, AlertCircle } from 'lucide-react'
import { getAssessmentAttribution } from '@/lib/assessment-attribution'
import { trackFunnelEvent } from '@/lib/funnel-events'
import {
  isBookingContact,
  type BookingContact,
} from '@/lib/ghl-booking'
import { BookingCalendar } from './booking-calendar'
import { useAssessmentPrefill } from '../../_components/assessment-prefill-provider'
import {
  isHealthcareAssessmentIndustry,
  parseAssessmentIndustry,
  type AssessmentIndustry,
} from '@/lib/assessment-industry'

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
  bookingContact: BookingContact | null
}

function getJourneyCopy(
  industry: AssessmentIndustry | undefined,
  healthcareAudience = false,
) {
  if (industry === 'chiropractic') {
    return {
      stages: 'lead, appointment request, confirmation, Day 1 show, and start of care',
      metrics: 'spend, leads, appointment requests, shows, and starts',
    }
  }

  if (industry === 'home-services') {
    return {
      stages: 'lead, response, estimate or booking request, scheduled visit, and completed job',
      metrics: 'spend, leads, estimate or booking requests, scheduled visits, and completed jobs',
    }
  }

  if (
    industry === 'dental' ||
    industry === 'medspa' ||
    industry === 'other-healthcare' ||
    healthcareAudience
  ) {
    return {
      stages: 'lead, appointment request, confirmation, visit, and practice-recorded outcome',
      metrics: 'spend, leads, appointment requests, visits, and recorded outcomes',
    }
  }

  return {
    stages: 'lead, response, appointment or estimate request, completion, and recorded outcome',
    metrics: 'spend, leads, appointment or estimate requests, completed work, and recorded outcomes',
  }
}

export function GrowthAssessmentClient() {
  const { prefill, clearPrefill } = useAssessmentPrefill()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null)
  const [investmentAccepted, setInvestmentAccepted] = useState(false)
  const [acknowledgingInvestment, setAcknowledgingInvestment] = useState(false)
  const [healthcareAudience, setHealthcareAudience] = useState(false)
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const submissionIdRef = useRef('')
  const prefillAppliedRef = useRef(false)
  const industryPrefillAppliedRef = useRef(false)
  const assessmentStartedRef = useRef(false)
  const completedStepsRef = useRef(new Set<1 | 2 | 3>())
  const qualificationTrackedRef = useRef(false)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const resultPath = assessmentResult?.path ?? null
  const selectedIndustry = parseAssessmentIndustry(form.industry)
  const healthcareContext = selectedIndustry
    ? isHealthcareAssessmentIndustry(selectedIndustry)
    : healthcareAudience
  const diagnosticName = healthcareContext
    ? 'Patient Acquisition Diagnostic'
    : 'Acquisition Diagnostic'
  const journeyCopy = getJourneyCopy(
    selectedIndustry,
    !selectedIndustry && healthcareAudience,
  )

  const markAssessmentStarted = useCallback(() => {
    if (assessmentStartedRef.current) return
    assessmentStartedRef.current = true
    trackFunnelEvent('assessment_start', {
      entryPoint: getAssessmentAttribution().entryPoint,
    })
  }, [])

  const markStepComplete = useCallback((completedStep: 1 | 2 | 3) => {
    if (completedStepsRef.current.has(completedStep)) return
    completedStepsRef.current.add(completedStep)
    trackFunnelEvent('assessment_step_complete', { step: completedStep })
  }, [])

  useEffect(() => {
    if (!prefill || prefillAppliedRef.current) return

    const frame = window.requestAnimationFrame(() => {
      if (prefillAppliedRef.current) return
      prefillAppliedRef.current = true
      markAssessmentStarted()
      const nextStep = prefill.phone.trim().length > 0 ? 2 : 1
      if (nextStep === 2) markStepComplete(1)

      setForm((current) => ({
        ...current,
        firstName: prefill.firstName,
        lastName: prefill.lastName,
        email: prefill.email,
        phone: prefill.phone,
      }))
      setStep(nextStep)
      clearPrefill()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [clearPrefill, markAssessmentStarted, markStepComplete, prefill])

  useEffect(() => {
    if (industryPrefillAppliedRef.current) return

    const frame = window.requestAnimationFrame(() => {
      if (industryPrefillAppliedRef.current) return
      industryPrefillAppliedRef.current = true
      const searchParams = new URLSearchParams(window.location.search)
      const requestedIndustry = parseAssessmentIndustry(
        searchParams.get('industry'),
      )
      setHealthcareAudience(searchParams.get('audience') === 'healthcare')
      if (!requestedIndustry) return

      setForm((current) => (
        current.industry ? current : { ...current, industry: requestedIndustry }
      ))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

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
  const canProceed2 =
    (form?.businessName?.trim?.()?.length ?? 0) > 0 &&
    (form?.industry?.trim?.()?.length ?? 0) > 0 &&
    (form?.annualRevenue?.trim?.()?.length ?? 0) > 0

  const claimCalendarHandoff = async (investmentContextAcknowledged = false) => {
    const bookingResponse = await fetch('/api/booking-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investmentContextAcknowledged }),
    })
    const bookingResult = (await bookingResponse.json().catch(() => null)) as {
      message?: string
      bookingContact?: unknown
    } | null
    const bookingContact = bookingResult?.bookingContact

    if (!bookingResponse.ok || !isBookingContact(bookingContact)) {
      throw new Error(
        bookingResult?.message ??
          'We could not connect your assessment to the calendar. Please try again.',
      )
    }

    return bookingContact
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    markAssessmentStarted()
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

      markStepComplete(3)
      if (!qualificationTrackedRef.current) {
        qualificationTrackedRef.current = true
        trackFunnelEvent('qualification_result', { path: result.fit.path })
      }

      const bookingContact =
        result.fit.path === 'calendar' ? await claimCalendarHandoff() : null
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

  const handleInvestmentAcknowledgement = async () => {
    setAcknowledgingInvestment(true)
    setError('')

    try {
      const bookingContact = await claimCalendarHandoff(true)
      setAssessmentResult((current) =>
        current ? { ...current, bookingContact } : current,
      )
      setInvestmentAccepted(true)
      trackFunnelEvent('investment_context_acknowledged', {
        path: 'investment-context',
      })
    } catch (acknowledgementError: unknown) {
      setError(
        acknowledgementError instanceof Error
          ? acknowledgementError.message
          : 'We could not record your acknowledgement. Please try again.',
      )
    } finally {
      setAcknowledgingInvestment(false)
    }
  }

  if (assessmentResult) {
    const { path: resultPath, bookingContact } = assessmentResult
    const showCalendar = Boolean(
      bookingContact && (resultPath === 'calendar' || investmentAccepted),
    )

    return (
      <div className="bg-ivory grain-subtle min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-[920px] px-6 text-center" aria-live="polite">
          <AnimatedSection>
            {showCalendar ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-phoenix mx-auto mb-6" />
                <h1 ref={resultHeadingRef} tabIndex={-1} className="text-[clamp(32px,5vw,48px)] font-bold leading-tight text-ink outline-none">
                  {resultPath === 'calendar'
                    ? 'Your revenue and budget responses cleared the fit check.'
                    : 'Let’s review the investment context together.'}
                </h1>
                <p className="mt-4 mx-auto max-w-[660px] text-[17px] leading-[1.65] text-warm">
                  Thank you, {bookingContact?.firstName || 'there'}. Choose a convenient time below for the working diagnostic. Bring last month&apos;s {journeyCopy.metrics}.
                </p>
                {bookingContact && (
                  <BookingCalendar contact={bookingContact} qualificationPath={resultPath} />
                )}
                <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-phoenix hover:underline">
                  Back to Home <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <div className="mx-auto max-w-[720px] rounded-2xl bg-white p-7 md:p-10 shadow-xl">
                <Shield className="h-14 w-14 text-phoenix mx-auto mb-5" />
                <h1 ref={resultHeadingRef} tabIndex={-1} className="text-[clamp(30px,5vw,42px)] font-bold leading-tight text-ink outline-none">
                  Before you book, review the initial investment fit.
                </h1>
                <p className="mt-4 text-[16px] leading-[1.65] text-warm">
                  The fit check compares the annual revenue and monthly marketing budget you entered with the initial thresholds. Your answers suggest one or both should be discussed before deciding whether to work together.
                </p>

                <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
                  {[
                    {
                      label: 'Fit-check inputs',
                      value: 'Annual revenue and planned monthly marketing budget.',
                    },
                    {
                      label: 'Working-diagnostic context',
                      value: healthcareContext
                        ? 'Lead flow, available records, appointment capacity, and team handoffs.'
                        : 'Lead flow, available records, scheduling or service capacity, and team handoffs.',
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-ink/10 bg-ivory p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[.08em] text-warm">{item.label}</p>
                      <p className="mt-2 text-[14px] leading-[1.55] font-medium text-ink">{item.value}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[14px] leading-[1.6] text-warm">
                  This does not automatically rule you out. The working diagnostic is where we review the numbers, workflow context, capacity, and next step. It is not a promise that the system is the right fit.
                </p>

                <button
                  type="button"
                  onClick={handleInvestmentAcknowledgement}
                  disabled={acknowledgingInvestment}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-4 text-[15px] font-semibold text-white shadow-lg transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acknowledgingInvestment
                    ? 'Recording acknowledgement…'
                    : 'I understand — show diagnostic times'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                {error && (
                  <p role="alert" className="mt-4 text-[13px] text-red-600">
                    {error}
                  </p>
                )}
                <Link href="/" className="mt-5 inline-flex text-[13px] font-semibold text-warm hover:text-ink">
                  Not right now — return home
                </Link>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory grain-subtle min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <AnimatedSection>
            <h1 className="text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight text-ink">
              Book your <span className="text-phoenix">{diagnosticName}.</span>
            </h1>
            <p className="mt-5 max-w-[560px] mx-auto text-[17px] leading-[1.65] text-warm">
              Start with a 3-minute fit check, then choose a time for a working diagnostic focused on the gaps between {journeyCopy.stages}.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-[13px] text-warm">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-phoenix" /> 3-minute fit check</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-phoenix" /> Fit-first process</span>
            </div>
            <p className="mt-4 mx-auto max-w-[620px] text-[13px] leading-[1.6] text-warm">
              Bring last month&apos;s {journeyCopy.metrics} to the working session.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20 md:pb-28">
        <form
          name="growth-assessment-full"
          onSubmit={handleSubmit}
          onFocusCapture={markAssessmentStarted}
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
            aria-label={`${diagnosticName} fit-check progress`}
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
                <button
                  type="button"
                  onClick={() => {
                    if (!canProceed1) return
                    markAssessmentStarted()
                    markStepComplete(1)
                    setStep(2)
                  }}
                  disabled={!canProceed1}
                  className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canProceed1 ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}
                >
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
                    <input id="assessment-business-name" type="text" value={form?.businessName ?? ''} onChange={(e) => update('businessName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Your business" />
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
                    <label htmlFor="assessment-annual-revenue" className="block text-[13px] font-medium text-ink mb-1.5">Annual business revenue (last 12 months) *</label>
                    <select id="assessment-annual-revenue" required value={form?.annualRevenue ?? ''} onChange={(e) => update('annualRevenue', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
                      <option value="">Select range</option>
                      <option value="under-250k">Under $250K</option>
                      <option value="250k-500k">$250K – $499,999</option>
                      <option value="500k-1m">$500K – $999,999</option>
                      <option value="1m-5m">$1M – $4,999,999</option>
                      <option value="5m-plus">$5M or more</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canProceed2) return
                      markStepComplete(2)
                      setStep(3)
                    }}
                    disabled={!canProceed2}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canProceed2 ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}
                  >
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
                    <label htmlFor="assessment-monthly-budget" className="block text-[13px] font-medium text-ink mb-1.5">Planned monthly marketing budget *</label>
                    <select id="assessment-monthly-budget" required value={form?.monthlyBudget ?? ''} onChange={(e) => update('monthlyBudget', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
                      <option value="">Select range</option>
                      <option value="under-1k">Under $1,000/mo</option>
                      <option value="1k-3k">$1,000 – $2,999/mo</option>
                      <option value="3k-5k">$3,000 – $4,999/mo</option>
                      <option value="5k-10k">$5,000 – $9,999/mo</option>
                      <option value="10k-plus">$10,000/mo or more</option>
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
                  <button type="submit" disabled={submitting || !form.monthlyBudget} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-ember transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting ? 'Checking fit...' : 'Complete Fit Check'}
                  </button>
                </div>

                <p className="mt-4 text-[12px] text-warm text-center">
                  Revenue and budget determine the fit-check path. The remaining details help coordinate the diagnostic and follow-up.
                </p>
              </div>
            </AnimatedSection>
          )}
        </form>
      </section>
    </div>
  )
}
