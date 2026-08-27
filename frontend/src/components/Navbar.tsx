import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon } from './icons.tsx'
import styles from './Navbar.module.css'

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className={styles.navbar}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <MenuIcon size={19} />
      </button>

      <a href="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          N
        </span>
        <span className={styles.brandText}>
          Noru
          <span className={styles.brandSub}>Staff</span>
        </span>
      </a>

      <div className={styles.search}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search employees, departments…"
          aria-label="Search"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <BellIcon size={19} />
          <span className={styles.dot} aria-hidden="true" />
        </button>

        <button type="button" className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            AS
          </span>
          <span className={styles.userMeta}>
            <span className={styles.userName}>Asher Samuel</span>
            <span className={styles.userRole}>Administrator</span>
          </span>
          <ChevronDownIcon size={15} className={styles.userChevron} />
        </button>
      </div>
    </header>
  )
}
