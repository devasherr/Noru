/**
 * Mirrors `db.ListEmployeesRow` from the Go server.
 *
 * Every `pgtype.*` field marshals to a plain JSON value or `null` (pgx v5
 * implements MarshalJSON on each of them), so nullable columns are `T | null`
 * here rather than `{ String, Valid }` wrappers.
 */
export type Employee = {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  /** `YYYY-MM-DD` */
  hire_date: string | null
  is_active: boolean
  department_id: number | null
  department_name: string | null
  role_id: number | null
  role_title: string | null
  /** RFC3339 */
  created_at: string | null
  updated_at: string | null
}

/** Shape of `GET /employees`. */
export type EmployeeListResponse = {
  data: Employee[]
  limit: number
  offset: number
}

export function fullName(employee: Employee): string {
  return `${employee.first_name} ${employee.last_name}`.trim()
}

export function initials(employee: Employee): string {
  const first = employee.first_name.trim().charAt(0)
  const last = employee.last_name.trim().charAt(0)
  return (first + last).toUpperCase() || '?'
}
