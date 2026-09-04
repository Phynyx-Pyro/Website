import type { AssessmentIndustry } from './assessment-industry'

export type AssessmentAttribution = {
  conversionPage: string
  landingPage: string
  referrer: string
  entryPoint: string
  ctaOrigin: string
  sessionId: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  gclid: string
  dclid: string
  gbraid: string
  wbraid: string
  fbclid: string
  msclkid: string
  ttclid: string
  twclid: string
  liFatId: string
}

export const ASSESSMENT_ENTRY_POINT_QUERY_KEY = 'assessment_entry'
const LEGACY_ASSESSMENT_ENTRY_POINT_QUERY_KEY = 'cta'
export const ASSESSMENT_LANDING_PATH_QUERY_KEY = 'assessment_landing_path'
export const ASSESSMENT_START_PATH = '/growth-assessment/start'
export const ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY =
  'phynyx_assessment_attribution:v1'
export const ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY =
  'phynyx_website_session:v1'
const LEGACY_ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY =
  'phynyx:assessment-attribution:v1'
const MAX_ATTRIBUTION_QUERY_VALUE_LENGTH = 500
const MAX_ATTRIBUTION_LANDING_PATH_LENGTH = 2_048
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g
const WEBSITE_SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ASSESSMENT_INDUSTRY_VALUES = new Set<AssessmentIndustry>([
  'chiropractic',
  'dental',
  'medspa',
  'home-services',
  'other-healthcare',
  'other-service',
])
const ASSESSMENT_ENTRY_POINTS = new Set([
  'header_desktop',
  'header_mobile',
  'homepage_hero',
  'homepage_journey',
  'homepage_final_form',
  'homepage_mobile_sticky',
  'growth_system_hero',
  'growth_system_final',
  'industries_other_card',
  'industries_final',
  'chiropractic_hero',
  'chiropractic_final',
  'home_services_hero',
  'home_services_final',
  'dental_medspa_hero',
  'dental_medspa_final',
  'results_final',
  'pyro_hero',
  'pyro_final',
  'about_final',
  'client_login_prospect',
  // Deployed v1 tokens remain readable for in-flight sessions and retries.
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

function normalizeAssessmentIndustry(value: unknown) {
  return typeof value === 'string' &&
    ASSESSMENT_INDUSTRY_VALUES.has(value as AssessmentIndustry)
    ? (value as AssessmentIndustry)
    : undefined
}

const ATTRIBUTION_QUERY_FIELDS = [
  ['utm_source', 'utmSource'],
  ['utm_medium', 'utmMedium'],
  ['utm_campaign', 'utmCampaign'],
  ['utm_content', 'utmContent'],
  ['utm_term', 'utmTerm'],
  ['gclid', 'gclid'],
  ['dclid', 'dclid'],
  ['gbraid', 'gbraid'],
  ['wbraid', 'wbraid'],
  ['fbclid', 'fbclid'],
  ['msclkid', 'msclkid'],
  ['ttclid', 'ttclid'],
  ['twclid', 'twclid'],
  ['li_fat_id', 'liFatId'],
] as const satisfies ReadonlyArray<
  readonly [
    string,
    Exclude<
      keyof AssessmentAttribution,
      | 'conversionPage'
      | 'landingPage'
      | 'referrer'
      | 'entryPoint'
      | 'ctaOrigin'
      | 'sessionId'
    >,
  ]
>

export const ASSESSMENT_ATTRIBUTION_QUERY_KEYS = ATTRIBUTION_QUERY_FIELDS.map(
  ([queryKey]) => queryKey,
)

type AssessmentAttributionQueryKey =
  (typeof ATTRIBUTION_QUERY_FIELDS)[number][0]

export type AssessmentSessionAttribution = {
  landingPath: string
  referrer?: string
  entryPoint?: string
} & Partial<Record<AssessmentAttributionQueryKey, string>>

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem'>

function normalizeAttributionQueryValue(value: unknown) {
  if (typeof value !== 'string') return ''
  return value
    .replace(CONTROL_CHARACTERS, '')
    .trim()
    .slice(0, MAX_ATTRIBUTION_QUERY_VALUE_LENGTH)
}

export function normalizeAssessmentEntryPoint(value: unknown) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim().toLowerCase()
  return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(normalized) &&
    ASSESSMENT_ENTRY_POINTS.has(normalized)
    ? normalized
    : ''
}

export const normalizeAssessmentCtaOrigin = normalizeAssessmentEntryPoint

export function normalizeWebsiteSessionId(value: unknown) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  return WEBSITE_SESSION_ID_PATTERN.test(normalized)
    ? normalized.toLowerCase()
    : ''
}

