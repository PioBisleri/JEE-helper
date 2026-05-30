# JEE Forge Manim - Shared Configuration
# Common settings for all animation scenes

from manim import *

# Quality settings
FRAME_RATE = 30
RESOLUTION = "480p"  # 854x480

# Duration defaults
TITLE_DURATION = 1.5
FORMULA_DURATION = 1.0
ANIMATION_DURATION = 8.0
INSIGHT_DURATION = 2.0
TOTAL_DURATION = 15.0

# Colors matching the JEE Forge dark theme
BG_COLOR = "#0d1117"
PRIMARY_COLOR = "#7c3aed"      # Violet (app accent)
SECONDARY_COLOR = "#06b6d4"    # Cyan
SUCCESS_COLOR = "#10b981"      # Green
DANGER_COLOR = "#ef4444"       # Red
WARNING_COLOR = "#f59e0b"      # Amber/Orange
TEXT_COLOR = "#e2e8f0"         # Light gray
MUTED_COLOR = "#64748b"        # Muted gray
GRID_COLOR = "#1e293b"         # Subtle grid

# Font sizes
TITLE_FONT_SIZE = 36
SUBTITLE_FONT_SIZE = 28
FORMULA_FONT_SIZE = 32
LABEL_FONT_SIZE = 22
SMALL_FONT_SIZE = 18

# Animation timings
FADE_IN_TIME = 0.5
FADE_OUT_TIME = 0.3
WRITE_TIME = 0.8
TRANSFORM_TIME = 0.6
HIGHLIGHT_TIME = 0.3
