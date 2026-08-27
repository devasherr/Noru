import { EmployeeTable } from '../components/EmployeeTable.tsx'
import { ErrorPanel } from '../components/ErrorPanel.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { SampleNotice } from '../components/SampleNotice.tsx'
import { TableSkeleton } from '../components/Skeleton.tsx'
import { useEmployees } from '../hooks/useEmployees.ts'
import { NO_EMPLOYEES } from '../types/employee.ts'

export function Employees() {
  const { state, reload, loadSample } = useEmployees()
  const employees = state.status === 'ready' ? state.employees : NO_EMPLOYEES

  return (
    <>
      <PageHeader title="Employees" subtitle={subtitle(state.status, employees.length)} />

      {state.status === 'ready' && state.source === 'sample' ? (
        <SampleNotice onRetry={reload} />
      ) : null}

      {state.status === 'error' ? (
        <ErrorPanel message={state.message} onRetry={reload} onSample={loadSample} />
      ) : null}

      {state.status === 'loading' ? (
        <TableSkeleton />
      ) : (
        <EmployeeTable employees={employees} />
      )}
    </>
  )
}

function subtitle(status: string, count: number): string {
  if (status === 'loading') return 'Loading the roster…'
  if (status === 'error') return 'The roster is unavailable'
  return count === 1 ? '1 person on the roster' : `${count} people on the roster`
}
