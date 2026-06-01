from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_current_user
from models import AIConfigResponse, AIConfigUpdate
from cryptography.fernet import Fernet
import os

FERNET_KEY = os.getenv("FERNET_KEY", Fernet.generate_key().decode())
cipher = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)

router = APIRouter(prefix="/api/ai-config", tags=["ai-config"])


@router.get("", response_model=AIConfigResponse)
async def get_ai_config(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM ai_config WHERE user_id = ?", (user_id,))
    if not rows:
        return AIConfigResponse()
    r = dict(rows[0])
    return AIConfigResponse(
        provider=r["provider"],
        model=r["model"],
        has_key=bool(r["api_key_encrypted"]),
    )


@router.put("", response_model=AIConfigResponse)
async def update_ai_config(body: AIConfigUpdate, user_id: int = Depends(get_current_user)):
    db = await get_db()

    encrypted_key = None
    if body.api_key:
        encrypted_key = cipher.encrypt(body.api_key.encode()).decode()

    existing = await db.execute_fetchall("SELECT 1 FROM ai_config WHERE user_id = ?", (user_id,))
    if not existing:
        await db.execute(
            "INSERT INTO ai_config (user_id, provider, api_key_encrypted, model) VALUES (?, ?, ?, ?)",
            (user_id, body.provider, encrypted_key, body.model),
        )
    else:
        updates = []
        params = []
        if body.provider is not None:
            updates.append("provider = ?")
            params.append(body.provider)
        if encrypted_key is not None:
            updates.append("api_key_encrypted = ?")
            params.append(encrypted_key)
        if body.model is not None:
            updates.append("model = ?")
            params.append(body.model)
        if updates:
            params.extend([user_id])
            await db.execute(
                f"UPDATE ai_config SET {', '.join(updates)} WHERE user_id = ?",
                params,
            )
    await db.commit()

    return await get_ai_config(user_id)


async def get_decrypted_api_key(user_id: int) -> tuple[str | None, str | None]:
    """Return (provider, api_key) for the user. Used by the AI proxy."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM ai_config WHERE user_id = ?", (user_id,))
    if not rows:
        return None, None
    r = dict(rows[0])
    provider = r["provider"]
    api_key = None
    if r["api_key_encrypted"]:
        api_key = cipher.decrypt(r["api_key_encrypted"].encode()).decode()
    return provider, api_key
