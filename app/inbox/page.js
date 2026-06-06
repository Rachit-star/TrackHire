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
    .select('user_id')
    .eq('user_id', user.id)
    .single()


  const hasToken = !!tokenData

  return (
    <div className={styles.container}>
      
      <InboxClient
        hasToken={hasToken}
      />
    </div>
  )
}