import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class ParabolaCoefficients(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Parabola: y = ax² + bx + c", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"y = ax^2 + bx + c", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[-3, 5, 1],
            x_length=7, y_length=5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.5)

        self.play(Create(axes), run_time=0.8)

        a_val = ValueTracker(1)
        b_val = ValueTracker(0)
        c_val = ValueTracker(1)

        parabola = always_redraw(lambda: axes.plot(
            lambda x: a_val.get_value() * x**2 + b_val.get_value() * x + c_val.get_value(),
            x_range=[-3.5, 3.5], color=MATH_CURVE, stroke_width=3,
        ))
        self.add(parabola)

        # Change a — opens/closes
        a_label = always_redraw(lambda: MathTex(
            f"a = {a_val.get_value():.1f}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT
        ).to_edge(DOWN, buff=1.2).shift(LEFT * 2))
        self.add(a_label)
        self.play(a_val.animate.set_value(0.3), run_time=1.5)
        self.play(a_val.animate.set_value(2), run_time=1.5)
        self.play(a_val.animate.set_value(1), run_time=1)

        # Change b — shifts left/right
        b_label = always_redraw(lambda: MathTex(
            f"b = {b_val.get_value():.1f}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION
        ).to_edge(DOWN, buff=1.2).shift(RIGHT * 2))
        self.add(b_label)
        self.play(b_val.animate.set_value(2), run_time=1.5)
        self.play(b_val.animate.set_value(-2), run_time=1.5)
        self.play(b_val.animate.set_value(0), run_time=1)

        # Change c — shifts up/down
        c_label = always_redraw(lambda: MathTex(
            f"c = {c_val.get_value():.1f}", font_size=LABEL_FONT_SIZE, color=MATH_AREA
        ).to_edge(DOWN, buff=0.5))
        self.add(c_label)
        self.play(c_val.animate.set_value(3), run_time=1)
        self.play(c_val.animate.set_value(-1), run_time=1)
        self.play(c_val.animate.set_value(1), run_time=1)

        insight = Text("a controls width, b shifts horizontally, c shifts vertically", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DiscriminantVisual(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Discriminant: Nature of Roots", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"D = b^2 - 4ac", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-4, 4, 1], y_range=[-2, 5, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(DOWN * 0.8)

        self.play(Create(axes), run_time=0.5)

        # Case 1: D > 0 — two real roots
        label_pos = MathTex(r"D > 0: \text{ two real roots}", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        label_pos.to_edge(DOWN, buff=0.3)
        parabola_pos = axes.plot(lambda x: x**2 - 2, x_range=[-2.5, 2.5], color=MATH_CURVE, stroke_width=3)
        root1 = Dot(axes.c2p(np.sqrt(2), 0), color=MATH_TANGENT, radius=0.1)
        root2 = Dot(axes.c2p(-np.sqrt(2), 0), color=MATH_TANGENT, radius=0.1)
        r1_label = MathTex("x_1", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(root1, DOWN, buff=0.1)
        r2_label = MathTex("x_2", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(root2, DOWN, buff=0.1)

        self.play(Create(parabola_pos), run_time=1.5)
        self.play(FadeIn(root1), FadeIn(root2), Write(r1_label), Write(r2_label), Write(label_pos), run_time=1)

        # Case 2: D = 0 — one repeated root
        self.play(FadeOut(parabola_pos), FadeOut(root1), FadeOut(root2), FadeOut(r1_label), FadeOut(r2_label), FadeOut(label_pos), run_time=0.5)
        label_zero = MathTex(r"D = 0: \text{ repeated root}", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT)
        label_zero.to_edge(DOWN, buff=0.3)
        parabola_zero = axes.plot(lambda x: x**2, x_range=[-2.5, 2.5], color=MATH_CURVE, stroke_width=3)
        root_zero = Dot(axes.c2p(0, 0), color=MATH_ANNOTATION, radius=0.12)
        rz_label = MathTex("x", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(root_zero, DOWN, buff=0.1)

        self.play(Create(parabola_zero), run_time=1.5)
        self.play(FadeIn(root_zero), Write(rz_label), Write(label_zero), run_time=1)

        # Case 3: D < 0 — complex roots
        self.play(FadeOut(parabola_zero), FadeOut(root_zero), FadeOut(rz_label), FadeOut(label_zero), run_time=0.5)
        label_neg = MathTex(r"D < 0: \text{ complex roots}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        label_neg.to_edge(DOWN, buff=0.3)
        parabola_neg = axes.plot(lambda x: x**2 + 2, x_range=[-2.5, 2.5], color=MATH_CURVE, stroke_width=3)
        no_root_label = MathTex(r"\text{no real intersection}", font_size=SMALL_FONT_SIZE, color=DANGER_COLOR)
        no_root_label.move_to(axes.c2p(0, 2.5))

        self.play(Create(parabola_neg), run_time=1.5)
        self.play(Write(no_root_label), Write(label_neg), run_time=1)

        insight = Text("D determines how the parabola meets the x-axis", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class VertexForm(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Completing the Square", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        # Step-by-step completing the square
        step1 = MathTex(r"y = ax^2 + bx + c", font_size=FORMULA_FONT_SIZE, color=MATH_POINT)
        step1.to_edge(UP, buff=1.5)
        self.play(Write(step1), run_time=0.8)

        step2 = MathTex(r"y = a\left(x^2 + \frac{b}{a}x\right) + c", font_size=28, color=MATH_ANNOTATION)
        step2.next_to(step1, DOWN, buff=0.5)
        self.play(Write(step2), run_time=0.8)

        step3 = MathTex(r"y = a\left(x^2 + \frac{b}{a}x + \frac{b^2}{4a^2}\right) + c - \frac{b^2}{4a}", font_size=24, color=MATH_TANGENT)
        step3.next_to(step2, DOWN, buff=0.5)
        self.play(Write(step3), run_time=1)

        step4 = MathTex(r"y = a\left(x + \frac{b}{2a}\right)^2 + c - \frac{b^2}{4a}", font_size=28, color=MATH_AREA)
        step4.next_to(step3, DOWN, buff=0.5)
        self.play(Write(step4), run_time=1)

        # Vertex label
        vertex = MathTex(r"\text{Vertex: } \left(-\frac{b}{2a},\; c - \frac{b^2}{4a}\right)", font_size=LABEL_FONT_SIZE, color=MATH_CURVE)
        vertex.next_to(step4, DOWN, buff=0.5)
        self.play(Write(vertex), run_time=1)

        # Highlight key term
        box = SurroundingRectangle(step4[0][5:10], color=MATH_CURVE, buff=0.1)
        self.play(Create(box), run_time=0.5)
        self.wait(1)

        insight = Text("The squared term reveals the vertex directly", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class QuadraticFormula(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("The Quadratic Formula", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        # Derivation steps
        steps = [
            (r"ax^2 + bx + c = 0", MATH_POINT),
            (r"x^2 + \frac{b}{a}x = -\frac{c}{a}", MATH_ANNOTATION),
            (r"x^2 + \frac{b}{a}x + \frac{b^2}{4a^2} = \frac{b^2}{4a^2} - \frac{c}{a}", MATH_TANGENT),
            (r"\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}", MATH_AREA),
            (r"x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a}", MATH_CURVE),
        ]

        math_tex = VGroup()
        for i, (tex, color) in enumerate(steps):
            m = MathTex(tex, font_size=26 if i >= 3 else 28, color=color)
            math_tex.add(m)

        math_tex.arrange(DOWN, buff=0.45)
        math_tex.move_to(ORIGIN + UP * 0.2)

        for m in math_tex:
            self.play(Write(m), run_time=0.8)

        # Final formula box
        final = MathTex(r"x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}", font_size=38, color=MATH_CURVE)
        box = SurroundingRectangle(final, color=MATH_TANGENT, buff=0.2)
        final_group = VGroup(final, box)
        final_group.to_edge(DOWN, buff=0.8)

        self.play(Write(final), Create(box), run_time=1.2)

        insight = Text("Complete the square on ax²+bx+c=0", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
