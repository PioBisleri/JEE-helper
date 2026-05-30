import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class LimitApproach(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Limits: Approaching a Value", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\lim_{x \to a} f(x) = L", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 5, 1], y_range=[-1, 5, 1],
            x_length=7, y_length=4.5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.6)

        # f(x) with a hole at x=2
        def func(x):
            if abs(x - 2) < 0.01:
                return 3.001
            return 2 + 0.5 * (x - 1)**2

        curve = axes.plot(func, x_range=[0, 4.5], color=MATH_CURVE, stroke_width=3)
        curve_label = MathTex(r"f(x) = 2 + 0.5(x-1)^2", font_size=SMALL_FONT_SIZE, color=MATH_CURVE)
        curve_label.next_to(axes.c2p(4, func(4)), UR, buff=0.2)

        # Hole at x=2
        hole = Circle(radius=0.08, color=BG_COLOR, fill_opacity=1, stroke_width=2, stroke_color=MATH_CURVE).move_to(axes.c2p(2, func(2)))

        # Limit point
        limit_dot = Dot(axes.c2p(2, 3), color=MATH_TANGENT, radius=0.1)

        self.play(Create(axes), run_time=0.5)
        self.play(Create(curve), Write(curve_label), Create(hole), run_time=1.5)

        # Approach from left
        left_dot = ValueTracker(0.5)
        left_point = always_redraw(lambda: Dot(
            axes.c2p(left_dot.get_value(), func(left_dot.get_value())),
            color=MATH_ANNOTATION, radius=0.08
        ))
        left_trace = always_redraw(lambda: axes.plot(
            lambda x: func(x), x_range=[0.5, left_dot.get_value()], color=MATH_ANNOTATION, stroke_width=2
        ))
        left_label = always_redraw(lambda: MathTex(
            f"x \\to 2^-", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION
        ).next_to(left_point, DOWN, buff=0.15))

        self.add(left_point, left_trace, left_label)
        self.play(left_dot.animate.set_value(1.99), run_time=2)

        # Approach from right
        right_dot = ValueTracker(3.5)
        right_point = always_redraw(lambda: Dot(
            axes.c2p(right_dot.get_value(), func(right_dot.get_value())),
            color=MATH_AREA, radius=0.08
        ))
        right_trace = always_redraw(lambda: axes.plot(
            lambda x: func(x), x_range=[right_dot.get_value(), 3.5], color=MATH_AREA, stroke_width=2
        ))
        right_label = always_redraw(lambda: MathTex(
            f"x \\to 2^+", font_size=SMALL_FONT_SIZE, color=MATH_AREA
        ).next_to(right_point, DOWN, buff=0.15))

        self.add(right_point, right_trace, right_label)
        self.play(right_dot.animate.set_value(2.01), run_time=2)

        # Limit value
        limit_val = MathTex(r"\lim_{x \to 2} f(x) = 3", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        limit_val.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(limit_dot), Write(limit_val), run_time=1)

        insight = Text("Both sides must approach the same value", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class SincLimit(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("The Sinc Limit", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\lim_{x \to 0} \frac{\sin x}{x} = 1", font_size=38, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[-0.5, 1.5, 0.5],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.7)

        sinc_curve = axes.plot(lambda x: np.sinc(x / PI), x_range=[-3.5, 3.5], color=MATH_CURVE, stroke_width=3)
        sinc_label = MathTex(r"\frac{\sin x}{x}", font_size=LABEL_FONT_SIZE, color=MATH_CURVE)
        sinc_label.next_to(axes.c2p(2.5, np.sinc(2.5 / PI)), UR, buff=0.2)

        # Limit point
        limit_dot = Dot(axes.c2p(0, 1), color=MATH_TANGENT, radius=0.12)
        limit_label = MathTex("1", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(limit_dot, LEFT, buff=0.15)

        self.play(Create(axes), run_time=0.5)
        self.play(Create(sinc_curve), Write(sinc_label), run_time=1.5)
        self.play(FadeIn(limit_dot), Write(limit_label), run_time=0.8)

        # Table of values approaching 0
        table_data = [
            [r"x", r"\pm 0.5", r"\pm 0.1", r"\pm 0.01", r"\pm 0.001"],
            [r"\frac{\sin x}{x}", r"0.9589", r"0.9983", r"0.999998", r"\approx 1"],
        ]
        table = MathTex(*[cell for row in table_data for cell in row], font_size=18, color=MATH_ANNOTATION)
        # Build table manually
        table_group = VGroup()
        for i, row in enumerate(table_data):
            for j, cell in enumerate(row):
                m = MathTex(cell, font_size=18, color=MATH_ANNOTATION if i == 0 else MATH_AREA)
                m.move_to(np.array([j * 1.4 - 2.8, -i * 0.4 - 1.5, 0]))
                table_group.add(m)

        self.play(FadeIn(table_group), run_time=1)
        self.wait(2)

        insight = Text("sin(x)/x approaches 1 as x → 0", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DerivativeAsLimit(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Derivative as Limit of Secants", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}", font_size=28, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 5, 1], y_range=[-1, 5, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.7)

        curve = axes.plot(lambda x: 0.3 * (x - 1)**2 + 1, x_range=[0, 4.5], color=MATH_CURVE, stroke_width=3)

        self.play(Create(axes), Create(curve), run_time=1)

        # Fixed point
        x0 = 2.0
        fixed_point = Dot(axes.c2p(x0, 0.3 * (x0 - 1)**2 + 1), color=MATH_TANGENT, radius=0.1)
        fixed_label = MathTex("x", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(fixed_point, DOWN, buff=0.15)
        self.play(FadeIn(fixed_point), Write(fixed_label), run_time=0.5)

        # Moving secant point
        h_tracker = ValueTracker(2.0)
        moving_point = always_redraw(lambda: Dot(
            axes.c2p(x0 + h_tracker.get_value(), 0.3 * (x0 + h_tracker.get_value() - 1)**2 + 1),
            color=MATH_ANNOTATION, radius=0.08
        ))
        secant_line = always_redraw(lambda: Line(
            fixed_point.get_center(),
            moving_point.get_center(),
            color=MATH_TANGENT, stroke_width=2.5
        ))
        slope_label = always_redraw(lambda: MathTex(
            f"h = {h_tracker.get_value():.2f}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION
        ).next_to(moving_point, UR, buff=0.1))

        self.add(moving_point, secant_line, slope_label)

        # h approaches 0
        self.play(h_tracker.animate.set_value(0.5), run_time=2)
        self.play(h_tracker.animate.set_value(0.1), run_time=1.5)

        # Show tangent line (h=0)
        tangent_slope = 0.3 * 2 * (x0 - 1)
        tangent_line = axes.plot(
            lambda x: 0.3 * (x0 - 1)**2 + 1 + tangent_slope * (x - x0),
            x_range=[0.5, 3.5], color=MATH_AREA, stroke_width=2.5
        )
        tangent_label = MathTex(r"f'(x)", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        tangent_label.next_to(axes.c2p(3.5, 0.3 * (x0 - 1)**2 + 1 + tangent_slope * 1.5), UR, buff=0.1)

        self.play(h_tracker.animate.set_value(0), run_time=0.5)
        self.play(Create(tangent_line), Write(tangent_label), run_time=1)

        insight = Text("Secant line → tangent line as h → 0", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
