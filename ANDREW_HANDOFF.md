# Andrew: company website handoff

## Source of truth

The deployed company Site is **PhynyxPro Official Website**, with its own Sites
source repository. The public review mirror is GitHub `Phynyx-Pyro/Website`,
branch `company/assessment-capture-checkpoint`. Keep GitHub `main`, the personal
Site, get.phynyxpro.com, DNS and sharing unchanged until separate acceptance.
The source owner records Sites commit/version/deployment and GitHub commit
separately; matching complete Git trees establish parity even when commit IDs
differ. Fetch before editing and coordinate a single deployment owner.

## Safe editorial work

Marketing copy, images, layout and styling can be edited with normal review.
Preserve required form fields, consent wording/independent checkboxes, hidden
honeypot, session bootstrap, server-side validation and submission IDs. Do not
move GHL tokens into client code or remove verification to make a form pass.
Changes to qualification, consent, routes, database schema, dispatch gates or
workflow mappings need integration-owner review. Do not merge the company's
hosting manifest into the personal configuration on main.

## Implemented integration boundary

- Fresh reports and immutable answer/consent snapshots survive CRM failure.
- The production route uses the durable adapter in `lib/website-dispatch.ts`.
  The previous route is retained **only as a test fixture**; its old opportunity
  and retry behavior is not reachable through the production route.
- Stage-qualified CRM and email/SMS/voice receipts live in
  `website_dispatch_receipts`. Identity/contact locks prevent overlapping CRM
  writes. Unknown mutation outcomes retain locks for explicit reconciliation;
  never delete a lock merely because time passed.
- New unmatched contacts can be captured in the bounded synthetic test mode.
  Acceptance mode requires an existing, explicitly configured test contact and
  a valid ownership grant. Configuration limits recipients; it is not an
  authentication bypass. General public CRM activation remains gated.
- Verification uses the existing GHL conversation-email API, a hashed single-use
  15-minute capability and an explicit confirmation POST. Opening a link alone
  grants nothing. A different device can verify and start a fresh assessment.
  No previous CRM/report information is loaded. No new sender subscription.
- Normal email/SMS/voice workflow testing is authorized only for the privately
  configured acceptance recipient. Recovery dispatch now records explicit API
  removal/enrollment acknowledgments; these do not prove membership or delivery.
  Browser trigger/channel configuration was confirmed saved/published by the
  coordinator September 15 at approximately 18:27 CDT. Live CRM/recovery and
  booking acceptance remain unproven until the coordinated browser test.

## Configuration and live test sequence

`WEBSITE_CRM_DISPATCH_ENABLED` alone cannot activate the old adapter.
`WEBSITE_CRM_MODE=test` additionally requires exact runtime test email/phone and
`WEBSITE_TEST_SUPPRESSION_APPROVED=true`; creates use test marker, pause and DND.
`WEBSITE_CRM_MODE=acceptance` instead requires a configured contact ID and
`WEBSITE_ACCEPTANCE_WORKFLOWS_APPROVED=true`; it never creates a substitute contact
or clears DND. Acceptance also requires `WEBSITE_RECOVERY_DISPATCH_ENABLED=true`.
The dispatcher writes `company-v2` before trigger-producing tags/fields. Legacy
002a–d tag triggers must use the confirmed positive `Website Form Version = v1`
filter; do not assume unsupported negative source-tag filters. These approval flags must represent completed browser checks, not
be toggled to skip them. No test recipients belong in public source or docs.

`WEBSITE_VERIFICATION_ENABLED` separately allows the configured acceptance
contact to request a verification email. Required runtime scope:
`conversations/message.write`, plus the existing contact/configuration read scopes.
An API message ID is an acknowledgment, not proof of inbox delivery. Read back
message status and obtain recipient confirmation. A failed/uncertain send is not
automatically retried; one send is admitted per submitted event. After expiry,
start a fresh assessment to request a fresh link.

