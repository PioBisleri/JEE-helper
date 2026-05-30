import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class ArgandPlane(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Complex Numbers on Argand Plane", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"z = x + iy \leftrightarrow (x, y)", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Argand plane
        plane = ComplexPlane(
            x_range=[-4, 4, 1], y_range=[-3, 3, 1],
            x_length=7, y_length=5,
            background_line_style={"stroke_color": MATH_AXIS, "stroke_width": 1},
            axis_config={"color": MATH_AXIS, "stroke_width": 2},
        ).shift(DOWN * 0.3)
        plane_labels = plane.get_axis_labels(x_label="\\text{Re}", y_label="\\text{Im}")
        self.play(Create(plane), Write(plane_labels), run_time=1.5)

        # Complex number z = 2 + 1.5i
        z_point = Dot(plane.c2p(2, 1.5), color=MATH_POINT, radius=0.1)
        z_label = MathTex("z = 2 + 1.5i", font_size=LABEL_FONT_SIZE, color=MATH_POINT)
        z_label.next_to(z_point, UR, buff=0.15)

        # Vector from origin
        vector = Arrow(plane.c2p(0, 0), plane.c2p(2, 1.5), color=MATH_CURVE, buff=0, stroke_width=3)

        # Projection lines
        proj_x = DashedLine(plane.c2p(2, 0), plane.c2p(2, 1.5), color=MATH_ANNOTATION, stroke_width=1.5)
        proj_y = DashedLine(plane.c2p(0, 1.5), plane.c2p(2, 1.5), color=MATH_ANNOTATION, stroke_width=1.5)
        x_label = MathTex("x=2", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(proj_x, DOWN, buff=0.1)
        y_label = MathTex("y=1.5", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(proj_y, LEFT, buff=0.1)

        self.play(GrowArrow(vector), run_time=1)
        self.play(FadeIn(z_point), Write(z_label), run_time=0.8)
        self.play(Create(proj_x), Create(proj_y), Write(x_label), Write(y_label), run_time=1)

        # Modulus
        mod_formula = MathTex(r"|z| = \sqrt{x^2 + y^2} = \sqrt{6.25} = 2.5", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        mod_formula.to_edge(DOWN, buff=0.8)
        self.play(Write(mod_formula), run_time=1)

        # Animate another point
        z2 = Dot(plane.c2p(-1, 2), color=MATH_TANGENT, radius=0.1)
        z2_label = MathTex("w = -1+2i", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        z2_label.next_to(z2, UL, buff=0.15)
        v2 = Arrow(plane.c2p(0, 0), plane.c2p(-1, 2), color=MATH_TANGENT, buff=0, stroke_width=2)
        self.play(GrowArrow(v2), FadeIn(z2), Write(z2_label), run_time=1)

        insight = Text("Every complex number is a point in 2D", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class EulerFormula(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Euler's Formula", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"e^{i\theta} = \cos\theta + i\sin\theta", font_size=38, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Unit circle
        circle = Circle(radius=2, color=MATH_CURVE, stroke_width=2).shift(DOWN * 0.3)
        self.play(Create(circle), run_time=1)

        # Axes through circle
        h_line = Line(LEFT * 2.5, RIGHT * 2.5, color=MATH_AXIS, stroke_width=1).shift(DOWN * 0.3)
        v_line = Line(DOWN * 2.3 + UP * 0.3, UP * 2.3 + DOWN * 0.3, color=MATH_AXIS, stroke_width=1).shift(DOWN * 0.3)
        self.play(Create(h_line), Create(v_line), run_time=0.5)

        # Rotating point
        theta_tracker = ValueTracker(0)
        dot = always_redraw(lambda: Dot(
            [2 * np.cos(theta_tracker.get_value()), 2 * np.sin(theta_tracker.get_value(), ) - 0.3, 0],
            color=MATH_POINT, radius=0.1
        ))
        radius_line = always_redraw(lambda: Line(
            [0, -0.3, 0],
            [2 * np.cos(theta_tracker.get_value()), 2 * np.sin(theta_tracker.get_value()) - 0.3, 0],
            color=MATH_TANGENT, stroke_width=2
        ))
        # cos projection
        cos_line = always_redraw(lambda: DashedLine(
            [0, -0.3, 0],
            [2 * np.cos(theta_tracker.get_value()), -0.3, 0],
            color=MATH_AREA, stroke_width=2
        ))
        # sin projection
        sin_line = always_redraw(lambda: DashedLine(
            [2 * np.cos(theta_tracker.get_value()), -0.3, 0],
            [2 * np.cos(theta_tracker.get_value()), 2 * np.sin(theta_tracker.get_value()) - 0.3, 0],
            color=MATH_ANNOTATION, stroke_width=2
        ))
        theta_arc = always_redraw(lambda: Arc(
            radius=0.5, start_angle=0, angle=theta_tracker.get_value(),
            arc_center=[0, -0.3, 0], color=MATH_CURVE, stroke_width=2
        ))

        cos_label = always_redraw(lambda: MathTex(
            r"\cos\theta", font_size=SMALL_FONT_SIZE, color=MATH_AREA
        ).move_to([np.cos(theta_tracker.get_value()), -0.7, 0] * np.array([2, 1, 1]) * 0.5 + np.array([0, -0.5, 0])))

        self.add(dot, radius_line, cos_line, sin_line, theta_arc)
        self.play(theta_tracker.animate.set_value(2 * PI), run_time=6, rate_func=linear)
        self.play(theta_tracker.animate.set_value(PI / 4), run_time=1)

        insight = Text("e^(iπ) + 1 = 0 — Euler's identity", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class RootsOfUnity(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Roots of Unity", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"z^n = 1 \implies z_k = e^{2\pi ik/n}", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Unit circle
        circle = Circle(radius=2, color=MATH_AXIS, stroke_width=1.5).shift(DOWN * 0.3)
        self.play(Create(circle), run_time=0.5)

        n = 6
        dots = VGroup()
        labels = VGroup()
        lines = VGroup()
        for k in range(n):
            angle = 2 * PI * k / n
            x, y = 2 * np.cos(angle), 2 * np.sin(angle)
            d = Dot([x, y - 0.3, 0], color=MATH_POINT, radius=0.1)
            l = MathTex(f"z_{k}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
            l.next_to(d, direction=np.array([np.cos(angle), np.sin(angle), 0]) * 1.2)
            line = Line([0, -0.3, 0], [x, y - 0.3, 0], color=MATH_CURVE, stroke_width=1.5, stroke_opacity=0.5)
            dots.add(d)
            labels.add(l)
            lines.add(line)

        self.play(LaggedStart(*[Create(l) for l in lines], lag_ratio=0.1), run_time=1)
        self.play(LaggedStart(*[FadeIn(d, scale=1.5) for d in dots], lag_ratio=0.06), run_time=0.8)
        self.play(LaggedStart(*[Write(l) for l in labels], lag_ratio=0.06), run_time=0.6)

        # Polygon connecting roots
        polygon_points = [dots[k].get_center() for k in range(n)] + [dots[0].get_center()]
        polygon = VMobject(color=MATH_TANGENT, stroke_width=2)
        polygon.set_points_as_corners(polygon_points)
        self.play(Create(polygon), run_time=0.8)

        # Show general polygon formula
        poly_label = MathTex(r"\text{Regular } n\text{-gon inscribed in unit circle}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        poly_label.to_edge(DOWN, buff=0.8)
        self.play(Write(poly_label), run_time=0.5)

        insight = Text("n-th roots form a regular n-gon on the unit circle", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(0.5)


class DeMoivre(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("De Moivre's Theorem", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"(\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)", font_size=28, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Show rotation and scaling
        plane = Axes(
            x_range=[-3, 3, 1], y_range=[-3, 3, 1],
            x_length=5, y_length=5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(DOWN * 0.5)

        # Initial vector z
        theta0 = PI / 4
        z_start = plane.c2p(1.5 * np.cos(theta0), 1.5 * np.sin(theta0))
        z_arrow = Arrow(plane.c2p(0, 0), z_start, color=MATH_CURVE, buff=0, stroke_width=3)
        z_label = MathTex("z", font_size=LABEL_FONT_SIZE, color=MATH_CURVE).next_to(z_arrow.get_end(), UR, buff=0.1)

        self.play(Create(plane), run_time=0.5)
        self.play(GrowArrow(z_arrow), Write(z_label), run_time=1)

        # Show z^2 - rotation by theta
        for power in [2, 3]:
            new_theta = theta0 * power
            new_end = plane.c2p(1.5 * np.cos(new_theta), 1.5 * np.sin(new_theta))
            new_arrow = Arrow(plane.c2p(0, 0), new_end, color=MATH_TANGENT if power == 2 else MATH_ANNOTATION, buff=0, stroke_width=2.5)
            new_label = MathTex(f"z^{power}", font_size=LABEL_FONT_SIZE, color=new_arrow.get_color()).next_to(new_arrow.get_end(), UR, buff=0.1)

            # Arc showing rotation
            arc = Arc(radius=0.8, start_angle=0, angle=new_theta, arc_center=plane.c2p(0, 0), color=MATH_AREA, stroke_width=2)

            self.play(GrowArrow(new_arrow), Write(new_label), Create(arc), run_time=1.5)

        insight = Text("Raising to power n rotates by nθ", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
