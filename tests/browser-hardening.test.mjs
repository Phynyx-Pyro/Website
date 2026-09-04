import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { buildContentSecurityPolicy } from '../lib/content-security-policy.ts'

test('page CSP trusts per-request nonces instead of arbitrary inline scripts', () => {
  const policy = buildContentSecurityPolicy('0123456789abcdef0123456789abcdef')

  assert.match(policy, /script-src[^;]*'nonce-0123456789abcdef0123456789abcdef'/)
  assert.match(policy, /script-src[^;]*'strict-dynamic'/)
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/)
  assert.match(policy, /script-src-attr 'none'/)
})

test('assessment prefill is not persisted in browser storage', async () => {
  const files = await Promise.all([
    readFile(
      new URL(
        '../app/(marketing)/(home)/_components/cta-section.tsx',
        import.meta.url,
      ),
      'utf8',
    ),
    readFile(
      new URL(
        '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
        import.meta.url,
      ),
      'utf8',
    ),
  ])

  assert.equal(files.some((source) => /(?:local|session)Storage/.test(source)), false)
})
