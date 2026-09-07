import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

test('only affirmative boolean selections grant permission for each separate channel', async () => {
  const { parseContactConsent } = await importTypeScriptModule(new URL('../lib/contact-consent.ts', import.meta.url))
  assert.deepEqual(parseContactConsent(null), { smsMarketing: false, smsService: false, aiVoice: false })
  assert.deepEqual(parseContactConsent({ smsMarketing: 'true', smsService: 1, aiVoice: 'yes' }), { smsMarketing: false, smsService: false, aiVoice: false })
  assert.deepEqual(parseContactConsent({ smsMarketing: true, smsService: false, aiVoice: true }), { smsMarketing: true, smsService: false, aiVoice: true })
})
