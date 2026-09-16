# Company website assessment and recovery contract

## Release boundary

Appointment booking is the conversion. A fresh assessment/report is an
intermediate step; eligible unbooked visitors remain in booking recovery.
Foundation qualification and nurture routing remain unchanged. No new pipeline
stage, public identity bypass, paid service or personal-site deployment is added.

The company source implements immutable assessment/report capture, bounded CRM
receipts, single-use email verification and an API recovery dispatcher. The coordinator confirmed the browser configuration below as saved/published
on September 15 at approximately 18:27 CDT and authorized bounded acceptance
activation. Runtime environment revision 11 enables this configured recipient
only; successful deployment is recorded in the release commit provenance.
This is not full live parity. General public CRM capture, calendar acceptance,
report-email delivery and dedicated foundation nurture implementation are not
certified by this checkpoint.

The source owner owns company source/tests/Sites/GitHub review branch. The
coordinator owns workflow UI changes and the journey workbook. GitHub main,
get.phynyxpro.com, DNS, personal Site and sharing remain unchanged.

## Events, identity and durable state

- A fresh intentional submission has a UUID and stage (`quick-capture` or
  `completed`). D1 receipts are keyed by location + UUID + stage + channel.
  Website Submission ID is metadata/event publication, not an ownership token.
- Identical retries reuse the receipt; changed content under the same ID fails.
  Different sessions cannot read/replay someone else's saved submission.
- Fresh reports use only newly submitted answers and survive CRM/automation
  failure. Every raw/normalized contact detail, answer, fit and consent snapshot
  remains in its immutable submission. No historical pending rows auto-export.
- Existing-contact linking requires a genuine browser ownership grant, exact
  location/email/normalized-phone agreement and unambiguous matching. Partial,
  conflicting or duplicate matches never merge/update identities or reveal CRM
  data. The configured acceptance recipient boundary is not proof of ownership.
- Verification uses authenticated GHL conversation email to the stored contact,
  with no recipient override. Tokens are hashed, single-use, expire after 15
  minutes, and require explicit POST confirmation. A link grants only the
  confirming browser. A different browser can verify then start a fresh attempt.
  The old Magic Link workflow is not used because it creates/updates a contact
  before sending. An API message ID is not proof of inbox delivery.
- Stable journey tags describe current attempt state: incomplete, awaiting
  booking, foundation/nurture, booked. They are never toggled as event pulses.
  No active-recovery tags are used; actual workflow membership describes execution.

## Recovery transport and required browser configuration

**Saved/published configuration, coordinator-confirmed September 15, 18:27 CDT.** The
coordinator found no negative source-tag operator on Contact Tag triggers. Do not
assume source-tag exclusions exist. The UI does offer Website Form Version text
`Exact match phrase`; the dispatcher is prepared for this positive discriminator:

1. On **every Contact Tag trigger in 002a, 002b, 002c and 002d**, preserve existing
   trigger conditions and ADD `Website Form Version — Exact match phrase — v1`
   using AND semantics. The personal adapter in this repository writes `v1`.
   The coordinator confirmed the original main adapter writes `v1` and accepted
   this deliberate limitation: manual tag events on legacy blank/non-v1 records
   no longer auto-enroll through these triggers. Do not backfill them automatically.
   All four are confirmed saved/published; each has exactly ONE Contact Tag trigger.
2. Company dispatch separately writes `company-v2` before adding the company
   origin marker, creating any opportunity, changing journey tags or publishing
   Submission ID. It then uses explicit workflow API enrollment. No automatic
   tag entry plus API enrollment for the same company event is intended.
3. Keep **001 Submission ID changed** as the internal-notification event, with
   its existing markers/pause checks. Do not also API-enroll 001. September 14
   observed only internal FYIs, no assignment/callback task. The coordinator
   reconfirmed the LIVE graph: safety gate, FYI to Andrew, FYI to Craig, END.
   No opportunity/owner update or sibling enrollment. It remains unchanged.
4. For company-v2 contacts, 002a/b must not independently enroll 002c/d or start
   competing SMS/voice execution through Conversation AI activation. Retain the
   normal email actions. The saved company-only branches use Website Form
   Version Is company-v2, and preserve each original personal branch. 002d owns SMS conversation
   activation, 002c owns voice. Do not silently remove recovery functionality.
