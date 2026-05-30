import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class CrystalFieldSplitting(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Crystal Field Splitting", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\Delta_o = 10Dq",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Free ion energy level
        free_level = Line(LEFT * 5 + ORIGIN, LEFT * 3 + ORIGIN, color=CHEM_ELECTRON, stroke_width=3)
        free_label = Text("Free ion\n(degenerate)", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        free_label.next_to(free_level, LEFT, buff=0.1)

        self.play(Create(free_level), Write(free_label), run_time=0.8)

        # Splitting arrow
        split_arrow = Arrow(
            LEFT * 3.5 + ORIGIN,
            RIGHT * 1.5 + ORIGIN,
            color=CHEM_BOND, buff=0.2, stroke_width=2
        )
        split_label = Text("Octahedral\nfield", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
        split_label.next_to(split_arrow, UP, buff=0.1)

        self.play(GrowArrow(split_arrow), Write(split_label), run_time=0.8)

        # eg levels (higher energy)
        eg_levels = VGroup()
        for i in range(2):
            level = Line(RIGHT * 3 + UP * (i * 0.4 + 0.8), RIGHT * 5 + UP * (i * 0.4 + 0.8), color=CHEM_REACTION, stroke_width=3)
            eg_levels.add(level)
        eg_label = MathTex(r"e_g", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        eg_label.next_to(eg_levels, RIGHT, buff=0.2)

        # t2g levels (lower energy)
        t2g_levels = VGroup()
        for i in range(3):
            level = Line(RIGHT * 3 + DOWN * (i * 0.3 + 0.5), RIGHT * 5 + DOWN * (i * 0.3 + 0.5), color=CHEM_PRODUCT, stroke_width=3)
            t2g_levels.add(level)
        t2g_label = MathTex(r"t_{2g}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        t2g_label.next_to(t2g_levels, RIGHT, buff=0.2)

        self.play(Create(eg_levels), Write(eg_label), run_time=1)
        self.play(Create(t2g_levels), Write(t2g_label), run_time=1)

        # Delta o arrow
        delta_arrow = DoubleArrow(
            RIGHT * 2.5 + UP * 1.0,
            RIGHT * 2.5 + DOWN * 0.8,
            color=CHEM_ENERGY, buff=0.1, stroke_width=2
        )
        delta_label = MathTex(r"\Delta_o", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        delta_label.next_to(delta_arrow, LEFT, buff=0.1)

        self.play(GrowArrow(delta_arrow), Write(delta_label), run_time=0.8)

        # d-electrons filling for d6 (strong field)
        electrons_strong = VGroup()
        # t2g: 6 electrons (3 pairs)
        for i in range(3):
            e1 = Dot(t2g_levels[i].get_center() + LEFT * 0.3, radius=0.06, color=CHEM_ELECTRON)
            e2 = Dot(t2g_levels[i].get_center() + RIGHT * 0.3, radius=0.06, color=CHEM_ELECTRON)
            electrons_strong.add(e1, e2)

        sf_label = Text("Strong field\nd\u2076 (low spin)", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        sf_label.move_to(RIGHT * 4 + DOWN * 2.2)

        self.play(FadeIn(electrons_strong, lag_ratio=0.05), Write(sf_label), run_time=1)

        # Label for eg empty
        empty_label = MathTex(r"\text{empty}", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
        empty_label.next_to(eg_levels, LEFT, buff=0.3)

        self.play(Write(empty_label), run_time=0.5)

        insight = Text("Strong field ligands cause large splitting (low spin)", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class OctahedralGeometry(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Octahedral Complex", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"[ML_6]^{n+}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Central metal ion
        metal = Circle(radius=0.35, color=CHEM_BOND, fill_opacity=0.8)
        metal_label = MathTex(r"M", font_size=LABEL_FONT_SIZE, color=BG_COLOR)
        metal_group = VGroup(metal, metal_label).move_to(ORIGIN + DOWN * 0.5)

        self.play(FadeIn(metal_group), run_time=0.5)

        # 6 ligands in octahedral arrangement
        ligand_positions = [
            UP * 1.8,      # top
            DOWN * 1.8,    # bottom
            LEFT * 1.8,    # left
            RIGHT * 1.8,   # right
            UP * 1.2 + LEFT * 1.2,   # front-left
            DOWN * 1.2 + RIGHT * 1.2,  # back-right
        ]

        ligands = VGroup()
        bonds = VGroup()

        for pos in ligand_positions:
            ligand = Circle(radius=0.2, color=CHEM_MOLECULE, fill_opacity=0.7)
            ligand.move_to(metal_group.get_center() + pos)
            bond = Line(metal_group.get_center(), ligand.get_center(), color=CHEM_BOND, stroke_width=2)
            ligands.add(ligand)
            bonds.add(bond)

        l_label = MathTex(r"L", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
        l_label.next_to(ligands[0], UP, buff=0.1)

        self.play(Create(bonds), run_time=1)
        self.play(FadeIn(ligands), Write(l_label), run_time=1)

        # Bond angles
        angle_labels = VGroup(
            MathTex(r"90°", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY),
            MathTex(r"180°", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY),
        )
        angle_labels[0].move_to(UP * 0.8 + RIGHT * 0.8)
        angle_labels[1].move_to(UP * 2.5)

        self.play(Write(angle_labels[0]), Write(angle_labels[1]), run_time=0.5)

        # Coordination number
        cn = MathTex(r"\text{CN} = 6", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        cn.to_edge(DOWN, buff=1)
        self.play(Write(cn), run_time=0.5)

        # Common examples
        examples = VGroup(
            MathTex(r"[Fe(CN)_6]^{4-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"[Co(NH_3)_6]^{3+}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"[Cr(H_2O)_6]^{3+}", font_size=SMALL_FONT_SIZE, color=CHEM_BOND),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).to_edge(DOWN, buff=0.3)

        self.play(FadeIn(examples), run_time=0.8)

        insight = Text("Six ligands arrange octahedrally around the metal", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.next_to(examples, UP, buff=0.2)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class MagneticMoment(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Magnetic Moment", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\mu = \sqrt{n(n+2)}\,\text{BM}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # BM explanation
        bm = MathTex(
            r"\text{BM} = \text{Bohr Magneton}",
            font_size=LABEL_FONT_SIZE, color=CHEM_BOND
        )
        bm.move_to(ORIGIN + DOWN * 0.3)
        self.play(Write(bm), run_time=0.5)

        # Table of unpaired electrons
        table_data = [
            ["n", "\u03bc (BM)", "Type"],
            ["0", "0", "Diamagnetic"],
            ["1", "1.73", "Paramagnetic"],
            ["2", "2.83", "Paramagnetic"],
            ["3", "3.87", "Paramagnetic"],
            ["4", "4.90", "Paramagnetic"],
            ["5", "5.92", "Paramagnetic"],
        ]

        table = Table(
            table_data,
            include_outer_lines=True,
            line_config={"stroke_width": 1, "color": MUTED_COLOR},
        ).scale(0.5).move_to(LEFT * 3 + DOWN * 1)

        # Color coding
        for row in range(2, 7):
            table.get_cell((row, 2)).set_text_color(CHEM_REACTION)

        table.get_cell((1, 2)).set_text_color(CHEM_PRODUCT)

        self.play(Create(table), run_time=1.5)

        # Example calculation
        example = VGroup(
            MathTex(r"\text{Fe}^{3+}: [Ar]\,3d^5", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"n = 5", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
            MathTex(r"\mu = \sqrt{5(7)} = \sqrt{35} \approx 5.92\,\text{BM}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(RIGHT * 2.5 + DOWN * 1)

        for e in example:
            self.play(Write(e), run_time=0.6)

        # Orbital box diagram
        orbitals = VGroup()
        for i in range(5):
            box = Rectangle(width=0.5, height=0.6, color=CHEM_ELECTRON, fill_opacity=0.1, stroke_width=1.5)
            orbitals.add(box)
        orbitals.arrange(RIGHT, buff=0.1).move_to(RIGHT * 2.5 + DOWN * 2.5)

        # Fill with 5 unpaired electrons
        electrons = VGroup()
        for box in orbitals:
            e = Arrow(
                box.get_bottom() + UP * 0.1,
                box.get_top() + DOWN * 0.1,
                color=CHEM_ELECTRON, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.3
            )
            electrons.add(e)

        orbital_label = Text("3d orbitals (high spin)", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        orbital_label.next_to(orbitals, DOWN, buff=0.1)

        self.play(Create(orbitals), run_time=0.5)
        self.play(LaggedStart(*[GrowArrow(e) for e in electrons], lag_ratio=0.15), run_time=1.5)
        self.play(Write(orbital_label), run_time=0.5)

        insight = Text("Paramagnetic substances have unpaired electrons", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
