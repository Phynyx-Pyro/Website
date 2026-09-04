import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../lib/ghl.ts', import.meta.url)
const originalFetch = globalThis.fetch

const CONTACT_FIELD_KEYS = [
  'contact.website_submission_id',
  'contact.website_form_name',
  'contact.website_form_version',
  'contact.website_conversion_page',
  'contact.website_cta_origin',
  'contact.assessment_industry',
  'contact.assessment_revenue_range',
  'contact.assessment_primary_challenge',
  'contact.assessment_current_marketing',
  'contact.assessment_budget_range',
  'contact.assessment_fit_result',
  'contact.investment_context_acknowledged',
  'contact.email_marketing_consent',
  'contact.sms_marketing_consent',
  'contact.consent_captured_at_utc',
  'contact.consent_disclosure_version',
  'contact.consent_source_page',
  'contact.website_first_landing_page',
  'contact.website_original_referrer',
  'contact.website_attribution_snapshot',
]

const OPPORTUNITY_FIELD_KEYS = [
  'opportunity.website_submission_id_snapshot',
  'opportunity.lead_intent',
  'opportunity.primary_service_interest',
  'opportunity.qualified_budget_range',
  'opportunity.decision_timeframe',
  'opportunity.next_action_at_utc',
]

const ALL_FIELD_KEYS = [...CONTACT_FIELD_KEYS, ...OPPORTUNITY_FIELD_KEYS]
const FIELD_ID_BY_KEY = new Map(
  ALL_FIELD_KEYS.map((key, index) => [key, `field-${index + 1}`]),
)
const FIELD_KEY_BY_ID = new Map(
  [...FIELD_ID_BY_KEY].map(([key, id]) => [id, key]),
)

async function loadGhlModule() {
  globalThis.__PHENYX_TEST_ENV__ = {
    GHL_LOCATION_ID: 'location-test',
    GHL_PIPELINE_ID: 'pipeline-test',
    GHL_PIPELINE_STAGE_ID: 'stage-test',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token-never-sent',
  }
  return importTypeScriptModule(moduleUrl, [
    [
      "import { env } from 'cloudflare:workers'",
      'const env = globalThis.__PHENYX_TEST_ENV__',
    ],
    [
      "import { normalizePhoneForComparison } from './public-form-security'",
      "const normalizePhoneForComparison = (value) => { const digits = String(value).replace(/\\D/g, ''); return digits.length === 10 ? `1${digits}` : digits }",
    ],
  ])
}

function assessmentInput() {
  return {
    submissionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    submittedAt: '2026-09-04T00:00:00.000Z',
    submissionType: 'full-assessment',
    firstName: 'QA',
    lastName: 'Tester',
    email: 'qa@example.test',
    phone: '+13125550100',
    businessName: 'QA Company',
    industry: 'dental',
    annualRevenue: '500k-1m',
    biggestChallenge: 'not-enough-leads',
    currentMarketing: 'Referrals',
    monthlyBudget: '3k-5k',
    attribution: {
      conversionPage: 'https://phynyx.example/growth-assessment',
      landingPage: 'https://phynyx.example/growth-assessment',
      referrer: 'https://google.example/search',
      ctaOrigin: 'homepage-hero',
      sessionId: '11111111-1111-4111-8111-111111111111',
      entryPoint: '',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'growth-test',
      utmContent: 'assessment-ad',
      utmTerm: 'practice growth',
      gclid: 'google-click-id',
      dclid: '',
      gbraid: '',
      wbraid: '',
      fbclid: '',
      msclkid: 'microsoft-click-id',
      ttclid: '',
      twclid: '',
      liFatId: '',
    },
    fit: {
      path: 'calendar',
      tag: 'fit-good',
      summary: 'Qualified by the deterministic website rules.',
    },
  }
}

function customFieldDefinitions() {
  return {
    customFields: [...FIELD_ID_BY_KEY].map(([fieldKey, id]) => ({
      id,
      fieldKey,
    })),
  }
}

