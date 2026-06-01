<div align="center">

# Nexus JEE

**An AI-powered cognitive tutoring suite for JEE Mains aspirants.**

Master Physics & Chemistry with personalized AI scaffolding, concept-ladder learning, spaced repetition, full-length mock tests, and a rich analytics dashboard — wrapped in a fast, installable PWA.

[Live Demo](https://jee-helper.vercel.app) · [Report Bug](https://github.com/anomalyco/Nexus_JEE/issues) · [Request Feature](https://github.com/anomalyco/Nexus_JEE/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Highlights](#highlights)
- [Feature Tour](#feature-tour)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
  - [Frontend on Vercel](#frontend-on-vercel)
  - [Backend on Render](#backend-on-render)
  - [Google OAuth Setup](#google-oauth-setup)
- [Free Tier Caveats](#free-tier-caveats)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

**Nexus JEE** is a self-hosted, end-to-end JEE Mains preparation platform built around the principle of *cognitive scaffolding*: instead of throwing questions at the learner, the system meets them at their current level, diagnoses misconceptions, and offers tiered, on-demand hints powered by any OpenAI-compatible LLM.

The product is engineered for one student at a time but architected for scale — a fully async Python backend, an offline-capable PWA frontend, and a content pipeline that can render bespoke Manim animations for any physics or chemistry concept.

## Highlights

- **Adaptive AI Scaffolding** — 5-tier hint system that responds to your mistakes, not just your answers.
- **Concept Ladder** — Prerequisite-aware learning path; unlock chapters only when foundations are solid.
- **Spaced Repetition (SM-2)** — Revisions engine that schedules reviews at scientifically optimal intervals.
- **Full-Length Mock Tests** — Timed, scored, and gated; weekly test + on-demand practice.
- **Daily Challenges** — Streak-protected micro-missions with XP, achievements, and confetti.
- **Statistics Heatmap** — Recharts-powered activity heatmap, weekly trends, and per-chapter mastery.
- **Manim Animations** — Bespoke visual explanations for difficult concepts (kinematics, electrostatics, organic mechanisms).
- **Offline-First PWA** — Installable, cache-aware, with background sync for offline attempts.
- **Bring-Your-Own-Key (BYOK)** — Users supply their own OpenRouter / OpenAI key; the server proxies and rate-limits.
- **Zero-Cost Stack** — Runs end-to-end on Vercel + Render free tiers with SQLite-on-disk persistence.

## Feature Tour

| Module | What it does |
| --- | --- |
| **Study** | Question phase → scaffold phase → review phase with hints, misconceptions, and deep explanations |
| **Daily Challenge** | 5 questions a day, mood-aware difficulty, streak and XP rewards |
| **Revisions** | SM-2 spaced repetition queue, due-soon sorting, retention stats |
| **Mock Tests** | Gated 90-minute simulations, percentile scoring, post-test analysis |
| **Syllabus** | Chapter-by-chapter progress, concept mastery heatmap, unlock prerequisites |
| **Stats** | Activity heatmap, weekly trends, accuracy by topic, time-on-task analytics |
| **Formula Sheet** | Searchable, KaTeX-rendered formulas per chapter |
| **Animations** | Manim-rendered concept visuals (Newton's laws, SHM, redox titrations, etc.) |
| **Achievements** | 50+ unlockable badges for streaks, accuracy, and exploration milestones |
| **Settings** | Theme, API key, sync controls, account management, password reset |

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Framer Motion 12 for micro-interactions
- React Router 6 with code-split routes
- Recharts for analytics
- KaTeX for math rendering
- `vite-plugin-pwa` for installable, offline-capable shell
- `canvas-confetti` for reward moments

**Backend**
- FastAPI 0.115 (async) + Uvicorn / Gunicorn workers
- aiosqlite (async SQLite) with aiosqlite-native connection pooling
- PyJWT for stateless auth
- bcrypt for password hashing
- cryptography (Fernet) for encrypting user-supplied AI keys at rest
- httpx as the OpenAI/OpenRouter proxy client
- python-multipart for OAuth code-exchange

**Content Pipeline**
- Manim Community Edition — programmable math/physics/chemistry animations
- Hand-curated JEE Mains syllabus (Physics + Chemistry)

**DevOps**
- Vercel (frontend) + Render free tier (backend)
- GitHub for source control
- `render.yaml` for one-click Render blueprint deployment

## Architecture

```
┌────────────────────┐       HTTPS        ┌──────────────────────┐
│  React 19 PWA      │ ◀───────────────▶  │  FastAPI (async)     │
│  (Vercel / CDN)    │   JWT + REST       │  (Render free tier)  │
│                    │                    │                      │
│  • Local cache     │                    │  • aiosqlite (disk)  │
│  • Background sync │                    │  • Fernet key vault  │
│  • Service Worker  │                    │  • OpenRouter proxy  │
└────────┬───────────┘                    └──────────┬───────────┘
         │                                           │
         │  PWA assets                               │  Outbound
         ▼                                           ▼
   ┌──────────┐                                ┌─────────────┐
   │ IndexedDB│                                │ OpenRouter  │
   │ / Cache  │                                │  / OpenAI   │
   └──────────┘                                └─────────────┘
```

The frontend persists study sessions in IndexedDB and reconciles with the backend via a debounced `syncManager`. The backend stores per-user progress in SQLite, encrypts API keys with Fernet, and proxies LLM calls so user keys never leave the server boundary.

## Repository Layout

```
Nexus_JEE/
├── backend/                # FastAPI service
│   ├── main.py             # App factory, CORS, lifespan
│   ├── auth.py             # Password hashing + JWT helpers
│   ├── database.py         # aiosqlite connection pool
│   ├── models.py           # Pydantic schemas
│   ├── dependencies.py     # Shared FastAPI deps
│   ├── proxy.py            # OpenRouter / OpenAI proxy
│   ├── mailer.py           # SMTP for password reset
│   ├── migrations/         # Schema migrations
│   ├── routers/            # Feature-scoped API routes
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── progress.py
│   │   ├── concepts.py
│   │   ├── sessions.py
│   │   ├── streak.py
│   │   ├── xp.py
│   │   ├── mistakes.py
│   │   ├── bookmarks.py
│   │   ├── notes.py
│   │   ├── achievements.py
│   │   ├── weekly.py
│   │   ├── ai_config.py
│   │   ├── ai_proxy.py
│   │   ├── daily_challenge.py
│   │   ├── gate_attempts.py
│   │   └── migration.py
│   └── requirements.txt
├── manim/                  # Animation render pipeline
│   ├── physics/  chemistry/  maths/
│   ├── shared/             # Reusable Manim components
│   └── render_all.py       # Batch renderer
├── src/                    # React frontend
│   ├── App.tsx             # Router shell + error boundary
│   ├── components/         # 25+ presentational + container components
│   ├── pages/              # Route-level views
│   ├── data/               # Static curriculum data (chapters, formulas, achievements)
│   ├── services/           # API client, auth, sync manager
│   ├── types/              # Shared TS types
│   └── utils/              # Storage, SM-2, analytics, notifications, errors
├── public/                 # PWA icons, favicon
├── index.html              # Preloader + meta tags
├── vite.config.js          # Vite + PWA plugin config
├── tailwind.config.js      # Tailwind 4 (via @tailwindcss/vite)
├── eslint.config.js        # ESLint flat config
├── render.yaml             # Render blueprint
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** 20.19+ and npm
- **Python** 3.11+
- A Google Cloud project (for OAuth — optional but recommended)
- An OpenRouter / OpenAI API key (BYOK; required only for AI scaffolding)

### Frontend Setup

```bash
# Install deps (legacy peer deps required for React 19 ecosystem)
npm install --legacy-peer-deps

# Copy the env template
cp .env.example .env   # then fill in your keys

# Start the dev server
npm run dev            # http://localhost:5173
```

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate

# Install Python deps
pip install -r requirements.txt

# Generate the required secrets
export JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(64))")
export FERNET_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Run the API
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, and interactive docs at `http://localhost:8000/docs`.

## Environment Variables

### Frontend (`.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes (prod) | Backend URL, e.g. `https://nexus-jee-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | For OAuth | Google OAuth client ID |
| `VITE_OPENROUTER_KEY` | No | Dev-only fallback; not used in production (BYOK) |

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Secret for signing JWTs (generate with `secrets.token_urlsafe(64)`) |
| `FERNET_KEY` | Yes | Key for encrypting user AI keys (generate with `Fernet.generate_key()`) |
| `DATABASE_PATH` | No | Defaults to `backend/nexus_jee.db` |
| `FRONTEND_ORIGIN` | Yes (prod) | Production frontend URL for CORS |
| `VITE_GOOGLE_CLIENT_ID` | For OAuth | Same value as frontend, used for token verification |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` | No | For password reset emails |

## Deployment

### Frontend on Vercel

1. Sign in to [vercel.com](https://vercel.com) with GitHub.
2. Import this repository.
3. Vercel auto-detects **Vite**; framework preset is fine.
4. Build command: `npm run build` · Output: `dist`.
5. Set environment variables:
   - `VITE_API_URL` → your Render backend URL
   - `VITE_GOOGLE_CLIENT_ID` → your Google OAuth client ID
   - **Do not** set `VITE_OPENROUTER_KEY` in production — users bring their own.

### Backend on Render

1. Sign in to [render.com](https://render.com) (no card required for the free tier).
2. New → **Blueprint** → connect this repo — `render.yaml` is pre-configured.
   - *Or* create a Web Service manually: root `backend`, build `pip install -r requirements.txt`, start `gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT --timeout 120`.
3. Attach a 1GB persistent disk at `/opt/render/project/src/data`.
4. Set environment variables:
   - `DATABASE_PATH` = `/opt/render/project/src/data/nexus_jee.db`
   - `JWT_SECRET` (auto-generated by blueprint)
   - `FERNET_KEY` (auto-generated by blueprint)
   - `FRONTEND_ORIGIN` = your Vercel URL
   - `VITE_GOOGLE_CLIENT_ID`
5. Deploy.

### Google OAuth Setup

1. Open [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create / edit an OAuth 2.0 Client ID of type **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (development)
   - `https://your-prod.vercel.app` (production)
4. Copy the client ID into both `VITE_GOOGLE_CLIENT_ID` (frontend) and the backend env.

## Free Tier Caveats

Running on free tiers has trade-offs worth knowing:

- **Render free spins down after 15 minutes of idle.** The first request after sleep takes 30-50 seconds — consider a cron ping or upgrade to the $7/mo plan for production.
- **512MB RAM on Render free tier.** Comfortable for solo-to-small-group use, tight at scale.
- **SQLite on a single persistent disk** — no replication, single region. Migrate to Postgres before going public.
- **No auto-scaling** — single instance. Run a load test before promising uptime.
- **Vercel free** has generous limits for a SPA PWA, but heavy PWA asset caching can edge the bandwidth cap.

## Roadmap

- [ ] Postgres migration with `pgvector` for semantic mistake clustering
- [ ] Multi-subject expansion (Mathematics, full syllabus depth)
- [ ] Voice-mode tutor (WebRTC + streaming TTS)
- [ ] Collaborative study rooms
- [ ] Mobile wrapper (Capacitor) with native notifications
- [ ] Public question bank + community contributions

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/amazing-thing`.
3. Commit your changes with a clear message.
4. Push and open a pull request.

For major changes, please open an issue first to discuss what you would like to change.

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for the full text.

Copyright (c) 2026 Nexus JEE.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) — for an absurdly productive async framework.
- [Vite](https://vitejs.dev/) — for the dev experience that makes React fun again.
- [Manim Community](https://www.manim.community/) — for making programmatic math animation a joy.
- [Tailwind CSS](https://tailwindcss.com/) — for utility-first styling that scales.
- The JEE aspirant community — for the feedback that shaped every tier of the scaffold engine.

---

<div align="center">

**Built with care for JEE aspirants. Star the repo if it helps you learn.**

</div>
