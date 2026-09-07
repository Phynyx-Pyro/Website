export const CONSENT_VERSION = 'phynyx-2026-09-07-v1'

export const CONSENT_DISCLOSURES = {
  smsMarketing: 'I agree to receive marketing text messages from PhynyxPro about its services, my fit check, and booking a diagnostic, including automated messages. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.',
  smsService: 'I agree to receive non-marketing text messages from PhynyxPro about my requested diagnostic, including appointment confirmations, reminders, and schedule changes. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.',
  aiVoice: 'I agree that PhynyxPro may call the number I provided about its services, my fit check, and diagnostic using an automated system and an artificial or AI-generated voice. Consent is not a condition of purchase. I may revoke consent at any time by asking the caller to stop or contacting PhynyxPro.',
} as const

export type ContactConsent = Record<keyof typeof CONSENT_DISCLOSURES, boolean>

export const EMPTY_CONSENT: ContactConsent = {
  smsMarketing: false,
  smsService: false,
  aiVoice: false,
}

export function parseContactConsent(value: unknown): ContactConsent {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  return {
    smsMarketing: input.smsMarketing === true,
    smsService: input.smsService === true,
    aiVoice: input.aiVoice === true,
  }
}
