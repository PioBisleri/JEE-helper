from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import ChapterProgressResponse, ChapterProgressUpdate
import json

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("", response_model=list[ChapterProgressResponse])
async def get_all_progress(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM progress WHERE user_id = ?", (user_id,))
    return [
        ChapterProgressResponse(
            chapter_id=r["chapter_id"],
            questions_attempted=r["questions_attempted"],
            concepts_unlocked=json.loads(r["concepts_unlocked"] or "[]"),
            scaffold_history=json.loads(r["scaffold_history"] or "[]"),
            current_subtopic_index=r["current_subtopic_index"],
            current_difficulty_index=r["current_difficulty_index"],
            completed=bool(r["completed"]),
            unlocked_xp_rewarded=bool(r["unlocked_xp_rewarded"]),
            completed_xp_rewarded=bool(r["completed_xp_rewarded"]),
        )
        for r in rows
    ]


@router.put("/{chapter_id}", response_model=ChapterProgressResponse)
async def update_chapter_progress(
    chapter_id: str,
    body: ChapterProgressUpdate,
    user_id: int = Depends(get_current_user),
):
    db = await get_db()

    # Upsert: ensure row exists
    existing = await db.execute_fetchall(
        "SELECT 1 FROM progress WHERE user_id = ? AND chapter_id = ?",
        (user_id, chapter_id),
    )
    if not existing:
        await db.execute(
            "INSERT INTO progress (user_id, chapter_id) VALUES (?, ?)",
            (user_id, chapter_id),
        )
        await db.commit()

    updates = []
    params = []
    for field in [
        "questions_attempted", "current_subtopic_index", "current_difficulty_index",
        "completed", "unlocked_xp_rewarded", "completed_xp_rewarded",
    ]:
        val = getattr(body, field)
        if val is not None:
            updates.append(f"{field} = ?")
            params.append(int(val) if isinstance(val, bool) else val)

    if body.concepts_unlocked is not None:
        updates.append("concepts_unlocked = ?")
        params.append(json.dumps(body.concepts_unlocked))
    if body.scaffold_history is not None:
        updates.append("scaffold_history = ?")
        params.append(json.dumps(body.scaffold_history))

    if updates:
        params.extend([user_id, chapter_id])
        await db.execute(
            f"UPDATE progress SET {', '.join(updates)} WHERE user_id = ? AND chapter_id = ?",
            params,
        )
        await db.commit()

    rows = await db.execute_fetchall(
        "SELECT * FROM progress WHERE user_id = ? AND chapter_id = ?",
        (user_id, chapter_id),
    )
    r = dict(rows[0]) if rows else {"chapter_id": chapter_id}
    return ChapterProgressResponse(
        chapter_id=r["chapter_id"],
        questions_attempted=r.get("questions_attempted", 0),
        concepts_unlocked=json.loads(r.get("concepts_unlocked") or "[]"),
        scaffold_history=json.loads(r.get("scaffold_history") or "[]"),
        current_subtopic_index=r.get("current_subtopic_index", 0),
        current_difficulty_index=r.get("current_difficulty_index", 0),
        completed=bool(r.get("completed")),
        unlocked_xp_rewarded=bool(r.get("unlocked_xp_rewarded")),
        completed_xp_rewarded=bool(r.get("completed_xp_rewarded")),
    )
