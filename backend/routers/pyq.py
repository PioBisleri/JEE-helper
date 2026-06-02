"""
PYQ router — serves questions from the JEE Mains PYQ corpus
(vendored subset of HostServer001/jee_mains_pyqs_data_base v007).

Endpoints (all public — no auth required to browse PYQs, like a
read-only study resource):

  GET /api/pyq/status
      Health + cache state. Useful for the frontend to decide whether
      to use PYQ as a question source.

  GET /api/pyq/chapters
      List of available chapters (id, name, total_questions, subject).

  GET /api/pyq/by-chapter
      Query params:
        chapter        — chapter id (required, e.g. "current-electricity")
        topic          — filter by topic (optional)
        year           — filter by year (optional, int)
        difficulty     — filter by difficulty (optional, easy/medium/hard)
        n_years        — last N years (optional, alternative to year)
        limit          — max questions to return (optional, default 10, max 50)
        exclude_texts  — comma-separated question texts already shown
                         (for client-side dedup)
      Returns a list of questions matching the filters.

  GET /api/pyq/random
      Same query params as /by-chapter, but returns a single random
      question. Used by the frontend's "get a question" call when
      PYQ is the chosen source.

  GET /api/pyq/topic
      List of topics for a given chapter.
"""
import os
import re
import logging
import random
import threading
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends

from dependencies import get_current_user

logger = logging.getLogger("pyq")

router = APIRouter(prefix="/api/pyq", tags=["pyq"])

# ─── Lazy singleton: DataBase is loaded on first request ────────────────
_db_lock = threading.Lock()
_db_instance = None
_db_load_error: Optional[str] = None


def _get_db():
    """Load DataBase on first call, cache the instance for subsequent calls.
    Thread-safe. The pickle is ~24MB and takes a few seconds to load into
    memory, so we don't want to do it on every request."""
    global _db_instance, _db_load_error
    if _db_instance is not None:
        return _db_instance
    if _db_load_error is not None:
        raise HTTPException(
            status_code=503,
            detail=f"PYQ database unavailable: {_db_load_error}",
        )
    with _db_lock:
        if _db_instance is not None:
            return _db_instance
        try:
            # Imported lazily so a missing dep or download failure doesn't
            # kill the whole backend on startup.
            from vendor.jee_pyqs.core import DataBase
            _db_instance = DataBase()
            logger.info(
                f"PYQ DataBase loaded: {len(_db_instance.chapters_dict)} chapters"
            )
            return _db_instance
        except Exception as e:
            _db_load_error = str(e)
            logger.exception("Failed to load PYQ DataBase")
            raise HTTPException(
                status_code=503,
                detail=f"PYQ database unavailable: {e}",
            )


# ─── Conversion: PYQ Question → frontend Question schema ────────────────
_DIFFICULTY_MAP = {
    "easy": "easy",
    "medium": "medium",
    "hard": "hard",
    # Capitalised variants from upstream
    "easiest": "easy",
    "easy-medium": "medium",
    "medium-hard": "hard",
    "hardest": "hard",
}

_IMG_TAG_RE = re.compile(r"<img[^>]*>", re.IGNORECASE)


def _strip_images(html: str) -> str:
    """Replace <img> tags with a placeholder so the frontend renderer
    doesn't choke. Real image rendering can be added later."""
    if not html:
        return ""
    return _IMG_TAG_RE.sub("[image]", html).strip()


def _normalize_difficulty(d: str) -> str:
    if not d:
        return "medium"
    key = d.lower().strip()
    return _DIFFICULTY_MAP.get(key, "medium")


def _options_to_dict(options_raw) -> dict:
    """Upstream stores options as a list of {content, ...} dicts; the
    frontend wants {A: ..., B: ..., C: ..., D: ...}. Take the first 4."""
    result = {}
    labels = ["A", "B", "C", "D", "E", "F"]
    if not isinstance(options_raw, list):
        return result
    for i, opt in enumerate(options_raw[:6]):
        if isinstance(opt, dict):
            content = opt.get("content", "")
        else:
            content = str(opt)
        result[labels[i]] = _strip_images(content)
    return result


def _first_correct_letter(correct_options) -> str:
    """Upstream may list multiple correct options (rare in JEE Mains
    single-correct MCQs). We always return the first as 'answer'."""
    if isinstance(correct_options, list) and correct_options:
        first = correct_options[0]
        if isinstance(first, dict):
            return str(first.get("content", "A")).strip().upper()[:1] or "A"
        return str(first).strip().upper()[:1] or "A"
    return "A"


def _why_others_wrong(answer_letter: str, options_dict: dict) -> dict:
    """The upstream explanation covers the correct answer; for the wrong
    options, we don't have per-option text. Return a sensible placeholder
    so the UI doesn't break."""
    result = {}
    for letter, _text in options_dict.items():
        if letter != answer_letter:
            result[letter] = "Not the correct option for this question."
    return result


