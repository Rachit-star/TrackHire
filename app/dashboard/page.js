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
        getAll() { return cookieStore.getAll() }
      }
    }
  )

  const { data: applications } = await supabase.from('applications').select('*')
  const { data: aiEvents } = await supabase
    .from('ai_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const apps = applications || []
  const events = aiEvents || []

  const total = apps.length
  const active = apps.filter(a => a.status === 'Applied' || a.status === 'Interviewing').length
  const offers = apps.filter(a => a.status === 'Offer').length
  const responseRate = total > 0 ? Math.round(((apps.filter(a => a.status !== 'Applied').length) / total) * 100) : 0

  const actionItems = apps.filter(a => {
    if (a.status === 'Interviewing') return true
    if (a.status === 'Applied') {
      const days = Math.floor((new Date() - new Date(a.date_applied)) / (1000 * 60 * 60 * 24))
      return days > 21
    }
    return false
  }).slice(0, 4)

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied))
    .slice(0, 5)

  function getClassificationLabel(classification) {
    const labels = {
      'interview_invite': 'Interview Invite',
      'rejection': 'Rejection',
      'offer': 'Offer',
      'application_confirmation': 'Confirmed'
    }
    return labels[classification] || classification
  }

  function getEventColor(classification) {
    const colors = {
      'interview_invite': '#FF5500',
      'rejection': '#DC2626',
      'offer': '#059669',
      'application_confirmation': '#3B82F6'
    }
    return colors[classification] || '#64748B'
  }

  return (
    <div className={styles.container}>
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      <div className={styles.vitalsRow}>
        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Total Tracked</span>
          <span className={styles.vitalNumber}>{total}</span>
        </div>
        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Active Pipelines</span>
          <span className={styles.vitalNumber} style={{ color: '#FF5500' }}>{active}</span>
        </div>
        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Offers Secured</span>
          <span className={styles.vitalNumber} style={{ color: '#059669' }}>{offers}</span>
        </div>
        <div className={styles.vitalCard}>
          <span className={styles.vitalLabel}>Response Rate</span>
          <span className={styles.vitalNumber}>{responseRate}%</span>
        </div>
      </div>

      <div className={styles.mainGrid}>

        {/* LEFT: AI Scanner Activity */}
        <div className={`${styles.glassPanel} ${styles.feedPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Recent Scanner Activity</div>
          </div>

          <div className={styles.listContainer}>
            {events.length > 0 ? events.map((event, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.itemMain}>
                  <span className={styles.itemCompany}>{event.company}</span>
                  <span className={styles.itemDate}>
                    {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span
                  className={styles.itemStatus}
                  style={{ color: getEventColor(event.classification) }}
                >
                  {getClassificationLabel(event.classification)} → {event.status_updated_to}
                </span>
              </div>
            )) : (
              <div>
                <p className={styles.emptyState}>No AI activity yet.</p>
                <p className={styles.emptyStateSub}>Scan your Gmail inbox to let AI detect recruiter emails.</p>
                {recentApps.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    {recentApps.map((app, i) => (
                      <div key={i} className={styles.listItem}>
                        <div className={styles.itemMain}>
                          <span className={styles.itemCompany}>{app.company}</span>
                          <span className={styles.itemDate}>
                            {new Date(app.date_applied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span className={styles.itemStatus} data-status={app.status}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Action Required */}
        <div className={`${styles.glassPanel} ${styles.actionPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Attention Required</div>
          </div>

          <div className={styles.listContainer}>
            {actionItems.length > 0 ? actionItems.map((app, i) => (
              <div key={i} className={styles.actionItem}>
                <span className={styles.actionCompany}>{app.company || 'Unknown'}</span>
                <span className={styles.actionReason}>
                  {app.status === 'Interviewing' ? 'Prep required' : 'Stagnant pipeline'}
                </span>
              </div>
            )) : (
              <p className={styles.emptyState}>All clear. No pending actions.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}