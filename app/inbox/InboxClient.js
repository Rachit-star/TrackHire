'use client'

import { useState } from 'react'
import styles from './inbox.module.css'

export default function InboxClient({ accessToken }) {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)

  async function handleScan() {
    setLoading(true)
    const res = await fetch('/api/gmail/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    })
    const data = await res.json()
    setEmails(data.emails || [])
    setScanned(true)
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={handleScan}
        disabled={loading}
        style={{
          backgroundColor: '#FF6B00',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '24px'
        }}
      >
        {loading ? 'Scanning...' : 'Scan Gmail'}
      </button>

      {scanned && emails.length === 0 && (
        <p style={{ color: '#888' }}>No recruiter emails found.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {emails.map((email, index) => (
          <div key={index} style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '16px 20px',
            borderLeft: '4px solid #FF6B00'
          }}>
            <p style={{ color: '#f5f5f5', fontWeight: '600', marginBottom: '4px' }}>
              {email.subject}
            </p>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
              From: {email.from}
            </p>
            <p style={{ color: '#aaa', fontSize: '13px' }}>{email.snippet}</p>
            {email.classification && (
              <span style={{
                backgroundColor: '#FF6B00',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                marginTop: '8px',
                display: 'inline-block'
              }}>
                {email.classification}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}