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
- No calls are authorized. Recovery receipts do not prove workflow enrollment
  or delivery. Automatic workflow entry, parallel-channel claims/exit handling,
  and booking acceptance still require the workflow owner's evidence.

## Configuration and live test sequence

`WEBSITE_CRM_DISPATCH_ENABLED` alone cannot activate the old adapter.
`WEBSITE_CRM_MODE=test` additionally requires exact runtime test email/phone and
`WEBSITE_TEST_SUPPRESSION_APPROVED=true`; creates use test marker, pause and DND.
`WEBSITE_CRM_MODE=acceptance` instead requires a configured contact ID and
`WEBSITE_ACCEPTANCE_WORKFLOWS_APPROVED=true`; it never creates a substitute contact
or clears DND. These approval flags must represent completed browser checks, not
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
test recipient explicitly wants that follow-up; leave AI voice unchecked.
No historical pending submission is automatically exported.

Do not call local mocked tests, page GETs or an MCP-created record a website
integration test. Acceptance evidence must tie website POSTs to D1 receipts,
runtime-created/linked contact and opportunity IDs, independent GHL readback and
workflow/message outcomes. See `WEBSITE_RECOVERY_CONTRACT.md` for the state model.