export function normalizeAssessmentLandingPath(value: unknown) {
  if (typeof value !== 'string') return ''
  const normalized = value
    .replace(CONTROL_CHARACTERS, '')
    .trim()
    .slice(0, MAX_ATTRIBUTION_LANDING_PATH_LENGTH)
  if (!normalized.startsWith('/') || normalized.startsWith('//')) return ''

  try {
    const url = new URL(normalized, 'https://phynyxpro.invalid')
    if (url.origin !== 'https://phynyxpro.invalid') return ''
    return url.pathname
  } catch {
    return ''
  }
}

function getBrowserSessionStorage(): SessionStorageLike | null {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function createSessionAttribution(
  currentSearch: string | URLSearchParams,
  landingPath: string,
  referrer: string,
): AssessmentSessionAttribution {
  const sourceParams =
    typeof currentSearch === 'string'
      ? new URLSearchParams(currentSearch)
      : currentSearch
  const attribution: AssessmentSessionAttribution = {
    landingPath: normalizeAssessmentLandingPath(landingPath) || '/',
  }
  const normalizedReferrer = minimizeAttributionUrl(referrer)
  if (normalizedReferrer) attribution.referrer = normalizedReferrer

  for (const queryKey of ASSESSMENT_ATTRIBUTION_QUERY_KEYS) {
    const value = normalizeAttributionQueryValue(sourceParams.get(queryKey))
    if (value) attribution[queryKey] = value
  }

  return attribution
}

function normalizeSessionAttribution(
  value: unknown,
): AssessmentSessionAttribution | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const record = value as Record<string, unknown>
  const landingPath = normalizeAssessmentLandingPath(record.landingPath)
  if (!landingPath) return null

  const attribution: AssessmentSessionAttribution = { landingPath }
  const referrer = minimizeAttributionUrl(
    typeof record.referrer === 'string' ? record.referrer : '',
  )
  if (referrer) attribution.referrer = referrer
  const entryPoint = normalizeAssessmentEntryPoint(record.entryPoint)
  if (entryPoint) attribution.entryPoint = entryPoint
  for (const queryKey of ASSESSMENT_ATTRIBUTION_QUERY_KEYS) {
    const fieldValue = normalizeAttributionQueryValue(record[queryKey])
    if (fieldValue) attribution[queryKey] = fieldValue
  }
  return attribution
}

function normalizeLegacySessionAttribution(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const record = value as Record<string, unknown>
  const legacyLandingPage = minimizeAttributionUrl(
    typeof record.landingPage === 'string' ? record.landingPage : '',
  )
  if (!legacyLandingPage) return null

  const attribution: AssessmentSessionAttribution = {
    landingPath: new URL(legacyLandingPage).pathname,
  }
  const referrer = minimizeAttributionUrl(
    typeof record.referrer === 'string' ? record.referrer : '',
  )
  if (referrer) attribution.referrer = referrer
  const entryPoint = normalizeAssessmentEntryPoint(record.ctaOrigin)
  if (entryPoint) attribution.entryPoint = entryPoint

  for (const [queryKey, field] of ATTRIBUTION_QUERY_FIELDS) {
    const fieldValue = normalizeAttributionQueryValue(record[field])
    if (fieldValue) attribution[queryKey] = fieldValue
  }

  return {
    attribution,
    sessionId: normalizeWebsiteSessionId(record.sessionId),
  }
}

function parseSessionAttribution(value: string | null) {
  if (!value) return null

  try {
    return normalizeSessionAttribution(JSON.parse(value) as unknown)
  } catch {
    return null
  }
}

function parseLegacySessionAttribution(value: string | null) {
  if (!value) return null

  try {
    return normalizeLegacySessionAttribution(JSON.parse(value) as unknown)
  } catch {
    return null
  }
}

