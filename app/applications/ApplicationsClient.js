'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'
import AddApplicationForm from '../components/AddApplicationForm'
import styles from './applications.module.css'

function getDaysWaiting(dateApplied) {
  const start = new Date(dateApplied)
  const today = new Date()
  if (start > today) return 0
  const diff = today - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getUrgency(days) {
  if (days < 30) return 'low'
  if (days < 60) return 'medium'
  return 'high'
}

function formatDate(dateApplied) {
  return new Date(dateApplied).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function ApplicationsClient({ applications }) {
  const router = useRouter()

  function handleAdd() {
    router.refresh()
  }

  async function handleDelete(id) {
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', id)
    router.refresh()
  }

  async function handleStatusChange(id, newStatus) {
    const supabase = createClient()
    await supabase.from('applications').update({ status: newStatus }).eq('id', id)
    router.refresh()
  }

  return (
    <div className={styles.container}>
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      <div className={styles.formWrapper}>
        <AddApplicationForm onAdd={handleAdd} />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.companyCol}>Company</th>
              <th className={styles.roleCol}>Role</th>
              <th className={styles.platformCol}>Platform</th>
              <th className={styles.dateCol}>Date Applied</th>
              <th className={styles.daysCol}>Days Waiting</th>
              <th className={styles.statusCol}>Status</th>
              <th className={styles.notesCol}>Notes</th>
              <th className={styles.linkCol}>Link</th>
              <th className={styles.actionCol}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications && applications.length > 0 ? applications.map((app) => {
              const days = getDaysWaiting(app.date_applied)
              const urgency = getUrgency(days)

              return (
                <tr key={app.id}>
                  <td className={`${styles.fontBold} ${styles.companyCol}`}>{app.company}</td>
                  <td className={styles.roleCol}>{app.role}</td>
                  <td className={`${styles.fontMuted} ${styles.platformCol}`}>{app.platform}</td>
                  <td className={`${styles.fontMuted} ${styles.dateCol}`}>{formatDate(app.date_applied)}</td>
                  <td className={`${styles.daysWaiting} ${styles.daysCol}`} data-urgency={urgency}>
                    {days} days
                  </td>
                  <td className={styles.statusCol}>
                    <select
                      className={styles.statusSelect}
                      data-status={app.status}
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offer">Offer</option>
                    </select>
                  </td>
                  <td className={`${styles.notesCell} ${styles.notesCol}`}>
                    <div className={styles.notesContent}>
                      {app.notes || '—'}
                    </div>
                  </td>
                  <td className={styles.linkCol}>
                    {app.link ? (
                      <a href={app.link} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                        View
                      </a>
                    ) : (
                      <span className={styles.fontMuted}>—</span>
                    )}
                  </td>
                  
                  <td className={styles.actionCol}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(app.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="9" className={styles.emptyState}>
                  No applications yet. Add your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}