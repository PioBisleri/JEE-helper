import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class BayesTree(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Bayes' Theorem: Probability Tree", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"P(A|B) = \frac{P(B|A)\,P(A)}{P(B)}", font_size=30, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Tree structure
        root = Dot(LEFT * 4 + DOWN * 0.5, color=MATH_CURVE, radius=0.12)
        root_label = MathTex(r"\text{Event}", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(root, DOWN, buff=0.15)

        # Branches
        a_node = Dot(LEFT * 1.5 + UP * 1.5, color=MATH_TANGENT, radius=0.1)
        na_node = Dot(LEFT * 1.5 + DOWN * 2.5, color=MATH_ANNOTATION, radius=0.1)
        a_label = MathTex(r"A", font_size=LABEL_FONT_SIZE, color=MATH_TANGENT).next_to(a_node, UP, buff=0.1)
        na_label = MathTex(r"A^c", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).next_to(na_node, DOWN, buff=0.1)

        edge_a = Arrow(root.get_center(), a_node.get_center(), color=MATH_TANGENT, buff=0.1, stroke_width=2)
        edge_na = Arrow(root.get_center(), na_node.get_center(), color=MATH_ANNOTATION, buff=0.1, stroke_width=2)

        pa_label = MathTex(r"P(A)", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).move_to(edge_a.get_center() + UP * 0.2)
        pna_label = MathTex(r"P(A^c)", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION).move_to(edge_na.get_center() + DOWN * 0.2)

        self.play(FadeIn(root), Write(root_label), run_time=0.5)
        self.play(GrowArrow(edge_a), GrowArrow(edge_na), Write(a_label), Write(na_label), Write(pa_label), Write(pna_label), run_time=1.5)

        # Second level: B|A and B|Ac
        b_a = Dot(RIGHT * 1.5 + UP * 2.5, color=MATH_AREA, radius=0.1)
        nb_a = Dot(RIGHT * 1.5 + UP * 0.5, color=MATH_CURVE, radius=0.1)
        b_na = Dot(RIGHT * 1.5 + DOWN * 1.5, color=MATH_AREA, radius=0.1)
        nb_na = Dot(RIGHT * 1.5 + DOWN * 3.5, color=MATH_CURVE, radius=0.1)

        ba_label = MathTex(r"B", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(b_a, RIGHT, buff=0.1)
        nba_label = MathTex(r"B^c", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(nb_a, RIGHT, buff=0.1)
        bna_label = MathTex(r"B", font_size=SMALL_FONT_SIZE, color=MATH_AREA).next_to(b_na, RIGHT, buff=0.1)
        nbna_label = MathTex(r"B^c", font_size=SMALL_FONT_SIZE, color=MATH_CURVE).next_to(nb_na, RIGHT, buff=0.1)

        edges2 = VGroup(
            Arrow(a_node.get_center(), b_a.get_center(), color=MATH_AREA, buff=0.1, stroke_width=2),
            Arrow(a_node.get_center(), nb_a.get_center(), color=MATH_CURVE, buff=0.1, stroke_width=2),
            Arrow(na_node.get_center(), b_na.get_center(), color=MATH_AREA, buff=0.1, stroke_width=2),
            Arrow(na_node.get_center(), nb_na.get_center(), color=MATH_CURVE, buff=0.1, stroke_width=2),
        )

        pba_label = MathTex(r"P(B|A)", font_size=SMALL_FONT_SIZE, color=MATH_AREA).move_to(edges2[0].get_center() + UP * 0.15)
        pbnba_label = MathTex(r"P(B|A^c)", font_size=SMALL_FONT_SIZE, color=MATH_AREA).move_to(edges2[2].get_center() + DOWN * 0.15)

        self.play(
            *[GrowArrow(e) for e in edges2],
            FadeIn(b_a), FadeIn(nb_a), FadeIn(b_na), FadeIn(nb_na),
            Write(ba_label), Write(nba_label), Write(bna_label), Write(nbna_label),
            Write(pba_label), Write(pbnba_label),
            run_time=2
        )

        # Highlight the path A → B
        highlight = VGroup(
            Line(root.get_center(), a_node.get_center(), color=MATH_TANGENT, stroke_width=4, stroke_opacity=0.6),
            Line(a_node.get_center(), b_a.get_center(), color=MATH_AREA, stroke_width=4, stroke_opacity=0.6),
        )
        self.play(Create(highlight), run_time=1)

        result = MathTex(r"P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        result.to_edge(DOWN, buff=0.5)
        self.play(Write(result), run_time=0.8)

        insight = Text("Bayes' reverses conditioning: from P(B|A) to P(A|B)", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class BinomialDist(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Binomial Distribution → Normal", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}", font_size=28, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[-1, 11, 1], y_range=[0, 0.4, 0.1],
            x_length=7, y_length=3.5,
            axis_config={"color": MATH_AXIS, "stroke_width": 1},
            tips=False,
        ).shift(DOWN * 0.8)

        self.play(Create(axes), run_time=0.5)

        from math import comb

        p = 0.5
        n_tracker = ValueTracker(4)

        bars = always_redraw(lambda: VGroup(*[
            Rectangle(
                width=0.4,
                height=max(comb(int(n_tracker.get_value()), k) * p**k * (1 - p)**(int(n_tracker.get_value()) - k) * axes.get_y_unit_size(), 0.01),
                color=MATH_CURVE, fill_opacity=0.5, stroke_width=1
            ).move_to(axes.c2p(k, 0), aligned_edge=DOWN)
            for k in range(int(n_tracker.get_value()) + 1)
        ]))

        self.add(bars)

        # Animate n increasing
        self.play(n_tracker.animate.set_value(8), run_time=2)
        self.play(n_tracker.animate.set_value(15), run_time=2)

        # Normal curve overlay
        mu = 15 * p
        sigma = np.sqrt(15 * p * (1 - p))
        normal_curve = axes.plot(
            lambda x: (1 / (sigma * np.sqrt(2 * PI))) * np.exp(-0.5 * ((x - mu) / sigma)**2),
            x_range=[0, 15], color=MATH_ANNOTATION, stroke_width=2.5
        )
        normal_label = MathTex(r"N(\mu, \sigma^2)", font_size=SMALL_FONT_SIZE, color=MATH_ANNOTATION)
        normal_label.next_to(axes.c2p(mu, 1 / (sigma * np.sqrt(2 * PI))), UP, buff=0.1)

        self.play(Create(normal_curve), Write(normal_label), run_time=1.5)

        # Mean and std
        mean_line = DashedLine(axes.c2p(mu, 0), axes.c2p(mu, 0.35), color=MATH_TANGENT, stroke_width=1.5)
        mean_label = MathTex(r"\mu = np", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT).next_to(mean_line, UP, buff=0.1)
        self.play(Create(mean_line), Write(mean_label), run_time=0.8)

        insight = Text("As n → ∞, binomial approaches normal distribution", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ConditionalProb(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Conditional Probability", font_size=TITLE_FONT_SIZE, color=MATH_CURVE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"P(A|B) = \frac{P(A \cap B)}{P(B)}", font_size=34, color=MATH_POINT)
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Universal set
        universe = Rectangle(width=5, height=3.5, color=MATH_AXIS, stroke_width=2)
        u_label = MathTex("S", font_size=LABEL_FONT_SIZE, color=MATH_AXIS).next_to(universe, UP, buff=0.1)
        self.play(Create(universe), Write(u_label), run_time=0.5)

        # Set B (larger)
        circle_b = Circle(radius=1.3, color=MATH_ANNOTATION, fill_opacity=0.2).set_fill(MATH_ANNOTATION, 0.2)
        circle_b.shift(LEFT * 0.3)
        b_label = MathTex("B", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION).move_to(circle_b.get_center() + LEFT * 0.5 + UP * 0.5)

        # Set A (overlapping)
        circle_a = Circle(radius=1.1, color=MATH_CURVE, fill_opacity=0.2).set_fill(MATH_CURVE, 0.2)
        circle_a.shift(RIGHT * 0.5)
        a_label = MathTex("A", font_size=LABEL_FONT_SIZE, color=MATH_CURVE).move_to(circle_a.get_center() + RIGHT * 0.4 + UP * 0.4)

        self.play(Create(circle_b), Write(b_label), run_time=0.8)
        self.play(Create(circle_a), Write(a_label), run_time=0.8)

        # Highlight intersection
        intersection_highlight = Circle(radius=0.5, color=MATH_TANGENT, fill_opacity=0.4).set_fill(MATH_TANGENT, 0.4)
        intersection_highlight.move_to((circle_a.get_center() + circle_b.get_center()) / 2 + DOWN * 0.1)
        int_label = MathTex(r"A \cap B", font_size=SMALL_FONT_SIZE, color=MATH_TANGENT)
        int_label.next_to(intersection_highlight, DOWN, buff=0.1)

        self.play(FadeIn(intersection_highlight), Write(int_label), run_time=0.8)

        # "Given B" highlight
        given_box = SurroundingRectangle(circle_b, color=MATH_AREA, buff=0.1, stroke_width=3)
        given_label = MathTex(r"\text{Given } B", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        given_label.to_edge(DOWN, buff=0.8)
        self.play(Create(given_box), Write(given_label), run_time=1)

        # Formula breakdown
        breakdown = MathTex(r"P(A|B) = \frac{\text{area}(A \cap B)}{\text{area}(B)}", font_size=LABEL_FONT_SIZE, color=MATH_ANNOTATION)
        breakdown.to_edge(DOWN, buff=0.3)
        self.play(Write(breakdown), run_time=0.8)

        insight = Text("Conditioning restricts the sample space to B", font_size=LABEL_FONT_SIZE, color=MATH_AREA)
        insight.next_to(breakdown, UP, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
