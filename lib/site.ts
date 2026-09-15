import { env } from 'cloudflare:workers'

export const SITE_URL = (env.SITE_URL || process.env.SITE_URL || 'https://phynyxpro.com').replace(
  /\/$/,
  '',
)
