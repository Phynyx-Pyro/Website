'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AssessmentPrefill = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type AssessmentPrefillContextValue = {
  prefill: AssessmentPrefill | null
  stagePrefill: (value: AssessmentPrefill) => void
  clearPrefill: () => void
}

const AssessmentPrefillContext =
  createContext<AssessmentPrefillContextValue | null>(null)

export function AssessmentPrefillProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<AssessmentPrefill | null>(null)
  const stagePrefill = useCallback((value: AssessmentPrefill) => {
    setPrefill(value)
  }, [])
  const clearPrefill = useCallback(() => setPrefill(null), [])

  useEffect(() => {
    if (!prefill) return

    const timeout = window.setTimeout(clearPrefill, 60_000)
    return () => window.clearTimeout(timeout)
  }, [clearPrefill, prefill])

  const value = useMemo(
    () => ({ prefill, stagePrefill, clearPrefill }),
    [clearPrefill, prefill, stagePrefill],
  )

  return (
    <AssessmentPrefillContext.Provider value={value}>
      {children}
    </AssessmentPrefillContext.Provider>
  )
}

export function useAssessmentPrefill() {
  const context = useContext(AssessmentPrefillContext)
  if (!context) {
    throw new Error('useAssessmentPrefill must be used inside AssessmentPrefillProvider')
  }
  return context
}
