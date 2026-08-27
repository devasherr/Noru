import {
  BadgeIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  DashboardIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from './icons.tsx'
import styles from './Sidebar.module.css'

type NavItem = {
  key: string
  label: string
  href: string
  icon: typeof DashboardIcon
  badge?: string
}

const PRIMARY: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: DashboardIcon },
  { key: 'employees', label: 'Employees', href: '/employees', icon: UsersIcon },
  { key: 'departments', label: 'Departments', href: '/departments', icon: BuildingIcon },
  { key: 'roles', label: 'Roles', href: '/roles', icon: BadgeIcon },
]

const SCHEDULING: NavItem[] = [
  { key: 'shifts', label: 'Shifts', href: '/shifts', icon: ClockIcon },
  { key: 'attendance', label: 'Attendance', href: '/attendance', icon: CalendarIcon },
]

/**
 * Hardcoded until there's a router. Once react-router is in, swap the `<a>`
 * elements below for `<NavLink>` and drop this constant — `NavLink` sets the
 * active class itself.
 */
const ACTIVE_KEY = 'dashboard'

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={styles.sidebar}
      data-collapsed={collapsed}
      aria-label="Main navigation"
    >
      <div className={styles.top}>
        <button type="button" className={styles.newButton} title="Add employee">
          <PlusIcon size={16} />
          <span className={styles.buttonLabel}>Add employee</span>
        </button>
      </div>

      <nav className={styles.nav}>
        <Section items={PRIMARY} />
        <p className={styles.sectionLabel}>Scheduling</p>
        <Section items={SCHEDULING} />
      </nav>

      <div className={styles.footer}>
        <a href="/settings" className={styles.item} title="Settings">
          <SettingsIcon size={18} className={styles.itemIcon} />
          <span className={styles.itemLabel}>Settings</span>
        </a>
      </div>
    </aside>
  )
}

function Section({ items }: { items: NavItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map(({ key, label, href, icon: ItemIcon, badge }) => {
        const active = key === ACTIVE_KEY
        return (
          <li key={key}>
            <a
              href={href}
              className={styles.item}
              title={label}
              aria-current={active ? 'page' : undefined}
            >
              <ItemIcon size={18} className={styles.itemIcon} />
              <span className={styles.itemLabel}>{label}</span>
              {badge ? <span className={styles.badge}>{badge}</span> : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
