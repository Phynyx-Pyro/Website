'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function VerifyPage() {
  const [message, setMessage] = useState('Confirm only if you requested a PhynyxPro assessment. This verifies ownership; it does not opt you into marketing or AI voice calls.')
  const [busy, setBusy] = useState(false)
  const [verified, setVerified] = useState(false)
  async function confirm() {
    setBusy(true)
    try {
      const token = window.location.hash.slice(1)
      window.history.replaceState(null, '', '/verify')
      const response = await fetch('/api/verification/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const result = await response.json() as { message?: string; verified?: boolean }
      setMessage(result.message || 'Verification could not finish.')
      setVerified(response.ok && result.verified === true)
    } catch { setMessage('Verification could not finish. Reopen your email link or request a new one.') }
    finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-ivory px-6 py-32"><div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-lg"><h1 className="text-2xl font-bold">Verify your assessment</h1><p role="status" className="my-6 leading-relaxed">{message}</p>{!verified ? <button disabled={busy} onClick={confirm} className="rounded-lg bg-phoenix px-6 py-3 text-white disabled:opacity-50">{busy ? 'Verifying…' : 'Confirm my request'}</button> : <Link href="/growth-assessment" className="font-semibold text-phoenix">Continue to the assessment</Link>}</div></main>
}
