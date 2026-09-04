'use client'

import { normalizeAssessmentEntryPoint } from './assessment-attribution'

export const FUNNEL_EVENT_CHANNEL = 'phynyx:funnel'

export type FunnelEventPayloads = {
  diagnostic_cta_click: { placement: string }
  assessment_start: { entryPoint: string }
  assessment_step_complete: { step: 1 | 2 | 3 }
  qualification_result: { path: 'calendar' | 'investment-context' }
  calendar_view: { path: 'calendar' | 'investment-context' }
}

export type FunnelEventName = keyof FunnelEventPayloads

export type FunnelEventDetail =
  | {
      event: 'phynyx_diagnostic_cta_click'
      placement: string
    }
  | {
      event: 'phynyx_assessment_start'
      entryPoint: string
    }
  | {
      event: 'phynyx_assessment_step_complete'
      step: 1 | 2 | 3
    }
  | {
      event: 'phynyx_qualification_result'
      path: 'calendar' | 'investment-context'
    }
  | {
      event: 'phynyx_calendar_view'
      path: 'calendar' | 'investment-context'
    }

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

function isQualificationPath(
  value: unknown,
): value is 'calendar' | 'investment-context' {
  return value === 'calendar' || value === 'investment-context'
}

export function createFunnelEventDetail<Name extends FunnelEventName>(
  name: Name,
  payload: FunnelEventPayloads[Name],
): FunnelEventDetail | null {
  switch (name) {
    case 'diagnostic_cta_click': {
      const placement = normalizeAssessmentEntryPoint(
        (payload as FunnelEventPayloads['diagnostic_cta_click']).placement,
      )
      return placement
        ? { event: 'phynyx_diagnostic_cta_click', placement }
        : null
    }
    case 'assessment_start': {
      const entryPoint = normalizeAssessmentEntryPoint(
        (payload as FunnelEventPayloads['assessment_start']).entryPoint,
      )
      return {
        event: 'phynyx_assessment_start',
        entryPoint: entryPoint || 'direct',
      }
    }
    case 'assessment_step_complete': {
      const step = (payload as FunnelEventPayloads['assessment_step_complete'])
        .step
      return step === 1 || step === 2 || step === 3
        ? { event: 'phynyx_assessment_step_complete', step }
        : null
    }
    case 'qualification_result': {
      const path = (payload as FunnelEventPayloads['qualification_result']).path
      return isQualificationPath(path)
        ? { event: 'phynyx_qualification_result', path }
        : null
    }
    case 'calendar_view': {
      const path = (payload as FunnelEventPayloads['calendar_view']).path
      return isQualificationPath(path)
        ? { event: 'phynyx_calendar_view', path }
        : null
    }
  }
}

export function trackFunnelEvent<Name extends FunnelEventName>(
  name: Name,
  payload: FunnelEventPayloads[Name],
) {
  if (typeof window === 'undefined') return

  const detail = createFunnelEventDetail(name, payload)
  if (!detail) return

  window.dispatchEvent(new CustomEvent(FUNNEL_EVENT_CHANNEL, { detail }))
  window.dataLayer ??= []
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail)
}
