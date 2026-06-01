from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import get_current_user
from models import BookmarkResponse, BookmarkCreate
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


@router.get("", response_model=list[BookmarkResponse])
async def get_bookmarks(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM bookmarks WHERE user_id = ? ORDER BY bookmarked_at DESC",
        (user_id,),
    )
    return [
        BookmarkResponse(
            id=r["id"], question=r["question"], primary_concept=r["primary_concept"],
            chapter_id=r["chapter_id"], question_data=json.loads(r["question_data"] or "{}"),
            bookmarked_at=r["bookmarked_at"],
        )
        for r in rows
    ]


@router.post("", response_model=BookmarkResponse, status_code=201)
async def add_bookmark(body: BookmarkCreate, user_id: int = Depends(get_current_user)):
    db = await get_db()

    existing = await db.execute_fetchall(
        "SELECT id FROM bookmarks WHERE user_id = ? AND question = ?",
        (user_id, body.question),
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already bookmarked")

    now = datetime.now(timezone.utc).isoformat()
    cursor = await db.execute(
        "INSERT INTO bookmarks (user_id, question, primary_concept, chapter_id, question_data, bookmarked_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, body.question, body.primary_concept, body.chapter_id, json.dumps(body.question_data), now),
    )
    await db.commit()

    return BookmarkResponse(
        id=cursor.lastrowid, question=body.question, primary_concept=body.primary_concept,
        chapter_id=body.chapter_id, question_data=body.question_data, bookmarked_at=now,
    )


@router.delete("/{bookmark_id}")
async def remove_bookmark(bookmark_id: int, user_id: int = Depends(get_current_user)):
    db = await get_db()
    result = await db.execute(
        "DELETE FROM bookmarks WHERE id = ? AND user_id = ?",
        (bookmark_id, user_id),
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"ok": True}
