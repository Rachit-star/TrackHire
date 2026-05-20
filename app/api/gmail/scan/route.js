async function getValidToken(accessToken, userId) {
  const testRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/profile',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (testRes.ok) return accessToken

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: tokenData } = await supabase
    .from('user_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single()

  if (!tokenData?.refresh_token) return null

  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token'
    })
  })

  const refreshData = await refreshRes.json()
  if (!refreshData.access_token) return null

  await supabase
    .from('user_tokens')
    .update({ access_token: refreshData.access_token })
    .eq('user_id', userId)

  return refreshData.access_token
}

export async function POST(request) {
  const { accessToken, userId } = await request.json()

  if (!accessToken || !userId) {
    return Response.json({ error: 'No access token' }, { status: 401 })
  }

  const validToken = await getValidToken(accessToken, userId)
  if (!validToken) {
    return Response.json({ error: 'Token refresh failed' }, { status: 401 })
  }

  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=subject:(interview OR application OR offer OR rejected OR hiring OR internship OR selected OR congratulations)',
    {
      headers: {
        Authorization: `Bearer ${validToken}`
      }
    }
  )

  const listData = await listRes.json()

  if (!listData.messages) {
    return Response.json({ emails: [] })
  }

  const emails = await Promise.all(
    listData.messages.map(async (msg) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        {
          headers: {
            Authorization: `Bearer ${validToken}`
          }
        }
      )
      const msgData = await msgRes.json()

      const headers = msgData.payload?.headers || []
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject'
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown'

      return {
        id: msg.id,
        subject,
        from,
        snippet: msgData.snippet
      }
    })
  )

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          content: `You are an email classifier for a job application tracker.
          You will receive a JSON array of emails.
          Classify each one and return a JSON object with a "results" array.
          Each result must have:
          {
            "index": number,
            "relevant": true or false,
            "classification": "interview_invite" or "rejection" or "offer" or "application_confirmation" or "follow_up_needed" or "irrelevant",
            "company": "company name or null",
            "action": "what the user should do next or null"
          }
          relevant means it is a direct personal response from a company about a job application.
          Mark newsletters, job alerts, and promotional emails as irrelevant.`
        },
        {
          role: 'user',
          content: JSON.stringify(emails.map((email, index) => ({
            index,
            subject: email.subject,
            from: email.from,
            snippet: email.snippet
          })))
        }
      ],
      response_format: { type: 'json_object' }
    })
  })

  const groqData = await groqRes.json()

  if (!groqData.choices || groqData.choices.length === 0) {
    console.log('Groq error:', JSON.stringify(groqData))
    return Response.json({ emails: [] })
  }

  const groqResult = JSON.parse(groqData.choices[0].message.content)
  const results = groqResult.results || []

  const classified = emails.map((email, index) => {
    const result = results.find(r => r.index === index) || {}
    return {
      ...email,
      relevant: result.relevant || false,
      classification: result.classification || 'irrelevant',
      company: result.company || null,
      action: result.action || null
    }
  })

  const relevantEmails = classified.filter(e => e.relevant)

  if (relevantEmails.length > 0) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: applications } = await supabase
      .from('applications')
      .select('id, company, role')
      .eq('user_id', userId)

    if (applications && applications.length > 0) {
      for (const email of relevantEmails) {
        if (!email.classification) continue

        const statusMap = {
          'interview_invite': 'Interviewing',
          'rejection': 'Rejected',
          'offer': 'Offer',
          'application_confirmation': 'Applied'
        }

        const newStatus = statusMap[email.classification]
        if (!newStatus) continue

        const matchRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                content: `You are helping match a recruiter email to a job application in a tracker.
                Given an email and a list of applications, find which application this email is about.
                Return ONLY a JSON object like this:
                {
                  "matched_id": "the id of the matching application or null",
                  "reasoning": "why you chose this match"
                }
                If no application matches, return null for matched_id.`
              },
              {
                role: 'user',
                content: `Email:
Subject: ${email.subject}
From: ${email.from}
Snippet: ${email.snippet}

Applications in tracker:
${JSON.stringify(applications.map(a => ({ id: a.id, company: a.company, role: a.role })))}`
              }
            ],
            response_format: { type: 'json_object' }
          })
        })

        const matchData = await matchRes.json()
        if (!matchData.choices || matchData.choices.length === 0) continue

        const matchResult = JSON.parse(matchData.choices[0].message.content)

        if (matchResult.matched_id) {
          await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', matchResult.matched_id)
        }
      }
    }
  }

  return Response.json({ emails: relevantEmails })
}