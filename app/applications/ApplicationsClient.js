'use client'

import { useRouter } from 'next/navigation'
import AddApplicationForm from '../components/AddApplicationForm'

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

export default function ApplicationsClient({ applications, styles }) {
  const router = useRouter()

  function handleAdd() {
    router.refresh()
  }

  return (
    <>
      <AddApplicationForm onAdd={handleAdd} />
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Platform</th>
            <th>Date Applied</th>
            <th>Days Waiting</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications && applications.map((app) => (
            <tr key={app.id}>
              <td>{app.company}</td>
              <td>{app.role}</td>
              <td>{app.platform}</td>
              <td>{app.date_applied}</td>
              <td style={{ color: getDaysColor(getDaysWaiting(app.date_applied)) }}>
                {getDaysWaiting(app.date_applied)} days
              </td>
              <td>
                <span style={{
                  backgroundColor: getStatusColor(app.status),
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {app.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {applications && applications.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
          No applications yet. Add your first one!
        </p>
      )}
    </>
  )
}