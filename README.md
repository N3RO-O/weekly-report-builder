# Weekly Narrative Report Builder

Build, manage, and export weekly narrative reports as PDF — fully frontend, no backend needed.

## Features
- Add unlimited weeks and days
- Mark holidays (auto-zeroes hours)
- Live hour calculations (total, avg/day, avg/week)
- Export Full Report PDF — all weeks, daily logs, summaries
- Export Summary PDF — hours table + weekly summaries only

## Deploy to Vercel (3 steps)

```bash
# 1. Install dependencies
npm install

# 2. Test locally
npm run dev

# 3. Deploy
npx vercel deploy
```

Or connect the repo to Vercel dashboard — it auto-detects Vite.

## Tech
- React 18 + Vite
- jsPDF (loaded from CDN, no install needed)
- Zero backend, zero database
