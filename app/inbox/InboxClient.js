'use client'

import { useState } from 'react'
import styles from './inbox.module.css'

export default function InboxClient({ accessToken, userId }) {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)

  async function handleScan() {
    setLoading(true)
    try {
      const res = await fetch('/api/gmail/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, userId })
      })
      const data = await res.json()
      setEmails(data.emails || [])
      setScanned(true)
    } catch (error) {
      console.error("Scan failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      
      <div className={styles.ambientOrange}></div>
      <div className={styles.driftingGlyphs}></div>

      <div className={styles.header}>
        <h1 className={styles.title}>Inbox</h1>
        <p className={styles.subtitle}>AI scans your Gmail for recruiter emails</p>
      </div>

      <div className={styles.actionRow}>
        <button
          onClick={handleScan}
          disabled={loading}
          className={`${styles.scanBtn} ${loading ? styles.loadingBtn : ''}`}
        >
          {loading ? 'Scanning Network...' : 'Scan Gmail'}
        </button>
      </div>

      <div className={styles.feedContainer}>
        
        {/* UPDATED: The Idle / Standby State with Static Mail Icon */}
        {!scanned && !loading && (
          <div className={styles.idleState}>
            <div className={styles.mailIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m2 4 10 8 10-8"></path>
              </svg>
            </div>
            <p>Scanner on standby.<br/>Click 'Scan Gmail' to intercept new recruiter communications.</p>
          </div>
        )}

        {/* The "No Results" State after scanning */}
        {scanned && emails.length === 0 && (
          <div className={styles.emptyState}>
            <p>No recruiter emails found.</p>
          </div>
        )}

        {/* The Email List */}
        <div className={styles.emailList}>
          {emails.map((email, index) => (
            <div key={index} className={styles.emailCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.subject}>{email.subject}</h3>
                {email.classification && (
                  <span className={styles.badge} data-type={email.classification}>
                    {email.classification}
                  </span>
                )}
              </div>
              
              <p className={styles.sender}>From: {email.from}</p>
              <p className={styles.snippet}>{email.snippet}</p>
              
              {email.action && (
                <div className={styles.actionBox}>
                  <span className={styles.actionIcon}>💡</span> {email.action}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}