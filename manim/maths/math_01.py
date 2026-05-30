import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class VennDiagram(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Sets: Union, Intersection & Complement", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"A \cup B, \quad A \cap B, \quad A^c", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Draw two overlapping circles
        circle_a = Circle(radius=1.5, color=MATH_CURVE, fill_opacity=0.25).set_fill(MATH_CURVE, 0.25).shift(LEFT * 0.9)
        circle_b = Circle(radius=1.5, color=MATH_POINT, fill_opacity=0.25).set_fill(MATH_POINT, 0.25).shift(RIGHT * 0.9)

        label_a = MathTex("A", font_size=FORMULA_FONT_SIZE, color=MATH_CURVE).move_to(circle_a.get_center() + LEFT * 0.7 + UP * 0.5)
        label_b = MathTex("B", font_size=FORMULA_FONT_SIZE, color=MATH_POINT).move_to(circle_b.get_center() + RIGHT * 0.7 + UP * 0.5)

        self.play(Create(circle_a), run_time=1)
        self.play(Create(circle_b), run_time=1)
        self.play(Write(label_a), Write(label_b), run_time=0.5)

        # Intersection label
        intersection_label = MathTex(r"A \cap B", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
        intersection_label.move_to(ORIGIN + DOWN * 0.1)
        self.play(FadeIn(intersection_label), run_time=1)

        # Highlight union - fill both circles
        union_a = circle_a.copy().set_fill(MATH_TANGENT, 0.3)
        union_b = circle_b.copy().set_fill(MATH_TANGENT, 0.3)
        union_label = MathTex(r"A \cup B", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        union_label.to_edge(DOWN, buff=1.5)

        self.play(FadeIn(union_a), FadeIn(union_b), run_time=1.5)
        self.play(Write(union_label), run_time=0.8)
        self.wait(1)

        # Show complement - universal set rectangle
        self.play(FadeOut(union_a), FadeOut(union_b), FadeOut(intersection_label), FadeOut(union_label), run_time=0.5)

        universe = Rectangle(width=5.5, height=4, color=MATH_AXIS, stroke_width=2)
        universe.move_to(ORIGIN + DOWN * 0.3)
        u_label = MathTex("U", font_size=FORMULA_FONT_SIZE, color=MATH_AXIS).next_to(universe, UP, buff=0.1).shift(RIGHT * 2.2)

        self.play(Create(universe), Write(u_label), run_time=1)

        # Complement shading - area outside A inside U
        complement = Rectangle(width=5.5, height=4, color=MATH_ANNOTATION, fill_opacity=0.15).set_fill(MATH_ANNOTATION, 0.15)
        complement.move_to(universe.get_center())
        self.play(FadeIn(complement), run_time=1)

        comp_label = MathTex(r"A^c = U - A", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
        comp_label.to_edge(DOWN, buff=0.5)
        self.play(Write(comp_label), run_time=0.8)

        insight = Text("Sets: operations on collections of objects", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(comp_label, DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
