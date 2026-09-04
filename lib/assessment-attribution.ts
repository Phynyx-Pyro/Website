export type AssessmentAttribution = {
  conversionPage: string
  landingPage: string
  referrer: string
  ctaOrigin: string
  sessionId: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  gclid: string
  fbclid: string
  msclkid: string
}

type StoredAssessmentAttribution = Omit<AssessmentAttribution, 'conversionPage'>

const ATTRIBUTION_STORAGE_KEY = 'phynyx:assessment-attribution:v1'
const MAX_ATTRIBUTION_VALUE_LENGTH = 500
const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ASSESSMENT_CTA_ORIGINS = new Set([
  'site-header-desktop',
  'site-header-mobile',
  'homepage-hero',
  'homepage-quick-form',
  'growth-system-footer',
  'industries-other-card',
  'industries-footer',
  'chiropractic-hero',
  'chiropractic-footer',
  'home-services-hero',
  'home-services-footer',
  'dental-medspa-hero',
  'dental-medspa-footer',
  'results-footer',
  'pyro-ember-hero',
  'pyro-ember-footer',
  'about-footer',
  'client-login',
])

let memoryAttribution: StoredAssessmentAttribution | null = null

export function minimizeAttributionUrl(value: string) {
  if (!value) return ''

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return `${url.origin}${url.pathname}`
  } catch {
    return ''
  }
}

function cleanAttributionValue(value: unknown) {
  return typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, MAX_ATTRIBUTION_VALUE_LENGTH)
    : ''
}

export function normalizeAssessmentCtaOrigin(value: unknown) {
  const origin = cleanAttributionValue(value)
  return ASSESSMENT_CTA_ORIGINS.has(origin) ? origin : ''
}

function blankAttribution(): AssessmentAttribution {
  return {
    conversionPage: '',
    landingPage: '',
    referrer: '',
    ctaOrigin: '',
    sessionId: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: '',
    gclid: '',
    fbclid: '',
    msclkid: '',
  }
}

function createSessionId() {
  try {
    if (typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID()
    }

    const bytes = window.crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0'))
    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10).join(''),
    ].join('-')
  } catch {
    return ''
  }
}

function sanitizeStoredAttribution(
  value: unknown,
): StoredAssessmentAttribution | null {
  if (!value || typeof value !== 'object') return null
  const stored = value as Partial<StoredAssessmentAttribution>
  const sessionId = cleanAttributionValue(stored.sessionId)
  if (!SESSION_ID_PATTERN.test(sessionId)) return null

  return {
    landingPage: minimizeAttributionUrl(
      cleanAttributionValue(stored.landingPage),
    ),
    referrer: minimizeAttributionUrl(cleanAttributionValue(stored.referrer)),
    ctaOrigin: normalizeAssessmentCtaOrigin(stored.ctaOrigin),
    sessionId,
    utmSource: cleanAttributionValue(stored.utmSource),
    utmMedium: cleanAttributionValue(stored.utmMedium),
    utmCampaign: cleanAttributionValue(stored.utmCampaign),
    utmContent: cleanAttributionValue(stored.utmContent),
    utmTerm: cleanAttributionValue(stored.utmTerm),
    gclid: cleanAttributionValue(stored.gclid),
    fbclid: cleanAttributionValue(stored.fbclid),
    msclkid: cleanAttributionValue(stored.msclkid),
  }
}

function readStoredAttribution() {
  if (memoryAttribution) return memoryAttribution

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) return null
    memoryAttribution = sanitizeStoredAttribution(JSON.parse(raw))
  } catch {
    memoryAttribution = null
  }

  return memoryAttribution
}

function writeStoredAttribution(attribution: StoredAssessmentAttribution) {
  memoryAttribution = attribution
  try {
    window.sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(attribution),
    )
  } catch {
    // The in-memory copy keeps attribution available when storage is blocked.
  }
}

export function captureAssessmentAttribution(): AssessmentAttribution {
  if (typeof window === 'undefined') return blankAttribution()

  const params = new URLSearchParams(window.location.search)
  const conversionPage = minimizeAttributionUrl(window.location.href)
  const existing = readStoredAttribution()
  const stored: StoredAssessmentAttribution = existing ?? {
    landingPage: conversionPage,
    referrer: minimizeAttributionUrl(document.referrer),
    ctaOrigin: '',
    sessionId: createSessionId(),
    utmSource: cleanAttributionValue(params.get('utm_source')),
    utmMedium: cleanAttributionValue(params.get('utm_medium')),
    utmCampaign: cleanAttributionValue(params.get('utm_campaign')),
    utmContent: cleanAttributionValue(params.get('utm_content')),
    utmTerm: cleanAttributionValue(params.get('utm_term')),
    gclid: cleanAttributionValue(params.get('gclid')),
    fbclid: cleanAttributionValue(params.get('fbclid')),
    msclkid: cleanAttributionValue(params.get('msclkid')),
  }
  const ctaOrigin =
    normalizeAssessmentCtaOrigin(params.get('cta')) || stored.ctaOrigin
  const updated = { ...stored, ctaOrigin }

  writeStoredAttribution(updated)

  return {
    conversionPage,
    ...updated,
  }
}

export function getAssessmentAttribution(): AssessmentAttribution {
  return captureAssessmentAttribution()
}
