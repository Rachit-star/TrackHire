import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import styles from './applications.module.css'
import ApplicationsClient from './ApplicationsClient'



export default async function Applications() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        }
      }
    }
  )

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .order('date_applied', { ascending: false })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Applications</h1>
      </div>
      <ApplicationsClient
  applications={applications}
  styles={styles}
/>
    </div>
  )
}