function recordCall(calls, url, init = {}) {
  const method = init.method ?? 'GET'
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined
  const parsedUrl = new URL(url)
  const call = {
    url: String(url),
    path: parsedUrl.pathname,
    searchParams: parsedUrl.searchParams,
    method,
    body,
    headers: init.headers,
  }
  calls.push(call)
  return call
}

function valuesByFieldKey(customFields) {
  return Object.fromEntries(
    customFields.map((field) => [FIELD_KEY_BY_ID.get(field.id), field.fieldValue]),
  )
}

test.afterEach(() => {
  globalThis.fetch = originalFetch
  delete globalThis.__PHENYX_TEST_ENV__
})

test('matching existing contacts are securely resolved before metadata sync', async () => {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const call = recordCall(calls, url, init)
    if (call.path === '/contacts/search/duplicate') {
      return Response.json({ contact: { id: 'existing-contact' } })
    }
    if (call.path === '/contacts/existing-contact') {
      return Response.json({
        contact: {
          id: 'existing-contact',
          email: 'qa@example.test',
          phone: '(312) 555-0100',
        },
      })
    }
    throw new Error(`Unexpected request: ${url}`)
  }

  const { resolveGrowthAssessmentContact } = await loadGhlModule()
  const result = await resolveGrowthAssessmentContact(assessmentInput())

  assert.deepEqual(result, { contactId: 'existing-contact', isNew: false })
  assert.deepEqual(calls.map((call) => call.method), ['GET', 'GET'])
})

test('CRM lookup errors omit submitted identity from logs and error messages', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 500 })
  const { resolveGrowthAssessmentContact } = await loadGhlModule()

  await assert.rejects(resolveGrowthAssessmentContact(assessmentInput()), (error) => {
    assert.equal(error.message.includes('qa@example.test'), false)
    assert.equal(error.message.includes('location-test'), false)
    assert.equal(error.message.includes('?'), false)
    assert.match(error.message, /\/contacts\/search\/duplicate/)
    return true
  })
})

