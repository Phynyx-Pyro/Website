'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { AssessmentIndustry } from '@/lib/assessment-industry'

const LIVE_CTA_ORIGINS = {
  about_final: 'about-footer',
  chiropractic_final: 'chiropractic-footer',
  chiropractic_hero: 'chiropractic-hero',
  client_login_prospect: 'client-login',
  dental_medspa_final: 'dental-medspa-footer',
  dental_medspa_hero: 'dental-medspa-hero',
  growth_system_final: 'growth-system-footer',
  growth_system_hero: 'growth-system-footer',
  header_desktop: 'site-header-desktop',
  header_mobile: 'site-header-mobile',
  home_services_final: 'home-services-footer',
  home_services_hero: 'home-services-hero',
  homepage_hero: 'homepage-hero',
  homepage_journey: 'homepage-hero',
  homepage_mobile_sticky: 'homepage-hero',
  industries_final: 'industries-footer',
  industries_other_card: 'industries-other-card',
  pyro_final: 'pyro-ember-footer',
  pyro_hero: 'pyro-ember-hero',
  results_final: 'results-footer',
} as const

type AssessmentCtaPlacement = keyof typeof LIVE_CTA_ORIGINS

type AssessmentCtaLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  placement: AssessmentCtaPlacement
  industry?: AssessmentIndustry
  audience?: 'healthcare'
}

export function AssessmentCtaLink({
  placement,
  industry,
  audience,
  ...props
}: AssessmentCtaLinkProps) {
  const livePlacement = LIVE_CTA_ORIGINS[placement]
  const params = new URLSearchParams({ cta: livePlacement })
  if (industry) params.set('industry', industry)
  if (audience) params.set('audience', audience)

  return (
    <Link
      {...props}
      href={`/growth-assessment?${params.toString()}`}
      data-cta-placement={livePlacement}
    />
  )
}
