import type { Employee, EmployeeListResponse } from '../types/employee.ts'

/**
 * Requests go to `/api/*` and Vite's dev server proxies them to the Go server
 * on :7777, stripping the prefix. See `vite.config.ts`.
 */
const BASE = '/api'

/** `maxLimit` on the server is 200. */
const MAX_LIMIT = 200

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(BASE + path, {
      headers: { Accept: 'application/json' },
      ...init,
    })
  } catch {
    // fetch only rejects on network-level failures, not on 4xx/5xx.
    throw new ApiError('Could not reach the API server.', 0)
  }

  if (!response.ok) {
    throw new ApiError(
      (await errorMessage(response)) ?? `Request failed (${response.status}).`,
      response.status,
    )
  }

  return (await response.json()) as T
}

/** The Go handlers return `{ "error": "..." }` on failure. */
async function errorMessage(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'error' in body) {
      const detail = (body as { error: unknown }).error
      if (typeof detail === 'string' && detail !== '') return detail
    }
  } catch {
    // Non-JSON body — fall back to the caller's generic message.
  }
  return null
}

export async function fetchEmployees(limit = MAX_LIMIT): Promise<Employee[]> {
  const capped = Math.min(Math.max(limit, 1), MAX_LIMIT)
  const body = await request<EmployeeListResponse>(
    `/employees?limit=${capped}&offset=0`,
  )
  return body.data ?? []
}
