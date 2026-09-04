# PhynyxPro Website Deployment and Rollback Runbook

Last reviewed: September 4, 2026

This runbook governs releases of the PhynyxPro website, its packaged D1
migrations, and the website-to-GoHighLevel integration. A green local build is
necessary but is not proof that any external system is ready.

> **STOP — orchestrator approval is mandatory.** Do not click **Save**,
> **Deploy**, **Publish**, **Promote**, or an equivalent control in Sites, and do
> not apply a production D1 migration, until every gate below has recorded
> evidence and the orchestrator has explicitly approved this exact commit and
> release candidate. Preparing or previewing a candidate does not grant that
> approval.

## Release record

Create a release record before touching production. Record all of the following:

- release owner, reviewer, orchestrator approver, and UTC timestamps
- immutable Git commit SHA and clean-tree evidence
- Sites project ID from `.openai/hosting.json`
- logical D1 binding name and the production database identifier it resolves to
- current production Sites version and the known-good version selected for
  application rollback
- candidate artifact identifier and a checksum or immutable version reference
- the migration-journal snapshot, production D1 export timestamp and location,
  restore-test evidence, and before/after row counts
- GoHighLevel location, pipeline, initial stage, calendar, custom-field, and
  workflow identifiers used by the candidate
- results or links for the local checks, restored-copy migration rehearsal,
  browser QA, controlled end-to-end tests, post-deploy checks, and any rollback

Do not substitute a branch name, working-tree state, or “latest” for an
immutable commit or deployed version.

## External launch blockers

Every item below is a release blocker until a named owner attaches current
evidence. Do not infer readiness from an earlier audit, a UI label, a code
constant, or a previously successful canary.

| Blocker | Evidence required before approval |
| --- | --- |
| Workflow 00 safety gate | Revalidate the paused path, eligible internal-action path, and idempotent replay with the temporary `test:automation` gate. Record who may remove that gate and require separate orchestrator approval before removal. |
| Existing-owner persistence | Revalidate that a repeat submission preserves a valid existing contact owner and opportunity stage. Confirm how callback tasks and visibility alerts behave when that owner is neither Craig nor Andrew. |
| Workflows 01–08 | Build as drafts, peer review, test, and explicitly approve each workflow. Unbuilt or untested workflows remain off. |
| Booking lifecycle | Verify request, staff/calendar confirmation, reminder, reschedule, cancellation, no-show, showed, Won, and Lost behavior without conflating a request with a confirmed appointment. |
| Twenty-case test matrix | Complete at least 20 labeled cases covering new and existing contacts, both fit paths, retries, both sales associates, pre-existing owners, duplicate open opportunities, bookings, lifecycle changes, Won/Lost, paused automation, and opt-out/unknown-consent states. |
| External tracking isolation | Prove the installed HighLevel external-tracking script cannot enroll synthetic website leads in any legacy global workflow or produce unintended outbound communication. |
| Andrew calendar availability | Resolve the ambiguous `12:00 AM–12:00 AM` weekday rows with a human owner; do not interpret them as available or unavailable without confirmation. |
| Coverage and booking controls | Approve the timezone, coverage hours, minimum notice, booking window, buffers, daily caps, round-robin membership, meeting locations, and the calendar contact-assignment setting. |
| GoHighLevel field tokens | Re-read the production location's custom-field IDs/keys and write permissions. Verify every website contact and opportunity field maps to the intended stable field before sending a production submission. |
| GoHighLevel identity and concurrency | Capture the production location's `Allow Duplicate Contact` setting and contact match priority; require duplicate contacts to be disabled unless an explicitly reviewed equivalent policy is proven. HighLevel's published contact APIs do not document an atomic concurrency guarantee, and its opportunity APIs do not document a natural-key upsert for contact plus pipeline. Before claiming strict one-contact/one-open-opportunity behavior, prove durable serialization across simultaneous same-identity submissions or attach evidence of an equivalent HighLevel guarantee. |
| Marketing consent and A2P | Obtain approved, versioned channel-specific consent language, evidence storage, suppression/DND behavior, STOP handling, and any required A2P/carrier approval before enabling marketing SMS or email. Blank consent is not permission. |
| Legal attestations | Obtain counsel/business-owner approval for Terms, Privacy Policy, Fulfillment, claims, consent disclosures, and any industry-specific obligations. Repository copy is not legal approval. |
| Support inquiry ownership | Name and test the person or queue that receives support-inquiry notifications, including an escalation path and response coverage. D1 storage alone is not operational delivery. |
| Failed-sync operations | Name the CRM administrator and escalation recipients; implement and test a site-side monitor for failed/pending CRM syncs because a failure can occur before a GoHighLevel contact exists. |
| Production D1 readiness | Take and verify a production export, inspect the migration journal, determine whether migration `0003` is pending, rehearse it on a restored copy, and confirm schema and row-count invariants. |
| Browser QA | Complete the required desktop and mobile route, interaction, form, accessibility, layout, and console/network checks on the exact release candidate. |

