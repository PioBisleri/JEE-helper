"""Minimal vendored subset of jee_mains_pyqs_data_base (v007).

We only ship the data-loading pieces (Question, Chapter, DataBase, Cache,
utils). The library's PDF rendering, clustering, and Playwright-dependent
code is intentionally omitted to keep our backend lightweight (no
playwright/chromium dependency).

Source: https://github.com/HostServer001/jee_mains_pyqs_data_base
License: MIT (see upstream repo)
"""
