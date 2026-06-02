from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, close_db
from routers import (
    auth, profile, progress, concepts, sessions,
    streak, xp, mistakes, bookmarks, notes,
    achievements, weekly, ai_config, ai_proxy,
    daily_challenge, gate_attempts, pyq,
)
from routers.migration import router as migration_router


# Validate required secrets on startup
import os
if not os.getenv("JWT_SECRET"):
    raise RuntimeError("JWT_SECRET environment variable is required")
if not os.getenv("FERNET_KEY"):
    raise RuntimeError("FERNET_KEY environment variable is required")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="Nexus JEE API", version="1.0.0", lifespan=lifespan)

# CORS — add production frontend URL via env var, plus a regex to allow
# Vercel preview deployments (e.g. nexus-jee-peach-git-main-*.vercel.app).
_cors_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
_prod_origin = os.getenv("FRONTEND_ORIGIN")
if _prod_origin:
    _cors_origins.append(_prod_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Path-aware end-anchor defends against anything slipping past the start anchor.
    # Note: per the CORS spec, the Origin header is scheme+host+port only (no path),
    # so the `(/.*)?$` suffix is defensive — it lets us match if a misbehaving proxy
    # ever appends a path, while still rejecting `*.vercel.app.evil.com`.
    allow_origin_regex=r"^https://nexus-jee[a-z0-9-]*\.vercel\.app(/.*)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
app.include_router(auth.router)

# Data routers
app.include_router(profile.router)
app.include_router(progress.router)
app.include_router(concepts.router)
app.include_router(sessions.router)
app.include_router(streak.router)
app.include_router(xp.router)
app.include_router(mistakes.router)
app.include_router(bookmarks.router)
app.include_router(notes.router)
app.include_router(achievements.router)
app.include_router(weekly.router)
app.include_router(ai_config.router)
app.include_router(ai_proxy.router)
app.include_router(daily_challenge.router)
app.include_router(gate_attempts.router)
app.include_router(pyq.router)

# Migration
app.include_router(migration_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
