from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import MistakeResponse, MistakeCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/mistakes", tags=["mistakes"])


@router.get("", response_model=list[MistakeResponse])
async def get_mistakes(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM mistakes WHERE user_id = ? ORDER BY date DESC",
        (user_id,),
    )
    return [
        MistakeResponse(
            id=r["id"], question=r["question"], chapter_id=r["chapter_id"],
            category=r["category"], advice=r["advice"], date=r["date"],
        )
        for r in rows
    ]


@router.post("", response_model=MistakeResponse, status_code=201)
async def add_mistake(body: MistakeCreate, user_id: int = Depends(get_current_user)):
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    cursor = await db.execute(
        "INSERT INTO mistakes (user_id, question, chapter_id, category, advice, date) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, body.question, body.chapter_id, body.category, body.advice, now),
    )
    await db.commit()

    return MistakeResponse(
        id=cursor.lastrowid, question=body.question, chapter_id=body.chapter_id,
        category=body.category, advice=body.advice, date=now,
    )
