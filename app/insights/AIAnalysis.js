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
          {loading ? 'Analyzing your data...' : '✦ Generate Analysis'}
        </button>
      )}

      {generated && (
        <div className={styles.aiCard}>
          <div className={styles.aiIcon}>✦</div>
          <p className={styles.aiText}>{analysis}</p>
        </div>
      )}
    </div>
  )
}