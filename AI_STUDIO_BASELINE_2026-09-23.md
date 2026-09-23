# PhynyxPro AI Studio and HighLevel workflow baseline

Snapshot date: 2026-09-23 (America/Chicago)

This document freezes the known integration state before the next round of AI
Studio and HighLevel workflow changes. It is an evidence map, not deployment
approval and not a claim that untested delivery paths work.

## Snapshot purpose

The target product is the unpublished HighLevel AI Studio project **PhynyxPro
Website**. The existing HighLevel website-sales workflows provide the operating
logic to preserve and improve. The personal and company Sites implementations
are reference implementations; neither should be confused with the AI Studio
deployment.

No website publication, production-domain cutover, workflow activation, lead
submission, appointment creation, or customer message is authorized by this
snapshot.

## Source surfaces

| Surface | Identity | Baseline state |
| --- | --- | --- |
| Personal Sites website | `get.phynyxpro.com`; Sites project `appgprj_6a98953f31448191b1f793f173675609` | Established Worker-to-HighLevel implementation lineage. GitHub `main` is at `36608c1d22c793c8babdecd3dfd1970107e94be3`. Keep unchanged while AI Studio is accepted. |
| Company/workspace Sites website | Company Sites project `appgprj_6aa91bf7b7f88191923f9883a6a3d559`; public review branch `company/assessment-capture-checkpoint` | Newer bounded assessment capture, verification, CRM receipts, recovery dispatch and returning-nurture preservation. This snapshot branch starts at `6e479c00c58001da2dc8ca7ee8b41acb22da4861`. |
| HighLevel AI Studio | Project `1789733833642057228`; location `DsRnzA2tcoiwklSgjBtR` | Draft and unpublished. Visual/copy work exists, but assessment and support server submission remain unaccepted. Direct schedule requires independent appointment acceptance. |
| Signed bridge preparation | GitHub PR #8, branch `codex/ai-studio-worker-bridge`, head `c4b801cec174bda514db762573a2d78a4dc61d21` | Draft, open and blocked. Adds a signed Worker receiver for intake, assessment, booking-session claim and support. Not merged or deployed. |

The Phynyx GitHub organization currently exposes `Phynyx-Pyro/Website` and the
unrelated `Phynyx-Pyro/client-dashboard`. No second GitHub website repository was
found. The company Sites source repository is a separate hosting repository;
the company checkpoint branch is its GitHub review mirror.

## CRM and workflow contract

- HighLevel location: `DsRnzA2tcoiwklSgjBtR`
- Pipeline: `Phynyx — Website Sales` (`usVVpz3ldoUD9OQQOv09`)
- Initial stage: `ac4d559d-7669-47ab-ae9b-832b7d29225b`
- Calendar: `Phynyx Website - Assessment` (`NX2pJFAx51yOcaNIdNjL`)
- Published intake workflow: `001 - Website Intake & Routing`
  (`36118464-ea4a-4a5b-b5ab-a2cd614c2063`)
- Workflow folder URL:
  `https://app.phynyxpro.com/v2/location/DsRnzA2tcoiwklSgjBtR/automation/workflows?folder=67747b69-42ac-4e30-b832-d6855eb529d8&tab=list`

The numbered published workflow set recorded before this snapshot is:

1. `001 - Website Intake & Routing`
2. `002a - Incomplete Assessment Recovery`
3. `002b - Assessment Complete & Booking Recovery`
4. `002c - Consented Voice Outreach`
5. `002d - Consented SMS Conversation`
6. `002e - Reply Stops Pending Voice`
7. `003a - Appointment Booked & Team Notification`
8. `004a - Appointment Showed & Recovery Cleanup`
9. `004b - No-Show Recovery`
10. `004c - Cancellation Recovery`

`001` is location-wide: a change to Website Submission ID can enroll any
contact. The workflow does not establish source by itself. Eligibility depends
on its internal safety gate. The website/backend must commit structured CRM
data and required tags before changing Website Submission ID last.

The shared base tags are:

- `source:phynyx-website`
- `form:growth-assessment`
- `automation:phynyx-web-v1`

