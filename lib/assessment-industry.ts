export const ASSESSMENT_INDUSTRIES = [
  'chiropractic',
  'dental',
  'medspa',
  'home-services',
  'other-healthcare',
  'other-service',
] as const

export type AssessmentIndustry = (typeof ASSESSMENT_INDUSTRIES)[number]

const assessmentIndustrySet = new Set<string>(ASSESSMENT_INDUSTRIES)

export function parseAssessmentIndustry(
  value: string | null | undefined,
): AssessmentIndustry | undefined {
  if (!value || !assessmentIndustrySet.has(value)) return undefined
  return value as AssessmentIndustry
}

export function isHealthcareAssessmentIndustry(
  industry: AssessmentIndustry | undefined,
) {
  return (
    industry === 'chiropractic' ||
    industry === 'dental' ||
    industry === 'medspa' ||
    industry === 'other-healthcare'
  )
}
