# Nexus JEE

AI-powered JEE Mains preparation with personalized questions, adaptive scaffolding, and spaced repetition.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + PWA
- **Backend**: FastAPI + async SQLite + JWT auth
- **Deployment**: Vercel (frontend) + Render free tier (backend)

## Local Development

### Frontend
```bash
npm install --legacy-peer-deps
cp .env.example .env  # fill in your keys
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Generate required secrets
export JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(64))")
export FERNET_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

uvicorn main:app --reload --port 8000
```

## Production Deployment

### Frontend (Vercel)

1. Sign in to [vercel.com](https://vercel.com) with GitHub
2. Import the repo
3. Framework: Vite (auto-detected)
4. Build: `npm run build`
5. Output: `dist`
6. Set environment variables:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://nexus-jee-api.onrender.com`)
   - `VITE_GOOGLE_CLIENT_ID` — your Google OAuth client ID
   - **Do not** set `VITE_OPENROUTER_KEY` — users provide their own API keys

### Backend (Render)

1. Sign in to [render.com](https://render.com) with GitHub (no card required for free tier)
2. New Web Service → connect the `JEE-helper` repo
3. Root: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT --timeout 120`
6. Add persistent disk: 1GB at `/opt/render/project/src/data`
7. Set environment variables:
   - `DATABASE_PATH` = `/opt/render/project/src/data/nexus_jee.db`
   - `JWT_SECRET` = a new random secret (`python -c "import secrets; print(secrets.token_urlsafe(64))"`)
   - `FERNET_KEY` = a new Fernet key (`python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)
   - `FRONTEND_ORIGIN` = your Vercel URL (e.g., `https://nexus-jee.vercel.app`)
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
8. Deploy

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your OAuth client
3. Add your production frontend URL to **Authorized JavaScript origins** (e.g., `https://nexus-jee.vercel.app`)

## Free Tier Limitations

- **Render free spins down after 15 minutes idle** — first request after idle takes 30-50 seconds
- **512MB RAM** on Render free tier — tight for high traffic, fine for v1
- **SQLite on persistent disk** — no replication, single-region
- **No auto-scaling** — single instance

## Environment Variables

### Frontend
- `VITE_API_URL` — Backend API URL
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID
- `VITE_OPENROUTER_KEY` — (Optional) OpenRouter key for development; not used in production

### Backend
- `JWT_SECRET` — Required. Secret for signing JWT tokens
- `FERNET_KEY` — Required. Key for encrypting AI provider API keys
- `DATABASE_PATH` — Optional. Defaults to `backend/nexus_jee.db`
- `FRONTEND_ORIGIN` — Optional. Production frontend URL for CORS
- `VITE_GOOGLE_CLIENT_ID` — Required. For Google OAuth token verification
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Optional. For password reset emails
