import assert from 'node:assert/strict'
import test from 'node:test'
import { securityHarness } from './helpers/security-harness.mjs'

const originalFetch = globalThis.fetch
test.afterEach(() => { globalThis.fetch = originalFetch })
const origin = 'https://phynyx.example'
function request(route, payload = {}, cookie = '', ip = '192.0.2.1') {
  return new Request(`${origin}/api/${route}`, { method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie, 'CF-Connecting-IP': ip },
    body: JSON.stringify(payload) })
}
function payload(full = false) {
  return { submissionId: crypto.randomUUID(), firstName: 'Test', lastName: 'Visitor',
    email: 'test@example.test', phone: '+13125550100', consent: { smsMarketing: true, smsService: false, aiVoice: false },
    ...(full ? { businessName: 'Test Practice', industry: 'dental', annualRevenue: '500k-1m',
      monthlyBudget: '3k-5k', capacity: '6-10', decisionRole: 'owner', implementationTiming: 'within-30-days', followUpOwner: 'yes',
      snapshot: { metrics: Object.fromEntries(Object.entries({ leads:80, contacted:50, booked:28, confirmed:24, showed:20, started:12, adSpend:2400, averageStartValue:1200 }).map(([k,v])=>[k,{value:v,confidence:'exact'}])),
        responseTime:'5-15-minutes',followUpAttempts:'4-6',attributionCoverage:'some' } }
      : { submissionType: 'homepage-quick-form' }) }
}
async function setup(t, existing = false) {
  const h = await securityHarness(); t.after(() => h.close())
  // Explicitly exercise the retained legacy adapter. Production is capture-only.
  h.env.WEBSITE_CRM_DISPATCH_ENABLED = 'true'
  const ghl = await h.load('lib/ghl.ts')
  const fields = [...Object.values(ghl.GHL_CONTACT_FIELD_KEYS), ...Object.values(ghl.GHL_OPPORTUNITY_FIELD_KEYS)]
  const contact = { id: 'contact-test', locationId:'location-test', email:'test@example.test', phone:'+13125550100', customFields:[] }
  let created = existing
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const path = new URL(url).pathname, method = init.method || 'GET'
    assert.equal(new URL(url).origin, 'https://services.leadconnectorhq.com')
    calls.push({path,method,body:init.body && JSON.parse(init.body)})
    if(path === '/contacts/search/duplicate') return Response.json(created ? {contact} : {})
    if(path === '/contacts/' && method === 'POST') { created=true; return Response.json({contact},{status:201}) }
    if(path === '/contacts/contact-test' && method === 'GET') return Response.json({contact})
    if(path.endsWith('/customFields')) return Response.json({customFields:fields.map((fieldKey,i)=>({fieldKey,id:`f${i}`}))})
    if(path.endsWith('/notes') && method === 'GET') return Response.json({notes:[]})
    if(path === '/opportunities/search') return Response.json({opportunities:[]})
    if(method !== 'GET') return Response.json({})
    throw new Error(`Unexpected mocked CRM request: ${method} ${path}`)
  }
  const route = await h.load('tests/fixtures/legacy-growth-assessment.ts')
  const bootstrap = await h.load('app/api/intake-session/route.ts')
  const booking = await h.load('app/api/booking-session/route.ts')
  const sessionModule = await h.load('lib/intake-session.ts')
  async function newCookie(ip='192.0.2.1') {
    const response=await bootstrap.POST(request('intake-session',{},'',ip))
    assert.equal(response.status,200)
    const value=response.headers.get('set-cookie')
    assert.match(value,/^__Host-phynyx_intake=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=7200; Secure$/)
    return value.split(';')[0]
  }
  return {...h,ghl,route,bootstrap,booking,sessionModule,newCookie,calls,contact}
}

test('transient grant persistence failures retry without creating another contact', async t => {
  const h=await setup(t),cookie=await h.newCookie()
  h.failGrantWrites(2)
  assert.equal((await h.route.POST(request('growth-assessment',payload(),cookie))).status,200)
  assert.equal(h.calls.filter(c=>c.path==='/contacts/' && c.method==='POST').length,1)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,1)
})

