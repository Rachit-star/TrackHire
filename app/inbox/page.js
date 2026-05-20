import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import styles from './inbox.module.css'
import InboxClient from './InboxClient'

export default async function Inbox() {
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

  const { data: { user } } = await supabase.auth.getUser()

  const { data: tokenData } = await supabase
    .from('user_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  
  const accessToken = tokenData?.access_token

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inbox</h1>
      <p className={styles.subtitle}>AI scans your Gmail for recruiter emails</p>
      <InboxClient
        accessToken={accessToken}
        userId={user.id}
      />
    </div>
  )
}