test('metadata sync creates one enriched opportunity and is retry-idempotent', async () => {
  const calls = []
  let savedNoteBody = ''
  let opportunityId = ''

  globalThis.fetch = async (url, init = {}) => {
    const call = recordCall(calls, url, init)

    if (call.method === 'GET' && call.path === '/contacts/new-contact') {
      return Response.json({ contact: { id: 'new-contact', customFields: [] } })
    }
    if (call.method === 'GET' && call.path === '/contacts/new-contact/notes') {
      return Response.json({
        notes: savedNoteBody ? [{ id: 'saved-note', body: savedNoteBody }] : [],
      })
    }
    if (call.method === 'GET' && call.path === '/opportunities/search') {
      return Response.json({
        opportunities: opportunityId ? [{ id: opportunityId }] : [],
      })
    }
    if (
      call.method === 'GET' &&
      call.path === '/locations/location-test/customFields'
    ) {
      return Response.json(customFieldDefinitions())
    }
    if (call.method === 'POST' && call.path === '/contacts/new-contact/notes') {
      savedNoteBody = call.body.body
      return Response.json({ note: { id: 'saved-note' } }, { status: 201 })
    }
    if (call.method === 'POST' && call.path === '/opportunities/') {
      opportunityId = 'created-opportunity'
      return Response.json(
        { opportunity: { id: opportunityId } },
        { status: 201 },
      )
    }
    if (
      (call.method === 'POST' && call.path === '/contacts/new-contact/tags') ||
      (call.method === 'DELETE' && call.path === '/contacts/new-contact/tags') ||
      (call.method === 'PUT' && call.path === '/contacts/new-contact') ||
      (call.method === 'PUT' && call.path === '/opportunities/created-opportunity')
    ) {
      return Response.json({})
    }
    throw new Error(`Unexpected request: ${call.method} ${call.url}`)
  }

  const { syncGrowthAssessmentMetadata } = await loadGhlModule()
  const input = assessmentInput()
  await syncGrowthAssessmentMetadata('new-contact', input)
  await syncGrowthAssessmentMetadata('new-contact', input)

  const contactUpdates = calls.filter(
    (call) => call.method === 'PUT' && call.path === '/contacts/new-contact',
  )
  const contactFields = valuesByFieldKey(contactUpdates[0].body.customFields)
  const enrollmentFields = valuesByFieldKey(
    contactUpdates[1].body.customFields,
  )
  assert.equal('contact.website_submission_id' in contactFields, false)
  assert.equal(
    enrollmentFields['contact.website_submission_id'],
    input.submissionId,
  )
  assert.equal(contactFields['contact.website_form_name'], 'growth-assessment')
  assert.equal(contactFields['contact.website_form_version'], 'v1')
  assert.equal(
    contactFields['contact.website_conversion_page'],
    input.attribution.conversionPage,
  )
  assert.equal(
    contactFields['contact.website_cta_origin'],
    input.attribution.ctaOrigin,
  )
  assert.equal(contactFields['contact.assessment_industry'], input.industry)
  assert.equal(
    contactFields['contact.assessment_revenue_range'],
    input.annualRevenue,
  )
  assert.equal(
    contactFields['contact.assessment_primary_challenge'],
    input.biggestChallenge,
  )
  assert.equal(
    contactFields['contact.assessment_current_marketing'],
    input.currentMarketing,
  )
  assert.equal(
    contactFields['contact.assessment_budget_range'],
    input.monthlyBudget,
  )
  assert.equal(contactFields['contact.assessment_fit_result'], 'qualified')
  assert.equal(
    contactFields['contact.website_first_landing_page'],
    input.attribution.landingPage,
  )
  assert.equal(
    contactFields['contact.website_original_referrer'],
    input.attribution.referrer,
  )

  const attributionSnapshot = JSON.parse(
    contactFields['contact.website_attribution_snapshot'],
  )
  assert.deepEqual(attributionSnapshot, {
    source: 'phynyx-website',
    form: 'growth-assessment',
    formVersion: 'v1',
    submittedAt: input.submittedAt,
    conversionPage: input.attribution.conversionPage,
    landingPage: input.attribution.landingPage,
    referrer: input.attribution.referrer,
    ctaOrigin: input.attribution.ctaOrigin,
    sessionId: input.attribution.sessionId,
    utmSource: input.attribution.utmSource,
    utmMedium: input.attribution.utmMedium,
    utmCampaign: input.attribution.utmCampaign,
    utmContent: input.attribution.utmContent,
    utmTerm: input.attribution.utmTerm,
    gclid: input.attribution.gclid,
    fbclid: input.attribution.fbclid,
    msclkid: input.attribution.msclkid,
  })

  for (const uncapturedKey of [
    'contact.investment_context_acknowledged',
    'contact.email_marketing_consent',
    'contact.sms_marketing_consent',
    'contact.consent_captured_at_utc',
    'contact.consent_disclosure_version',
    'contact.consent_source_page',
  ]) {
    assert.equal(uncapturedKey in contactFields, false)
  }

  const opportunityCreate = calls.find(
    (call) => call.method === 'POST' && call.path === '/opportunities/',
  )
  assert.equal(opportunityCreate.body.locationId, 'location-test')
  assert.equal(opportunityCreate.body.pipelineId, 'pipeline-test')
  assert.equal(opportunityCreate.body.pipelineStageId, 'stage-test')
  assert.equal(opportunityCreate.body.contactId, 'new-contact')
  assert.equal(opportunityCreate.body.status, 'open')
  assert.equal(opportunityCreate.body.name, 'QA Company — Growth Assessment')
  assert.deepEqual(valuesByFieldKey(opportunityCreate.body.customFields), {
    'opportunity.website_submission_id_snapshot': input.submissionId,
    'opportunity.lead_intent': 'assessment',
    'opportunity.primary_service_interest': 'growth-system',
    'opportunity.qualified_budget_range': input.monthlyBudget,
  })

  const firstOpportunitySearch = calls.find(
    (call) => call.method === 'GET' && call.path === '/opportunities/search',
  )
  assert.equal(firstOpportunitySearch.searchParams.get('locationId'), 'location-test')
  assert.equal(firstOpportunitySearch.searchParams.get('pipelineId'), 'pipeline-test')
  assert.equal(firstOpportunitySearch.searchParams.get('contactId'), 'new-contact')
  assert.equal(firstOpportunitySearch.searchParams.get('status'), 'open')
  assert.equal(firstOpportunitySearch.searchParams.get('limit'), '1')

  assert.equal(
    calls.filter(
      (call) => call.method === 'POST' && call.path === '/contacts/new-contact/notes',
    ).length,
    1,
  )
  assert.equal(
    calls.filter(
      (call) => call.method === 'PUT' && call.path.includes('/notes/'),
    ).length,
    0,
  )
  assert.equal(
    calls.filter(
      (call) => call.method === 'POST' && call.path === '/opportunities/',
    ).length,
    1,
  )
  assert.equal(
    calls.filter(
      (call) =>
        call.method === 'PUT' && call.path === '/opportunities/created-opportunity',
    ).length,
    1,
  )

  const firstMutationSequence = calls
    .filter((call) => call.method !== 'GET')
    .slice(0, 6)
    .map((call) => `${call.method} ${call.path}`)
  assert.deepEqual(firstMutationSequence, [
    'PUT /contacts/new-contact',
    'POST /contacts/new-contact/notes',
    'POST /opportunities/',
    'DELETE /contacts/new-contact/tags',
    'POST /contacts/new-contact/tags',
    'PUT /contacts/new-contact',
  ])

  const removeTagCalls = calls.filter(
    (call) =>
      call.method === 'DELETE' && call.path === '/contacts/new-contact/tags',
  )
  assert.equal(removeTagCalls.length, 2)
  assert.deepEqual(removeTagCalls[0].body.tags, ['fit:nurture'])

  const tagCalls = calls.filter(
    (call) => call.method === 'POST' && call.path === '/contacts/new-contact/tags',
  )
  assert.deepEqual(tagCalls[0].body.tags, [
    'source:phynyx-website',
    'form:growth-assessment',
    'intent:assessment',
    'automation:phynyx-web-v1',
    'fit:qualified',
  ])
  assert.equal(contactUpdates.length, 4)
})

