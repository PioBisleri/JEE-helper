import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class RaoultsLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Raoult's Law", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"P = P^\circ \cdot x_{\text{solvent}}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Axes
        axes = Axes(
            x_range=[0, 1, 0.2], y_range=[0, 100, 20],
            x_length=6, y_length=3,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 1)

        x_label = axes.get_x_axis_label(r"x_{\text{solute}}").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label(r"P\,(\text{mmHg})").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Solvent vapor pressure line
        solvent_line = axes.plot(lambda x: 80 * (1 - x), x_range=[0, 1], color=CHEM_MOLECULE, use_smoothing=False)
        solvent_label = MathTex(r"P_{\text{solvent}}", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
        solvent_label.next_to(solvent_line, UP, buff=0.1)

        # Solute vapor pressure (non-volatile = 0)
        zero_line = Line(axes.c2p(0, 0), axes.c2p(1, 0), color=CHEM_REACTION, stroke_width=2)

        self.play(Create(solvent_line), Write(solvent_label), run_time=1.5)
        self.play(Create(zero_line), run_time=0.5)

        # Highlight vapor pressure lowering
        vp_drop = DoubleArrow(
            axes.c2p(0.5, 80), axes.c2p(0.5, 40),
            color=CHEM_REACTION, buff=0.1, stroke_width=2
        )
        vp_label = MathTex(r"\Delta P", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        vp_label.next_to(vp_drop, RIGHT, buff=0.1)

        self.play(GrowArrow(vp_drop), Write(vp_label), run_time=0.8)

        # Colligative properties list
        props = VGroup(
            Text("Colligative Properties:", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY),
            MathTex(r"\Delta T_b = iK_bm", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"\Delta T_f = iK_fm", font_size=SMALL_FONT_SIZE, color=CHEM_BOND),
            MathTex(r"\Pi = iMRT", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).move_to(RIGHT * 3 + DOWN * 1)

        for p in props:
            self.play(Write(p), run_time=0.4)

        insight = Text("Vapor pressure lowering depends only on solute mole fraction", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class OsmoticPressure(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Osmotic Pressure", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Pi = iMRT",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # U-tube diagram
        # Left arm (pure solvent)
        left_arm = Rectangle(width=1.5, height=2.5, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=2)
        left_arm.move_to(LEFT * 2.5 + DOWN * 1)

        # Right arm (solution)
        right_arm = Rectangle(width=1.5, height=2.5, color=CHEM_REACTION, fill_opacity=0.1, stroke_width=2)
        right_arm.move_to(RIGHT * 2.5 + DOWN * 1)

        # Solvent level
        solvent_level = Rectangle(width=1.3, height=1.5, color=CHEM_ELECTRON, fill_opacity=0.2, stroke_width=0)
        solvent_level.move_to(left_arm.get_center() + DOWN * 0.5)

        # Solution level (lower due to osmosis)
        solution_level = Rectangle(width=1.3, height=1.2, color=CHEM_REACTION, fill_opacity=0.2, stroke_width=0)
        solution_level.move_to(right_arm.get_center() + DOWN * 0.65)

        # Semipermeable membrane
        membrane = DashedLine(
            LEFT * 1.75 + DOWN * 1, LEFT * 1.75 + UP * 0.5,
            color=CHEM_PRODUCT, stroke_width=3
        )
        mem_label = Text("SPM", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        mem_label.next_to(membrane, LEFT, buff=0.1)

        # Labels
        pure_label = Text("Pure\nSolvent", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        pure_label.move_to(left_arm.get_top() + UP * 0.3)
        sol_label = Text("Solution", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        sol_label.move_to(right_arm.get_top() + UP * 0.3)

        self.play(FadeIn(left_arm), FadeIn(right_arm), run_time=0.5)
        self.play(FadeIn(solvent_level), FadeIn(solution_level), run_time=0.5)
        self.play(Create(membrane), Write(mem_label), run_time=0.5)
        self.play(Write(pure_label), Write(sol_label), run_time=0.5)

        # Water flow arrow
        flow_arrow = Arrow(
            LEFT * 2 + DOWN * 0.5,
            RIGHT * 1.5 + DOWN * 0.5,
            color=CHEM_PRODUCT, buff=0.2, stroke_width=3
        )
        flow_label = Text("H\u2082O flows in", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        flow_label.next_to(flow_arrow, UP, buff=0.1)

        self.play(GrowArrow(flow_arrow), Write(flow_label), run_time=1)

        # Pi height
        pi_arrow = DoubleArrow(
            right_arm.get_right() + RIGHT * 0.3 + DOWN * 0.3,
            right_arm.get_right() + RIGHT * 0.3 + UP * 0.3,
            color=CHEM_ENERGY, buff=0.1, stroke_width=2
        )
        pi_label = MathTex(r"\Pi", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        pi_label.next_to(pi_arrow, RIGHT, buff=0.1)

        self.play(GrowArrow(pi_arrow), Write(pi_label), run_time=0.8)

        insight = Text("Osmotic pressure can determine molar mass of biomolecules", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class BoilingPointElevation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Boiling Point Elevation", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Delta T_b = i \cdot K_b \cdot m",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Axes
        axes = Axes(
            x_range=[0, 5, 1], y_range=[95, 105, 2],
            x_length=6, y_length=3,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 1)

        x_label = axes.get_x_axis_label(r"\text{molality}\,(m)").set_color(CHEM_BOND)
        y_label = axes.get_y_axis_label(r"T_b\,(°C)").set_color(CHEM_BOND)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Pure solvent boiling point
        pure_bp = DashedLine(axes.c2p(0, 100), axes.c2p(5, 100), color=CHEM_ELECTRON, stroke_width=1)
        pure_label = MathTex(r"100\,°C", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        pure_label.next_to(axes.c2p(0, 100), LEFT, buff=0.1)

        self.play(Create(pure_bp), Write(pure_label), run_time=0.5)

        # Elevated BP line
        elevated = axes.plot(lambda m: 100 + 0.512 * m, x_range=[0, 4.5], color=CHEM_REACTION, use_smoothing=False)
        self.play(Create(elevated), run_time=1.5)

        # Delta Tb arrow
        dt_arrow = DoubleArrow(
            axes.c2p(3, 100), axes.c2p(3, 100 + 0.512 * 3),
            color=CHEM_PRODUCT, buff=0.1, stroke_width=2
        )
        dt_label = MathTex(r"\Delta T_b", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        dt_label.next_to(dt_arrow, RIGHT, buff=0.1)

        self.play(GrowArrow(dt_arrow), Write(dt_label), run_time=0.8)

        # Explanation
        explain = VGroup(
            MathTex(r"i = \text{van't Hoff factor}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"K_b = \text{ebullioscopic constant}", font_size=SMALL_FONT_SIZE, color=CHEM_BOND),
            MathTex(r"m = \text{molality}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT).move_to(RIGHT * 3 + DOWN * 1)

        for e in explain:
            self.play(Write(e), run_time=0.4)

        insight = Text("Adding solute raises boiling point (colligative property)", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
