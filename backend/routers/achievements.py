from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import get_current_user
from models import AchievementResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


@router.get("", response_model=list[AchievementResponse])
async def get_achievements(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM achievements WHERE user_id = ?",
        (user_id,),
    )
    return [AchievementResponse(badge_id=r["badge_id"], unlocked_at=r["unlocked_at"]) for r in rows]


@router.post("/{badge_id}", response_model=AchievementResponse, status_code=201)
async def unlock_achievement(badge_id: str, user_id: int = Depends(get_current_user)):
    db = await get_db()

    existing = await db.execute_fetchall(
        "SELECT 1 FROM achievements WHERE user_id = ? AND badge_id = ?",
        (user_id, badge_id),
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already unlocked")

    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO achievements (user_id, badge_id, unlocked_at) VALUES (?, ?, ?)",
        (user_id, badge_id, now),
    )
    await db.commit()

    return AchievementResponse(badge_id=badge_id, unlocked_at=now)
