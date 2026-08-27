import { PageHeader } from '../components/PageHeader.tsx'
import styles from './Placeholder.module.css'

/**
 * Landing spot for sidebar links whose pages aren't built yet, so navigating
 * to one shows something deliberate instead of an empty main area.
 */
export function Placeholder({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <section className={styles.panel}>
        <p className={styles.title}>Not built yet</p>
        <p className={styles.text}>
          This page is next up. The API routes behind it already exist on the Go
          server.
        </p>
      </section>
    </>
  )
}
