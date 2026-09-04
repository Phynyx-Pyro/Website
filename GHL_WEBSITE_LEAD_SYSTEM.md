# Phynyx Website Lead System

Last updated: September 4, 2026

This document is the operating specification for website leads in the Phynyx
GoHighLevel location. It is intentionally separate from all legacy pipelines,
workflows, tags, and fields.

## System identifiers

- GoHighLevel location: `DsRnzA2tcoiwklSgjBtR`
- Sales pipeline: `Phynyx — Website Sales`
- Pipeline ID: `usVVpz3ldoUD9OQQOv09`
- Initial stage ID: `ac4d559d-7669-47ab-ae9b-832b7d29225b`
- Booking calendar: `Phynyx Website - Assessment`
- Calendar ID: `NX2pJFAx51yOcaNIdNjL`
- Sales associates: Craig Capurso and Dr. Andrew Higdon
- Workflow folder: `Phynyx Website Sales — v1`
- Intake workflow ID: `36118464-ea4a-4a5b-b5ab-a2cd614c2063`
- Automation version tag: `automation:phynyx-web-v1`

## Implementation status

- The pipeline, its ten stages, all listed tags, both custom-field folders, and
  their fields have been created in the Phynyx location without changing legacy
  assets.
- The production website release is deployed with the dedicated location,
  pipeline, stage, and server-only private-integration credentials. Required
  private-integration scopes and a live website-to-GoHighLevel sync have been
  verified.
- Workflow 00 is published in restricted canary mode. Its first action requires
  the website source, form, automation-version, and temporary `test:automation`
  tags plus a nonempty Website Submission ID; `automation:pause` forces the
  immediate stop branch. Untagged production leads cannot run the internal
  actions until the temporary test requirement is removed.
- The paused path, eligible internal-action path, and idempotent retry were
  validated on September 4, 2026. The eligible run assigned Craig, created one
  callback task, executed the Craig and Andrew in-app alerts, and sent no
  customer-facing email or SMS.
- Workflows 01–08 below are the reviewed build specification; they have not yet
  been created or published.

## Operating principles

1. One contact and one open website-sales opportunity per lead.
2. One accountable owner; Craig and Andrew both retain visibility.
3. Round-robin only when the contact is unassigned. Never overwrite a valid
   existing owner on a repeat submission. Confirm this policy before launch,
   because the callback task can then belong to someone other than Craig or
   Andrew.
4. The website writes structured CRM data before the automation enrollment
   signal is completed.
5. A new submission ID is the re-entry signal, including for existing contacts.
6. Stop lead follow-up immediately on appointment booked, reply, explicit opt
   out, Won, Lost, or `automation:pause`.
7. Do not send marketing SMS or email until consent language, evidence, and
   suppression rules have been approved and tested.

## Pipeline

| Stage | Probability | Entry rule | Required next action |
| --- | ---: | --- | --- |
| New Website Lead | 10% | Website opportunity created | Owner attempts contact within five minutes during coverage hours |
| Attempting Contact | 20% | First call/message attempted | Record outcome and schedule the next attempt |
| Connected / Qualifying | 35% | Two-way conversation started | Confirm fit, authority, need, and timing |
| Qualified / Needs Appointment | 50% | Qualified but not yet booked | Secure the assessment appointment |
| Appointment Scheduled | 60% | Calendar booking is active | Complete pre-call preparation |
| Reschedule Needed | 50% | Appointment cancelled or missed | Contact lead and rebook |
| Appointment Completed | 75% | Meeting outcome recorded as showed | Document outcome and next commercial step |
| Proposal / Estimate Sent | 85% | Proposal delivered | Set a dated follow-up |
| Decision / Follow-up | 90% | Decision pending | Maintain a specific next action date |
| Nurture / Recycle | 15% | Not ready, but still viable | Set a recycle date and reason |

Use HighLevel's native `Won` and `Lost` opportunity statuses for terminal
outcomes rather than adding duplicate won/lost stages.

## Tags

### Source, form, and intent

- `source:phynyx-website`
- `form:growth-assessment`
- `intent:assessment`

### Qualification and appointment state

- `fit:qualified`
- `fit:nurture`
- `appt:booked`
- `appt:no-show`
- `appt:cancelled`

### Operations and controls

