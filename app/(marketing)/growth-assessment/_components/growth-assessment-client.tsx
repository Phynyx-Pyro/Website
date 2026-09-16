'use client'
import { ensureIntakeSession } from '@/lib/ensure-intake-session'
import { assessmentHandoffStatus, type AssessmentHandoffState } from '@/lib/assessment-handoff-status'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type RefObject,
  type SetStateAction,
} from 'react'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  Gauge,
  LineChart,
  Shield,
  Target,
} from 'lucide-react'
import { getAssessmentAttribution } from '@/lib/assessment-attribution'
import { isBookingContact, type BookingContact } from '@/lib/ghl-booking'
import { BookingCalendar } from './booking-calendar'
import { useAssessmentPrefill } from '../../_components/assessment-prefill-provider'
import { ContactConsentFields } from '../../_components/contact-consent'
import { EMPTY_CONSENT } from '@/lib/contact-consent'
import { parseAssessmentIndustry, type AssessmentIndustry } from '@/lib/assessment-industry'
import {
  FUNNEL_STAGE_KEYS,
  calculateGrowthSnapshot,
  type FunnelMetricAnswer,
  type FunnelMetricKey,
  type GrowthSnapshotInput,
  type GrowthSnapshotResult,
  type MetricConfidence,
} from '@/lib/growth-snapshot'
import { assessGrowthFit, type FitPath, type FitTier } from '@/lib/growth-assessment'
import { calculatePublicFunnel, type PublicFunnelInput, type PublicFunnelResult } from '@/lib/public-funnel-calculator'

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
  capacity: string
  decisionRole: string
  implementationTiming: string
  followUpOwner: string
  responseTime: string
  followUpAttempts: string
  attributionCoverage: string
}

type MetricFormValue = {
  value: string
  confidence: MetricConfidence
}

type MetricForm = Record<FunnelMetricKey, MetricFormValue>
type MetricField = {
  key: FunnelMetricKey
  label: string
  help: string
  currency?: boolean
}

type AssessmentResult = {
  fit: {
    path: FitPath
    tier: FitTier
    score: number
    summary: string
  }
  snapshot: GrowthSnapshotResult
  bookingContact: BookingContact | null
  handoffPending?: boolean
  delivery?: AssessmentHandoffState
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
  capacity: '',
  decisionRole: '',
  implementationTiming: '',
  followUpOwner: '',
  responseTime: '',
  followUpAttempts: '',
  attributionCoverage: '',
}

const initialMetrics: MetricForm = {
  leads: { value: '', confidence: 'estimate' },
  contacted: { value: '', confidence: 'estimate' },
  booked: { value: '', confidence: 'estimate' },
  confirmed: { value: '', confidence: 'estimate' },
  showed: { value: '', confidence: 'estimate' },
  started: { value: '', confidence: 'estimate' },
  adSpend: { value: '', confidence: 'estimate' },
  averageStartValue: { value: '', confidence: 'not-tracked' },
}

const demoForm: FormData = {
  ...initialForm,
  firstName: 'Andrew',
  lastName: 'Higdon',
  email: 'andrew@example.com',
  phone: '(312) 555-0100',
  businessName: 'Northside Chiropractic',
  industry: 'chiropractic',
  annualRevenue: '300k-500k',
  biggestChallenge: 'leads-not-converting',
  currentMarketing: 'Meta ads and referrals',
  monthlyBudget: '2k-3k',
  capacity: '11-20',
  decisionRole: 'owner',
  implementationTiming: 'within-30-days',
  followUpOwner: 'yes',
  responseTime: '15-60-minutes',
  followUpAttempts: '2-3',
  attributionCoverage: 'some',
}

const demoMetrics: MetricForm = {
  leads: { value: '80', confidence: 'exact' },
  contacted: { value: '50', confidence: 'estimate' },
  booked: { value: '28', confidence: 'exact' },
  confirmed: { value: '24', confidence: 'exact' },
  showed: { value: '20', confidence: 'exact' },
  started: { value: '12', confidence: 'exact' },
  adSpend: { value: '2400', confidence: 'exact' },
  averageStartValue: { value: '1200', confidence: 'estimate' },
}

const metricFields: MetricField[] = [
  { key: 'leads', label: 'New inquiries or leads', help: 'All new prospective-patient inquiries' },
  { key: 'contacted', label: 'Leads successfully contacted', help: 'A real two-way conversation occurred' },
  { key: 'booked', label: 'New-patient appointments booked', help: 'An appointment time was selected' },
  { key: 'confirmed', label: 'Appointments confirmed', help: 'The patient actively confirmed' },
  { key: 'showed', label: 'Day 1 appointments attended', help: 'The patient arrived for the first visit' },
  { key: 'started', label: 'Patients who started care', help: 'Practice-recorded starts of care' },
  { key: 'adSpend', label: 'Paid-media spend', help: 'Media spend only, excluding PhynyxPro fees', currency: true },
  { key: 'averageStartValue', label: 'Average collected revenue per care start', help: 'Optional; used only for the value scenario', currency: true },
]

const homeServiceMetricFields: MetricField[] = [
  { key: 'leads', label: 'New inquiries or leads', help: 'All new service inquiries' },
  { key: 'contacted', label: 'Leads successfully contacted', help: 'A real two-way conversation occurred' },
  { key: 'booked', label: 'Estimates or visits booked', help: 'A date and time was selected' },
  { key: 'confirmed', label: 'Visits confirmed', help: 'The customer actively confirmed' },
  { key: 'showed', label: 'Scheduled visits completed', help: 'The team arrived and completed the visit' },
  { key: 'started', label: 'Jobs won or completed', help: 'Business-recorded completed outcomes' },
  { key: 'adSpend', label: 'Paid-media spend', help: 'Media spend only, excluding PhynyxPro fees', currency: true },
  { key: 'averageStartValue', label: 'Average collected revenue per job', help: 'Optional; used only for the value scenario', currency: true },
]

