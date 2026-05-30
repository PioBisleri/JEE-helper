import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class SeparableDE(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Separable Differential Equations", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{dy}{dx} = f(x)g(y) \implies \int \frac{dy}{g(y)} = \int f(x)\,dx", font_size=24, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 5, 1], y_range=[-1, 4, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.8)

        self.play(Create(axes), run_time=0.5)

        # dy/dx = ky (exponential growth)
        de_label = MathTex(r"\frac{dy}{dx} = ky", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        de_label.to_edge(DOWN, buff=1.0).shift(LEFT * 2)
        sol_label = MathTex(r"y = Ce^{kx}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        sol_label.to_edge(DOWN, buff=1.0).shift(RIGHT * 2)
        self.play(Write(de_label), Write(sol_label), run_time=0.8)

        # Multiple solution curves for different C
        curves = VGroup()
        for C in [0.5, 1.0, 1.5, 2.0]:
            curve = axes.plot(lambda x, C=C: C * np.exp(0.5 * x), x_range=[0, 3.5], color=MATH_CURVE, stroke_width=2)
            curves.add(curve)

        self.play(LaggedStart(*[Create(c) for c in curves], lag_ratio=0.3), run_time=3)

        # Slope field
        slope_lines = VGroup()
        for x in np.arange(0.5, 4, 0.7):
            for y in np.arange(0.5, 3.5, 0.7):
                slope = 0.5 * y
                angle = np.arctan(slope)
                line_len = 0.2
                start = axes.c2p(x, y)
                end = axes.c2p(x + line_len * np.cos(angle), y + line_len * np.sin(angle))
                line = Line(start, end, color=MATH_ANNOTATION, stroke_width=1, stroke_opacity=0.5)
                slope_lines.add(line)

        self.play(FadeIn(slope_lines), run_time=1.5)

        insight = Text("Separate variables and integrate both sides", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class IntegratingFactor(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Integrating Factor Method", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{dy}{dx} + P(x)y = Q(x)", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # IF formula
        if_formula = MathTex(r"\text{I.F.} = e^{\int P(x)\,dx}", font_size=28, color=MATH_ANNOTATION)
        if_formula.next_to(formula, DOWN, buff=0.5)
        self.play(Write(if_formula), run_time=0.8)

        # Solution
        solution = MathTex(r"y \cdot \text{I.F.} = \int Q(x) \cdot \text{I.F.}\,dx", font_size=26, color=MATH_TANGENT)
        solution.next_to(if_formula, DOWN, buff=0.5)
        self.play(Write(solution), run_time=0.8)

        # Step-by-step example
        example_title = MathTex(r"\text{Example: } \frac{dy}{dx} + \frac{y}{x} = x", font_size=24, color=MATH_AREA)
        example_title.to_edge(DOWN, buff=1.5)
        self.play(Write(example_title), run_time=0.8)

        steps = VGroup(
            MathTex(r"P(x) = \frac{1}{x}", font_size=20, color=MATH_ANNOTATION),
            MathTex(r"\text{I.F.} = e^{\int \frac{dx}{x}} = e^{\ln x} = x", font_size=20, color=MATH_ANNOTATION),
            MathTex(r"y \cdot x = \int x \cdot x\,dx = \frac{x^3}{3} + C", font_size=20, color=MATH_AREA),
            MathTex(r"y = \frac{x^2}{3} + \frac{C}{x}", font_size=20, color=MATH_CURVE),
        )
        steps.arrange(DOWN, buff=0.3)
        steps.to_edge(DOWN, buff=0.3)

        for s in steps:
            self.play(Write(s), run_time=0.7)

        insight = Text("The IF makes the left side an exact derivative", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
