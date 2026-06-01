from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import NoteResponse, NoteUpdate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteResponse])
async def get_notes(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM notes WHERE user_id = ?",
        (user_id,),
    )
    return [
        NoteResponse(concept=r["concept"], text=r["text"], updated_at=r["updated_at"])
        for r in rows
    ]


@router.put("/{concept}", response_model=NoteResponse)
async def upsert_note(
    concept: str,
    body: NoteUpdate,
    user_id: int = Depends(get_current_user),
):
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        """INSERT INTO notes (user_id, concept, text, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, concept) DO UPDATE SET text = ?, updated_at = ?""",
        (user_id, concept, body.text, now, body.text, now),
    )
    await db.commit()

    return NoteResponse(concept=concept, text=body.text, updated_at=now)
