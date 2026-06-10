# KOVA Demo — Vercel Deploy Guide

## Deploy in 5 Steps

1. **Unzip** this folder
2. **Push to GitHub** (new repo)
3. **Go to vercel.com** → New Project → Import your repo
4. **Set environment variable:**
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
5. **Click Deploy** — live in ~2 minutes

## What's Live at Your URL

- `/` → redirects to dashboard
- `/dashboard` → Full CRM (contacts, pipeline, AI scoring)  
- `/onboard` → Atlas AI onboarding agent

## Local Dev

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
# Open http://localhost:3000
```

## How the AI Works

Three Next.js API routes call Claude:
- `POST /api/score` — scores a contact live
- `POST /api/report` — generates weekly briefing
- `POST /api/personalize` — rewrites outreach messages
- `POST /api/atlas` — powers the onboarding agent

All require `ANTHROPIC_API_KEY` in your environment.
