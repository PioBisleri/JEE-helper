"""
Cache class for loading pre-built pickle data. Vendored from
jee_mains_pyqs_data_base v007 with the _FixUnpickler remapped to our
vendor path.
"""
import os
import re
import time
import pickle
import importlib
from pathlib import Path


class Cache:
    """Handles cache creation, loading, and checking."""

    def __repr__(self) -> str:
        template = f"""
Cache Path: {self.cache_path}
Schema Version: {self.schema_version}
"""
        return template

    def __init__(self, cache_path, schema_version):
        self.cache_path = cache_path
        self.schema_version = schema_version

    def del_all_cache(self, data_name: str):
        pattern = rf"^\d*-{data_name}-v\d*.pkl$"
        cache_files_paths = os.listdir(self.cache_path)
        cache_files = [Path(file).name for file in cache_files_paths]
        for i in cache_files:
            if re.search(pattern, i):
                os.remove(os.path.join(self.cache_path, cache_files_paths[cache_files_paths.index(i)]))

    def creat_cache_pkl(self, data_dict: dict, data_name: str = "DataBaseChapters") -> None:
        time_part = str(time.time()).split(".")[0]
        cache_name = f"{time_part}-{data_name}-{self.schema_version}"
        cache_file_path = os.path.join(self.cache_path, f"{cache_name}.pkl")
        cache_file = open(cache_file_path, "wb")
        pickle.dump(data_dict, cache_file)
        cache_file.close()

    def load_cache_pkl(self, data_name: str) -> dict:
        cache_file_path = self.cache_path
        cache_file_paths = os.listdir(cache_file_path)
        cache_files = [Path(file).name for file in cache_file_paths]
        for file_name in cache_files:
            parts = file_name.split("-")
            if len(parts) < 3:
                continue
            if parts[1] == data_name and parts[-1] == f"{self.schema_version}.pkl":
                cache_data_path = os.path.join(cache_file_path, file_name)

                class _FixUnpickler(pickle.Unpickler):
                    def find_class(self, module, name):
                        # Remap paths to our vendored module location.
                        # The pickles were created when the project was a
                        # standalone script (module = "__main__") or under
                        # the old "core.*" naming.
                        if module == "__main__":
                            try:
                                mod = importlib.import_module(f"vendor.jee_pyqs.core.{name.lower()}")
                                return getattr(mod, name)
                            except Exception:
                                mapping = {
                                    "Chapter": "vendor.jee_pyqs.core.chapter",
                                    "Question": "vendor.jee_pyqs.core.question",
                                }
                                if name in mapping:
                                    mod = importlib.import_module(mapping[name])
                                    return getattr(mod, name)

                        if module.startswith("core."):
                            new_module = f"vendor.jee_pyqs.{module}"
                            mod = importlib.import_module(new_module)
                            return getattr(mod, name)

                        if module == "jee_data_base.core.chapter":
                            mod = importlib.import_module("vendor.jee_pyqs.core.chapter")
                            return getattr(mod, name)
                        if module == "jee_data_base.core.question":
                            mod = importlib.import_module("vendor.jee_pyqs.core.question")
                            return getattr(mod, name)

                        return super().find_class(module, name)

                with open(cache_data_path, "rb") as file:
                    return _FixUnpickler(file).load()

        raise FileNotFoundError(f"No cache file for '{data_name}' (schema {self.schema_version})")

    def is_cached(self, data_name: str) -> bool:
        pattern = rf"^\d*-{data_name}-{self.schema_version}.pkl$"
        cache_files_paths = os.listdir(self.cache_path)
        cache_files = [Path(file).name for file in cache_files_paths]
        for i in cache_files:
            if re.search(pattern, i):
                return True
        return False
