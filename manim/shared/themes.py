# Nexus JEE Manim - Subject-Specific Color Palettes
# Each subject has its own visual language

from manim import *

# ═══════════════════════════════════════════════════════════
# PHYSICS COLORS
# ═══════════════════════════════════════════════════════════
PHYSICS_OBJECT = "#3b82f6"      # Blue - physical objects
PHYSICS_VELOCITY = "#10b981"    # Green - velocity vectors
PHYSICS_FORCE = "#ef4444"       # Red - force vectors
PHYSICS_ENERGY = "#f59e0b"      # Yellow/Amber - energy
PHYSICS_PATH = "#8b5cf6"        # Purple - trajectories
PHYSICS_FIELD = "#06b6d4"       # Cyan - field lines
PHYSICS_ACCEL = "#f97316"       # Orange - acceleration

PHYSICS_COLORS = {
    "object": PHYSICS_OBJECT,
    "velocity": PHYSICS_VELOCITY,
    "force": PHYSICS_FORCE,
    "energy": PHYSICS_ENERGY,
    "path": PHYSICS_PATH,
    "field": PHYSICS_FIELD,
    "accel": PHYSICS_ACCEL,
}

# ═══════════════════════════════════════════════════════════
# CHEMISTRY COLORS
# ═══════════════════════════════════════════════════════════
CHEM_MOLECULE = "#14b8a6"       # Teal - molecules
CHEM_BOND = "#f97316"           # Orange - chemical bonds
CHEM_ENERGY = "#a855f7"         # Purple - energy levels
CHEM_REACTION = "#ef4444"       # Red - reaction arrows
CHEM_PRODUCT = "#10b981"        # Green - products
CHEM_ELECTRON = "#3b82f6"       # Blue - electrons

CHEM_COLORS = {
    "molecule": CHEM_MOLECULE,
    "bond": CHEM_BOND,
    "energy": CHEM_ENERGY,
    "reaction": CHEM_REACTION,
    "product": CHEM_PRODUCT,
    "electron": CHEM_ELECTRON,
}

# ═══════════════════════════════════════════════════════════
# MATH COLORS
# ═══════════════════════════════════════════════════════════
MATH_CURVE = "#8b5cf6"          # Violet - curves/functions
MATH_POINT = "#06b6d4"          # Cyan - points
MATH_ANNOTATION = "#ec4899"     # Pink - annotations
MATH_AREA = "#10b98180"         # Green (transparent) - areas
MATH_TANGENT = "#f59e0b"        # Yellow - tangent lines
MATH_AXIS = "#64748b"           # Gray - axes

MATH_COLORS = {
    "curve": MATH_CURVE,
    "point": MATH_POINT,
    "annotation": MATH_ANNOTATION,
    "area": MATH_AREA,
    "tangent": MATH_TANGENT,
    "axis": MATH_AXIS,
}


def get_subject_colors(subject):
    """Return the color palette for a given subject."""
    palettes = {
        "physics": PHYSICS_COLORS,
        "chemistry": CHEM_COLORS,
        "math": MATH_COLORS,
    }
    return palettes.get(subject, PHYSICS_COLORS)
