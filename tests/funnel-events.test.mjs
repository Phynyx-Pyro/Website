import assert from 'node:assert/strict'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const moduleUrl = new URL('../lib/funnel-events.ts', import.meta.url)

async function loadFunnelEventsModule() {
  return importTypeScriptModule(moduleUrl, [
    [
      "import { normalizeAssessmentEntryPoint } from './assessment-attribution'",
      `function normalizeAssessmentEntryPoint(value) {
        if (typeof value !== 'string') return ''
        const normalized = value.trim().toLowerCase()
        return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(normalized) ? normalized : ''
      }`,
    ],
  ])
}

test('funnel event details allow only the fields defined for each event', async () => {
  const { createFunnelEventDetail } = await loadFunnelEventsModule()

  assert.deepEqual(
    createFunnelEventDetail('assessment_step_complete', {
      step: 2,
      email: 'private@example.com',
    }),
    {
      event: 'phynyx_assessment_step_complete',
      step: 2,
    },
  )

  assert.deepEqual(
    createFunnelEventDetail('qualification_result', {
      path: 'investment-context',
      phone: '555-123-4567',
    }),
    {
      event: 'phynyx_qualification_result',
      path: 'investment-context',
    },
  )
})

test('funnel event details reject invalid placement and path values', async () => {
  const { createFunnelEventDetail } = await loadFunnelEventsModule()

  assert.equal(
    createFunnelEventDetail('diagnostic_cta_click', {
      placement: 'private@example.com',
    }),
    null,
  )
  assert.equal(
    createFunnelEventDetail('calendar_view', { path: 'booked' }),
    null,
  )
})
