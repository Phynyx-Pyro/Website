# Website assessment and recovery integration contract

## Scope and release boundary

Appointment booking remains the conversion. A fresh assessment/report is an
intermediate step. Eligible completed unbooked visitors remain recovery
candidates; foundation qualification and nurture routing do not change.

This company release implements **capture and fresh reports**, with CRM dispatch
and external tracking disabled by default. It does not implement ownership
verification, email sending, cross-device report recovery, live enrollment,
workflow editing, or Smart List creation. A pending response is not a delivery
receipt. Do not enable the retained legacy adapter merely by setting its flag;
the production dispatcher and workflow integration below still need acceptance.

The company Site owner owns source, tests, saved versions and deployments. The
coordinating manager owns GHL browser workflow configuration, Smart Lists and the
customer journey workbook. Field/tag configuration must follow this mapping and
be coordinated before creation. No tags were assigned or backfilled by this
release. No workflow settings were changed by the source owner.

## Events versus current state

| Concept | Contract |
| --- | --- |
| Submission event | Opaque submission UUID plus stage (`quick-capture` or `completed`); not an identity credential. Existing `contact.website_submission_id` is a CRM metadata field, not a complete event ledger or reliable dispatch signal. Publish only after authorization and required metadata are complete. |
| Retry | Same event ID and same canonical payload; return the same result without another enrollment. Changed payload under the same ID returns 409. |
| Intentional new assessment | Fresh event ID; preserve all prior submitted evidence. A page reload, timeout or double click is not a new sales intent. |
| Start versus completion | Quick capture and full completion are distinct saved events (`submission_type`). Completion replaces incomplete recovery eligibility, not assessment history. |
| Stable journey | Existing `sales:assessment-incomplete`, `sales:booking-followup`, `sales:nurture`, `appt:booked`, and fit tags. These describe state and eligibility, not an enrollment pulse. |
| Channel state | Actual GHL Workflow (active) membership; channels may run in parallel. No new active-channel tags. |
| Verification pending | An unlinked submission in the company database, never a tag written to an unverified matched contact. |

No new CRM custom field is needed for this proposed minimal mapping. Existing
tags suffice for incomplete/complete/booked/foundation and operator pause. Do not
remove/re-add journey tags solely to manufacture a trigger. The workflow owner
must connect the fresh submission event to the correct recovery path and permit
legitimate re-entry. Re-entry enabled alone does not make adding an already-present
tag a fresh event.

**Current quick-capture limitation:** quick capture returns without writing
Website Submission ID (`contact.website_submission_id`). A final-assessment ID
alone therefore cannot restart legitimate repeated incomplete recovery. The
capture-only checkpoint sends neither stage to CRM. At activation, use a durable
stage-qualified receipt `(submission ID, quick-capture/completed, channel)`,
scoped to the authorized location/contact, and an acknowledged dispatch/event
signal for each eligible stage. Do not churn durable journey/status tags to
generate events. The signal's transport and workflow integration still require
implementation and acceptance; this is activation design, not an implemented
dispatcher. Retries reuse the same stage receipt; a fresh intentional submission
creates a new one, subject to active-run, qualification and suppression checks.

**Execution evidence:** use Workflow (active) membership. Stop on response and
external removal can bypass tail cleanup, so active tags can become stranded.
Workflow (finished) is not proof of appointment conversion or message delivery.

## Transitions and ownership

| Event/condition | Journey and recovery effects |
| --- | --- |
| Start, identity unverified | Save incomplete attempt in Site; verification pending; no matched-contact updates/enrollment. |
| Start, authorized and eligible | Incomplete recovery candidate; preserve any established booked/closed/progressed state. A partial capture must not erase a completed assessment. |
| Complete, identity unverified | Save report and answers; show only this submission's report; hold contact linking/recovery. |
| Complete, authorized, qualified, unbooked | Remove incomplete eligibility; set booking-followup eligibility; consume this new event once after suppression checks. |
| Complete, foundation | Preserve fit:nurture / sales:nurture routing after authorization; no booking recovery. Missing dedicated nurture implementation is a separate dependency. |
| Already booked | Preserve appointment and owner; do not restart acquisition recovery. Do not create a second opportunity. |
| Won/Lost or progressed sales record | Do not reset stage/status, reopen a deal or start acquisition recovery automatically. Retain the new assessment; request an explicit sales decision where appropriate. |
| Reply / pause / stop bot / human handover | Exit affected recovery runs; retain consent evidence and the submission. No retry clears suppression. |
| Booking | Booking is authoritative; remove incomplete/booking-recovery eligibility; exit actual recovery membership and cancel queued recovery before further sends. |
| Cancel / no-show | Existing approved reschedule logic owns the transition. A submission alone never synthesizes a cancellation/no-show. |

