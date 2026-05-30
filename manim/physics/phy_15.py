import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class PhotoelectricEffect(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Photoelectric Effect", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"E = h\nu = \phi + KE_{max}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Metal surface
        metal = Rectangle(width=3, height=0.3, color=PHYSICS_OBJECT, fill_opacity=0.4)
        metal.move_to(DOWN * 0.5)

        # Work function
        phi_label = MathTex(r"\phi", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        phi_label.next_to(metal, DOWN, buff=0.2)

        self.play(FadeIn(metal), Write(phi_label), run_time=0.5)

        # Incoming photon
        photon = VGroup()
        photon_wave = VMobject(color=PHYSICS_ENERGY, stroke_width=2)
        pts = [LEFT * 3 + UP * 1.5]
        for i in range(10):
            x = -3 + 0.3 * (i + 1)
            y = 1.5 + 0.15 * (-1)**i
            pts.append(np.array([x, y, 0]))
        photon_wave.set_points_as_corners(pts)

        photon_label = Text("Photon", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        photon_label.next_to(photon_wave.get_start(), UP, buff=0.1)

        self.play(Create(photon_wave), Write(photon_label), run_time=1)

        # Electron ejected
        electron = Circle(radius=0.1, color=PHYSICS_VELOCITY, fill_opacity=0.8)
        electron.move_to(ORIGIN)
        e_label = MathTex(r"e^-", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        e_label.next_to(electron, UP, buff=0.1)

        ke_arrow = Arrow(metal.get_top(), metal.get_top() + UP * 1.5, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        ke_label = MathTex(r"KE_{max}", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        ke_label.next_to(ke_arrow, RIGHT, buff=0.1)

        self.play(FadeIn(electron), Write(e_label), run_time=0.5)
        self.play(GrowArrow(ke_arrow), Write(ke_label), run_time=1)

        # Energy diagram
        energy_levels = VGroup()
        levels = [
            (UP * 2 + LEFT * 3, "E = hν", PHYSICS_ENERGY),
            (UP * 1 + LEFT * 3, "φ (work function)", PHYSICS_FORCE),
            (ORIGIN + LEFT * 3, "0 (free electron)", PHYSICS_VELOCITY),
        ]

        for pos, label, color in levels:
            line = Line(pos + LEFT * 0.5, pos + RIGHT * 0.5, color=color, stroke_width=2)
            l = Text(label, font_size=SMALL_FONT_SIZE, color=color)
            l.next_to(line, RIGHT, buff=0.1)
            energy_levels.add(VGroup(line, l))

        self.play(FadeIn(energy_levels), run_time=1)

        insight = Text("Below threshold frequency, no electrons are emitted", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class BohrOrbits(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Bohr Orbits", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"E_n = -\frac{13.6}{n^2}\,eV", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Nucleus
        nucleus = Circle(radius=0.2, color=PHYSICS_FORCE, fill_opacity=0.8)
        nucleus.move_to(DOWN * 0.5)
        n_label = Text("+", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        n_label.move_to(nucleus)

        self.play(FadeIn(nucleus), Write(n_label), run_time=0.5)

        # Orbits
        orbits = VGroup()
        orbit_radii = [0.8, 1.3, 1.9, 2.6]
        orbit_labels = VGroup()

        for i, r in enumerate(orbit_radii):
            circle = Circle(radius=r, color=PHYSICS_PATH, stroke_width=1.5, stroke_opacity=0.5)
            circle.move_to(DOWN * 0.5)
            orbits.add(circle)

            energy = -13.6 / (i + 1)**2
            l = MathTex(f"n={i+1}, E={energy:.1f}eV", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
            l.move_to(RIGHT * 3 + UP * (1.5 - i * 0.6))
            orbit_labels.add(l)

        self.play(Create(orbits), FadeIn(orbit_labels), run_time=2)

        # Electron on orbit 3
        electron = Dot(color=PHYSICS_VELOCITY, radius=0.08)
        angle_tracker = ValueTracker(0)

        def update_e(d):
            angle = angle_tracker.get_value()
            r = orbit_radii[2]
            d.move_to(DOWN * 0.5 + r * np.array([np.cos(angle), np.sin(angle), 0]))

        electron.add_updater(update_e)
        self.add(electron)

        # Transition n=3 -> n=1 (photon emitted)
        self.play(angle_tracker.animate.set_value(np.pi), run_time=1, rate_func=linear)

        # Transition arrow
        trans_arrow = Arrow(
            DOWN * 0.5 + UP * orbit_radii[2],
            DOWN * 0.5 + UP * orbit_radii[0],
            color=PHYSICS_ENERGY, buff=0, stroke_width=3
        )
        photon_emitted = Text("Photon emitted!", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        photon_emitted.move_to(RIGHT * 2 + UP * 0.5)

        self.play(GrowArrow(trans_arrow), Write(photon_emitted), run_time=1)

        # Show energy difference
        delta_e = MathTex(r"\Delta E = E_3 - E_1 = 12.09\,eV", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        delta_e.move_to(DOWN * 2.5)
        self.play(Write(delta_e), run_time=1)

        electron.remove_updater(update_e)

        insight = Text("Electron transitions produce discrete spectral lines", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class RadioactiveDecay(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Radioactive Decay", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"N = N_0 e^{-\lambda t}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=7, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("t").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("N").set_color(PHYSICS_FORCE)

        # Decay curve
        curve = axes.plot(lambda t: 9 * np.exp(-t / 2), x_range=[0, 8], color=PHYSICS_PATH, stroke_width=3)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(curve), run_time=2)

        # Half-life annotation
        half_y = 9 / 2
        half_line_h = DashedLine(axes.c2p(0, half_y), axes.c2p(2, half_y), color=PHYSICS_ENERGY, stroke_width=1)
        half_line_v = DashedLine(axes.c2p(2, 0), axes.c2p(2, half_y), color=PHYSICS_ENERGY, stroke_width=1)
        half_label = MathTex(r"t_{1/2}", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        half_label.next_to(half_line_v, DOWN, buff=0.1)

        n0_label = MathTex(r"N_0", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        n0_label.next_to(axes.c2p(0, 9), LEFT, buff=0.1)
        half_n_label = MathTex(r"N_0/2", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        half_n_label.next_to(half_line_h, LEFT, buff=0.1)

        self.play(Create(half_line_h), Create(half_line_v), Write(half_label), run_time=1)
        self.play(Write(n0_label), Write(half_n_label), run_time=0.5)

        # Moving dot
        dot = Dot(color=PHYSICS_OBJECT, radius=0.1)
        t_tracker = ValueTracker(0)

        def update_dot(d):
            t = t_tracker.get_value()
            n = 9 * np.exp(-t / 2)
            d.move_to(axes.c2p(t, n))

        dot.add_updater(update_dot)
        self.add(dot)

        self.play(t_tracker.animate.set_value(8), run_time=ANIMATION_DURATION * 0.6, rate_func=linear)
        dot.remove_updater(update_dot)

        # Show lambda relationship
        lambda_eq = MathTex(r"t_{1/2} = \frac{\ln 2}{\lambda}", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        lambda_eq.move_to(RIGHT * 3 + UP * 1.5)
        self.play(Write(lambda_eq), run_time=1)

        insight = Text("Half-life is the time for half the nuclei to decay", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
