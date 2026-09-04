'use client'

import Link from 'next/link'
import {
  useEffect,
  useSyncExternalStore,
  type ComponentProps,
} from 'react'
import {
  buildAssessmentHref,
  buildAssessmentStartHref,
  captureAssessmentSessionAttribution,
  readAssessmentSessionAttribution,
} from '@/lib/assessment-attribution'
import type { AssessmentIndustry } from '@/lib/assessment-industry'
import { trackFunnelEvent } from '@/lib/funnel-events'

type AssessmentCtaLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  placement: string
  industry?: AssessmentIndustry
  audience?: 'healthcare'
}

function addAssessmentContext(
  href: string,
  industry?: AssessmentIndustry,
  audience?: 'healthcare',
) {
  if (!industry && !audience) return href
  const [pathname, query = ''] = href.split('?')
  const params = new URLSearchParams(query)
  if (industry) params.set('industry', industry)
  if (audience) params.set('audience', audience)
  return `${pathname}?${params.toString()}`
}

const subscribeToLocation = () => () => undefined

function getLocationSnapshot() {
  return `${window.location.pathname}\n${window.location.search}`
}

function getServerLocationSnapshot() {
  return ''
}

export function AssessmentCtaLink({
  placement,
  industry,
  audience,
  onClick,
  ...props
}: AssessmentCtaLinkProps) {
  const locationSnapshot = useSyncExternalStore(
    subscribeToLocation,
    getLocationSnapshot,
    getServerLocationSnapshot,
  )
  const [landingPath = '/', currentSearch = ''] = locationSnapshot.split('\n')
  const sessionAttribution = locationSnapshot
    ? readAssessmentSessionAttribution()
    : null

  useEffect(() => {
    if (!locationSnapshot) return
    captureAssessmentSessionAttribution(currentSearch, landingPath)
  }, [currentSearch, landingPath, locationSnapshot])

  const href = locationSnapshot
    ? addAssessmentContext(
        buildAssessmentHref(
          currentSearch,
          placement,
          landingPath,
          sessionAttribution,
        ),
        industry,
        audience,
      )
    : addAssessmentContext(
        buildAssessmentStartHref(placement, industry),
        undefined,
        audience,
      )

  return (
    <Link
      {...props}
      href={href}
      data-cta-placement={placement}
      onClick={(event) => {
        trackFunnelEvent('diagnostic_cta_click', { placement })
        onClick?.(event)
      }}
    />
  )
}