5. Keep 002e reply stops pending voice and booking/showed/pause cleanup. Recheck
   suppression, booked/closed state and required consent immediately before each
   message/AI action, including after waits. Preserve Stop on response and time
   windows. No global workflow disable or unrelated workflow change.
6. In 002a, company-v2 recovery must link to the company assessment URL, not the
   personal site. In 002b, the observed direct shared calendar link must remain
   distinct from authenticated/prefilled Site access. Calendar duplicate/contact
   effects and downstream confirmations require acceptance; no policy change.

| Dispatcher channel | Existing workflow ID | Entry |
| --- | --- | --- |
| Incomplete email | `7780711c-043e-40a6-8d49-92210c96fcd9` (002a) | New authorized incomplete event, email allowed |
| Completed email | `2bf5b127-8c2d-4200-973c-aec295397aaa` (002b) | Qualified completed/unbooked event, email allowed |
| SMS | `7fa97577-9208-45bd-823f-3eed0e25ac09` (002d) | Completed/qualified, affirmative current SMS-marketing consent AND existing consent tag, SMS DND off |
| Voice | `45d9da71-533d-43d7-9dce-07232fc5ad3b` (002c) | Completed/qualified, affirmative current AI-voice consent AND existing consent tag, Call DND off |

Existing field: `contact.website_form_version`; values `v1` (personal adapter)
and `company-v2` (company acceptance adapter). One new origin tag definition,
`source:phynyx-company`, was created; it is not an authentication or active-state
tag and has not been backfilled. No new custom fields are required.

A suggested hybrid (first absent-tag addition uses automatic enrollment, repeats
use API) is not implemented: it lacks an authoritative initial enrollment receipt,
and different tag/consent triggers could make channel selection ambiguous. Do not
activate that transport merely because adding a tag returned success.

## Confirmed company-only branch edits

The following node labels and topology were visually verified and confirmed
saved/published by the coordinator. The MCP does not expose internal graph node
IDs. Both company Yes branches terminate without rejoining the original path.

| Workflow | Position and new condition | Company-v2 / Yes path | No path |
| --- | --- | --- | --- |
| 002a (`7780711c-043e-40a6-8d49-92210c96fcd9`) | After the 15-minute wait and successful existing eligibility gate, before Conversation AI activation: **Company assessment recovery?**; Website Form Version equals `company-v2` | Saved **Company - Ember - Finish Your Fit Check** email copy; visible text and href point to `https://phynyxpro-company-private.phynyx-6195.chatgpt.site/growth-assessment`, then end. Do not rejoin before AI activation. | Preserve the existing AI then email path, including its personal-site link. |
| 002b (`2bf5b127-8c2d-4200-973c-aec295397aaa`) | At the equivalent point: **Company booking recovery?**; Website Form Version equals `company-v2` | Saved **Company - Ember - Book Your Diagnostic** email copy, then END; original shared-calendar URL retained. AI activation is bypassed. | Preserve AI then the existing email. |

Reason: company email recovery must not activate other channels outside the
separate consent/DND-checked dispatcher entries. AI activation by itself is not
proof of a duplicate send. No extra company branch is required in 002c or 002d
because the coordinator confirmed neither graph has cross-workflow actions;
each contains its own AI activation and channel action. Preserve 002c/d delays, time windows,
channel consent and DND checks. Keep 002e reply-stop and booking exits intact.

For this acceptance test, 001 is confirmed to remain internal FYIs without
owner/stage resets or sibling recovery enrollment. It stays Submission-ID-triggered and is
never also explicitly API-enrolled.

If verification expires while the form is prepared, do not bypass expiration or
independently resend. After activation, the coordinator may submit the prepared
full assessment once: it saves the report and holds CRM linking. That new full
event can request its own link. Confirm in the same browser, then return to the
final step and retry the same saved handoff. Cross-device confirmation grants
only that device; it does not authorize the original browser automatically.

## Retry, concurrency and external acknowledgments

The CRM adapter holds durable, non-expiring identity/contact locks throughout
metadata publication and recovery handoff. A fresh intentional event explicitly
replaces pending acquisition follow-up: it first removes this contact from 002a–d
and requires success acknowledgments for **all four** before any new enrollment.
It never removes booking/no-show/cancellation workflows or deletes a contact.
A fresh event is allowed to restart pending acquisition follow-up; a retry is not.

