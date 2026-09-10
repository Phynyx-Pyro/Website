export const FUNNEL_STAGE_KEYS = [
  'leads',
  'contacted',
  'booked',
  'confirmed',
  'showed',
  'started',
] as const

export type FunnelStageKey = (typeof FUNNEL_STAGE_KEYS)[number]
export type FunnelMetricKey = FunnelStageKey | 'adSpend' | 'averageStartValue'
export type MetricConfidence = 'exact' | 'estimate' | 'not-tracked'

export type FunnelMetricAnswer = {
  value: number | null
  confidence: MetricConfidence
}

export type GrowthSnapshotInput = {
  metrics: Record<FunnelMetricKey, FunnelMetricAnswer>
  responseTime: string
  followUpAttempts: string
  attributionCoverage: string
}

export type SnapshotRateKey =
  | 'contactRate'
  | 'leadToBookRate'
  | 'bookToConfirmRate'
  | 'bookToShowRate'
  | 'showToStartRate'
  | 'leadToStartRate'

export type GrowthSnapshotResult = {
  trackedCoreMetrics: number
  exactCoreMetrics: number
  totalCoreMetrics: number
  rates: Record<SnapshotRateKey, number | null>
  costs: {
    perLead: number | null
    perBooked: number | null
    perShow: number | null
    perStart: number | null
  }
  largestDrop: {
    from: FunnelStageKey
    to: FunnelStageKey
    conversionRate: number
  } | null
  improvement: {
    additionalStarts: number
    estimatedValue: number | null
    from: FunnelStageKey
    to: FunnelStageKey
  } | null
}

const ALL_METRIC_KEYS: FunnelMetricKey[] = [
  ...FUNNEL_STAGE_KEYS,
  'adSpend',
  'averageStartValue',
]

const RESPONSE_TIMES = new Set([
  'under-5-minutes',
  '5-15-minutes',
  '15-60-minutes',
  'same-day',
  'next-business-day',
  'not-tracked',
])

const FOLLOW_UP_ATTEMPTS = new Set([
  'one',
  '2-3',
  '4-6',
  '7-plus',
  'no-defined-process',
  'not-tracked',
])

const ATTRIBUTION_COVERAGE = new Set(['all', 'some', 'none', 'not-sure'])
const CONFIDENCE_VALUES = new Set<MetricConfidence>([
  'exact',
  'estimate',
  'not-tracked',
])

function parseMetric(value: unknown): FunnelMetricAnswer | null {
  if (!value || typeof value !== 'object') return null
  const metric = value as Record<string, unknown>
  const confidence = metric.confidence
  if (
    typeof confidence !== 'string' ||
    !CONFIDENCE_VALUES.has(confidence as MetricConfidence)
  ) {
    return null
  }

  if (confidence === 'not-tracked') {
    return { value: null, confidence }
  }

  if (
    typeof metric.value !== 'number' ||
    !Number.isFinite(metric.value) ||
    metric.value < 0 ||
    metric.value > 10_000_000
  ) {
    return null
  }

  return { value: metric.value, confidence: confidence as MetricConfidence }
}

export function parseGrowthSnapshotInput(value: unknown): GrowthSnapshotInput | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (!raw.metrics || typeof raw.metrics !== 'object') return null

  const rawMetrics = raw.metrics as Record<string, unknown>
  const metrics = {} as Record<FunnelMetricKey, FunnelMetricAnswer>
  for (const key of ALL_METRIC_KEYS) {
    const parsed = parseMetric(rawMetrics[key])
    if (!parsed) return null
    metrics[key] = parsed
  }

  if (
    typeof raw.responseTime !== 'string' ||
    !RESPONSE_TIMES.has(raw.responseTime) ||
    typeof raw.followUpAttempts !== 'string' ||
    !FOLLOW_UP_ATTEMPTS.has(raw.followUpAttempts) ||
    typeof raw.attributionCoverage !== 'string' ||
    !ATTRIBUTION_COVERAGE.has(raw.attributionCoverage)
  ) {
    return null
  }

  return {
    metrics,
    responseTime: raw.responseTime,
    followUpAttempts: raw.followUpAttempts,
    attributionCoverage: raw.attributionCoverage,
  }
}

