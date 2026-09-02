'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Shield, AlertCircle } from 'lucide-react'

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

export function GrowthAssessmentClient() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...(prev ?? {}), [field]: value }))
  }

  const canProceed1 = (form?.firstName?.trim?.()?.length ?? 0) > 0 && (form?.email?.trim?.()?.length ?? 0) > 0 && (form?.phone?.trim?.()?.length ?? 0) > 0
  const canProceed2 = (form?.businessName?.trim?.()?.length ?? 0) > 0 && (form?.industry?.trim?.()?.length ?? 0) > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/growth-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      if (!res.ok) throw new Error(result?.message ?? 'Submission failed')
      setSubmitted(true)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-[600px] px-6 text-center">
          <AnimatedSection>
            <CheckCircle2 className="h-16 w-16 text-phoenix mx-auto mb-6" />
            <h1 className="text-[36px] font-bold text-ink">Assessment Received</h1>
            <p className="mt-4 text-[17px] leading-[1.65] text-warm">
              Thank you, {form?.firstName ?? 'there'}. We&apos;ve received your growth assessment request and will review it within one business day. If we believe PhynyxPro is a good fit, we&apos;ll reach out to schedule a 15-minute conversation.
            </p>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Back to Home <ArrowRight className="h-4 w-4" />
            </Link>
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
        <div className="mx-auto max-w-[600px] px-6">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
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
                      <label className="block text-[13px] font-medium text-ink mb-1.5">First Name *</label>
                      <input type="text" value={form?.firstName ?? ''} onChange={(e) => update('firstName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Andrew" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-1.5">Last Name</label>
                      <input type="text" value={form?.lastName ?? ''} onChange={(e) => update('lastName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Higdon" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Email *</label>
                    <input type="email" value={form?.email ?? ''} onChange={(e) => update('email', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="andrew@example.com" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Phone *</label>
                    <input type="tel" value={form?.phone ?? ''} onChange={(e) => update('phone', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="(555) 123-4567" />
                  </div>
                </div>
                <button onClick={() => canProceed1 && setStep(2)} disabled={!canProceed1} className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canProceed1 ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}>
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
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Business Name *</label>
                    <input type="text" value={form?.businessName ?? ''} onChange={(e) => update('businessName', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Your Practice or Company" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Industry *</label>
                    <select value={form?.industry ?? ''} onChange={(e) => update('industry', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
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
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Annual Revenue</label>
                    <select value={form?.annualRevenue ?? ''} onChange={(e) => update('annualRevenue', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
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
                  <button onClick={() => setStep(1)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={() => canProceed2 && setStep(3)} disabled={!canProceed2} className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canProceed2 ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}>
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
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Biggest challenge right now</label>
                    <select value={form?.biggestChallenge ?? ''} onChange={(e) => update('biggestChallenge', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
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
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Current marketing approach</label>
                    <textarea value={form?.currentMarketing ?? ''} onChange={(e) => update('currentMarketing', e?.target?.value ?? '')} rows={3} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition resize-none" placeholder="What are you doing for marketing today? (Google Ads, social, referrals, etc.)" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-ink mb-1.5">Monthly marketing budget</label>
                    <select value={form?.monthlyBudget ?? ''} onChange={(e) => update('monthlyBudget', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition">
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
                  <div className="mt-4 flex items-center gap-2 text-[13px] text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-ember transition-colors disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                </div>

                <p className="mt-4 text-[12px] text-warm text-center">
                  Your information is kept private. We&apos;ll only use it to assess fit and reach out if we believe we can help.
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </main>
  )
}
