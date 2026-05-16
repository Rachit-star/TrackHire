import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import styles from './dashboard.module.css'

export default async function Dashboard() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        }
      }
    }
  )

  const { data: applications } = await supabase
    .from('applications')
    .select('*')

  const total = applications?.length || 0
  const interviewing = applications?.filter(a => a.status === 'Interviewing').length || 0
  const rejected = applications?.filter(a => a.status === 'Rejected').length || 0
  const offers = applications?.filter(a => a.status === 'Offer').length || 0
  const waiting = applications?.filter(a => {
    const days = Math.floor((new Date() - new Date(a.date_applied)) / (1000 * 60 * 60 * 24))
    return days > 30 && a.status === 'Applied'
  }).length || 0

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.label}>Total Applied</p>
          <p className={styles.number}>{total}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Interviewing</p>
          <p className={styles.number} style={{ color: '#FF9800' }}>{interviewing}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Rejected</p>
          <p className={styles.number} style={{ color: '#f44336' }}>{rejected}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Offers</p>
          <p className={styles.number} style={{ color: '#4CAF50' }}>{offers}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Waiting 30+ days</p>
          <p className={styles.number} style={{ color: '#f44336' }}>{waiting}</p>
        </div>
      </div>
    </div>
  )
}