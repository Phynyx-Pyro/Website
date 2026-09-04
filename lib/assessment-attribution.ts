import type { AssessmentIndustry } from './assessment-industry'

export type AssessmentAttribution = {
  landingPage: string
  referrer: string
  entryPoint: string
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
export const ASSESSMENT_LANDING_PATH_QUERY_KEY = 'assessment_landing_path'
export const ASSESSMENT_START_PATH = '/growth-assessment/start'
export const ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY =
  'phynyx_assessment_attribution:v1'
const MAX_ATTRIBUTION_QUERY_VALUE_LENGTH = 500
const MAX_ATTRIBUTION_LANDING_PATH_LENGTH = 2_048
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g
const ASSESSMENT_INDUSTRY_VALUES = new Set<AssessmentIndustry>([
  'chiropractic',
  'dental',
  'medspa',
  'home-services',
  'other-healthcare',
  'other-service',
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
  readonly [string, Exclude<keyof AssessmentAttribution, 'landingPage' | 'referrer' | 'entryPoint'>]
>

export const ASSESSMENT_ATTRIBUTION_QUERY_KEYS = ATTRIBUTION_QUERY_FIELDS.map(
  ([queryKey]) => queryKey,
)

type AssessmentAttributionQueryKey =
  (typeof ATTRIBUTION_QUERY_FIELDS)[number][0]

export type AssessmentSessionAttribution = {
  landingPath: string
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
  return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(normalized) ? normalized : ''
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
): AssessmentSessionAttribution {
  const sourceParams =
    typeof currentSearch === 'string'
      ? new URLSearchParams(currentSearch)
      : currentSearch
  const attribution: AssessmentSessionAttribution = {
    landingPath: normalizeAssessmentLandingPath(landingPath) || '/',
  }

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
  for (const queryKey of ASSESSMENT_ATTRIBUTION_QUERY_KEYS) {
    const fieldValue = normalizeAttributionQueryValue(record[queryKey])
    if (fieldValue) attribution[queryKey] = fieldValue
  }
  return attribution
}

function parseSessionAttribution(value: string | null) {
  if (!value) return null

  try {
    return normalizeSessionAttribution(JSON.parse(value) as unknown)
  } catch {
    return null
  }
}

export function readAssessmentSessionAttribution(
  storage: SessionStorageLike | null = getBrowserSessionStorage(),
) {
  if (!storage) return null

  try {
    return parseSessionAttribution(
      storage.getItem(ASSESSMENT_ATTRIBUTION_SESSION_STORAGE_KEY),
    )
  } catch {
    return null
  }
}

export function captureAssessmentSessionAttribution(
  currentSearch: string | URLSearchParams,
  landingPath: string,
  storage: SessionStorageLike | null = getBrowserSessionStorage(),
) {
  const storedAttribution = readAssessmentSessionAttribution(storage)
  if (storedAttribution) return storedAttribution

  const attribution = createSessionAttribution(currentSearch, landingPath)
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

export function getAssessmentAttribution(): AssessmentAttribution {
  if (typeof window === 'undefined') {
    return {
      landingPage: '',
      referrer: '',
      entryPoint: '',
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
  const landingPath = normalizeAssessmentLandingPath(
    params.get(ASSESSMENT_LANDING_PATH_QUERY_KEY),
  )
  const queryAttribution = Object.fromEntries(
    ATTRIBUTION_QUERY_FIELDS.map(([queryKey, field]) => [
      field,
      normalizeAttributionQueryValue(params.get(queryKey)),
    ]),
  ) as Pick<
    AssessmentAttribution,
    Exclude<keyof AssessmentAttribution, 'landingPage' | 'referrer' | 'entryPoint'>
  >

  return {
    landingPage: landingPath
      ? `${window.location.origin}${landingPath}`
      : minimizeAttributionUrl(window.location.href),
    referrer: minimizeAttributionUrl(document.referrer),
    entryPoint: normalizeAssessmentEntryPoint(
      params.get(ASSESSMENT_ENTRY_POINT_QUERY_KEY),
    ),
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

  return destination
}
