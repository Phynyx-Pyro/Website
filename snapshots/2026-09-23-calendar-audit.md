# Assessment calendar audit and repair

Calendar: Phynyx Website - Assessment (`NX2pJFAx51yOcaNIdNjL`). Inspected and saved September 23, 2026, approximately 10:59 PM Central. Configuration verified after full browser reload. No real appointment or outbound delivery test performed.

## Saved changes

| Setting | Before | After |
| --- | --- | --- |
| Round robin distribution | Optimize for availability; Craig and Andrew Medium priority | Optimize for equal distribution |
| Look Busy | On, hides 35% of slots | Off |
| Confirmed booking email | Off | On, Contact only |
| Confirmed email subject | Default/unset | Confirmed: your Phynyx Growth Snapshot call |
| Reschedule email | Off | On, Contact only |
| Reschedule email subject | Default/unset | Updated time: your Phynyx Growth Snapshot call |
| External calendar invitation/update emails | On | Off, to avoid duplicate customer emails |
| Booking success page | Request received; will contact to confirm; unresolved contactMethod field | Your Phynyx Growth Snapshot call is confirmed. Check your email for the meeting details and link. We look forward to reviewing your biggest growth opportunities with you. |

Both enabled messages use Ember at PhynyxPro <craig@phynyxpro.com>. The native message retains name, appointment title, start time/timezone, meeting location, and Google/Outlook/iCloud Add to Calendar links. Both include reschedule_link, cancellation_link, and invitation to reply. Confirmed subject was visually verified after reload because accessibility omits subject input value.

## Preserved settings

- Active round-robin calendar with Craig Capurso and Dr. Andrew Higdon; 30-minute meeting and slot interval.
- Craig: Monday-Friday 8 AM-5 PM Central. Andrew: Monday/Wednesday/Thursday noon-2 PM and 5-7 PM; Tuesday/Friday 9 AM-7 PM Central. Weekend unavailable.
- Minimum notice 24 hours; booking horizon 10 calendar days; no pre/post buffers or daily maximum; one booking per user per slot.
- Craig meeting location is existing custom Zoom URL; Andrew uses Zoom integration. Connectivity and conflict-calendar sync remain unverified.
- Rescheduling reassigns through round robin; always-book-with-contact-owner off. Contact assigned user follows appointment owner on each booking/change.
- Auto-confirm on. Guest booking off. Staff selection off. Default booking form with first/last name, email, phone, notes. Existing broad consent checkbox retained; this does not substitute for separate website marketing/AI-call consent.
- Native email reminders: Contact at 24 hours and 1 hour before start; assigned owner 10 minutes before start.
- Native confirmed-booking in-app notification to assigned owner remains on.
- Native SMS notifications inspected for confirmed, reschedule, reminder: off. SMS consent gates must remain in workflows.
- Native unconfirmed, cancellation, follow-up email off. Cancellation UI applies to canceled, no-show, and invalid statuses, so distinct workflow messages should own these statuses.

## Ownership decision

Calendar owns customer confirmed/rescheduled emails and timed email reminders. Workflow 003a owns CRM cleanup, opportunity stage, and team FYI; its customer confirmation should be removed after native configuration verification. Distinct no-show/cancel workflows own recovery. Native external invitations disabled to avoid another confirmation/update email; in-message calendar links retained. Delivery and resolved merge links require coordinated synthetic appointment test.

## Appointment lifecycle workflow changes

### 004a — Appointment Showed & Recovery Cleanup

ID `c03af894-1106-4f0b-8ae6-4ca346a547cb`. Published and saved.

- Exact trigger verified: Normal, contact only, Phynyx Website - Assessment, Showed.
- Preserved existing pending recovery cleanup and conversation bot pause.
- Added `appt:showed` lifecycle tag (new tag created).
- Added Find Open Website Sales Opportunity: most recently created opportunity; Pipeline Is Phynyx — Website Sales AND Status Is Open.
- Found branch updates stage to existing Appointment Completed; backward movement disabled, duplicate opportunity disabled, status untouched. Not found ends. Booking workflow 003a owns missing opportunity creation.
- Reopened and verified tag, lookup filters, exact stage, and backward movement switch after saving.

### 004b — No-Show Recovery

ID `d47dae7c-ce41-491d-bdf4-af24cd4afff5`. Published and saved.

- Exact trigger verified: Assessment calendar, Normal/contact-only, No-show.
- Existing sequence retained: clear prior booked flag; mark no-show; wait 15 minutes; eligibility check; activate conversation bot; one recovery email; Find Open opportunity; advance to Reschedule Needed.
- Eligibility requires separate AND tag exclusions for appt:booked, automation:pause, stop bot, human handover; added sales:engaged exclusion.
- Updated email subject/body to Growth Snapshot call terminology and preserved direct booking URL, transparent AI identity, reply option, already-rescheduled reassurance, STOP instruction.
- Reselected actual Website Sales pipeline in Find action (previous display blank), retained Status Is Open.
- Existing Reschedule Needed update has backward movement off and status untouched.
- Stop on response on. Re-entry off, but product states appointment triggers can re-enter regardless; multiple opportunity runs off.

### 004c — Cancellation Recovery

ID `431f82b5-594c-4ae8-9e82-a9d64953526d`. Published and saved.

- Exact trigger verified: Assessment calendar, Normal/contact-only, cancelled.
- Same guarded 15-minute structure as no-show, with distinct cancelled email.
- Added sales:engaged as separate AND exclusion; preserved pause/stop/handoff/booked checks.
- Updated email subject/body to Growth Snapshot call terminology; retained direct booking URL, reply option and STOP instruction.
- Reselected actual Website Sales pipeline for Find; retained Open status filter; existing Reschedule Needed update has backward movement off.
- Confirmed bot assignment Ember - Website Sales Concierge, Active.
- Stop on response on; appointment re-entry product exception applies.

### Known limitation retained

If staff mark an OLD appointment no-show/cancelled after a replacement appointment already exists, initial Clear Prior Booked Flag can clear the contact-wide appt:booked marker. Normal replacement booking during the 15-minute wait is covered by 003a removal of recovery workflows. Native If/Else Appointment fields exposed only Rescheduled, Is running as guest, Start date, End date for the trigger appointment, not a query for another future appointment. Do not claim this stale-event edge is solved. A future enhancement could bind the latest appointment ID before clearing flags. No synthetic booking/status-change runtime test was performed by this audit agent.
