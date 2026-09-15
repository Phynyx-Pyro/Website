import { env } from 'cloudflare:workers'
import type { FitAssessment } from './growth-assessment'
import type { GrowthSnapshotResult } from './growth-snapshot'

/** Off until ownership verification, workflow isolation and dispatch are accepted.
 * The legacy adapter is retained for regression tests and a reviewed migration;
 * this switch alone does not implement the new enrollment contract.
 */
export function isWebsiteCrmDispatchEnabled() {
  return env.WEBSITE_CRM_DISPATCH_ENABLED === 'true'
}

export function isWebsiteExternalTrackingEnabled() {
  return env.WEBSITE_EXTERNAL_TRACKING_ENABLED === 'true'
}

export function assessmentJourneyState(isPartial: boolean, fit: FitAssessment) {
  return isPartial ? 'incomplete' : fit.path === 'foundation'
    ? 'foundation' : 'assessment_complete_unbooked'
}

/** Only newly submitted answers, never a matched CRM contact or prior report. */
export function savedAssessmentResponse(
  submissionId: string,
  isPartial: boolean,
  fit: FitAssessment,
  snapshot: GrowthSnapshotResult | null,
) {
  return Response.json({
    success: true,
    saved: true,
    submissionId,
    crmSynced: false,
    bookingReady: false,
    journeyState: assessmentJourneyState(isPartial, fit),
    recoveryState: 'verification_pending',
    verificationAvailable: false,
    reportEmailSent: false,
    ...(!isPartial ? { fit: { path: fit.path, tier: fit.tier, score: fit.score, summary: fit.summary }, snapshot } : {}),
  }, { headers: { 'Cache-Control': 'no-store' } })
}
