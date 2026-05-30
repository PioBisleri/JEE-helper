import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class OhmsLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Ohm's Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"V = IR", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Circuit diagram
        # Battery
        bat_pos = Rectangle(width=0.3, height=0.5, color=PHYSICS_FORCE, fill_opacity=0.3)
        bat_pos.move_to(LEFT * 3 + UP * 0.5)
        bat_neg = Rectangle(width=0.3, height=0.3, color=PHYSICS_OBJECT, fill_opacity=0.3)
        bat_neg.move_to(LEFT * 3 + DOWN * 0.5)

        # Resistor
        resistor = Rectangle(width=1, height=0.4, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        resistor.move_to(RIGHT * 3)

        # Wires
        wire_top = Line(LEFT * 3 + UP * 0.8, RIGHT * 3 + UP * 0.8, color=MUTED_COLOR, stroke_width=2)
        wire_right = Line(RIGHT * 3 + UP * 0.8, RIGHT * 3 + DOWN * 0.8, color=MUTED_COLOR, stroke_width=2)
        wire_bottom = Line(RIGHT * 3 + DOWN * 0.8, LEFT * 3 + DOWN * 0.8, color=MUTED_COLOR, stroke_width=2)
        wire_left = Line(LEFT * 3 + DOWN * 0.5, LEFT * 3 + UP * 0.5, color=MUTED_COLOR, stroke_width=2)

        # Current arrow
        current_arrow = Arrow(LEFT * 1 + UP * 0.8, RIGHT * 1 + UP * 0.8, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        current_label = MathTex(r"I", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        current_label.next_to(current_arrow, UP, buff=0.1)

        # Voltage label
        v_label = MathTex(r"V", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        v_label.move_to(LEFT * 4 + DOWN * 0.5)

        # R label
        r_label = MathTex(r"R", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        r_label.move_to(resistor)

        circuit = VGroup(bat_pos, bat_neg, resistor, wire_top, wire_right, wire_bottom, wire_left)

        self.play(FadeIn(circuit), Write(v_label), Write(r_label), run_time=1)
        self.play(GrowArrow(current_arrow), Write(current_label), run_time=1)

        # Show relationship
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=3, y_length=2,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 2.5)

        v_ax = axes.get_x_axis_label("I").set_color(PHYSICS_VELOCITY)
        i_ax = axes.get_y_axis_label("V").set_color(PHYSICS_FORCE)
        vi_line = axes.plot(lambda x: x, x_range=[0, 8], color=PHYSICS_ENERGY, stroke_width=2)

        self.play(Create(axes), Write(v_ax), Write(i_ax), run_time=0.5)
        self.play(Create(vi_line), run_time=1)

        # Animate current flow
        dot = Dot(color=PHYSICS_VELOCITY, radius=0.06)
        dot.move_to(LEFT * 1 + UP * 0.8)

        def update_dot(d):
            t = self.time * 2
            x = (LEFT * 3 + RIGHT * (t % 6))[0]
            if x > 3:
                d.move_to(RIGHT * 3 + DOWN * 0.8)
            else:
                d.move_to([x, 0.8, 0])

        insight = Text("Current is directly proportional to voltage", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class RCDischarge(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("RC Discharge", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"q(t) = Q_0 e^{-t/RC}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=7, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("t").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("q").set_color(PHYSICS_FORCE)

        # Exponential decay curve
        curve = axes.plot(lambda t: 9 * np.exp(-t / 2), x_range=[0, 8], color=PHYSICS_PATH, stroke_width=3)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(curve), run_time=2)

        # Moving dot on curve
        dot = Dot(color=PHYSICS_ENERGY, radius=0.1)
        t_tracker = ValueTracker(0)

        def update_dot(d):
            t = t_tracker.get_value()
            q = 9 * np.exp(-t / 2)
            d.move_to(axes.c2p(t, q))

        dot.add_updater(update_dot)

        q_label = always_redraw(lambda: MathTex(
            f"q = {9 * np.exp(-t_tracker.get_value() / 2):.1f}",
            font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY
        ).to_corner(DR, buff=0.5))

        self.add(dot, q_label)
        self.play(t_tracker.animate.set_value(8), run_time=ANIMATION_DURATION, rate_func=linear)
        dot.remove_updater(update_dot)

        # Show time constant
        tau = axes.plot(lambda t: 9 * np.exp(-1), x_range=[0, 2], color=PHYSICS_FORCE, stroke_width=2, stroke_opacity=0.5)
        tau_label = MathTex(r"\tau = RC", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        tau_label.move_to(axes.c2p(1, 5))

        self.play(Create(tau), Write(tau_label), run_time=1)

        insight = Text("Charge decays exponentially with time constant RC", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ParallelResistance(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Parallel Resistance", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{1}{R_{eq}} = \frac{1}{R_1} + \frac{1}{R_2}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Parallel circuit
        # Top wire
        wire_top = Line(LEFT * 2 + UP * 1.5, RIGHT * 2 + UP * 1.5, color=MUTED_COLOR, stroke_width=2)
        # Bottom wire
        wire_bot = Line(LEFT * 2 + DOWN * 1.5, RIGHT * 2 + DOWN * 1.5, color=MUTED_COLOR, stroke_width=2)

        # R1 branch
        r1 = Rectangle(width=0.6, height=0.3, color=PHYSICS_OBJECT, fill_opacity=0.3)
        r1.move_to(LEFT * 0.5)
        r1_label = MathTex(r"R_1", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        r1_label.next_to(r1, LEFT, buff=0.1)
        wire_r1_top = Line(LEFT * 0.5 + UP * 1.5, LEFT * 0.5 + UP * 0.15, color=MUTED_COLOR, stroke_width=2)
        wire_r1_bot = Line(LEFT * 0.5 + DOWN * 1.5, LEFT * 0.5 + DOWN * 0.15, color=MUTED_COLOR, stroke_width=2)

        # R2 branch
        r2 = Rectangle(width=0.6, height=0.3, color=PHYSICS_FORCE, fill_opacity=0.3)
        r2.move_to(RIGHT * 0.5)
        r2_label = MathTex(r"R_2", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        r2_label.next_to(r2, RIGHT, buff=0.1)
        wire_r2_top = Line(RIGHT * 0.5 + UP * 1.5, RIGHT * 0.5 + UP * 0.15, color=MUTED_COLOR, stroke_width=2)
        wire_r2_bot = Line(RIGHT * 0.5 + DOWN * 1.5, RIGHT * 0.5 + DOWN * 0.15, color=MUTED_COLOR, stroke_width=2)

        # Battery
        bat_pos = Line(LEFT * 2 + DOWN * 1.5, LEFT * 2 + UP * 1.5, color=PHYSICS_FORCE, stroke_width=2)
        bat_label = Text("V", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        bat_label.move_to(LEFT * 2.5)

        circuit = VGroup(wire_top, wire_bot, r1, r1_label, wire_r1_top, wire_r1_bot, r2, r2_label, wire_r2_top, wire_r2_bot, bat_pos, bat_label)

        self.play(FadeIn(circuit), run_time=1)

        # Show example
        example = MathTex(r"R_1 = 2\Omega, R_2 = 3\Omega", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        example.move_to(RIGHT * 3 + UP * 0.5)

        result = MathTex(r"R_{eq} = \frac{2 \times 3}{2 + 3} = 1.2\Omega", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        result.move_to(RIGHT * 3 + DOWN * 0.5)

        self.play(Write(example), run_time=1)
        self.play(Write(result), run_time=1)

        # Show current splitting
        i_total = Arrow(LEFT * 1.5 + UP * 1.5, LEFT * 0.5 + UP * 1.5, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        i1 = Arrow(LEFT * 0.5 + UP * 1.2, LEFT * 0.5 + UP * 0.3, color=PHYSICS_OBJECT, buff=0, stroke_width=2)
        i2 = Arrow(RIGHT * 0.5 + UP * 1.2, RIGHT * 0.5 + UP * 0.3, color=PHYSICS_FORCE, buff=0, stroke_width=2)

        i_label = MathTex(r"I", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        i_label.next_to(i_total, UP, buff=0.05)

        self.play(GrowArrow(i_total), Write(i_label), run_time=0.5)
        self.play(GrowArrow(i1), GrowArrow(i2), run_time=0.5)

        insight = Text("Parallel resistance is always less than smallest resistor", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
