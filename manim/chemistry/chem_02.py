import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class BohrOrbits(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Bohr's Atomic Model", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"E_n = -\frac{13.6}{n^2}\,\text{eV}", font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Nucleus
        nucleus = Circle(radius=0.2, color=CHEM_REACTION, fill_opacity=0.9)
        nucleus_label = MathTex(r"+", font_size=TITLE_FONT_SIZE, color=BG_COLOR)
        nucleus_group = VGroup(nucleus, nucleus_label).move_to(ORIGIN + DOWN * 0.5)

        self.play(FadeIn(nucleus_group), run_time=0.5)

        # Orbits
        orbits = VGroup()
        orbit_labels = VGroup()
        energies = [-13.6, -3.4, -1.51, -0.85]
        radii = [0.6, 1.2, 1.8, 2.4]

        for i, (r, E) in enumerate(zip(radii, energies)):
            orbit = Circle(radius=r, color=CHEM_ELECTRON, stroke_opacity=0.4, stroke_width=1.5)
            orbit.move_to(nucleus_group)
            n_label = MathTex(f"n={i+1}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
            n_label.next_to(orbit, RIGHT, buff=0.1)
            e_label = MathTex(f"{E}\\,\\text{{eV}}", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY)
            e_label.next_to(n_label, DOWN, buff=0.05)
            orbits.add(orbit)
            orbit_labels.add(VGroup(n_label, e_label))

        self.play(Create(orbits), run_time=1)
        self.play(FadeIn(orbit_labels), run_time=0.5)

        # Electrons on orbits
        electrons = VGroup()
        electron_orbits = [0, 1, 2]
        for idx in electron_orbits:
            e = Dot(radius=0.08, color=CHEM_ELECTRON)
            angle = np.random.uniform(0, 2 * np.pi)
            e.move_to(nucleus_group.get_center() + radii[idx] * np.array([np.cos(angle), np.sin(angle), 0]))
            electrons.add(e)

        self.play(FadeIn(electrons), run_time=0.5)

        # Animate electron jumping (transition)
        electron = electrons[0]
        orbit0_center = nucleus_group.get_center()
        target_angle = np.pi / 4
        target_pos = orbit0_center + radii[2] * np.array([np.cos(target_angle), np.sin(target_angle), 0])

        # Glow effect
        glow = Circle(radius=0.15, color=CHEM_ENERGY, fill_opacity=0.3)
        glow.move_to(electron)

        self.play(FadeIn(glow), run_time=0.3)
        self.play(
            electron.animate.move_to(target_pos),
            glow.animate.move_to(target_pos),
            run_time=1.5,
            rate_func=smooth
        )
        self.play(FadeOut(glow), run_time=0.3)

        # Show photon emission
        photon_arrow = Arrow(
            nucleus_group.get_center() + UP * 0.5,
            nucleus_group.get_center() + UP * 2.5 + RIGHT * 1.5,
            color=CHEM_REACTION, buff=0
        )
        photon_label = MathTex(r"\gamma", font_size=FORMULA_FONT_SIZE, color=CHEM_REACTION)
        photon_label.next_to(photon_arrow, RIGHT, buff=0.1)

        self.play(GrowArrow(photon_arrow), Write(photon_label), run_time=1)

        insight = Text("Electrons jump between quantized energy levels", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class RydbergFormula(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Rydberg Formula", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\frac{1}{\lambda} = R_H\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Energy levels
        levels = VGroup()
        level_energies = [-13.6, -3.4, -1.51, -0.85, -0.54]
        level_y = [-2.5, -1.5, -0.7, -0.1, 0.3]

        for i, (E, y) in enumerate(zip(level_energies, level_y)):
            line = Line(LEFT * 3 + UP * y, RIGHT * 3 + UP * y, color=CHEM_ELECTRON, stroke_width=2)
            label = MathTex(f"n={i+1}: {E}\\,\\text{{eV}}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
            label.next_to(line, RIGHT, buff=0.2)
            levels.add(VGroup(line, label))

        self.play(Create(levels), run_time=1)

        # Transition arrows (spectral lines)
        transitions = [
            (3, 1, "Lyman", CHEM_REACTION),
            (3, 2, "Balmer", CHEM_PRODUCT),
            (4, 2, "Balmer", CHEM_PRODUCT),
        ]

        for n2, n1, series, color in transitions:
            start = levels[n2 - 1][0].get_center()
            end = levels[n1 - 1][0].get_center()
            mid_x = start[0] + 1.5

            arrow = Arrow(
                start + RIGHT * 0.5,
                end + RIGHT * 0.5,
                color=color, buff=0.1, stroke_width=3
            )
            s_label = MathTex(series, font_size=SMALL_FONT_SIZE, color=color)
            s_label.next_to(arrow, RIGHT, buff=0.1)

            self.play(GrowArrow(arrow), Write(s_label), run_time=1)
            self.wait(0.3)

        # Spectral lines display
        spectrum = VGroup()
        spec_positions = [-3, -1.5, 0, 1.5, 3]
        spec_colors = [CHEM_REACTION, CHEM_REACTION, CHEM_PRODUCT, CHEM_PRODUCT, CHEM_ENERGY]
        spec_labels = [r"L\alpha", r"L\beta", r"H\alpha", r"H\beta", r"H\gamma"]

        spec_base = DOWN * 2.8
        spec_rect = Rectangle(width=7, height=0.5, color=MUTED_COLOR, fill_opacity=0.1)
        spec_rect.move_to(spec_base)
        self.play(FadeIn(spec_rect), run_time=0.3)

        for x, c, l in zip(spec_positions, spec_colors, spec_labels):
            line = Line(
                spec_base + UP * 0.25 + RIGHT * x,
                spec_base + DOWN * 0.25 + RIGHT * x,
                color=c, stroke_width=3
            )
            label = MathTex(l, font_size=SMALL_FONT_SIZE, color=c)
            label.next_to(line, DOWN, buff=0.1)
            self.play(Create(line), Write(label), run_time=0.5)

        insight = Text("Different transitions produce characteristic spectral lines", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class HeisenbergUncertainty(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Heisenberg Uncertainty", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Delta x \cdot \Delta p \geq \frac{\hbar}{2}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Position axis
        pos_axis = NumberLine(
            x_range=[-4, 4, 1], length=8,
            color=MUTED_COLOR, include_numbers=True,
            numbers_to_include=[-3, -2, -1, 0, 1, 2, 3]
        ).move_to(DOWN * 0.5)

        x_label = MathTex(r"x", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON)
        x_label.next_to(pos_axis, RIGHT, buff=0.2)
        self.play(Create(pos_axis), Write(x_label), run_time=0.8)

        # Gaussian wave packet - position
        gaussian_pos = ParametricFunction(
            lambda t: pos_axis.number_to_point(t) + UP * 2.0 * np.exp(-t**2 / 0.5),
            t_range=[-4, 4, 0.05],
            color=CHEM_ELECTRON, stroke_width=2
        )
        self.play(Create(gaussian_pos), run_time=1.5)

        # Delta x indicator
        delta_x = DoubleArrow(
            pos_axis.number_to_point(-0.7), pos_axis.number_to_point(0.7),
            color=CHEM_REACTION, buff=0.1, stroke_width=2
        )
        dx_label = MathTex(r"\Delta x", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        dx_label.next_to(delta_x, DOWN, buff=0.1)
        self.play(GrowArrow(delta_x), Write(dx_label), run_time=0.8)

        # Momentum representation
        mom_title = MathTex(r"\text{Momentum Space}", font_size=LABEL_FONT_SIZE, color=CHEM_BOND)
        mom_title.move_to(DOWN * 2)
        self.play(Write(mom_title), run_time=0.5)

        # Narrow position -> wide momentum
        narrow_gauss = gaussian_pos.copy().set_color(CHEM_PRODUCT)
        self.play(
            gaussian_pos.animate.stretch(0.3, 0),
            delta_x.animate.scale(0.3),
            run_time=1.5
        )

        # Now show momentum becomes wide
        wide_note = Text("Narrow position \u2192 Wide momentum", font_size=LABEL_FONT_SIZE, color=CHEM_BOND)
        wide_note.move_to(DOWN * 2.5)
        self.play(Write(wide_note), run_time=1)

        # Reset and show opposite
        self.play(
            gaussian_pos.animate.stretch(3.0, 0),
            run_time=1
        )

        wide_note2 = Text("Wide position \u2192 Narrow momentum", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        wide_note2.move_to(DOWN * 2.5)
        self.play(FadeOut(wide_note), Write(wide_note2), run_time=1)

        insight = Text("You cannot simultaneously know exact position and momentum", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class OrbitalShapes(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Atomic Orbital Shapes", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\psi_{nlm}(r,\theta,\phi)",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # s orbital - sphere
        s_orbital = Circle(radius=0.8, color=CHEM_ELECTRON, fill_opacity=0.2, stroke_width=2)
        s_label = Text("s orbital\n(l=0)", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        s_group = VGroup(s_orbital, s_label).move_to(LEFT * 3.5 + DOWN * 1)

        # p orbitals - figure-8 / dumbbell
        p1_top = Ellipse(width=0.6, height=1.2, color=CHEM_REACTION, fill_opacity=0.2, stroke_width=2)
        p1_bot = Ellipse(width=0.6, height=1.2, color=CHEM_PRODUCT, fill_opacity=0.2, stroke_width=2)
        p1_top.shift(UP * 0.7)
        p1_bot.shift(DOWN * 0.7)
        p1_label = Text("p orbital\n(l=1)", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
        p1_group = VGroup(p1_top, p1_bot, p1_label).move_to(ORIGIN + DOWN * 1)

        # d orbital - clover shape
        d_angles = [0, np.pi/2, np.pi, 3*np.pi/2]
        d_petals = VGroup()
        for angle in d_angles:
            petal = Ellipse(width=0.4, height=1.0, color=CHEM_ENERGY, fill_opacity=0.15, stroke_width=1.5)
            petal.rotate(angle)
            d_petals.add(petal)
        d_label = Text("d orbital\n(l=2)", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY)
        d_group = VGroup(d_petals, d_label).move_to(RIGHT * 3.5 + DOWN * 1)

        self.play(FadeIn(s_group), run_time=1)
        self.play(FadeIn(p1_group), run_time=1)
        self.play(FadeIn(d_group), run_time=1)

        # Animate s orbital pulsing
        self.play(
            s_orbital.animate.scale(1.3).set_fill(CHEM_ELECTRON, 0.4),
            run_time=0.8, rate_func=there_and_back
        )

        # Animate p orbital lobes alternating
        self.play(
            p1_top.animate.set_fill(CHEM_REACTION, 0.5),
            p1_bot.animate.set_fill(CHEM_PRODUCT, 0.5),
            run_time=0.8
        )
        self.play(
            p1_top.animate.set_fill(CHEM_REACTION, 0.2),
            p1_bot.animate.set_fill(CHEM_PRODUCT, 0.2),
            run_time=0.8
        )

        # Show quantum numbers
        qn = VGroup(
            MathTex(r"n = \text{principal}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"l = \text{angular momentum}", font_size=SMALL_FONT_SIZE, color=CHEM_BOND),
            MathTex(r"m_l = \text{magnetic}", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY),
        ).arrange(DOWN, buff=0.2).move_to(DOWN * 2.5)

        self.play(FadeIn(qn), run_time=1)

        insight = Text("Each orbital has a unique shape defined by quantum numbers", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
