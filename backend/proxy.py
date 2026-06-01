import httpx
import re
import json

PROVIDERS = {
    "openrouter": {
        "name": "OpenRouter",
        "base_url": "https://openrouter.ai/api/v1/chat/completions",
        "default_model": "openrouter/owl-alpha",
        "format": "openai",
    },
    "openai": {
        "name": "OpenAI",
        "base_url": "https://api.openai.com/v1/chat/completions",
        "default_model": "gpt-4o",
        "format": "openai",
    },
    "anthropic": {
        "name": "Anthropic",
        "base_url": "https://api.anthropic.com/v1/messages",
        "default_model": "claude-sonnet-4-20250514",
        "format": "anthropic",
    },
    "gemini": {
        "name": "Google Gemini",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/models/",
        "default_model": "gemini-2.0-flash",
        "format": "gemini",
    },
}

DEFAULT_SYSTEM_PROMPT = """You are Nexus JEE's AI tutor — a precise, strict, expert JEE Mains teacher.
You generate perfectly calibrated JEE questions and explanations.
You ALWAYS respond in valid JSON only. No markdown, no explanation outside JSON,
no preamble. Every response must be parseable by JSON.parse() directly.
CRITICAL LaTeX RULES:
1. Always enclose mathematical formulas and units in single dollar signs ($...$). For example: $5\\text{ m}$ to $5\\text{ cm}$.
2. Never write unbraced commands like \\textm, \\textcm, \\textkg, \\texts. Always write: \\text{m}, \\text{cm}, \\text{kg}, \\text{s}.
3. Always escape all backslashes as double backslashes (\\\\) inside the JSON strings."""


def sanitize_latex_json(json_string: str) -> str:
    s = json_string
    s = re.sub(r'\\text([a-zA-Z]+)', r'\\text{\1}', s)
    s = re.sub(r'\\vec([a-zA-Z]+)', r'\\vec{\1}', s)
    commands = (
        r'frac|sqrt|sin|cos|tan|sec|csc|cot|log|ln|exp|lim|sum|prod|int|infty|partial|nabla|'
        r'vec|hat|bar|dot|ddot|tilde|overline|underline|alpha|beta|gamma|delta|epsilon|theta|'
        r'lambda|mu|pi|sigma|omega|phi|psi|chi|rho|tau|nu|xi|zeta|eta|iota|kappa|Delta|Gamma|'
        r'Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|rightarrow|leftarrow|leftrightarrow|'
        r'Rightarrow|Leftarrow|Leftrightarrow|cdot|times|div|pm|mp|circ|leq|geq|neq|approx|'
        r'equiv|sim|propto|subset|supset|subseteq|supseteq|in|notin|cup|cap|emptyset|forall|'
        r'exists|neg|land|lor|implies|perp|parallel|angle'
    )
    s = re.sub(rf'(?<!\\)(?<!")\\({commands})', r'\\\1', s)
    return s


def parse_ai_response(text: str) -> dict:
    cleaned = re.sub(r'```json\s*', '', text)
    cleaned = re.sub(r'```\s*$', '', cleaned).strip()
    sanitized = sanitize_latex_json(cleaned)
    return json.loads(sanitized)


async def fetch_openai_compatible(base_url: str, api_key: str, model: str, system_prompt: str, user_prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if "openrouter" in base_url:
        headers["HTTP-Referer"] = "https://nexusjee.app"
        headers["X-Title"] = "Nexus JEE"

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            base_url,
            headers=headers,
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.7,
                "max_tokens": 1500,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        if not content:
            raise ValueError("Empty response from AI")
        return parse_ai_response(content)


async def fetch_anthropic(api_key: str, model: str, system_prompt: str, user_prompt: str) -> dict:
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": 1500,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_prompt}],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["content"][0]["text"]
        if not content:
            raise ValueError("Empty response from AI")
        return parse_ai_response(content)


async def fetch_gemini(api_key: str, model: str, system_prompt: str, user_prompt: str) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1500,
                    "responseMimeType": "application/json",
                },
            },
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["candidates"][0]["content"]["parts"][0]["text"]
        if not content:
            raise ValueError("Empty response from AI")
        return parse_ai_response(content)


async def call_ai(provider: str, api_key: str, model: str | None, user_prompt: str, system_prompt: str | None = None) -> dict:
    """Route to the correct AI provider and return parsed JSON."""
    config = PROVIDERS.get(provider)
    if not config:
        raise ValueError(f"Unknown provider: {provider}")

    sys_prompt = system_prompt or DEFAULT_SYSTEM_PROMPT
    effective_model = model or config["default_model"]

    match config["format"]:
        case "openai":
            return await fetch_openai_compatible(config["base_url"], api_key, effective_model, sys_prompt, user_prompt)
        case "anthropic":
            return await fetch_anthropic(api_key, effective_model, sys_prompt, user_prompt)
        case "gemini":
            return await fetch_gemini(api_key, effective_model, sys_prompt, user_prompt)
        case _:
            raise ValueError(f"Unsupported provider format: {config['format']}")
