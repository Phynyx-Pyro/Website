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

test('page CSP keeps fonts self-hosted', async () => {
  const policy = buildContentSecurityPolicy('0123456789abcdef0123456789abcdef')
  const [layout, styles] = await Promise.all([
    readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/globals.css', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(policy, /fonts\.(?:googleapis|gstatic)\.com/)
  assert.doesNotMatch(layout, /next\/font\/google/)
  assert.match(styles, /\/fonts\/space-grotesk-latin\.woff2/)
  assert.match(styles, /\/fonts\/caveat-latin\.woff2/)
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

test('assessment prefill guards are set inside deferred callbacks', async () => {
  const source = await readFile(
    new URL(
      '../app/(marketing)/growth-assessment/_components/growth-assessment-client.tsx',
      import.meta.url,
    ),
    'utf8',
  )

  const contactFrame = source.indexOf('const frame = window.requestAnimationFrame(() => {')
  const contactGuard = source.indexOf('prefillAppliedRef.current = true')
  const industryFrame = source.indexOf(
    'const frame = window.requestAnimationFrame(() => {',
    contactFrame + 1,
  )
  const industryGuard = source.indexOf('industryPrefillAppliedRef.current = true')

  assert.ok(contactFrame >= 0 && contactGuard > contactFrame)
  assert.ok(industryFrame > contactFrame && industryGuard > industryFrame)
})
