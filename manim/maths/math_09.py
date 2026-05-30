import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class AreaUnderCurve(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Definite Integral as Area", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\int_a^b f(x)\,dx = \text{Area under curve}", font_size=28, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 5, 1], y_range=[-1, 4, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.8)

        curve = axes.plot(lambda x: 0.3 * (x - 1)**2 + 0.5, x_range=[0, 4.5], color=MATH_CURVE, stroke_width=3)
        self.play(Create(axes), Create(curve), run_time=1)

        a, b = 1.0, 3.5
        # Riemann sum animation
        n_rects = ValueTracker(1)
        rects = always_redraw(lambda: axes.get_riemann_rectangles(
            curve, x_range=[a, b], dx=0.5 / max(n_rects.get_value(), 1),
            color=[MATH_AREA, MATH_CURVE], fill_opacity=0.4, stroke_width=0.5
        ))
        self.add(rects)

        # Animate increasing rectangles
        self.play(n_rects.animate.set_value(10), run_time=3)

        # Exact area
        area = axes.get_area(curve, x_range=[a, b], color=MATH_AREA, opacity=0.5)
        self.play(FadeOut(rects), FadeIn(area), run_time=1)

        # Labels
        a_dot = Dot(axes.c2p(a, 0), color=MATH_TANGENT, radius=0.08)
        b_dot = Dot(axes.c2p(b, 0), color=MATH_TANGENT, radius=0.08)
        a_label = MathTex("a", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(a_dot, DOWN, buff=0.1)
        b_label = MathTex("b", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(b_dot, DOWN, buff=0.1)
        area_label = MathTex(r"\int_a^b f(x)\,dx", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        area_label.move_to(axes.c2p((a + b) / 2, 1.0))

        self.play(FadeIn(a_dot), FadeIn(b_dot), Write(a_label), Write(b_label), Write(area_label), run_time=1)

        insight = Text("More rectangles → better approximation → exact area", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class IntegrationByParts(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Integration by Parts", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\int u\,dv = uv - \int v\,du", font_size=34, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Visual decomposition of area
        axes = Axes(
            x_range=[-0.5, 4, 1], y_range=[-0.5, 3, 1],
            x_length=6, y_length=3.5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.8 + LEFT * 0.5)

        # Show uv as rectangle
        u_val, v_val = 3.0, 2.0
        rect_uv = Rectangle(
            width=u_val * axes.get_x_unit_size(),
            height=v_val * axes.get_y_unit_size(),
            color=MATH_AREA, fill_opacity=0.3, stroke_width=2, stroke_color=MATH_CURVE
        )
        rect_uv.move_to(axes.c2p(u_val / 2, v_val / 2))

        u_label = MathTex("u", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(rect_uv, DOWN, buff=0.1)
        v_label = MathTex("v", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(rect_uv, LEFT, buff=0.1)
        uv_label = MathTex("uv", font_size=LABEL_FONT_SIZE, color=MATH_AREA).move_to(rect_uv.get_center())

        self.play(Create(axes), run_time=0.3)
        self.play(Create(rect_uv), Write(u_label), Write(v_label), Write(uv_label), run_time=1.5)

        # Subtract ∫v du
        subtract_rect = Rectangle(
            width=1.5 * axes.get_x_unit_size(),
            height=v_val * axes.get_y_unit_size(),
            color=DANGER_COLOR, fill_opacity=0.3, stroke_width=2, stroke_color=DANGER_COLOR
        )
        subtract_rect.move_to(axes.c2p(u_val - 0.75, v_val / 2))

        sub_label = MathTex(r"\int v\,du", font_size=LABEL_FONT_SIZE, color=DANGER_COLOR)
        sub_label.next_to(subtract_rect, RIGHT, buff=0.1)

        minus_sign = MathTex(r"-", font_size=TITLE_FONT_SIZE, color=DANGER_COLOR)
        minus_sign.next_to(subtract_rect, LEFT, buff=0.1)

        self.play(Create(subtract_rect), Write(sub_label), Write(minus_sign), run_time=1)

        # Result
        result = MathTex(r"\int u\,dv = uv - \int v\,du", font_size=LABEL_FONT_SIZE, color=MATH_CURVE)
        result.to_edge(DOWN, buff=0.8)
        self.play(Write(result), run_time=0.8)

        # Arrow decomposition
        arrow1 = Arrow(rect_uv.get_right(), subtract_rect.get_left(), color=MATH_ANNOTATION, stroke_width=2, buff=0.1)
        self.play(GrowArrow(arrow1), run_time=0.5)

        insight = Text("IBP splits the area into a rectangle minus a smaller integral", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class InverseTrigIntegral(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Inverse Trig Integrals", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formulas = VGroup(
            MathTex(r"\int \frac{dx}{\sqrt{1-x^2}} = \arcsin x + C", font_size=26, color=MATH_POINT),
            MathTex(r"\int \frac{dx}{1+x^2} = \arctan x + C", font_size=26, color=MATH_ANNOTATION),
            MathTex(r"\int \frac{dx}{x\sqrt{x^2-1}} = \text{arcsec}\, x + C", font_size=26, color=MATH_TANGATION if False else MATH_TANGENT),
        )
        formulas.arrange(DOWN, buff=0.5)
        formulas.next_to(title, DOWN, buff=0.5)
        for f in formulas:
            self.play(Write(f), run_time=0.8)

        # Graph of arcsin
        axes = Axes(
            x_range=[-1.5, 1.5, 0.5], y_range=[-2, 2, 0.5],
            x_length=4, y_length=3,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.5 + LEFT * 2.5)

        arcsin_curve = axes.plot(lambda x: np.arcsin(np.clip(x, -0.99, 0.99)), x_range=[-0.95, 0.95], color=MATH_CURVE, stroke_width=3)
        arcsin_label = MathTex(r"\arcsin x", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(axes.c2p(0.8, np.arcsin(0.8)), UR, buff=0.1)

        self.play(Create(axes), Create(arcsin_curve), Write(arcsin_label), run_time=1.5)

        # Graph of arctan
        axes2 = Axes(
            x_range=[-4, 4, 1], y_range=[-2, 2, 0.5],
            x_length=4, y_length=3,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.5 + RIGHT * 2.5)

        arctan_curve = axes2.plot(np.arctan, x_range=[-3.5, 3.5], color=MATH_ANNOTATION, stroke_width=3)
        arctan_label = MathTex(r"\arctan x", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).next_to(axes2.c2p(3, np.arctan(3)), UR, buff=0.1)

        # Asymptotes
        asymp1 = DashedLine(axes2.c2p(-3.5, PI / 2), axes2.c2p(3.5, PI / 2), color=MATH_AREA, stroke_width=1)
        asymp2 = DashedLine(axes2.c2p(-3.5, -PI / 2), axes2.c2p(3.5, -PI / 2), color=MATH_AREA, stroke_width=1)

        self.play(Create(axes2), Create(arctan_curve), Write(arctan_label), Create(asymp1), Create(asymp2), run_time=1.5)

        insight = Text("Derivatives of inverse trig give these standard integrals", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class KingRule(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("King's Rule for Definite Integrals", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\int_0^a f(x)\,dx = \int_0^a f(a-x)\,dx", font_size=30, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-0.5, 4, 1], y_range=[-0.5, 3, 1],
            x_length=7, y_length=4,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=True,
        ).shift(DOWN * 0.8)

        a_val = 3.0
        f = lambda x: 0.3 * x * (a_val - x) + 0.5
        curve = axes.plot(f, x_range=[0, a_val], color=MATH_CURVE, stroke_width=3)

        # f(x) area
        area1 = axes.get_area(curve, x_range=[0, a_val], color=MATH_AREA, opacity=0.4)
        area1_label = MathTex(r"\int_0^a f(x)\,dx", font_size=SMALL_FONT_SIZE, color=MATH_AREA)
        area1_label.move_to(axes.c2p(1.0, 1.0))

        self.play(Create(axes), Create(curve), run_time=1)
        self.play(FadeIn(area1), Write(area1_label), run_time=1)

        # Mirror f(a-x)
        mirror_curve = axes.plot(lambda x: f(a_val - x), x_range=[0, a_val], color=MATH_ANNOTATION, stroke_width=3, stroke_opacity=0.7)
        area2 = axes.get_area(mirror_curve, x_range=[0, a_val], color=MATH_TANGENT, opacity=0.3)
        area2_label = MathTex(r"\int_0^a f(a-x)\,dx", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        area2_label.move_to(axes.c2p(2.0, 1.0))

        self.play(Create(mirror_curve), run_time=1)
        self.play(FadeIn(area2), Write(area2_label), run_time=1)

        # Equality arrow
        equals = MathTex(r"=", font_size=TITLE_FONT_SIZE, color=MATH_ANNOTATION)
        equals.move_to((area1_label.get_right() + area2_label.get_left()) / 2)
        self.play(Write(equals), run_time=0.5)

        # Application
        example = MathTex(r"\int_0^{\pi/2} \frac{\sin^n x}{\sin^n x + \cos^n x}\,dx = \frac{\pi}{4}", font_size=22, color=MATH_CURVE)
        example.to_edge(DOWN, buff=0.5)
        self.play(Write(example), run_time=1)

        insight = Text("Replace x with (a-x): the area is the same", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
