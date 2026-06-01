from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user
from models import MigrationRequest
from database import get_db
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/api/migrate", tags=["migration"])


@router.post("")
async def import_backup(body: MigrationRequest, user_id: int = Depends(get_current_user)):
    """Import a localStorage backup JSON into the user's account."""
    backup = body.backup
    db = await get_db()
    imported = {}

    # ── Profile ──
    name = backup.get("jeeforge_username", "Aspirant")
    exam_date = backup.get("jeeforge_examdate")
    onboarded = backup.get("jeeforge_onboarded") == "true"
    preferences = json.loads(backup.get("jeeforge_preferences", "{}"))

    await db.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    await db.execute(
        "INSERT INTO profiles (user_id, exam_date, preferences, onboarded) VALUES (?, ?, ?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET exam_date = ?, preferences = ?, onboarded = ?",
        (user_id, exam_date, json.dumps(preferences), int(onboarded), exam_date, json.dumps(preferences), int(onboarded)),
    )
    imported["profile"] = True

    # ── Progress ──
    progress = json.loads(backup.get("jeeforge_progress", "{}"))
    for chapter_id, data in progress.items():
        await db.execute(
            """INSERT INTO progress (user_id, chapter_id, questions_attempted, concepts_unlocked,
               scaffold_history, current_subtopic_index, current_difficulty_index, completed,
               unlocked_xp_rewarded, completed_xp_rewarded)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id, chapter_id) DO UPDATE SET
               questions_attempted = ?, concepts_unlocked = ?, scaffold_history = ?,
               current_subtopic_index = ?, current_difficulty_index = ?, completed = ?,
               unlocked_xp_rewarded = ?, completed_xp_rewarded = ?""",
            (
                user_id, chapter_id,
                data.get("questionsAttempted", 0),
                json.dumps(data.get("conceptsUnlocked", [])),
                json.dumps(data.get("scaffoldHistory", [])),
                data.get("currentSubtopicIndex", 0),
                data.get("currentDifficultyIndex", 0),
                int(data.get("completed", False)),
                int(data.get("unlockedXpRewarded", False)),
                int(data.get("completedXpRewarded", False)),
                # UPDATE values
                data.get("questionsAttempted", 0),
                json.dumps(data.get("conceptsUnlocked", [])),
                json.dumps(data.get("scaffoldHistory", [])),
                data.get("currentSubtopicIndex", 0),
                data.get("currentDifficultyIndex", 0),
                int(data.get("completed", False)),
                int(data.get("unlockedXpRewarded", False)),
                int(data.get("completedXpRewarded", False)),
            ),
        )
    imported["progress"] = len(progress)

    # ── Concepts ──
    concepts = json.loads(backup.get("jeeforge_concepts", "[]"))
    for c in concepts:
        await db.execute(
            "INSERT INTO concepts (user_id, concept, chapter_id, learned_at, review_stage, next_review, last_reviewed) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, c.get("concept"), c.get("chapterId"), c.get("learnedAt"),
             c.get("reviewStage", 0), c.get("nextReview"), c.get("lastReviewed")),
        )
    imported["concepts"] = len(concepts)

    # ── Sessions ──
    sessions = json.loads(backup.get("jeeforge_sessions", "[]"))
    for s in sessions:
        await db.execute(
            "INSERT INTO sessions (user_id, chapter_id, chapter_name, date, attempted, solved_clean, concepts, time_spent) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (user_id, s.get("chapterId"), s.get("chapterName"), s.get("date"),
             s.get("attempted", 0), s.get("solvedClean", 0),
             json.dumps(s.get("concepts", [])), s.get("timeSpent", 0)),
        )
    imported["sessions"] = len(sessions)

    # ── Streak ──
    streak = json.loads(backup.get("jeeforge_streak", "{}"))
    if streak:
        await db.execute(
            "INSERT INTO streaks (user_id, current, longest, last_studied) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(user_id) DO UPDATE SET current = ?, longest = ?, last_studied = ?",
            (user_id, streak.get("current", 0), streak.get("longest", 0), streak.get("lastStudied"),
             streak.get("current", 0), streak.get("longest", 0), streak.get("lastStudied")),
        )
        imported["streak"] = True

    # ── XP ──
    xp = int(backup.get("jeeforge_xp", "0"))
    await db.execute(
        "INSERT INTO xp (user_id, total_xp) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET total_xp = ?",
        (user_id, xp, xp),
    )
    imported["xp"] = xp

    # ── Mistakes ──
    mistakes = json.loads(backup.get("jeeforge_mistakes", "[]"))
    for m in mistakes:
        await db.execute(
            "INSERT INTO mistakes (user_id, question, chapter_id, category, advice, date) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, m.get("question"), m.get("chapter") or m.get("chapterId"),
             m.get("category"), m.get("advice"), m.get("date")),
        )
    imported["mistakes"] = len(mistakes)

    # ── Bookmarks ──
    bookmarks = json.loads(backup.get("jeeforge_bookmarks", "[]"))
    for b in bookmarks:
        await db.execute(
            "INSERT INTO bookmarks (user_id, question, primary_concept, chapter_id, question_data, bookmarked_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, b.get("question"), b.get("primaryConcept"), b.get("chapterId"),
             json.dumps(b), b.get("bookmarkedAt")),
        )
    imported["bookmarks"] = len(bookmarks)

    # ── Notes ──
    notes = json.loads(backup.get("jeeforge_notes", "{}"))
    for concept, note_data in notes.items():
        text = note_data.get("text", "") if isinstance(note_data, dict) else str(note_data)
        updated = note_data.get("updatedAt") if isinstance(note_data, dict) else None
        await db.execute(
            "INSERT INTO notes (user_id, concept, text, updated_at) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(user_id, concept) DO UPDATE SET text = ?, updated_at = ?",
            (user_id, concept, text, updated, text, updated),
        )
    imported["notes"] = len(notes)

    # ── Achievements ──
    achievements = json.loads(backup.get("jeeforge_achievements", "[]"))
    for badge_id in achievements:
        await db.execute(
            "INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)",
            (user_id, badge_id),
        )
    imported["achievements"] = len(achievements)

    # ── Weekly ──
    weekly = json.loads(backup.get("jeeforge_weekly", "{}"))
    if weekly:
        await db.execute(
            "INSERT INTO weekly (user_id, test_history, current_week_concepts) VALUES (?, ?, ?) "
            "ON CONFLICT(user_id) DO UPDATE SET test_history = ?, current_week_concepts = ?",
            (user_id,
             json.dumps(weekly.get("testHistory", [])),
             json.dumps(weekly.get("currentWeekConcepts", [])),
             json.dumps(weekly.get("testHistory", [])),
             json.dumps(weekly.get("currentWeekConcepts", []))),
        )
        imported["weekly"] = True

    # ── AI Config ──
    ai_provider = backup.get("jeeforge_ai_provider")
    ai_key = backup.get("jeeforge_ai_api_key")
    ai_model = backup.get("jeeforge_ai_model")
    if ai_provider or ai_key:
        # Import key encrypted
        from routers.ai_config import cipher
        encrypted_key = cipher.encrypt(ai_key.encode()).decode() if ai_key else None
        await db.execute(
            "INSERT INTO ai_config (user_id, provider, api_key_encrypted, model) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(user_id) DO UPDATE SET provider = ?, api_key_encrypted = ?, model = ?",
            (user_id, ai_provider, encrypted_key, ai_model,
             ai_provider, encrypted_key, ai_model),
        )
        imported["ai_config"] = True

    # ── Gate Attempts ──
    gate = json.loads(backup.get("jeeforge_gate_attempts", "[]"))
    for g in gate:
        await db.execute(
            "INSERT INTO gate_attempts (user_id, chapter_id, date, score, unlocked) VALUES (?, ?, ?, ?, ?)",
            (user_id, g.get("chapterId"), g.get("date"), g.get("score"), int(g.get("unlocked", False))),
        )
    imported["gate_attempts"] = len(gate)

    # ── Review History ──
    review_history = json.loads(backup.get("jeeforge_review_history", "{}"))
    for concept, entries in review_history.items():
        if isinstance(entries, list):
            for entry in entries:
                await db.execute(
                    "INSERT INTO review_history (user_id, concept, date, correct, stage) VALUES (?, ?, ?, ?, ?)",
                    (user_id, concept, entry.get("date"), int(entry.get("correct", False)), entry.get("stage")),
                )
    imported["review_history"] = sum(len(v) for v in review_history.values() if isinstance(v, list))

    # ── Chapter Summaries ──
    summaries = json.loads(backup.get("jeeforge_chapter_summaries", "{}"))
    for chapter_id, data in summaries.items():
        await db.execute(
            "INSERT INTO chapter_summaries (user_id, chapter_id, summary_data) VALUES (?, ?, ?) "
            "ON CONFLICT(user_id, chapter_id) DO UPDATE SET summary_data = ?",
            (user_id, chapter_id, json.dumps(data), json.dumps(data)),
        )
    imported["chapter_summaries"] = len(summaries)

    await db.commit()

    return {"ok": True, "imported": imported}
