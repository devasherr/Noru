import { useMemo } from 'react'
import { EmployeeTable } from '../components/EmployeeTable.tsx'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { SampleNotice } from '../components/SampleNotice.tsx'
import { CardSkeleton, TableSkeleton } from '../components/Skeleton.tsx'
import { StatCard } from '../components/StatCard.tsx'
import {
  BadgeIcon,
  BuildingIcon,
  CalendarIcon,
  UsersIcon,
} from '../components/icons.tsx'
import { useEmployees } from '../hooks/useEmployees.ts'
import { isoDaysAgo } from '../lib/date.ts'
import { NO_EMPLOYEES, type Employee } from '../types/employee.ts'
import styles from './Dashboard.module.css'

export function Dashboard() {
  const { state, reload, loadSample } = useEmployees()
  const employees = state.status === 'ready' ? state.employees : NO_EMPLOYEES
  const stats = useMemo(() => summarise(employees), [employees])

  return (
    <>
      <PageHeader title="Dashboard" subtitle={todayLabel()} />

      {state.status === 'ready' && state.source === 'sample' ? (
        <SampleNotice onRetry={reload} />
      ) : null}

      {state.status === 'error' ? (
        <ErrorPanel message={state.message} onRetry={reload} onSample={loadSample} />
      ) : null}

      <div className={styles.stats}>
        {state.status === 'loading' ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total employees"
              value={stats.total}
              icon={UsersIcon}
              meta={
                stats.recentHires > 0 ? (
                  <>
                    <strong>+{stats.recentHires}</strong> hired in the last 30 days
                  </>
                ) : (
                  'No new hires in the last 30 days'
                )
              }
            />
            <StatCard
              label="Active staff"
              value={stats.active}
              icon={CalendarIcon}
              progress={stats.activeRatio}
              meta={
                <>
                  <strong>{Math.round(stats.activeRatio * 100)}%</strong> of headcount
                  {stats.inactive > 0 ? ` · ${stats.inactive} inactive` : null}
                </>
              }
            />
            <StatCard
              label="Departments"
              value={stats.departments}
              icon={BuildingIcon}
              meta={
                stats.largestDepartment ? (
                  <>
                    Largest is <strong>{stats.largestDepartment.name}</strong> with{' '}
                    {stats.largestDepartment.count}
                  </>
                ) : (
                  'No departments assigned yet'
                )
              }
            />
            <StatCard
              label="Roles filled"
              value={stats.roles}
              icon={BadgeIcon}
              meta={
                stats.withoutRole > 0 ? (
                  <>
                    <strong>{stats.withoutRole}</strong>{' '}
                    {stats.withoutRole === 1 ? 'employee has' : 'employees have'} no role
                  </>
                ) : (
                  'Every employee has a role'
                )
              }
            />
          </>
        )}
      </div>

      {state.status === 'loading' ? (
        <TableSkeleton />
      ) : (
        <EmployeeTable employees={employees} />
      )}
    </>
  )
}

type Summary = {
  total: number
  active: number
  inactive: number
  activeRatio: number
  departments: number
  roles: number
  recentHires: number
  withoutRole: number
  largestDepartment: { name: string; count: number } | null
}

function summarise(employees: Employee[]): Summary {
  const cutoff = isoDaysAgo(30)
  const departmentCounts = new Map<string, number>()
  const roles = new Set<string>()

  let active = 0
  let recentHires = 0
  let withoutRole = 0

  for (const employee of employees) {
    if (employee.is_active) active += 1
    // ISO dates sort lexicographically, so a plain string compare works here.
    if (employee.hire_date && employee.hire_date >= cutoff) recentHires += 1

    if (employee.role_title) roles.add(employee.role_title)
    else withoutRole += 1

    if (employee.department_name) {
      const name = employee.department_name
      departmentCounts.set(name, (departmentCounts.get(name) ?? 0) + 1)
    }
  }

  let largestDepartment: Summary['largestDepartment'] = null
  for (const [name, count] of departmentCounts) {
    if (!largestDepartment || count > largestDepartment.count) {
      largestDepartment = { name, count }
    }
  }

  return {
    total: employees.length,
    active,
    inactive: employees.length - active,
    activeRatio: employees.length === 0 ? 0 : active / employees.length,
    departments: departmentCounts.size,
    roles: roles.size,
    recentHires,
    withoutRole,
    largestDepartment,
  }
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
