'use client'

import { createClient } from './lib/supabase'
import styles from './page.module.css'

export default function Home() {
  const supabase = createClient()

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/gmail.readonly'
      }
    })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>TrackHire</h1>
      <p className={styles.subtitle}>Stop losing track of your internship applications</p>
      <button className={styles.button} onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  )
}