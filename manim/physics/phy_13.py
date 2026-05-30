import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class MagneticFlux(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Magnetic Flux", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\Phi_B = BA\cos\theta", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Magnetic field lines
        field_lines = VGroup()
        for y in [-1.5, -0.5, 0.5, 1.5]:
            arr = Arrow(LEFT * 4 + UP * y, RIGHT * 4 + UP * y, color=PHYSICS_FIELD, buff=0, stroke_width=1.5)
            field_lines.add(arr)

        b_label = MathTex(r"B", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        b_label.move_to(RIGHT * 4.3 + UP * 0)
        self.play(FadeIn(field_lines), Write(b_label), run_time=1)

        # Rotating loop
        loop = Rectangle(width=2, height=1.5, color=PHYSICS_OBJECT, stroke_width=2, fill_opacity=0.15)
        loop.move_to(ORIGIN)

        # Normal vector
        normal = Arrow(loop.get_center(), loop.get_center() + UP * 1, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        n_label = MathTex(r"\hat{n}", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        n_label.next_to(normal, UP, buff=0.1)

        self.play(FadeIn(loop), GrowArrow(normal), Write(n_label), run_time=1)

        # Animate rotation
        angle_tracker = ValueTracker(0)

        def update_loop(l):
            l.become(Rectangle(width=2, height=1.5, color=PHYSICS_OBJECT, stroke_width=2, fill_opacity=0.15).move_to(ORIGIN).rotate(angle_tracker.get_value(), axis=UP))

        def update_normal(n):
            angle = angle_tracker.get_value()
            direction = np.array([np.sin(angle), np.cos(angle), 0])
            n.put_start_and_end_on(ORIGIN, direction * 1)

        loop.add_updater(update_loop)
        normal.add_updater(update_normal)

        # Flux display
        flux_label = always_redraw(lambda: MathTex(
            f"\\Phi = BA\\cos({np.degrees(angle_tracker.get_value()):.0f}°)",
            font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY
        ).to_corner(DR, buff=0.5))

        self.add(loop, normal, flux_label)
        self.play(angle_tracker.animate.set_value(np.pi), run_time=ANIMATION_DURATION, rate_func=smooth)

        loop.remove_updater(update_loop)
        normal.remove_updater(update_normal)

        insight = Text("Flux is maximum when loop is perpendicular to field", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class FaradayLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Faraday's Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\varepsilon = -\frac{d\Phi_B}{dt}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Coil
        coil = Circle(radius=1, color=PHYSICS_OBJECT, stroke_width=3)
        coil.move_to(LEFT * 2)

        # Magnetic field (changing)
        field_arrows = VGroup()
        for y in [-0.5, 0, 0.5]:
            arr = Arrow(ORIGIN + UP * y, RIGHT * 0.8 + UP * y, color=PHYSICS_FIELD, buff=0, stroke_width=2)
            field_arrows.add(arr)

        b_label = MathTex(r"B(t)", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        b_label.move_to(LEFT * 2 + UP * 1.5)

        self.play(Create(coil), FadeIn(field_arrows), Write(b_label), run_time=1)

        # EMF indicator
        emf_meter = Rectangle(width=1.5, height=0.8, color=PHYSICS_ENERGY, fill_opacity=0.2)
        emf_meter.move_to(RIGHT * 2)
        emf_label = MathTex(r"\varepsilon", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        emf_label.move_to(emf_meter)

        self.play(FadeIn(emf_meter), Write(emf_label), run_time=0.5)

        # Animate changing B -> induced EMF
        b_tracker = ValueTracker(1)

        def update_field(fa):
            b = b_tracker.get_value()
            for arr in fa:
                arr.put_start_and_end_on(ORIGIN + UP * arr.get_center()[1], RIGHT * 0.8 * b + UP * arr.get_center()[1])

        field_arrows.add_updater(update_field)

        # EMF bar
        emf_bar = Rectangle(width=0.3, height=0.1, color=PHYSICS_FORCE, fill_opacity=0.5)
        emf_bar.move_to(emf_meter.get_bottom() + UP * 0.05)

        self.add(field_arrows)
        self.play(b_tracker.animate.set_value(2), run_time=2)
        self.play(b_tracker.animate.set_value(0.5), run_time=2)

        field_arrows.remove_updater(update_field)

        # Show graph
        axes = Axes(
            x_range=[0, 6, 1], y_range=[-3, 3, 1],
            x_length=4, y_length=2,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=False,
        ).move_to(RIGHT * 2 + DOWN * 2)

        b_curve = axes.plot(lambda t: np.sin(t), x_range=[0, 5], color=PHYSICS_FIELD, stroke_width=2)
        emf_curve = axes.plot(lambda t: -np.cos(t), x_range=[0, 5], color=PHYSICS_ENERGY, stroke_width=2)

        b_legend = MathTex(r"B", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD)
        b_legend.move_to(axes.c2p(5, 1.3))
        e_legend = MathTex(r"\varepsilon", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        e_legend.move_to(axes.c2p(5, -1.3))

        self.play(Create(axes), Create(b_curve), Write(b_legend), run_time=1)
        self.play(Create(emf_curve), Write(e_legend), run_time=1)

        insight = Text("Changing magnetic flux induces an EMF", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class LCROscillation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("LCR Oscillation", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\omega = \frac{1}{\sqrt{LC}}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Energy oscillation
        axes = Axes(
            x_range=[0, 12, 2], y_range=[0, 10, 2],
            x_length=8, y_length=3,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("t").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("Energy").set_color(PHYSICS_ENERGY)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Electric energy (cos^2)
        e_elec = axes.plot(lambda t: 5 * (np.cos(t))**2, x_range=[0, 10], color=PHYSICS_FORCE, stroke_width=3)
        # Magnetic energy (sin^2)
        e_mag = axes.plot(lambda t: 5 * (np.sin(t))**2, x_range=[0, 10], color=PHYSICS_FIELD, stroke_width=3)
        # Total energy
        e_total = axes.plot(lambda t: 5, x_range=[0, 10], color=PHYSICS_ENERGY, stroke_width=2, stroke_opacity=0.5)

        elec_label = MathTex(r"E_E = \\frac{1}{2}CV^2", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        elec_label.move_to(axes.c2p(1, 6))
        mag_label = MathTex(r"E_B = \\frac{1}{2}LI^2", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD)
        mag_label.move_to(axes.c2p(1, -0.5))
        total_label = MathTex(r"E_{total}", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        total_label.move_to(axes.c2p(8, 5.5))

        self.play(Create(e_elec), Write(elec_label), run_time=1.5)
        self.play(Create(e_mag), Write(mag_label), run_time=1.5)
        self.play(Create(e_total), Write(total_label), run_time=1)

        insight = Text("Energy oscillates between electric and magnetic fields", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ResonantFrequency(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Resonant Frequency", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"f_0 = \frac{1}{2\pi\sqrt{LC}}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=7, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("f").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("Z").set_color(PHYSICS_FORCE)

        # Impedance curve (peak at resonance)
        z_curve = axes.plot(lambda f: 8 / (1 + (f - 5)**2), x_range=[0.5, 9.5], color=PHYSICS_PATH, stroke_width=3)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(z_curve), run_time=2)

        # Resonance peak
        peak = Dot(axes.c2p(5, 8), color=PHYSICS_ENERGY, radius=0.1)
        peak_label = MathTex(r"f_0", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        peak_label.next_to(peak, UP, buff=0.1)

        # Dashed line
        resonance_line = DashedLine(axes.c2p(5, 0), axes.c2p(5, 8), color=PHYSICS_ENERGY, stroke_width=1)

        self.play(Create(resonance_line), FadeIn(peak), Write(peak_label), run_time=1)

        # High and low impedance regions
        low_z = Text("Low Z\n(constructive)", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        low_z.move_to(axes.c2p(2, 2))
        high_z = Text("Low Z", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        high_z.move_to(axes.c2p(8, 2))

        self.play(Write(low_z), Write(high_z), run_time=1)

        insight = Text("Impedance is maximum at resonant frequency", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
