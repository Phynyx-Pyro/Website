import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { securityHarness } from './helpers/security-harness.mjs'

const origin = 'https://company.example.test'
const originalFetch = globalThis.fetch
test.afterEach(() => { globalThis.fetch = originalFetch })

function request(payload, cookie = '', ip = '192.0.2.10', route = 'growth-assessment') {
  return new Request(`${origin}/api/${route}`, { method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie, 'CF-Connecting-IP': ip },
    body: JSON.stringify(payload) })
}

function payload(full = true) {
  return { submissionId: crypto.randomUUID(), firstName: 'Synthetic', lastName: 'Visitor',
    email: 'visitor@example.test', phone: '(312) 555-0100',
    consent: { smsMarketing: false, smsService: false, aiVoice: false },
    attribution: { conversionPage: `${origin}/growth-assessment`, landingPage: `${origin}/`, utmSource: 'synthetic' },
    ...(full ? { businessName: 'Synthetic Practice', industry: 'dental', annualRevenue: '500k-1m',
      monthlyBudget: '3k-5k', capacity: '6-10', decisionRole: 'owner', implementationTiming: 'within-30-days', followUpOwner: 'yes',
      snapshot: { metrics: Object.fromEntries(Object.entries({ leads:80, contacted:50, booked:28, confirmed:24, showed:20, started:12, adSpend:2400, averageStartValue:1200 }).map(([k,v])=>[k,{value:v,confidence:'exact'}])),
        responseTime:'5-15-minutes',followUpAttempts:'4-6',attributionCoverage:'some' } }
      : { submissionType: 'homepage-quick-form' }) }
}

async function setup(t) {
  const h = await securityHarness(); t.after(() => h.close())
  let outbound = 0
  globalThis.fetch = async () => { outbound++; throw new Error('Outbound access forbidden in capture tests') }
  const route = await h.load('app/api/growth-assessment/route.ts')
  const bootstrap = await h.load('app/api/intake-session/route.ts')
  const cookie = (await bootstrap.POST(request({}, '', '192.0.2.10', 'intake-session'))).headers.get('set-cookie').split(';')[0]
  return { ...h, route, bootstrap, cookie, outbound: () => outbound }
}

test('quick and complete captures save immutable evidence without CRM, email, tracking or booking grants', async t => {
  const h = await setup(t)
  for (const full of [false, true]) {
    const input = payload(full)
    const response = await h.route.POST(request(input,h.cookie))
    assert.equal(response.status,200); assert.equal(response.headers.get('cache-control'),'no-store')
    assert.equal(response.headers.get('set-cookie'),null)
    const result = await response.json()
    assert.equal(result.saved,true); assert.equal(result.crmSynced,false); assert.equal(result.bookingReady,false)
    assert.equal(result.reportEmailSent,false); assert.equal(result.verificationAvailable,false)
    assert.equal(result.journeyState,full?'assessment_complete_unbooked':'incomplete')
    assert.equal(result.recoveryState,'verification_pending')
    assert.equal(Boolean(result.snapshot),full)
    const row=h.sqlite.prepare('SELECT * FROM growth_assessments WHERE id=?').get(input.submissionId)
    const evidence=JSON.parse(row.submission_snapshot)
    assert.equal(evidence.submittedPhone,input.phone); assert.equal(evidence.normalizedPhone,'+13125550100')
    assert.equal(evidence.attribution.utmSource,'synthetic'); assert.deepEqual(evidence.consent,input.consent)
    assert.equal(row.ghl_contact_id,null); assert.equal(row.status,'verification-pending')
    assert.equal(row.journey_state,result.journeyState)
  }
  assert.equal(h.outbound(),0)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,0)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM booking_handoffs').get().n,0)
  const delivery=await h.load('lib/assessment-delivery.ts')
  assert.equal(delivery.isWebsiteCrmDispatchEnabled(),false)
  assert.equal(delivery.isWebsiteExternalTrackingEnabled(),false)
})

test('parallel retries create one event; intentional new answers create new history without parallel enrollment', async t => {
  const h=await setup(t), input=payload()
  const responses=await Promise.all([h.route.POST(request(input,h.cookie)),h.route.POST(request(input,h.cookie))])
  for(const response of responses) assert.equal(response.status,200)
  const before=h.sqlite.prepare('SELECT * FROM growth_assessments').get()
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM growth_assessments').get().n,1)
  const conflict=await h.route.POST(request({...input,businessName:'Changed'},h.cookie))
  assert.equal(conflict.status,409)
  assert.deepEqual(h.sqlite.prepare('SELECT * FROM growth_assessments').get(),before)
  const fresh={...input,submissionId:crypto.randomUUID(),businessName:'New submitted business'}
  assert.equal((await h.route.POST(request(fresh,h.cookie))).status,200)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM growth_assessments').get().n,2)
  assert.deepEqual(h.sqlite.prepare('SELECT * FROM growth_assessments WHERE id=?').get(input.submissionId),before)
  assert.equal(h.outbound(),0)
})

test('copied event, another browser, expired session and legacy row confer no report or contact access', async t => {
  const h=await setup(t), input=payload()
  assert.equal((await h.route.POST(request(input,h.cookie))).status,200)
  const other=(await h.bootstrap.POST(request({},'', '192.0.2.11','intake-session'))).headers.get('set-cookie').split(';')[0]
  const stolen=await h.route.POST(request(input,other,'192.0.2.11'))
  assert.equal(stolen.status,403); assert.equal('snapshot' in await stolen.json(),false)
  // A new browser can always submit a fresh assessment, without reading history.
  assert.equal((await h.route.POST(request({...input,submissionId:crypto.randomUUID()},other,'192.0.2.11'))).status,200)
  h.sqlite.prepare('UPDATE growth_assessments SET intake_session_hash=NULL WHERE id=?').run(input.submissionId)
  assert.equal((await h.route.POST(request(input,h.cookie))).status,403)
  h.sqlite.exec('UPDATE intake_sessions SET expires_at=0')
  assert.equal((await h.route.POST(request(payload(),other,'192.0.2.11'))).status,403)
  assert.equal(h.outbound(),0)
})

test('foundation qualification stays separate from eligible booking recovery', async t => {
  const h=await setup(t), input={...payload(),capacity:'none'}
  const result=await (await h.route.POST(request(input,h.cookie))).json()
  assert.equal(result.fit.path,'foundation'); assert.equal(result.journeyState,'foundation')
  assert.equal(result.bookingReady,false); assert.ok(result.snapshot)
  assert.equal(h.outbound(),0)
})

test('historical events are not auto-dispatched when the legacy switch changes', async t => {
  const h=await setup(t), input=payload()
  assert.equal((await h.route.POST(request(input,h.cookie))).status,200)
  h.env.WEBSITE_CRM_DISPATCH_ENABLED='true'
  assert.equal((await h.route.POST(request(input,h.cookie))).status,200)
  assert.equal(h.outbound(),0)
  assert.equal(h.sqlite.prepare('SELECT status FROM growth_assessments').get().status,'verification-pending')
})

test('company metadata uses the runtime origin and tracking is gated in the root layout', async t => {
  const h=await setup(t);h.env.SITE_URL=origin+'/'
  assert.equal((await h.load('lib/site.ts')).SITE_URL,origin)
  const layout=await readFile(new URL('../app/layout.tsx',import.meta.url),'utf8')
  assert.match(layout,/isWebsiteExternalTrackingEnabled\(\) \? <Script/)
})
