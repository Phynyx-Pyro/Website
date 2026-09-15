# PhynyxPro Website

Recovered PhynyxPro marketing and lead-generation site, adapted from the original Abacus.AI export for OpenAI Sites.

## Company implementation checkpoint

The company copy now saves quick capture and full assessment answers and shows a
fresh report without requiring CRM linking. CRM dispatch and external tracking
fail closed unless explicitly enabled; keep both disabled until the integration
contract is implemented and accepted. Verification, emailed reports, cross-device
resume and live recovery are not enabled in this checkpoint. Reports can be
printed/saved in the browser. Existing contact authorization is unchanged.

See [Website recovery contract](WEBSITE_RECOVERY_CONTRACT.md) for event/state
mapping, retry/concurrency requirements, Smart Lists, pending verification and
the exact release boundary. The legacy CRM adapter described below remains for
regression coverage; its configuration switch alone is not a production-ready
repeat-assessment dispatcher.

The recovery preserves the complete multi-page brand experience, local imagery, responsive layouts, and lead forms while replacing the Abacus-specific runtime and PostgreSQL dependency with a Sites-compatible foundation.

## Brand architecture

| Brand | Role |
| --- | --- |
| **PhynyxPro** | Master agency brand |
| **The PhynyxPro Growth System** | Attract → Convert → Operate & Scale |
| **PYRO by PhynyxPro** | Revenue-operations technology division |
| **Ember** | AI voice/chat employee under PYRO |

## Stack

- Vinext and Vite, targeting Cloudflare Workers through Sites
- React 19 and TypeScript
- Tailwind CSS with the recovered PhynyxPro design system
- Framer Motion and Radix-based UI components
- Cloudflare D1 through Drizzle ORM for form submissions

## Routes

- `/` — homepage
- `/growth-system`
- `/industries` and three industry detail pages
- `/results`
- `/pyro-ember`
- `/about`
- `/growth-assessment`
- `/support`
- `/client-login`
- `/privacy-policy`, `/terms`, and `/fulfillment`

The form endpoints are `/api/growth-assessment` and `/api/support`. Assessment clients first establish an HTTP-only browser session through `/api/intake-session`; calendar prefill is claimed through `/api/booking-session`.

## Local development

Requires Node.js 22.13 or newer and Yarn 4.18.

```bash
yarn install
yarn db:generate
yarn dev
```

The local site runs at `http://localhost:3000`.

## Validation

```bash
yarn test
yarn lint
yarn build
yarn exec tsc --noEmit
```

The production build is emitted to `dist/` in the Sites-compatible Worker format.

## Data and hosting

- `.openai/hosting.json` declares the logical D1 binding as `DB`.
- `db/schema.ts` defines growth assessments, support requests, short-lived booking handoffs, intake sessions/contact grants, and public-form rate limits.
- Generated D1 migrations live in `drizzle/` and are packaged with each Sites version.
- `SITE_URL` optionally overrides the canonical metadata, sitemap, and robots origin. The source default is `https://phynyxpro.com`.
- Hosted `SITE_URL` is read from the Worker environment. Set the company origin explicitly; do not change the personal Site's settings.
- `WEBSITE_CRM_DISPATCH_ENABLED` and `WEBSITE_EXTERNAL_TRACKING_ENABLED` default to false. Keep them disabled at the capture-only checkpoint.
- `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, and `GHL_PIPELINE_STAGE_ID` select the production sub-account and dedicated website-lead pipeline. `GHL_PRIVATE_INTEGRATION_TOKEN` is server-only and must never be committed or prefixed with `NEXT_PUBLIC_`.
- The GoHighLevel private integration needs `contacts.readonly`, `contacts.write`, `locations/customFields.readonly`, `opportunities.readonly`, and `opportunities.write`. Keep the token limited to the Phynyx location and rotate it if it is ever exposed.

Growth Assessments are saved to D1 and classified on the server. New contacts receive structured CRM data, consent evidence, notes, and the appropriate website-sales signals. An existing contact can be updated only by the same unexpired browser session that created it through a validated create-only API response, with the same normalized identity. Knowing a phone number, email, or submission ID is not authorization. Older records, different browsers, expired sessions, and unverified duplicates are held for team verification without changing existing CRM data. See [handoff operations](BUSINESS_HANDOFF.md).

A short-lived, single-use, HTTP-only cookie and the matching intake session authorize calendar prefill. The booking URL itself contains no name, email, phone number, or CRM contact identifier. Browser sessions last two hours and require a modern browser with Web Locks; bootstrap is serialized across tabs. This is new-contact creation continuity, not verification that the visitor owns a phone number.

Public form routes enforce same-origin JSON requests, streamed body-size limits, D1-backed global/client/identity rate limits, honeypot fields, and replay-safe submission IDs. Site-wide response headers provide a Content Security Policy, HTTPS enforcement, frame protection, MIME sniffing protection, a restrictive referrer policy, and a limited browser permissions policy.

## Reference archive

The local `x. COPY Phynyx_Pro_Rebranding_Strategy/` folder is a design and master-export reference. It is excluded from Git because it is redundant with the recovered site and contains a private legacy environment file. The publishable site includes every image it currently references under `public/images/`.
