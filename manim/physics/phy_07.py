import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class StressStrain(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Stress-Strain Curve", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\sigma = E \cdot \varepsilon", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("\\varepsilon (Strain)").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("\\sigma (Stress)").set_color(PHYSICS_FORCE)

        # Stress-strain curve
        # Linear region then yielding
        linear_part = axes.plot(lambda x: 2 * x, x_range=[0, 3], color=PHYSICS_VELOCITY, stroke_width=3)
        yield_part = axes.plot(lambda x: 6 + 0.3 * (x - 3) - 0.1 * (x - 3)**2, x_range=[3, 7], color=PHYSICS_ENERGY, stroke_width=3)
        fracture_part = axes.plot(lambda x: 6.5 - 0.8 * (x - 7)**2, x_range=[7, 8.5], color=DANGER_COLOR, stroke_width=3)

        # Labels
        proportional = Text("Proportional\nlimit", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        proportional.next_to(axes.c2p(3, 6), LEFT, buff=0.2)

        yield_label = Text("Yield\npoint", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        yield_label.next_to(axes.c2p(5, 6.4), UP, buff=0.1)

        ultimate = Text("Ultimate\nstrength", font_size=SMALL_FONT_SIZE, color=DANGER_COLOR)
        ultimate.next_to(axes.c2p(7.5, 6.5), RIGHT, buff=0.1)

        fracture = Text("Fracture", font_size=SMALL_FONT_SIZE, color=DANGER_COLOR)
        fracture.next_to(axes.c2p(8.5, 5.5), RIGHT, buff=0.1)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(linear_part), Write(proportional), run_time=1.5)
        self.play(Create(yield_part), Write(yield_label), run_time=1.5)
        self.play(Create(fracture_part), Write(ultimate), Write(fracture), run_time=1.5)

        # Highlight regions
        elastic = Text("Elastic", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        elastic.move_to(axes.c2p(1.5, 1))
        plastic = Text("Plastic", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        plastic.move_to(axes.c2p(5, 3))

        self.play(Write(elastic), Write(plastic), run_time=1)

        insight = Text("Hooke's law applies only in the elastic region", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class FluidContinuity(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Fluid Continuity", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"A_1v_1 = A_2v_2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Pipe with varying cross-section
        pipe_top = VMobject(color=PHYSICS_FIELD, stroke_width=2)
        pipe_top.set_points_as_corners([
            LEFT * 4 + UP * 1, LEFT * 1 + UP * 0.5,
            RIGHT * 1 + UP * 1, RIGHT * 4 + UP * 1
        ])

        pipe_bottom = VMobject(color=PHYSICS_FIELD, stroke_width=2)
        pipe_bottom.set_points_as_corners([
            LEFT * 4 + DOWN * 1, LEFT * 1 + DOWN * 0.5,
            RIGHT * 1 + DOWN * 1, RIGHT * 4 + DOWN * 1
        ])

        # Flow arrows
        arrows1 = VGroup()
        for y in [-0.5, 0, 0.5]:
            arr = Arrow(LEFT * 3.5 + UP * y * 0.6, LEFT * 1.5 + UP * y * 0.6, color=PHYSICS_VELOCITY, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.2)
            arrows1.add(arr)

        arrows2 = VGroup()
        for y in [-0.3, 0, 0.3]:
            arr = Arrow(RIGHT * 1.5 + UP * y * 0.6, RIGHT * 3.5 + UP * y * 0.6, color=PHYSICS_VELOCITY, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.2)
            arrows2.add(arr)

        # Labels
        a1_label = MathTex(r"A_1, v_1", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        a1_label.move_to(LEFT * 2.5 + DOWN * 1.8)
        a2_label = MathTex(r"A_2, v_2", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        a2_label.move_to(RIGHT * 2.5 + DOWN * 1.8)

        self.play(Create(pipe_top), Create(pipe_bottom), run_time=1)
        self.play(FadeIn(arrows1), Write(a1_label), run_time=1)
        self.play(FadeIn(arrows2), Write(a2_label), run_time=1)

        # Show that wider area = slower flow
        wide_note = Text("Wide = Slow", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        wide_note.move_to(LEFT * 2.5 + UP * 2)
        narrow_note = Text("Narrow = Fast", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        narrow_note.move_to(RIGHT * 2.5 + UP * 2)

        self.play(Write(wide_note), Write(narrow_note), run_time=1)

        insight = Text("Flow rate is constant: mass is conserved", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class BernoulliEquation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Bernoulli's Equation", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"P + \frac{1}{2}\rho v^2 + \rho gh = \text{const}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Three energy terms visualization
        terms = VGroup()
        term_data = [
            ("P", "Pressure", PHYSICS_OBJECT, LEFT * 3),
            (r"\frac{1}{2}\rho v^2", "Kinetic", PHYSICS_VELOCITY, ORIGIN),
            (r"\rho gh", "Potential", PHYSICS_FORCE, RIGHT * 3),
        ]

        for tex, label, color, pos in term_data:
            box = Rectangle(width=2, height=1, color=color, fill_opacity=0.15, stroke_width=2)
            box.move_to(pos)
            t = MathTex(tex, font_size=LABEL_FONT_SIZE, color=color)
            t.move_to(box.get_center() + UP * 0.1)
            l = Text(label, font_size=SMALL_FONT_SIZE, color=color)
            l.next_to(box, DOWN, buff=0.1)
            terms.add(VGroup(box, t, l))

        terms.move_to(DOWN * 0.5)

        plus1 = Text("+", font_size=TITLE_FONT_SIZE, color=PHYSICS_FIELD)
        plus1.move_to(LEFT * 1.5 + DOWN * 0.5)
        plus2 = Text("+", font_size=TITLE_FONT_SIZE, color=PHYSICS_FIELD)
        plus2.move_to(RIGHT * 1.5 + DOWN * 0.5)

        self.play(FadeIn(terms[0]), run_time=0.8)
        self.play(Write(plus1), FadeIn(terms[1]), run_time=0.8)
        self.play(Write(plus2), FadeIn(terms[2]), run_time=0.8)

        # Show trade-offs
        trade = MathTex(r"P \uparrow \Rightarrow v \downarrow", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        trade.move_to(DOWN * 2.2)
        self.play(Write(trade), run_time=1)

        # Animate swapping bar heights
        bar_p = Rectangle(width=1.5, height=2, color=PHYSICS_OBJECT, fill_opacity=0.3)
        bar_p.move_to(LEFT * 2 + DOWN * 3)
        bar_v = Rectangle(width=1.5, height=0.5, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        bar_v.move_to(RIGHT * 2 + DOWN * 3)

        bp_label = Text("P", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        bp_label.next_to(bar_p, DOWN, buff=0.05)
        bv_label = Text("v", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        bv_label.next_to(bar_v, DOWN, buff=0.05)

        self.play(FadeIn(bar_p), Write(bp_label), FadeIn(bar_v), Write(bv_label), run_time=0.5)

        # Swap
        self.play(
            bar_p.animate.stretch_to_fit_height(0.5).move_to(LEFT * 2 + DOWN * 3, aligned_edge=DOWN),
            bar_v.animate.stretch_to_fit_height(2).move_to(RIGHT * 2 + DOWN * 3, aligned_edge=DOWN),
            run_time=1
        )

        insight = Text("Total energy per unit volume is conserved along flow", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
