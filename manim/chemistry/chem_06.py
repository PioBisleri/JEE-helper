import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class GalvanicCell(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Galvanic Cell", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"E_{\text{cell}} = E_{\text{cathode}} - E_{\text{anode}}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Left beaker (anode - Zn)
        left_beaker = Rectangle(width=2, height=2, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=2)
        left_beaker.move_to(LEFT * 3 + DOWN * 1)
        left_solution = Rectangle(width=1.8, height=1.5, color=CHEM_ELECTRON, fill_opacity=0.15, stroke_width=0)
        left_solution.move_to(left_beaker.get_center() + DOWN * 0.2)
        left_electrode = Rectangle(width=0.2, height=2.2, color=CHEM_BOND, fill_opacity=0.5, stroke_width=1)
        left_electrode.move_to(LEFT * 3 + DOWN * 1)

        left_label = MathTex(r"\text{Zn}", font_size=LABEL_FONT_SIZE, color=CHEM_BOND)
        left_label.next_to(left_electrode, DOWN, buff=0.1)
        left_ion = MathTex(r"\text{Zn}^{2+}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        left_ion.move_to(left_solution.get_center())

        # Right beaker (cathode - Cu)
        right_beaker = Rectangle(width=2, height=2, color=CHEM_REACTION, fill_opacity=0.1, stroke_width=2)
        right_beaker.move_to(RIGHT * 3 + DOWN * 1)
        right_solution = Rectangle(width=1.8, height=1.5, color=CHEM_REACTION, fill_opacity=0.15, stroke_width=0)
        right_solution.move_to(right_beaker.get_center() + DOWN * 0.2)
        right_electrode = Rectangle(width=0.2, height=2.2, color=CHEM_PRODUCT, fill_opacity=0.5, stroke_width=1)
        right_electrode.move_to(RIGHT * 3 + DOWN * 1)

        right_label = MathTex(r"\text{Cu}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        right_label.next_to(right_electrode, DOWN, buff=0.1)
        right_ion = MathTex(r"\text{Cu}^{2+}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        right_ion.move_to(right_solution.get_center())

        # Salt bridge
        salt_bridge = Arc(radius=2.5, start_angle=np.pi * 0.15, angle=np.pi * 0.7, color=CHEM_MOLECULE, stroke_width=4)
        salt_bridge.move_to(ORIGIN + UP * 0.5)
        sb_label = Text("Salt Bridge", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
        sb_label.next_to(salt_bridge, UP, buff=0.1)

        # Wire
        wire = Line(
            left_electrode.get_top(),
            left_electrode.get_top() + UP * 0.8,
            color=MUTED_COLOR, stroke_width=2
        )
        wire2 = Line(
            right_electrode.get_top(),
            right_electrode.get_top() + UP * 0.8,
            color=MUTED_COLOR, stroke_width=2
        )
        wire_top = Line(
            left_electrode.get_top() + UP * 0.8,
            right_electrode.get_top() + UP * 0.8,
            color=MUTED_COLOR, stroke_width=2
        )

        # Voltmeter
        voltmeter = Circle(radius=0.3, color=CHEM_ENERGY, fill_opacity=0.2)
        voltmeter.move_to(ORIGIN + UP * 1.8)
        v_label = MathTex(r"V", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        v_label.move_to(voltmeter)

        # Electron flow arrows
        e_arrow = Arrow(
            LEFT * 1.5 + UP * 1.8,
            RIGHT * 1.5 + UP * 1.8,
            color=CHEM_ELECTRON, buff=0.3, stroke_width=2
        )
        e_label = Text("e\u207b flow", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        e_label.next_to(e_arrow, UP, buff=0.1)

        # Cell notation
        notation = MathTex(
            r"\text{Zn}|\text{Zn}^{2+}||\text{Cu}^{2+}|\text{Cu}",
            font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE
        )
        notation.to_edge(DOWN, buff=0.8)

        self.play(FadeIn(left_beaker), FadeIn(left_solution), FadeIn(left_electrode), Write(left_label), run_time=1)
        self.play(FadeIn(right_beaker), FadeIn(right_solution), FadeIn(right_electrode), Write(right_label), run_time=1)
        self.play(Write(left_ion), Write(right_ion), run_time=0.5)
        self.play(Create(salt_bridge), Write(sb_label), run_time=1)
        self.play(Create(wire), Create(wire2), Create(wire_top), run_time=0.5)
        self.play(FadeIn(voltmeter), Write(v_label), run_time=0.5)
        self.play(GrowArrow(e_arrow), Write(e_label), run_time=1)
        self.play(Write(notation), run_time=1)

        insight = Text("Electrons flow from anode (oxidation) to cathode (reduction)", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class NernstEquation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Nernst Equation", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"E = E^\circ - \frac{0.0592}{n}\log Q",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Axes for E vs log Q
        axes = Axes(
            x_range=[-4, 4, 1], y_range=[-1, 2, 0.5],
            x_length=7, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 1.2)

        x_label = axes.get_x_axis_label(r"\log Q").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label(r"E\,(\text{V})").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # E vs log Q line (negative slope)
        line = axes.plot(lambda x: 1.1 - 0.0592 / 2 * x, x_range=[-3.5, 3.5], color=CHEM_MOLECULE)
        line_label = MathTex(r"n=2, E^\circ = 1.1\,\text{V}", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
        line_label.next_to(line, UP, buff=0.2)

        self.play(Create(line), Write(line_label), run_time=1.5)

        # Standard state point
        std_point = Dot(axes.c2p(0, 1.1), radius=0.1, color=CHEM_REACTION)
        std_label = MathTex(r"E^\circ", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        std_label.next_to(std_point, RIGHT, buff=0.1)

        self.play(FadeIn(std_point), Write(std_label), run_time=0.8)

        # Equilibrium point (E = 0)
        eq_x = 1.1 / (0.0592 / 2)
        eq_point = Dot(axes.c2p(min(eq_x, 3.5), 0), radius=0.1, color=CHEM_PRODUCT)
        eq_label = Text("E = 0\nat equilibrium", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        eq_label.next_to(eq_point, DOWN, buff=0.2)

        self.play(FadeIn(eq_point), Write(eq_label), run_time=0.8)

        # Q values
        q_low = MathTex(r"Q < 1 \Rightarrow E > E^\circ", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        q_low.move_to(LEFT * 3 + UP * 0.3)

        q_high = MathTex(r"Q > 1 \Rightarrow E < E^\circ", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        q_high.move_to(RIGHT * 3 + UP * 0.3)

        self.play(Write(q_low), Write(q_high), run_time=0.8)

        insight = Text("Cell potential depends on ion concentrations via reaction quotient", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class Electrolysis(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Electrolysis", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"m = \frac{MIt}{nF}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Electrolytic cell
        cell = Rectangle(width=3, height=2.5, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=2)
        cell.move_to(DOWN * 1)

        solution = Rectangle(width=2.8, height=2, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=0)
        solution.move_to(cell.get_center() + DOWN * 0.2)

        # Electrodes
        anode = Rectangle(width=0.15, height=1.8, color=CHEM_REACTION, fill_opacity=0.5)
        anode.move_to(cell.get_left() + RIGHT * 0.3)
        cathode = Rectangle(width=0.15, height=1.8, color=CHEM_PRODUCT, fill_opacity=0.5)
        cathode.move_to(cell.get_right() + LEFT * 0.3)

        anode_label = Text("Anode (+)", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        anode_label.next_to(anode, DOWN, buff=0.1)
        cathode_label = Text("Cathode (-)", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        cathode_label.next_to(cathode, DOWN, buff=0.1)

        # Battery
        battery = Rectangle(width=1, height=0.5, color=CHEM_ENERGY, fill_opacity=0.3)
        battery.move_to(UP * 1.5)
        batt_label = Text("Battery", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY)
        batt_label.next_to(battery, UP, buff=0.1)

        # Wires
        wire_l = Line(anode.get_top(), battery.get_left(), color=MUTED_COLOR, stroke_width=2)
        wire_r = Line(cathode.get_top(), battery.get_right(), color=MUTED_COLOR, stroke_width=2)

        self.play(FadeIn(cell), FadeIn(solution), run_time=0.5)
        self.play(FadeIn(anode), FadeIn(cathode), Write(anode_label), Write(cathode_label), run_time=0.8)
        self.play(FadeIn(battery), Write(batt_label), run_time=0.5)
        self.play(Create(wire_l), Create(wire_r), run_time=0.5)

        # Ion movement
        # Cations to cathode
        cation = MathTex(r"\text{Cu}^{2+}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        cation.move_to(solution.get_center() + LEFT * 0.5)

        # Anions to anode
        anion = MathTex(r"\text{Cl}^-", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        anion.move_to(solution.get_center() + RIGHT * 0.5)

        self.play(FadeIn(cation), FadeIn(anion), run_time=0.5)

        # Animate ion movement
        self.play(
            cation.animate.move_to(cathode.get_center() + LEFT * 0.2),
            anion.animate.move_to(anode.get_center() + RIGHT * 0.2),
            run_time=2
        )

        # Faraday's law
        faraday = VGroup(
            MathTex(r"F = 96485\,\text{C/mol}", font_size=LABEL_FONT_SIZE, color=CHEM_BOND),
            MathTex(r"\text{1 mol e}^- = F\,\text{ coulombs}", font_size=LABEL_FONT_SIZE, color=CHEM_BOND),
        ).arrange(DOWN, buff=0.15).move_to(DOWN * 2.8)

        self.play(FadeIn(faraday), run_time=1)

        insight = Text("Electrical energy drives non-spontaneous reactions", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
