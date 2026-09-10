'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { AssessmentCtaLink } from '../../_components/assessment-cta-link'

export function MobileDiagnosticCta() {
  const [heroCtaVisible, setHeroCtaVisible] = useState(true)
  const [blockedByContent, setBlockedByContent] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const heroCta = document.getElementById('homepage-primary-cta')
    const blockingTargets = [
      document.getElementById('diagnostic'),
      document.querySelector('footer'),
    ].filter((target): target is HTMLElement => target !== null)

    const heroObserver = heroCta
      ? new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting))
      : null
    const blockingVisibility = new Map<Element, boolean>()
    const blockingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        blockingVisibility.set(entry.target, entry.isIntersecting)
      })
      setBlockedByContent([...blockingVisibility.values()].some(Boolean))
    })

    if (heroCta) heroObserver?.observe(heroCta)
    blockingTargets.forEach((target) => blockingObserver.observe(target))

    const handleMenuState = (event: Event) => {
      setMenuOpen((event as CustomEvent<boolean>).detail)
    }
    const menuStateFrame = window.requestAnimationFrame(() => {
      setMenuOpen(document.body.dataset.mobileMenuOpen === 'true')
    })
    window.addEventListener('phynyx:mobile-menu', handleMenuState)

    return () => {
      window.cancelAnimationFrame(menuStateFrame)
      heroObserver?.disconnect()
      blockingObserver.disconnect()
      window.removeEventListener('phynyx:mobile-menu', handleMenuState)
    }
  }, [])

  const visible = !heroCtaVisible && !blockedByContent && !menuOpen

  return (
    <aside
      aria-label="Book a patient acquisition diagnostic"
      aria-hidden={!visible}
      data-mobile-diagnostic-sticky="true"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-3 pt-2.5 pb-[max(.625rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-200 lg:hidden ${visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
    >
      <AssessmentCtaLink
        placement="homepage_mobile_sticky"
        industry="chiropractic"
        data-ui-placement="homepage_mobile_sticky"
        tabIndex={visible ? 0 : -1}
        className="mx-auto flex w-full max-w-[520px] items-center justify-center gap-2 rounded-lg bg-phoenix px-4 py-3 text-center text-[12.5px] font-semibold leading-tight text-white shadow-[0_10px_24px_-12px_rgba(184,68,32,.85)] transition-colors hover:bg-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Get My Growth Snapshot
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </AssessmentCtaLink>
    </aside>
  )
}
