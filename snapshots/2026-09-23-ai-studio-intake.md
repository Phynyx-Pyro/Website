# AI Studio Growth Snapshot Intake — 2026-09-23

This document preserves the live configuration and runtime evidence for the first lead-capture checkpoint of the Phynyx Growth Snapshot before further funnel and workflow changes.

## Scope

- AI Studio project: `PhynyxPro Website` (`1789733833642057228`)
- HighLevel location: `DsRnzA2tcoiwklSgjBtR`
- Published test runtime: `https://phynyxpro-website.vibepreview.app`
- Intake route: `/growth-assessment`
- Intake workflow: `001 - Website Intake & Routing` (`36118464-ea4a-4a5b-b5ab-a2cd614c2063`)
- Recovery workflow: `002a - Incomplete Assessment Recovery` (`7780711c-043e-40a6-8d49-92210c96fcd9`)

The custom production domain was not changed in this pass.

## Lead-capture contract

The first contact checkpoint is the lead boundary. When a visitor supplies the baseline contact fields and clicks **Continue to Practice Baseline**, the site creates or updates the CRM contact immediately and then advances to the remaining assessment questions. Booking is not required for the person to become a lead.

Captured standard fields:

- Business Name → organization
- First Name → first name
- Last Name → last name
- Work Email → email
- Phone → phone

All five baseline identity fields are required. A final published-runtime check left Last Name blank with every other required field valid; the browser focused Last Name and did not advance or submit.

Captured custom fields:

- Appointment Non-Marketing SMS Consent
- Marketing SMS Consent
- AI Voice Marketing Consent
- CTA Source Attribution

The three consent choices remain separate, optional, and unchecked by default. An unchecked choice stores `Not consented`; successful lead capture does not imply permission for SMS or AI voice outreach.

## AI Studio connection

The first checkpoint uses AI Studio's native CRM form tracking:

- Form: `Get My Free Growth Snapshot Intake`
- Event type: `external_form_submission`
- The deployed site advances immediately to Practice Baseline after a successful submission.

This pass did not add a custom webhook, change the existing bridge endpoint, or alter the calendar path.

## Workflow 001 routing

Workflow 001 is published and uses one intake trigger:

- AI Studio project is `PhynyxPro Website`
- AI Studio form is `Get My Free Growth Snapshot Intake`
- Page path is `/growth-assessment`
- Domain is `phynyxpro-website.vibepreview.app`

The previous `Contact changed → Website Submission ID Changed` trigger was removed from this intake workflow so later assessment updates do not create a second intake notification.

The workflow now:

1. Stops only when the contact carries `automation:pause`.
2. Sets `Website Form Version` to `v1`.
3. Adds `automation:phynyx-web-v1`, `source:phynyx-website`, `form:growth-assessment`, and `sales:assessment-incomplete`.
4. Sends the two existing internal FYIs with accurate language that the lead *started* the Growth Snapshot.

## Workflow 002a recovery

Workflow 002a is published and enrolls a contact when:

- `sales:assessment-incomplete` is added; and
- `Website Form Version` is `v1`.

It waits 15 minutes and then rechecks that the contact is still incomplete, is not booked, and does not carry pause, stop-bot, or human-handover controls. The `v1` branch assigns `Ember - Website Sales Concierge`, sets the Conversation AI bot to `Active`, and sends the recovery email. No SMS or AI voice action is present in that branch.

The recovery email currently links to `https://get.phynyxpro.com/growth-assessment`. That production URL should remain unchanged until the custom-domain cutover to the AI Studio build is deliberately completed.

## Runtime evidence

Two isolated internal fixtures were submitted on 2026-09-23 with all consent options off.

- The published AI Studio runtime advanced from the contact checkpoint to Practice Baseline.
- HighLevel created one External Form contact for each fixture with all five standard fields.
- The three consent fields stored `Not consented` independently.
- CTA source attribution persisted.
- Workflow 001 executed the version update, tagging, both internal FYIs, and completed.
- The full-path fixture entered Workflow 002a, completed the 15-minute wait, passed the incomplete-lead gate, executed the recovery email, and finished.
- The recovery email reached the controlled AgentMail inbox at the same timestamp recorded by the workflow and appears as the only outbound conversation item for the test contact.
- No SMS or AI voice action executed in the post-wait path.

Workflow execution and provider delivery are separate evidence layers. This pass proved workflow execution, the HighLevel conversation record, and delivery to the controlled AgentMail inbox. It did not audit an SMS carrier console or a voice provider because neither channel was consented or invoked.

## Stage model

Use clear lifecycle states before adding numeric lead scoring:

1. Lead — baseline contact checkpoint submitted
2. Assessment complete — remaining diagnostic questions submitted
3. Booked — appointment created
4. Showed — appointment attended
5. Won — commercial conversion recorded

An incomplete lead remains a real lead and enters recovery; it is not discarded because the assessment or booking was not completed.

## QA artifacts

- `tests/manual/phynyx-growth-snapshot-intake-checklist.json` — editable checklist source
- `tests/manual/phynyx-growth-snapshot-intake-checklist.html` — self-contained manual execution worksheet

The checklist intentionally starts with every run status at `Not run`. Observed evidence is documented separately from an operator's final pass/fail decision.
