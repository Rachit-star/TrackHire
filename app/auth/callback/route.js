import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  let response = NextResponse.redirect(new URL('/dashboard', request.url))

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          }
        }
      }
    )

    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.session?.provider_token) {
  await supabase
    .from('user_tokens')
    .upsert({
      user_id: data.session.user.id,
      access_token: data.session.provider_token,
      refresh_token: data.session.provider_refresh_token
    }, {
      onConflict: 'user_id'
    })
}
  }

  return response
}