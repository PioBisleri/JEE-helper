from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import SessionResponse, SessionCreate
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionResponse])
async def get_sessions(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC",
        (user_id,),
    )
    return [
        SessionResponse(
            id=r["id"], chapter_id=r["chapter_id"], chapter_name=r["chapter_name"],
            date=r["date"], attempted=r["attempted"], solved_clean=r["solved_clean"],
            concepts=json.loads(r["concepts"] or "[]"), time_spent=r["time_spent"],
        )
        for r in rows
    ]


@router.post("", response_model=SessionResponse, status_code=201)
async def add_session(body: SessionCreate, user_id: int = Depends(get_current_user)):
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    cursor = await db.execute(
        """INSERT INTO sessions (user_id, chapter_id, chapter_name, date, attempted, solved_clean, concepts, time_spent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (user_id, body.chapter_id, body.chapter_name, now, body.attempted, body.solved_clean, json.dumps(body.concepts), body.time_spent),
    )
    await db.commit()

    return SessionResponse(
        id=cursor.lastrowid, chapter_id=body.chapter_id, chapter_name=body.chapter_name,
        date=now, attempted=body.attempted, solved_clean=body.solved_clean,
        concepts=body.concepts, time_spent=body.time_spent,
    )
