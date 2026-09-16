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
