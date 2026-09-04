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
const MAX_ATTRIBUTION_QUERY_VALUE_LENGTH = 500

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

export function normalizeAssessmentEntryPoint(value: unknown) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim().toLowerCase()
  return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(normalized) ? normalized : ''
}

export function normalizeAssessmentLandingPath(value: unknown) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  if (!normalized.startsWith('/') || normalized.startsWith('//')) return ''

  try {
    const url = new URL(normalized, 'https://phynyxpro.invalid')
    if (url.origin !== 'https://phynyxpro.invalid') return ''
    return url.pathname
  } catch {
    return ''
  }
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
      params.get(queryKey) ?? '',
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
) {
  const sourceParams =
    typeof currentSearch === 'string'
      ? new URLSearchParams(currentSearch)
      : currentSearch
  const assessmentParams = new URLSearchParams()

  for (const queryKey of ASSESSMENT_ATTRIBUTION_QUERY_KEYS) {
    const value = sourceParams
      .get(queryKey)
      ?.trim()
      .slice(0, MAX_ATTRIBUTION_QUERY_VALUE_LENGTH)
    if (value) assessmentParams.set(queryKey, value)
  }

  const normalizedEntryPoint = normalizeAssessmentEntryPoint(entryPoint)
  if (normalizedEntryPoint) {
    assessmentParams.set(ASSESSMENT_ENTRY_POINT_QUERY_KEY, normalizedEntryPoint)
  }

  const normalizedLandingPath = normalizeAssessmentLandingPath(landingPath)
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
  industry?: string,
) {
  const params = new URLSearchParams()
  const normalizedEntryPoint = normalizeAssessmentEntryPoint(entryPoint)
  if (normalizedEntryPoint) {
    params.set(ASSESSMENT_ENTRY_POINT_QUERY_KEY, normalizedEntryPoint)
  }
  if (industry === 'chiropractic') params.set('industry', industry)

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
  if (start.searchParams.get('industry') === 'chiropractic') {
    destination.searchParams.set('industry', 'chiropractic')
  }

  return destination
}
