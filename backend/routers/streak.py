from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import StreakResponse
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/streak", tags=["streak"])


@router.get("", response_model=StreakResponse)
async def get_streak(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM streaks WHERE user_id = ?", (user_id,))
    if not rows:
        return StreakResponse()
    r = dict(rows[0])
    return StreakResponse(current=r["current"], longest=r["longest"], last_studied=r["last_studied"])


@router.post("", response_model=StreakResponse)
async def update_streak(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM streaks WHERE user_id = ?", (user_id,))
    if not rows:
        await db.execute("INSERT INTO streaks (user_id) VALUES (?)", (user_id,))
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM streaks WHERE user_id = ?", (user_id,))

    r = dict(rows[0])
    today = datetime.now(timezone.utc).date().isoformat()
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).date().isoformat()

    if r["last_studied"] == today:
        return StreakResponse(current=r["current"], longest=r["longest"], last_studied=r["last_studied"])

    if r["last_studied"] == yesterday:
        new_current = r["current"] + 1
    else:
        new_current = 1

    new_longest = max(new_current, r["longest"])

    await db.execute(
        "UPDATE streaks SET current = ?, longest = ?, last_studied = ? WHERE user_id = ?",
        (new_current, new_longest, today, user_id),
    )
    await db.commit()

    return StreakResponse(current=new_current, longest=new_longest, last_studied=today)
