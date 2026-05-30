import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class PeriodicTrends(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Periodic Trends", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{Effective Nuclear Charge: } Z_{\text{eff}} = Z - S",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Simplified periodic table grid
        grid = VGroup()
        elements = [
            ("H", 1, 1), ("He", 1, 18),
            ("Li", 2, 1), ("Be", 2, 2), ("B", 2, 13), ("C", 2, 14), ("N", 2, 15), ("O", 2, 16), ("F", 2, 17), ("Ne", 2, 18),
            ("Na", 3, 1), ("Mg", 3, 2), ("Al", 3, 13), ("Si", 3, 14), ("P", 3, 15), ("S", 3, 16), ("Cl", 3, 17), ("Ar", 3, 18),
        ]

        for sym, row, col in elements:
            cell = Rectangle(width=0.7, height=0.55, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=1)
            cell.move_to(LEFT * 4.5 + RIGHT * (col - 1) * 0.75 + DOWN * (row - 2) * 0.6)
            label = Text(sym, font_size=14, color=CHEM_ELECTRON)
            label.move_to(cell)
            grid.add(VGroup(cell, label))

        self.play(FadeIn(grid, lag_ratio=0.02), run_time=1.5)

        # Arrow across period - increasing Zeff
        period_arrow = Arrow(
            LEFT * 4 + DOWN * 1.2, RIGHT * 3.5 + DOWN * 1.2,
            color=CHEM_REACTION, buff=0, stroke_width=3
        )
        period_label = Text("Z_eff increases \u2192", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        period_label.next_to(period_arrow, DOWN, buff=0.1)
        self.play(GrowArrow(period_arrow), Write(period_label), run_time=1)

        # Arrow down group - increasing size
        group_arrow = Arrow(
            LEFT * 4.5 + UP * 0.3, LEFT * 4.5 + DOWN * 2,
            color=CHEM_PRODUCT, buff=0, stroke_width=3
        )
        group_label = Text("Size \u2193", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        group_label.next_to(group_arrow, LEFT, buff=0.1)
        self.play(GrowArrow(group_arrow), Write(group_label), run_time=1)

        # Summary
        trends = VGroup(
            VGroup(Text("Atomic Radius", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
                   Text("\u2190 Increases across period", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)).arrange(DOWN, buff=0.05, aligned_edge=LEFT),
            VGroup(Text("Ionization Energy", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
                   Text("\u2192 Increases across period", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)).arrange(DOWN, buff=0.05, aligned_edge=LEFT),
            VGroup(Text("Electronegativity", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
                   Text("\u2192 Increases across period", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)).arrange(DOWN, buff=0.05, aligned_edge=LEFT),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(RIGHT * 2 + DOWN * 2)

        for t in trends:
            self.play(FadeIn(t, shift=UP * 0.2), run_time=0.6)

        insight = Text("Z_eff and shielding determine periodic trends", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class IonizationEnergy(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Ionization Energy", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"X(g) \rightarrow X^+(g) + e^-",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Atom with electron
        nucleus = Circle(radius=0.2, color=CHEM_REACTION, fill_opacity=0.8)
        nucleus_label = MathTex(r"+", font_size=LABEL_FONT_SIZE, color=BG_COLOR)
        nucleus_group = VGroup(nucleus, nucleus_label).move_to(LEFT * 3 + DOWN * 0.5)

        orbit = Circle(radius=0.8, color=CHEM_ELECTRON, stroke_opacity=0.4)
        orbit.move_to(nucleus_group)
        electron = Dot(LEFT * 3 + DOWN * 0.5 + UP * 0.8, radius=0.08, color=CHEM_ELECTRON)

        self.play(FadeIn(nucleus_group), Create(orbit), FadeIn(electron), run_time=0.8)

        # Energy input
        energy_arrow = Arrow(LEFT * 4.5 + DOWN * 0.5, LEFT * 3.5 + DOWN * 0.5, color=CHEM_BOND, buff=0, stroke_width=3)
        energy_label = MathTex(r"h\nu", font_size=LABEL_FONT_SIZE, color=CHEM_BOND)
        energy_label.next_to(energy_arrow, DOWN, buff=0.1)
        self.play(GrowArrow(energy_arrow), Write(energy_label), run_time=0.8)

        # Electron escapes
        escape_arrow = Arrow(LEFT * 3 + DOWN * 0.5 + UP * 0.8, RIGHT * 1 + UP * 1.5, color=CHEM_ELECTRON, buff=0, stroke_width=2)
        self.play(electron.animate.move_to(RIGHT * 1 + UP * 1.5), GrowArrow(escape_arrow), run_time=1.5)

        # Ion formed
        ion_label = MathTex(r"X^+", font_size=FORMULA_FONT_SIZE, color=CHEM_REACTION)
        ion_label.next_to(nucleus_group, DOWN, buff=0.5)
        self.play(Write(ion_label), run_time=0.5)

        # IE values
        ie_data = VGroup(
            MathTex(r"\text{Li}: 520\,\text{kJ/mol}", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"\text{Na}: 496\,\text{kJ/mol}", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"\text{K}: 419\,\text{kJ/mol}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).move_to(RIGHT * 2 + DOWN * 1)
        self.play(FadeIn(ie_data), run_time=1)

        insight = Text("IE decreases down a group (easier to remove outer electrons)", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ElectronAffinity(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Electron Affinity", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"X(g) + e^- \rightarrow X^-(g)",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Energy levels
        axes = Axes(
            x_range=[0, 10, 2], y_range=[-5, 5, 1],
            x_length=6, y_length=3,
            axis_config={"stroke_width": 0}, tips=False,
        ).move_to(DOWN * 1)

        neutral = Line(axes.c2p(1, 0), axes.c2p(4, 0), color=CHEM_ELECTRON, stroke_width=3)
        neutral_label = Text("X(g)", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        neutral_label.next_to(neutral, LEFT, buff=0.2)

        anion = Line(axes.c2p(6, -3), axes.c2p(9, -3), color=CHEM_PRODUCT, stroke_width=3)
        anion_label = Text("X\u207b(g)", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        anion_label.next_to(anion, LEFT, buff=0.2)

        self.play(Create(neutral), Write(neutral_label), run_time=0.8)
        self.play(Create(anion), Write(anion_label), run_time=0.8)

        ea_arrow = Arrow(axes.c2p(5, 0) + DOWN * 0.2, axes.c2p(5, -3) + UP * 0.2, color=CHEM_REACTION, buff=0.1, stroke_width=3)
        ea_label = MathTex(r"\Delta H = -EA", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        ea_label.next_to(ea_arrow, RIGHT, buff=0.1)
        self.play(GrowArrow(ea_arrow), Write(ea_label), run_time=1)

        incoming_e = Dot(LEFT * 5 + DOWN * 1, radius=0.08, color=CHEM_ELECTRON)
        self.play(FadeIn(incoming_e), run_time=0.3)
        self.play(incoming_e.animate.move_to(axes.c2p(5, -3)), run_time=1.5)

        trends = VGroup(
            MathTex(r"\text{Cl}: -349\,\text{kJ/mol}", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"\text{F}: -328\,\text{kJ/mol}", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"\text{N}: \text{positive (unfavorable)}", font_size=LABEL_FONT_SIZE, color=CHEM_BOND),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(trends), run_time=1)

        insight = Text("Halogens have most negative EA (most favorable)", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.next_to(trends, UP, buff=0.2)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
