import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import styles from './alerts.module.css'

// LOGIC UNTOUCHED
function getDaysWaiting(dateApplied) {
  const start = new Date(dateApplied)
  const today = new Date()
  if (start > today) return 0
  const diff = today - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default async function Alerts() {
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

  const alerts = []

  // LOGIC UNTOUCHED
  applications?.forEach(app => {
    const days = getDaysWaiting(app.date_applied)

    if (days > 30 && app.status === 'Applied') {
      alerts.push({
        id: app.id,
        type: 'followup',
        message: `You've been waiting ${days} days on ${app.company} — consider following up`,
        company: app.company,
        urgency: days > 60 ? 'high' : 'medium'
      })
    }

    if (app.status === 'Interviewing') {
      alerts.push({
        id: `interview-${app.id}`,
        type: 'interview',
        message: `You have an active interview process with ${app.company} — stay prepared`,
        company: app.company,
        urgency: 'medium'
      })
    }
  })

  return (
    <div className={styles.container}>
      
      {/* Signature Background Vibe */}
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>Alerts</h1>
      </div>

      <div className={styles.feedContainer}>
        {alerts.length === 0 && (
          <div className={styles.emptyState}>
            <p>No alerts right now — you're on top of things!</p>
          </div>
        )}
        
        <div className={styles.list}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={styles.card}
              data-urgency={alert.urgency}
            >
              <p className={styles.message}>{alert.message}</p>
              <span className={styles.companyBadge}>{alert.company}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}