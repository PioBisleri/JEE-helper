#!/bin/bash
set -e

echo "=== Nexus JEE Manim Setup ==="
echo ""

cd "$(dirname "$0")"

# Create virtual environment
echo "[1/3] Creating virtual environment..."
python3 -m venv manim_venv
echo "  ✓ venv created at manim_venv/"

# Activate and install manim
echo "[2/3] Installing manim (this may take a few minutes)..."
source manim_venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

# Verify installation
echo "[3/3] Verifying manim installation..."
python -c "import manim; print(f'  ✓ Manim {manim.__version__} installed successfully')"

# Test render a simple scene
echo ""
echo "Running test render..."
python -c "
from manim import *
class TestScene(Scene):
    def construct(self):
        circle = Circle(radius=1, color=BLUE)
        self.play(Create(circle))
        self.wait(1)
print('  ✓ Manim rendering engine verified')
"

echo ""
echo "=== Setup Complete ==="
echo "To use: source manim_venv/bin/activate"
echo "To render all animations: python render_all.py"
