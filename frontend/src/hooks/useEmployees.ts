import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchEmployees } from '../lib/api.ts'
import { sampleEmployees } from '../lib/sampleEmployees.ts'
import type { Employee } from '../types/employee.ts'

export type EmployeesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; employees: Employee[]; source: 'api' | 'sample' }

/**
 * Loads the roster from the API. A failure surfaces as an error state — the
 * sample roster is only ever shown when the user explicitly asks for it via
 * `loadSample`, so a broken backend can never look like real data.
 */
export function useEmployees() {
  const [state, setState] = useState<EmployeesState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [useSample, setUseSample] = useState(false)

  useEffect(() => {
    // The sample roster is set by `loadSample` itself, so there's nothing to
    // fetch here.
    if (useSample) return

    let active = true

    fetchEmployees()
      .then((employees) => {
        if (active) setState({ status: 'ready', employees, source: 'api' })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: describe(error) })
      })

    return () => {
      active = false
    }
  }, [attempt, useSample])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setUseSample(false)
    setAttempt((value) => value + 1)
  }, [])

  const loadSample = useCallback(() => {
    setUseSample(true)
    setState({ status: 'ready', employees: sampleEmployees, source: 'sample' })
  }, [])

  return { state, reload, loadSample }
}

function describe(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong loading employees.'
}
