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
}

function addIndustry(href: string, industry?: AssessmentIndustry) {
  if (!industry) return href
  const [pathname, query = ''] = href.split('?')
  const params = new URLSearchParams(query)
  params.set('industry', industry)
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
    ? addIndustry(
        buildAssessmentHref(
          currentSearch,
          placement,
          landingPath,
          sessionAttribution,
        ),
        industry,
      )
    : buildAssessmentStartHref(placement, industry)

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        trackFunnelEvent('diagnostic_cta_click', { placement })
        onClick?.(event)
      }}
    />
  )
}
