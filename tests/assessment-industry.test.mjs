import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  ASSESSMENT_INDUSTRIES,
  isHealthcareAssessmentIndustry,
  parseAssessmentIndustry,
} from '../lib/assessment-industry.ts'

test('all assessment form industries are accepted for CTA prefill', () => {
  for (const industry of ASSESSMENT_INDUSTRIES) {
    assert.equal(parseAssessmentIndustry(industry), industry)
  }

  assert.equal(parseAssessmentIndustry('not-an-industry'), undefined)
  assert.equal(parseAssessmentIndustry(undefined), undefined)
})

test('diagnostic language is patient-specific only for healthcare industries', () => {
  for (const industry of [
    'chiropractic',
    'dental',
    'medspa',
    'other-healthcare',
  ]) {
    assert.equal(isHealthcareAssessmentIndustry(industry), true)
  }

  assert.equal(isHealthcareAssessmentIndustry('home-services'), false)
  assert.equal(isHealthcareAssessmentIndustry('other-service'), false)
  assert.equal(isHealthcareAssessmentIndustry(undefined), false)
})

test('combined dental-medspa CTAs do not force a dental prefill', async () => {
  const [headerSource, combinedPageSource, chiropracticPageSource, homeServicesPageSource] =
    await Promise.all([
      readFile(
        new URL('../app/(marketing)/_components/site-header.tsx', import.meta.url),
        'utf8',
      ),
      readFile(
        new URL(
          '../app/(marketing)/industries/dental-medspa/_components/dental-medspa-client.tsx',
          import.meta.url,
        ),
        'utf8',
      ),
      readFile(
        new URL(
          '../app/(marketing)/industries/chiropractic/_components/chiropractic-client.tsx',
          import.meta.url,
        ),
        'utf8',
      ),
      readFile(
        new URL(
          '../app/(marketing)/industries/home-services/_components/home-services-client.tsx',
          import.meta.url,
        ),
        'utf8',
      ),
    ])

  assert.doesNotMatch(combinedPageSource, /industry=["']dental["']/)
  assert.equal(combinedPageSource.match(/<AssessmentCtaLink\b/g)?.length, 2)
  assert.equal(
    combinedPageSource.match(/Book My Patient Acquisition Diagnostic/g)?.length,
    2,
  )

  assert.doesNotMatch(
    headerSource,
    /pathname\.startsWith\(["']\/industries\/dental-medspa["']\)\)\s*return ["']dental["']/,
  )
  assert.match(
    headerSource,
    /pathname\.startsWith\(["']\/industries\/chiropractic["']\)/,
  )
  assert.match(
    headerSource,
    /pathname\.startsWith\(["']\/industries\/home-services["']\)\) return ["']home-services["']/,
  )
  assert.match(
    headerSource,
    /pathname\.startsWith\(\s*["']\/industries\/dental-medspa["'],?\s*\)/,
  )
  assert.equal(headerSource.match(/audience=\{healthcareAudience\}/g)?.length, 2)
  assert.equal(chiropracticPageSource.match(/industry=["']chiropractic["']/g)?.length, 2)
  assert.equal(homeServicesPageSource.match(/industry=["']home-services["']/g)?.length, 2)
})

test('an explicit non-healthcare selection overrides broad audience context', async () => {
  const source = await readFile(
    new URL(
      '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
      import.meta.url,
    ),
    'utf8',
  )

  assert.match(
    source,
    /const healthcareContext = selectedIndustry\s*\?\s*isHealthcareAssessmentIndustry\(selectedIndustry\)\s*:\s*healthcareAudience/,
  )
  assert.match(source, /!selectedIndustry && healthcareAudience/)
})
