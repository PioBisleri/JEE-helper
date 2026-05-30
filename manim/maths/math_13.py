import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *
from manim import *


class PlaneEquation(ThreeDScene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Plane in 3D Space", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.add_fixed_in_frame_mobjects(title)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"ax + by + cz = d", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.add_fixed_in_frame_mobjects(formula)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        self.set_camera_orientation(phi=70 * DEGREES, theta=-45 * DEGREES)

        # 3D axes
        axes = ThreeDAxes(
            x_range=[-3, 3, 1], y_range=[-3, 3, 1], z_range=[-2, 3, 1],
            x_length=5, y_length=5, z_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
        )

        # Plane: x + y + z = 2
        plane_surface = Surface(
            lambda u, v: np.array([u, v, 2 - u - v]),
            u_range=[-1.5, 2.5], v_range=[-1.5, 2.5],
            resolution=(20, 20),
            fill_color=MATH_CURVE, fill_opacity=0.3,
            stroke_color=MATH_CURVE, stroke_width=0.5,
        )

        # Normal vector
        normal = Arrow3D(
            start=np.array([0.5, 0.5, 1]),
            end=np.array([0.5, 0.5, 1]) + np.array([1, 1, 1]) * 0.8,
            color=MATH_TANGENT, thickness=0.02
        )
        normal_label = MathTex(r"\vec{n} = (1,1,1)", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)

        self.play(Create(axes), run_time=1)
        self.play(Create(plane_surface), run_time=2)
        self.add(normal)
        self.move_camera(theta=-90 * DEGREES, run_time=2)

        # Intercepts
        x_int = Dot3D(np.array([2, 0, 0]), color=MATH_ANNOTATION, radius=0.06)
        y_int = Dot3D(np.array([0, 2, 0]), color=MATH_ANNOTATION, radius=0.06)
        z_int = Dot3D(np.array([0, 0, 2]), color=MATH_ANNOTATION, radius=0.06)

        self.add(x_int, y_int, z_int)
        self.move_camera(theta=-135 * DEGREES, run_time=2)

        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(4)
        self.stop_ambient_camera_rotation()

        self.play(FadeOut(plane_surface), FadeOut(axes), FadeOut(normal), FadeOut(x_int), FadeOut(y_int), FadeOut(z_int), run_time=0.5)

        insight = Text("Normal vector determines plane orientation", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.add_fixed_in_frame_mobjects(insight)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class SkewLines(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Skew Lines: Shortest Distance", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"d = \frac{|(\vec{a_2}-\vec{a_1}) \cdot (\vec{l_1} \times \vec{l_2})|}{|\vec{l_1} \times \vec{l_2}|}", font_size=22, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # 2D projection of 3D skew lines
        # Line 1: along x-axis at z=0
        l1_start = np.array([-3, 0, 0])
        l1_end = np.array([3, 0, 0])
        # Line 2: along y-axis at z=1, offset in x
        l2_start = np.array([0, -2, 0.8])
        l2_end = np.array([0, 2, 0.8])

        # Project to 2D
        def proj(p):
            return np.array([p[0] + p[2] * 0.3, p[1] + p[2] * 0.2, 0])

        line1 = Line(proj(l1_start), proj(l1_end), color=MATH_CURVE, stroke_width=3)
        line2 = Line(proj(l2_start), proj(l2_end), color=MATH_ANNOTATION, stroke_width=3)

        l1_label = MathTex(r"L_1", font_size=LABEL_FONT_SIZE, color=MATH_CURVE).next_to(line1, DOWN, buff=0.1)
        l2_label = MathTex(r"L_2", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(line2, RIGHT, buff=0.1)

        self.play(Create(line1), Write(l1_label), run_time=1)
        self.play(Create(line2), Write(l2_label), run_time=1)

        # Shortest distance (perpendicular segment)
        # For visualization: approximately shortest distance
        closest_on_l1 = np.array([0, 0, 0])
        closest_on_l2 = np.array([0, 0, 0.8])
        dist_line = Line(proj(closest_on_l1), proj(closest_on_l2), color=MATH_TANGENT, stroke_width=2.5, stroke_opacity=0.8)

        # Right angle markers
        d1 = Dot(proj(closest_on_l1), color=MATH_TANGENT, radius=0.06)
        d2 = Dot(proj(closest_on_l2), color=MATH_TANGENT, radius=0.06)
        dist_label = MathTex(r"d", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(dist_line, RIGHT, buff=0.1)

        self.play(Create(dist_line), FadeIn(d1), FadeIn(d2), Write(dist_label), run_time=1.5)

        # Common perpendicular note
        perp_note = MathTex(r"\vec{l_1} \times \vec{l_2} \neq \vec{0}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        perp_note.to_edge(DOWN, buff=0.8)
        self.play(Write(perp_note), run_time=0.8)

        # Show they don't intersect
        no_int = MathTex(r"\text{Lines don't intersect and aren't parallel}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        no_int.to_edge(DOWN, buff=0.3)
        self.play(Write(no_int), run_time=0.8)

        insight = Text("Skew lines: unique common perpendicular gives shortest distance", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(perp_note, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
