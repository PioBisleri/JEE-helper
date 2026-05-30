import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class APSequence(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Arithmetic Progression", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"a_n = a + (n-1)d", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Number line
        line = Line(LEFT * 5.5, RIGHT * 5.5, color=MATH_AXIS, stroke_width=2).shift(DOWN * 0.3)
        self.play(Create(line), run_time=0.5)

        a, d = 1, 1.5
        n_terms = 7
        dots = VGroup()
        labels = VGroup()
        arrows = VGroup()

        for i in range(n_terms):
            x = (i - 3) * 1.5
            val = a + i * d
            dot = Dot([x, -0.3, 0], color=MATH_POINT, radius=0.1)
            lbl = MathTex(f"{val:.0f}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(dot, DOWN, buff=0.15)
            dots.add(dot)
            labels.add(lbl)

        self.play(LaggedStart(*[FadeIn(d, scale=1.5) for d in dots], lag_ratio=0.15), run_time=2)
        self.play(LaggedStart(*[Write(l) for l in labels], lag_ratio=0.1), run_time=1)

        # Show constant difference arrows
        for i in range(n_terms - 1):
            arr = Arrow(dots[i].get_right(), dots[i + 1].get_left(), buff=0.05, color=MATH_TANGENT, stroke_width=2, max_tip_length_to_length_ratio=0.15)
            d_label = MathTex(f"d={d:.0f}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(arr, UP, buff=0.05)
            arrows.add(VGroup(arr, d_label))

        self.play(LaggedStart(*[FadeIn(a) for a in arrows], lag_ratio=0.15), run_time=2)

        # Show sum formula
        sum_formula = MathTex(r"S_n = \frac{n}{2}(2a + (n-1)d)", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        sum_formula.to_edge(DOWN, buff=0.5)
        self.play(Write(sum_formula), run_time=1)

        insight = Text("Constant difference d between consecutive terms", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class GPSequence(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Geometric Progression", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"a_n = a \cdot r^{n-1}", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 8, 1], y_range=[0, 50, 10],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.8)
        x_label = axes.get_x_axis_label("n")
        y_label = axes.get_y_axis_label("a_n")
        self.play(Create(axes), Write(x_label), Write(y_label), run_time=0.8)

        a, r = 1, 1.8
        # Growing GP
        dots = VGroup()
        bars = VGroup()
        for i in range(7):
            val = a * r**i
            x = axes.c2p(i + 1, val)
            bar = Rectangle(width=0.4, height=max(val * axes.get_y_unit_size(), 0.05), color=MATH_CURVE, fill_opacity=0.4)
            bar.move_to(axes.c2p(i + 1, 0), aligned_edge=DOWN)
            dot = Dot(x, color=MATH_POINT, radius=0.08)
            lbl = MathTex(f"{val:.1f}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(dot, UP, buff=0.1)
            dots.add(dot)
            bars.add(VGroup(bar, lbl))

        self.play(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.12), run_time=2.5)

        # Show ratio arrows
        for i in range(6):
            ratio_label = MathTex(f"×{r}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
            ratio_label.move_to((bars[i].get_top() + bars[i + 1].get_top()) / 2 + UP * 0.3)

        # Convergence note
        conv_label = MathTex(r"|r| < 1 \implies \text{convergent}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        conv_label.to_edge(DOWN, buff=0.8)
        self.play(Write(conv_label), run_time=0.8)

        # Change to convergent
        self.play(FadeOut(bars), FadeOut(dots), run_time=0.5)

        r2 = 0.7
        bars2 = VGroup()
        for i in range(7):
            val = 5 * r2**i
            bar = Rectangle(width=0.4, height=max(val * axes.get_y_unit_size(), 0.05), color=MATH_AREA, fill_opacity=0.4)
            bar.move_to(axes.c2p(i + 1, 0), aligned_edge=DOWN)
            bars2.add(bar)

        self.play(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars2], lag_ratio=0.12), run_time=2)

        insight = Text("|r| > 1 grows, |r| < 1 converges to 0", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class AMGMInequality(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("AM-GM Inequality", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{a+b}{2} \geq \sqrt{ab}", font_size=38, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Geometric proof: semicircle
        # AB is diameter, C is point on circle, CD is perpendicular to AB
        # AM = (a+b)/2 (radius), GM = sqrt(ab) (height of perpendicular)
        radius = 2.5
        center = ORIGIN + DOWN * 0.5
        A = center + LEFT * radius
        B = center + RIGHT * radius

        # Semicircle
        semicircle = Arc(radius=radius, start_angle=0, angle=PI, arc_center=center, color=MATH_CURVE, stroke_width=2)
        diameter = Line(A, B, color=MATH_AXIS, stroke_width=2)

        # Point C on semicircle
        theta = PI / 3
        C = center + radius * np.array([np.cos(theta), np.sin(theta), 0])

        # Perpendicular from C to diameter
        foot = center + radius * np.array([np.cos(theta), 0, 0])
        perpendicular = Line(C, foot, color=MATH_TANGENT, stroke_width=2.5)

        # Labels
        a_label = MathTex("a", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(A, DOWN, buff=0.15)
        b_label = MathTex("b", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(B, DOWN, buff=0.15)
        am_label = MathTex(r"AM = \frac{a+b}{2}", font_size=SMALL_FONT_SIZE, color=MATH_AREA)
        am_label.next_to(center, DOWN, buff=0.3)
        gm_label = MathTex(r"GM = \sqrt{ab}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        gm_label.next_to(perpendicular, RIGHT, buff=0.15)

        radius_line = Line(center, C, color=MATH_CURVE, stroke_width=2, stroke_opacity=0.5)

        self.play(Create(diameter), Create(semicircle), run_time=1.5)
        self.play(Write(a_label), Write(b_label), run_time=0.5)
        self.play(Create(radius_line), Write(am_label), run_time=1)
        self.play(Create(perpendicular), Write(gm_label), run_time=1)

        # Animate point C along semicircle
        theta_tracker = ValueTracker(PI / 3)
        moving_C = always_redraw(lambda: Dot(
            center + radius * np.array([
                np.cos(theta_tracker.get_value()), np.sin(theta_tracker.get_value()), 0
            ]),
            color=MATH_CURVE, radius=0.08
        ))
        moving_foot = always_redraw(lambda: Dot(
            center + radius * np.array([
                np.cos(theta_tracker.get_value()), 0, 0
            ]),
            color=MATH_TANGENT, radius=0.08
        ))
        moving_perp = always_redraw(lambda: Line(moving_C.get_center(), moving_foot.get_center(), color=MATH_TANGENT, stroke_width=2.5))
        moving_radius = always_redraw(lambda: Line(center, moving_C.get_center(), color=MATH_CURVE, stroke_width=2, stroke_opacity=0.5))

        self.remove(perpendicular, radius_line)
        self.add(moving_C, moving_foot, moving_perp, moving_radius)
        self.play(theta_tracker.animate.set_value(PI / 2), run_time=2)
        self.play(theta_tracker.animate.set_value(PI / 4), run_time=2)

        # Equality condition
        eq_label = MathTex(r"\text{Equality when } a = b", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        eq_label.to_edge(DOWN, buff=0.5)
        self.play(Write(eq_label), run_time=0.8)

        insight = Text("AM ≥ GM: radius is always ≥ perpendicular height", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
