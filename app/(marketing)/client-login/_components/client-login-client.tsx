'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '../../_components/animated-section'
import { ExternalLink, Lock } from 'lucide-react'

export function ClientLoginClient() {
  return (
    <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[500px] px-6 text-center">
        <AnimatedSection>
          <Lock className="h-12 w-12 text-phoenix mx-auto mb-6" />
          <h1 className="text-[36px] font-bold text-ink">Client Login</h1>
          <p className="mt-4 text-[17px] leading-[1.65] text-warm">
            Access your PYRO dashboard, CRM pipeline, reporting, and all growth system tools.
          </p>
          <div className="mt-10 rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="relative h-8 w-8">
                <Image src="/images/pyro-icon.png" alt="PYRO" fill className="object-contain" />
              </div>
              <p className="text-[18px] font-bold text-ink">PYRO</p>
              <span className="text-[14px] text-warm">by PhynyxPro</span>
            </div>
            <a href="https://app.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-phoenix px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg hover:bg-ember transition-colors">
              Open PYRO Dashboard <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-4 text-[13px] text-warm">
              You&apos;ll be redirected to the PYRO platform. Use the credentials provided during onboarding.
            </p>
          </div>
          <p className="mt-8 text-[14px] text-warm">
            Not a client yet?{' '}
            <Link href="/growth-assessment" className="text-phoenix font-medium hover:underline">Book a Growth Assessment</Link>
          </p>
          <p className="mt-3 text-[13px] text-warm">
            Need help?{' '}
            <Link href="/support" className="text-phoenix font-medium hover:underline">Contact Support</Link>
          </p>
        </AnimatedSection>
      </div>
    </main>
  )
}
