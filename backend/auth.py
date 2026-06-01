import os
import jwt
import bcrypt
import httpx
from datetime import datetime, timedelta, timezone

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
        return None


async def verify_google_token(id_token: str) -> dict | None:
    """Verify Google ID token and return payload."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
                timeout=10.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                # Verify the token is for our audience (if VITE_GOOGLE_CLIENT_ID is set)
                audience = os.getenv("VITE_GOOGLE_CLIENT_ID")
                if audience and data.get("aud") != audience:
                    return None
                return data
    except Exception:
        pass
    return None
