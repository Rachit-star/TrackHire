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

  // Safely default to empty array
  const apps = applications || []

  // Vitals
  const total = apps.length
  const active = apps.filter(a => a.status === 'Applied' || a.status === 'Interviewing').length
  const offers = apps.filter(a => a.status === 'Offer').length
  const responseRate = total > 0 ? Math.round(((apps.filter(a => a.status !== 'Applied').length) / total) * 100) : 0

  // Top 5 Recent Activities (Sorted by newest first)
  const recentApps = [...apps]
    .sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied))
    .slice(0, 5)

  // Action Required (Interviews OR Stagnant > 21 days)
  const actionItems = apps.filter(a => {
    if (a.status === 'Interviewing') return true;
    if (a.status === 'Applied') {
      const days = Math.floor((new Date() - new Date(a.date_applied)) / (1000 * 60 * 60 * 24));
      return days > 21;
    }
    return false;
  }).slice(0, 4)

  return (
    <div className={styles.container}>
      
      {/* Earphone Vibe: Ambient Orange Glow on Silver */}
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      {/* TOP ROW: Compact Vitals */}
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

      {/* MAIN CONTENT */}
      <div className={styles.mainGrid}>
        
        {/* LEFT: Recent Scanner Activity */}
        <div className={`${styles.glassPanel} ${styles.feedPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Recent Scanner Activity</div>
            {/* Removed the pulsing dot and LIVE text */}
          </div>
          
          <div className={styles.listContainer}>
            {recentApps.length > 0 ? recentApps.map((app, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.itemMain}>
                  <span className={styles.itemCompany}>{app.company || 'Unknown Company'}</span>
                  <span className={styles.itemDate}>
                    {new Date(app.date_applied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className={styles.itemStatus} data-status={app.status}>
                  {app.status}
                </span>
              </div>
            )) : (
              <p className={styles.emptyState}>No applications tracked yet. Scanner standing by.</p>
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