Each external removal/enrollment has a durable `exit_requested` or
`enrollment_requested` receipt before the HTTP request, then an acknowledgment
receipt only when the GHL response explicitly reports success. Both documented
`succeeded` and `succeded` spellings are accepted. Lost, false or malformed
acknowledgments retain the enclosing contact lock and require reconciliation;
no timeout-based takeover or blind retry. A newer event cannot bypass that hold.
After all acknowledged work, release the local lock. This protects submissions
through this adapter; UI/other systems still require workflow guards.

Workflow API acknowledgment is not authoritative evidence of current membership,
queued-action cancellation, a send, delivery or conversion. Verify these in GHL
execution history and the recipient channel. The connector exposes inventory and
add/remove operations, not full graphs/settings or an active-membership read.
Stop on response/external removal can bypass tail actions, so no tail-cleanup tag
is used as execution truth. Finished membership is not a booking/delivery receipt.

## Journey and protected sales transitions

| Condition | Behavior |
| --- | --- |
| Unverified start/completion | Save attempt/report; keep verification pending; no existing-contact writes or recovery |
| Authorized new partial attempt | Current journey becomes incomplete; preserve last completed qualification fields and all prior submitted history; email recovery only |
| Authorized qualified completion | Remove incomplete/nurture journey tags, set qualified/awaiting-booking; dispatch eligible channels after guards |
| Foundation completion | Preserve foundation rules, set nurture state, acknowledge cancellation of pending acquisition recovery, no booking-recovery enrollment |
| Approved returning open nurture opportunity | Requalify the fresh assessment and start appropriate recovery while leaving the SAME opportunity's Nurture / Recycle stage, open status, value, owner and history unchanged |
| Other progressed or Won/Lost opportunity, multiple opportunities, booked/upcoming appointment | Hold acquisition changes; never reopen/reset or create a substitute opportunity |
| Pause, stop bot, human handover, global DND | Hold dispatch; do not clear suppression |
| Per-channel DND or missing required consent | Skip that channel; preserve stored consent and the new submission's distinct snapshot |
| Booking/reply | Existing workflow exits own the transition; no retry re-enrolls the same event |

The returning-nurture exception is explicitly approved for the bounded live test
and requires its named stage plus `WEBSITE_RETURNING_NURTURE_APPROVED=true`.
The opportunity never moves automatically as part of requalification. This can
show qualified current journey tags alongside an unchanged nurture pipeline
stage; that difference is intentional, pending any separate sales-stage decision.

Requested recovery, report delivery and marketing enrollment are separate
purposes. Existing 002d uses marketing-SMS consent; service-SMS consent alone does
not qualify it. No current checkbox silently clears old consent or DND; the
adapter does not add marketing/voice consent tags. Dedicated foundation nurture
execution remains an explicitly missing implementation, not a new funnel design.

## Observed operations and evidence

Keep the September 14 inventory in `GHL_WEBSITE_LEAD_SYSTEM.md` separate from the
older September 4 specification and the following coordinator-provided September
15 browser observations:

- Re-entry was saved ON for **002a–e**; 001 already had it ON. Multiple opportunities
  remains OFF and Stop on response ON. 002c/d retain Contact timezone, Mon–Fri
  9am–5pm. 002a/b retain Account timezone and no specific time window.
- Five saved views exist; no historical tag backfill was performed:

| View | Saved filter |
| --- | --- |
| Website — Active recovery | Active membership in 002a OR 002b OR 002c OR 002d OR 004b OR 004c |
| Website — Assessment incomplete | Tag IS `sales:assessment-incomplete` |
| Website — Awaiting booking | Tag IS `sales:booking-followup` |
| Website — Appointment booked | Tag IS `appt:booked` AND Tag IS `source:phynyx-website` |
| Website — Foundation nurture | Tag IS `sales:nurture` |

Verification pending remains a separate Site submission queue, never a tag
attached to an unverified matched identity. Channels may overlap in actual
membership. No new active-channel tags or workbook were authored here.

