import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class TangentLine(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Tangent Line to a Curve", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"y - f(a) = f'(a)(x - a)", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 5, 1], y_range=[-1, 5, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.7)

        curve = axes.plot(lambda x: 0.4 * (x - 1)**2 + 0.5, x_range=[0, 4.5], color=MATH_CURVE, stroke_width=3)
        self.play(Create(axes), Create(curve), run_time=1)

        # Tangent sliding along curve
        x_tracker = ValueTracker(1.0)
        tangent_point = always_redraw(lambda: Dot(
            axes.c2p(x_tracker.get_value(), 0.4 * (x_tracker.get_value() - 1)**2 + 0.5),
            color=MATH_TANGENT, radius=0.1
        ))
        tangent_line = always_redraw(lambda: axes.plot(
            lambda x: (0.4 * 2 * (x_tracker.get_value() - 1)) * (x - x_tracker.get_value()) +
                       0.4 * (x_tracker.get_value() - 1)**2 + 0.5,
            x_range=[max(0, x_tracker.get_value() - 2), min(4.5, x_tracker.get_value() + 2)],
            color=MATH_TANGENT, stroke_width=2.5
        ))
        slope_label = always_redraw(lambda: MathTex(
            f"m = {0.4 * 2 * (x_tracker.get_value() - 1):.2f}",
            font_size=SMALL_FONT_SIZE, color=MATH_TANGENT
        ).next_to(tangent_point, UR, buff=0.15))

        self.add(tangent_point, tangent_line, slope_label)
        self.play(x_tracker.animate.set_value(3.5), run_time=4, rate_func=smooth)
        self.play(x_tracker.animate.set_value(1.0), run_time=2, rate_func=smooth)

        insight = Text("The tangent slope equals the derivative at that point", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class NormalLine(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Normal Line", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"m_{\text{normal}} = -\frac{1}{f'(a)}", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 5, 1], y_range=[-1, 5, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.7)

        curve = axes.plot(lambda x: 0.4 * (x - 1)**2 + 0.5, x_range=[0, 4.5], color=MATH_CURVE, stroke_width=3)
        self.play(Create(axes), Create(curve), run_time=1)

        a = 2.5
        f_a = 0.4 * (a - 1)**2 + 0.5
        f_prime_a = 0.4 * 2 * (a - 1)

        point = Dot(axes.c2p(a, f_a), color=MATH_TANGENT, radius=0.1)
        tangent_line = axes.plot(
            lambda x: f_prime_a * (x - a) + f_a,
            x_range=[a - 1.5, a + 1.5], color=MATH_TANGENT, stroke_width=2
        )
        normal_slope = -1 / f_prime_a
        normal_line = axes.plot(
            lambda x: normal_slope * (x - a) + f_a,
            x_range=[a - 1, a + 1], color=MATH_ANNOTATION, stroke_width=2
        )

        # Right angle symbol
        right_angle_size = 0.2
        angle_marker = VGroup(
            Line(axes.c2p(a, f_a) + RIGHT * right_angle_size * 0.7, axes.c2p(a, f_a) + RIGHT * right_angle_size * 0.7 + UP * right_angle_size * 0.7, color=MATH_ANNOTATION, stroke_width=1.5),
            Line(axes.c2p(a, f_a) + UP * right_angle_size * 0.7, axes.c2p(a, f_a) + RIGHT * right_angle_size * 0.7 + UP * right_angle_size * 0.7, color=MATH_ANNOTATION, stroke_width=1.5),
        )

        t_label = MathTex(r"\text{tangent}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(tangent_line, RIGHT, buff=0.1)
        n_label = MathTex(r"\text{normal}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(normal_line, LEFT, buff=0.1)

        self.play(FadeIn(point), run_time=0.3)
        self.play(Create(tangent_line), Write(t_label), run_time=1)
        self.play(Create(normal_line), Write(n_label), Create(angle_marker), run_time=1)

        # Perpendicularity
        perp = MathTex(r"m_{\text{tangent}} \times m_{\text{normal}} = -1", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        perp.to_edge(DOWN, buff=0.8)
        self.play(Write(perp), run_time=0.8)

        insight = Text("Normal is perpendicular to the tangent", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class MeanValueTheorem(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Mean Value Theorem", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"f'(c) = \frac{f(b) - f(a)}{b - a}", font_size=32, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 6, 1], y_range=[-1, 5, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.8)

        curve = axes.plot(lambda x: 0.2 * (x - 1)**2 + 0.8, x_range=[0, 5], color=MATH_CURVE, stroke_width=3)
        self.play(Create(axes), Create(curve), run_time=1)

        a, b = 1.0, 4.0
        fa = 0.2 * (a - 1)**2 + 0.8
        fb = 0.2 * (b - 1)**2 + 0.8
        secant_slope = (fb - fa) / (b - a)

        # Secant line
        secant = axes.plot(
            lambda x: secant_slope * (x - a) + fa,
            x_range=[0, 5], color=MATH_ANNOTATION, stroke_width=2, stroke_opacity=0.7
        )
        a_dot = Dot(axes.c2p(a, fa), color=MATH_TANGENT, radius=0.1)
        b_dot = Dot(axes.c2p(b, fb), color=MATH_TANGENT, radius=0.1)
        a_label = MathTex("a", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(a_dot, DOWN, buff=0.1)
        b_label = MathTex("b", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(b_dot, DOWN, buff=0.1)

        self.play(Create(secant), FadeIn(a_dot), FadeIn(b_dot), Write(a_label), Write(b_label), run_time=1.5)

        # Find c where tangent is parallel
        c = 2.5
        fc = 0.2 * (c - 1)**2 + 0.8
        f_prime_c = 0.2 * 2 * (c - 1)

        # Parallel tangent
        parallel_tangent = axes.plot(
            lambda x: secant_slope * (x - c) + fc,
            x_range=[c - 1.5, c + 1.5], color=MATH_AREA, stroke_width=2.5
        )
        c_dot = Dot(axes.c2p(c, fc), color=MATH_AREA, radius=0.1)
        c_label = MathTex("c", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(c_dot, DOWN, buff=0.1)

        self.play(Create(parallel_tangent), FadeIn(c_dot), Write(c_label), run_time=1.5)

        # Slope labels
        slope1 = MathTex(r"\frac{f(b)-f(a)}{b-a}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
        slope1.next_to(secant, RIGHT, buff=0.1).shift(UP * 0.3)
        slope2 = MathTex(r"f'(c)", font_size=SMALL_FONT_SIZE, color=MATH_AREA)
        slope2.next_to(parallel_tangent, RIGHT, buff=0.1).shift(DOWN * 0.3)

        self.play(Write(slope1), Write(slope2), run_time=0.8)

        eq = MathTex(r"f'(c) = \text{slope of secant}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        eq.to_edge(DOWN, buff=0.8)
        self.play(Write(eq), run_time=0.8)

        insight = Text("Some tangent is parallel to the secant line", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class Extrema(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Finding Maxima & Minima", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"f'(x)=0, \quad f''(x) \gtrless 0", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-3, 3, 1], y_range=[-3, 4, 1],
            x_length=7, y_length=4.5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.6)

        curve = axes.plot(lambda x: -x**3 + 3*x, x_range=[-2.2, 2.2], color=MATH_CURVE, stroke_width=3)
        self.play(Create(axes), Create(curve), run_time=1)

        # Local max at x=1
        max_point = Dot(axes.c2p(1, 2), color=MATH_TANGENT, radius=0.12)
        max_label = MathTex(r"\text{local max}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        max_label.next_to(max_point, UP, buff=0.15)
        tangent_h1 = axes.plot(lambda x: 2, x_range=[0, 2], color=MATH_TANGENT, stroke_width=1.5, stroke_opacity=0.5)

        # Local min at x=-1
        min_point = Dot(axes.c2p(-1, -2), color=MATH_ANNOTATION, radius=0.12)
        min_label = MathTex(r"\text{local min}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
        min_label.next_to(min_point, DOWN, buff=0.15)
        tangent_h2 = axes.plot(lambda x: -2, x_range=[-2, 0], color=MATH_ANNOTATION, stroke_width=1.5, stroke_opacity=0.5)

        self.play(FadeIn(max_point), Write(max_label), Create(tangent_h1), run_time=1.5)
        self.play(FadeIn(min_point), Write(min_label), Create(tangent_h2), run_time=1.5)

        # Second derivative labels
        sd1 = MathTex(r"f''(1) < 0 \implies \text{max}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        sd1.to_edge(DOWN, buff=1.0).shift(LEFT * 2)
        sd2 = MathTex(r"f''(-1) > 0 \implies \text{min}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
        sd2.to_edge(DOWN, buff=1.0).shift(RIGHT * 2)
        self.play(Write(sd1), Write(sd2), run_time=0.8)

        insight = Text("f'(x)=0 finds critical points; f''(x) determines type", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
