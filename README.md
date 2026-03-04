# 📋 Weekly Narrative Report Builder

A clean, frontend-only web app for building and exporting weekly narrative reports as PDF. Built with React + Vite — no backend, no database, deployable to Vercel in seconds.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Built with](https://img.shields.io/badge/built%20with-React%20%2B%20Vite-61dafb.svg)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black.svg)

---

## ✨ Features

- **Multiple weeks & days** — add as many weeks as your internship/project needs
- **Holiday support** — mark days as holidays, hours auto-zero
- **Live calculations** — total hours, avg per day, avg per week, cumulative
- **Daily log** — tasks, experiences, and reflections per day
- **Weekly summaries** — summary, challenges, skills improved, lessons learned
- **Export Full PDF** — complete report with every day and every detail
- **Export Summary PDF** — hours breakdown table + weekly summaries only
- **No backend needed** — everything runs in the browser via jsPDF

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run Locally

```bash
# Clone the repo
git clone https://github.com/N3RO-O/weekly-report-builder.git
cd weekly-report-builder

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## ☁️ Deploy to Vercel

**Option 1 — CLI**
```bash
npm install -g vercel
vercel deploy
```

**Option 2 — GitHub Integration (recommended)**
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import `weekly-report-builder` from GitHub
4. Vercel auto-detects Vite — hit **Deploy**

Every `git push` to `main` auto-deploys. No config needed.

---

## 🗂️ Project Structure

```
weekly-report-builder/
├── src/
│   ├── App.jsx        # Main application
│   └── main.jsx       # React entry point
├── index.html
├── vite.config.js
├── vercel.json        # Vercel deployment config
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 |
| Bundler | Vite 5 |
| PDF Export | jsPDF (CDN, no install) |
| Styling | Inline styles + Google Fonts |
| Deployment | Vercel |

---

## 📄 License

MIT © 2026 [Nero](https://github.com/N3RO-O)
