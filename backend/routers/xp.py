from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import XPResponse, XPAdd, XPResult

LEVEL_NAMES = [
    "JEE Aspirant", "Problem Solver", "Concept Crusher",
    "Formula Master", "JEE Warrior", "JEE Legend",
]


def get_level_details(xp: int) -> tuple[int, str]:
    level_number = min(xp // 500 + 1, len(LEVEL_NAMES))
    return level_number, LEVEL_NAMES[level_number - 1]


router = APIRouter(prefix="/api/xp", tags=["xp"])


@router.get("", response_model=XPResponse)
async def get_xp(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT total_xp FROM xp WHERE user_id = ?", (user_id,))
    if not rows:
        return XPResponse(total_xp=0)
    return XPResponse(total_xp=rows[0]["total_xp"])


@router.post("", response_model=XPResult)
async def add_xp(body: XPAdd, user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT total_xp FROM xp WHERE user_id = ?", (user_id,))
    current_xp = rows[0]["total_xp"] if rows else 0
    new_xp = current_xp + body.amount

    await db.execute(
        "INSERT INTO xp (user_id, total_xp) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET total_xp = ?",
        (user_id, new_xp, new_xp),
    )
    await db.commit()

    old_level, _ = get_level_details(current_xp)
    new_level, _ = get_level_details(new_xp)

    return XPResult(
        xp=new_xp,
        old_level=old_level,
        new_level=new_level,
        leveled_up=new_level > old_level,
    )
