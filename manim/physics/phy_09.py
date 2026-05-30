import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class SHMEquation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Simple Harmonic Motion", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"x = A\sin(\omega t)", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Spring-mass system
        wall = Rectangle(width=0.1, height=0.8, color=MUTED_COLOR, fill_opacity=0.5)
        wall.move_to(LEFT * 4)

        # Spring
        spring = VMobject(color=PHYSICS_OBJECT, stroke_width=2)
        spring_pts = [LEFT * 3.8]
        for i in range(10):
            x = 0.1 * (i + 1)
            y = 0.1 * (-1)**i
            spring_pts.append(LEFT * 3.8 + RIGHT * x + UP * y)
        spring.set_points_as_corners(spring_pts)

        # Mass
        mass = Square(side_length=0.5, color=PHYSICS_OBJECT, fill_opacity=0.3)
        mass.move_to(LEFT * 2.5)

        spring_system = VGroup(wall, spring, mass)

        # Equilibrium line
        eq_line = DashedLine(LEFT * 2.5 + UP * 1, LEFT * 2.5 + DOWN * 1, color=MUTED_COLOR, stroke_width=1)
        eq_label = Text("x=0", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
        eq_label.next_to(eq_line, UP, buff=0.1)

        self.play(FadeIn(spring_system), Create(eq_line), Write(eq_label), run_time=0.5)

        # Oscillate mass
        t_tracker = ValueTracker(0)
        omega = 2
        amplitude = 1

        def update_mass(m):
            t = t_tracker.get_value()
            x = amplitude * np.sin(omega * t)
            m.move_to(LEFT * 2.5 + RIGHT * x)

        mass.add_updater(update_mass)

        # Position label
        pos_label = always_redraw(lambda: MathTex(
            f"x = {amplitude:.0f}\\sin({omega}t) = {amplitude * np.sin(omega * t_tracker.get_value()):.2f}",
            font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY
        ).to_corner(DR, buff=0.5))

        self.add(mass, pos_label)
        self.play(t_tracker.animate.set_value(4 * np.pi / omega), run_time=ANIMATION_DURATION, rate_func=linear)
        mass.remove_updater(update_mass)

        insight = Text("SHM: restoring force proportional to displacement", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class SHMPeriod(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("SHM Period", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"T = 2\pi\sqrt{\frac{m}{k}}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Two spring-mass systems
        # System 1: light mass
        wall1 = Rectangle(width=0.1, height=0.6, color=MUTED_COLOR, fill_opacity=0.5)
        wall1.move_to(LEFT * 4 + UP * 0.5)
        mass1 = Square(side_length=0.3, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        mass1.move_to(LEFT * 2.5 + UP * 0.5)
        label1 = Text("m (light)", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        label1.next_to(mass1, DOWN, buff=0.1)

        # System 2: heavy mass
        wall2 = Rectangle(width=0.1, height=0.6, color=MUTED_COLOR, fill_opacity=0.5)
        wall2.move_to(LEFT * 4 + DOWN * 1)
        mass2 = Square(side_length=0.6, color=PHYSICS_FORCE, fill_opacity=0.3)
        mass2.move_to(LEFT * 2.5 + DOWN * 1)
        label2 = Text("M (heavy)", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        label2.next_to(mass2, DOWN, buff=0.1)

        self.play(FadeIn(wall1), FadeIn(mass1), Write(label1), FadeIn(wall2), FadeIn(mass2), Write(label2), run_time=1)

        # Animate - light oscillates faster
        t_tracker = ValueTracker(0)

        def update_m1(m):
            t = t_tracker.get_value()
            x = 0.8 * np.sin(3 * t)
            m.move_to(LEFT * 2.5 + RIGHT * x + UP * 0.5)

        def update_m2(m):
            t = t_tracker.get_value()
            x = 0.8 * np.sin(1.5 * t)
            m.move_to(LEFT * 2.5 + RIGHT * x + DOWN * 1)

        mass1.add_updater(update_m1)
        mass2.add_updater(update_m2)

        t1_label = MathTex(r"T_{light}", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        t1_label.move_to(RIGHT * 2 + UP * 0.5)
        t2_label = MathTex(r"T_{heavy}", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        t2_label.move_to(RIGHT * 2 + DOWN * 1)

        self.add(mass1, mass2)
        self.play(Write(t1_label), Write(t2_label), run_time=0.5)
        self.play(t_tracker.animate.set_value(4), run_time=ANIMATION_DURATION * 0.8, rate_func=linear)

        mass1.remove_updater(update_m1)
        mass2.remove_updater(update_m2)

        insight = Text("Heavier mass = longer period (slower oscillation)", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class WaveVelocity(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Wave Velocity", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"v = f\lambda", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Wave visualization
        axes = Axes(
            x_range=[0, 20, 2], y_range=[-2, 2, 1],
            x_length=10, y_length=3,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=False,
        ).move_to(DOWN * 0.5)

        x_label = axes.get_x_axis_label("x").set_color(PHYSICS_VELOCITY)
        self.play(Create(axes), Write(x_label), run_time=0.5)

        # Moving wave
        wave = always_redraw(lambda: axes.plot(
            lambda x: np.sin(x - self.time * 3),
            x_range=[0, 18],
            color=PHYSICS_PATH,
            stroke_width=3
        ))

        # Wavelength annotation
        lambda_line = Line(axes.c2p(0, -1.5), axes.c2p(2 * np.pi, -1.5), color=PHYSICS_ENERGY, stroke_width=2)
        lambda_arrow1 = Arrow(axes.c2p(0, -1.5), axes.c2p(0, -1.3), color=PHYSICS_ENERGY, buff=0, stroke_width=2)
        lambda_arrow2 = Arrow(axes.c2p(2 * np.pi, -1.5), axes.c2p(2 * np.pi, -1.3), color=PHYSICS_ENERGY, buff=0, stroke_width=2)
        lambda_label = MathTex(r"\lambda", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        lambda_label.next_to(lambda_line, DOWN, buff=0.1)

        self.add(wave)
        self.play(Create(lambda_line), Create(lambda_arrow1), Create(lambda_arrow2), Write(lambda_label), run_time=1)

        # Frequency label
        f_label = MathTex(r"f = \\text{cycles/s}", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        f_label.move_to(UP * 2)
        self.play(Write(f_label), run_time=1)

        self.wait(ANIMATION_DURATION)

        insight = Text("Wave speed = frequency times wavelength", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class Superposition(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Wave Superposition", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"y = y_1 + y_2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 16, 2], y_range=[-3, 3, 1],
            x_length=10, y_length=3,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=False,
        ).move_to(DOWN * 0.8)

        # Two waves
        wave1 = axes.plot(lambda x: np.sin(x), x_range=[0, 15], color=PHYSICS_OBJECT, stroke_width=2, stroke_opacity=0.6)
        wave2 = axes.plot(lambda x: np.sin(x + np.pi), x_range=[0, 15], color=PHYSICS_VELOCITY, stroke_width=2, stroke_opacity=0.6)
        # Sum (destructive in this case)
        result_wave = axes.plot(lambda x: np.sin(x) + np.sin(x + np.pi), x_range=[0, 15], color=PHYSICS_FORCE, stroke_width=3)

        # Labels
        l1 = MathTex(r"y_1", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        l1.next_to(wave1, UP, buff=0.1)
        l2 = MathTex(r"y_2", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        l2.next_to(wave2, DOWN, buff=0.1)
        lr = MathTex(r"y_1 + y_2 = 0", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        lr.move_to(DOWN * 2.2)

        self.play(Create(axes), run_time=0.5)
        self.play(Create(wave1), Write(l1), run_time=1)
        self.play(Create(wave2), Write(l2), run_time=1)

        # Show destructive interference
        destructive = Text("Destructive Interference", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        destructive.move_to(UP * 2)
        self.play(Write(destructive), run_time=1)
        self.play(Create(result_wave), Write(lr), run_time=2)

        insight = Text("Waves add algebraically at each point", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DopplerEffect(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Doppler Effect", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"f' = f\left(\frac{v \pm v_o}{v \mp v_s}\right)", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Source
        source = Circle(radius=0.2, color=PHYSICS_OBJECT, fill_opacity=0.8)
        source.move_to(LEFT * 2)

        # Observer
        observer = Triangle(color=PHYSICS_VELOCITY, fill_opacity=0.5)
        observer.scale(0.3)
        observer.move_to(RIGHT * 3)

        # Wave fronts (compressed in front, stretched behind)
        fronts = VGroup()
        for i in range(5):
            r = 0.3 * (i + 1)
            # Offset towards observer
            center_offset = RIGHT * 0.1 * i
            circle = Circle(radius=r, color=PHYSICS_PATH, stroke_width=1, stroke_opacity=0.5)
            circle.move_to(source.get_center() + center_offset)
            fronts.add(circle)

        s_label = Text("Source", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        s_label.next_to(source, UP, buff=0.2)
        o_label = Text("Observer", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        o_label.next_to(observer, DOWN, buff=0.2)

        self.play(FadeIn(source), FadeIn(observer), Write(s_label), Write(o_label), run_time=0.5)
        self.play(FadeIn(fronts), run_time=1)

        # Labels
        approaching = Text("Approaching: Higher f", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        approaching.move_to(LEFT * 2 + DOWN * 2)
        receding = Text("Receding: Lower f", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        receding.move_to(RIGHT * 2 + DOWN * 2)

        self.play(Write(approaching), Write(receding), run_time=1)

        # Move source towards observer
        self.play(source.animate.shift(RIGHT * 2), run_time=ANIMATION_DURATION * 0.5, rate_func=linear)

        insight = Text("Motion towards observer increases perceived frequency", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
