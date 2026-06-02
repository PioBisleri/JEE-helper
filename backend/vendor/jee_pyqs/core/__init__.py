"""Core data-loading primitives. See ../__init__.py for context."""
from pathlib import Path
import importlib.util as lib

# Resolve the absolute path to the package's data dir (we don't ship a
# data_base directory — DataBaseChapters is auto-downloaded on first
# use into the cache_path).
_data_base_path = Path(__file__).parent  # noqa: F841 (kept for parity)

# Cache location. Overridable via env var for production (Render persistent
# disk) — defaults to a local cache dir next to this file.
import os as _os
_default_cache = Path(__file__).parent / "cache"
_cache_path = Path(_os.getenv("JEE_PYQ_CACHE_PATH", str(_default_cache)))
_cache_path.mkdir(parents=True, exist_ok=True)

cache_path = _cache_path
data_base_path = _data_base_path  # not used by the loader since DataBase uses pickles
schema_version = "v007"

# Direct download URLs for the two pickle artifacts. Embeddings pickle
# is intentionally NOT downloaded (138MB) — we only need question text.
EMBEDDINGS_LINK = "https://github.com/HostServer001/jee_mains_pyqs_data_base/releases/download/v007/1763101292-EmbeddingsChapters-v007.pkl"
DATABASE_LINK = "https://github.com/HostServer001/jee_mains_pyqs_data_base/releases/download/v007/1762787474-DataBaseChapters-v007.pkl"

from .data_base import DataBase
from .chapter import Chapter
from .question import Question
from .cache import Cache
from .utils import check_cache_health, download_cache
from .types import *
