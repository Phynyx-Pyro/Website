# Phynyx business handoff

## Source, hosting, and ownership

- Canonical source: https://github.com/Phynyx-Pyro/Website (public repository).
- Current public site: https://get.phynyxpro.com.
- Squarespace owns domain/DNS management; Sites owns hosting; GoHighLevel owns CRM, calendar, and workflows. A Git clone does not transfer those services or their data.
- The committed hosting manifest identifies the existing personal Sites project. Reuse it only for maintenance of that site. For a new company site, import a sanitized source copy without that project ID and register exactly one new owner-private site with a fresh DB binding.
- Preserve production and DNS until company ownership, secrets, data migration, and functional acceptance are verified.

## Runtime settings

Use company-managed, least-privilege credentials entered through Sites settings, never Git, chat, or frontend code. Required names: GHL_LOCATION_ID, GHL_PIPELINE_ID, GHL_PIPELINE_STAGE_ID, GHL_PRIVATE_INTEGRATION_TOKEN (secret). The first three are identifiers, not passwords. SITE_URL controls canonical metadata and should be explicitly set to the intended public origin when the company site goes live.

The website integration requires contacts read/write, location custom-field read, and opportunities read/write. Auditing workflows uses a separate integration: the website token should not receive broad workflow administration privileges just for convenience.

Missing credentials must remain missing in the private clone until securely provisioned. Do not copy masked tokens, OAuth refresh tokens, browser cookies, historical database rows, or the original hosting identity into the source archive.

## Intake and recovery behavior

An expiring HTTP-only cookie binds each assessment and calendar handoff to a server session. Grants for an existing CRM contact require an unambiguous 201 create receipt from that same session and matching contact/location/email/phone. An unrelated or historical match is retained as contact-verification-required without modifying CRM consent or metadata.

New visitors can complete quick capture and the full assessment in the same browser within two hours. Recovery links should use the same origin, get.phynyxpro.com. Switching devices, clearing cookies, or waiting until expiry requires team-assisted verification. There is no automatic OTP verification flow in this release.

Transient database grant writes retry without repeating contact creation. If persistence remains unavailable, the submission is held for human verification; retries cannot invent missing creation provenance. Review held records through owner-only Sites database access. Do not put customer rows in GitHub. The support form stores requests in D1; no independent notification transport is implemented there.

## Deployment and data

Migration 0005 adds session/grant tables and nullable session bindings to assessments and booking handoffs. Existing customer rows are retained; old rows and old handoffs deliberately receive no authorization grant. Package all generated migrations with the Sites build.

Deploy the exact reviewed source to the original site first; confirm a terminal successful deployment and safe health checks. Keep the company clone private and its database separate. Historical-data transfer requires a protected export/import plan; do not assume code cloning also copied the live database.

No domain cutover should occur until a company administrator securely provisions credentials, verifies supported channels/billing, approves a controlled end-to-end test, and decides how historical data is retained or migrated.

## Acceptance checklist

- Run the complete automated test suite, lint, type checking, and production build.
- Confirm source and saved/deployed version identify the same revision.
- Check HTTPS and response headers, session cookie flags, rejection of cross-origin/missing authorization, and absence of private credentials in client assets.
- Confirm GHL pipeline/calendar identifiers and live workflow inventory in GHL_WEBSITE_LEAD_SYSTEM.md.
- With the owners present, approve a dedicated test identity and any message/call costs; verify actual delivery, appointment confirmation, stop/reply handling, and team notifications.
- Do not declare absolute security or infer a breach from page-view counts alone.