The coordinator submits a **fresh** company assessment, requests the email,
confirms the link in the assessment browser, then completes the full assessment
or explicitly retries its final handoff. On another browser/device, complete a
fresh assessment after verification there. Check service-SMS consent only if the
test recipient explicitly wants that follow-up. For existing 002d, current
marketing-SMS consent plus the stored consent tag is required. Voice similarly
requires current affirmative AI-voice consent and the stored tag; preserve DND.
No historical pending submission is automatically exported.

Do not call local mocked tests, page GETs or an MCP-created record a website
integration test. Acceptance evidence must tie website POSTs to D1 receipts,
runtime-created/linked contact and opportunity IDs, independent GHL readback and
workflow/message outcomes. See `WEBSITE_RECOVERY_CONTRACT.md` for the state model.

## Current recovery checkpoint

`lib/website-recovery.ts` maps existing 002a–d and records stage/channel external
operation receipts. A fresh intentional event replaces pending acquisition
follow-up only after four acknowledged removals. Retries never restart it. Lost
responses retain the contact lock for reconciliation. No active-state tags.

001 remains driven by Submission ID changes; the adapter never enrolls it too.
The observed 001 graph provides internal FYIs, not owner assignment. Keep its
current behavior under review and preserve existing owners.

The approved returning-nurture exception is separately configured using
`WEBSITE_RETURNING_NURTURE_APPROVED` and `WEBSITE_RETURNING_NURTURE_STAGE_ID`.
It preserves the same open nurture opportunity without resetting stage, value,
owner or history. Other progressed/closed/booked paths remain protected.

Read `WEBSITE_RECOVERY_CONTRACT.md` for the confirmed positive trigger filters,
company-only email branches and company recovery destination. Environment
revision 11 authorizes the configured acceptance recipient only. Live CRM,
workflow and delivery receipts remain required; configuration is not test success. The negative source-tag exclusion
proposal was not supported by the UI and was never saved.

## Expired-session same-event recovery

After an intake cookie expires, the report's existing verification button may
request proof for its saved event without making a new assessment. The request
only sends to the validated stored email and grants no access. Successful email
confirmation can atomically rebind a still-unlinked, verification-held event to
the confirming browser, preserving its answers/report and original session audit.
The existing report can then retry the same handoff. Do not extend an expired
session or infer contact ownership from the configured test identity. No live
email is sent by deployment; the coordinator owns the button click and test.

## Verified handoff API correction

Live full-event email receipt and confirmation are now observed. The next saved
handoff stopped before CRM mutation on HTTP 422. Opportunity search now uses
the snake_case filters required by its pinned 2021-07-28 API, including protective
re-reads. A current ownership grant can release only the narrowly checked
pre-write 422 hold on an explicit same-event retry; uncertain writes remain
blocked. Keep the existing report open and let the coordinator own that retry.
Do not resend verification or create a new event to work around a dispatch error.

Environment revision 11 and audience remain unchanged. Tests are mocked upstream;
actual corrected CRM/workflow receipts and recovery delivery remain untested.
The generic report verification/scheduling notice alone is not authoritative
evidence of grant state; use the correlated receipt. No booking capability is
enabled by this correction. Release identifiers are recorded in the checkpoint
commit message and the coordinating handoff, with no private contact data.

## Live v9 result and status-copy checkpoint

The verified returning-contact handoff succeeded through the deployed website:
CRM `applied`, all four reviewed exits acknowledged, and 002b email / 002d SMS /
002c voice enrollments acknowledged. Independent MCP readback confirms current
event/qualification/company fields and tags, with the original open nurture
opportunity and owner/value/history preserved. No locks or booking grants remain.
This supersedes the prior pending-CRM result above; actual downstream delivery
and workflow execution remain separate evidence required from the coordinator.

