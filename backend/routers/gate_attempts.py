from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import GateAttemptResponse, GateAttemptCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/gate-attempts", tags=["gate-attempts"])


@router.get("", response_model=list[GateAttemptResponse])
async def get_gate_attempts(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM gate_attempts WHERE user_id = ?",
        (user_id,),
    )
    return [
        GateAttemptResponse(
            id=r["id"], chapter_id=r["chapter_id"], date=r["date"],
            score=r["score"], unlocked=bool(r["unlocked"]),
        )
        for r in rows
    ]


@router.post("", response_model=GateAttemptResponse, status_code=201)
async def add_gate_attempt(body: GateAttemptCreate, user_id: int = Depends(get_current_user)):
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    cursor = await db.execute(
        "INSERT INTO gate_attempts (user_id, chapter_id, date, score, unlocked) VALUES (?, ?, ?, ?, ?)",
        (user_id, body.chapter_id, now, body.score, int(body.unlocked)),
    )
    await db.commit()

    return GateAttemptResponse(
        id=cursor.lastrowid, chapter_id=body.chapter_id, date=now,
        score=body.score, unlocked=body.unlocked,
    )
