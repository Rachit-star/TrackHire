import { createServerClient } from '@supabase/ssr'

export async function POST(request) {
  // Authenticate the user from session cookies
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {}
      }
    }
  )

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { applications } = await request.json()

  if (!applications || applications.length < 2) {
    return Response.json({ analysis: 'Add more applications to get AI analysis.' })
  }

  const summary = {
    total: applications.length,
    byStatus: {},
    byPlatform: {},
    roles: []
  }

  applications.forEach(app => {
    summary.byStatus[app.status] = (summary.byStatus[app.status] || 0) + 1
    summary.byPlatform[app.platform] = (summary.byPlatform[app.platform] || 0) + 1
    if (app.role) summary.roles.push(app.role)
  })

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a job search advisor analyzing a student's internship application data.
            Give honest, specific, actionable advice in 3-4 sentences.
            Be direct and practical. No fluff. Focus on what they should do differently.
            Plain paragraph text only — no bullet points, no headers.`
          },
          {
            role: 'user',
            content: `My internship application data: ${JSON.stringify(summary)}.
            What patterns do you see and what should I do to improve my chances?`
          }
        ]
      })
    })

    const data = await res.json()
    return Response.json({ analysis: data.choices?.[0]?.message?.content || null })
  } catch {
    return Response.json({ analysis: null })
  }
}