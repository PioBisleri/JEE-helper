import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class BinomialExpansion(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Binomial Expansion & Pascal's Triangle", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"(a+b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k", font_size=28, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Pascal's Triangle
        rows = [
            ["1"],
            ["1", "1"],
            ["1", "2", "1"],
            ["1", "3", "3", "1"],
            ["1", "4", "6", "4", "1"],
            ["1", "5", "10", "10", "5", "1"],
        ]

        triangle = VGroup()
        all_entries = []
        for i, row in enumerate(rows):
            row_group = VGroup()
            for j, val in enumerate(row):
                entry = MathTex(val, font_size=20, color=MATH_CURVE if i <= 3 else MATH_ANNOTATION)
                entry.move_to(np.array([(j - len(row) / 2 + 0.5) * 0.7, -i * 0.55, 0]))
                row_group.add(entry)
                all_entries.append(entry)
            triangle.add(row_group)

        triangle.move_to(DOWN * 0.2)
        self.play(LaggedStart(*[Write(e) for e in all_entries], lag_ratio=0.08), run_time=3)

        # Highlight row 4 (n=4)
        highlight_rect = SurroundingRectangle(triangle[4], color=MATH_TANGENT, buff=0.15)
        self.play(Create(highlight_rect), run_time=0.5)

        # Show connection: binomial coefficients
        coeff_label = MathTex(r"\binom{4}{k}: \; 1, 4, 6, 4, 1", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        coeff_label.to_edge(DOWN, buff=1.0)
        self.play(Write(coeff_label), run_time=0.8)

        # Addition arrows
        arrow_pairs = []
        for i in range(len(rows) - 1):
            for j in range(len(rows[i])):
                if j < len(rows[i]) - 1:
                    pass  # Skip arrows for simplicity, just show the structure

        # Show expansion
        expansion = MathTex(r"(a+b)^4 = a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4", font_size=24, color=MATH_AREA)
        expansion.to_edge(DOWN, buff=0.3)
        self.play(Write(expansion), run_time=1.2)

        insight = Text("Each row gives the coefficients of (a+b)^n", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(expansion, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