- `ops:sla-breach`
- `ops:unassigned`
- `ops:needs-review`
- `automation:phynyx-web-v1`
- `automation:pause`
- `test:automation`

Tags should answer a durable segmentation question. Pipeline stages should
represent the current sales state; tags should not duplicate every stage.

## Structured CRM fields

### Contact fields

- Website Submission ID
- Website Form Name
- Website Form Version
- Website Conversion Page
- Website CTA Origin
- Assessment Industry
- Assessment Revenue Range
- Assessment Primary Challenge
- Assessment Current Marketing
- Assessment Budget Range
- Assessment Fit Result
- Investment Context Acknowledged
- Email Marketing Consent
- SMS Marketing Consent
- Consent Captured At (UTC)
- Consent Disclosure Version
- Consent Source Page
- Website First Landing Page
- Website Original Referrer
- Website Attribution Snapshot

### Opportunity fields

- Website Submission ID Snapshot
- Lead Intent
- Primary Service Interest
- Qualified Budget Range
- Decision Timeframe
- Next Action At (UTC)

### Population status

| Asset | Current status |
| --- | --- |
| Website Submission ID, form, conversion/CTA, assessment, fit, first landing/referrer, and attribution snapshot fields | Written by the website sync |
| Source, form, intent, automation-version, and one current fit tag | Written by the website sync |
| Investment Context Acknowledged | Created, but requires a verified server-side write from the visitor's explicit continue click |
| Email/SMS consent fields | Created but intentionally blank; blank means “not captured,” never permission granted |
| Decision Timeframe and Next Action opportunity fields | Created for the sales process; not website-populated |
| Appointment and operations tags | Created for planned workflows 01–08; not currently applied automatically |

## Attribution contract

The website should retain and pass the following evidence with every assessment:

- submission ID and UTC submission time
- form name and version
- first landing page and conversion page
- CTA origin
- original referrer
- UTM source, medium, campaign, content, and term
- `gclid`, `fbclid`, and `msclkid` when present
- a non-PII website session ID
- the deterministic qualification result and the inputs that produced it
- email/SMS consent choice, timestamp, disclosure version, and source page once
  approved consent controls exist

Keep raw attribution in the Website Attribution Snapshot for auditability while
also placing high-value dimensions in dedicated fields for filters and reports.
First-touch fields are write-once; the snapshot can reflect the latest
submission.

The current dedicated reportable first-touch fields are landing page and
referrer. UTM values and click IDs are retained in the attribution snapshot and
assessment note, but are not yet individual GoHighLevel report columns. Add
dedicated first-touch UTM Source, Medium, and Campaign fields before relying on
native GoHighLevel campaign reporting.

The Investment Context Acknowledged field is reserved but the current website
does not yet write it when the visitor accepts the investment gate. Consent
fields also remain intentionally unpopulated until approved consent controls
exist. Decision Timeframe and Next Action are downstream sales fields, not
website intake fields.

## Workflow architecture

### 00 — Website Intake & Routing

Status: published in restricted canary mode; not yet open to untagged production
website leads.

Trigger: Website Submission ID changes.

First-action safety gate:

- require all of `source:phynyx-website`, `form:growth-assessment`,
  `automation:phynyx-web-v1`, and the temporary `test:automation` tag
- require Website Submission ID to be nonempty
- require `automation:pause` to be absent
- end immediately when any requirement is not met

Actions:

1. Send Andrew an in-app visibility notification with the lead's contact and
   assessment details.
2. Assign Craig or Andrew equally, only when the contact has no owner.
3. Notify the assigned owner in-app with the lead's contact and assessment
   details and the five-minute SLA.
4. Send Craig a separate in-app visibility notification.
5. Create a same-day callback task for the contact owner; the task description
   requires the first attempt within five minutes.

There are no customer-facing email, SMS, voicemail, WhatsApp, or other outbound
message actions in Workflow 00.

HighLevel's task action accepts day-level offsets rather than a relative
five-minute due time, so the current task is due at 5:00 PM the same day. The
five-minute requirement is explicit in the owner alert and task description;
Workflow 01 is the actual five-minute SLA monitor.

Workflow re-entry is enabled so a later assessment from an existing contact can
run again. Multiple-opportunity execution is disabled to prevent duplicate
alerts or callback tasks when a contact has unrelated opportunities elsewhere.

