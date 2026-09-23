# AI Studio integration audit — 2026-09-23

## Outcome

The correct target architecture is a hybrid:

1. `/growth-assessment` and `/support` use the same-origin AI Studio proxy and
   the signed company Worker bridge.
2. `/schedule` remains a distinct direct-booking path, with its own contact,
   calendar, consent, idempotency and appointment-result checks.
3. The published HighLevel website-sales workflows remain the downstream
   automation system. The dated Draft copies in the backup folder are the
   rollback reference and must not be activated.

The AI Studio project is still unpublished. Its proxy currently fails closed
with `503 BRIDGE_NOT_CONFIGURED`; no bridge secrets have been configured and no
assessment or support form is wired to it. This is safe but not functional.

## Evidence reviewed

- HighLevel AI Studio project `1789733833642057228` and its current preview.
- Published HighLevel workflow folder `Phynyx — Website Sales`.
- The live `001` safety gate and the live `002c` trigger/action canvas.
- Company checkpoint source at `6e479c0` and the signed-bridge preparation in
  GitHub PR #8.
- The September 14/15 workflow inventory and recovery contract in this branch.
- A fresh local run of the company checkpoint: 112 tests passed and the
  production build completed on September 23, 2026.

## Published workflow map

| Workflow | Purpose and verified boundaries |
| --- | --- |
| `001 - Website Intake & Routing` | Triggered by Website Submission ID change. The live safety gate requires all of `automation:phynyx-web-v1`, `source:phynyx-website`, and `form:growth-assessment`; rejects `automation:pause`; and requires a non-empty submission ID. Current graph sends internal FYIs to Andrew and Craig only. |
| `002a - Incomplete Assessment Recovery` | Incomplete assessment recovery after 15 minutes, with booking/pause/stop-bot/handover suppression and company-v2 separation. |
| `002b - Assessment Complete & Booking Recovery` | Qualified completed/unbooked recovery after 15 minutes, with suppression and a company-v2 branch that avoids competing AI activation. |
| `002c - Consented Voice Outreach` | Live trigger requires `sales:booking-followup` and Website Form Version `v1` for automatic entry. It waits 60 minutes, then applies consent, booking, pause, stop-bot, handover and Call-DND guards before the Ember voice action. Company-v2 uses explicit API enrollment after equivalent server-side guards. |
| `002d - Consented SMS Conversation` | Separate 15-minute SMS path requiring affirmative marketing-SMS consent and SMS DND off. Company-v2 uses explicit guarded enrollment. |
| `002e - Reply Stops Pending Voice` | A customer reply removes the contact from pending voice outreach. |
| `003a - Appointment Booked & Team Notification` | Confirmed appointment on calendar `NX2pJFAx51yOcaNIdNjL`; marks booked state, cleans recovery, notifies the team, confirms by email and updates the opportunity. |
| `004a - Appointment Showed & Recovery Cleanup` | Showed event clears pending recovery and pauses Ember. |
| `004b - No-Show Recovery` | Clears booked state, marks no-show, waits, reapplies suppression and moves the opportunity to reschedule-needed when eligible. |
| `004c - Cancellation Recovery` | Clears booked state, marks cancelled, waits, reapplies suppression and moves the opportunity to reschedule-needed when eligible. |

Published configuration and historical enrollment are not provider-delivery
proof. Email/SMS/voice delivery and calendar creation must each be tested with
approved internal recipients.

## Integration contract to preserve

- Write `Website Form Version = company-v2` before any trigger-producing tag,
  opportunity mutation or Website Submission ID publication.
- Preserve immutable submissions and durable per-stage receipts.
- Do not treat typed email/phone, a matching CRM record, or a submission ID as
  identity authorization.
- Preserve the browser-bound verification grant for existing contacts.
- Preserve first-touch attribution and store the current attempt separately.
- Keep quick capture, completed assessment, foundation/nurture, qualified
  recovery, direct booking and appointment outcome as distinct states.
- Remove prior acquisition recovery with acknowledged exits before starting a
  new event. Never blindly retry an uncertain mutation.
