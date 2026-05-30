import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class HessLawCycle(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Hess's Law", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Delta H_{\text{rxn}} = \sum \Delta H_{\text{steps}}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Energy cycle: A -> B -> C and A -> C directly
        # Nodes
        a_pos = LEFT * 3 + UP * 0.5
        b_pos = UP * 0.5
        c_pos = RIGHT * 3 + UP * 0.5

        node_a = VGroup(
            Rectangle(width=1.5, height=0.7, color=CHEM_MOLECULE, fill_opacity=0.2),
            MathTex(r"\text{C(s)} + \text{O}_2\text{(g)}", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
        ).move_to(a_pos)

        node_b = VGroup(
            Rectangle(width=1.5, height=0.7, color=CHEM_BOND, fill_opacity=0.2),
            MathTex(r"\text{CO(g)} + \frac{1}{2}\text{O}_2", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
        ).move_to(b_pos)

        node_c = VGroup(
            Rectangle(width=1.5, height=0.7, color=CHEM_PRODUCT, fill_opacity=0.2),
            MathTex(r"\text{CO}_2\text{(g)}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        ).move_to(c_pos)

        self.play(FadeIn(node_a), FadeIn(node_b), FadeIn(node_c), run_time=1)

        # Step 1: A -> B
        arrow1 = Arrow(node_a.get_right(), node_b.get_left(), color=CHEM_REACTION, buff=0.1, stroke_width=2)
        dh1 = MathTex(r"\Delta H_1 = -110.5\,\text{kJ}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        dh1.next_to(arrow1, UP, buff=0.1)

        # Step 2: B -> C
        arrow2 = Arrow(node_b.get_right(), node_c.get_left(), color=CHEM_REACTION, buff=0.1, stroke_width=2)
        dh2 = MathTex(r"\Delta H_2 = -283.0\,\text{kJ}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        dh2.next_to(arrow2, UP, buff=0.1)

        # Direct: A -> C
        arrow3 = Arrow(
            node_a.get_bottom() + DOWN * 0.3,
            node_c.get_bottom() + DOWN * 0.3,
            color=CHEM_PRODUCT, buff=0.1, stroke_width=3
        )
        dh3 = MathTex(r"\Delta H_3 = -393.5\,\text{kJ}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        dh3.next_to(arrow3, DOWN, buff=0.1)

        self.play(GrowArrow(arrow1), Write(dh1), run_time=1)
        self.play(GrowArrow(arrow2), Write(dh2), run_time=1)
        self.play(GrowArrow(arrow3), Write(dh3), run_time=1)

        # Show sum
        sum_eq = MathTex(
            r"\Delta H_3 = \Delta H_1 + \Delta H_2",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        sum_eq.to_edge(DOWN, buff=0.8)
        self.play(Write(sum_eq), run_time=1)

        sum_calc = MathTex(
            r"-393.5 = -110.5 + (-283.0)",
            font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT
        )
        sum_calc.next_to(sum_eq, DOWN, buff=0.2)
        self.play(Write(sum_calc), run_time=1)

        insight = Text("Enthalpy change is path-independent", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class EnthalpyLevels(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Enthalpy Level Diagram", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Delta H = H_{\text{products}} - H_{\text{reactants}}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Energy axis
        energy_axis = Arrow(DOWN * 2.5 + LEFT * 4, UP * 1.5 + LEFT * 4, color=MUTED_COLOR, stroke_width=2)
        energy_label = MathTex(r"H\,(\text{energy})", font_size=LABEL_FONT_SIZE, color=MUTED_COLOR)
        energy_label.next_to(energy_axis, LEFT, buff=0.2).rotate(np.pi / 2)

        self.play(Create(energy_axis), Write(energy_label), run_time=0.8)

        # Reactant level
        reactant_level = Line(LEFT * 2 + UP * 0.5, RIGHT * 1 + UP * 0.5, color=CHEM_REACTION, stroke_width=3)
        reactant_label = Text("Reactants", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        reactant_label.next_to(reactant_level, RIGHT, buff=0.2)

        # Product level
        product_level = Line(LEFT * 2 + DOWN * 1.5, RIGHT * 1 + DOWN * 1.5, color=CHEM_PRODUCT, stroke_width=3)
        product_label = Text("Products", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        product_label.next_to(product_level, RIGHT, buff=0.2)

        self.play(Create(reactant_level), Write(reactant_label), run_time=0.8)
        self.play(Create(product_level), Write(product_label), run_time=0.8)

        # Delta H arrow
        dh_arrow = Arrow(
            reactant_level.get_center() + RIGHT * 1.5 + UP * 0.1,
            product_level.get_center() + RIGHT * 1.5 + DOWN * 0.1,
            color=CHEM_ENERGY, buff=0.1, stroke_width=3
        )
        dh_label = MathTex(r"\Delta H < 0", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        dh_label.next_to(dh_arrow, RIGHT, buff=0.1)

        self.play(GrowArrow(dh_arrow), Write(dh_label), run_time=1)

        # Reaction coordinate curve
        rxn_axes = Axes(
            x_range=[0, 10, 2], y_range=[-3, 3, 1],
            x_length=6, y_length=4,
            axis_config={"stroke_width": 0}
        )
        rxn_coord = rxn_axes.plot(
            lambda x: 2.0 * np.exp(-0.3 * (x - 3)**2) - 1,
            color=CHEM_BOND, stroke_width=2
        ).move_to(RIGHT * 2 + DOWN * 0.5)

        # Transition state
        ts_dot = Dot(rxn_coord.get_top(), radius=0.08, color=CHEM_REACTION)
        ts_label = Text("Transition State", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        ts_label.next_to(ts_dot, UP, buff=0.1)

        activation = MathTex(r"E_a", font_size=LABEL_FONT_SIZE, color=CHEM_BOND)
        activation.next_to(ts_dot, LEFT, buff=0.3)

        self.play(Create(rxn_coord), run_time=1.5)
        self.play(FadeIn(ts_dot), Write(ts_label), Write(activation), run_time=0.8)

        insight = Text("Exothermic reactions release energy (downhill)", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class GibbsEnergy(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Gibbs Free Energy", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Delta G = \Delta H - T\Delta S",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Decision table
        table_data = [
            ["\u0394H", "\u0394S", "\u0394G", "Spontaneous?"],
            ["-", "+", "-", "Always"],
            ["+", "-", "+", "Never"],
            ["-", "-", "?", "At low T"],
            ["+", "+", "?", "At high T"],
        ]

        table = Table(
            table_data,
            include_outer_lines=True,
            line_config={"stroke_width": 1, "color": MUTED_COLOR},
        ).scale(0.55).move_to(LEFT * 2.5 + DOWN * 0.5)

        table.get_cell((0, 0)).set_fill(CHEM_ELECTRON, 0.3)
        table.get_cell((0, 1)).set_fill(CHEM_ELECTRON, 0.3)
        table.get_cell((0, 2)).set_fill(CHEM_ELECTRON, 0.3)
        table.get_cell((0, 3)).set_fill(CHEM_ELECTRON, 0.3)

        for row in range(1, 5):
            table.get_cell((row, 3)).set_text_color(CHEM_PRODUCT if row <= 2 else CHEM_ENERGY)

        self.play(Create(table), run_time=2)

        # Spontaneity criterion box
        criterion = VGroup(
            MathTex(r"\Delta G < 0 \Rightarrow \text{spontaneous}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT),
            MathTex(r"\Delta G = 0 \Rightarrow \text{equilibrium}", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY),
            MathTex(r"\Delta G > 0 \Rightarrow \text{non-spontaneous}", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(RIGHT * 2.5 + DOWN * 0.5)

        for c in criterion:
            self.play(Write(c), run_time=0.6)

        # Temperature dependence
        temp_eq = MathTex(
            r"T_{\text{eq}} = \frac{\Delta H}{\Delta S}",
            font_size=LABEL_FONT_SIZE, color=CHEM_BOND
        )
        temp_eq.to_edge(DOWN, buff=0.8)
        self.play(Write(temp_eq), run_time=0.8)

        insight = Text("Spontaneity depends on both enthalpy and entropy", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