test('existing contacts preserve first touch and update their open opportunity', async () => {
  const calls = []
  const input = {
    ...assessmentInput(),
    annualRevenue: '',
    biggestChallenge: '',
    currentMarketing: '',
    monthlyBudget: '',
    attribution: {
      ...assessmentInput().attribution,
      conversionPage: '',
      ctaOrigin: '',
    },
    fit: {
      path: 'investment-context',
      tag: 'investment-confirmation-required',
      summary: 'Investment context is required.',
    },
  }
  const existingFirstLandingId = FIELD_ID_BY_KEY.get(
    'contact.website_first_landing_page',
  )
  const existingReferrerId = FIELD_ID_BY_KEY.get(
    'contact.website_original_referrer',
  )

  globalThis.fetch = async (url, init = {}) => {
    const call = recordCall(calls, url, init)
    if (call.method === 'GET' && call.path === '/contacts/existing-contact') {
      return Response.json({
        contact: {
          id: 'existing-contact',
          customFields: [
            { id: existingFirstLandingId, value: 'https://original.example/' },
            { id: existingReferrerId, value: 'https://referrer.example/' },
          ],
        },
      })
    }
    if (
      call.method === 'GET' &&
      call.path === '/contacts/existing-contact/notes'
    ) {
      return Response.json({
        notes: [
          {
            id: 'existing-note',
            body: `Submission ID: ${input.submissionId}\nOutdated body`,
          },
        ],
      })
    }
    if (call.method === 'GET' && call.path === '/opportunities/search') {
      return Response.json({ opportunities: [{ id: 'existing-opportunity' }] })
    }
    if (
      call.method === 'GET' &&
      call.path === '/locations/location-test/customFields'
    ) {
      return Response.json(customFieldDefinitions())
    }
    if (
      (call.method === 'PUT' && call.path === '/contacts/existing-contact') ||
      (call.method === 'PUT' &&
        call.path === '/contacts/existing-contact/notes/existing-note') ||
      (call.method === 'PUT' && call.path === '/opportunities/existing-opportunity') ||
      (call.method === 'DELETE' &&
        call.path === '/contacts/existing-contact/tags') ||
      (call.method === 'POST' && call.path === '/contacts/existing-contact/tags')
    ) {
      return Response.json({})
    }
    throw new Error(`Unexpected request: ${call.method} ${call.url}`)
  }

  const { syncGrowthAssessmentMetadata } = await loadGhlModule()
  await syncGrowthAssessmentMetadata('existing-contact', input)

  const contactUpdates = calls.filter(
    (call) => call.method === 'PUT' && call.path === '/contacts/existing-contact',
  )
  const contactFields = valuesByFieldKey(contactUpdates[0].body.customFields)
  const enrollmentFields = valuesByFieldKey(
    contactUpdates[1].body.customFields,
  )
  assert.equal('contact.website_submission_id' in contactFields, false)
  assert.equal(
    enrollmentFields['contact.website_submission_id'],
    input.submissionId,
  )
  assert.equal('contact.website_first_landing_page' in contactFields, false)
  assert.equal('contact.website_original_referrer' in contactFields, false)
  assert.equal(contactFields['contact.website_conversion_page'], '')
  assert.equal(contactFields['contact.website_cta_origin'], '')
  assert.equal(contactFields['contact.assessment_revenue_range'], '')
  assert.equal(contactFields['contact.assessment_primary_challenge'], '')
  assert.equal(contactFields['contact.assessment_current_marketing'], '')
  assert.equal(contactFields['contact.assessment_budget_range'], '')
  assert.equal(contactFields['contact.assessment_fit_result'], 'nurture')

  const noteUpdate = calls.find(
    (call) =>
      call.method === 'PUT' &&
      call.path === '/contacts/existing-contact/notes/existing-note',
  )
  assert.match(noteUpdate.body.body, /Investment context required before calendar/)

  const opportunityUpdate = calls.find(
    (call) =>
      call.method === 'PUT' && call.path === '/opportunities/existing-opportunity',
  )
  assert.equal(opportunityUpdate.body.pipelineId, 'pipeline-test')
  assert.equal(opportunityUpdate.body.pipelineStageId, undefined)
  assert.equal(opportunityUpdate.body.contactId, undefined)
  assert.equal(opportunityUpdate.body.locationId, undefined)
  assert.equal(
    valuesByFieldKey(opportunityUpdate.body.customFields)[
      'opportunity.qualified_budget_range'
    ],
    '',
  )
  assert.equal(
    calls.some(
      (call) => call.method === 'POST' && call.path === '/opportunities/',
    ),
    false,
  )
  assert.equal(
    calls.some(
      (call) =>
        call.method === 'POST' &&
        call.path === '/contacts/existing-contact/notes',
    ),
    false,
  )

  const tagCall = calls.find(
    (call) =>
      call.method === 'POST' && call.path === '/contacts/existing-contact/tags',
  )
  assert.deepEqual(tagCall.body.tags, [
    'source:phynyx-website',
    'form:growth-assessment',
    'intent:assessment',
    'automation:phynyx-web-v1',
    'fit:nurture',
  ])

  const removeTagCall = calls.find(
    (call) =>
      call.method === 'DELETE' &&
      call.path === '/contacts/existing-contact/tags',
  )
  assert.deepEqual(removeTagCall.body.tags, ['fit:qualified'])
  assert.ok(calls.indexOf(removeTagCall) < calls.indexOf(tagCall))
  assert.ok(calls.indexOf(tagCall) < calls.indexOf(contactUpdates[1]))
  assert.equal(calls.at(-1), contactUpdates[1])
})

