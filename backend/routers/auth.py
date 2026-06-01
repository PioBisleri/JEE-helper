from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db
from auth import hash_password, verify_password, create_token, verify_google_token
from dependencies import get_current_user
from models import (
    RegisterRequest, LoginRequest, GoogleAuthRequest, TokenResponse, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
)
from mailer import send_reset_email
from datetime import datetime, timedelta
import secrets

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    db = await get_db()

    existing = await db.execute_fetchall("SELECT id FROM users WHERE email = ?", (body.email,))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(body.password)
    cursor = await db.execute(
        "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
        (body.email, hashed, body.name),
    )
    await db.commit()
    user_id = cursor.lastrowid

    # Create profile
    await db.execute("INSERT INTO profiles (user_id) VALUES (?)", (user_id,))
    await db.execute("INSERT INTO streaks (user_id) VALUES (?)", (user_id,))
    await db.execute("INSERT INTO xp (user_id) VALUES (?)", (user_id,))
    await db.execute("INSERT INTO weekly (user_id) VALUES (?)", (user_id,))
    await db.commit()

    # Fetch created_at populated by DEFAULT (datetime('now'))
    row = await db.execute_fetchall(
        "SELECT created_at FROM users WHERE id = ?", (user_id,)
    )
    created_at = row[0][0] if row else None

    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=body.email,
            name=body.name,
            created_at=created_at,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT id, email, name, password_hash FROM users WHERE email = ?",
        (body.email,),
    )
    if not rows:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = dict(rows[0])
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"]),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest):
    payload = await verify_google_token(body.id_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("name", "Aspirant")

    db = await get_db()

    # Check if user exists by google_id or email
    existing = await db.execute_fetchall(
        "SELECT id, email, name FROM users WHERE google_id = ? OR email = ?",
        (google_id, email),
    )

    if existing:
        user = dict(existing[0])
        # Link google_id if not already linked
        if not user.get("email") and email:
            await db.execute("UPDATE users SET google_id = ?, email = ? WHERE id = ?", (google_id, email, user["id"]))
            await db.commit()
        token = create_token(user["id"])
        return TokenResponse(
            access_token=token,
            user=UserResponse(id=user["id"], email=user.get("email") or email, name=user["name"]),
        )

    # Create new user
    cursor = await db.execute(
        "INSERT INTO users (email, google_id, name) VALUES (?, ?, ?)",
        (email, google_id, name),
    )
    await db.commit()
    user_id = cursor.lastrowid

    await db.execute("INSERT INTO profiles (user_id) VALUES (?)", (user_id,))
    await db.execute("INSERT INTO streaks (user_id) VALUES (?)", (user_id,))
    await db.execute("INSERT INTO xp (user_id) VALUES (?)", (user_id,))
    await db.execute("INSERT INTO weekly (user_id) VALUES (?)", (user_id,))
    await db.commit()

    row = await db.execute_fetchall(
        "SELECT created_at FROM users WHERE id = ?", (user_id,)
    )
    created_at = row[0][0] if row else None

    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=email, name=name, created_at=created_at),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT id, email, name, google_id, created_at FROM users WHERE id = ?",
        (user_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    user = dict(rows[0])
    return UserResponse(**user)


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT id FROM users WHERE email = ?", (body.email,))
    if not rows:
        return {"message": "If an account exists, a reset code has been sent"}

    user_id = dict(rows[0])["id"]
    code = f"{secrets.randbelow(1_000_000):06d}"
    expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()

    await db.execute(
        "INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)",
        (user_id, code, expires_at),
    )
    await db.commit()

    send_reset_email(body.email, code)

    return {"message": "If an account exists, a reset code has been sent"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    db = await get_db()
    rows = await db.execute_fetchall("SELECT id FROM users WHERE email = ?", (body.email,))
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = dict(rows[0])["id"]
    now = datetime.utcnow().isoformat()
    resets = await db.execute_fetchall(
        "SELECT id FROM password_resets WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > ? ORDER BY id DESC LIMIT 1",
        (user_id, body.code, now),
    )
    if not resets:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    reset_id = dict(resets[0])["id"]
    hashed = hash_password(body.new_password)
    await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hashed, user_id))
    await db.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (reset_id,))
    await db.commit()

    return {"message": "Password reset successful"}


@router.post("/change-password")
async def change_password(body: ChangePasswordRequest, user_id: int = Depends(get_current_user)):
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT password_hash FROM users WHERE id = ?",
        (user_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")

    user = dict(rows[0])
    if not verify_password(body.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    hashed = hash_password(body.new_password)
    await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hashed, user_id))
    await db.commit()

    return {"message": "Password changed successfully"}