test('persistent grant storage failure holds the request without promising automatic retry', async t => {
  const h=await setup(t),cookie=await h.newCookie(),input=payload()
  h.failGrantWrites(3)
  const response=await h.route.POST(request('growth-assessment',input,cookie))
  assert.equal(response.status,200)
  assert.equal((await response.json()).crmSynced,false)
  assert.equal(h.calls.filter(c=>c.method!=='GET').length,1)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,0)
  assert.equal((await h.route.POST(request('growth-assessment',input,cookie))).status,200)
  assert.equal(h.calls.filter(c=>c.method!=='GET').length,1)
})

test('bootstrap uses its own quota and does not replace a valid session cookie', async t => {
  const h=await setup(t),cookie=await h.newCookie()
  for(let i=0;i<10;i++) {
    const response=await h.bootstrap.POST(request('intake-session',{},cookie))
    assert.equal(response.status,200)
    assert.equal(response.headers.get('set-cookie'),null)
  }
  assert.equal(h.sqlite.prepare("SELECT count(*) AS n FROM public_form_rate_limits WHERE key LIKE 'growth-assessment:%'").get().n,0)
})

test('browser bootstrap is serialized across callers before cookie installation completes', async t => {
  const h=await securityHarness();t.after(()=>h.close())
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator')
  t.after(()=>{ if(descriptor) Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator })
  let queue=Promise.resolve(),active=0,maxActive=0,fetchCount=0
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request(name,fn) {
    assert.equal(name,'phynyx-intake-bootstrap')
    const next=queue.then(fn);queue=next.catch(()=>{});return next
  }}}})
  globalThis.fetch=async()=>{ active++;maxActive=Math.max(maxActive,active);fetchCount++;await new Promise(resolve=>setTimeout(resolve,5));active--;return Response.json({success:true}) }
  const {ensureIntakeSession}=await h.load('lib/ensure-intake-session.ts')
  await Promise.all([ensureIntakeSession(),ensureIntakeSession()])
  assert.equal(maxActive,1);assert.equal(fetchCount,2)
})

for (const full of [false,true]) for (const email of ['test@example.test','unrelated@example.test']) {
  test(`unverified existing contact stays unlinked while fresh answers succeed: ${full?'full':'quick'}, ${email}`, async t => {
    const h=await setup(t,true), cookie=await h.newCookie(), input={...payload(full),email}
    const response=await h.route.POST(request('growth-assessment',input,cookie))
    assert.equal(response.status,200)
    const result = await response.json()
    assert.equal(result.saved,true); assert.equal(result.crmSynced,false); assert.equal(result.bookingReady,false)
    assert.equal(result.reportEmailSent,false)
    assert.equal(Boolean(result.snapshot),full)
    assert.equal('bookingContact' in result,false); assert.equal('contactId' in result,false)
    assert.equal(h.calls.filter(c=>c.method!=='GET').length,0)
    assert.equal(response.headers.get('set-cookie'),null)
    assert.equal(h.sqlite.prepare('SELECT status FROM growth_assessments').get().status,'contact-verification-required')
    assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,0)
  })
}

test('new visitor completes quick capture, full assessment, authorized replay, and one-use booking',async t=>{
  const h=await setup(t),cookie=await h.newCookie(),quick=payload(),full=payload(true)
  assert.equal((await h.route.POST(request('growth-assessment',quick,cookie))).status,200)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,1)
  const response=await h.route.POST(request('growth-assessment',full,cookie))
  assert.equal(response.status,200); assert.equal((await response.clone().json()).bookingReady,true)
  const bookingCookie=response.headers.get('set-cookie').split(';')[0]
  const mutations=h.calls.filter(c=>c.method!=='GET').length
  assert.equal((await h.route.POST(request('growth-assessment',full,cookie))).status,200)
  assert.equal(h.calls.filter(c=>c.method!=='GET').length,mutations)
  const contactResponse=await h.booking.POST(request('booking-session',{},`${cookie}; ${bookingCookie}`))
  assert.equal(contactResponse.status,200); assert.equal((await contactResponse.json()).bookingContact.contactId,'contact-test')
  assert.equal((await h.booking.POST(request('booking-session',{},`${cookie}; ${bookingCookie}`))).status,401)
})

