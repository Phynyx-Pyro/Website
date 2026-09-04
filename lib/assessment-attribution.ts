export type AssessmentAttribution = {
  landingPage: string
  referrer: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  gclid: string
  fbclid: string
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
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
      gclid: '',
      fbclid: '',
    }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    landingPage: minimizeAttributionUrl(window.location.href),
    referrer: minimizeAttributionUrl(document.referrer),
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    utmContent: params.get('utm_content') ?? '',
    utmTerm: params.get('utm_term') ?? '',
    gclid: params.get('gclid') ?? '',
    fbclid: params.get('fbclid') ?? '',
  }
}
