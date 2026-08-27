const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * `2024-03-12` -> `12 Mar 2024`.
 *
 * Parsed by hand rather than via `new Date(iso)`, which reads a bare date as
 * UTC midnight and then shifts it a day backwards when formatted in any
 * negative-offset timezone.
 */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day || month < 1 || month > 12) return '—'
  return `${day} ${MONTHS[month - 1]} ${year}`
}

/** Today as `YYYY-MM-DD`, in the viewer's local timezone. */
export function today(): string {
  return toIsoDate(new Date())
}

/** `YYYY-MM-DD` for `days` before today, in the viewer's local timezone. */
export function isoDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toIsoDate(date)
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