test('missing or forged browser capability never reaches the CRM',async t=>{
  const h=await setup(t,true)
  for(const cookie of ['',`__Host-phynyx_intake=${'a'.repeat(64)}`]) {
    assert.equal((await h.route.POST(request('growth-assessment',payload(),cookie))).status,403)
  }
  assert.equal(h.calls.length,0)
})

test('copied UUID and payload cannot replay, mutate, or claim another session',async t=>{
  const h=await setup(t), cookie=await h.newCookie(), input=payload(true)
  const response=await h.route.POST(request('growth-assessment',input,cookie)); assert.equal(response.status,200)
  const bookingCookie=response.headers.get('set-cookie').split(';')[0]
  const other=await h.newCookie('192.0.2.2'), count=h.calls.length
  assert.equal((await h.route.POST(request('growth-assessment',input,other,'192.0.2.2'))).status,403)
  assert.equal(h.calls.length,count)
  assert.equal((await h.booking.POST(request('booking-session',{},`${other}; ${bookingCookie}`,'192.0.2.2'))).status,401)
  assert.equal((await h.booking.POST(request('booking-session',{},`${cookie}; ${bookingCookie}`))).status,200)
})

for(const status of ['crm-synced','crm-metadata-failed','crm-metadata-pending','contact-verification-required','unknown']) {
  test(`historical ${status} record cannot acquire authorization`,async t=>{
    const h=await setup(t),cookie=await h.newCookie(),input=payload(true)
    assert.equal((await h.route.POST(request('growth-assessment',input,cookie))).status,200)
    h.sqlite.prepare('UPDATE growth_assessments SET intake_session_hash=NULL,status=?,updated_at=0').run(status)
    h.sqlite.exec('DELETE FROM intake_contact_grants')
    const before=h.calls.length
    const response=await h.route.POST(request('growth-assessment',input,cookie))
    assert.equal(response.status,403); assert.equal(response.headers.get('set-cookie'),null)
    assert.equal(h.calls.length,before)
    assert.equal(h.sqlite.prepare('SELECT status FROM growth_assessments').get().status,status)
  })
}

test('grants reject wrong identity, location, contact, expired and revoked sessions',async t=>{
  const h=await setup(t),cookie=await h.newCookie()
  assert.equal((await h.route.POST(request('growth-assessment',payload(),cookie))).status,200)
  const session=await h.sessionModule.readIntakeSession(request('growth-assessment',{},cookie))
  await h.sessionModule.requireContactGrant(session,'contact-test','test@example.test','(312) 555-0100')
  for(const [id,email,phone] of [['other','test@example.test','+13125550100'],['contact-test','wrong@example.test','+13125550100'],['contact-test','test@example.test','+13125550199']]) {
    await assert.rejects(h.sessionModule.requireContactGrant(session,id,email,phone),{code:'CONTACT_VERIFICATION_REQUIRED'})
  }
  h.env.GHL_LOCATION_ID='wrong-location'
  await assert.rejects(h.sessionModule.requireContactGrant(session,'contact-test','test@example.test','+13125550100'),{code:'CONTACT_VERIFICATION_REQUIRED'})
  h.env.GHL_LOCATION_ID='location-test'
  h.sqlite.exec('UPDATE intake_sessions SET expires_at=0')
  assert.equal(await h.sessionModule.readIntakeSession(request('growth-assessment',{},cookie)),null)
  await assert.rejects(h.sessionModule.requireContactGrant(session,'contact-test','test@example.test','+13125550100'),{code:'CONTACT_VERIFICATION_REQUIRED'})
  h.sqlite.exec('DELETE FROM intake_sessions')
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,0)
})

