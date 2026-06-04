'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import styles from './AddApplicationForm.module.css'

export default function AddApplicationForm({ onAdd }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [platform, setPlatform] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [notes, setNotes] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const selectedDate = new Date(dateApplied)
    const today = new Date()
    const minDate = new Date('2000-01-01')

    if (selectedDate > today) {
      setError('Date applied cannot be in the future')
      return
    }

    if (selectedDate < minDate) {
      setError('Please enter a valid date')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('applications').insert({
      user_id: user.id,
      company,
      role,
      platform,
      date_applied: dateApplied,
      status: 'Applied',
      notes: notes || null,
      link: link || null
    })

    setCompany('')
    setRole('')
    setPlatform('')
    setDateApplied('')
    setNotes('')
    setLink('')
    setLoading(false)
    onAdd()
  }

 return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        required
      />
      <input
        className={styles.input}
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      />
      <input
        className={styles.input}
        placeholder="Platform"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        required
      />
      <input
        className={styles.input}
        type="date"
        value={dateApplied}
        min="2000-01-01"
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setDateApplied(e.target.value)}
        required
      />
      <input
        className={styles.input}
        placeholder="Job link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <input
        className={styles.input}
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  )
}