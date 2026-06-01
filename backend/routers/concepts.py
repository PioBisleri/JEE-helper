from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import get_current_user
from models import ConceptResponse, ConceptCreate, ConceptUpdate

router = APIRouter(prefix="/api/concepts", tags=["concepts"])


@router.get("", response_model=list[ConceptResponse])
async def get_concepts(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM concepts WHERE user_id = ?", (user_id,))
    return [
        ConceptResponse(
            id=r["id"], concept=r["concept"], chapter_id=r["chapter_id"],
            learned_at=r["learned_at"], review_stage=r["review_stage"],
            next_review=r["next_review"], last_reviewed=r["last_reviewed"],
        )
        for r in rows
    ]


@router.post("", response_model=ConceptResponse, status_code=201)
async def add_concept(body: ConceptCreate, user_id: int = Depends(get_current_user)):
    db = await get_db()

    existing = await db.execute_fetchall(
        "SELECT id FROM concepts WHERE user_id = ? AND concept = ?",
        (user_id, body.concept),
    )
    if existing:
        raise HTTPException(status_code=409, detail="Concept already exists")

    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc).isoformat()
    next_review = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

    cursor = await db.execute(
        "INSERT INTO concepts (user_id, concept, chapter_id, learned_at, review_stage, next_review) VALUES (?, ?, ?, ?, 0, ?)",
        (user_id, body.concept, body.chapter_id, now, next_review),
    )
    await db.commit()

    return ConceptResponse(
        id=cursor.lastrowid, concept=body.concept, chapter_id=body.chapter_id,
        learned_at=now, review_stage=0, next_review=next_review,
    )


@router.put("/{concept_id}", response_model=ConceptResponse)
async def update_concept(
    concept_id: int,
    body: ConceptUpdate,
    user_id: int = Depends(get_current_user),
):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM concepts WHERE id = ? AND user_id = ?",
        (concept_id, user_id),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Concept not found")

    updates = []
    params = []
    if body.review_stage is not None:
        updates.append("review_stage = ?")
        params.append(body.review_stage)
    if body.next_review is not None:
        updates.append("next_review = ?")
        params.append(body.next_review)
    if body.last_reviewed is not None:
        updates.append("last_reviewed = ?")
        params.append(body.last_reviewed)

    if updates:
        params.extend([concept_id, user_id])
        await db.execute(
            f"UPDATE concepts SET {', '.join(updates)} WHERE id = ? AND user_id = ?",
            params,
        )
        await db.commit()

    rows = await db.execute_fetchall(
        "SELECT * FROM concepts WHERE id = ? AND user_id = ?",
        (concept_id, user_id),
    )
    r = dict(rows[0])
    return ConceptResponse(
        id=r["id"], concept=r["concept"], chapter_id=r["chapter_id"],
        learned_at=r["learned_at"], review_stage=r["review_stage"],
        next_review=r["next_review"], last_reviewed=r["last_reviewed"],
    )
