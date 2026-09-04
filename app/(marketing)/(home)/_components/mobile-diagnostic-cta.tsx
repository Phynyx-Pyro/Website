'use client'

import { ArrowRight } from 'lucide-react'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'

export function MobileDiagnosticCta() {
  return (
    <aside
      aria-label="Book a patient acquisition diagnostic"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-3 pt-2.5 pb-[max(.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
    >
      <AssessmentCtaLink
        placement="homepage_mobile_sticky"
        industry="chiropractic"
        data-cta-placement="homepage_mobile_sticky"
        className="mx-auto flex w-full max-w-[520px] items-center justify-center gap-2 rounded-lg bg-phoenix px-4 py-3 text-center text-[12.5px] font-semibold leading-tight text-white shadow-[0_10px_24px_-12px_rgba(212,85,42,.95)] transition-colors hover:bg-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Book My Patient Acquisition Diagnostic
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </AssessmentCtaLink>
    </aside>
  )
}
