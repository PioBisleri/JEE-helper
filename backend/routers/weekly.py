from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import WeeklyResponse, WeeklyUpdate
import json

router = APIRouter(prefix="/api/weekly", tags=["weekly"])


@router.get("", response_model=WeeklyResponse)
async def get_weekly(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM weekly WHERE user_id = ?", (user_id,))
    if not rows:
        return WeeklyResponse()
    r = dict(rows[0])
    return WeeklyResponse(
        test_history=json.loads(r["test_history"] or "[]"),
        current_week_concepts=json.loads(r["current_week_concepts"] or "[]"),
    )


@router.put("", response_model=WeeklyResponse)
async def update_weekly(body: WeeklyUpdate, user_id: int = Depends(get_current_user)):
    db = await get_db()

    existing = await db.execute_fetchall("SELECT 1 FROM weekly WHERE user_id = ?", (user_id,))
    if not existing:
        await db.execute("INSERT INTO weekly (user_id) VALUES (?)", (user_id,))
        await db.commit()

    if body.test_history is not None:
        await db.execute(
            "UPDATE weekly SET test_history = ? WHERE user_id = ?",
            (json.dumps(body.test_history), user_id),
        )
    if body.current_week_concepts is not None:
        await db.execute(
            "UPDATE weekly SET current_week_concepts = ? WHERE user_id = ?",
            (json.dumps(body.current_week_concepts), user_id),
        )
    await db.commit()

    return await get_weekly(user_id)
