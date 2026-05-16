export async function POST(request) {
  const { accessToken } = await request.json()

  if (!accessToken) {
    return Response.json({ error: 'No access token' }, { status: 401 })
  }

  // Fetch emails from Gmail API
  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=subject:(interview OR application OR offer OR rejected OR hiring)',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  const listData = await listRes.json()

  if (!listData.messages) {
    return Response.json({ emails: [] })
  }

  // Fetch details for each email
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

  return Response.json({ emails })
}