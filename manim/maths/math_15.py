import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class UnitCircle(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Unit Circle: sin & cos", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\sin^2\theta + \cos^2\theta = 1", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Unit circle
        circle = Circle(radius=2, color=MATH_CURVE, stroke_width=2).shift(DOWN * 0.3)
        h_axis = Line(LEFT * 2.5, RIGHT * 2.5, color=MATH_AXIS, stroke_width=1).shift(DOWN * 0.3)
        v_axis = Line(DOWN * 2.3 + UP * 0.3, UP * 2.3 + DOWN * 0.3, color=MATH_AXIS, stroke_width=1).shift(DOWN * 0.3)
        self.play(Create(circle), Create(h_axis), Create(v_axis), run_time=0.8)

        # Rotating point
        theta_tracker = ValueTracker(PI / 4)

        dot = always_redraw(lambda: Dot(
            [2 * np.cos(theta_tracker.get_value()), 2 * np.sin(theta_tracker.get_value()) - 0.3, 0],
            color=MATH_TANGENT, radius=0.1
        ))
        radius = always_redraw(lambda: Line(
            [0, -0.3, 0],
            [2 * np.cos(theta_tracker.get_value()), 2 * np.sin(theta_tracker.get_value()) - 0.3, 0],
            color=MATH_CURVE, stroke_width=2
        ))
        # Cos projection (horizontal)
        cos_line = always_redraw(lambda: Line(
            [0, -0.3, 0],
            [2 * np.cos(theta_tracker.get_value()), -0.3, 0],
            color=MATH_AREA, stroke_width=3
        ))
        # Sin projection (vertical)
        sin_line = always_redraw(lambda: Line(
            [2 * np.cos(theta_tracker.get_value()), -0.3, 0],
            [2 * np.cos(theta_tracker.get_value()), 2 * np.sin(theta_tracker.get_value()) - 0.3, 0],
            color=MATH_ANNOTATION, stroke_width=3
        ))

        cos_label = always_redraw(lambda: MathTex(
            r"\cos\theta", font_size=SMALL_FONT_SIZE, color=MATH_AREA
        ).move_to([np.cos(theta_tracker.get_value()), -0.7, 0] * np.array([2, 1, 1]) * 0.5 + np.array([0, -0.15, 0])))
        sin_label = always_redraw(lambda: MathTex(
            r"\sin\theta", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION
        ).move_to([2 * np.cos(theta_tracker.get_value()) + 0.5, np.sin(theta_tracker.get_value()) - 0.3, 0]))

        theta_arc = always_redraw(lambda: Arc(
            radius=0.4, start_angle=0, angle=theta_tracker.get_value(),
            arc_center=[0, -0.3, 0], color=MATH_CURVE, stroke_width=2
        ))
        theta_label = always_redraw(lambda: MathTex(
            r"\theta", font_size=SMALL_FONT_SIZE, color=MATH_CURVE
        ).move_to([0.6 * np.cos(theta_tracker.get_value() / 2), 0.6 * np.sin(theta_tracker.get_value() / 2) - 0.3, 0]))

        self.add(dot, radius, cos_line, sin_line, cos_label, sin_label, theta_arc, theta_label)

        # Rotate
        self.play(theta_tracker.animate.set_value(2 * PI), run_time=5, rate_func=linear)
        self.play(theta_tracker.animate.set_value(PI / 3), run_time=1)

        # Key values
        values = VGroup(
            MathTex(r"\theta = 0: (1, 0)", font_size=SMALL_FONT_SIZE, color=MATH_AREA),
            MathTex(r"\theta = \pi/2: (0, 1)", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION),
            MathTex(r"\theta = \pi: (-1, 0)", font_size=SMALL_FONT_SIZE, color=MATH_AREA),
            MathTex(r"\theta = 3\pi/2: (0, -1)", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION),
        )
        values.arrange(DOWN, buff=0.2)
        values.to_edge(DOWN, buff=0.3)
        for v in values:
            self.play(Write(v), run_time=0.4)

        insight = Text("cos = x-coordinate, sin = y-coordinate on unit circle", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(values, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DoubleAngle(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Double Angle Identity", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\sin(2\theta) = 2\sin\theta\cos\theta", font_size=34, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Visual proof on unit circle
        axes = Axes(
            x_range=[-1.5, 1.5, 0.5], y_range=[-1.5, 1.5, 0.5],
            x_length=5, y_length=5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(LEFT * 2 + DOWN * 0.3)

        circle = Circle(radius=1.5, color=MATH_AXIS, stroke_width=1).move_to(axes.c2p(0, 0))
        self.play(Create(axes), Create(circle), run_time=0.5)

        theta = PI / 6

        # Point at theta
        p1 = Dot(axes.c2p(1.5 * np.cos(theta), 1.5 * np.sin(theta)), color=MATH_CURVE, radius=0.08)
        # Point at 2*theta
        p2 = Dot(axes.c2p(1.5 * np.cos(2 * theta), 1.5 * np.sin(2 * theta)), color=MATH_TANGENT, radius=0.1)

        # Arcs
        arc1 = Arc(radius=0.6, start_angle=0, angle=theta, arc_center=axes.c2p(0, 0), color=MATH_CURVE, stroke_width=2)
        arc2 = Arc(radius=0.8, start_angle=0, angle=2 * theta, arc_center=axes.c2p(0, 0), color=MATH_TANGENT, stroke_width=2)

        t_label = MathTex(r"\theta", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).move_to(axes.c2p(0.8 * np.cos(theta / 2), 0.8 * np.sin(theta / 2)))
        t2_label = MathTex(r"2\theta", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).move_to(axes.c2p(1.0 * np.cos(theta), 1.0 * np.sin(theta)))

        self.play(FadeIn(p1), Create(arc1), Write(t_label), run_time=0.8)
        self.play(FadeIn(p2), Create(arc2), Write(t2_label), run_time=0.8)

        # Right side: product visualization
        right_group = VGroup()
        sin_val = np.sin(theta)
        cos_val = np.cos(theta)

        # Rectangle: sin(theta) × cos(theta)
        rect_w = cos_val * 2
        rect_h = sin_val * 2
        rect = Rectangle(width=rect_w, height=rect_h, color=MATH_AREA, fill_opacity=0.3, stroke_width=2)
        rect.move_to(RIGHT * 3 + DOWN * 0.3)

        sin_bar = Line(rect.get_bottom(), rect.get_top(), color=MATH_ANNOTATION, stroke_width=3)
        cos_bar = Line(rect.get_left(), rect.get_right(), color=MATH_AREA, stroke_width=3)

        sin_b_label = MathTex(r"\sin\theta", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(sin_bar, LEFT, buff=0.1)
        cos_b_label = MathTex(r"\cos\theta", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(cos_bar, DOWN, buff=0.1)

        area_label = MathTex(r"2 \times \text{area} = \sin(2\theta)", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        area_label.move_to(RIGHT * 3 + DOWN * 2)

        self.play(Create(rect), Create(sin_bar), Create(cos_bar), Write(sin_b_label), Write(cos_b_label), run_time=1)
        self.play(Write(area_label), run_time=0.8)

        insight = Text("sin(2θ) equals twice the area of the θ-triangle", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class SumToProduct(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Sum to Product Formulas", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\sin A + \sin B = 2\sin\!\left(\frac{A+B}{2}\right)\cos\!\left(\frac{A-B}{2}\right)", font_size=24, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 7, 1], y_range=[-2, 2, 0.5],
            x_length=7, y_length=3.5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(DOWN * 0.8)

        self.play(Create(axes), run_time=0.5)

        # Two sine waves
        A_val, B_val = 3.0, 1.5
        wave1 = axes.plot(lambda x: np.sin(A_val * x), x_range=[0, 6.5], color=MATH_CURVE, stroke_width=2)
        wave2 = axes.plot(lambda x: np.sin(B_val * x), x_range=[0, 6.5], color=MATH_ANNOTATION, stroke_width=2)

        l1 = MathTex(r"\sin(3x)", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(axes.c2p(1.5, 1), UR, buff=0.1)
        l2 = MathTex(r"\sin(1.5x)", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(axes.c2p(2, -0.8), DR, buff=0.1)

        self.play(Create(wave1), Write(l1), run_time=1)
        self.play(Create(wave2), Write(l2), run_time=1)

        # Sum wave
        sum_wave = axes.plot(lambda x: np.sin(A_val * x) + np.sin(B_val * x), x_range=[0, 6.5], color=MATH_TANGENT, stroke_width=3)
        sum_label = MathTex(r"\sin(3x) + \sin(1.5x)", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        sum_label.next_to(axes.c2p(4, 1.5), UR, buff=0.1)
        self.play(Create(sum_wave), Write(sum_label), run_time=1.5)

        # Product form
        product_label = MathTex(r"= 2\sin(2.25x)\cos(0.75x)", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        product_label.to_edge(DOWN, buff=0.5)
        self.play(Write(product_label), run_time=0.8)

        insight = Text("Adding waves produces sum; factoring gives product of waves", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class SineRule(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Sine Rule & Circumscribed Circle", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R", font_size=30, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Circumscribed circle
        R = 2.0
        center = ORIGIN + DOWN * 0.3
        circle = Circle(radius=R, color=MATH_AXIS, stroke_width=1.5, stroke_opacity=0.5).move_to(center)
        self.play(Create(circle), run_time=0.5)

        # Triangle vertices on circle
        A_angle = PI / 3
        B_angle = PI
        C_angle = 5 * PI / 3

        A_pt = center + R * np.array([np.cos(A_angle), np.sin(A_angle), 0])
        B_pt = center + R * np.array([np.cos(B_angle), np.sin(B_angle), 0])
        C_pt = center + R * np.array([np.cos(C_angle), np.sin(C_angle), 0])

        triangle = Polygon(A_pt, B_pt, C_pt, color=MATH_CURVE, stroke_width=2.5)

        a_dot = Dot(A_pt, color=MATH_TANGENT, radius=0.08)
        b_dot = Dot(B_pt, color=MATH_TANGENT, radius=0.08)
        c_dot = Dot(C_pt, color=MATH_TANGENT, radius=0.08)

        A_label = MathTex("A", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(A_pt, UP, buff=0.1)
        B_label = MathTex("B", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(B_pt, LEFT, buff=0.1)
        C_label = MathTex("C", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(C_pt, DR, buff=0.1)

        self.play(Create(triangle), FadeIn(a_dot), FadeIn(b_dot), FadeIn(c_dot), run_time=1)
        self.play(Write(A_label), Write(B_label), Write(C_label), run_time=0.5)

        # Side labels
        a_side = Line(B_pt, C_pt, color=MATH_ANNOTATION, stroke_width=2)
        b_side = Line(A_pt, C_pt, color=MATH_AREA, stroke_width=2)
        c_side = Line(A_pt, B_pt, color=MATH_CURVE, stroke_width=2)

        a_label = MathTex("a", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(a_side, DOWN, buff=0.1)
        b_label = MathTex("b", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(b_side, RIGHT, buff=0.1)
        c_label = MathTex("c", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(c_side, UL, buff=0.1)

        self.play(Write(a_label), Write(b_label), Write(c_label), run_time=0.5)

        # Radius line
        center_dot = Dot(center, color=MATH_AXIS, radius=0.06)
        radius_line = Line(center, A_pt, color=MATH_ANNOTATION, stroke_width=1.5, stroke_opacity=0.6)
        r_label = MathTex("R", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(radius_line, UR, buff=0.1)
        self.play(FadeIn(center_dot), Create(radius_line), Write(r_label), run_time=0.5)

        # Angle arcs
        angle_a = Arc(radius=0.3, start_angle=B_angle, angle=A_angle - B_angle if A_angle > B_angle else 2 * PI + A_angle - B_angle,
                      arc_center=A_pt, color=MATH_TANGENT, stroke_width=1.5)
        angle_b = Arc(radius=0.3, start_angle=C_angle, angle=B_angle - C_angle if B_angle > C_angle else 2 * PI + B_angle - C_angle,
                      arc_center=B_pt, color=MATH_TANGENT, stroke_width=1.5)

        self.play(Create(angle_a), Create(angle_b), run_time=0.5)

        # Relation
        relation = MathTex(r"a = 2R\sin A", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        relation.to_edge(DOWN, buff=0.8)
        self.play(Write(relation), run_time=0.8)

        insight = Text("Each side equals 2R times the sine of opposite angle", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