The coordinator verified that the v5 website-requested verification email arrived
in the authorized recipient's Gmail inbox at 17:48 CDT on September 15. The
subject was “Verify your PhynyxPro assessment”; the link used the configured CRM
email-tracking domain. GHL conversation evidence and the matching D1 `sent` row
corroborate runtime message creation. Inbox delivery is verified by the
coordinator; token confirmation and normal recovery delivery remain unverified.
The original token subsequently expired unclaimed. No browser security approval
was bypassed and no resend was independently initiated. No recipient identities,
message IDs, verification tokens or tracking URLs are published here.

## Activation and handoff

- The confirmed browser configuration releases the bounded acceptance gate.
  Environment revision **11** sets `WEBSITE_ACCEPTANCE_WORKFLOWS_APPROVED`,
  `WEBSITE_CRM_DISPATCH_ENABLED` and `WEBSITE_RECOVERY_DISPATCH_ENABLED` to `true`.
  `WEBSITE_CRM_MODE=acceptance` and the existing private recipient/contact boundary
  remain unchanged. Verification and the approved open-nurture exception remain
  enabled. `WEBSITE_EXTERNAL_TRACKING_ENABLED=false`. No secret/access/DNS changes.
- Enabling flags is not a live test result and never grants ownership. The
  coordinator owns the next single browser submission and fresh verification
  request. Email-tracking-domain browser approval still awaits the user; do not
  bypass it. No automatic resend or historical replay is performed.
- Required runtime API access includes contacts read/write, workflows readonly,
  configured location fields/pipeline/opportunity/appointment reads, opportunity
  write only for authorized creation, and conversations/message.write for email.
  A working MCP connection does not prove these website-private-token scopes.
- Acceptance mode remains restricted to the privately configured recipient and
  valid grant. No independent form submissions or message retries by the source
  owner. The coordinator submits the prepared full form after readiness.
- Record website POST, D1 CRM/channel receipts, independent GHL contact/opportunity
  readback, workflow history and real delivery separately. Local mocks are not
  deployed tests. General public/new-contact activation and booking remain separate.
- Save/deploy exact tested source with unchanged audience; mirror the complete
  tree to the company GitHub branch. Never publish secrets, recipient identities,
  private audit/agency inventories or customer data. Keep main unchanged.

## Release provenance

This activation changes operational documentation and runtime flags only. The
application logic is unchanged from tested Sites source
`f54ae92d61c6459b47a7f5b4f308213a3986130d` (v6): 105 isolated tests passed, with
lint/type checking and build passing. Those tests mock upstream GHL; they do not
prove live CRM writes or recovery delivery. The final activation source SHA,
Sites saved version, deployment ID/result, environment revision and matching tree
are recorded in the GitHub activation commit message and implementation handoff.
The public review branch is `company/assessment-capture-checkpoint`; main remains
unchanged. Recipient identifiers and runtime secrets are excluded from source.

## September 16: expired intake-session recovery

The first full-event verification request failed before GHL because the original
two-hour intake session had expired. The saved full assessment and its session
binding were present. The client report branch selects the full submission ID;
request bodies were not logged, so the exact failed body was not independently
inspected. No new verification row or email resulted from that failed request.

The bounded fix permits challenge initiation for an existing saved event after
its original session expires, including when the browser no longer sends the
expired cookie. This does not authorize access or linking: only the validated
stored matching email can receive the challenge; the configured acceptance
boundary, rate limits, exact-match checks, email DND, single-use token, 15-minute
token expiry and one-send-per-event limit remain. The request returns no saved
answers or CRM information and accepts no recipient override. While the original
session is active, a different browser still cannot initiate its request.

Upon genuine email confirmation, token consumption and the browser's contact
grant are committed with a conditional same-event rebind in one D1 transaction.
Rebinding requires the original session to be expired/absent, an unlinked
`dispatch-held` assessment and a matching CRM receipt held specifically for
`verification_required`, with null contact/opportunity IDs. The verification row
retains the original session hash as audit evidence; the submitted answers,
report, payload hash, consent evidence and event ID stay unchanged. Reconciliation
receipts and historical pending rows are not rebound or auto-exported.

The coordinator can keep the existing report open, click Send verification email
again after deployment, confirm the new link in the same browser, then retry the
identical saved handoff. No new assessment or independent send is needed. Browser
approval to follow the tracking domain was supplied; no tool bypass is used.

