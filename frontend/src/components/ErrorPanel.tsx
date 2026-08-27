import { AlertIcon } from './icons.tsx'
import styles from './ErrorPanel.module.css'

/**
 * Shown when a fetch fails. `onSample` is what lets the user opt into the
 * stand-in roster — nothing loads it implicitly.
 */
export function ErrorPanel({
  title = 'Couldn’t load employees',
  message,
  onRetry,
  onSample,
}: {
  title?: string
  message: string
  onRetry: () => void
  onSample: () => void
}) {
  return (
    <section className={styles.error}>
      <span className={styles.icon} aria-hidden="true">
        <AlertIcon size={17} />
      </span>
      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.text}>{message}</p>
        <p className={styles.hint}>
          Start the Go server from <code>server/</code> so it’s listening on{' '}
          <code>:7777</code>, then retry.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={onRetry}>
            Retry
          </button>
          <button type="button" className={styles.ghostButton} onClick={onSample}>
            Load sample data
          </button>
        </div>
      </div>
    </section>
  )
}
