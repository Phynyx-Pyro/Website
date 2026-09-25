# PhynyxPro AI Studio lead journey — launch readout

As of September 25, 2026. This is a high-level snapshot suitable for the public Website repository; detailed internal QA records remain local.

## Intended customer journey

1. A visitor starts the free Growth Snapshot or goes directly to scheduling. Both paths capture the required contact and business details before asking for a booking.
2. The intake workflows create or update one website lead and one sales opportunity. The completed Snapshot is shown on-screen and available as a browser-generated text download; a call is optional to receive it.
3. An unfinished assessment receives a finite email recovery sequence. A completed but unbooked assessment receives a separate, finite booking sequence. Marketing SMS and AI voice outreach require their separate affirmative opt-ins.
4. A reply stops active acquisition nurture and raises a human review task. A confirmed appointment stops recovery, moves the opportunity to the scheduled stage, and hands the call to the assigned human. The calendar owns customer confirmations and reminders.
5. No-show and cancellation events currently create an internal review task. Automatic reactivation remains unpublished until it can distinguish an old event from a newer confirmed appointment.

## Verified so far

- The AI Studio site is published, its primary public routes render, and both first-contact paths create native CRM form submissions with the displayed consent choices and wording/version receipt.
- Controlled internal submissions created and advanced the expected CRM lead/opportunity. First recovery emails reached owned inboxes. One inbound reply removed an active recovery enrollment and produced a human task; the concierge's email reply reached the owned inbox.
- One controlled concierge-assisted booking produced a single confirmed appointment, a human-assigned scheduled opportunity, and a native confirmation email. The post-booking bot-inactive workflow action succeeded. Two native 24-hour reminders were received.
- The current funnel's measurable conversion is a booked Growth Snapshot call. There is no checkout/payment route in this published build.
- The older branded-site form had a secondary Privacy Policy link that returned 404. That link was corrected to the same working policy page already used by its primary privacy link, then verified on the live form. This does not connect that form to the AI Studio workflow.

## Checks before broad traffic

- The published AI Studio build is at `https://phynyxpro-website.vibepreview.app/`; the branded apex/www domain still serves the older website. Its primary `Book a Demo` CTA enters a separate older form, **not** this AI Studio intake. Do not direct visitors to the branded domain expecting this build until a separate domain migration or explicit CTA handoff is completed and verified.
- Verify consented SMS provider delivery, the queued consented voice branch, the one-hour calendar reminder, later nurture suppression, and the day-seven review task/final email at their scheduled times. Workflow configuration or an executed action is not itself proof of delivery.
- Verify the concierge's normal website-tag routing on a fresh contact without historical direct assignment. Keep automatic no-show/cancellation reactivation unpublished until its exact-appointment safeguard is proven.
- Review public consent and privacy copy before sending traffic to the older branded-site form: its footer still names the wrong company. The AI Studio privacy page also describes a support-form submission, while the current support page provides an email contact route. Neither policy wording nor opt-in terms were silently changed during this audit.

No DNS, billing, checkout, or external-customer test action is implied by this snapshot.
