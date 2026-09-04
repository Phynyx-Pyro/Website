# PhynyxPro Website

Recovered PhynyxPro marketing and lead-generation site, adapted from the original Abacus.AI export for OpenAI Sites.

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

The two form endpoints are `/api/growth-assessment` and `/api/support`.

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
- `db/schema.ts` defines growth assessments, support requests, short-lived booking handoffs, and public-form rate limits.
- Generated D1 migrations live in `drizzle/` and are packaged with each Sites version.
- `SITE_URL` optionally overrides the canonical metadata, sitemap, and robots origin. The source default is `https://phynyxpro.com`.
- `GHL_LOCATION_ID` and the secret `GHL_PRIVATE_INTEGRATION_TOKEN` are production environment bindings. The token is server-only and must never be committed or prefixed with `NEXT_PUBLIC_`.

Growth Assessments are saved to D1 and classified on the server. Net-new GoHighLevel contacts receive website-source tags and a structured assessment note; matching existing contacts are linked to the booking without changing their CRM fields, tags, or notes. A short-lived, single-use, HTTP-only cookie authorizes the calendar prefill handoff, and the booking URL itself contains no name, email, phone number, or CRM contact identifier.

Public form routes enforce same-origin JSON requests, streamed body-size limits, D1-backed global/client/identity rate limits, honeypot fields, and replay-safe submission IDs. Site-wide response headers provide a Content Security Policy, HTTPS enforcement, frame protection, MIME sniffing protection, a restrictive referrer policy, and a limited browser permissions policy.

## Reference archive

The local `x. COPY Phynyx_Pro_Rebranding_Strategy/` folder is a design and master-export reference. It is excluded from Git because it is redundant with the recovered site and contains a private legacy environment file. The publishable site includes every image it currently references under `public/images/`.
