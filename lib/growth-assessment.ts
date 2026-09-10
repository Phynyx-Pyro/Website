export type FitPath = 'calendar' | 'readiness-review' | 'foundation'
export type FitTier = 'ready-now' | 'emerging' | 'foundation'

export type GrowthFitInput = {
  annualRevenue: string
  monthlyBudget: string
  capacity: string
  decisionRole: string
  implementationTiming: string
  followUpOwner: string
  trackedMetricCount: number
}

export type FitAssessment = {
  path: FitPath
  tier: FitTier
  tag: 'fit-ready-now' | 'fit-emerging' | 'fit-foundation'
  score: number
  summary: string
}

const READY_REVENUE = new Set(['300k-500k', '500k-1m', '1m-plus'])
const READY_BUDGET = new Set(['2k-3k', '3k-5k', '5k-plus'])
const READY_CAPACITY = new Set(['6-10', '11-20', '20-plus'])
const DECISION_ACCESS = new Set(['owner', 'partner'])
const ACTIVE_TIMING = new Set(['within-30-days', '31-60-days', '61-90-days'])

export function assessGrowthFit(input: GrowthFitInput): FitAssessment {
  const revenueReady = READY_REVENUE.has(input.annualRevenue)
  const budgetReady = READY_BUDGET.has(input.monthlyBudget)
  const capacityReady = READY_CAPACITY.has(input.capacity)
  const decisionReady = DECISION_ACCESS.has(input.decisionRole)
  const timingReady = ACTIVE_TIMING.has(input.implementationTiming)
  const ownerReady = input.followUpOwner === 'yes'
  const visibilityReady = input.trackedMetricCount >= 4

  const score = [
    revenueReady,
    budgetReady,
    capacityReady,
    decisionReady,
    timingReady,
    ownerReady,
    visibilityReady,
  ].filter(Boolean).length

  const foundationOnly =
    (input.annualRevenue === 'under-200k' && input.monthlyBudget === 'under-1k') ||
    input.capacity === 'none' ||
    input.decisionRole === 'researching' ||
    input.implementationTiming === 'researching' ||
    input.followUpOwner === 'no'

  if (foundationOnly) {
    return {
      path: 'foundation',
      tier: 'foundation',
      tag: 'fit-foundation',
      score,
      summary:
        'Build capacity, decision access, operating ownership, or acquisition investment before scheduling a full diagnostic.',
    }
  }

  if (
    revenueReady &&
    budgetReady &&
    capacityReady &&
    decisionReady &&
    timingReady &&
    ownerReady
  ) {
    return {
      path: 'calendar',
      tier: 'ready-now',
      tag: 'fit-ready-now',
      score,
      summary:
        'The practice reports sufficient economic readiness, capacity, decision access, timing, and operating ownership for a working diagnostic.',
    }
  }

  return {
    path: 'readiness-review',
    tier: 'emerging',
    tag: 'fit-emerging',
    score,
    summary:
      'The practice is earlier than the typical full-build client, but its operating context may support a practical starting point.',
  }
}
