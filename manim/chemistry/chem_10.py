import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class IdealGasLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Ideal Gas Law", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"PV = nRT",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # R constant
        R_val = MathTex(
            r"R = 8.314\,\text{J/(mol\cdot K)}",
            font_size=LABEL_FONT_SIZE, color=CHEM_BOND
        )
        R_val.move_to(ORIGIN + DOWN * 0.3)
        self.play(Write(R_val), run_time=0.5)

        # Piston-cylinder diagram
        cylinder = Rectangle(width=2.5, height=2.5, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=2)
        cylinder.move_to(LEFT * 3 + DOWN * 1.5)

        piston = Rectangle(width=2.5, height=0.2, color=CHEM_BOND, fill_opacity=0.6, stroke_width=1)
        piston.move_to(cylinder.get_top() + UP * 0.1)

        # Gas molecules inside
        molecules = VGroup()
        np.random.seed(42)
        for _ in range(12):
            x = np.random.uniform(-0.9, 0.9)
            y = np.random.uniform(-0.9, 0.5)
            mol = Dot(cylinder.get_center() + RIGHT * x + UP * y, radius=0.05, color=CHEM_MOLECULE)
            molecules.add(mol)

        self.play(FadeIn(cylinder), FadeIn(piston), FadeIn(molecules), run_time=1)

        # Pressure arrow
        p_arrow = Arrow(
            cylinder.get_top() + UP * 0.8,
            piston.get_top(),
            color=CHEM_REACTION, buff=0, stroke_width=2
        )
        p_label = MathTex(r"P", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        p_label.next_to(p_arrow, LEFT, buff=0.1)

        # Volume label
        v_label = MathTex(r"V", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        v_label.move_to(cylinder.get_center())

        self.play(GrowArrow(p_arrow), Write(p_label), Write(v_label), run_time=0.8)

        # Animate compression
        self.play(
            piston.animate.shift(DOWN * 0.5),
            molecules.animate.scale(0.8),
            run_time=1.5
        )

        # Combined gas law
        combined = MathTex(
            r"\frac{P_1 V_1}{T_1} = \frac{P_2 V_2}{T_2}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_PRODUCT
        )
        combined.to_edge(DOWN, buff=0.8)
        self.play(Write(combined), run_time=1)

        # Relationships
        relationships = VGroup(
            MathTex(r"P \propto \frac{1}{V}\,(\text{Boyle})", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"V \propto T\,(\text{Charles})", font_size=SMALL_FONT_SIZE, color=CHEM_BOND),
            MathTex(r"P \propto T\,(\text{Gay-Lussac})", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION),
        ).arrange(DOWN, buff=0.1).move_to(RIGHT * 3 + DOWN * 1.5)

        for r in relationships:
            self.play(Write(r), run_time=0.5)

        insight = Text("Ideal gas law combines all gas laws into one equation", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class KineticMolecularTheory(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Kinetic Molecular Theory", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"KE_{\text{avg}} = \frac{3}{2}RT",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Container
        container = Rectangle(width=5, height=3, color=CHEM_ELECTRON, fill_opacity=0.05, stroke_width=2)
        container.move_to(DOWN * 0.5)

        self.play(FadeIn(container), run_time=0.5)

        # Moving particles
        particles = VGroup()
        velocities = VGroup()
        np.random.seed(42)

        for _ in range(8):
            dot = Dot(
                container.get_center() + np.array([
                    np.random.uniform(-2, 2),
                    np.random.uniform(-1.2, 1.2),
                    0
                ]),
                radius=0.08, color=CHEM_MOLECULE
            )
            particles.add(dot)

        self.play(FadeIn(particles), run_time=0.5)

        # Animate random motion
        animations = []
        for p in particles:
            target = container.get_center() + np.array([
                np.random.uniform(-2, 2),
                np.random.uniform(-1.2, 1.2),
                0
            ])
            animations.append(p.animate.move_to(target))

        self.play(*animations, run_time=2)

        # Assumptions
        assumptions = VGroup(
            Text("1. Gas particles are in random motion", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            Text("2. No intermolecular forces", font_size=SMALL_FONT_SIZE, color=CHEM_BOND),
            Text("3. Elastic collisions", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT),
            Text("4. KE proportional to temperature", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).move_to(RIGHT * 3.5 + DOWN * 0.5)

        for a in assumptions:
            self.play(Write(a), run_time=0.5)

        # Root mean square speed
        vrms = MathTex(
            r"v_{\text{rms}} = \sqrt{\frac{3RT}{M}}",
            font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY
        )
        vrms.to_edge(DOWN, buff=0.8)
        self.play(Write(vrms), run_time=0.8)

        insight = Text("Temperature measures average kinetic energy of molecules", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class GasMixtures(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Gas Mixtures & Partial Pressure", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"P_{\text{total}} = P_A + P_B + P_C + \cdots",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Dalton's Law
        dalton = MathTex(
            r"P_i = x_i \cdot P_{\text{total}}",
            font_size=LABEL_FONT_SIZE, color=CHEM_BOND
        )
        dalton.move_to(ORIGIN + DOWN * 0.3)
        self.play(Write(dalton), run_time=0.5)

        # Container with gas mixture
        container = Rectangle(width=4, height=2.5, color=CHEM_ELECTRON, fill_opacity=0.05, stroke_width=2)
        container.move_to(DOWN * 1.2)

        self.play(FadeIn(container), run_time=0.5)

        # Different colored gas particles
        gas_a = VGroup()
        gas_b = VGroup()

        for _ in range(5):
            dot = Dot(
                container.get_center() + np.array([
                    np.random.uniform(-1.5, 1.5),
                    np.random.uniform(-0.8, 0.8),
                    0
                ]),
                radius=0.1, color=CHEM_ELECTRON
            )
            gas_a.add(dot)

        for _ in range(3):
            dot = Dot(
                container.get_center() + np.array([
                    np.random.uniform(-1.5, 1.5),
                    np.random.uniform(-0.8, 0.8),
                    0
                ]),
                radius=0.1, color=CHEM_REACTION
            )
            gas_b.add(dot)

        self.play(FadeIn(gas_a), FadeIn(gas_b), run_time=0.8)

        # Partial pressure bars
        bar_a = Rectangle(width=1.5, height=1.5 * 5/8, color=CHEM_ELECTRON, fill_opacity=0.5)
        bar_a_label = MathTex(r"P_A", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        bar_a_label.next_to(bar_a, DOWN, buff=0.1)

        bar_b = Rectangle(width=1.5, height=1.5 * 3/8, color=CHEM_REACTION, fill_opacity=0.5)
        bar_b_label = MathTex(r"P_B", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        bar_b_label.next_to(bar_b, DOWN, buff=0.1)

        bar_total = Rectangle(width=1.5, height=1.5, color=CHEM_PRODUCT, fill_opacity=0.3)
        bar_total_label = MathTex(r"P_{\text{tot}}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        bar_total_label.next_to(bar_total, DOWN, buff=0.1)

        bars = VGroup(
            VGroup(bar_a, bar_a_label),
            VGroup(bar_b, bar_b_label),
            Text("+", font_size=LABEL_FONT_SIZE, color=MUTED_COLOR),
            VGroup(bar_total, bar_total_label),
        ).arrange(RIGHT, buff=0.3).move_to(RIGHT * 3 + DOWN * 1.2)

        bar_a.move_to(np.array([bar_a.get_x(), bar_a_label.get_y() + 0.35 + 1.5 * 5/8 / 2, 0]))
        bar_b.move_to(np.array([bar_b.get_x(), bar_b_label.get_y() + 0.35 + 1.5 * 3/8 / 2, 0]))
        bar_total.move_to(np.array([bar_total.get_x(), bar_total_label.get_y() + 0.35 + 1.5 / 2, 0]))

        self.play(FadeIn(bars), run_time=1)

        insight = Text("Each gas exerts pressure independently in a mixture", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
