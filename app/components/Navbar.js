import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className={styles.logo}>TrackHire</Link>
      <div className={styles.links}>
        <Link href="/dashboard" className={styles.link}>Dashboard</Link>
        <Link href="/applications" className={styles.link}>Applications</Link>
        <Link href="/inbox" className={styles.link}>Inbox</Link>
        <Link href="/insights" className={styles.link}>Insights</Link>
        <Link href="/alerts" className={styles.link}>Alerts</Link>
      </div>
    </nav>
  )
}