Keep one valid owner and one open website opportunity. Do not reset DND, operator
pause or existing consent to start a new attempt. Record each attempt's consent
snapshot separately; any future contact consent update must be authorized and
follow the approved per-channel policy. Requested report delivery, booking
recovery and marketing enrollment are separate purposes and must not be conflated.

## Retry and concurrency contract before live dispatch

The current capture path uses a database primary key on the event ID plus a
canonical payload hash and server-session binding. Parallel retries save one
row; intentional new events retain separate rows. It performs no GHL or sender
calls, so cannot create parallel enrollment, contacts or opportunities.

The **future live dispatcher** must additionally provide:

1. Durable receipt keyed by location, authorized contact, submission ID, stage
   (`quick-capture` or `completed`) and channel, with an acknowledged dispatch/event
   signal independent of durable status tags.
2. One atomic active-run claim per location/contact/channel, independent of
   browser/session. Different channels may run concurrently.
3. Authorization and booking/closed-stage/DND/operator suppression checks before
   claiming, immediately before enrollment, and before sends in GHL.
4. An explicit policy for a new event while the same channel is active: retain
   the fresh assessment, update current context safely, and do not launch a
   duplicate or blindly restart the sequence.
5. Acknowledged exit before releasing/replacing an active run. A timeout with an
   unknown upstream outcome goes to reconciliation, never blind retry. Database
   idempotency cannot alone guarantee exactly-once behavior in an external API.
6. A per-contact synchronization claim around opportunity lookup/create and
   metadata/event publication, with reconciliation for uncertain CRM outcomes.

These live claims/receipts are not implemented in this capture-only checkpoint.
The retained legacy processing lease is per submission, not a cross-submission
enrollment lock. Do not represent it as satisfying this contract.

## Smart List mapping

Contact lists must be restricted to the website source/automation markers and
must distinguish eligibility from actual channel activity.

| List | Membership concept |
| --- | --- |
| Incomplete, eligible recovery | `sales:assessment-incomplete`, not booked, no relevant suppression/closed/progressed exclusion. |
| Complete, awaiting booking | `sales:booking-followup` + qualified fit, not booked; eligible channels depend on consent and DND. |
| Booked | `appt:booked`; no active recovery membership. |
| Foundation/nurture | `fit:nurture` / `sales:nurture`; exclude from booking recovery. |
| Paused/needs human action | Relevant `automation:pause`, `stop bot`, `human handover`, or downstream sales exclusion; no active recovery for blocked channels. |
| Email / SMS / voice active | Actual Workflow (active) membership. Lists may overlap by channel. |
| Verification pending | **Separate Site submission queue**, not a GHL contact list. Do not attach an unverified submission to a contact to make this list possible. |

The Site queue is available through owner-authorized database inspection, not a
new public/admin endpoint. Filter `recovery_state = 'verification_pending'` and
`journey_state` = `incomplete`, `assessment_complete_unbooked` or `foundation`.
`submission_snapshot` preserves submitted details, raw/normalized phone,
attribution, answers, fit and consent. The primary key is the event ID. Historical
rows get NULL new columns; no historical record is tagged, enrolled or migrated
into a new journey automatically.

## Verification and report boundary

Current reports are calculated exclusively from newly submitted answers. A valid
two-hour intake session permits saving/replaying that same submission, not access
to an existing CRM identity. Copying an event ID/payload to another session fails.
A fresh browser may start a new assessment. Print/save the current report before
leaving; durable cross-device resume awaits ownership verification.

