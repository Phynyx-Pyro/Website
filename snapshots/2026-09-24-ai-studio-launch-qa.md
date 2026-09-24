# Phynyx AI Studio lead-journey QA — 2026-09-24

This is a point-in-time record of the separate **PhynyxPro Website** AI Studio project (`1789733833642057228`) and HighLevel location `DsRnzA2tcoiwklSgjBtR`. The published AI Studio URL is `https://phynyxpro-website.vibepreview.app`. The older `get.phynyxpro.com` site is a different build. AI Studio has **no custom domain connected** as of this inspection; no production-domain cutover was made.

## Operating path

```text
Ungated 3-number check -> baseline contact capture -> 001 intake -> lead
                                |                        |
                                | unfinished             +-> 002a incomplete recovery
                                v
Complete 8-metric snapshot -> result + .txt download -> 001b completion routing
Direct schedule contact capture -----------------------> 001b direct routing
                                                          |
                                                          +-> 002b clean email booking recovery
                                                          +-> 002c AI voice, affirmative voice consent only
                                                          +-> 002d SMS/AI, affirmative marketing-SMS consent only
Reply -> 002e stop pending cadence + AI responder; STOP -> 005a opt-out;
human handover -> 005b pause bot and notify staff.
Confirmed calendar booking -> 003a stop recovery, assign owner, advance opportunity;
native calendar owns customer confirmation and 24h/1h email reminders.
Showed/no-show/cancelled -> 004a/004b/004c lifecycle and guarded recovery.
```

The measurable acquisition goal is a confirmed 30-minute call with Craig or Andrew. Use stage facts (lead, snapshot complete, booked, showed, won) and reply/handoff tags before adding numerical scores. A form submit is a lead, not an appointment. No-show/cancellation are distinct outcomes, not abandoned forms.

## Published configuration and observed runtime

| Component | Published configuration | Runtime evidence |
| --- | --- | --- |
| AI Studio capture | Five required identity fields; three separate optional consents default off; native `external_form_submission` | Internal baseline and direct-only submissions created CRM contacts with the correct native Form Submitted events. |
| 001 intake `36118464-ea4a-4a5b-b5ab-a2cd614c2063` | Exact Growth Snapshot Intake trigger, version/source/incomplete tags and internal FYI | Internal initial capture completed the workflow and created a New Website Lead opportunity. |
| 001b completion/direct `ba5b5d85-e78f-442e-bd5c-d91881496ca7` | Two exact AI Studio form triggers; sets version/source/booking-followup, removes incomplete recovery | Fresh direct-only and completed-snapshot fixtures finished this workflow. |
| 002a incomplete `7780711c-043e-40a6-8d49-92210c96fcd9` | 15m/day2/day7 finite email cadence, current AI Studio assessment link, rechecks incomplete/unbooked/engagement | Earlier controlled consent-off contact received its first email in AgentMail. Later cadence not yet elapsed. |
| 002b clean booking `19f5a2a8-a30d-4296-beea-09a56bf21610` | 15m/day2/day7 finite email cadence, weekday business-hour window, unbooked/unpaused/unengaged guards | Completed-snapshot and fresh direct-only fixtures enrolled and were waiting at 15m. First email/provider delivery not yet verified at this writing. |
| 002c/002d | Voice after 1 day only with affirmative AI Voice Marketing Consent; SMS at 15m/day2 only with affirmative Marketing SMS Consent; each rechecks booking, pause, handoff and DND | Active pending enrollments inspected: all were labeled internal QA contacts. A consent-off 002d fixture completed its wait, took the `None` branch and ended without an SMS action. No consent-on call/SMS test yet. |
| 002e/005a/005b | Replies stop pending nurture; opt-out applies DND/pause; handoff pauses bot and notifies Craig/Andrew | Configuration saved/published. Handoff/opt-out runtime test remains pending. |
| 003a + calendar | Exact confirmed assessment calendar; stops recovery, assigns owner and updates opportunity. Calendar equal-distribution round robin and native contact booking/reschedule/24h/1h email; workflow customer confirmation disabled | Configuration inspected and saved; no new synthetic booking, owner assignment, or provider delivery test in this pass. |
| 004a/b/c | Exact showed/no-show/cancelled calendar statuses; no-show/cancelled email recovery after guarded 15m wait | Config inspected; no lifecycle status-transition runtime test in this pass. |

