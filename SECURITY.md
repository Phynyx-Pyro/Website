# Security Policy

## Reporting a vulnerability

Please report a suspected vulnerability privately through the PhynyxPro support page:

https://phynyxpro.craigcap.chatgpt.site/support

Include the affected URL or component, the observed impact, and reproducible steps. Do not include passwords, API tokens, customer records, or other sensitive data in a public GitHub issue.

We will acknowledge a complete report as soon as practical, investigate it, and coordinate remediation and disclosure with the reporter when appropriate.

## Secret handling

- Production credentials belong in the hosting platform's secret manager.
- Never commit `.env` files, private integration tokens, access keys, or customer data.
- Public integration identifiers, such as the calendar widget ID and external tracking ID, are not authentication credentials.
- Rotate a credential immediately if it may have entered source control, logs, chat, or a client bundle.

## Supported version

Security fixes are applied to the currently published `main` branch.
