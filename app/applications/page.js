import styles from './applications.module.css'

function getDaysWaiting(dateApplied) {
  const start = new Date(dateApplied)
  const today = new Date()
  const diff = today - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))


}

function getDaysColor(days) {
  if (days < 30) return '#4CAF50'   // green
  if (days < 60) return '#FF9800'   // yellow/orange
  return '#f44336'                   // red
}

function getStatusColor(status) {
  if (status === 'Applied') return '#2196F3'      // blue
  if (status === 'Interviewing') return '#FF9800'  // orange
  if (status === 'Rejected') return '#f44336'      // red
  if (status === 'Offer') return '#4CAF50'         // green
  return '#888'                                     // grey fallback
}

const applications = [
  {
    id: 1,
    company: "Zoho",
    role: "Web Dev",
    platform: "Careers Site",
    date_applied: "2026-01-20",
    status: "Interviewing"
  },
  {
    id: 2,
    company: "Infosys Instep",
    role: "Web Dev",
    platform: "Instep Portal",
    date_applied: "2026-04-20",
    status: "Applied"
  },
  {
    id: 3,
    company: "IAS Fellowship",
    role: "Research Intern",
    platform: "Web Portal",
    date_applied: "2026-01-20",
    status: "Offer"
  },
  {
    id:4,
    company:"TOSH",
    role: "Web Dev",
    platform: "Seniors",
    date_applied:"2026-05-04",
    status:"Offer"
  }
]

export default function Applications() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Applications</h1>
      </div>
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
          {applications.map((app) => (
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
    </div>
  )
}