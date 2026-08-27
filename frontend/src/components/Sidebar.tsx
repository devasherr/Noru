import { NavLink } from 'react-router-dom'
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
  to: string
  icon: typeof DashboardIcon
  badge?: string
}

const PRIMARY: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/', icon: DashboardIcon },
  { key: 'employees', label: 'Employees', to: '/employees', icon: UsersIcon },
  { key: 'departments', label: 'Departments', to: '/departments', icon: BuildingIcon },
  { key: 'roles', label: 'Roles', to: '/roles', icon: BadgeIcon },
]

const SCHEDULING: NavItem[] = [
  { key: 'shifts', label: 'Shifts', to: '/shifts', icon: ClockIcon },
  { key: 'attendance', label: 'Attendance', to: '/attendance', icon: CalendarIcon },
]

export function Sidebar({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate: () => void
}) {
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
        <Section items={PRIMARY} onNavigate={onNavigate} />
        <p className={styles.sectionLabel}>Scheduling</p>
        <Section items={SCHEDULING} onNavigate={onNavigate} />
      </nav>

      <div className={styles.footer}>
        <NavLink
          to="/settings"
          className={styles.item}
          title="Settings"
          onClick={onNavigate}
        >
          <SettingsIcon size={18} className={styles.itemIcon} />
          <span className={styles.itemLabel}>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}

function Section({
  items,
  onNavigate,
}: {
  items: NavItem[]
  onNavigate: () => void
}) {
  return (
    <ul className={styles.list}>
      {items.map(({ key, label, to, icon: ItemIcon, badge }) => (
        <li key={key}>
          {/* NavLink sets aria-current="page" itself, which is what the active
              styling in Sidebar.module.css hangs off. `end` keeps "/" from
              matching every route. */}
          <NavLink
            to={to}
            end={to === '/'}
            className={styles.item}
            title={label}
            onClick={onNavigate}
          >
            <ItemIcon size={18} className={styles.itemIcon} />
            <span className={styles.itemLabel}>{label}</span>
            {badge ? <span className={styles.badge}>{badge}</span> : null}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
