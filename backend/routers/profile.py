from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import ProfileResponse, ProfileUpdate
import json

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT p.*, u.name FROM profiles p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?",
        (user_id,),
    )
    if not rows:
        return ProfileResponse(name="Aspirant")
    r = dict(rows[0])
    return ProfileResponse(
        name=r["name"],
        exam_date=r.get("exam_date"),
        preferences=json.loads(r.get("preferences") or "{}"),
        onboarded=bool(r.get("onboarded")),
    )


@router.put("", response_model=ProfileResponse)
async def update_profile(body: ProfileUpdate, user_id: int = Depends(get_current_user)):
    db = await get_db()

    if body.name is not None:
        await db.execute("UPDATE users SET name = ? WHERE id = ?", (body.name, user_id))
    if body.exam_date is not None:
        await db.execute("UPDATE profiles SET exam_date = ? WHERE user_id = ?", (body.exam_date, user_id))
    if body.preferences is not None:
        await db.execute("UPDATE profiles SET preferences = ? WHERE user_id = ?", (json.dumps(body.preferences), user_id))
    if body.onboarded is not None:
        await db.execute("UPDATE profiles SET onboarded = ? WHERE user_id = ?", (int(body.onboarded), user_id))
    await db.commit()

    return await get_profile(user_id)