The transaction uses documented [D1 batch semantics](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch):
if a statement fails, the sequence rolls back. Isolated tests cover expired/no
cookie resume, duplicate request suppression, competing confirmations, wrong
browser/recipient protection, grant-write rollback, and preserved uncertain or
historical rows. These are mocked-upstream tests, not a live verification send.

## September 16: verified handoff and pinned API correction

The coordinator observed actual inbox receipt and successful explicit confirmation
of the full-event link. Read-only D1 evidence confirms a claimed token, matching
contact grant and same-event browser rebind. The subsequent deployed assessment
POST returned HTTP 200 and preserved the report, but its CRM receipt was held for
`upstream_422`, with no opportunity receipt, channel attempts or retained locks.
The adapter records `held` only before its first mutation; any failure after a
write begins is `reconcile`. This attempt did not enroll recovery workflows.

The opportunity search used v3 camelCase filters with the pinned `2021-07-28`
header. The [version-specific API contract](https://marketplace.gohighlevel.com/docs/2021-07-28/ghl/opportunities/search-opportunity/index.html)
requires `location_id`, `pipeline_id` and `contact_id`. Both the initial search
and protective re-reads now share those parameters. The old runtime error did
not retain an operation label, so the exact rejecting endpoint is inferred from
the receipt checkpoint and this confirmed request defect, not an upstream body.
Future search failures record only a fixed operation label and HTTP status.

An explicit same-event retry can reclaim this pre-write 422 only with a current
grant for the configured acceptance contact, no opportunity ID, no channel attempt
and no retained lock. An atomic state claim and normal identity/contact locks
serialize retries. All live protection reads run again. Processing, applied and
uncertain-write receipts remain excluded; no background replay or historical
export is introduced. No new email or duplicate assessment is required while
the verified intake session remains valid.

Regression tests enforce the pinned query contract across initial/protective
reads, parallel retry idempotency, missing-proof/lock/channel refusal and permanent
reconciliation after a write starts. These use mocked GHL responses. Corrected
runtime CRM writes, workflow enrollment and downstream delivery await the
coordinator's next deliberate retry; they are not yet acceptance results.

## September 16: v9 deployed returning-contact acceptance

The coordinator retried the same verified full assessment once. At 00:35:09 UTC,
the deployed website POST returned HTTP 200 with outcome `ok`. Read-only D1
correlation shows CRM `applied`, recovery `enrollment_acknowledged`, and journey
`assessment_complete_unbooked`. The receipt references the existing contact and
existing opportunity. Four 002a–d exits and email 002b, SMS 002d and voice 002c
enrollments were individually acknowledged. No retained dispatch locks or booking
grants exist. Recent error-only runtime logs were empty. This is actual website
runtime private-token execution, independently checked through MCP reads.

Independent GHL readback confirms the current submission field, `company-v2`,
company conversion URL, `source:phynyx-company`, `sales:booking-followup` and
`fit:qualified`. Old nurture journey/fit tags were replaced for the approved
requalification. Exactly one opportunity remains: the original open Nurture /
Recycle opportunity, with owner, value, stage and prior update timestamp unchanged.
Contact ownership and DND remain unchanged; established channel consent tags were
preserved. No duplicate assessment/contact/opportunity was needed.

This proves runtime CRM update and enrollment acknowledgment, not actual workflow
membership, internal FYI execution, message delivery, AI behavior or appointment
conversion. The available read-only MCP workflow operation provides inventory,
not contact execution history. The coordinator should inspect this test contact's
002b/c/d execution history, waits/eligibility, actual conversation actions and
destination-specific delivery; check 001's Submission ID trigger separately.
No further assessment POST or verification send is required.

The report still used calendar unavailability to display generic verification
and follow-up-pending copy, even after a successful handoff. The bounded next
checkpoint preserves the actual response's CRM/recovery state in the client and
distinguishes accepted follow-up from unavailable scheduling. It does not infer
message delivery, enable booking, change flags or dispatch anything on refresh.
The already-open report keeps its loaded copy; do not resubmit merely to update
its wording. Inline scheduling and report-email delivery remain unimplemented
in this response path, separately from the normal booking-recovery workflows.
