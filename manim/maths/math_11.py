import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class CircleEquation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Circle: Equation & Parameters", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"(x-h)^2 + (y-k)^2 = r^2", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-5, 5, 1], y_range=[-4, 4, 1],
            x_length=7, y_length=5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.3)

        self.play(Create(axes), run_time=0.5)

        # Animated circle with moving center and radius
        h_tracker = ValueTracker(1)
        k_tracker = ValueTracker(1)
        r_tracker = ValueTracker(2)

        circle = always_redraw(lambda: Circle(
            radius=r_tracker.get_value() * axes.get_x_unit_size(),
            color=MATH_CURVE, stroke_width=3
        ).move_to(axes.c2p(h_tracker.get_value(), k_tracker.get_value())))

        center_dot = always_redraw(lambda: Dot(
            axes.c2p(h_tracker.get_value(), k_tracker.get_value()),
            color=MATH_TANGENT, radius=0.1
        ))
        radius_line = always_redraw(lambda: Line(
            axes.c2p(h_tracker.get_value(), k_tracker.get_value()),
            axes.c2p(h_tracker.get_value() + r_tracker.get_value(), k_tracker.get_value()),
            color=MATH_ANNOTATION, stroke_width=2
        ))
        params_label = always_redraw(lambda: MathTex(
            f"(h,k) = ({h_tracker.get_value():.1f}, {k_tracker.get_value():.1f}),\\; r = {r_tracker.get_value():.1f}",
            font_size=LABEL_FONT_SIZE, color=MATH_TANGENT
        ).to_edge(DOWN, buff=0.8))

        self.add(circle, center_dot, radius_line, params_label)

        # Change center
        self.play(h_tracker.animate.set_value(-1), k_tracker.animate.set_value(-0.5), run_time=1.5)
        self.play(h_tracker.animate.set_value(0), k_tracker.animate.set_value(0), run_time=1)

        # Change radius
        self.play(r_tracker.animate.set_value(3), run_time=1.5)
        self.play(r_tracker.animate.set_value(1.5), run_time=1)

        # General form
        general = MathTex(r"x^2 + y^2 + 2gx + 2fy + c = 0", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        general.to_edge(DOWN, buff=0.3)
        self.play(Write(general), run_time=0.8)

        insight = Text("Center (h,k) and radius r fully determine the circle", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(general, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ParabolaConic(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Parabola: Focus & Directrix", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"y^2 = 4ax", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-2, 5, 1], y_range=[-3, 3, 1],
            x_length=7, y_length=5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(DOWN * 0.3)

        self.play(Create(axes), run_time=0.5)

        a = 1.0
        # Parabola y^2 = 4ax
        parabola = axes.plot_parametric_curve(
            lambda t: np.array([a * t**2, 2 * a * t, 0]),
            t_range=[-2, 2], color=MATH_CURVE, stroke_width=3
        )
        self.play(Create(parabola), run_time=1.5)

        # Focus
        focus = Dot(axes.c2p(a, 0), color=MATH_TANGENT, radius=0.1)
        focus_label = MathTex(r"F(a,0)", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(focus, DOWN, buff=0.1)
        self.play(FadeIn(focus), Write(focus_label), run_time=0.5)

        # Directrix
        directrix = DashedLine(
            axes.c2p(-a, -3), axes.c2p(-a, 3),
            color=MATH_ANNOTATION, stroke_width=2
        )
        dir_label = MathTex(r"x = -a", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(directrix, LEFT, buff=0.1)
        self.play(Create(directrix), Write(dir_label), run_time=0.8)

        # Point on parabola with equal distances
        t_val = 1.0
        point = Dot(axes.c2p(a * t_val**2, 2 * a * t_val), color=MATH_AREA, radius=0.1)
        p_label = MathTex("P", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(point, UR, buff=0.1)

        dist_focus = Line(point.get_center(), focus.get_center(), color=MATH_TANGENT, stroke_width=2, stroke_opacity=0.7)
        dist_dir = Line(point.get_center(), axes.c2p(-a, 2 * a * t_val), color=MATH_ANNOTATION, stroke_width=2, stroke_opacity=0.7)

        pf_label = MathTex("PF", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(dist_focus, RIGHT, buff=0.05)
        pd_label = MathTex("PD", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(dist_dir, LEFT, buff=0.05)

        self.play(FadeIn(point), Write(p_label), run_time=0.5)
        self.play(Create(dist_focus), Create(dist_dir), Write(pf_label), Write(pd_label), run_time=1)

        # Equality
        eq = MathTex(r"PF = PD", font_size=LABEL_FONT_SIZE, color=MATH_CURVE)
        eq.to_edge(DOWN, buff=0.5)
        self.play(Write(eq), run_time=0.8)

        insight = Text("Parabola: locus of points equidistant from focus and directrix", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class EllipseConic(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Ellipse: Foci & Axes", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[-3, 3, 1],
            x_length=7, y_length=5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(DOWN * 0.3)

        self.play(Create(axes), run_time=0.5)

        a, b = 3.0, 2.0
        c = np.sqrt(a**2 - b**2)

        # Ellipse
        ellipse = axes.plot_parametric_curve(
            lambda t: np.array([a * np.cos(t), b * np.sin(t), 0]),
            t_range=[0, 2 * PI], color=MATH_CURVE, stroke_width=3
        )
        self.play(Create(ellipse), run_time=1.5)

        # Foci
        f1 = Dot(axes.c2p(c, 0), color=MATH_TANGENT, radius=0.1)
        f2 = Dot(axes.c2p(-c, 0), color=MATH_TANGENT, radius=0.1)
        f1_label = MathTex(r"F_1", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(f1, DOWN, buff=0.1)
        f2_label = MathTex(r"F_2", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(f2, DOWN, buff=0.1)
        self.play(FadeIn(f1), FadeIn(f2), Write(f1_label), Write(f2_label), run_time=0.8)

        # Semi-axes
        major = Line(axes.c2p(-a, 0), axes.c2p(a, 0), color=MATH_ANNOTATION, stroke_width=2)
        minor = Line(axes.c2p(0, -b), axes.c2p(0, b), color=MATH_AREA, stroke_width=2)
        a_label = MathTex("a", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(major, DOWN, buff=0.1)
        b_label = MathTex("b", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(minor, LEFT, buff=0.1)

        self.play(Create(major), Create(minor), Write(a_label), Write(b_label), run_time=0.8)

        # Property: PF1 + PF2 = 2a
        t_val = PI / 4
        point = Dot(axes.c2p(a * np.cos(t_val), b * np.sin(t_val)), color=MATH_CURVE, radius=0.1)
        p_label = MathTex("P", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(point, UR, buff=0.1)
        line_f1 = Line(point.get_center(), f1.get_center(), color=MATH_TANGENT, stroke_width=1.5, stroke_opacity=0.7)
        line_f2 = Line(point.get_center(), f2.get_center(), color=MATH_TANGENT, stroke_width=1.5, stroke_opacity=0.7)

        self.play(FadeIn(point), Write(p_label), Create(line_f1), Create(line_f2), run_time=1)

        prop = MathTex(r"PF_1 + PF_2 = 2a", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        prop.to_edge(DOWN, buff=0.8)
        self.play(Write(prop), run_time=0.8)

        # Eccentricity
        ecc = MathTex(r"e = \frac{c}{a} = \frac{\sqrt{a^2-b^2}}{a}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        ecc.to_edge(DOWN, buff=0.3)
        self.play(Write(ecc), run_time=0.8)

        insight = Text("Sum of distances from any point to both foci is constant", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(prop, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DistancePointLine(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Perpendicular Distance: Point to Line", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"d = \frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}}", font_size=30, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-3, 5, 1], y_range=[-2, 4, 1],
            x_length=7, y_length=4.5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.6)

        self.play(Create(axes), run_time=0.5)

        # Line: 2x + y - 3 = 0 → y = -2x + 3
        line = axes.plot(lambda x: -2 * x + 3, x_range=[-1, 3], color=MATH_CURVE, stroke_width=3)
        line_label = MathTex(r"2x + y - 3 = 0", font_size=SMALL_FONT_SIZE, color=MATH_CURVE)
        line_label.next_to(axes.c2p(0.5, 2), UL, buff=0.1)
        self.play(Create(line), Write(line_label), run_time=1)

        # Point
        px, py = 3.0, 3.0
        point = Dot(axes.c2p(px, py), color=MATH_TANGENT, radius=0.1)
        p_label = MathTex(f"P({px:.0f},{py:.0f})", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        p_label.next_to(point, UR, buff=0.1)
        self.play(FadeIn(point), Write(p_label), run_time=0.5)

        # Foot of perpendicular
        # Line: 2x + y - 3 = 0, a=2, b=1, c=-3
        a_l, b_l, c_l = 2, 1, -3
        t = (a_l * px + b_l * py + c_l) / (a_l**2 + b_l**2)
        fx, fy = px - a_l * t, py - b_l * t
        foot = Dot(axes.c2p(fx, fy), color=MATH_ANNOTATION, radius=0.08)
        foot_label = MathTex("H", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(foot, DOWN, buff=0.1)

        perp_line = Line(point.get_center(), foot.get_center(), color=MATH_TANGENT, stroke_width=2.5)

        # Distance value
        dist = abs(a_l * px + b_l * py + c_l) / np.sqrt(a_l**2 + b_l**2)
        dist_label = MathTex(f"d = {dist:.2f}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        dist_label.next_to(perp_line, RIGHT, buff=0.15)

        self.play(Create(perp_line), FadeIn(foot), Write(foot_label), Write(dist_label), run_time=1.5)

        # Right angle
        angle_size = 0.2
        angle_dir = (point.get_center() - foot.get_center()) / np.linalg.norm(point.get_center() - foot.get_center())
        perp_dir = np.array([-angle_dir[1], angle_dir[0], 0])
        angle_marker = VGroup(
            Line(foot.get_center() + angle_dir * angle_size, foot.get_center() + angle_dir * angle_size + perp_dir * angle_size, color=MATH_ANNOTATION, stroke_width=1.5),
            Line(foot.get_center() + perp_dir * angle_size, foot.get_center() + angle_dir * angle_size + perp_dir * angle_size, color=MATH_ANNOTATION, stroke_width=1.5),
        )
        self.play(Create(angle_marker), run_time=0.5)

        insight = Text("Drop a perpendicular from the point to the line", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
