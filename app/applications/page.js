import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import styles from './applications.module.css'
import ApplicationsClient from './ApplicationsClient'

function getDaysWaiting(dateApplied) {
  const start = new Date(dateApplied)
  const today = new Date()
  const diff = today - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getDaysColor(days) {
  if (days < 30) return '#4CAF50'
  if (days < 60) return '#FF9800'
  return '#f44336'
}

function getStatusColor(status) {
  if (status === 'Applied') return '#2196F3'
  if (status === 'Interviewing') return '#FF9800'
  if (status === 'Rejected') return '#f44336'
  if (status === 'Offer') return '#4CAF50'
  return '#888'
}

export default async function Applications() {
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
    .order('date_applied', { ascending: false })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Applications</h1>
      </div>
      <ApplicationsClient
  applications={applications}
  styles={styles}
/>
    </div>
  )
}