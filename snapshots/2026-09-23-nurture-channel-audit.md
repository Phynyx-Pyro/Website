# Website nurture channel audit — 2026-09-23

This records browser-verified configuration, not proof of message delivery or end-to-end production readiness.

## Original state

- 002c `45d9da71-533d-43d7-9dce-07232fc5ad3b`: published, booking-followup/v1 trigger, 60-minute wait, consent:ai-voice legacy-tag gate, one Voice call. Re-entry on.
- 002d `7fa97577-9208-45bd-823f-3eed0e25ac09`: published, booking-followup/v1 trigger, 15-minute wait, consent:sms-marketing legacy-tag gate, bot activation and one ordinary SMS. Re-entry on.
- 002e `51667f5e-5245-4b88-bb66-9373afc6b731`: published Customer Replied with sales:booking-followup tag filter. Removed only 002c; no engagement marker.
- Native website intake writes consent custom fields, while c/d required older consent tags. This mismatch could silently exclude new leads.

## Saved and published changes

### 002c

- One-day wait replaces 60 minutes; actual value and unit verified after save.
- Current AI Voice Marketing Consent field Includes Consented (native checkbox operator).
- Separate AND exclusions for appt:booked, automation:pause, stop bot, human handover, sales:engaged, and Call DND.
- Final scope source:phynyx-website AND Website Form Version Is v1 for both growth-assessment and direct-booking recovery. Reload confirmed.
- Original Voice agent/caller and bot activation preserved, single call then END. Booking-followup/v1 trigger explicitly repaired after reload exposed stale AI-generated metadata that Undo had not restored; second reload confirmed exact intended filters.
- Re-entry off, multiple opportunities off, stop-on-response on, contact timezone weekdays 09:00–17:00, mark-as-read off.

### 002d

- Scope source:phynyx-website AND Website Form Version Is v1.
- Current Marketing SMS Consent Includes Consented, with separate exclusions for appt:booked, automation:pause, stop bot, human handover, sales:engaged and SMS DND.
- 15 minutes → guard → activate Website Sales Concierge → initial SMS → 2 days → same full guard → final SMS → END.
- The copied second bot-activation action was removed to avoid reactivating a bot a human may have put to sleep.
- Re-entry off, multiple opportunities off, stop-on-response on; existing contact-timezone weekday 09:00–17:00 window retained.
- Both gates read back. Second gate has nine AND rows, affirmative native consent and v1 value present.
- SMS1: "Hi {{contact.first_name}}, I'm Ember, PhynyxPro's AI assistant. Thanks for starting your free Growth Snapshot. Would you like help finishing it or booking a 30-minute diagnostic with Craig or Andrew? Reply STOP to opt out."
- SMS2: "Hi {{contact.first_name}}, Ember here, PhynyxPro's AI assistant. One last check-in: would finishing your Growth Snapshot or talking through your lead-to-appointment process be useful? Reply with your biggest question and I'll help. Reply STOP to opt out."

### 002e

- Customer Replied filter source:phynyx-website plus Website Form Version exact v1. HighLevel's trigger allows one Has tag filter, so version is the additional scope.
- Removes only 002a, 002b, 002c and 002d, all four names verified in selected workflow list after save.
- Adds sales:engaged; keeps responder bot active.
- Existing re-entry remains on so later replies can cancel pending nurture again.
- Workflow display name still 002e - Reply Stops Pending Voice although function now cancels all four website nurture cadences.

## AI agents

### Website Sales Concierge

- ID WCpBoij7eLZ2yoxs5HgO, GPT-5.4 Mini, Auto-Pilot.
- Saved prompt now uses https://phynyxpro-website.vibepreview.app/growth-assessment; removes stale 500k/3k thresholds and treats readiness answers as context, not automatic rejection. Reload confirmed.
- Optional preparation only after booking, no duplicate booking, current real calendar, no unsupported success claims.
- Existing stop action adds stop bot, ends responses indefinitely. Existing human handoff adds human handover, stops replies and creates a task. These alone do not prove durable channel DND.
- Existing one AI-generated follow-up after 24 hours of silence remains; updated active hours contact timezone Mon–Fri09:00–17:00, reload readback confirmed. Dynamic channel switching OFF.
- Manual message puts bot to sleep indefinitely; workflow messages do not.
- Booking pause-after-booking experiment cancelled without saving; responder remains available for explicit questions/cancellation/reschedule.

### Website Sales Voice

- ID 6a9f188307afaaba815656e6, GPT4.1, Jessica voice.
- Saved prompt replaces legacy consent:ai-voice wording with current affirmative AI Voice Marketing Consent and old ChatGPT URL with current preview URL. Reload confirmed.
- Existing booking action uses Phynyx Website - Assessment calendar NX2pJFAx51yOcaNIdNjL.
- Original only booking/hangup tools; opt-out/handoff persistence not implemented by prompt alone. Calendar auditor building scoped receivers; voice workflow tool wiring pending at this checkpoint.

## Runtime and product caveats

- No customer SMS/call sent by this auditor. Configuration is not delivery proof.
- Stop-on-response applies only to messages sent by the same workflow; 002e provides cross-workflow cancellation.
- Native Workflow AI broad edits produced malformed draft and misleading prose; undo restored prior nodes and all final changes were manual. Do not rely on AI summaries or label-only checks.
- HighLevel action clipboard is shared across tabs. Coordinate copies between agents.
- Numeric engagement scoring remains off. Stage facts are used instead.
- Root owns 001 enrollment and email sequences; calendar auditor owns booking/reminder/recovery and scoped opt-out/handoff receivers.