The company adapter additionally writes `Website Form Version = company-v2`
before trigger-producing mutations. The reviewed 002a-d workflows use confirmed
positive form-version branches to separate legacy `v1` behavior from company
`company-v2` behavior. Shared tags alone are not sufficient proof of which site
originated a submission.

## Runtime evidence retained from the company checkpoint

For the bounded authorized acceptance contact, the company website produced a
successful verified full-assessment handoff with these observed outcomes:

- CRM dispatch state `applied`.
- Four reviewed acquisition-workflow exits acknowledged before new enrollment.
- `001` entered at 19:35:05 CDT; the Andrew and Craig FYI actions executed and
  the run finished at 19:35:09 CDT.
- `002b` membership observed at 19:35:06 CDT at Wait 15 Minutes.
- `002d` membership observed at 19:35:07 CDT at Wait 15 Minutes.
- `002c` membership observed at 19:35:09 CDT at Wait 60 Minutes.
- The existing open Nurture / Recycle opportunity, owner, value and history were
  preserved.

This proves the bounded company website-to-CRM handoff and observed workflow
membership/execution described above. It does not prove customer email delivery,
SMS delivery, voice execution, appointment conversion, or general-public
activation.

## AI Studio baseline

The AI Studio project remains the destination. Current known state:

- The project is unpublished.
- A substantial 16-route copy/design migration exists, with remaining visual
  and responsive differences documented outside this branch.
- The assessment and support interfaces have not been accepted as connected to
  the company CRM contract.
- The draft same-origin proxy and signed Worker receiver are preparation only.
- The HighLevel inbound-webhook workflow is a contactless unpublished draft; a
  synthetic HTTP 200 proves receipt only.
- Consent wording in the Studio draft must match the versioned backend consent
  evidence before checked consent is dispatched.
- The custom `/schedule` UI is a separate path. It may display calendar
  availability, but booking is not proven until an actual appointment ID is
  returned and the expected appointment workflow executes.
- Direct schedule visitors must not be labeled as assessment-complete or
  qualified merely because they book.

## Booking boundary

The company assessment adapter intentionally returns `bookingReady: false`.
The newer dispatch state is `dispatch-applied`, while the older booking-session
implementation expects `crm-synced`. Inline assessment-to-booking therefore
requires an explicit same-event integration rather than a Boolean change.

Before enabling booking in AI Studio, verify:

1. current contact matching and duplicate-contact policy;
2. exact calendar, slot validity, host assignment and meeting destination;
3. one real provider appointment ID and idempotent retry behavior;
4. native confirmation/invite effects and consent handling;
5. `003a` execution, booked tags, recovery exits and preserved opportunity;
6. that notification wording does not tell direct callers to review an
   assessment they never completed.

## Evidence model for the next phase

Keep these states separate for every test:

1. AI Studio configuration saved;
2. browser submission accepted;
3. backend event and durable receipt stored;
4. HighLevel contact/opportunity write confirmed;
5. workflow enrollment acknowledged;
6. workflow execution observed in history;
7. provider delivery or appointment confirmed;
8. publication explicitly approved and completed.

No earlier state substitutes for a later one.

## Known gaps before public activation

- Current node-by-node live audit of all ten workflows and their re-entry,
  filters, waits, stop conditions and action order.
- AI Studio assessment/server bridge integration using the reviewed company-v2
  contract.
- AI Studio support submission and named staff notification.
- Real downstream recovery email, SMS and voice acceptance with approved test
  recipients and channel consent.
- Direct and post-assessment booking acceptance through `003a`.
- Foundation/nurture execution and report-email policy.
- Calendar host availability, meeting destinations, duplicate behavior and
  native notification effects.
- Isolation from unrelated location-wide triggers and legacy workflows.
- General-public activation decision and rollback record.

## Change rules after this baseline

- Preserve the published numbered workflows while backup clones remain Draft.
- Record every live workflow edit with workflow name, node, before/after state,
  operator, timestamp and test evidence.
- Do not publish AI Studio or a bridge, enable public CRM dispatch, send customer
  messages, or create appointments without the relevant explicit approval.
- Use synthetic or expressly approved test identities and preserve execution
  IDs, CRM IDs and provider evidence without committing private contact data.

