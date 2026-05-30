import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class Determinant2x2(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Determinant as Area", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Show matrix
        matrix = MathTex(r"\begin{pmatrix} 3 & 1 \\ 1 & 2 \end{pmatrix}", font_size=36, color=MATH_ANNOTATION)
        matrix.shift(LEFT * 3 + DOWN * 0.5)
        self.play(Write(matrix), run_time=0.8)

        det_val = MathTex(r"\det = 3 \times 2 - 1 \times 1 = 5", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        det_val.shift(RIGHT * 2 + DOWN * 0.5)
        self.play(Write(det_val), run_time=0.8)

        # Parallelogram visualization
        origin = np.array([-1, -2.5, 0])
        v1 = np.array([3, 0, 0])
        v2 = np.array([1, 2, 0])

        parallelogram = Polygon(
            origin, origin + v1, origin + v1 + v2, origin + v2,
            color=MATH_AREA, fill_opacity=0.3, stroke_width=2, stroke_color=MATH_CURVE
        )
        vec1 = Arrow(origin, origin + v1, color=MATH_POINT, buff=0, stroke_width=3)
        vec2 = Arrow(origin, origin + v2, color=MATH_TANGENT, buff=0, stroke_width=3)
        vec1_label = MathTex(r"\vec{u}", font_size=SMALL_FONT_SIZE, color=MATH_POINT).next_to(vec1, DOWN, buff=0.1)
        vec2_label = MathTex(r"\vec{v}", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(vec2, LEFT, buff=0.1)

        area_label = MathTex(r"\text{Area} = |\det| = 5", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        area_label.to_edge(DOWN, buff=0.5)

        self.play(FadeIn(parallelogram), run_time=1)
        self.play(GrowArrow(vec1), GrowArrow(vec2), Write(vec1_label), Write(vec2_label), run_time=1)
        self.play(Write(area_label), run_time=0.8)

        # Animate determinant value change
        self.wait(1)

        insight = Text("Determinant = signed area of parallelogram", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class LinearTransformation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Linear Transformation", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{y} = A\vec{x}", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Grid
        grid_lines = VGroup()
        for x in range(-4, 5):
            line = Line([x, -3, 0], [x, 3, 0], color=MATH_AXIS, stroke_width=0.5, stroke_opacity=0.4)
            grid_lines.add(line)
        for y in range(-3, 4):
            line = Line([-4, y, 0], [4, y, 0], color=MATH_AXIS, stroke_width=0.5, stroke_opacity=0.4)
            grid_lines.add(line)

        self.play(FadeIn(grid_lines), run_time=0.5)

        # Standard basis vectors
        i_hat = Arrow(ORIGIN, RIGHT, color=MATH_TANGENT, buff=0, stroke_width=3)
        j_hat = Arrow(ORIGIN, UP, color=MATH_ANNOTATION, buff=0, stroke_width=3)
        i_label = MathTex(r"\hat{i}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(i_hat, DOWN, buff=0.1)
        j_label = MathTex(r"\hat{j}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(j_hat, LEFT, buff=0.1)

        self.play(GrowArrow(i_hat), GrowArrow(j_hat), Write(i_label), Write(j_label), run_time=0.8)

        # Rotation matrix
        matrix_label = MathTex(r"A = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}", font_size=24, color=MATH_CURVE)
        matrix_label.to_edge(DOWN, buff=0.8)
        self.play(Write(matrix_label), run_time=0.8)

        # Animate rotation
        angle = PI / 4
        rotated_grid = VGroup()
        cos_a, sin_a = np.cos(angle), np.sin(angle)
        for x in range(-4, 5):
            start = np.array([x, -3, 0])
            end = np.array([x, 3, 0])
            new_start = np.array([cos_a * start[0] - sin_a * start[1], sin_a * start[0] + cos_a * start[1], 0])
            new_end = np.array([cos_a * end[0] - sin_a * end[1], sin_a * end[0] + cos_a * end[1], 0])
            rotated_grid.add(Line(new_start, new_end, color=MATH_CURVE, stroke_width=0.8, stroke_opacity=0.6))
        for y in range(-3, 4):
            start = np.array([-4, y, 0])
            end = np.array([4, y, 0])
            new_start = np.array([cos_a * start[0] - sin_a * start[1], sin_a * start[0] + cos_a * start[1], 0])
            new_end = np.array([cos_a * end[0] - sin_a * end[1], sin_a * end[0] + cos_a * end[1], 0])
            rotated_grid.add(Line(new_start, new_end, color=MATH_CURVE, stroke_width=0.8, stroke_opacity=0.6))

        new_i = Arrow(ORIGIN, [cos_a, sin_a, 0], color=MATH_TANGENT, buff=0, stroke_width=3)
        new_j = Arrow(ORIGIN, [-sin_a, cos_a, 0], color=MATH_ANNOTATION, buff=0, stroke_width=3)

        self.play(
            *[Transform(grid_lines[i], rotated_grid[i]) for i in range(len(grid_lines))],
            Transform(i_hat, new_i), Transform(j_hat, new_j),
            run_time=2
        )

        # Shear transformation
        shear_label = MathTex(r"\text{Shear: } \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}", font_size=24, color=MATH_AREA)
        shear_label.to_edge(DOWN, buff=0.3)
        self.play(FadeOut(matrix_label), Write(shear_label), run_time=0.5)

        shear_grid = VGroup()
        for x in range(-4, 5):
            start = np.array([x, -3, 0])
            end = np.array([x, 3, 0])
            new_start = np.array([start[0] + start[1], start[1], 0])
            new_end = np.array([end[0] + end[1], end[1], 0])
            shear_grid.add(Line(new_start, new_end, color=MATH_AREA, stroke_width=0.8, stroke_opacity=0.6))
        for y in range(-3, 4):
            shear_grid.add(Line([-4 + y, y, 0], [4 + y, y, 0], color=MATH_AREA, stroke_width=0.8, stroke_opacity=0.6))

        self.play(
            *[Transform(grid_lines[i], shear_grid[i]) for i in range(len(grid_lines))],
            run_time=2
        )

        insight = Text("Matrices transform the entire coordinate grid", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
