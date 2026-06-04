import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import styles from './insights.module.css'
import AIAnalysis from './AIAnalysis'

function getDaysWaiting(dateApplied) {
  const start = new Date(dateApplied)
  const today = new Date()
  if (start > today) return 0
  const diff = today - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default async function Insights() {
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

  const { data: applications } = await supabase.from('applications').select('*')

  const total = applications?.length || 0
  const responded = applications?.filter(a =>
    a.status === 'Interviewing' || a.status === 'Offer' || a.status === 'Rejected'
  ).length || 0
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  const avgDays = total > 0
    ? Math.round(applications.reduce((sum, a) => sum + getDaysWaiting(a.date_applied), 0) / total)
    : 0

  const platforms = {}
  applications?.forEach(app => {
    if (!platforms[app.platform]) {
      platforms[app.platform] = { total: 0, responded: 0 }
    }
    platforms[app.platform].total++
    if (app.status !== 'Applied') {
      platforms[app.platform].responded++
    }
  })

  const platformStats = Object.entries(platforms).map(([name, data]) => ({
    name,
    total: data.total,
    responseRate: Math.round((data.responded / data.total) * 100)
  })).sort((a, b) => b.responseRate - a.responseRate)

  return (
    <div className={styles.container}>
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>Insights</h1>
        <p className={styles.subtitle}>Telemetry and pipeline performance</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Response Rate</span>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.number} data-status={responseRate > 30 ? "good" : "bad"}>
              {responseRate}%
            </p>
            <p className={styles.sub}>{responded} out of {total} applications</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Average Wait Time</span>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.number}>{avgDays}</p>
            <p className={styles.sub}>days per application</p>
          </div>
        </div>
      </div>

      <div className={styles.platformSection}>
        <h2 className={styles.sectionTitle}>Platform Performance</h2>
        <div className={styles.list}>
          {platformStats.map((platform) => (
            <div key={platform.name} className={styles.platformCard}>
              <div className={styles.platformInfo}>
                <p className={styles.platformName}>{platform.name}</p>
                <p className={styles.platformSub}>{platform.total} applications</p>
              </div>
              <div className={styles.rateBadge} data-status={platform.responseRate > 30 ? "good" : "bad"}>
                {platform.responseRate}% response
              </div>
            </div>
          ))}
          {platformStats.length === 0 && (
            <div className={styles.emptyState}>
              <p>Add more applications to see platform insights</p>
            </div>
          )}
        </div>
      </div>

      <AIAnalysis applications={applications || []} />

    </div>
  )
}