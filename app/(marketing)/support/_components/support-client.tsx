'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatedSection } from '../../_components/animated-section'
import { CheckCircle2, AlertCircle, HelpCircle, Send } from 'lucide-react'

export function SupportClient() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const submissionIdRef = useRef('')

  const update = (field: string, value: string) => setForm((p) => ({ ...(p ?? {}), [field]: value }))
  const canSubmit = (form?.name?.trim?.()?.length ?? 0) > 0 && (form?.email?.trim?.()?.length ?? 0) > 0 && (form?.message?.trim?.()?.length ?? 0) > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      if (!submissionIdRef.current) submissionIdRef.current = crypto.randomUUID()
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website,
          submissionId: submissionIdRef.current,
        }),
      })
      const result = (await res.json().catch(() => null)) as {
        code?: string
        message?: string
      } | null
      if (!res.ok) {
        if (result?.code === 'SUBMISSION_CONFLICT') submissionIdRef.current = ''
        throw new Error(result?.message ?? 'Submission failed')
      }
      setSubmitted(true)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-[500px] px-6 text-center">
          <AnimatedSection>
            <CheckCircle2 className="h-16 w-16 text-phoenix mx-auto mb-6" />
            <h1 className="text-[36px] font-bold text-ink">Message Sent</h1>
            <p className="mt-4 text-[17px] leading-[1.65] text-warm">
              Thank you, {form?.name ?? 'there'}. We&apos;ll get back to you within one business day.
            </p>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Back to Home
            </Link>
          </AnimatedSection>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[600px] px-6">
        <AnimatedSection>
          <div className="text-center mb-10">
            <HelpCircle className="h-12 w-12 text-phoenix mx-auto mb-4" />
            <h1 className="text-[36px] font-bold text-ink">Support</h1>
            <p className="mt-3 text-[17px] leading-[1.65] text-warm">
              Have a question about your account, the PYRO platform, or how PhynyxPro works? Send us a message.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="support-website">Website</label>
              <input
                id="support-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Name *</label>
                <input type="text" value={form?.name ?? ''} onChange={(e) => update('name', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Email *</label>
                <input type="email" value={form?.email ?? ''} onChange={(e) => update('email', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Subject</label>
                <input type="text" value={form?.subject ?? ''} onChange={(e) => update('subject', e?.target?.value ?? '')} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition" placeholder="Account help, billing, technical issue..." />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Message *</label>
                <textarea value={form?.message ?? ''} onChange={(e) => update('message', e?.target?.value ?? '')} rows={5} className="w-full rounded-lg border border-ink/15 bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-warm/50 focus:border-phoenix focus:ring-1 focus:ring-phoenix outline-none transition resize-none" placeholder="Tell us how we can help..." />
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-[13px] text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={!canSubmit || submitting} className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-colors ${canSubmit && !submitting ? 'bg-phoenix text-white hover:bg-ember' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}>
              <Send className="h-4 w-4" />
              {submitting ? 'Sending...' : 'Send Message'}
            </button>

            <p className="mt-4 text-[12px] text-warm text-center">
              Your information is kept private and used only to respond to your inquiry.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </main>
  )
}
