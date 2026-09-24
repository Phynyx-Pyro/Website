# Phynyx lead nurture audit and implementation

Status: superseded by `2026-09-24-ai-studio-launch-qa.md`. This preserves the initial audit, not the current live configuration.

## Authorization and scope

Craig authorized auditing, simplifying, editing, publishing, and internally testing the website lead journey, AI email/SMS/voice nurture, round-robin booking, and appointment reminders. No paid signup or billing changes. Existing customer outreach is not a test destination. Preserve rollback copies and scope triggers to this website.

## Current findings

- Sep 23 intake snapshot proves baseline native form capture, 001 routing, and 002a email delivery with all consents off.
- Current live 002b has one 15-minute wait, unbooked/pause/stop-bot/handover guard, company-version branch, bot activation, and one email. It is not a multi-day nurture sequence.
- 002b trigger is `sales:booking-followup` added AND Website Form Version `v1`; company branch tests another version and appears unreachable from its native trigger.
- 002b re-entry and stop-on-response are on. Its communication time window is off.
- Current 003a is triggered by confirmed appointments on Phynyx Website - Assessment. It adds booked, removes cancelled/no-show/booking-followup, notifies Craig and Andrew, sends its own confirmation email, finds/updates an existing opportunity, and conditionally runs preparation AI. It has no timed reminder nodes.
- 003a removal action does not currently clear `sales:assessment-incomplete`.
- Website auditor found the deployed final assessment is a local draft placeholder, with no completion submission or booking widget. Initial capture alone is connected. Website agent owns remediation.
- The HighLevel connector returned an OAuth scope/authClass 401; authenticated staff browser remains usable.

## Intended simple operating contract

1. Baseline capture creates a lead immediately and stores independent consent choices.
2. Completed assessment produces the promised useful snapshot and a 30-minute sales-call invitation.
3. Unbooked leads receive a finite sequence; replies hand control to conversational AI, bookings stop acquisition messages, opt-out/handoff/closed outcomes stop automation.
4. SMS and voice require the matching stored consent and channel availability; email-only leads stay email-only.
5. The round-robin calendar assigns Craig or Andrew; one system owns customer appointment confirmations/reminders.
6. Use stage/engagement facts for priority rather than an elaborate score model.

## Changes and verification

The later audit and implementation results are recorded in `2026-09-24-ai-studio-launch-qa.md`.
