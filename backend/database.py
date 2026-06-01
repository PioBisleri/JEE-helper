import aiosqlite
import os

# Use DATABASE_PATH env var for production (Render persistent disk),
# otherwise default to local file for development
DATABASE_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "nexus_jee.db"))

# Ensure the directory exists
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    name TEXT NOT NULL DEFAULT 'Aspirant',
    google_id TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    exam_date TEXT,
    preferences TEXT DEFAULT '{}',
    onboarded INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    questions_attempted INTEGER DEFAULT 0,
    concepts_unlocked TEXT DEFAULT '[]',
    scaffold_history TEXT DEFAULT '[]',
    current_subtopic_index INTEGER DEFAULT 0,
    current_difficulty_index INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    unlocked_xp_rewarded INTEGER DEFAULT 0,
    completed_xp_rewarded INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    concept TEXT NOT NULL,
    chapter_id TEXT,
    learned_at TEXT,
    review_stage INTEGER DEFAULT 0,
    next_review TEXT,
    last_reviewed TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT,
    chapter_name TEXT,
    date TEXT,
    attempted INTEGER DEFAULT 0,
    solved_clean INTEGER DEFAULT 0,
    concepts TEXT DEFAULT '[]',
    time_spent INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS streaks (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current INTEGER DEFAULT 0,
    longest INTEGER DEFAULT 0,
    last_studied TEXT
);

CREATE TABLE IF NOT EXISTS xp (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mistakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT,
    chapter_id TEXT,
    category TEXT,
    advice TEXT,
    date TEXT
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT,
    primary_concept TEXT,
    chapter_id TEXT,
    question_data TEXT DEFAULT '{}',
    bookmarked_at TEXT
);

CREATE TABLE IF NOT EXISTS notes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    concept TEXT NOT NULL,
    text TEXT DEFAULT '',
    updated_at TEXT,
    PRIMARY KEY (user_id, concept)
);

CREATE TABLE IF NOT EXISTS achievements (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    unlocked_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS weekly (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    test_history TEXT DEFAULT '[]',
    current_week_concepts TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS ai_config (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT,
    api_key_encrypted TEXT,
    model TEXT
);

CREATE TABLE IF NOT EXISTS daily_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date TEXT,
    questions TEXT DEFAULT '[]',
    results TEXT DEFAULT '{}',
    score INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS gate_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT,
    date TEXT,
    score REAL,
    unlocked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    concept TEXT,
    date TEXT,
    correct INTEGER,
    stage INTEGER
);

CREATE TABLE IF NOT EXISTS chapter_summaries (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT,
    summary_data TEXT DEFAULT '{}',
    PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
"""

_db: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        _db = await aiosqlite.connect(DATABASE_PATH)
        _db.row_factory = aiosqlite.Row
        await _db.execute("PRAGMA journal_mode=WAL")
        await _db.execute("PRAGMA foreign_keys=ON")
    return _db


async def init_db():
    db = await get_db()
    await db.executescript(SCHEMA)
    await db.commit()


async def close_db():
    global _db
    if _db:
        await _db.close()
        _db = None
