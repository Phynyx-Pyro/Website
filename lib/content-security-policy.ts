export function buildContentSecurityPolicy(nonce: string, isDevelopment = false) {
  if (!/^[A-Za-z0-9+/_=-]{16,}$/.test(nonce)) {
    throw new Error('Invalid content-security-policy nonce')
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''} https://link.phynyxpro.com`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://backend.leadconnectorhq.com https://link.phynyxpro.com",
    "font-src 'self' data:",
    "connect-src 'self' https://backend.leadconnectorhq.com https://link.phynyxpro.com",
    'frame-src https://link.phynyxpro.com',
    'upgrade-insecure-requests',
  ].join('; ')
}
