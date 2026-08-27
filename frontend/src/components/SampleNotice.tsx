import { AlertIcon } from './icons.tsx'
import styles from './SampleNotice.module.css'

/** Standing reminder that the roster on screen did not come from the API. */
export function SampleNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <p className={styles.notice}>
      <AlertIcon size={15} />
      Showing sample data — not from your API.
      <button type="button" className={styles.button} onClick={onRetry}>
        Try the API again
      </button>
    </p>
  )
}
