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
    createFunnelEventDetail('investment_context_acknowledged', {
      path: 'investment-context',
      email: 'private@example.com',
    }),
    {
      event: 'phynyx_investment_context_acknowledged',
      path: 'investment-context',
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
  assert.equal(
    createFunnelEventDetail('investment_context_acknowledged', {
      path: 'calendar',
    }),
    null,
  )
})

test('tracking initializes the data layer queue and still dispatches the custom event', async () => {
  const { FUNNEL_EVENT_CHANNEL, trackFunnelEvent } =
    await loadFunnelEventsModule()
  const originalWindow = globalThis.window
  const originalCustomEvent = globalThis.CustomEvent
  const dispatched = []

  class TestCustomEvent {
    constructor(type, init) {
      this.type = type
      this.detail = init.detail
    }
  }

  try {
    globalThis.CustomEvent = TestCustomEvent
    globalThis.window = {
      dispatchEvent(event) {
        dispatched.push(event)
        return true
      },
    }

    trackFunnelEvent('diagnostic_cta_click', {
      placement: 'growth_system_final',
    })

    assert.equal(dispatched.length, 1)
    assert.equal(dispatched[0].type, FUNNEL_EVENT_CHANNEL)
    assert.deepEqual(dispatched[0].detail, {
      event: 'phynyx_diagnostic_cta_click',
      placement: 'growth_system_final',
    })
    assert.deepEqual(globalThis.window.dataLayer, [dispatched[0].detail])
    assert.strictEqual(globalThis.window.dataLayer[0], dispatched[0].detail)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalCustomEvent === undefined) delete globalThis.CustomEvent
    else globalThis.CustomEvent = originalCustomEvent
  }
})
