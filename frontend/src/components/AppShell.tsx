import { useCallback, useState, type ReactNode } from 'react'
import { Navbar } from './Navbar.tsx'
import { Sidebar } from './Sidebar.tsx'
import styles from './AppShell.module.css'

const MOBILE = '(max-width: 900px)'

/**
 * Owns the one piece of chrome state the navbar and sidebar share.
 *
 * `collapsed` means two different things by breakpoint, which keeps it to a
 * single flag: on desktop it narrows the sidebar to an icon rail, on mobile it
 * hides the off-canvas drawer entirely. Initialising it from the viewport
 * therefore gives the right default in both cases — full sidebar on desktop,
 * closed drawer on mobile.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(isMobile)

  // Following a link on mobile should close the drawer behind you. On desktop
  // the rail is persistent, so leave it alone.
  const handleNavigate = useCallback(() => {
    if (isMobile()) setCollapsed(true)
  }, [])

  return (
    <div className={styles.shell} data-collapsed={collapsed}>
      <Navbar onToggleSidebar={() => setCollapsed((value) => !value)} />
      <Sidebar collapsed={collapsed} onNavigate={handleNavigate} />
      <button
        type="button"
        className={styles.scrim}
        aria-label="Close navigation"
        tabIndex={collapsed ? -1 : 0}
        onClick={() => setCollapsed(true)}
      />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}

function isMobile(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE).matches
}
