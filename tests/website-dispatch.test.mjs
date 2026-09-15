import assert from 'node:assert/strict'
import test from 'node:test'
import { securityHarness } from './helpers/security-harness.mjs'

const origin='https://company.example.test', originalFetch=globalThis.fetch
test.afterEach(()=>{globalThis.fetch=originalFetch})
function req(path,body,cookie=''){return new Request(origin+'/api/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie,'CF-Connecting-IP':'192.0.2.44'},body:JSON.stringify(body)})}
function input(full=false){return {submissionId:crypto.randomUUID(),firstName:'Test',lastName:'Visitor',email:'authorized@owned.test',phone:'+13125550100',consent:{smsMarketing:false,smsService:false,aiVoice:false},attribution:{conversionPage:origin+'/growth-assessment'},...(full?{businessName:'Test Practice',industry:'dental',annualRevenue:'500k-1m',monthlyBudget:'3k-5k',capacity:'6-10',decisionRole:'owner',implementationTiming:'within-30-days',followUpOwner:'yes',snapshot:{metrics:Object.fromEntries(Object.entries({leads:100,contacted:60,booked:40,confirmed:35,showed:30,started:20,adSpend:3000,averageStartValue:1000}).map(([k,value])=>[k,{value,confidence:'exact'}])),responseTime:'5-15-minutes',followUpAttempts:'4-6',attributionCoverage:'some'}}:{submissionType:'homepage-quick-form'})}}
async function setup(t,mode='test'){
 const h=await securityHarness();t.after(()=>h.close())
 Object.assign(h.env,{SITE_URL:origin,WEBSITE_CRM_DISPATCH_ENABLED:'true',WEBSITE_CRM_MODE:mode,WEBSITE_CRM_TEST_EMAIL:'authorized@owned.test',WEBSITE_CRM_TEST_PHONE:'+13125550100',WEBSITE_TEST_SUPPRESSION_APPROVED:'true',WEBSITE_ACCEPTANCE_WORKFLOWS_APPROVED:'true',WEBSITE_ACCEPTANCE_CONTACT_ID:'contact-1',WEBSITE_VERIFICATION_ENABLED:'true'})
 const contacts=[],opps=[],writes=[],messages=[],events=[];let failCreate=false
 const constants=await h.load('lib/ghl.ts');const definitions=Object.values(constants.GHL_CONTACT_FIELD_KEYS).map(fieldKey=>({id:fieldKey,fieldKey}))
 globalThis.fetch=async(url,options={})=>{
  assert.equal(options.headers.Version,'2021-07-28')
  const u=new URL(url),method=options.method||'GET',body=options.body?JSON.parse(options.body):null
  let data={}
  if(u.pathname==='/contacts/search'){const {field,value}=body.filters[0];const found=contacts.filter(c=>c[field]===value);return Response.json({contacts:found,total:found.length})}
  if(u.pathname==='/opportunities/pipelines')return Response.json({pipelines:[{id:'pipeline-test',stages:[{id:'stage-test'}]}]})
  if(u.pathname.includes('/customFields'))return Response.json({customFields:definitions})
  if(method!=='GET')writes.push({path:u.pathname,method,body})
  if(u.pathname==='/contacts/'&&method==='POST'){
   if(failCreate)throw new Error('Synthetic lost create response')
   const c={...body,id:'contact-'+(contacts.length+1),customFields:[]};contacts.push(c);return Response.json({contact:c},{status:201})
  }
  if(u.pathname==='/opportunities/search')return Response.json({opportunities:opps.filter(o=>o.contactId===u.searchParams.get('contactId')),meta:{total:opps.length}})
  if(u.pathname==='/opportunities/'&&method==='POST'){const o={...body,id:'opp-'+(opps.length+1)};opps.push(o);return Response.json({opportunity:o},{status:201})}
  if(u.pathname.endsWith('/appointments'))return Response.json({events})
  if(u.pathname==='/conversations/messages'){messages.push(body);return Response.json({messageId:'message-'+messages.length})}
  const c=contacts.find(c=>u.pathname.startsWith('/contacts/'+c.id))
  if(!c)throw new Error('Unexpected request '+method+' '+u.pathname)
  if(u.pathname.endsWith('/tags')){if(method==='POST')c.tags=[...new Set([...(c.tags||[]),...body.tags])];else c.tags=c.tags.filter(t=>!body.tags.includes(t))}
  else if(method==='PUT'){assert.deepEqual(Object.keys(body),['customFields']);for(const f of body.customFields){c.customFields=c.customFields.filter(x=>x.id!==f.id);c.customFields.push({id:f.id,value:f.fieldValue})}}
  data={contact:c};return Response.json(data)
 }
 const route=await h.load('app/api/growth-assessment/route.ts'),bootstrap=await h.load('app/api/intake-session/route.ts')
 const cookie=(await bootstrap.POST(req('intake-session',{}))).headers.get('set-cookie').split(';')[0]
 const seed=()=>{const c={id:'contact-1',locationId:'location-test',email:'authorized@owned.test',phone:'+13125550100',tags:[],dnd:false,customFields:[]};contacts.push(c);return c}
 return {...h,route,cookie,bootstrap,contacts,opps,writes,messages,events,seed,setFailCreate:v=>{failCreate=v},post:async p=>{const r=await route.POST(req('growth-assessment',p,cookie));assert.equal(r.status,200);return r.json()}}
}

test('deployed-route adapter creates once, preserves stage receipts/history and never clears DND or consent',async t=>{
 const h=await setup(t),quick=input(),full=input(true)
 assert.equal((await h.post(quick)).crmSynced,true)
 assert.equal((await h.post(full)).crmSynced,true)
 assert.equal((await h.post(full)).crmSynced,true)
 assert.equal((await h.post({...full,submissionId:crypto.randomUUID()})).crmSynced,true)
 assert.equal(h.contacts.length,1);assert.equal(h.opps.length,1)
 assert.equal(h.contacts[0].dnd,true);assert.ok(h.contacts[0].tags.includes('sales:booking-followup'))
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM website_dispatch_receipts').get().n,12)
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM growth_assessments').get().n,3)
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM website_dispatch_locks').get().n,0)
 assert.equal(h.messages.length,0);assert.equal(h.writes.some(w=>w.path.includes('/workflow')),false)
 assert.equal(h.writes.some(w=>w.path.startsWith('/opportunities/')&&w.method==='PUT'),false)
})
test('parallel retries and distinct events cannot create parallel contacts/opportunities',async t=>{
 const h=await setup(t),p=input()
 await Promise.all([h.post(p),h.post(p),h.post({...p,submissionId:crypto.randomUUID()})])
 assert.equal(h.contacts.length,1);assert.equal(h.opps.length,1)
 assert.ok(h.sqlite.prepare("SELECT count(*) n FROM website_dispatch_receipts WHERE channel='crm' AND state='applied'").get().n<=2)
})
test('existing and conflicting identities never receive a grant or mutation from typed details',async t=>{
 const h=await setup(t,'acceptance');h.seed()
 const result=await h.post(input(true));assert.ok(result.snapshot);assert.equal(result.crmSynced,false)
 assert.equal(h.writes.length,0);assert.equal(h.sqlite.prepare('SELECT count(*) n FROM intake_contact_grants').get().n,0)
 h.contacts.push({...h.contacts[0],id:'contact-other',email:'other@owned.test'})
 await h.post(input());assert.equal(h.writes.length,0)
})
test('unknown create outcome never blindly retries or releases identity locks',async t=>{
 const h=await setup(t),p=input();h.setFailCreate(true)
 assert.equal((await h.post(p)).crmSynced,false)
 await h.post(p);await h.post(input())
 assert.equal(h.writes.filter(w=>w.path==='/contacts/').length,1)
 assert.equal(h.sqlite.prepare("SELECT count(*) n FROM website_dispatch_receipts WHERE state='reconcile'").get().n,1)
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM website_dispatch_locks').get().n,2)
})
test('closed/progressed opportunities and appointments survive repeats without CRM changes',async t=>{
 const h=await setup(t);await h.post(input());h.writes.length=0
 h.opps[0].status='won';h.opps[0].assignedTo='original-owner'
 assert.equal((await h.post(input(true))).crmSynced,false);assert.equal(h.writes.length,0)
 h.opps[0].status='open';h.opps[0].pipelineStageId='progressed-stage'
 await h.post(input(true));assert.equal(h.writes.length,0)
 h.events.push({appointmentStatus:'confirmed'});await h.post(input(true));assert.equal(h.writes.length,0)
 assert.equal(h.opps[0].assignedTo,'original-owner')
})
test('verification is single-use, scanner-safe, sends to stored identity and permits explicit same-event retry',async t=>{
 const h=await setup(t,'acceptance');h.seed();const p=input(true);await h.post(p)
 const sender=await h.load('app/api/verification/request/route.ts'),confirm=await h.load('app/api/verification/confirm/route.ts')
 const responses=await Promise.all([sender.POST(req('verification/request',{submissionId:p.submissionId},h.cookie)),sender.POST(req('verification/request',{submissionId:p.submissionId},h.cookie))])
 for(const r of responses)assert.equal(r.status,200)
 assert.equal(h.messages.length,1);assert.equal(h.messages[0].contactId,'contact-1');assert.equal('emailTo' in h.messages[0],false)
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM intake_contact_grants').get().n,0)
 const token=h.messages[0].html.match(/\/verify#([a-f0-9]{64})/)[1]
 assert.equal(h.sqlite.prepare('SELECT token_hash FROM website_verifications').get().token_hash.includes(token),false)
 assert.equal((await confirm.POST(req('verification/confirm',{token},h.cookie))).status,200)
 assert.equal((await confirm.POST(req('verification/confirm',{token},h.cookie))).status,400)
 const replay=await h.post(p)
 assert.equal(replay.crmSynced,true,JSON.stringify({replay,receipts:h.sqlite.prepare('SELECT state,detail FROM website_dispatch_receipts').all()}))
 assert.equal(h.contacts.length,1);assert.equal(h.opps.length,1)
 assert.equal(h.sqlite.prepare("SELECT state FROM website_dispatch_receipts WHERE channel='voice'").get().state,'not_authorized')
 assert.equal(h.messages.length,1) // recovery sends remain separately gated
})
test('expired or identity-changed verification and email DND cannot grant access or send',async t=>{
 const h=await setup(t,'acceptance'),c=h.seed(),p=input();await h.post(p)
 const sender=await h.load('app/api/verification/request/route.ts'),confirm=await h.load('app/api/verification/confirm/route.ts')
 c.dnd=true;assert.equal((await sender.POST(req('verification/request',{submissionId:p.submissionId},h.cookie))).status,409);assert.equal(h.messages.length,0)
 c.dnd=false;await sender.POST(req('verification/request',{submissionId:p.submissionId},h.cookie))
 const token=h.messages[0].html.match(/\/verify#([a-f0-9]{64})/)[1]
 c.phone='+13125550101';assert.equal((await confirm.POST(req('verification/confirm',{token},h.cookie))).status,400)
 c.phone='+13125550100';h.sqlite.exec('UPDATE website_verifications SET expires_at=0')
 assert.equal((await confirm.POST(req('verification/confirm',{token},h.cookie))).status,400)
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM intake_contact_grants').get().n,0)
})
test('legacy switch alone and historical pending rows never activate CRM',async t=>{
 const h=await setup(t);delete h.env.WEBSITE_CRM_MODE
 const p=input();await h.post(p);assert.equal(h.writes.length,0)
 h.env.WEBSITE_CRM_MODE='test';await h.post(p);assert.equal(h.writes.length,0)
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM website_dispatch_receipts').get().n,0)
})

test('a link can authorize a different browser, but copying the submission ID cannot',async t=>{
 const h=await setup(t,'acceptance');h.seed();const p=input();await h.post(p)
 const sender=await h.load('app/api/verification/request/route.ts'),confirm=await h.load('app/api/verification/confirm/route.ts')
 const other=(await h.bootstrap.POST(req('intake-session',{}))).headers.get('set-cookie').split(';')[0]
 assert.equal((await sender.POST(req('verification/request',{submissionId:p.submissionId},other))).status,400)
 await sender.POST(req('verification/request',{submissionId:p.submissionId},h.cookie))
 const token=h.messages[0].html.match(/\/verify#([a-f0-9]{64})/)[1]
 assert.equal((await confirm.POST(req('verification/confirm',{token},other))).status,200)
 // Only the confirming browser gains access, not the original requesting browser.
 assert.equal((await h.post(input(true))).crmSynced,false)
 const r=await h.route.POST(req('growth-assessment',input(true),other))
 assert.equal(r.status,200);assert.equal((await r.json()).crmSynced,true)
 assert.equal(h.contacts.length,1)
})
test('caller cannot override verification recipient; runtime 403 is retained without exposing credentials',async t=>{
 const h=await setup(t,'acceptance');h.seed();const p=input();await h.post(p)
 const sender=await h.load('app/api/verification/request/route.ts'),base=globalThis.fetch
 let sends=0
 globalThis.fetch=async(url,options)=>{if(new URL(url).pathname==='/conversations/messages'){sends++;return Response.json({message:'Forbidden'},{status:403})}return base(url,options)}
 const r=await sender.POST(req('verification/request',{submissionId:p.submissionId,email:'attacker@owned.test'},h.cookie))
 assert.equal(r.status,503);assert.equal(sends,1)
 await sender.POST(req('verification/request',{submissionId:p.submissionId},h.cookie));assert.equal(sends,1)
 assert.equal(h.sqlite.prepare('SELECT state FROM website_verifications').get().state,'send_uncertain')
 assert.equal(h.sqlite.prepare('SELECT count(*) n FROM intake_contact_grants').get().n,0)
})

test('call DND does not suppress authorized email/SMS, and historical appointments do not reset the current journey',async t=>{
 const h=await setup(t),mod=await h.load('lib/website-dispatch.ts')
 const c={tags:[],dnd:false,dndSettings:{call:{status:'active'},email:{status:'inactive'},sms:{status:'inactive'}}}
 const p={...input(true),submissionType:'full-assessment',fit:{path:'calendar'},consent:{smsService:true,aiVoice:false}}
 assert.equal(mod.recoveryChannelState(c,p,'email'),'awaiting_workflow_activation')
 assert.equal(mod.recoveryChannelState(c,p,'sms'),'awaiting_workflow_activation')
 assert.equal(mod.recoveryChannelState(c,p,'voice'),'suppressed')
 await h.post(input());h.events.push({appointmentStatus:'confirmed',startTime:'2020-01-01T00:00:00Z'})
 assert.equal((await h.post(input(true))).crmSynced,true)
 assert.equal(h.events[0].appointmentStatus,'confirmed');assert.equal(h.opps.length,1)
})
