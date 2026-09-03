export type FitPath = 'calendar' | 'investment-context'

export type FitAssessment = {
  path: FitPath
  tag: 'fit-good' | 'investment-confirmation-required'
  summary: string
}

const IMMEDIATE_CALENDAR_REVENUE = new Set(['500k-1m', '1m-5m', '5m-plus'])
const IMMEDIATE_CALENDAR_BUDGET = new Set(['3k-5k', '5k-10k', '10k-plus'])

export function assessGrowthFit(
  annualRevenue: string,
  monthlyBudget: string,
): FitAssessment {
  const revenueReady = IMMEDIATE_CALENDAR_REVENUE.has(annualRevenue)
  const budgetReady = IMMEDIATE_CALENDAR_BUDGET.has(monthlyBudget)

  if (revenueReady && budgetReady) {
    return {
      path: 'calendar',
      tag: 'fit-good',
      summary:
        'Annual revenue is at least $500K and the stated monthly marketing budget is at least $3K.',
    }
  }

  const gaps = [
    !revenueReady ? 'annual revenue is below $500K or was not provided' : '',
    !budgetReady ? 'monthly marketing budget is below $3K or was not provided' : '',
  ].filter(Boolean)

  return {
    path: 'investment-context',
    tag: 'investment-confirmation-required',
    summary: `Show investment context first because ${gaps.join(' and ')}. The prospect may still continue to the calendar.`,
  }
}

