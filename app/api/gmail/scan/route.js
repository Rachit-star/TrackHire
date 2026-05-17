export async function POST(request) {
  const { accessToken } = await request.json()

  if (!accessToken) {
    return Response.json({ error: 'No access token' }, { status: 401 })
  }

  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=subject:(interview OR application OR offer OR rejected OR hiring OR internship OR selected OR congratulations)',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  const listData = await listRes.json()
  console.log('Gmail list:', JSON.stringify(listData))

  if (!listData.messages) {
    return Response.json({ emails: [] })
  }

  const emails = await Promise.all(
    listData.messages.map(async (msg) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
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

  const classified = await Promise.all(
    emails.map(async (email) => {
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
              Analyze the email and respond ONLY with a JSON object like this:
              {
                "relevant": true or false,
                "classification": "interview_invite" or "rejection" or "offer" or "application_confirmation" or "follow_up_needed" or "irrelevant",
                "company": "company name or null",
                "action": "what the user should do next or null"
              }
              relevant means it is a direct response from a company about a job application.
              Mark newsletters, job alerts, and promotional emails as irrelevant.`
            },
            {
              role: 'user',
              content: `Subject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      })

      const groqData = await groqRes.json()
      const result = JSON.parse(groqData.choices[0].message.content)

      return {
        ...email,
        relevant: result.relevant,
        classification: result.classification,
        company: result.company,
        action: result.action
      }
    })
  )

  const relevantEmails = classified.filter(e => e.relevant)
  return Response.json({ emails: relevantEmails })
}