The report now retains CRM/recovery response state and displays accepted follow-up
without claiming delivery or asking an already-linked visitor to verify again.
Calendar availability no longer determines the follow-up wording. This is a
presentation correction only: no adapter, workflow, flags or booking-policy edits.
Do not retry the successful live event just to see new copy in its open browser.
Keep the existing report and inspect the contact's normal workflow history next.

## Coordinator-confirmed workflow execution, September 15 CDT

Independent browser evidence now confirms the authorized test contact is active
in 002b, 002d and 002c. The coordinator observed:

| Workflow | Execution evidence (CDT) |
| --- | --- |
| 002b booking recovery | Added 19:35:06; Wait 15 Minutes |
| 002d SMS | Added 19:35:07; Wait 15 Minutes |
| 002c voice | Added 19:35:09; Wait 60 Minutes |
| 001 intake | Process website lead 19:35:05; FYI Andrew executed 19:35:07; FYI Craig executed 19:35:08; finished 19:35:09 |

002c/d retain Contact timezone, weekdays 09:00–17:00. Email has no time window.
The waits do not guarantee a send at their expiry: channel time windows,
eligibility, replies and suppression still apply. The existing opportunity is
confirmed unchanged in the browser: original record, Open, Nurture / Recycle,
$0 and original owner. No repeat submission or replay was performed.

This upgrades the prior acknowledgment-only evidence to confirmed active
membership and observed 001 action execution. It does not establish FYI inbox
delivery, recovery email/SMS delivery, voice execution or appointment conversion.
The coordinator is checking recovery email after the normal wait. Preserve this
test and its receipts; do not restart it for additional evidence.

## Remaining inline booking and report delivery work

`savedAssessmentResponse` deliberately returns `bookingReady: false`. The new
assessment route does not call `issueBookingSession`; both issuance and claim in
`lib/booking-session.ts` still require legacy `crm-synced`, while the new adapter
records `dispatch-applied`. Existing `/api/booking-session` consumes a single-use
15-minute cookie and validates the intake session/contact grant. Its old expiry
copy asks for another assessment and must be changed when this path is integrated.
Simply changing the boolean would not create a valid handoff.

Before inline booking acceptance:

1. Wire an explicit same-event booking handoff for an eligible, verified,
   successfully linked assessment, using the new receipt state and current
   contact grant. Recheck identity, suppression and existing appointments/sales
   protections; retain the approved returning-nurture rule. No CRM identity
   overwrite or duplicate opportunity is needed to issue a handoff.
2. Preserve expiry, single-use, browser binding and origin checks. Provide
   same-event renewal/re-verification after expiry, without replaying CRM or
   recovery. Test wrong-browser access, copied/expired tokens and repeat clicks.
3. Inspect the live calendar's contact matching/duplicate policy, prefill edits,
   third-party invite and native notification effects, consent behavior, team
   assignment, availability and meeting destinations. The existing widget sends
   contact prefill by restricted-origin postMessage with `consent: null` and
   `isConsentExpected: false`; that is not a new marketing opt-in. Older documented
   calendar observations are not current acceptance evidence. No policy changes
   are authorized by this documentation update.
4. Run one separately coordinated booking acceptance: correct calendar, one
   intended appointment, existing contact reused, intended ownership/stage
   behavior, `appt:booked` and recovery exits, and expected confirmations only.
   Include company origin/tracking isolation and verify no unrelated contact or
   personal-site path is affected. Do not perform that booking during this test's
   pending delivery observation.

Report email is a missing implementation, not an approved substitution. The
current path stores/displays the report and returns `reportEmailSent: false`;
002b's company email invites diagnostic booking and does not deliver the report.
Any later report-delivery work needs a reviewed template or secure report link,
recipient authorization, an idempotent delivery receipt, suppression handling,
same-event resume and actual inbox acceptance. Keep report delivery distinct from
booking recovery without excluding eligible unbooked visitors from recovery.
Dedicated foundation nurture execution also remains a separately flagged gap.