Existing-contact grants, exact session/location/contact/identity checks and the
protected booking handoff remain intact. No new grant is made from knowing an
email or phone. Identity conflicts do not overwrite established details or expose
previous reports. Verification-pending rows are never auto-exported even if a
configuration switch changes later.

Self-service verification remains blocked on an authorized HTTP-based sender and
reviewed integration. Hosted Sites do not support raw TCP sockets; LC SMTP alone
is not a supported direct transport here. Do not add a relay/provider or cost
without approval. The existing Magic Link Email Sender is unsafe to reuse
unchanged: its webhook path creates/updates a contact before sending the link.
Effective sender, token generation/validation and enforced expiry/replay behavior
remain unverified. No message is sent or promised in this release.

## Coordinated operational update — September 15, 2026

The following is coordinator-provided browser evidence, separate from the
September 14 observed inventory and older planned workflow specification:

- **Five workflows changed:** Allow re-entry saved ON in 002a, 002b, 002c, 002d
  and 002e Reply Stops Pending Voice. Multiple opportunities remains OFF and
  Stop on response ON in each. 001 intake already had re-entry ON and remains
  unchanged. 002c/d retain Contact timezone,
  Monday–Friday 9am–5pm. Re-entry does not solve already-present-tag event delivery
  or cross-submission concurrency by itself.
- **Five views visibly saved:** exact filters are recorded below. Journey views
  do not prove channel eligibility; suppression and qualification still apply
  before execution. No contact tags, enrollments or CRM records were changed;
  no historical backfill or live test outreach was performed.
- **Read-only Magic Link inspection:** published inbound webhook, no displayed
  trigger filters; checks `magic_link` and `email`, then Create/Update Contact
  maps email and first name from the request before Send Magic Link Email. From
  name/email are blank (inherited defaults unverified). Subject is “Your PYRO
  sign-in link.” Body targets PYRO AI Agent Operations Center using the supplied
  link and says 15 minutes; that text does not establish cryptographic expiry.
  Click tracking and UTM are OFF. No webhook URL was copied or invoked.

| Saved contact view | Observed filter |
| --- | --- |
| Website — Active recovery | Workflow (active) membership in 002a OR 002b OR 002c OR 002d OR 004b OR 004c; observed zero contacts. |
| Website — Assessment incomplete | Tag IS `sales:assessment-incomplete`. |
| Website — Awaiting booking | Tag IS `sales:booking-followup`. |
| Website — Appointment booked | Tag IS `appt:booked` AND Tag IS `source:phynyx-website`. |
| Website — Foundation nurture | Tag IS `sales:nurture`. |

These updates do not establish full live parity. Sender readiness, repeat-event
delivery, suppression at every send, recovery destinations, booking capture and
duplicate effects still require review. No active-state tags are needed.

Future verification must use an expiring, single-use hashed capability bound to
the submission/email, with rate limits and an explicit confirmation action that
email scanners cannot trigger automatically. Email control does not establish
ownership of a changed phone, resolve shared-number collisions or authorize
merging multiple contacts. Reports may remain available while such linking is held.

## Deployment and activation checklist

- Company environment: explicit company `SITE_URL`; CRM dispatch and external
  tracking flags remain false/unset. No secret or access-policy changes.
- Source owner: run migration-backed isolated tests, lint, type check, build and
  sanitized diff/secret review. Save exact company commit/version and deploy with
  the existing workspace audience. Record deployment results separately.
- Public GitHub receives source, schema-only migrations, tests and sanitized
  design/handoff. Never include private audits, agency-location inventory,
  customer rows, credentials, signed URLs or local runtime files. Preserve the
  personal hosting manifest on the shared main branch; company source keeps its
  own manifest. A dedicated company branch can preserve the exact company source.
- Workflow owner: finish approved event handling and suppression, verify actual
  membership exits and Smart Lists; resolve sender dependencies and all
  company recovery destinations. No historical enrollment/backfill.
- Keep public sharing, sender activation and live test effects separate until
  their required action-time authorization. Do not change DNS, personal Site,
  calendar policy, unrelated workflows, or add paid services.
- Do not enable CRM dispatch until the future live dispatcher safeguards,
  verification, workflow contract and test isolation are implemented and reviewed.
  Workspace-only visibility does not itself isolate shared GHL automation.
