from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user
from routers.ai_config import get_decrypted_api_key
from models import AIGenerateRequest, AIGenerateResponse
from proxy import call_ai

router = APIRouter(prefix="/api/ai", tags=["ai-proxy"])


@router.post("/generate", response_model=AIGenerateResponse)
async def generate(body: AIGenerateRequest, user_id: int = Depends(get_current_user)):
    provider, api_key = await get_decrypted_api_key(user_id)
    if not provider or not api_key:
        raise HTTPException(status_code=400, detail="No AI provider configured. Set up your API key in Settings.")

    try:
        result = await call_ai(provider, api_key, None, body.prompt, body.system_prompt)
        return AIGenerateResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI provider error: {e}")
