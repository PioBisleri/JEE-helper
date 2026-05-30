import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class LeChatelierPrinciple(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Le Chatelier's Principle", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{N}_2 + 3\text{H}_2 \rightleftharpoons 2\text{NH}_3",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Equilibrium arrows
        eq_arrows = VGroup(
            Arrow(LEFT * 1.5, RIGHT * 0.5, color=CHEM_PRODUCT, buff=0, stroke_width=3),
            Arrow(RIGHT * 1.5, LEFT * 0.5, color=CHEM_REACTION, buff=0, stroke_width=3),
        ).move_to(DOWN * 1)

        self.play(GrowArrow(eq_arrows[0]), GrowArrow(eq_arrows[1]), run_time=0.8)

        # Molecule representation
        n2 = VGroup(
            Circle(radius=0.2, color=CHEM_ELECTRON, fill_opacity=0.7),
            Circle(radius=0.2, color=CHEM_ELECTRON, fill_opacity=0.7).shift(RIGHT * 0.35),
        )
        n2_label = MathTex(r"\text{N}_2", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        n2_group = VGroup(n2, n2_label).move_to(LEFT * 3 + DOWN * 2)

        h2_1 = VGroup(
            Circle(radius=0.15, color=CHEM_BOND, fill_opacity=0.7),
            Circle(radius=0.15, color=CHEM_BOND, fill_opacity=0.7).shift(RIGHT * 0.25),
        )
        h2_2 = h2_1.copy()
        h2_3 = h2_1.copy()
        h2_label = MathTex(r"3\text{H}_2", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
        h2_group = VGroup(h2_1, h2_2, h2_3, h2_label).arrange(DOWN, buff=0.2).move_to(LEFT * 1 + DOWN * 2)

        nh3_1 = VGroup(
            Circle(radius=0.2, color=CHEM_ELECTRON, fill_opacity=0.7),
            Circle(radius=0.12, color=CHEM_BOND, fill_opacity=0.7).shift(UP * 0.3),
            Circle(radius=0.12, color=CHEM_BOND, fill_opacity=0.7).shift(DOWN * 0.3 + LEFT * 0.2),
            Circle(radius=0.12, color=CHEM_BOND, fill_opacity=0.7).shift(DOWN * 0.3 + RIGHT * 0.2),
        )
        nh3_2 = nh3_1.copy()
        nh3_label = MathTex(r"2\text{NH}_3", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        nh3_group = VGroup(nh3_1, nh3_2, nh3_label).arrange(DOWN, buff=0.2).move_to(RIGHT * 2.5 + DOWN * 2)

        self.play(FadeIn(n2_group), FadeIn(h2_group), FadeIn(nh3_group), run_time=1)

        # Perturbation 1: Add N2
        perturb1 = Text("Add N\u2082", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        perturb1.move_to(LEFT * 3 + DOWN * 3.2)
        self.play(Write(perturb1), run_time=0.5)

        # Shift right
        shift_arrow = Arrow(LEFT * 0.5, RIGHT * 2, color=CHEM_PRODUCT, buff=0, stroke_width=4)
        shift_label = Text("Shift Right", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        shift_label.next_to(shift_arrow, UP, buff=0.1)
        self.play(GrowArrow(shift_arrow), Write(shift_label), run_time=1)
        self.wait(0.5)

        self.play(
            FadeOut(perturb1), FadeOut(shift_arrow), FadeOut(shift_label),
            run_time=0.5
        )

        # Perturbation 2: Increase temperature (exothermic)
        perturb2 = Text("Increase T", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        perturb2.move_to(LEFT * 3 + DOWN * 3.2)
        temp_note = MathTex(r"\text{(exothermic rxn)}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        temp_note.next_to(perturb2, DOWN, buff=0.1)

        self.play(Write(perturb2), Write(temp_note), run_time=0.5)

        shift_left = Arrow(RIGHT * 0.5, LEFT * 2, color=CHEM_REACTION, buff=0, stroke_width=4)
        shift_left_label = Text("Shift Left", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        shift_left_label.next_to(shift_left, UP, buff=0.1)
        self.play(GrowArrow(shift_left), Write(shift_left_label), run_time=1)

        insight = Text("System shifts to counteract imposed changes", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class PHCurve(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Acid-Base Titration Curve", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{HCl} + \text{NaOH} \rightarrow \text{NaCl} + \text{H}_2\text{O}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Axes
        axes = Axes(
            x_range=[0, 40, 5], y_range=[0, 14, 2],
            x_length=7, y_length=4,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("Volume NaOH (mL)").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label("pH").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Titration curve - strong acid strong base
        def titration_curve(x):
            V = x * 40 / 7
            if V < 20:
                return 1 + 0.5 * V / 20
            elif V < 20.5:
                return 2 + 10 * (V - 20) / 0.5
            else:
                return 12 - 2 * np.exp(-0.2 * (V - 20.5))

        curve = axes.plot(titration_curve, x_range=[0.1, 7], color=CHEM_MOLECULE, use_smoothing=True)
        self.play(Create(curve), run_time=ANIMATION_DURATION * 0.8)

        # Equivalence point
        eq_point = Dot(axes.c2p(3.5, 7), radius=0.1, color=CHEM_REACTION)
        eq_label = Text("Equivalence Point\npH = 7", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        eq_label.next_to(eq_point, RIGHT, buff=0.2)

        # Half-equivalence
        half_eq = Dot(axes.c2p(1.75, 2.5), radius=0.1, color=CHEM_ENERGY)
        half_label = Text("Half-eq point", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY)
        half_label.next_to(half_eq, LEFT, buff=0.2)

        # Buffer region
        buffer_rect = Rectangle(
            width=2.5, height=0.8, color=CHEM_BOND, fill_opacity=0.1, stroke_width=1
        ).move_to(axes.c2p(1.5, 2))
        buffer_label = Text("Buffer\nRegion", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
        buffer_label.next_to(buffer_rect, DOWN, buff=0.1)

        self.play(FadeIn(eq_point), Write(eq_label), run_time=1)
        self.play(FadeIn(half_eq), Write(half_label), run_time=0.8)
        self.play(FadeIn(buffer_rect), Write(buffer_label), run_time=0.8)

        # Moving dot on curve
        dot = Dot(color=CHEM_MOLECULE, radius=0.08)
        vol_tracker = ValueTracker(0.1)

        def update_dot(d):
            v = vol_tracker.get_value()
            x = v * 7 / 40
            y = titration_curve(x + 0.1)
            d.move_to(axes.c2p(x, y))

        dot.add_updater(update_dot)
        self.add(dot)
        self.play(vol_tracker.animate.set_value(39), run_time=ANIMATION_DURATION * 0.6, rate_func=linear)
        dot.remove_updater(update_dot)

        insight = Text("pH changes slowly near equivalence point", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class EquilibriumConstant(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Equilibrium Constants", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"K_p = K_c(RT)^{\Delta n}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Reaction
        reaction = MathTex(
            r"aA + bB \rightleftharpoons cC + dD",
            font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE
        )
        reaction.move_to(LEFT * 3 + UP * 0.5)
        self.play(Write(reaction), run_time=0.5)

        # Kc expression
        kc = MathTex(
            r"K_c = \frac{[C]^c[D]^d}{[A]^a[B]^b}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_BOND
        )
        kc.move_to(LEFT * 3 + DOWN * 0.5)
        self.play(Write(kc), run_time=1)

        # Kp expression
        kp = MathTex(
            r"K_p = \frac{P_C^c \cdot P_D^d}{P_A^a \cdot P_B^b}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_PRODUCT
        )
        kp.move_to(RIGHT * 3 + DOWN * 0.5)
        self.play(Write(kp), run_time=1)

        # Relationship arrow
        rel_arrow = Arrow(kc.get_right(), kp.get_left(), color=CHEM_ENERGY, buff=0.2, stroke_width=2)
        rel_label = MathTex(r"(RT)^{\Delta n}", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        rel_label.next_to(rel_arrow, UP, buff=0.1)

        self.play(GrowArrow(rel_arrow), Write(rel_label), run_time=0.8)

        # Delta n explanation
        dn = MathTex(
            r"\Delta n = (c+d) - (a+b)",
            font_size=LABEL_FONT_SIZE, color=CHEM_REACTION
        )
        dn.move_to(ORIGIN + DOWN * 1.5)
        self.play(Write(dn), run_time=0.8)

        # Example
        example = VGroup(
            MathTex(r"\text{N}_2 + 3\text{H}_2 \rightleftharpoons 2\text{NH}_3", font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE),
            MathTex(r"\Delta n = 2 - 4 = -2", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"K_p = K_c(RT)^{-2}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.2).move_to(DOWN * 2.5)

        for e in example:
            self.play(Write(e), run_time=0.6)

        insight = Text("Kp uses partial pressures, Kc uses concentrations", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
