'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'
import AddApplicationForm from '../components/AddApplicationForm'
import styles from './applications.module.css'

function getDaysWaiting(dateApplied) {
  const start = new Date(dateApplied)
  const today = new Date()
  const diff = today - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getUrgency(days) {
  if (days < 30) return 'low'
  if (days < 60) return 'medium'
  return 'high'
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
      
      {/* Ambient Engine to sync with the Dashboard vibe */}
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      {/* Wrap the form in a matching glass container */}
      <div className={styles.formWrapper}>
        <AddApplicationForm onAdd={handleAdd} />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Platform</th>
              <th>Date Applied</th>
              <th>Days Waiting</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications && applications.length > 0 ? applications.map((app) => {
              const days = getDaysWaiting(app.date_applied);
              const urgency = getUrgency(days);
              
              return (
                <tr key={app.id}>
                  <td className={styles.fontBold}>{app.company}</td>
                  <td>{app.role}</td>
                  <td className={styles.fontMuted}>{app.platform}</td>
                  <td className={styles.fontMuted}>{app.date_applied}</td>
                  
                  {/* Dynamic coloring handled cleanly via data attributes */}
                  <td className={styles.daysWaiting} data-urgency={urgency}>
                    {days} days
                  </td>
                  
                  <td>
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
                  
                  <td>
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
                <td colSpan="7" className={styles.emptyState}>
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