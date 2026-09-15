# Company website assessment and recovery contract

## Release boundary

Appointment booking is the conversion. A fresh assessment/report is an
intermediate step; eligible unbooked visitors remain in booking recovery.
Foundation qualification and nurture routing remain unchanged. No new pipeline
stage, public identity bypass, paid service or personal-site deployment is added.

The company source implements immutable assessment/report capture, bounded CRM
receipts, single-use email verification and an API recovery dispatcher. Runtime
activation remains separately gated pending the browser configuration below.
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

**Proposed activation contract, not a claim these UI changes are saved.** The
coordinator found no negative source-tag operator on Contact Tag triggers. Do not
assume source-tag exclusions exist. The UI does offer Website Form Version text
`Exact match phrase`; the dispatcher is prepared for this positive discriminator:

1. On **every Contact Tag trigger in 002a, 002b, 002c and 002d**, preserve existing
   trigger conditions and ADD `Website Form Version — Exact match phrase — v1`
   using AND semantics. The personal adapter in this repository writes `v1`.
   Review legacy blank/non-v1 records before accepting this filter: those records
   would not enter through these tag triggers. Do not backfill them automatically.
2. Company dispatch separately writes `company-v2` before adding the company
   origin marker, creating any opportunity, changing journey tags or publishing
   Submission ID. It then uses explicit workflow API enrollment. No automatic
   tag entry plus API enrollment for the same company event is intended.
3. Keep **001 Submission ID changed** as the internal-notification event, with
   its existing markers/pause checks. Do not also API-enroll 001. September 14
   observed only internal FYIs, no assignment/callback task. Reconfirm that its
   current graph does not reset opportunity/owner or enroll recovery siblings.
4. For company-v2 contacts, 002a/b must not independently enroll 002c/d or start
   competing SMS/voice execution through Conversation AI activation. Retain the
   normal email actions. Review a company-only branch using the same positive
   version condition; preserve the personal branch. 002d owns SMS conversation
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

The coordinator observed a v5 website-requested verification email in the
intended GHL conversation. The matching D1 verification row has `sent` and a GHL
message ID. At inspection, it was unclaimed. This establishes website-runtime
message creation; inbox delivery, token confirmation and recovery execution are
separate evidence, not inferred. No personal identifiers or message IDs are
published in this repository.

## Activation and handoff

- Keep dispatch/tracking disabled until the coordinator confirms the exact
  supported trigger discriminator, company-only AI/channel branches, destinations
  and guards. Verification remains independently testable.
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
