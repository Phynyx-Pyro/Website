export type AssessmentHandoffState = { crmSynced?: boolean; recoveryState?: string }

/** Presentation only. An enrollment acknowledgment does not establish delivery. */
export function assessmentHandoffStatus(state: AssessmentHandoffState) {
  if (state.crmSynced) {
    return {
      verificationNeeded: false,
      message: state.recoveryState === 'enrollment_acknowledged'
        ? 'Your follow-up request has been accepted. Message delivery is not yet confirmed. You do not need to verify or submit this assessment again.'
        : 'Your assessment has been recorded. Any follow-up remains subject to your contact preferences and eligibility. You do not need to submit this assessment again.',
    }
  }
  if (!state.recoveryState || state.recoveryState === 'verification_pending') {
    return { verificationNeeded: true, message: 'Email verification is required before we can connect this request to an existing contact and continue follow-up.' }
  }
  return { verificationNeeded: false, message: 'Your report is saved, but follow-up has not been confirmed. Another verification email will not resolve this handoff status.' }
}