The broader GoHighLevel activation checklist in
`GHL_WEBSITE_LEAD_SYSTEM.md` remains additive to this table.

Relevant published references are HighLevel's
[contact upsert](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/)
and opportunity
[search](https://marketplace.gohighlevel.com/docs/ghl/opportunities/search-opportunity),
[create](https://marketplace.gohighlevel.com/docs/ghl/opportunities/create-opportunity/),
[update](https://marketplace.gohighlevel.com/docs/ghl/opportunities/update-opportunity/),
and
[upsert](https://marketplace.gohighlevel.com/docs/ghl/opportunities/upsert-opportunity/index.html)
documentation. The contact upsert option
`createNewIfDuplicateAllowed: false` can reinforce a verified location policy,
but the published reference does not make it an atomic concurrency guarantee.

## Local candidate preflight

Run these checks from the repository root against the exact commit proposed for
release. Capture full output in the release record.

```bash
git status --short
git rev-parse --verify HEAD
corepack yarn install --immutable
corepack yarn lint
corepack yarn exec tsc --noEmit
corepack yarn test
corepack yarn build
corepack yarn exec drizzle-kit check
git diff --check
git status --short
```

All checks must pass. The tree must be clean before and after the checks. If a
tool rewrites the lockfile, migrations, generated metadata, or application
files, stop and review the diff; do not release that unreviewed output.

Confirm the artifact contains the expected worker output,
`.openai/hosting.json`, and migrations `0000` through `0003`. Confirm the Sites
project identifier and logical `DB` binding are correct, while treating the
actual production D1 database mapping as external state that must be verified
in Sites. Confirm `SITE_URL` and the server-only GoHighLevel credentials/IDs are
present in the target environment without exposing secret values in logs or the
release record.

Historical migration files are immutable release history. **Never edit,
renumber, delete, or replace an existing migration to make a check pass.** Any
schema correction must be a new, forward-only migration with its own review and
restored-copy rehearsal.

## Production D1 preflight and migration rehearsal

Database inspection and migration execution require an authorized operator.
Use read-only queries until the backup and approval gates are complete.

1. Resolve the Sites `DB` binding to the exact production D1 database and record
   both identifiers. Stop if the mapping is ambiguous.
2. Export the complete production database before any migration. Record the UTC
   timestamp, protected storage location, byte size, checksum, and command/tool
   version. Keep the export out of Git.
3. Restore that export into an isolated non-production database and prove the
   restored copy opens, passes an integrity check, and has the same table and
   row counts as the export source. A downloaded file without a restore test is
   not a verified backup.
4. Export the production migration journal. Verify migrations `0000`, `0001`,
   `0002`, and `0003` by identity/hash and confirm each appears no more than
   once. Record explicitly whether `0003_fluffy_trish_tilby.sql` is already
   applied or pending. If the journal is missing, duplicated, or disagrees with
   the actual schema, stop for a forward-only repair plan.
5. Inspect `PRAGMA table_info('growth_assessments')` and row counts for
   `growth_assessments`, `support_requests`, `booking_handoffs`, and
   `public_form_rate_limits`. `submission_type` must exist and be `NOT NULL`.
   The nullable `attribution_json`, `entry_point`, and `fit_path` columns must be
   present after `0003`.
6. If any migration before `0003` is missing, do not apply the historical chain
   blindly to a populated database. In particular, do not modify historical
   migration `0001` to work around its `NOT NULL` column addition. Stop and
   prepare a separately reviewed forward-safe migration plan.
7. If `0003` is pending, apply the unmodified packaged migration only to the
   restored non-production copy first. Re-run the integrity check, schema
   inspection, migration journal inspection, and row counts. The counts of all
   existing application rows must be unchanged.
8. Exercise representative reads and writes against the restored copy using the
   candidate application, including legacy assessment retries and the booking
   handoff. Do not use production customer data in screenshots or logs.
9. Attach the rehearsal evidence and request explicit authorization for the
   production migration. Migration approval does not imply Sites deployment
   approval, and Sites deployment approval does not imply migration approval.

Never run a destructive schema command, down migration, table recreation, or
production data cleanup as part of a routine release.

## GoHighLevel and workflow preflight

Before requesting release approval:

1. Re-read the production IDs, custom-field tokens, private-integration scopes,
   workflow states, calendar settings, and external-tracking configuration.
2. Keep `automation:pause` functional and the temporary `test:automation` gate
   active while testing. Use clearly labeled synthetic records only.
3. Verify a new lead and an existing-contact submission each produce one
   contact, one open website-sales opportunity, preserved existing ownership and
   stage where applicable, one idempotent assessment note, the complete
   attribution snapshot, and no unintended communication.
4. Record the location's `Allow Duplicate Contact` setting and contact match
   priority. Verify duplicate contacts are disabled and the priority matches the
   website's normalized email-and-phone identity policy. If a contact upsert is
   part of the candidate, verify `createNewIfDuplicateAllowed: false` is sent;
   do not treat that flag alone as proof of atomic behavior.
5. Fire at least two same-identity submissions with different submission IDs at
   the same time, then repeat the test at least three times. Confirm every run
   converges on exactly one contact and one open website-sales opportunity,
   preserves owner and stage, records each submission once, and sends no
   unintended communication. Attach request timestamps, response IDs, CRM
   record IDs, and workflow logs without exposing lead PII.
6. Verify the contact and opportunity search-then-create windows are protected
   by durable serialization, or attach an equivalent concurrency guarantee
   verified for this exact HighLevel location and API version. A successful
   sequential canary is not sufficient. If neither condition is proven, stop;
   strict one-contact/one-open-opportunity behavior remains an external launch
   blocker.
7. Verify a duplicate-open-opportunity condition fails closed and reaches the
   named operations path instead of silently choosing one.
8. Verify assessment sync accepts and writes `No` to Investment Context
   Acknowledged before the final Website Submission ID enrollment signal, and
   that only the explicit investment-context continue action changes it to
   `Yes` before calendar access is returned. Confirm Workflow 00 treats `No` as
   current-submission reset state, not as acknowledgement. With two overlapping
   handoffs for one contact, confirm the older submission ID fails closed after
   a newer same-identity assessment is persisted, including when that newer
   attempt fails before its final Website Submission ID write. Confirm an older
   failed assessment cannot be retried after a newer one and produce any CRM
   request. Because HighLevel does not document a conditional field update,
   require the same durable identity lock to cover both metadata enrollment and
   the marker-check-to-acknowledgement write window; otherwise stop the launch.
9. Verify the single-use calendar handoff is atomically reserved before its CRM
   callback. Handled callback failures must release that reservation for retry.
   Also test the runtime-termination window: an abrupt isolate stop after the
   reservation can strand the token until the visitor resubmits the exact form;
   explicitly accept that recovery or stop for a separately reviewed two-phase
   handoff design.
10. Confirm consent fields remain blank unless approved controls captured the
   choice and evidence. Do not enable customer-facing marketing automation for
   blank, unknown, opted-out, or DND channels.
11. Complete every external blocker in the table above and attach evidence.

This concurrency gate does not expand the packaged database migration scope,
which remains migrations `0000` through `0003`. If durable serialization later
requires schema work, handle it as a separately reviewed, forward-only change;
never alter migration `0003` in place.

## Final authorization and Sites release

The release owner presents one record containing the exact SHA, clean local
results, restored-copy database evidence, external-blocker evidence, migration
decision, current and rollback Sites versions, and the proposed change window.

> **STOP AGAIN — no Sites save or deployment may occur without an explicit
> orchestrator “go” for this exact SHA and release record.** Silence, prior
> approval of another commit, approval to run tests, and approval to prepare a
> preview are all no-go decisions.

After approval, the authorized operator should:

1. Apply only the separately approved forward production migration, if one is
   pending, and immediately recheck its journal entry, schema, integrity, and
   row-count invariants.
2. Save/deploy the exact reviewed Sites artifact to the recorded project; do not
   rebuild from a dirty tree or select an unrecorded “latest” artifact.
3. Record the returned Sites version, UTC deployment time, and operator.
4. Begin post-deploy checks immediately. Do not remove the Workflow 00 test gate
   or enable workflows 01–08 as an incidental part of the website release.

## Post-deploy verification

On the deployed version, record evidence for:

- all public routes, canonical metadata, sitemap/robots behavior, legal pages,
  desktop/mobile layout, keyboard operation, and browser console/network health
- security headers and same-origin, content-type, body-size, honeypot,
  rate-limit, validation, and replay protections on both public form routes
- one orchestrator-approved synthetic assessment through each fit path, with
  request and confirmation measured separately
- D1 persistence, deterministic fit, first landing/current conversion/CTA
  attribution, session/click-ID snapshot, idempotent replay, and a protected,
  single-use booking handoff without PII in the booking URL
- exactly one matching GoHighLevel contact and one open website-sales
  opportunity, correct fields/tags/note, preserved owner/stage, and no legacy
  workflow enrollment or unintended customer communication
- the explicit investment-context acknowledgment write before calendar access
- support inquiry routing to the named owner/queue and its escalation path
- site-side failed/pending-sync monitoring and CRM administrator notification

Monitor application, D1, and GoHighLevel execution health throughout the change
window without copying secrets or customer PII into the release record. Any
material mismatch triggers rollback or a deliberate hold; do not “test through”
an uncontrolled production failure.

## Rollback

Application rollback and database recovery are separate decisions.

1. Pause or restrict new automation enrollment using the pre-approved safety
   control, while preserving the ability to inspect failed/pending submissions.
2. Roll the application back to the recorded known-good Sites version. Record
   the version, operator, UTC time, reason, and verification results.
3. Re-run route, form-safety, and integration health checks on the restored
   application version. Preserve failed submissions for reviewed retry; do not
   delete or silently mark them complete.
4. **Do not down-migrate, delete D1 data, or restore the pre-release export as a
   normal application rollback.** Additive nullable columns can remain while a
   forward fix is prepared.
5. If data corruption requires a restore, open a separate incident and obtain
   explicit database-recovery approval. Account for every submission received
   after the backup timestamp, export the current damaged state for forensics,
   and reconcile new rows before any restore. Never overwrite post-backup data
   blindly.
6. Prefer a reviewed forward-only migration or application fix. Rehearse it on
   a restored copy, repeat this runbook, and obtain a new orchestrator approval.

Keep the Workflow 00 test gate and customer-facing marketing workflows in their
safe state until the incident owner explicitly closes the rollback and the
external launch blockers are revalidated.
