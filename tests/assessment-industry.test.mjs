import assert from 'node:assert/strict'
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