test('a failed contact update does not start any later CRM mutation', async () => {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const call = recordCall(calls, url, init)
    if (call.method === 'GET' && call.path === '/contacts/new-contact') {
      return Response.json({ contact: { id: 'new-contact', customFields: [] } })
    }
    if (call.method === 'GET' && call.path === '/contacts/new-contact/notes') {
      return Response.json({ notes: [] })
    }
    if (call.method === 'GET' && call.path === '/opportunities/search') {
      return Response.json({ opportunities: [] })
    }
    if (
      call.method === 'GET' &&
      call.path === '/locations/location-test/customFields'
    ) {
      return Response.json(customFieldDefinitions())
    }
    if (call.method === 'PUT' && call.path === '/contacts/new-contact') {
      return new Response('{}', { status: 500 })
    }
    return Response.json({})
  }

  const { syncGrowthAssessmentMetadata } = await loadGhlModule()
  await assert.rejects(
    syncGrowthAssessmentMetadata('new-contact', assessmentInput()),
    /GoHighLevel request failed/,
  )

  assert.deepEqual(
    calls
      .filter((call) => call.method !== 'GET')
      .map((call) => `${call.method} ${call.path}`),
    ['PUT /contacts/new-contact'],
  )
})

test('contact 404 errors are identifiable without starting metadata writes', async () => {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const call = recordCall(calls, url, init)
    if (call.method === 'GET' && call.path === '/contacts/stale-contact') {
      return new Response('{}', { status: 404 })
    }
    throw new Error(`Unexpected request: ${call.method} ${call.url}`)
  }

  const { isGhlContactNotFoundError, syncGrowthAssessmentMetadata } =
    await loadGhlModule()
  let caught
  try {
    await syncGrowthAssessmentMetadata('stale-contact', assessmentInput())
  } catch (error) {
    caught = error
  }

  assert.ok(caught)
  assert.equal(isGhlContactNotFoundError(caught, 'stale-contact'), true)
  assert.equal(isGhlContactNotFoundError(caught, 'different-contact'), false)
  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path}`),
    ['GET /contacts/stale-contact'],
  )
})

test('assessment notes include sanitized CTA and supported click attribution when present', async () => {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ url: String(url), method: init.method ?? 'GET', body })
    if (String(url).endsWith('/tags')) return Response.json({ tags: [] })
    if (String(url).endsWith('/notes') && !init.method) {
      return Response.json({ notes: [] })
    }
    if (String(url).endsWith('/notes') && init.method === 'POST') {
      return Response.json({ note: { id: 'note-test' } })
    }
    throw new Error(`Unexpected request: ${url}`)
  }

  const input = assessmentInput()
  input.attribution = {
    ...input.attribution,
    entryPoint: 'home_services_final',
    dclid: 'display-123\nInjected: no',
    gbraid: 'gbraid-123',
    wbraid: 'wbraid-123',
    msclkid: 'microsoft-123',
    ttclid: 'tiktok-123',
    twclid: 'twitter-123',
    liFatId: 'linkedin-123',
  }

  const { syncNewGrowthAssessmentMetadata } = await loadGhlModule()
  await syncNewGrowthAssessmentMetadata('new-contact', input)

  const noteCall = calls.find(
    (call) => call.url.endsWith('/notes') && call.method === 'POST',
  )
  assert.ok(noteCall)
  assert.match(noteCall.body.body, /Assessment CTA entry point: home_services_final/)
  assert.match(noteCall.body.body, /Google Display click ID: display-123 Injected: no/)
  assert.match(noteCall.body.body, /Google GBRAID: gbraid-123/)
  assert.match(noteCall.body.body, /Google WBRAID: wbraid-123/)
  assert.match(noteCall.body.body, /Microsoft click ID: microsoft-123/)
  assert.match(noteCall.body.body, /TikTok click ID: tiktok-123/)
  assert.match(noteCall.body.body, /X\/Twitter click ID: twitter-123/)
  assert.match(noteCall.body.body, /LinkedIn click ID: linkedin-123/)
  assert.equal(noteCall.body.body.includes('\nInjected:'), false)
})
