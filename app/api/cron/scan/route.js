import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: tokens } = await supabase
    .from('user_tokens')
    .select('user_id, access_token')

  if (!tokens || tokens.length === 0) {
    return Response.json({ message: 'No users to scan' })
  }

  const results = []

  for (const token of tokens) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/gmail/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token.access_token,
          userId: token.user_id
        })
      })
      const data = await res.json()
      results.push({ userId: token.user_id, emails: data.emails?.length || 0 })
    } catch (err) {
      results.push({ userId: token.user_id, error: err.message })
    }
  }

  return Response.json({ scanned: results })
}