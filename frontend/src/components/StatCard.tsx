import type { ReactNode } from 'react'
import type { DashboardIcon } from './icons.tsx'
import styles from './StatCard.module.css'

type StatCardProps = {
  label: string
  value: ReactNode
  /** Small line under the value — trend, breakdown, whatever fits. */
  meta?: ReactNode
  icon: typeof DashboardIcon
  /** 0–1. Renders a thin amber progress track when set. */
  progress?: number
}

export function StatCard({ label, value, meta, icon: Icon, progress }: StatCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon size={16} />
        </span>
      </header>

      <p className={styles.value}>{value}</p>

      {progress === undefined ? null : (
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${clampPercent(progress)}%` }}
          />
        </div>
      )}

      {meta ? <p className={styles.meta}>{meta}</p> : null}
    </article>
  )
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 1) * 100
}
