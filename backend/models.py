from pydantic import BaseModel, Field
from typing import Optional


# ── Auth ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = "Aspirant"


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str | None = None
    name: str
    google_id: str | None = None
    created_at: str | None = None


# ── Profile ───────────────────────────────────────────────────────────

class ProfileResponse(BaseModel):
    name: str
    exam_date: str | None = None
    preferences: dict = {}
    onboarded: bool = False


class ProfileUpdate(BaseModel):
    name: str | None = None
    exam_date: str | None = None
    preferences: dict | None = None
    onboarded: bool | None = None


# ── Progress ──────────────────────────────────────────────────────────

class ChapterProgressResponse(BaseModel):
    chapter_id: str
    questions_attempted: int = 0
    concepts_unlocked: list[str] = []
    scaffold_history: list = []
    current_subtopic_index: int = 0
    current_difficulty_index: int = 0
    completed: bool = False
    unlocked_xp_rewarded: bool = False
    completed_xp_rewarded: bool = False


class ChapterProgressUpdate(BaseModel):
    questions_attempted: int | None = None
    concepts_unlocked: list[str] | None = None
    scaffold_history: list | None = None
    current_subtopic_index: int | None = None
    current_difficulty_index: int | None = None
    completed: bool | None = None
    unlocked_xp_rewarded: bool | None = None
    completed_xp_rewarded: bool | None = None


# ── Concepts ──────────────────────────────────────────────────────────

class ConceptResponse(BaseModel):
    id: int
    concept: str
    chapter_id: str | None = None
    learned_at: str | None = None
    review_stage: int = 0
    next_review: str | None = None
    last_reviewed: str | None = None


class ConceptCreate(BaseModel):
    concept: str
    chapter_id: str | None = None


class ConceptUpdate(BaseModel):
    review_stage: int | None = None
    next_review: str | None = None
    last_reviewed: str | None = None


# ── Sessions ──────────────────────────────────────────────────────────

class SessionResponse(BaseModel):
    id: int
    chapter_id: str | None = None
    chapter_name: str | None = None
    date: str | None = None
    attempted: int = 0
    solved_clean: int = 0
    concepts: list[str] = []
    time_spent: int = 0


class SessionCreate(BaseModel):
    chapter_id: str | None = None
    chapter_name: str | None = None
    attempted: int = 0
    solved_clean: int = 0
    concepts: list[str] = []
    time_spent: int = 0


# ── Streak ────────────────────────────────────────────────────────────

class StreakResponse(BaseModel):
    current: int = 0
    longest: int = 0
    last_studied: str | None = None


# ── XP ────────────────────────────────────────────────────────────────

class XPResponse(BaseModel):
    total_xp: int = 0


class XPAdd(BaseModel):
    amount: int


class XPResult(BaseModel):
    xp: int
    old_level: int
    new_level: int
    leveled_up: bool


# ── Mistakes ──────────────────────────────────────────────────────────

class MistakeResponse(BaseModel):
    id: int
    question: str | None = None
    chapter_id: str | None = None
    category: str | None = None
    advice: str | None = None
    date: str | None = None


class MistakeCreate(BaseModel):
    question: str | None = None
    chapter_id: str | None = None
    category: str | None = None
    advice: str | None = None


# ── Bookmarks ─────────────────────────────────────────────────────────

class BookmarkResponse(BaseModel):
    id: int
    question: str | None = None
    primary_concept: str | None = None
    chapter_id: str | None = None
    question_data: dict = {}
    bookmarked_at: str | None = None


class BookmarkCreate(BaseModel):
    question: str
    primary_concept: str | None = None
    chapter_id: str | None = None
    question_data: dict = {}


# ── Notes ─────────────────────────────────────────────────────────────

class NoteResponse(BaseModel):
    concept: str
    text: str = ""
    updated_at: str | None = None


class NoteUpdate(BaseModel):
    text: str


# ── Achievements ──────────────────────────────────────────────────────

class AchievementResponse(BaseModel):
    badge_id: str
    unlocked_at: str | None = None


# ── Weekly ────────────────────────────────────────────────────────────

class WeeklyResponse(BaseModel):
    test_history: list = []
    current_week_concepts: list = []


class WeeklyUpdate(BaseModel):
    test_history: list | None = None
    current_week_concepts: list | None = None


# ── AI Config ─────────────────────────────────────────────────────────

class AIConfigResponse(BaseModel):
    provider: str | None = None
    model: str | None = None
    has_key: bool = False


class AIConfigUpdate(BaseModel):
    provider: str | None = None
    api_key: str | None = None
    model: str | None = None


# ── AI Proxy ──────────────────────────────────────────────────────────

class AIGenerateRequest(BaseModel):
    prompt: str
    system_prompt: str | None = None


class AIGenerateResponse(BaseModel):
    result: dict


# ── Daily Challenge ───────────────────────────────────────────────────

class DailyChallengeResponse(BaseModel):
    id: int
    date: str | None = None
    questions: list = []
    results: dict = {}
    score: int = 0


class DailyChallengeSubmit(BaseModel):
    questions: list = []
    results: dict = {}
    score: int = 0


# ── Gate Attempts ─────────────────────────────────────────────────────

class GateAttemptResponse(BaseModel):
    id: int
    chapter_id: str | None = None
    date: str | None = None
    score: float | None = None
    unlocked: bool = False


class GateAttemptCreate(BaseModel):
    chapter_id: str
    score: float | None = None
    unlocked: bool = False


# ── Migration ─────────────────────────────────────────────────────────

class MigrationRequest(BaseModel):
    backup: dict = Field(..., description="Full localStorage backup JSON")