test('metadata helper and legacy alias reject an ungranted contact before any CRM call',async t=>{
  const h=await setup(t,true),cookie=await h.newCookie()
  const session=await h.sessionModule.readIntakeSession(request('growth-assessment',{},cookie))
  for(const sync of [h.ghl.syncGrowthAssessmentMetadata,h.ghl.syncNewGrowthAssessmentMetadata]) {
    await assert.rejects(sync('contact-test',payload(),session),{code:'CONTACT_VERIFICATION_REQUIRED'})
  }
  assert.equal(h.calls.length,0)
})

test('a creation-race duplicate never acquires a grant or starts metadata writes',async t=>{
  const h=await setup(t),cookie=await h.newCookie(),base=globalThis.fetch
  let raced=false
  globalThis.fetch=async(url,init={})=>{
    const path=new URL(url).pathname
    if(path==='/contacts/' && init.method==='POST') { raced=true; return Response.json({}, {status:409}) }
    if(path==='/contacts/search/duplicate' && raced) return Response.json({contact:h.contact})
    return base(url,init)
  }
  const response=await h.route.POST(request('growth-assessment',payload(),cookie))
  assert.equal(response.status,200)
  assert.equal((await response.json()).crmSynced,false)
  assert.equal(h.calls.filter(c=>c.method!=='GET').length,0)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,0)
})

test('an ambiguous 200 create response does not establish creation provenance',async t=>{
  const h=await setup(t),cookie=await h.newCookie(),base=globalThis.fetch
  globalThis.fetch=async(url,init={})=>{
    if(new URL(url).pathname==='/contacts/' && init.method==='POST') return Response.json({contact:h.contact})
    return base(url,init)
  }
  const response = await h.route.POST(request('growth-assessment',payload(),cookie))
  assert.equal(response.status,200)
  assert.equal((await response.json()).crmSynced,false)
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,0)
})

test('authorized metadata-failure retry retains its grant, contact and original timestamp',async t=>{
  const h=await setup(t),cookie=await h.newCookie(),input=payload(),base=globalThis.fetch
  let fail=true
  globalThis.fetch=async(url,init={})=>{
    if(fail && new URL(url).pathname.endsWith('/notes') && init.method==='POST') { fail=false; return Response.json({}, {status:503}) }
    return base(url,init)
  }
  const response = await h.route.POST(request('growth-assessment',input,cookie))
  assert.equal(response.status,200)
  assert.equal((await response.json()).crmSynced,false)
  const row=h.sqlite.prepare('SELECT created_at,ghl_contact_id,status FROM growth_assessments').get()
  assert.equal(row.status,'crm-metadata-failed')
  assert.equal(h.sqlite.prepare('SELECT count(*) AS n FROM intake_contact_grants').get().n,1)
  assert.equal((await h.route.POST(request('growth-assessment',input,cookie))).status,200)
  assert.equal(h.calls.filter(c=>c.path==='/contacts/' && c.method==='POST').length,1)
  const after=h.sqlite.prepare('SELECT created_at,ghl_contact_id,status FROM growth_assessments').get()
  assert.equal(after.created_at,row.created_at);assert.equal(after.ghl_contact_id,row.ghl_contact_id)
  assert.equal(after.status,'crm-synced')
})

test('legacy handoff and revoked session cannot return booking contact data',async t=>{
  const h=await setup(t),cookie=await h.newCookie(),input=payload(true)
  const response=await h.route.POST(request('growth-assessment',input,cookie));assert.equal(response.status,200)
  const bookingCookie=response.headers.get('set-cookie').split(';')[0]
  h.sqlite.exec('UPDATE booking_handoffs SET intake_session_hash=NULL')
  assert.equal((await h.booking.POST(request('booking-session',{},`${cookie}; ${bookingCookie}`))).status,401)
  const second=await h.route.POST(request('growth-assessment',input,cookie));assert.equal(second.status,200)
  h.sqlite.exec('DELETE FROM intake_sessions')
  assert.equal((await h.booking.POST(request('booking-session',{},`${cookie}; ${second.headers.get('set-cookie').split(';')[0]}`))).status,401)
})