The older draft `002b` (`2bf5b127-8c2d-4200-973c-aec295397aaa`) remains unpublished and superseded. The clean replacement is published; it was added to removal actions in 002e, 003a, 005a and 005b. No destructive deletion was performed.

## Website verification

- The 3-number calculator showed 80 inquiries, 28 booked, 20 showed as 35% booked, 71.4% show and 28.6% booked-to-show drop-off without gating the visitor.
- The 8-metric result showed correct five conversion rates and an illustrative +2.1 starts scenario. Completion now saves on **Show My Growth Snapshot**, with no second submit click. The controlled contact entered 001b and 002b after that action.
- `Download My Snapshot` produced `/Users/craigcapurso/Downloads/my-growth-snapshot.txt` with matching input values and calculations. The site explicitly promises a browser-generated `.txt`, not an emailed PDF.
- Direct booking contact capture emits the correct native `Growth Call Booking Intake` event before slot selection. It is not a booked appointment; appointment success requires a provider appointment ID and booked start.
- A separate source audit found `/support` is an openly disclosed non-submitting draft form and the legacy bridge route is fail-closed. Neither is evidence of a functioning support intake.
- Source archive `backups/ai-studio/2026-09-23-pre-routing-fixes.zip` preserves the pre-fix export; `backups/ai-studio/2026-09-24-published-connected.zip` preserves the current published-source export. The latter includes the corrected `external_form_submission` event. These are **site source backups**, not HighLevel workflow exports.
- HighLevel's `BACKUP — Website Sales Baseline — 2026-09-23` folder contains ten unpublished/draft clones of the original 001–004c workflow set, each with zero enrollments. The later 001b/005a/005b and clean 002b were created after that baseline snapshot and are not misrepresented as part of it.

## Automated source checks

The latest exported source built successfully in both client and SSR modes. Vitest passed **50/50 tests in 3 files**. ESLint failed on **27 Prettier formatting errors** (mostly test-file line wrapping, plus one funnel line and Vite config) and reported six Fast Refresh warnings; no functional lint failure was identified. The source ZIP itself was not changed by the offline test.

## Release gates still open

1. Book one labeled internal appointment through the live site, then verify the appointment ID/status, Craig/Andrew assignment, opportunity stage, single customer confirmation, reminder ownership, and no residual acquisition messages. Avoid customer traffic before this.
2. Verify first 002b email sends in the configured business-hour window and reaches the controlled inbox. Workflow enrollment alone is not delivery.
3. Test opt-out and human handoff on internal fixtures; confirm bot pause/DND and no later messages. Test SMS and voice only with explicit test consent and a controlled destination.
4. Resolve the site domain. AI Studio currently publishes only on `vibepreview.app`; no custom domain is connected. Do not assume the old `get.phynyxpro.com` URL runs this build.
5. Repair or explicitly retire `/support` before describing the entire website as functional. Fix formatting lint separately; it is not a lead-capture blocker.
6. Retest stale appointment-status edge: an old no-show/cancelled event can clear contact-wide `appt:booked` after a replacement booking. The normal immediate rebooking path is guarded, but this edge is not proven safe.

## Release decision at this checkpoint

**Controlled QA only; not yet approved for paid traffic.** Capture, calculator/result, native form event, routing and first-email delivery of the incomplete path have direct runtime evidence. The clean booking recovery advanced past its first eligibility gate and queued the first email for the 9 AM business-hour window. Booking, that email's provider delivery, channel-specific outbound, and customer reminder/provider delivery remain unproven.

A one-time thread follow-up was scheduled for 9:15 AM CDT September 24 to verify that queued booking-recovery email and consent-off branches read-only. Live booking and human-handoff tests await action-time approval because they create an appointment and staff notifications, respectively.