- Recheck pause, human handover, stop-bot, booked/closed state, channel consent
  and DND immediately before each eligible channel enrollment.
- Publish Website Submission ID last so `001` cannot observe a partially
  written contact.

## AI Studio work still required

1. Wire the assessment's quick-capture and completed stages to
   `/api/phynyx-bridge`, preserving the exact request shape and cookies.
2. Wire support through the same proxy using the support action; support must
   ignore ambient assessment/session cookies and must not enroll sales flows.
3. Configure the existing proxy environment values without exposing them in
   source or chat:
   - `STUDIO_BRIDGE_SECRET`
   - `STUDIO_PUBLIC_ORIGIN`
   - `STUDIO_BRIDGE_URL`
   - `STUDIO_TRUST_CF_CONNECTING_IP` only when the edge header is trusted
4. Deploy a receiver based on the newer company checkpoint, not PR #8's older
   main-branch adapter in isolation.
5. Independently audit `/schedule` for contact matching, duplicate-contact
   behavior, slot validation, idempotency, appointment ID receipt, native
   notifications and `003a` execution. Direct bookings must not be labeled as
   completed assessments.
6. Keep the AI Studio project unpublished until the internal acceptance matrix
   below passes.

## Current AI Studio source readback

The source editor was inspected directly after this document's initial draft:

- `src/components/GrowthAssessmentFunnel.tsx` explicitly says no backend exists
  yet. Its snapshot action intentionally reaches an unavailable state, and the
  UI permits visitors to explore later steps without saving.
- `src/routes/support.tsx` explicitly has no backend, submission, workflow or
  message action. Its submit handler waits 600 ms and then displays unavailable.
- `src/routes/api/phynyx-bridge.ts` exposes a server-only POST handler for
  `intake`, `assessment`, `booking` and `support`, but its own source marks the
  paired receiver as undeployed and instructs that forms not be wired yet.
- `src/lib/calendar.ts` calls the HighLevel Vibe booking service directly. It
  uses location `DsRnzA2tcoiwklSgjBtR`, calendar `NX2pJFAx51yOcaNIdNjL`, the
  appointment-text-consent field `Unplv0vwJSkik0mQ9owj`, and CTA-source field
  `XrmJih7R59gZYuIH888w`. Booking requires a caller-managed stable `sessionId`,
  a non-empty provider appointment ID and a booked start time before showing
  success; 409 is treated as a taken slot.
- `src/components/ScheduleForm.tsx` is the native contact/slot UI and forwards
  CTA attribution to the calendar helper. A provider appointment result has not
  yet been accepted in a live internal test.

The assessment and support gaps are therefore confirmed from current source,
not inferred from earlier AI Studio chat summaries.

## Internal acceptance matrix

For each test, retain evidence for every applicable layer:

1. browser response;
2. backend event and durable receipt;
3. CRM contact/opportunity write;
4. workflow enrollment acknowledgment;
5. workflow execution history;
6. recipient delivery or provider appointment ID.

Required cases:

- New quick capture without channel consent.
- New qualified full assessment with email-only recovery.
- Qualified full assessment with affirmative SMS consent and SMS DND off.
- Qualified full assessment with affirmative voice consent and Call DND off.
- Foundation/nurture result with no booking recovery.
- Existing authorized contact and existing unauthorized match.
- Duplicate/retry of the same event and a genuinely new event.
- Pause, DND, stop-bot, human handover and already-booked suppression.
- Support submission isolated from sales workflows.
- Direct booking that returns a real appointment ID and runs `003a` once.
- No-show, cancellation and showed transitions through `004a-c`.

Use only Craig and Ember test identities unless another recipient is explicitly
approved. Do not send to customers during acceptance.

## Current decision state

- Safe backup: complete.
- GitHub snapshot branch: pushed.
- Company implementation tests/build: passing.
- AI Studio visual draft: present and unpublished.
- AI Studio assessment/support connection: not configured.
- Direct booking acceptance: not proven.
- Published workflow edits in this pass: none.
- Customer communication in this pass: none.
