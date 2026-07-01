'use client'

import { useRef } from 'react'
import { createClient } from './lib/supabase'
import styles from './page.module.css'

export default function Home() {
  const supabase = createClient()
  const magnetRef = useRef(null)

  const handleMouseMove = (e) => {
    const btn = magnetRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    btn.style.transform = `translate(${distanceX * 0.35}px, ${distanceY * 0.35}px)`
  }

  const handleMouseLeave = () => {
    const btn = magnetRef.current
    if (!btn) return
    btn.style.transform = `translate(0px, 0px)`
  }

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/gmail.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  }

  return (
    <div className={styles.page}>
      
      {/* Background Drift Layer */}
      <div className={styles.driftingGlyphs}></div>

      {/* Structural Geometry */}
      <div className={styles.gridLineV}></div>
      <div className={styles.gridLineH}></div>

      <main className={styles.interfaceLayout}>
        
        <div className={styles.leftPanel}>
          <h1 className={styles.heroTitle}>
            Your internship hunt,<br />
            <span className={styles.heroOrange}>on autopilot.</span>
          </h1>
          
          <p className={styles.heroSub}>
            TrackHire runs a continuous background scanner over your Gmail, classifying recruiter emails 
            with secure AI models and instantly updating your application pipelines.
          </p>

          <div 
            className={styles.magnetHitbox}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              ref={magnetRef}
              className={styles.ctaBtn} 
              onClick={signInWithGoogle}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="currentColor"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="currentColor" opacity=".85"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="currentColor" opacity=".7"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="currentColor" opacity=".75"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.chassisSlot}>
            <div className={styles.slotGlowOrange}></div>
            <div className={styles.slotMeta}>
              <span className={styles.slotId}>Infosys</span>
              <span className={styles.slotTimestamp}>31 days ago</span>
            </div>
            <div className={styles.statusControl}>
              <div className={styles.hardwareLedOrange}></div>
              <span className={styles.statusTextOrange}>Interviewing</span>
            </div>
          </div>

          <div className={styles.chassisSlot}>
            <div className={styles.slotGlowGreen}></div>
            <div className={styles.slotMeta}>
              <span className={styles.slotId}>Shikha Lab</span>
              <span className={styles.slotTimestamp}>48 days ago</span>
            </div>
            <div className={styles.statusControl}>
              <div className={styles.hardwareLedGreen}></div>
              <span className={styles.statusTextGreen}>Offer Received</span>
            </div>
          </div>

          <div className={styles.chassisSlot}>
            <div className={styles.slotMeta}>
              <span className={styles.slotId}>Zoho</span>
              <span className={styles.slotTimestamp}>113 days ago</span>
            </div>
            <div className={styles.statusControl}>
              <div className={styles.hardwareLedGrey}></div>
              <span className={styles.statusTextGrey}>Applied</span>
            </div>
          </div>
        </div>

      </main>

     <div className={styles.accessFooter}>
        <p className={styles.accessText}>
          App is in Google verification.{' '}
          <a href="mailto:trackhire.access@gmail.com" className={styles.accessLink}>
            Request access →
          </a>
        </p>
      </div>

    </div>
  )
}