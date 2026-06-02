"""
DataBase class — loads chapter/question data from the auto-downloaded
DataBaseChapters pickle. Vendored from jee_mains_pyqs_data_base v007.

Only the cache-loading path is kept. The original on-disk JSON loading
path is removed because we don't ship the JSON data — the pickle IS the
authoritative source.
"""
from .cache import Cache
from . import cache_path, schema_version
from .utils import check_cache_health, download_cache


class DataBase:
    """Abstraction to access the JEE PYQ question corpus."""

    def __repr__(self) -> str:
        return f"""
Name: {self.name}
Total Chapters: {len(self.chapters_dict)}
State: {self.state}
"""

    def __init__(
        self,
        data_base_path=None,
        cache_path=cache_path,
        name: str = "JEE PYQ DataBase",
    ) -> None:
        cache = Cache(cache_path=cache_path, schema_version=schema_version)

        db_health = check_cache_health("DataBaseChapters")

        if not db_health:
            cache.del_all_cache("DataBaseChapters")
            download_cache("DataBaseChapters")

        if cache.is_cached("DataBaseChapters"):
            chapter_dict = cache.load_cache_pkl("DataBaseChapters")
        else:
            raise FileNotFoundError(
                "DataBaseChapters pickle not found and download failed. "
                "Check network access to github.com."
            )

        self.name = name
        self.chapters_dict = chapter_dict
        self.state = "healthy"

    def all_questions(self):
        """Flat iterator over all questions across all chapters."""
        for chapter in self.chapters_dict.values():
            yield from chapter.question_dict.values()