export function readAssessmentSessionAttribution(
  storage: SessionStorageLike | null = getBrowserSessionStorage(),
) {
  if (!storage) return null

  try {
    const current = parseSessionAttribution(
      storage.getItem(ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY),
    )
    const migrated = parseLegacySessionAttribution(
      storage.getItem(LEGACY_ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY),
    )
    if (!migrated) return current

    // The deployed v1 record remains the first-touch authority when both
    // storage generations coexist. Current-only fields (including expanded
    // click IDs) fill gaps without replacing that original touch.
    const merged = normalizeSessionAttribution({
      ...(current ?? {}),
      ...migrated.attribution,
    })
    if (!merged) return current

    storage.setItem(
      ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
      JSON.stringify(merged),
    )
    if (
      migrated.sessionId &&
      !normalizeWebsiteSessionId(
        storage.getItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY),
      )
    ) {
      storage.setItem(
        ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY,
        migrated.sessionId,
      )
    }
    return merged
  } catch {
    return null
  }
}

export function captureAssessmentSessionAttribution(
  currentSearch: string | URLSearchParams,
  landingPath: string,
  storage: SessionStorageLike | null = getBrowserSessionStorage(),
  referrer = typeof document === 'undefined' ? '' : document.referrer,
) {
  const storedAttribution = readAssessmentSessionAttribution(storage)
  if (storedAttribution) return storedAttribution

  const attribution = createSessionAttribution(
    currentSearch,
    landingPath,
    referrer,
  )
  if (!storage) return attribution

  try {
    storage.setItem(
      ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY,
      JSON.stringify(attribution),
    )
  } catch {
    // Storage can be unavailable in private or locked-down browser contexts.
  }

  return attribution
}

function getOrCreateWebsiteSessionId(
  storage: SessionStorageLike | null = getBrowserSessionStorage(),
) {
  if (!storage) return ''

  try {
    const existing = normalizeWebsiteSessionId(
      storage.getItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY),
    )
    if (existing) return existing

    const created = normalizeWebsiteSessionId(globalThis.crypto.randomUUID())
    if (!created) return ''
    storage.setItem(ASSESSMENT_WEBSITE_SESSION_STORAGE_KEY, created)
    return created
  } catch {
    return ''
  }
}

export function captureAssessmentAttribution() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const handedOffLandingPath = normalizeAssessmentLandingPath(
    params.get(ASSESSMENT_LANDING_PATH_QUERY_KEY),
  )
  const attribution = captureAssessmentSessionAttribution(
    window.location.search,
    handedOffLandingPath || window.location.pathname,
  )
  getOrCreateWebsiteSessionId()
  return attribution
}

export function minimizeAttributionUrl(value: string) {
  if (!value) return ''

  try {
    const url = new URL(
      value
        .replace(CONTROL_CHARACTERS, '')
        .trim()
        .slice(0, MAX_ATTRIBUTION_LANDING_PATH_LENGTH),
    )
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return `${url.origin}${url.pathname}`
  } catch {
    return ''
  }
}

export function getAssessmentAttribution(): AssessmentAttribution {
  if (typeof window === 'undefined') {
    return {
      conversionPage: '',
      landingPage: '',
      referrer: '',
      entryPoint: '',
      ctaOrigin: '',
      sessionId: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
      gclid: '',
      dclid: '',
      gbraid: '',
      wbraid: '',
      fbclid: '',
      msclkid: '',
      ttclid: '',
      twclid: '',
      liFatId: '',
    }
  }

  const params = new URLSearchParams(window.location.search)
  const sessionAttribution = readAssessmentSessionAttribution()
  const landingPath = normalizeAssessmentLandingPath(
    params.get(ASSESSMENT_LANDING_PATH_QUERY_KEY),
  )
  const queryAttribution = Object.fromEntries(
    ATTRIBUTION_QUERY_FIELDS.map(([queryKey, field]) => [
      field,
      normalizeAttributionQueryValue(params.get(queryKey)) ||
        normalizeAttributionQueryValue(sessionAttribution?.[queryKey]),
    ]),
  ) as Pick<
    AssessmentAttribution,
    (typeof ATTRIBUTION_QUERY_FIELDS)[number][1]
  >

  const entryPoint =
    normalizeAssessmentEntryPoint(
      params.get(ASSESSMENT_ENTRY_POINT_QUERY_KEY),
    ) ||
    normalizeAssessmentEntryPoint(
      params.get(LEGACY_ASSESSMENT_ENTRY_POINT_QUERY_KEY),
    ) ||
    normalizeAssessmentEntryPoint(sessionAttribution?.entryPoint)
  const storedLandingPath = normalizeAssessmentLandingPath(
    sessionAttribution?.landingPath,
  )
  const firstLandingPath = storedLandingPath || landingPath

  return {
    conversionPage: minimizeAttributionUrl(window.location.href),
    landingPage: firstLandingPath
      ? `${window.location.origin}${firstLandingPath}`
      : minimizeAttributionUrl(window.location.href),
    referrer: sessionAttribution
      ? sessionAttribution.referrer || ''
      : minimizeAttributionUrl(document.referrer),
    entryPoint,
    ctaOrigin: entryPoint,
    sessionId: getOrCreateWebsiteSessionId(),
    ...queryAttribution,
  }
}

