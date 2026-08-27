import { useMemo, useState } from 'react'
import { formatDate } from '../lib/date.ts'
import { fullName, initials, type Employee } from '../types/employee.ts'
import { SearchIcon } from './icons.tsx'
import styles from './EmployeeTable.module.css'

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return employees
    return employees.filter((employee) =>
      [
        fullName(employee),
        employee.email,
        employee.phone,
        employee.department_name,
        employee.role_title,
      ]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(needle)),
    )
  }, [employees, query])

  return (
    <section className={styles.panel}>
      <header className={styles.head}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>All employees</h2>
          <span className={styles.count}>{visible.length}</span>
        </div>

        <div className={styles.search}>
          <SearchIcon size={15} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Filter by name, department, role…"
            aria-label="Filter employees"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col">Role</th>
              <th scope="col">Hired</th>
              <th scope="col" className={styles.statusCol}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <div className={styles.person}>
                    <span className={styles.avatar} aria-hidden="true">
                      {initials(employee)}
                    </span>
                    <span className={styles.personMeta}>
                      <span className={styles.personName}>{fullName(employee)}</span>
                      <span className={styles.personContact}>
                        {employee.email ?? employee.phone ?? '—'}
                      </span>
                    </span>
                  </div>
                </td>
                <td>{employee.department_name ?? <Unassigned />}</td>
                <td>{employee.role_title ?? <Unassigned />}</td>
                <td className={styles.numeric}>{formatDate(employee.hire_date)}</td>
                <td className={styles.statusCol}>
                  <StatusPill active={employee.is_active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 ? (
          <p className={styles.empty}>
            {employees.length === 0
              ? 'No employees yet.'
              : `No employees match “${query.trim()}”.`}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function Unassigned() {
  return <span className={styles.unassigned}>Unassigned</span>
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={styles.pill} data-active={active}>
      <span className={styles.pillDot} aria-hidden="true" />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
