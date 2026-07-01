'use client'

import { useState } from 'react'
import styles from './insights.module.css'

export default function AIAnalysis({ applications }) {
  const [analysis, setAnalysis] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function handleGenerate() {
    setLoading(true)

    const res = await fetch('/api/insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applications })
    })

    const data = await res.json()
    setAnalysis(data.analysis || 'Could not generate analysis.')
    setGenerated(true)
    setLoading(false)
  }

  return (
    <div className={styles.aiSection}>
      <h2 className={styles.sectionTitle}>AI Analysis</h2>

      {!generated && (
        <button
          className={styles.aiBtn}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Analyzing your data...' : 'Generate Analysis'}
        </button>
      )}

      {generated && (
        <div className={styles.aiCard}>
          <div className={styles.aiIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            </svg>
          </div>
          <p className={styles.aiText}>{analysis}</p>
        </div>
      )}
    </div>
  )
}