const genericMetricFields: MetricField[] = [
  { key: 'leads', label: 'New inquiries or leads', help: 'All new prospective-customer inquiries' },
  { key: 'contacted', label: 'Leads successfully contacted', help: 'A real two-way conversation occurred' },
  { key: 'booked', label: 'Appointments or estimates booked', help: 'A date and time was selected' },
  { key: 'confirmed', label: 'Appointments confirmed', help: 'The prospect actively confirmed' },
  { key: 'showed', label: 'Appointments completed', help: 'The scheduled visit occurred' },
  { key: 'started', label: 'Recorded outcomes', help: 'Business-recorded wins or completions' },
  { key: 'adSpend', label: 'Paid-media spend', help: 'Media spend only, excluding PhynyxPro fees', currency: true },
  { key: 'averageStartValue', label: 'Average collected revenue per outcome', help: 'Optional; used only for the value scenario', currency: true },
]

const stageLabels: Record<(typeof FUNNEL_STAGE_KEYS)[number], string> = {
  leads: 'inquiry',
  contacted: 'contact',
  booked: 'booking',
  confirmed: 'confirmation',
  showed: 'Day 1 show',
  started: 'care start',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidContactEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

function isValidContactPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

function getJourneyCopy(
  industry: AssessmentIndustry | undefined,
  healthcareAudience = false,
) {
  if (industry === 'chiropractic') {
    return {
      headline: 'New-Patient Growth Snapshot',
      eyebrow: 'New-patient growth snapshot',
      rateLabel: 'Lead-to-start rate',
      costLabel: 'Ad cost per start',
      valueNoun: 'start',
      rateDescription: 'From reported inquiries through starts of care.',
      metricFields,
      stageLabels,
    }
  }
  if (
    industry === 'dental' ||
    industry === 'medspa' ||
    industry === 'other-healthcare' ||
    healthcareAudience
  ) {
    return {
      headline: 'Patient Growth Snapshot',
      eyebrow: 'Patient growth snapshot',
      rateLabel: 'Lead-to-outcome rate',
      costLabel: 'Ad cost per outcome',
      valueNoun: 'patient outcome',
      rateDescription: 'From reported inquiries through recorded patient outcomes.',
      metricFields,
      stageLabels,
    }
  }
  if (industry === 'home-services') {
    return {
      headline: 'Acquisition Growth Snapshot',
      eyebrow: 'Acquisition growth snapshot',
      rateLabel: 'Lead-to-job rate',
      costLabel: 'Ad cost per completed job',
      valueNoun: 'job',
      rateDescription: 'From reported inquiries through jobs won or completed.',
      metricFields: homeServiceMetricFields,
      stageLabels: {
        leads: 'inquiry', contacted: 'contact', booked: 'booking', confirmed: 'confirmation', showed: 'scheduled visit', started: 'completed job',
      },
    }
  }
  return {
    headline: 'Acquisition Growth Snapshot',
    eyebrow: 'Acquisition growth snapshot',
    rateLabel: 'Lead-to-outcome rate',
    costLabel: 'Ad cost per outcome',
    valueNoun: 'outcome',
    rateDescription: 'From reported inquiries through recorded business outcomes.',
    metricFields: genericMetricFields,
    stageLabels: {
      leads: 'inquiry', contacted: 'contact', booked: 'booking', confirmed: 'confirmation', showed: 'completed appointment', started: 'recorded outcome',
    },
  }
}

function metricFormToInput(form: FormData, metrics: MetricForm): GrowthSnapshotInput {
  const normalized = {} as Record<FunnelMetricKey, FunnelMetricAnswer>
  for (const field of metricFields) {
    const metric = metrics[field.key]
    normalized[field.key] = {
      value:
        metric.confidence === 'not-tracked' || metric.value.trim() === ''
          ? null
          : Number(metric.value),
      confidence: metric.confidence,
    }
  }

  return {
    metrics: normalized,
    responseTime: form.responseTime,
    followUpAttempts: form.followUpAttempts,
    attributionCoverage: form.attributionCoverage,
  }
}

function formatPercent(value: number | null) {
  return value === null ? 'Not available' : `${Math.round(value * 100)}%`
}

function formatCurrency(value: number | null) {
  if (value === null) return 'Not available'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function MetricInput({
  field,
  metric,
  onChange,
}: {
  field: (typeof metricFields)[number]
  metric: MetricFormValue
  onChange: (value: MetricFormValue) => void
}) {
  const notTracked = metric.confidence === 'not-tracked'

  return (
    <div className="grid gap-3 border-b border-ink/10 py-4 last:border-b-0 sm:grid-cols-[1fr_130px_145px] sm:items-center">
      <div>
        <label htmlFor={`assessment-${field.key}`} className="block text-[14px] font-semibold text-ink">
          {field.label}
        </label>
        <p className="mt-1 text-[12px] leading-[1.45] text-warm">{field.help}</p>
      </div>
      <div className="relative">
        {field.currency ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-medium text-warm">$</span>
        ) : null}
        <input
          id={`assessment-${field.key}`}
          required={!notTracked}
          disabled={notTracked}
          inputMode={field.currency ? 'decimal' : 'numeric'}
          min="0"
          max="10000000"
          step={field.currency ? '0.01' : '1'}
          type="number"
          value={metric.value}
          onChange={(event) => onChange({ ...metric, value: event.target.value })}
          className={`w-full rounded-lg border border-ink/15 bg-ivory py-3 pr-3 text-[15px] text-ink outline-none transition focus:border-phoenix focus:ring-1 focus:ring-phoenix disabled:cursor-not-allowed disabled:bg-ink/[.04] disabled:text-warm ${field.currency ? 'pl-7' : 'pl-3'}`}
          aria-label={`${field.label} value`}
        />
      </div>
      <select
        aria-label={`${field.label} tracking confidence`}
        value={metric.confidence}
        onChange={(event) => {
          const confidence = event.target.value as MetricConfidence
          onChange({ value: confidence === 'not-tracked' ? '' : metric.value, confidence })
        }}
        className="w-full rounded-lg border border-ink/15 bg-white px-3 py-3 text-[13px] font-medium text-ink outline-none transition focus:border-phoenix focus:ring-1 focus:ring-phoenix"
      >
        <option value="exact">Exact</option>
        <option value="estimate">Best estimate</option>
        <option value="not-tracked">Not tracked</option>
      </select>
    </div>
  )
}

function SnapshotResults({ result, firstName, copy }: { result: AssessmentResult; firstName: string; copy: ReturnType<typeof getJourneyCopy> }) {
  const snapshot = result.snapshot
  const drop = snapshot.largestDrop
  const improvement = snapshot.improvement
  const visibilityCopy = snapshot.trackedCoreMetrics === snapshot.totalCoreMetrics
    ? `${snapshot.exactCoreMetrics} are reported as exact.`
    : `${snapshot.totalCoreMetrics - snapshot.trackedCoreMetrics} core measurements are not currently tracked.`

  return (
    <>
      <div className="mx-auto max-w-[760px] text-center">
        <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-phoenix" aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-ember">{copy.eyebrow}</p>
        <h1 className="mt-4 text-[34px] font-bold leading-[1.04] text-ink md:text-[48px]">
          {firstName ? `${firstName}, here’s` : 'Here’s'} what your numbers show.
        </h1>
        <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-[1.65] text-warm">
          This is a directional operating snapshot based on the numbers you supplied, not a forecast or guarantee.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[980px] gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-ink/10 bg-white p-5 text-left shadow-sm">
          <Eye className="h-5 w-5 text-phoenix" aria-hidden="true" />
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.08em] text-warm">Data visibility</p>
          <p className="mt-2 text-[30px] font-bold text-ink">{snapshot.trackedCoreMetrics}/{snapshot.totalCoreMetrics}</p>
          <p className="mt-1 text-[13px] leading-[1.5] text-warm">{visibilityCopy}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-5 text-left shadow-sm">
          <LineChart className="h-5 w-5 text-phoenix" aria-hidden="true" />
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.08em] text-warm">{copy.rateLabel}</p>
          <p className="mt-2 text-[30px] font-bold text-ink">{formatPercent(snapshot.rates.leadToStartRate)}</p>
          <p className="mt-1 text-[13px] leading-[1.5] text-warm">{copy.rateDescription}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-5 text-left shadow-sm">
          <Gauge className="h-5 w-5 text-phoenix" aria-hidden="true" />
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.08em] text-warm">{copy.costLabel}</p>
          <p className="mt-2 text-[30px] font-bold text-ink">{formatCurrency(snapshot.costs.perStart)}</p>
          <p className="mt-1 text-[13px] leading-[1.5] text-warm">Media spend divided by reported starts of care.</p>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-[980px] border-y border-ink/10 py-7 text-left">
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.1em] text-ember"><Target className="h-4 w-4" aria-hidden="true" /> Largest visible drop-off</p>
            <p className="mt-3 text-[22px] font-bold leading-[1.2] text-ink">{drop ? `${copy.stageLabels[drop.from]} → ${copy.stageLabels[drop.to]}` : 'More tracking is needed'}</p>
            <p className="mt-2 text-[14px] leading-[1.6] text-warm">{drop ? `${formatPercent(drop.conversionRate)} moved through this handoff in the period you entered.` : 'We could not calculate a reliable stage-to-stage rate from the available entries.'}</p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.1em] text-ember"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Conservative scenario</p>
            <p className="mt-3 text-[22px] font-bold leading-[1.2] text-ink">{improvement ? `About ${improvement.additionalStarts.toFixed(1)} additional starts` : 'A scenario needs more data'}</p>
            <p className="mt-2 text-[14px] leading-[1.6] text-warm">{improvement ? `This models a 10-point improvement from ${copy.stageLabels[improvement.from]} to ${copy.stageLabels[improvement.to]}, while holding your reported downstream rates constant.${improvement.estimatedValue === null ? '' : ` At your entered value per ${copy.valueNoun}, that is approximately ${formatCurrency(improvement.estimatedValue)}.`}` : 'Track consecutive funnel stages to see what a modest improvement could produce.'}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export function GrowthAssessmentClient() {
  const { prefill, clearPrefill } = useAssessmentPrefill()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [metrics, setMetrics] = useState<MetricForm>(initialMetrics)
  const [publicCounts, setPublicCounts] = useState<PublicFunnelInput>({ inquiries: '', booked: '', attended: '' })
  const [submitting, setSubmitting] = useState(false)
  const [verificationSubmission, setVerificationSubmission] = useState('')
  const [consent, setConsent] = useState(EMPTY_CONSENT)
  const contactSubmissionIdRef = useRef('')
  const submissionIdRef = useRef('')
  const developmentPreviewRef = useRef(false)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [developmentPreview, setDevelopmentPreview] = useState(false)
  const [healthcareAudience, setHealthcareAudience] = useState(false)
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [contactTouched, setContactTouched] = useState({ email: false, phone: false })
  const prefillAppliedRef = useRef(false)
  const industryPrefillAppliedRef = useRef(false)
  const demoAppliedRef = useRef(false)
  const stepFocusReadyRef = useRef(false)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const selectedIndustry = parseAssessmentIndustry(form.industry)
  const journeyCopy = getJourneyCopy(selectedIndustry, !selectedIndustry && healthcareAudience)
  const snapshotPreview = useMemo(() => calculateGrowthSnapshot(metricFormToInput(form, metrics)), [form, metrics])
  const publicResult = useMemo(() => calculatePublicFunnel(publicCounts), [publicCounts])

  useEffect(() => {
    if (!import.meta.env.DEV || demoAppliedRef.current) return
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (!preview) return
    demoAppliedRef.current = true
    developmentPreviewRef.current = true
    const frame = window.requestAnimationFrame(() => {
      setDevelopmentPreview(true)
      const demoSnapshot = calculateGrowthSnapshot(metricFormToInput(demoForm, demoMetrics))
      setForm(demoForm)
      setMetrics(demoMetrics)

      if (preview === 'calculator') {
        setStep(0)
        return
      }
      if (/^step[1-4]$/.test(preview)) {
        setStep(Number(preview.slice(-1)))
        return
      }

      const fit = preview === 'foundation'
        ? { path: 'foundation', tier: 'foundation', score: 3, summary: 'Foundation preview.' }
        : preview === 'emerging'
          ? { path: 'readiness-review', tier: 'emerging', score: 5, summary: 'Emerging preview.' }
          : { path: 'calendar', tier: 'ready-now', score: 7, summary: 'Ready-now preview.' }
      setAssessmentResult({ fit: fit as AssessmentResult['fit'], snapshot: demoSnapshot, bookingContact: null })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!prefill || prefillAppliedRef.current) return
    const frame = window.requestAnimationFrame(() => {
      if (prefillAppliedRef.current) return
      prefillAppliedRef.current = true
      setForm((current) => ({ ...current, firstName: prefill.firstName, lastName: prefill.lastName, email: prefill.email, phone: prefill.phone }))
      if (prefill.consent) setConsent(prefill.consent)
      if (isValidContactEmail(prefill.email) && isValidContactPhone(prefill.phone)) setStep(2)
      clearPrefill()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [clearPrefill, prefill])

  useEffect(() => {
    if (industryPrefillAppliedRef.current) return
    const frame = window.requestAnimationFrame(() => {
      if (industryPrefillAppliedRef.current) return
      industryPrefillAppliedRef.current = true
      const searchParams = new URLSearchParams(window.location.search)
      const requestedIndustry = parseAssessmentIndustry(searchParams.get('industry'))
      setHealthcareAudience(searchParams.get('audience') === 'healthcare')
      if (requestedIndustry) setForm((current) => current.industry ? current : { ...current, industry: requestedIndustry })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!stepFocusReadyRef.current) {
      stepFocusReadyRef.current = true
      return
    }
    const frame = window.requestAnimationFrame(() => stepHeadingRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [step])

  useEffect(() => {
    if (!assessmentResult) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [assessmentResult, calendarVisible])

  const update = (field: keyof FormData, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const emailInvalid = contactTouched.email && !isValidContactEmail(form.email)
  const phoneInvalid = contactTouched.phone && !isValidContactPhone(form.phone)
  const canProceed1 = form.firstName.trim().length > 0 && isValidContactEmail(form.email) && isValidContactPhone(form.phone)
  const canProceed2 = Boolean(form.businessName.trim() && form.industry && form.annualRevenue && form.monthlyBudget)
  const canProceed3 = Boolean(form.capacity && form.decisionRole && form.implementationTiming && form.followUpOwner && form.responseTime && form.followUpAttempts && form.attributionCoverage)
  const canSubmit = metricFields.every(({ key }) => metrics[key].confidence === 'not-tracked' || metrics[key].value.trim() !== '')

  const continueFromCalculator = () => {
    if (publicResult) {
      setMetrics((current) => ({
        ...current,
        leads: { value: String(publicResult.inquiries), confidence: 'estimate' },
        booked: { value: String(publicResult.booked), confidence: 'estimate' },
        showed: { value: String(publicResult.attended), confidence: 'estimate' },
      }))
    }
    setStep(1)
  }

  const saveContactAndContinue = async () => {
    if (!canProceed1 || submitting) return
    if (developmentPreviewRef.current) {
      setError('')
      setStep(2)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await ensureIntakeSession()
      if (!contactSubmissionIdRef.current) contactSubmissionIdRef.current = crypto.randomUUID()
      const response = await fetch('/api/growth-assessment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, consent, website, submissionType: 'homepage-quick-form', submissionId: contactSubmissionIdRef.current, attribution: getAssessmentAttribution() }),
      })
      const result = await response.json() as AssessmentHandoffState & { saved?: boolean; verificationAvailable?: boolean; code?: string; message?: string }
      if (!response.ok || !(result.saved || result.crmSynced)) {
        if (result.code === 'SUBMISSION_CONFLICT') contactSubmissionIdRef.current = ''
        throw new Error(result.message || 'We could not save your details. Please try again.')
      }
      setVerificationSubmission(result.verificationAvailable && assessmentHandoffStatus(result).verificationNeeded ? contactSubmissionIdRef.current : '')
      setStep(2)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    const snapshotInput = metricFormToInput(form, metrics)
    if (developmentPreviewRef.current) {
      const snapshot = calculateGrowthSnapshot(snapshotInput)
      const fit = assessGrowthFit({
        annualRevenue: form.annualRevenue,
        monthlyBudget: form.monthlyBudget,
        capacity: form.capacity,
        decisionRole: form.decisionRole,
        implementationTiming: form.implementationTiming,
        followUpOwner: form.followUpOwner,
        trackedMetricCount: snapshot.trackedCoreMetrics,
      })
      setError('')
      setAssessmentResult({ fit, snapshot, bookingContact: null })
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await ensureIntakeSession()
      if (!submissionIdRef.current) submissionIdRef.current = crypto.randomUUID()
      const response = await fetch('/api/growth-assessment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, snapshot: snapshotInput, consent, website, submissionId: submissionIdRef.current, attribution: getAssessmentAttribution() }),
      })
      const result = await response.json().catch(() => null) as (AssessmentHandoffState & { code?: string; message?: string; verificationAvailable?: boolean; bookingReady?: boolean; fit?: AssessmentResult['fit']; snapshot?: GrowthSnapshotResult }) | null
      if (!response.ok || !result?.fit || !result.snapshot) {
        if (result?.code === 'SUBMISSION_CONFLICT') submissionIdRef.current = ''
        throw new Error(result?.message || 'We could not build your snapshot. Please try again.')
      }

      let bookingContact: BookingContact | null = null
      if (result.bookingReady) {
        try {
          const bookingResponse = await fetch('/api/booking-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
          const bookingResult = await bookingResponse.json().catch(() => null) as { message?: string; bookingContact?: unknown } | null
          if (bookingResponse.ok && isBookingContact(bookingResult?.bookingContact)) bookingContact = bookingResult.bookingContact
        } catch {
          // Keep the completed report even when the calendar handoff is offline.
        }
      }
      setVerificationSubmission(result.verificationAvailable && assessmentHandoffStatus(result).verificationNeeded ? submissionIdRef.current : '')
      setAssessmentResult({ fit: result.fit, snapshot: result.snapshot, bookingContact, handoffPending: !bookingContact, delivery: { crmSynced: result.crmSynced, recoveryState: result.recoveryState } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (assessmentResult) {
    const handoff = assessmentHandoffStatus(assessmentResult.delivery || {})
    const isFoundation = assessmentResult.fit.path === 'foundation'
    const isEmerging = assessmentResult.fit.path === 'readiness-review'
    return (
      <main className="min-h-screen bg-ivory pb-20 pt-32 grain-subtle">
        <div className="mx-auto px-5 lg:px-10">
          <SnapshotResults result={assessmentResult} firstName={form.firstName} copy={journeyCopy} />
          <div className="mx-auto mt-6 max-w-[760px] text-center print:hidden">
            <button type="button" onClick={() => window.print()} className="rounded-lg border border-ink/20 px-5 py-3 text-[14px] font-semibold text-ink hover:bg-white">Save or print this report</button>
            {assessmentResult.handoffPending ? <p role="status" className="mt-4 rounded-lg border border-ink/15 bg-white p-4 text-[15px] leading-relaxed text-ink">Your assessment is saved and this report uses only the answers you just submitted. Online scheduling is not ready for this request. No report email has been sent. Save a copy before leaving; you can complete a fresh assessment at any time.</p> : null}
            {verificationSubmission ? <><VerificationAction submissionId={verificationSubmission} /><button type="button" className="mt-3 font-semibold text-phoenix" onClick={() => { setAssessmentResult(null); setStep(4) }}>After verifying in this browser, return to the final step and retry the handoff</button></> : null}
          </div>
          <div className="mx-auto mt-8 max-w-[760px] text-center">
            {isFoundation ? (
              <div className="border-t border-ink/10 pt-8">
                <Shield className="mx-auto h-8 w-8 text-phoenix" aria-hidden="true" />
                <h2 className="mt-4 text-[28px] font-bold text-ink">Build the foundation before adding more demand.</h2>
                <p className="mx-auto mt-3 max-w-[620px] text-[15px] leading-[1.65] text-warm">Your answers suggest that capacity, decision access, operating ownership, or acquisition investment should be strengthened before a full diagnostic. Begin by tracking the missing handoffs for one complete month.</p>
                <Link href="/growth-system" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-coal">Review the Growth System <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            ) : calendarVisible && (assessmentResult.bookingContact || developmentPreview) ? (
              <div className="border-t border-ink/10 pt-8">
                <h2 className="text-[30px] font-bold text-ink">Choose your diagnostic time.</h2>
                {assessmentResult.bookingContact ? (
                  <>
                    <p className="mx-auto mt-3 max-w-[620px] text-[15px] leading-[1.65] text-warm">Your contact information will be passed securely to the calendar. Bring the source numbers behind your estimates where available.</p>
                    <BookingCalendar contact={assessmentResult.bookingContact} />
                  </>
                ) : (
                  <div className="mx-auto mt-6 max-w-[620px] rounded-lg border border-ink/10 bg-white p-6 text-left shadow-sm">
                    <p className="text-[14px] font-semibold text-ink">Calendar handoff preview</p>
                    <p className="mt-2 text-[14px] leading-[1.6] text-warm">In the live flow, the secure scheduling calendar appears here after the assessment is saved. Preview mode does not create a CRM contact or appointment.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-ink/10 pt-8">
                <CalendarClock className="mx-auto h-8 w-8 text-phoenix" aria-hidden="true" />
                <h2 className="mt-4 text-[28px] font-bold text-ink">{isEmerging ? 'There may be a practical starting point.' : 'You appear ready for a working diagnostic.'}</h2>
                <p className="mx-auto mt-3 max-w-[620px] text-[15px] leading-[1.65] text-warm">{isEmerging ? 'You may be earlier than our typical full-build client, but your operating answers suggest a focused conversation could still be productive.' : 'Use the diagnostic to validate the visible drop-off, review the handoffs behind it, and determine the most useful next move.'}</p>
                {assessmentResult.handoffPending ? <p className="mt-6 text-[15px] leading-relaxed text-warm">The next step is a 30-minute diagnostic. {handoff.message} Online scheduling is not available on this report yet.</p> : <button type="button" onClick={() => setCalendarVisible(true)} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-4 text-[15px] font-semibold text-white shadow-lg transition-colors hover:bg-ember">Map the Fix in a 30-Minute Diagnostic <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
              </div>
            )}
            <button type="button" onClick={() => {
              contactSubmissionIdRef.current = ''
              setVerificationSubmission('')
              submissionIdRef.current = ''
              setAssessmentResult(null)
              setCalendarVisible(false)
              setForm(initialForm)
              setMetrics(initialMetrics)
              setConsent(EMPTY_CONSENT)
              setError('')
              setStep(0)
            }} className="mt-8 mr-6 inline-flex text-[14px] font-semibold text-phoenix hover:text-ember print:hidden">Start a new assessment</button>
            <Link href="/" className="mt-8 inline-flex text-[14px] font-semibold text-warm hover:text-ink print:hidden">Back to Home</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ivory grain-subtle">
      <section className="pb-11 pt-32 md:pb-14 md:pt-40">
        <div className="mx-auto max-w-[820px] px-5 text-center">
          <AnimatedSection>
            <h1 className="text-[36px] font-bold leading-[1.04] text-ink md:text-[54px]">{step === 0 ? <>See Where <span className="text-phoenix">Demand Stops Moving</span></> : <>Build Your <span className="text-phoenix">{journeyCopy.headline}</span></>}</h1>
            <p className="mx-auto mt-5 max-w-[650px] text-[16px] leading-[1.65] text-warm md:text-[17px]">{step === 0 ? 'Use three numbers from a recent 30-day period to see two handoffs in your acquisition funnel. Try it free, without sharing contact details.' : 'Use your most recent complete 30-day period. Exact numbers are best, estimates are useful, and “not tracked” is a valid answer.'}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-warm"><span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-phoenix" aria-hidden="true" /> {step === 0 ? 'About 30 seconds' : 'About 3 minutes'}</span><span className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-phoenix" aria-hidden="true" /> {step === 0 ? 'Live conversion math' : 'Immediate KPI snapshot'}</span><span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-phoenix" aria-hidden="true" /> No performance guarantee</span></div>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        {verificationSubmission ? <div className="mx-auto mb-5 max-w-[760px] px-5"><VerificationAction submissionId={verificationSubmission} /></div> : null}
        <form name="growth-assessment-full" onSubmit={handleSubmit} className="mx-auto max-w-[760px] px-5">
          <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="assessment-website">Website</label><input id="assessment-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
          {Object.entries(form).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
          {developmentPreview ? <div className="mb-5 rounded-lg border border-phoenix/20 bg-white px-4 py-3 text-center text-[13px] font-medium text-warm"><span className="font-semibold text-phoenix">Preview mode:</span> your entries stay in this browser and are not saved or sent to the CRM.</div> : null}
          {step > 0 ? <div className="mb-8" role="progressbar" aria-label="Growth snapshot progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step} aria-valuetext={`Step ${step} of 4`}>
            <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-warm"><span>Step {step} of 4</span><span>{['Save your snapshot', 'Practice baseline', 'Operating readiness', 'Funnel numbers'][step - 1]}</span></div>
            <div className="flex gap-2">{[1, 2, 3, 4].map((value) => <div key={value} className={`h-1.5 flex-1 rounded-full transition-colors ${value <= step ? 'bg-phoenix' : 'bg-ink/10'}`} />)}</div>
          </div> : null}

          {step === 0 ? <PublicFunnelStep counts={publicCounts} setCounts={setPublicCounts} result={publicResult} onContinue={continueFromCalculator} headingRef={stepHeadingRef} isHomeServices={selectedIndustry === 'home-services'} /> : null}
          {step === 1 ? <><button type="button" onClick={() => setStep(0)} className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-warm hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to free check</button><ContactStep form={form} consent={consent} setConsent={setConsent} update={update} emailInvalid={emailInvalid} phoneInvalid={phoneInvalid} setContactTouched={setContactTouched} error={error} submitting={submitting} canProceed={canProceed1} onContinue={saveContactAndContinue} headingRef={stepHeadingRef} /></> : null}
          {step === 2 ? <BaselineStep form={form} update={update} canProceed={canProceed2} onBack={() => setStep(1)} onContinue={() => setStep(3)} headingRef={stepHeadingRef} /> : null}
          {step === 3 ? <ReadinessStep form={form} update={update} canProceed={canProceed3} onBack={() => setStep(2)} onContinue={() => setStep(4)} headingRef={stepHeadingRef} /> : null}
          {step === 4 ? <MetricsStep fields={journeyCopy.metricFields} metrics={metrics} setMetrics={setMetrics} snapshotPreview={snapshotPreview} canSubmit={canSubmit} submitting={submitting} error={error} onBack={() => setStep(3)} headingRef={stepHeadingRef} /> : null}
        </form>
      </section>
    </main>
  )
}

type StepHeadingRef = RefObject<HTMLHeadingElement | null>

function PublicFunnelStep({ counts, setCounts, result, onContinue, headingRef, isHomeServices }: {
  counts: PublicFunnelInput
  setCounts: Dispatch<SetStateAction<PublicFunnelInput>>
  result: PublicFunnelResult | null
  onContinue: () => void
  headingRef: StepHeadingRef
  isHomeServices: boolean
}) {
  const complete = counts.inquiries.trim() !== '' && counts.booked.trim() !== '' && counts.attended.trim() !== ''
  const labels: { key: keyof PublicFunnelInput; label: string; hint: string }[] = [
    { key: 'inquiries', label: 'New inquiries', hint: 'Calls, forms, chats, and other new leads' },
    { key: 'booked', label: isHomeServices ? 'Visits booked' : 'First visits booked', hint: 'New prospects who selected a time' },
    { key: 'attended', label: isHomeServices ? 'Visits completed' : 'First visits attended', hint: 'Booked prospects who actually showed up' },
  ]

  return <AnimatedSection>
    <div className="rounded-lg bg-white p-6 shadow-xl md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase text-phoenix">Free funnel check</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-[23px] font-semibold text-ink outline-none">Your last complete 30 days</h2>
        </div>
        <BarChart3 className="h-6 w-6 shrink-0 text-phoenix" aria-hidden="true" />
      </div>
      <p className="mt-2 text-[14px] leading-[1.6] text-warm">Estimates are fine. Leave these blank if you do not track them yet.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {labels.map(({ key, label, hint }) => <div key={key}>
          <label htmlFor={`public-${key}`} className="block text-[13px] font-semibold text-ink">{label}</label>
          <p className="mt-1 min-h-[36px] text-[12px] leading-[1.45] text-warm">{hint}</p>
          <input id={`public-${key}`} type="number" min="0" max="10000000" step="1" inputMode="numeric" value={counts[key]} onChange={(event) => setCounts((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[18px] font-semibold text-ink outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix" placeholder={key === 'inquiries' ? '80' : key === 'booked' ? '28' : '20'} />
        </div>)}
      </div>
      <div aria-live="polite" className="mt-7 border-t border-ink/10 pt-6">
        {result ? <>
          <p className="text-[12px] font-bold uppercase text-warm">What your numbers show</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div><p className="text-[30px] font-bold leading-none text-ink">{Math.round(result.bookingRate * 100)}%</p><p className="mt-2 text-[13px] font-semibold text-ink">Inquiry to booking</p><p className="mt-1 text-[12px] leading-[1.5] text-warm">{result.notBooked} of {result.inquiries} inquiries did not book.</p></div>
            <div><p className="text-[30px] font-bold leading-none text-ink">{result.booked === 0 ? '—' : `${Math.round(result.attendanceRate * 100)}%`}</p><p className="mt-2 text-[13px] font-semibold text-ink">Booking to attended visit</p><p className="mt-1 text-[12px] leading-[1.5] text-warm">{result.booked === 0 ? 'No bookings to evaluate yet.' : `${result.didNotAttend} of ${result.booked} bookings did not attend.`}</p></div>
          </div>
          <p className="mt-5 border-l-2 border-phoenix pl-4 text-[13px] leading-[1.55] text-ink">The larger observed handoff gap is <strong>{result.largestGap === 'booking' ? 'inquiry to booking' : 'booking to attended visit'}</strong>. That is a place to investigate, not proof of why people dropped off.</p>
        </> : <p className="text-[13px] leading-[1.55] text-warm">{complete ? 'Check the sequence: bookings cannot exceed inquiries, and attended visits cannot exceed bookings. Use whole numbers.' : 'Enter all three counts to see your conversion rates. No contact details are needed.'}</p>}
      </div>
      <button type="button" onClick={onContinue} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-phoenix px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-ember">{result ? 'Save My Full Snapshot' : 'Continue Without Numbers'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      <p className="mt-3 text-center text-[11.5px] leading-[1.5] text-warm">This calculation stays in your browser until you choose to continue. It is not a forecast or performance guarantee.</p>
    </div>
  </AnimatedSection>
}

function ContactStep({ form, consent, setConsent, update, emailInvalid, phoneInvalid, setContactTouched, error, submitting, canProceed, onContinue, headingRef }: {
  form: FormData
  consent: typeof EMPTY_CONSENT
  setConsent: (value: typeof EMPTY_CONSENT) => void
  update: (field: keyof FormData, value: string) => void
  emailInvalid: boolean
  phoneInvalid: boolean
  setContactTouched: Dispatch<SetStateAction<{ email: boolean; phone: boolean }>>
  error: string
  submitting: boolean
  canProceed: boolean
  onContinue: () => void
  headingRef: StepHeadingRef
}) {
  return <AnimatedSection><div className="rounded-2xl bg-white p-6 shadow-xl md:p-8"><h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-semibold text-ink outline-none">Save Your Snapshot</h2><p className="mt-2 text-[13px] leading-[1.55] text-warm">We’ll save your progress for your snapshot and requested diagnostic follow-up. Your contact preferences control the available channels.</p><div className="mt-6 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="assessment-first-name" className="mb-1.5 block text-[13px] font-medium text-ink">First Name *</label><input id="assessment-first-name" required autoComplete="given-name" type="text" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix" /></div><div><label htmlFor="assessment-last-name" className="mb-1.5 block text-[13px] font-medium text-ink">Last Name</label><input id="assessment-last-name" autoComplete="family-name" type="text" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix" /></div></div><div><label htmlFor="assessment-email" className="mb-1.5 block text-[13px] font-medium text-ink">Work Email *</label><input id="assessment-email" required autoComplete="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} onBlur={() => setContactTouched((current) => ({ ...current, email: true }))} aria-invalid={emailInvalid} aria-describedby={emailInvalid ? 'assessment-email-error' : undefined} className={`w-full rounded-lg border bg-ivory px-4 py-3 text-[15px] text-ink outline-none focus:ring-1 ${emailInvalid ? 'border-red-600 focus:ring-red-600' : 'border-ink/15 focus:border-phoenix focus:ring-phoenix'}`} />{emailInvalid ? <p id="assessment-email-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-700">Enter a valid email address.</p> : null}</div><div><label htmlFor="assessment-phone" className="mb-1.5 block text-[13px] font-medium text-ink">Phone *</label><input id="assessment-phone" required autoComplete="tel" type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} onBlur={() => setContactTouched((current) => ({ ...current, phone: true }))} aria-invalid={phoneInvalid} aria-describedby={phoneInvalid ? 'assessment-phone-error' : undefined} className={`w-full rounded-lg border bg-ivory px-4 py-3 text-[15px] text-ink outline-none focus:ring-1 ${phoneInvalid ? 'border-red-600 focus:ring-red-600' : 'border-ink/15 focus:border-phoenix focus:ring-phoenix'}`} />{phoneInvalid ? <p id="assessment-phone-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-700">Enter a valid phone number, including area code.</p> : null}</div></div><ContactConsentFields value={consent} onChange={setConsent} />{error ? <p role="alert" className="mt-3 text-[13px] text-red-700">{error}</p> : null}<button type="button" onClick={onContinue} disabled={!canProceed || submitting} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Saving...' : 'Continue to Practice Baseline'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button><p className="mt-4 text-center text-[12px] text-warm">Read our <Link href="/privacy-policy" className="font-semibold text-phoenix hover:underline">Privacy Policy</Link>.</p></div></AnimatedSection>
}

function BaselineStep({ form, update, canProceed, onBack, onContinue, headingRef }: { form: FormData; update: (field: keyof FormData, value: string) => void; canProceed: boolean; onBack: () => void; onContinue: () => void; headingRef: StepHeadingRef }) {
  return <AnimatedSection><div className="rounded-2xl bg-white p-6 shadow-xl md:p-8"><h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-semibold text-ink outline-none">Practice Baseline</h2><p className="mt-2 text-[13px] text-warm">These are context signals, not a two-number pass/fail test.</p><div className="mt-6 space-y-4"><div><label htmlFor="assessment-business-name" className="mb-1.5 block text-[13px] font-medium text-ink">Practice Name *</label><input id="assessment-business-name" required autoComplete="organization" type="text" value={form.businessName} onChange={(event) => update('businessName', event.target.value)} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink" /></div><div className="grid gap-4 sm:grid-cols-2"><SelectField id="assessment-industry" label="Industry *" required value={form.industry} onChange={(value) => update('industry', value)} options={[['chiropractic','Chiropractic'],['dental','Dental'],['medspa','Medspa / Aesthetics'],['home-services','Home Services'],['other-healthcare','Other Healthcare'],['other-service','Other Service Business']]} /><SelectField id="assessment-annual-revenue" label="Annual Revenue *" required value={form.annualRevenue} onChange={(value) => update('annualRevenue', value)} options={[['under-200k','Under $200K'],['200k-300k','$200K–$299,999'],['300k-500k','$300K–$499,999'],['500k-1m','$500K–$999,999'],['1m-plus','$1M or more']]} /></div><SelectField id="assessment-monthly-budget" label="Planned Monthly Paid-Media Budget *" required value={form.monthlyBudget} onChange={(value) => update('monthlyBudget', value)} options={[['under-1k','Under $1,000/mo'],['1k-2k','$1,000–$1,999/mo'],['2k-3k','$2,000–$2,999/mo'],['3k-5k','$3,000–$4,999/mo'],['5k-plus','$5,000/mo or more']]} help="Media only. Implementation and ongoing PhynyxPro operation are separate." /><SelectField id="assessment-biggest-challenge" label="Biggest Challenge Right Now" value={form.biggestChallenge} onChange={(value) => update('biggestChallenge', value)} options={[['not-enough-leads','Not enough leads'],['leads-not-converting','Leads are not booking'],['no-show-rate','High no-show or cancellation rate'],['no-attribution','Cannot track what is working'],['follow-up','Slow or inconsistent follow-up'],['scaling','Ready to scale but systems are not in place']]} /><div><label htmlFor="assessment-current-marketing" className="mb-1.5 block text-[13px] font-medium text-ink">Current Marketing Approach</label><textarea id="assessment-current-marketing" rows={2} value={form.currentMarketing} onChange={(event) => update('currentMarketing', event.target.value)} className="w-full resize-none rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink" placeholder="Meta, Google, referrals, community events..." /></div></div><StepButtons onBack={onBack} onContinue={onContinue} canProceed={canProceed} nextLabel="Operating Readiness" /></div></AnimatedSection>
}

function ReadinessStep({ form, update, canProceed, onBack, onContinue, headingRef }: { form: FormData; update: (field: keyof FormData, value: string) => void; canProceed: boolean; onBack: () => void; onContinue: () => void; headingRef: StepHeadingRef }) {
  return <AnimatedSection><div className="rounded-2xl bg-white p-6 shadow-xl md:p-8"><h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-semibold text-ink outline-none">Operating Readiness</h2><p className="mt-2 text-[13px] text-warm">The best fit is determined by the ability to act, not revenue alone.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><SelectField id="assessment-capacity" label="Additional Day 1 Capacity *" required value={form.capacity} onChange={(value) => update('capacity', value)} options={[['none','No open capacity'],['1-5','1–5 appointments'],['6-10','6–10 appointments'],['11-20','11–20 appointments'],['20-plus','More than 20']]} /><SelectField id="assessment-decision-role" label="Decision-Making Role *" required value={form.decisionRole} onChange={(value) => update('decisionRole', value)} options={[['owner','I make the decision'],['partner','I decide with a partner'],['influencer','I recommend to the decision maker'],['researching','I am researching for someone else']]} /><SelectField id="assessment-implementation-timing" label="When Could You Begin? *" required value={form.implementationTiming} onChange={(value) => update('implementationTiming', value)} options={[['within-30-days','Within 30 days'],['31-60-days','31–60 days'],['61-90-days','61–90 days'],['later','More than 90 days'],['researching','Just researching']]} /><SelectField id="assessment-follow-up-owner" label="Human Follow-Up Owner *" required value={form.followUpOwner} onChange={(value) => update('followUpOwner', value)} options={[['yes','Yes, someone owns it'],['unsure','Not yet, but we can assign one'],['no','No one can own it right now']]} /><SelectField id="assessment-response-time" label="Typical First Response *" required value={form.responseTime} onChange={(value) => update('responseTime', value)} options={[['under-5-minutes','Under 5 minutes'],['5-15-minutes','5–15 minutes'],['15-60-minutes','15–60 minutes'],['same-day','Later the same day'],['next-business-day','Next business day'],['not-tracked','Not tracked']]} /><SelectField id="assessment-follow-up-attempts" label="Typical Follow-Up Attempts *" required value={form.followUpAttempts} onChange={(value) => update('followUpAttempts', value)} options={[['one','One'],['2-3','2–3'],['4-6','4–6'],['7-plus','7 or more'],['no-defined-process','No defined process'],['not-tracked','Not tracked']]} /></div><div className="mt-4"><SelectField id="assessment-attribution" label="Can You Trace Starts Back to Their Source? *" required value={form.attributionCoverage} onChange={(value) => update('attributionCoverage', value)} options={[['all','Yes, for nearly all starts'],['some','For some starts'],['none','No'],['not-sure','Not sure']]} /></div><StepButtons onBack={onBack} onContinue={onContinue} canProceed={canProceed} nextLabel="Enter Funnel Numbers" /></div></AnimatedSection>
}

function MetricsStep({ fields, metrics, setMetrics, snapshotPreview, canSubmit, submitting, error, onBack, headingRef }: { fields: MetricField[]; metrics: MetricForm; setMetrics: Dispatch<SetStateAction<MetricForm>>; snapshotPreview: GrowthSnapshotResult; canSubmit: boolean; submitting: boolean; error: string; onBack: () => void; headingRef: StepHeadingRef }) {
  return <AnimatedSection><div className="rounded-2xl bg-white p-6 shadow-xl md:p-8"><h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-semibold text-ink outline-none">Your Most Recent Complete 30 Days</h2><p className="mt-2 text-[13px] leading-[1.55] text-warm">Enter a count, choose whether it is exact or estimated, or mark it not tracked. We calculate the ratios for you.</p><div className="mt-5">{fields.map((field) => <MetricInput key={field.key} field={field} metric={metrics[field.key]} onChange={(value) => setMetrics((current) => ({ ...current, [field.key]: value }))} />)}</div><div className="mt-5 rounded-lg bg-linen px-4 py-3 text-[13px] leading-[1.55] text-ink/80">Current preview: {snapshotPreview.trackedCoreMetrics} of {snapshotPreview.totalCoreMetrics} core measurements tracked. Missing data appears as a visibility opportunity, not a failed answer.</div>{error ? <p role="alert" className="mt-4 text-[13px] text-red-700">{error}</p> : null}<div className="mt-8 flex gap-3"><button type="button" onClick={onBack} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-ink/20 px-4 py-3.5 text-[14px] font-semibold text-ink hover:bg-ink hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button><button type="submit" disabled={submitting || !canSubmit} className="inline-flex flex-[1.5] items-center justify-center gap-2 rounded-lg bg-phoenix px-4 py-3.5 text-[14px] font-semibold text-white hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Building Snapshot...' : 'Show My Growth Snapshot'} {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}</button></div><p className="mt-4 text-center text-[11.5px] leading-[1.5] text-warm">Results are directional and based only on your entries. They are not a forecast, clinical recommendation, or performance guarantee.</p></div></AnimatedSection>
}

function SelectField({ id, label, value, onChange, options, required = false, help }: { id: string; label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]>; required?: boolean; help?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label><select id={id} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix"><option value="">Select one</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select>{help ? <p className="mt-1.5 text-[11.5px] text-warm">{help}</p> : null}</div>
}

function VerificationAction({ submissionId }: { submissionId: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('You can finish your report now. Verify your email before linking this request to an existing contact.')
  async function send() {
    setBusy(true)
    try {
      const response = await fetch('/api/verification/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionId }) })
      const result = await response.json() as { message?: string }
      setMessage(result.message || 'Verification is temporarily unavailable.')
    } catch { setMessage('Verification could not be requested. Your assessment remains saved.') }
    finally { setBusy(false) }
  }
  return <aside className="my-4 rounded-lg border border-ink/15 bg-white p-5 text-left"><p role="status" className="text-sm leading-relaxed">{message}</p><button type="button" disabled={busy} onClick={send} className="mt-3 rounded-lg bg-phoenix px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Requesting…' : 'Send verification email'}</button><p className="mt-3 text-xs text-warm">Open the link, explicitly confirm, then return to this assessment in the same browser. On another device, start a fresh assessment there after verifying.</p></aside>
}

function StepButtons({ onBack, onContinue, canProceed, nextLabel }: { onBack: () => void; onContinue: () => void; canProceed: boolean; nextLabel: string }) {
  return <div className="mt-8 flex gap-3"><button type="button" onClick={onBack} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-ink/20 px-4 py-3.5 text-[14px] font-semibold text-ink hover:bg-ink hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button><button type="button" onClick={onContinue} disabled={!canProceed} className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-lg bg-phoenix px-4 py-3.5 text-[14px] font-semibold text-white hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40">{nextLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>
}