export function buildAssessmentHref(
  currentSearch: string | URLSearchParams,
  entryPoint: string,
  landingPath = '/',
  sessionAttribution?: AssessmentSessionAttribution | null,
) {
  const sourceParams =
    typeof currentSearch === 'string'
      ? new URLSearchParams(currentSearch)
      : currentSearch
  const assessmentParams = new URLSearchParams()
  const normalizedSessionAttribution = normalizeSessionAttribution(
    sessionAttribution,
  )

  for (const queryKey of ASSESSMENT_ATTRIBUTION_QUERY_KEYS) {
    const value = normalizedSessionAttribution
      ? normalizedSessionAttribution[queryKey]
      : normalizeAttributionQueryValue(sourceParams.get(queryKey))
    if (value) assessmentParams.set(queryKey, value)
  }

  const normalizedEntryPoint = normalizeAssessmentEntryPoint(entryPoint)
  if (normalizedEntryPoint) {
    assessmentParams.set(ASSESSMENT_ENTRY_POINT_QUERY_KEY, normalizedEntryPoint)
  }

  const normalizedLandingPath =
    normalizedSessionAttribution?.landingPath ||
    normalizeAssessmentLandingPath(landingPath)
  if (normalizedLandingPath) {
    assessmentParams.set(
      ASSESSMENT_LANDING_PATH_QUERY_KEY,
      normalizedLandingPath,
    )
  }

  const query = assessmentParams.toString()
  return query ? `/growth-assessment?${query}` : '/growth-assessment'
}

export function buildAssessmentStartHref(
  entryPoint: string,
  industry?: AssessmentIndustry,
) {
  const params = new URLSearchParams()
  const normalizedEntryPoint = normalizeAssessmentEntryPoint(entryPoint)
  if (normalizedEntryPoint) {
    params.set(ASSESSMENT_ENTRY_POINT_QUERY_KEY, normalizedEntryPoint)
  }
  const normalizedIndustry = normalizeAssessmentIndustry(industry)
  if (normalizedIndustry) params.set('industry', normalizedIndustry)

  const query = params.toString()
  return query ? `${ASSESSMENT_START_PATH}?${query}` : ASSESSMENT_START_PATH
}

export function buildAssessmentRedirectUrl(
  startUrl: string,
  referrer: string,
) {
  const start = new URL(startUrl)
  let sourceSearch = ''
  let landingPath = '/'

  try {
    const source = new URL(referrer)
    if (source.origin === start.origin) {
      sourceSearch = source.search
      landingPath = source.pathname
    }
  } catch {
    // A missing or invalid referrer falls back to a direct assessment visit.
  }

  const destination = new URL(
    buildAssessmentHref(
      sourceSearch,
      start.searchParams.get(ASSESSMENT_ENTRY_POINT_QUERY_KEY) ?? '',
      landingPath,
    ),
    start.origin,
  )
  const industry = normalizeAssessmentIndustry(start.searchParams.get('industry'))
  if (industry) destination.searchParams.set('industry', industry)
  if (start.searchParams.get('audience') === 'healthcare') {
    destination.searchParams.set('audience', 'healthcare')
  }

  return destination
}