function safeRate(numerator: FunnelMetricAnswer, denominator: FunnelMetricAnswer) {
  if (
    numerator.value === null ||
    denominator.value === null ||
    denominator.value <= 0 ||
    numerator.value > denominator.value
  ) {
    return null
  }
  return numerator.value / denominator.value
}

function safeCost(spend: FunnelMetricAnswer, outcome: FunnelMetricAnswer) {
  if (spend.value === null || outcome.value === null || outcome.value <= 0) return null
  return spend.value / outcome.value
}

export function calculateGrowthSnapshot(
  input: GrowthSnapshotInput,
): GrowthSnapshotResult {
  const { metrics } = input
  const trackedCoreMetrics = FUNNEL_STAGE_KEYS.filter(
    (key) => metrics[key].value !== null,
  ).length
  const exactCoreMetrics = FUNNEL_STAGE_KEYS.filter(
    (key) => metrics[key].confidence === 'exact',
  ).length

  const rates = {
    contactRate: safeRate(metrics.contacted, metrics.leads),
    leadToBookRate: safeRate(metrics.booked, metrics.leads),
    bookToConfirmRate: safeRate(metrics.confirmed, metrics.booked),
    bookToShowRate: safeRate(metrics.showed, metrics.booked),
    showToStartRate: safeRate(metrics.started, metrics.showed),
    leadToStartRate: safeRate(metrics.started, metrics.leads),
  }

  const stageRates = FUNNEL_STAGE_KEYS.slice(0, -1).flatMap((from, index) => {
    const to = FUNNEL_STAGE_KEYS[index + 1]
    const conversionRate = safeRate(metrics[to], metrics[from])
    return conversionRate === null ? [] : [{ from, to, conversionRate }]
  })
  const largestDrop = stageRates.reduce<(typeof stageRates)[number] | null>(
    (largest, current) =>
      !largest || current.conversionRate < largest.conversionRate ? current : largest,
    null,
  )

  let improvement: GrowthSnapshotResult['improvement'] = null
  if (largestDrop) {
    const fromIndex = FUNNEL_STAGE_KEYS.indexOf(largestDrop.from)
    const fromValue = metrics[largestDrop.from].value
    let downstreamRate = 1
    let canProject = fromValue !== null && fromValue > 0

    for (let index = fromIndex + 1; index < FUNNEL_STAGE_KEYS.length - 1; index += 1) {
      const downstreamFrom = FUNNEL_STAGE_KEYS[index]
      const downstreamTo = FUNNEL_STAGE_KEYS[index + 1]
      const rate = safeRate(metrics[downstreamTo], metrics[downstreamFrom])
      if (rate === null) {
        canProject = false
        break
      }
      downstreamRate *= rate
    }

    if (canProject && fromValue !== null) {
      const additionalStarts = fromValue * 0.1 * downstreamRate
      const averageStartValue = metrics.averageStartValue.value
      improvement = {
        additionalStarts,
        estimatedValue:
          averageStartValue === null ? null : additionalStarts * averageStartValue,
        from: largestDrop.from,
        to: largestDrop.to,
      }
    }
  }

  return {
    trackedCoreMetrics,
    exactCoreMetrics,
    totalCoreMetrics: FUNNEL_STAGE_KEYS.length,
    rates,
    costs: {
      perLead: safeCost(metrics.adSpend, metrics.leads),
      perBooked: safeCost(metrics.adSpend, metrics.booked),
      perShow: safeCost(metrics.adSpend, metrics.showed),
      perStart: safeCost(metrics.adSpend, metrics.started),
    },
    largestDrop,
    improvement,
  }
}
