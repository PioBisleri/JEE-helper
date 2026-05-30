import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class DotProduct(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Dot Product", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{a} \cdot \vec{b} = |\vec{a}||\vec{b}|\cos\theta", font_size=30, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Two vectors
        origin = np.array([-1.5, -1.5, 0])
        a_vec = np.array([3, 1, 0])
        b_vec = np.array([2, 2.5, 0])

        va = Arrow(origin, origin + a_vec, color=MATH_CURVE, buff=0, stroke_width=3)
        vb = Arrow(origin, origin + b_vec, color=MATH_ANNOTATION, buff=0, stroke_width=3)
        a_label = MathTex(r"\vec{a}", font_size=LABEL_FONT_SIZE, color=MATH_CURVE).next_to(va.get_end(), UR, buff=0.1)
        b_label = MathTex(r"\vec{b}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(vb.get_end(), UL, buff=0.1)

        self.play(GrowArrow(va), Write(a_label), run_time=1)
        self.play(GrowArrow(vb), Write(b_label), run_time=1)

        # Angle arc
        angle = np.arccos(np.dot(a_vec[:2], b_vec[:2]) / (np.linalg.norm(a_vec) * np.linalg.norm(b_vec)))
        arc = Arc(radius=0.6, start_angle=np.arctan2(b_vec[1], b_vec[0]), angle=-angle,
                  arc_center=origin, color=MATH_TANGENT, stroke_width=2)
        theta_label = MathTex(r"\theta", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        theta_label.move_to(origin + 0.9 * np.array([np.cos(np.arctan2(b_vec[1], b_vec[0]) - angle / 2),
                                                      np.sin(np.arctan2(b_vec[1], b_vec[0]) - angle / 2), 0]))
        self.play(Create(arc), Write(theta_label), run_time=0.8)

        # Projection
        a_norm = a_vec / np.dot(a_vec, a_vec)
        proj_scalar = np.dot(b_vec, a_norm)
        proj = a_norm * proj_scalar
        proj_arrow = Arrow(origin, origin + proj, color=MATH_AREA, buff=0, stroke_width=3)
        proj_label = MathTex(r"\text{proj}", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(proj_arrow, DOWN, buff=0.1)

        # Dashed line from b to projection
        dash = DashedLine(origin + b_vec, origin + proj, color=MATH_TANGENT, stroke_width=1.5)

        self.play(GrowArrow(proj_arrow), Write(proj_label), Create(dash), run_time=1)

        # Value
        dot_val = np.dot(a_vec[:2], b_vec[:2])
        val_label = MathTex(r"\vec{a} \cdot \vec{b} = " + f"{dot_val:.1f}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        val_label.to_edge(DOWN, buff=0.5)
        self.play(Write(val_label), run_time=0.8)

        insight = Text("Dot product = projection × magnitude", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class CrossProduct(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Cross Product as Area", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"|\vec{a} \times \vec{b}| = |\vec{a}||\vec{b}|\sin\theta", font_size=30, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        origin = np.array([-1.5, -1, 0])
        a_vec = np.array([3, 0, 0])
        b_vec = np.array([1.5, 2, 0])

        # Parallelogram
        parallelogram = Polygon(
            origin, origin + a_vec, origin + a_vec + b_vec, origin + b_vec,
            color=MATH_AREA, fill_opacity=0.3, stroke_width=2, stroke_color=MATH_CURVE
        )
        va = Arrow(origin, origin + a_vec, color=MATH_CURVE, buff=0, stroke_width=3)
        vb = Arrow(origin, origin + b_vec, color=MATH_ANNOTATION, buff=0, stroke_width=3)
        a_label = MathTex(r"\vec{a}", font_size=LABEL_FONT_SIZE, color=MATH_CURVE).next_to(va, DOWN, buff=0.1)
        b_label = MathTex(r"\vec{b}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(vb, UL, buff=0.1)

        self.play(FadeIn(parallelogram), run_time=0.8)
        self.play(GrowArrow(va), Write(a_label), GrowArrow(vb), Write(b_label), run_time=1)

        # Angle
        angle_val = np.arctan2(b_vec[1], b_vec[0])
        arc = Arc(radius=0.5, start_angle=0, angle=angle_val, arc_center=origin, color=MATH_TANGENT, stroke_width=2)
        theta = MathTex(r"\theta", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).move_to(origin + 0.7 * np.array([np.cos(angle_val / 2), np.sin(angle_val / 2), 0]))
        self.play(Create(arc), Write(theta), run_time=0.5)

        # Area value
        area = a_vec[0] * b_vec[1] - a_vec[1] * b_vec[0]
        area_label = MathTex(r"|\vec{a} \times \vec{b}| = " + f"{area:.1f}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        area_label.to_edge(DOWN, buff=0.8)
        self.play(Write(area_label), run_time=0.8)

        # Direction (out of plane)
        direction = MathTex(r"\vec{a} \times \vec{b} \perp \text{ both } \vec{a}, \vec{b}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        direction.to_edge(DOWN, buff=0.3)
        self.play(Write(direction), run_time=0.8)

        insight = Text("Cross product magnitude = area of parallelogram", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(direction, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class VectorProjection(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Vector Projection", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\text{proj}_{\vec{b}} \vec{a} = \frac{\vec{a} \cdot \vec{b}}{|\vec{b}|^2} \vec{b}", font_size=28, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        origin = np.array([-2, -1.5, 0])
        a_vec = np.array([3, 2, 0])
        b_vec = np.array([4, 0.5, 0])

        va = Arrow(origin, origin + a_vec, color=MATH_CURVE, buff=0, stroke_width=3)
        vb = Arrow(origin, origin + b_vec, color=MATH_ANNOTATION, buff=0, stroke_width=3)
        a_label = MathTex(r"\vec{a}", font_size=LABEL_FONT_SIZE, color=MATH_CURVE).next_to(va.get_end(), UR, buff=0.1)
        b_label = MathTex(r"\vec{b}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(vb.get_end(), DOWN, buff=0.1)

        self.play(GrowArrow(va), Write(a_label), GrowArrow(vb), Write(b_label), run_time=1)

        # Projection
        proj_scalar = np.dot(a_vec, b_vec) / np.dot(b_vec, b_vec)
        proj = b_vec * proj_scalar
        proj_arrow = Arrow(origin, origin + proj, color=MATH_TANGENT, buff=0, stroke_width=3)
        proj_label = MathTex(r"\text{proj}_{\vec{b}} \vec{a}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(proj_arrow, DOWN, buff=0.15)

        # Perpendicular component
        perp = a_vec - proj
        perp_arrow = Arrow(origin + proj, origin + a_vec, color=MATH_ANNOTATION, buff=0, stroke_width=2.5, stroke_opacity=0.7)
        perp_label = MathTex(r"\vec{a} - \text{proj}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(perp_arrow, UL, buff=0.1)

        # Dashed line
        dash = DashedLine(origin + a_vec, origin + proj, color=MATH_TANGENT, stroke_width=1.5, stroke_opacity=0.5)

        self.play(GrowArrow(proj_arrow), Write(proj_label), Create(dash), run_time=1.2)
        self.play(GrowArrow(perp_arrow), Write(perp_label), run_time=0.8)

        # Right angle
        angle_size = 0.2
        dir_proj = proj / np.linalg.norm(proj)
        dir_perp = perp / np.linalg.norm(perp)
        corner = origin + proj
        marker = VGroup(
            Line(corner + dir_proj * angle_size, corner + dir_proj * angle_size + dir_perp * angle_size, color=MATH_TANGENT, stroke_width=1.5),
            Line(corner + dir_perp * angle_size, corner + dir_proj * angle_size + dir_perp * angle_size, color=MATH_TANGENT, stroke_width=1.5),
        )
        self.play(Create(marker), run_time=0.5)

        insight = Text("Projection: component of a along b, perpendicular removed", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class TripleProduct(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Scalar Triple Product", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{a} \cdot (\vec{b} \times \vec{c}) = \det\begin{pmatrix} a_1 & a_2 & a_3 \\ b_1 & b_2 & b_3 \\ c_1 & c_2 & c_3 \end{pmatrix}", font_size=24, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # 3D parallelepiped visualization (simplified 2D projection)
        # Base parallelogram
        origin = np.array([-2, -1, 0])
        b_vec = np.array([3, 0, 0])
        c_vec = np.array([1.5, 2, 0])
        a_3d = np.array([1, 0.5, 1.5])  # a goes "into" the screen (z-component)

        # Project to 2D with perspective
        def project(p):
            scale = 1 / (1 + p[2] * 0.15)
            return np.array([p[0] * scale, p[1] * scale, 0])

        # Bottom face
        bottom = Polygon(
            project(origin), project(origin + b_vec),
            project(origin + b_vec + c_vec), project(origin + c_vec),
            color=MATH_AREA, fill_opacity=0.2, stroke_width=1.5, stroke_color=MATH_CURVE
        )

        # Top face (shifted by a_3d)
        top = Polygon(
            project(origin + a_3d), project(origin + b_vec + a_3d),
            project(origin + b_vec + c_vec + a_3d), project(origin + c_vec + a_3d),
            color=MATH_TANGENT, fill_opacity=0.15, stroke_width=1.5, stroke_color=MATH_TANGENT
        )

        # Vertical edges
        edges = VGroup()
        for corner in [origin, origin + b_vec, origin + b_vec + c_vec, origin + c_vec]:
            edge = Line(project(corner), project(corner + a_3d), color=MATH_ANNOTATION, stroke_width=1.5, stroke_opacity=0.6)
            edges.add(edge)

        # Vectors
        va = Arrow(project(origin), project(origin + a_3d), color=MATH_CURVE, buff=0, stroke_width=2.5)
        vb = Arrow(project(origin), project(origin + b_vec), color=MATH_ANNOTATION, buff=0, stroke_width=2.5)
        vc = Arrow(project(origin), project(origin + c_vec), color=MATH_TANGENT, buff=0, stroke_width=2.5)

        a_l = MathTex(r"\vec{a}", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(va.get_end(), UL, buff=0.1)
        b_l = MathTex(r"\vec{b}", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(vb.get_end(), DOWN, buff=0.1)
        c_l = MathTex(r"\vec{c}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(vc.get_end(), RIGHT, buff=0.1)

        self.play(FadeIn(bottom), FadeIn(top), *[Create(e) for e in edges], run_time=1.5)
        self.play(GrowArrow(va), GrowArrow(vb), GrowArrow(vc), Write(a_l), Write(b_l), Write(c_l), run_time=1)

        # Volume
        vol = abs(np.dot(a_3d, np.cross(b_vec[:3], c_vec[:3])))
        vol_label = MathTex(r"\text{Volume} = |\vec{a} \cdot (\vec{b} \times \vec{c})| = " + f"{vol:.1f}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        vol_label.to_edge(DOWN, buff=0.5)
        self.play(Write(vol_label), run_time=0.8)

        insight = Text("Scalar triple product = volume of parallelepiped", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