The website integration creates or reuses the open opportunity before it marks
the database submission complete. GoHighLevel's coupled owner setting keeps the
contact and opportunity owner aligned.

### Canary validation evidence

- Synthetic contact: `E2E PhynyxTest` (`OjworJILwWTWER1nHh6c`)
- Dedicated opportunity: `8nVYLJckzoQql0FRVoDX` in New Website Lead
- Paused submission: `b7c51cd1-8b43-4c5e-bfc9-90b7e69582b4`; entered Workflow
  00, took `Stop — not eligible`, finished, and stayed unassigned with no task
- Eligible submission: `ed21eb0f-4ad1-40e6-87b8-f9944c40f3cf`; took `Process
  website lead`, assigned Craig, executed all three internal-notification
  actions, created exactly one callback task, and finished successfully
- Exact replay of the eligible submission returned successfully without a new
  workflow execution or second task
- No appointment was booked and no customer-facing message was sent

### 01 — Speed-to-Lead SLA

Status: planned — not built or published.

Trigger: opportunity enters New Website Lead.

Actions:

1. Wait five minutes during defined coverage hours.
2. If the lead is still in New Website Lead, add `ops:sla-breach` and alert the
   owner plus both sales associates.
3. At ten minutes, repeat the alert and create an escalation task if the stage
   is still unchanged.
4. Remove `ops:sla-breach` when the lead advances.

### 02 — Permission-Based Lead Follow-up

Status: planned — not built or published.

Trigger: qualified website lead remains unbooked.

Actions:

1. Use short, owner-led SMS/email follow-up only for channels with recorded
   consent and without DND/opt-out status.
2. Create call tasks for non-consented channels instead of automated messages.
3. Stop on reply, appointment booked, stage advancement, `automation:pause`,
   Won, or Lost.
4. Move inactive but viable leads to Nurture / Recycle with a dated next action.

### 03 — Appointment Lifecycle

Status: planned — not built or published.

Trigger: appointment booked on calendar `NX2pJFAx51yOcaNIdNjL` or appointment
status changes.

Actions:

1. Add `appt:booked`, remove cancellation/no-show tags, and move the opportunity
   to Appointment Scheduled.
2. Respect the calendar-assigned team member as the contact/opportunity owner.
3. Send internal booking visibility to Craig and Andrew.
4. Send confirmations and reminders only through the approved calendar channels.

### 04 — Cancellation and No-show Recovery

Status: planned — not built or published.

Trigger: appointment is cancelled or marked no-show on the assessment calendar.

Actions:

1. Remove `appt:booked`, add the matching cancellation/no-show tag, and move the
   opportunity to Reschedule Needed.
2. Notify the owner and create an immediate rebooking task.
3. Run a short permission-based reschedule sequence.
4. Stop as soon as a replacement appointment is booked.

### 05 — Post-appointment Sales Process

Status: planned — not built or published.

Trigger: appointment on the assessment calendar is marked showed. Only advance
an opportunity that is still earlier than Appointment Completed; never move a
later-stage opportunity backward.

Actions:

1. Move to Appointment Completed.
2. Require an outcome note and dated next action.
3. Move to Proposal / Estimate Sent when a proposal is delivered.
4. Move to Decision / Follow-up while the commercial decision is pending.

### 06 — Stale Opportunity and Recycle

Status: planned — not built or published.

Trigger: no stage movement or next action by the stage-specific threshold.

Actions:

1. Alert the owner before changing state.
2. Add `ops:needs-review` when required information is missing.
3. Move qualified but inactive leads to Nurture / Recycle only after review.
4. Preserve first-touch attribution and prior activity.

### 07 — Won/Lost Cleanup

Status: planned — not built or published.

Trigger: opportunity status changes to Won or Lost.

Actions:

1. Stop all prospect follow-up workflows and clear SLA tags.
2. Require a lost reason for Lost opportunities.
3. Start the appropriate onboarding handoff for Won opportunities.
4. Keep the original source, submission, and attribution evidence unchanged.

### 08 — Operations Exceptions

Status: planned — not built or published.

Trigger: missing owner, failed website sync, duplicate opportunity, incomplete
required data, or workflow error.

Actions:

1. Add `ops:unassigned` or `ops:needs-review` as appropriate.
2. Create a task for the CRM administrator.
3. Notify the responsible internal users without contacting the lead.
4. Remove the exception tag only after the underlying condition is resolved.

A website sync can fail before a GoHighLevel contact exists, so this workflow
cannot be the only exception monitor. Add a site-side monitor for D1 submissions
in failed CRM statuses and route it to a named CRM administrator. CRM
administrator and escalation destination: TBD before build.

## Calendar requirements

- Both Craig and Andrew remain members of the round-robin calendar.
- The calendar's contact-assignment option remains enabled.
- Each team member's connected video meeting location must be valid.
- Minimum notice, booking window, buffers, and daily appointment caps must match
  the actual sales coverage policy.
- Craig's and Andrew's availability must be reviewed individually before launch.
- Appointment status workflows must be filtered to this calendar ID so other
  calendars cannot move website opportunities.

Current audit: this is an active 30-minute round-robin calendar with one-day
minimum notice and a seven-day booking window. Craig currently shows weekday
availability from 8:00 AM to 5:00 PM. Andrew's weekday rows display 12:00 AM to
12:00 AM and need an explicit human check before launch. The calendar's native
booked alert is enabled; cancellation, reschedule, reminder, and follow-up
notifications are not currently enabled.

The website and calendar are aligned on a 30-minute assessment.

## External tracking

The site already loads HighLevel external tracking ID
`tk_82ef560d06d74a06987702f8cfae1770`. It can create or update contacts outside
the custom assessment API; the server assessment API remains the canonical path
for structured fields, notes, opportunities, and the workflow enrollment
signal. Because legacy workflows still exist in the same location, test whether
an externally tracked submission can enroll in any legacy global workflow
before production launch; folder separation alone does not prevent
cross-enrollment. Test calendar consent and third-party invite behavior
separately from website marketing consent.

## Reporting

Track at minimum:

- website submissions by first-touch source/medium/campaign
- qualified rate and booked rate
- median first-response time and five-minute SLA attainment
- appointment show, cancellation, and no-show rates
- stage conversion and age by owner
- proposal rate, win rate, sales cycle, and revenue by source/campaign
- unassigned, duplicate, failed-sync, and missing-attribution counts

## Activation checklist

1. Confirm Andrew's real booking availability and coverage hours.
2. ~~Reconcile the website's 15-minute promise with the calendar's 30-minute
   duration.~~ Completed: both now state 30 minutes.
3. ~~Add Contacts Read, Opportunities Read, and Opportunities Write scopes to
   the dedicated `Phynyx Website` private integration.~~ Completed and verified.
4. ~~Store the private token and the three non-secret GHL IDs in the deployed
   site environment.~~ Completed; the token remains secret and server-side.
5. ~~Add the Workflow 00 source/pause guard.~~ Completed and canary-tested. Wire
   Investment Context Acknowledged separately if that signal should be
   operationally reportable.
6. Approve channel-specific consent copy and capture before enabling customer
   SMS/email.
7. Define coverage timezone/hours, stage-aging thresholds, the Lost-reason
   method, Won-onboarding destination, CRM administrator, and escalation
   recipients.
8. Build workflows 01–08 as drafts and perform a peer review.
9. ~~Add a temporary `test:automation` enrollment gate or use a restricted,
   published test clone so no production contact can enroll during validation.~~
   Completed; the temporary gate remains active pending production approval.
10. Run at least 20 labeled test submissions covering new/existing contacts,
   qualified/nurture paths, duplicate retries, each owner, bookings, reschedules,
   cancellations, no-shows, Won, Lost, and opt-out behavior.
11. Include paused repeat submissions, pre-existing non-Phynyx owners, duplicate
    open opportunities, native calendar email/invite behavior, and unknown
    consent states in the test set.
12. Verify exactly one contact, one open opportunity, one owner, correct
   attribution, correct calendar, and no unintended messages for every test.
13. Verify external tracking does not enroll test leads in any legacy global
    workflow.
14. Publish in phases: intake/internal alerts, appointment lifecycle, SLA alerts,
   then permission-based customer follow-up.
15. Review execution logs daily for the first week and weekly thereafter.

Initial controlled canary coverage is complete. The broader 20-case matrix in
items 10–13, Andrew's real availability, and removal of the temporary
`test:automation` requirement remain production-launch gates.
