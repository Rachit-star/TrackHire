'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import styles from './AddApplicationForm.module.css'

export default function AddApplicationForm({ onAdd }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [platform, setPlatform] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('applications').insert({
      user_id: user.id,
      company,
      role,
      platform,
      date_applied: dateApplied,
      status: 'Applied'
    })

    setCompany('')
    setRole('')
    setPlatform('')
    setDateApplied('')
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
        placeholder="Platform (LinkedIn, Instep etc)"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        required
      />
      <input
        className={styles.input}
        type="date"
        value={dateApplied}
        onChange={(e) => setDateApplied(e.target.value)}
        required
      />
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Application'}
      </button>
    </form>
  )
}