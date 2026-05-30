import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class FirstOrderKinetics(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("First-Order Kinetics", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"[A] = [A]_0 \, e^{-kt}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Axes
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 1)

        x_label = axes.get_x_axis_label(r"t\,(\text{s})").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label(r"[A]").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Exponential decay curve
        k = 0.3
        A0 = 9
        curve = axes.plot(lambda t: A0 * np.exp(-k * t), x_range=[0, 9], color=CHEM_MOLECULE, use_smoothing=True)
        self.play(Create(curve), run_time=2)

        # Initial concentration line
        init_line = DashedLine(
            axes.c2p(0, A0), axes.c2p(9, A0),
            color=CHEM_REACTION, stroke_width=1
        )
        init_label = MathTex(r"[A]_0", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        init_label.next_to(axes.c2p(0, A0), LEFT, buff=0.1)

        self.play(Create(init_line), Write(init_label), run_time=0.5)

        # Moving dot
        dot = Dot(color=CHEM_MOLECULE, radius=0.08)
        t_tracker = ValueTracker(0)

        def update_dot(d):
            t = t_tracker.get_value()
            d.move_to(axes.c2p(t, A0 * np.exp(-k * t)))

        dot.add_updater(update_dot)
        self.add(dot)

        time_label = always_redraw(lambda: MathTex(
            f"t = {t_tracker.get_value():.1f}\,\\text{{s}}",
            font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE
        ).to_corner(DR, buff=0.5))

        conc_label = always_redraw(lambda: MathTex(
            f"[A] = {A0 * np.exp(-k * t_tracker.get_value()):.1f}",
            font_size=SMALL_FONT_SIZE, color=CHEM_BOND
        ).next_to(time_label, UP, buff=0.2))

        self.add(time_label, conc_label)
        self.play(t_tracker.animate.set_value(9), run_time=ANIMATION_DURATION * 0.8, rate_func=linear)
        dot.remove_updater(update_dot)

        # Integrated rate law
        integrated = MathTex(
            r"\ln[A] = \ln[A]_0 - kt",
            font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT
        )
        integrated.to_edge(DOWN, buff=0.3)
        self.play(Write(integrated), run_time=1)

        insight = Text("First-order rate is proportional to concentration", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.next_to(integrated, UP, buff=0.2)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class HalfLife(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Half-Life Concept", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"t_{1/2} = \frac{0.693}{k}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Bar chart showing concentration halving
        bars = VGroup()
        conc = 100
        for i in range(5):
            bar = Rectangle(
                width=1.0,
                height=conc / 100 * 3,
                color=CHEM_MOLECULE,
                fill_opacity=0.6 - i * 0.1
            )
            label = Text(f"{conc}%", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
            label.next_to(bar, DOWN, buff=0.1)
            t_label = Text(f"t={i}", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
            t_label.next_to(bar, UP, buff=0.1)
            bars.add(VGroup(bar, label, t_label))
            conc = conc / 2

        bars.arrange(RIGHT, buff=0.4).move_to(DOWN * 1)

        for i, bar_group in enumerate(bars):
            self.play(FadeIn(bar_group, shift=UP * 0.3), run_time=0.8)

        # Highlight halving with arrows
        for i in range(4):
            arrow = Arrow(
                bars[i][0].get_top() + UP * 0.3,
                bars[i + 1][0].get_top() + UP * 0.3,
                color=CHEM_REACTION, buff=0.1, stroke_width=2
            )
            half_label = MathTex(r"\div 2", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
            half_label.next_to(arrow, UP, buff=0.05)
            self.play(GrowArrow(arrow), Write(half_label), run_time=0.5)

        # First order specific
        first_order = MathTex(
            r"t_{1/2} = \frac{\ln 2}{k} \approx \frac{0.693}{k}",
            font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT
        )
        first_order.to_edge(DOWN, buff=0.8)
        self.play(Write(first_order), run_time=0.8)

        # Note about independence
        note = Text("First-order half-life is independent of [A]₀", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        note.next_to(first_order, DOWN, buff=0.2)
        self.play(Write(note), run_time=0.8)

        insight = Text("Each half-life removes half the remaining substance", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ArrheniusPlot(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Arrhenius Equation", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"k = A \, e^{-E_a / RT}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Linearized form
        linear = MathTex(
            r"\ln k = \ln A - \frac{E_a}{R} \cdot \frac{1}{T}",
            font_size=LABEL_FONT_SIZE, color=CHEM_BOND
        )
        linear.move_to(ORIGIN + DOWN * 0.3)
        self.play(Write(linear), run_time=0.8)

        # Axes
        axes = Axes(
            x_range=[0, 4, 1], y_range=[-2, 8, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 1.5)

        x_label = axes.get_x_axis_label(r"1/T\,(\times 10^{-3}\,\text{K}^{-1})").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label(r"\ln k").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Line with negative slope
        line = axes.plot(lambda x: 7 - 2.0 * x, x_range=[0.3, 3.5], color=CHEM_MOLECULE, use_smoothing=False)
        self.play(Create(line), run_time=1.5)

        # Slope annotation
        slope_line = DashedLine(
            axes.c2p(1, 5), axes.c2p(2, 3),
            color=CHEM_REACTION, stroke_width=1
        )
        slope_label = MathTex(r"\text{slope} = -\frac{E_a}{R}", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        slope_label.next_to(slope_line, RIGHT, buff=0.1)

        self.play(Create(slope_line), Write(slope_label), run_time=0.8)

        # Intercept
        intercept = Dot(axes.c2p(0, 7), radius=0.08, color=CHEM_PRODUCT)
        intercept_label = MathTex(r"\ln A", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        intercept_label.next_to(intercept, RIGHT, buff=0.1)

        self.play(FadeIn(intercept), Write(intercept_label), run_time=0.5)

        # High T / Low T labels
        ht_label = Text("High T", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        ht_label.move_to(axes.c2p(0.5, 6))
        lt_label = Text("Low T", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        lt_label.move_to(axes.c2p(3, 1.5))

        self.play(Write(ht_label), Write(lt_label), run_time=0.5)

        insight = Text("Higher temperature increases rate constant exponentially", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class RateLaws(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Rate Law Comparison", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        # Three rate laws side by side
        laws = VGroup(
            MathTex(r"\text{Zero: } r = k", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"\text{First: } r = k[A]", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"\text{Second: } r = k[A]^2", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(LEFT * 4 + UP * 0.5)

        self.play(FadeIn(laws), run_time=1)

        # Axes
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(RIGHT * 1 + DOWN * 1)

        x_label = axes.get_x_axis_label(r"t").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label(r"[A]").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Zero order: linear decrease
        zero_curve = axes.plot(lambda t: 9 - t, x_range=[0, 8], color=CHEM_REACTION, use_smoothing=False)
        zero_label = MathTex(r"0^{\text{th}}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        zero_label.next_to(zero_curve.get_end(), DOWN, buff=0.1)

        self.play(Create(zero_curve), Write(zero_label), run_time=1.5)

        # First order: exponential decay
        first_curve = axes.plot(lambda t: 9 * np.exp(-0.3 * t), x_range=[0, 9], color=CHEM_ELECTRON, use_smoothing=True)
        first_label = MathTex(r"1^{\text{st}}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        first_label.next_to(first_curve.get_end(), DOWN, buff=0.1)

        self.play(Create(first_curve), Write(first_label), run_time=1.5)

        # Second order: steeper decay
        second_curve = axes.plot(lambda t: 9 / (1 + 0.3 * t), x_range=[0, 9], color=CHEM_PRODUCT, use_smoothing=True)
        second_label = MathTex(r"2^{\text{nd}}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        second_label.next_to(second_curve.get_end(), DOWN, buff=0.1)

        self.play(Create(second_curve), Write(second_label), run_time=1.5)

        # Summary
        summary = VGroup(
            MathTex(r"0^{\text{th}}: [A]_0 - kt", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"1^{\text{st}}: [A]_0 e^{-kt}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"2^{\text{nd}}: \frac{[A]_0}{1 + [A]_0 kt}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT).to_edge(DOWN, buff=0.5)

        self.play(FadeIn(summary), run_time=0.8)

        insight = Text("Higher order reactions decay faster initially", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.next_to(summary, UP, buff=0.2)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