def _pyq_to_question_dict(q) -> dict:
    """Convert an upstream Question object to a dict matching the
    frontend's `Question` interface (src/types/ai.ts)."""
    options_dict = _options_to_dict(q.options)
    answer_letter = _first_correct_letter(q.correct_options)
    # Defensive: if the answer letter doesn't exist in options_dict, default to A
    if answer_letter not in options_dict and options_dict:
        answer_letter = "A"
    return {
        "question": _strip_images(q.question),
        "options": options_dict,
        "answer": answer_letter,
        "conceptsTested": [q.topic] if q.topic else [],
        "primaryConcept": q.topic or q.chapter or "general",
        "whyCorrect": _strip_images(q.explanation) or "This is the correct option for this question.",
        "whyOthersWrong": _why_others_wrong(answer_letter, options_dict),
        "difficulty": _normalize_difficulty(q.difficulty),
        # PYQ-specific metadata (frontend can ignore or display)
        "_meta": {
            "source": "pyq",
            "question_id": q.question_id,
            "year": q.year,
            "exam": q.exam,
            "paperTitle": q.paperTitle,
            "type": q.type,
            "isImgQuestion": bool(q.isImgQuestion),
        },
    }


# ─── Filter helpers ────────────────────────────────────────────────────
def _filter_questions(
    db,
    chapter: str,
    topic: Optional[str] = None,
    year: Optional[int] = None,
    n_years: Optional[int] = None,
    difficulty: Optional[str] = None,
):
    """Yield Question objects from a chapter matching the given filters."""
    chap = db.chapters_dict.get(chapter)
    if chap is None:
        return
    for q in chap.question_dict.values():
        if topic and (q.topic or "").lower() != topic.lower():
            continue
        if year is not None and q.year != year:
            continue
        if n_years is not None:
            current_year = 2024  # Approximate "now" — JEE Mains 2024 was the last full cycle
            if q.year < current_year - n_years + 1:
                continue
        if difficulty and _normalize_difficulty(q.difficulty) != difficulty:
            continue
        yield q


# ─── Endpoints ─────────────────────────────────────────────────────────
@router.get("/status")
async def status():
    """Returns whether the PYQ database is loaded and ready."""
    if _db_instance is not None:
        return {
            "available": True,
            "chapters": len(_db_instance.chapters_dict),
            "total_questions": sum(
                len(c.question_dict) for c in _db_instance.chapters_dict.values()
            ),
        }
    return {"available": False, "error": _db_load_error}


@router.get("/chapters")
async def list_chapters(user_id: int = Depends(get_current_user)):
    """List all available chapters. Requires auth so we don't leak the
    full JEE syllabus to anonymous scrapers."""
    db = _get_db()
    result = []
    for chap_id, chap in db.chapters_dict.items():
        result.append({
            "id": chap_id,
            "name": chap.name,
            "subject": chap.parent_subject,
            "total_questions": chap.total_questions,
        })
    # Sort by subject, then by name for a stable UI order
    result.sort(key=lambda c: (c["subject"], c["name"]))
    return {"chapters": result}


@router.get("/topics")
async def list_topics(
    chapter: str = Query(..., description="Chapter id"),
    user_id: int = Depends(get_current_user),
):
    """List distinct topics for a chapter."""
    db = _get_db()
    chap = db.chapters_dict.get(chapter)
    if chap is None:
        raise HTTPException(status_code=404, detail=f"Chapter not found: {chapter}")
    topics = sorted({
        q.topic for q in chap.question_dict.values() if q.topic
    })
    return {"chapter": chapter, "topics": topics}


@router.get("/by-chapter")
async def by_chapter(
    chapter: str = Query(..., description="Chapter id (e.g. 'current-electricity')"),
    topic: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    n_years: Optional[int] = Query(None, ge=1, le=20, description="Filter to last N years"),
    difficulty: Optional[str] = Query(None, pattern="^(easy|medium|hard)$"),
    limit: int = Query(10, ge=1, le=50),
    exclude: Optional[str] = Query(None, description="Comma-separated question IDs to skip"),
    user_id: int = Depends(get_current_user),
):
    """Get up to `limit` questions from a chapter matching the given filters."""
    db = _get_db()
    excluded = set()
    if exclude:
        excluded = {x.strip() for x in exclude.split(",") if x.strip()}

    matches = []
    for q in _filter_questions(db, chapter, topic, year, n_years, difficulty):
        if q.question_id in excluded:
            continue
        matches.append(q)
        if len(matches) >= limit:
            break

    return {
        "chapter": chapter,
        "count": len(matches),
        "questions": [_pyq_to_question_dict(q) for q in matches],
    }


@router.get("/random")
async def random_question(
    chapter: str = Query(..., description="Chapter id"),
    topic: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    n_years: Optional[int] = Query(None, ge=1, le=20),
    difficulty: Optional[str] = Query(None, pattern="^(easy|medium|hard)$"),
    exclude: Optional[str] = Query(None, description="Comma-separated question IDs to skip"),
    user_id: int = Depends(get_current_user),
):
    """Get a single random question from a chapter matching the filters."""
    db = _get_db()
    excluded = set()
    if exclude:
        excluded = {x.strip() for x in exclude.split(",") if x.strip()}

    pool = [q for q in _filter_questions(db, chapter, topic, year, n_years, difficulty)
            if q.question_id not in excluded]
    if not pool:
        raise HTTPException(
            status_code=404,
            detail=f"No questions found for chapter='{chapter}' with the given filters",
        )

    chosen = random.choice(pool)
    return {
        "chapter": chapter,
        "question": _pyq_to_question_dict(chosen),
    }
