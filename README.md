# TrackHire

> Your internship hunt, on autopilot.

TrackHire is a full-stack internship application tracker that automatically scans your Gmail using AI, classifies recruiter emails, and updates your application pipeline — with zero manual input.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Groq](https://img.shields.io/badge/Groq-LLM-orange?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-deployed-black?style=flat-square&logo=vercel)

**Live:** [track-hire-blush.vercel.app](https://track-hire-blush.vercel.app)

> App is in Google OAuth verification. To request access, email trackhire.access@gmail.com

---

## What it does

- **Scans Gmail automatically** every day at 8:30am IST via a cron job
- **Classifies recruiter emails** — interview invites, rejections, offers, confirmations
- **Updates application status** automatically when a match is found in your tracker
- **Auto-creates new entries** when a recruiter email doesn't match any existing application — extracting company, role, and platform directly from the email
- **Deduplicates** every scan so the same email is never processed twice
- **Alerts you** when applications have gone stagnant or interviews need prep
- **AI insights** on your application pipeline performance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, CSS Modules |
| Backend | Next.js API Routes (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth 2.0 via Supabase SSR |
| AI | Groq API — `llama-3.1-8b-instant` |
| Email | Gmail API (readonly scope) |
| Cron | cron-job.org (daily at 03:00 UTC) |
| Deployment | Vercel |

---

## Architecture

User logs in with Google OAuth
↓
Access + refresh tokens saved to Supabase
↓
Daily cron (cron-job.org) triggers /api/cron/scan
↓
For each user:

Validate/refresh Gmail token
Fetch last 30 days of emails (filtered)
Skip already-processed email IDs (deduplication)
Groq LLM classifies new emails → interview_invite / rejection / offer / irrelevant
For relevant emails → second LLM call matches email to application in tracker
If matched → update application status
If unmatched → auto-create new application entry from extracted data
Log event to ai_events table
↓
Dashboard shows real-time scanner activity

---

## Features

### Gmail Scanner
Fetches emails from the last 30 days, filtered to exclude promotions, social, and updates categories. Uses a two-stage LLM pipeline — first to classify, then to match or extract.

### Smart Deduplication
Every processed Gmail message ID is stored per-user in Supabase. Subsequent scans skip already-seen emails, preventing duplicate entries and redundant LLM calls.

### Auto-Create Flow
When a recruiter email is found but no matching application exists in the tracker, TrackHire automatically creates one — using the company name, role, and platform extracted directly from the email by the LLM.

### Token Management
Gmail OAuth tokens are stored server-side only and never exposed to the client. Expired access tokens are automatically refreshed using the stored refresh token before each scan.

### Application Table
Full CRUD with inline status updates — Applied, Interviewing, Offer, Rejected. Tracks days waiting per application with urgency color coding.

### Alerts
Rule-based alerts for stagnant pipelines (>21 days with no response) and active interview processes.

### AI Insights
On-demand analysis of your application pipeline using Groq — response rates by platform, average wait times, and actionable advice.

---

## Database Schema

```sql
-- User Gmail tokens
user_tokens (
  id, user_id, access_token, refresh_token, processed_email_ids[]
)

-- Application tracker
applications (
  id, user_id, company, role, platform,
  date_applied, status, notes, link
)

-- AI scanner activity log
ai_events (
  id, user_id, company, email_subject,
  classification, status_updated_to, created_at
)
```

---

## Local Setup

```bash
git clone https://github.com/Rachit-star/TrackHire.git
cd trackhire
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=your_cron_secret
```

```bash
npm run dev
```

---

## Cron Job

The daily scan is triggered by [cron-job.org](https://cron-job.org) at 03:00 UTC (08:30 IST) via:

GET /api/cron/scan
Authorization: Bearer <CRON_SECRET>


The endpoint scans Gmail for all registered users, classifies emails, updates statuses, and logs activity — all server-side with no user interaction required.

---

## Known Limitations

- App is in Google OAuth testing mode — new users need to request access
- Gmail readonly scope required — users must grant permission on first login
- Classifier occasionally produces false positives on non-tech company emails (bank notifications, platform digests)

---

## Built by

**Rachit** —  CSE student at Manipal University Jaipur

[GitHub](https://github.com/Rachit-star)
