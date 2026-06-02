"""
Cache health-check and download helpers. Vendored from
jee_mains_pyqs_data_base v007 with a tweak: download only the
DataBaseChapters pickle (we skip EmbeddingsChapters, 138MB).
"""
import re
import os
import sys
import logging
from . import cache_path, schema_version, DATABASE_LINK
from pathlib import Path
from requests import Session
from tqdm import tqdm

logger = logging.getLogger("vendor.jee_pyqs")
session = Session()


def check_cache_health(data_name: str) -> bool:
    pattern = rf"\d*-{data_name}-{schema_version}.pkl"
    cache_files_paths = os.listdir(cache_path)
    cache_files = [Path(file).name for file in cache_files_paths]
    for i in cache_files:
        if re.search(pattern, i):
            return True
    return False


def download_cache(data_name: str) -> None:
    """Download a single named cache file. Only DataBaseChapters is supported
    by this vendored subset — embeddings are not downloaded."""
    if data_name == "EmbeddingsChapters":
        logger.info("Skipping EmbeddingsChapters download (not used by vendored subset)")
        return

    pattern = rf"\d*-{data_name}-{schema_version}.pkl"
    cache_file_dict = {
        f"123-DataBaseChapters-{schema_version}.pkl": DATABASE_LINK,
    }
    for i in cache_file_dict.keys():
        if re.search(pattern, i):
            logger.info(f"Downloading {i} from {cache_file_dict[i]} ...")
            response = session.get(cache_file_dict[i], stream=True, timeout=300)
            response.raise_for_status()
            total_size = int(response.headers.get("content-length", 0))
            block_size = 65536

            file_path = cache_path / i
            with open(file_path, "wb") as file, tqdm(
                total=total_size,
                unit="B",
                unit_scale=True,
                desc=str(file_path),
                file=sys.stdout,
                miniters=1,
                disable=not sys.stdout.isatty(),
            ) as progress_bar:
                for data in response.iter_content(block_size):
                    file.write(data)
                    progress_bar.update(len(data))
            logger.info(f"Downloaded {file_path}")
