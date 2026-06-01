from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import DailyChallengeResponse, DailyChallengeSubmit
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/api/daily-challenge", tags=["daily-challenge"])


@router.get("", response_model=DailyChallengeResponse | None)
async def get_today_challenge(user_id: int = Depends(get_current_user)):
    db = await get_db()
    today = datetime.now(timezone.utc).date().isoformat()
    rows = await db.execute_fetchall(
        "SELECT * FROM daily_challenges WHERE user_id = ? AND date = ?",
        (user_id, today),
    )
    if not rows:
        return None
    r = dict(rows[0])
    return DailyChallengeResponse(
        id=r["id"], date=r["date"],
        questions=json.loads(r["questions"] or "[]"),
        results=json.loads(r["results"] or "{}"),
        score=r["score"],
    )


@router.post("", response_model=DailyChallengeResponse)
async def submit_challenge(body: DailyChallengeSubmit, user_id: int = Depends(get_current_user)):
    db = await get_db()
    today = datetime.now(timezone.utc).date().isoformat()

    existing = await db.execute_fetchall(
        "SELECT id FROM daily_challenges WHERE user_id = ? AND date = ?",
        (user_id, today),
    )

    if existing:
        await db.execute(
            "UPDATE daily_challenges SET questions = ?, results = ?, score = ? WHERE user_id = ? AND date = ?",
            (json.dumps(body.questions), json.dumps(body.results), body.score, user_id, today),
        )
        await db.commit()
        challenge_id = existing[0]["id"]
    else:
        cursor = await db.execute(
            "INSERT INTO daily_challenges (user_id, date, questions, results, score) VALUES (?, ?, ?, ?, ?)",
            (user_id, today, json.dumps(body.questions), json.dumps(body.results), body.score),
        )
        await db.commit()
        challenge_id = cursor.lastrowid

    return DailyChallengeResponse(
        id=challenge_id, date=today,
        questions=body.questions, results=body.results, score=body.score,
    )
