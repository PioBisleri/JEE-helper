import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class VSEPRGeometry(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("VSEPR Molecular Shapes", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{BP} + \text{LP} \rightarrow \text{Shape}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Linear (2 BP, 0 LP)
        center1 = LEFT * 4 + DOWN * 1
        atom1 = Circle(radius=0.25, color=CHEM_MOLECULE, fill_opacity=0.8).move_to(center1 + LEFT * 1)
        atom2 = Circle(radius=0.25, color=CHEM_MOLECULE, fill_opacity=0.8).move_to(center1 + RIGHT * 1)
        center_atom1 = Circle(radius=0.3, color=CHEM_BOND, fill_opacity=0.8).move_to(center1)
        bond1a = Line(atom1.get_right(), center_atom1.get_left(), color=CHEM_BOND, stroke_width=3)
        bond1b = Line(center_atom1.get_right(), atom2.get_left(), color=CHEM_BOND, stroke_width=3)
        linear_label = Text("Linear\n180°", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        linear_label.next_to(center1, DOWN, buff=0.5)
        linear = VGroup(atom1, atom2, center_atom1, bond1a, bond1b, linear_label)

        # Trigonal planar (3 BP, 0 LP)
        center2 = DOWN * 1
        c_atom2 = Circle(radius=0.3, color=CHEM_BOND, fill_opacity=0.8).move_to(center2)
        trig_atoms = VGroup()
        trig_bonds = VGroup()
        for i in range(3):
            angle = np.pi / 2 + i * 2 * np.pi / 3
            pos = center2 + 1 * np.array([np.cos(angle), np.sin(angle), 0])
            a = Circle(radius=0.25, color=CHEM_MOLECULE, fill_opacity=0.8).move_to(pos)
            b = Line(c_atom2.get_center(), a.get_center(), color=CHEM_BOND, stroke_width=3)
            trig_atoms.add(a)
            trig_bonds.add(b)
        trig_label = Text("Trigonal Planar\n120°", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        trig_label.next_to(center2, DOWN, buff=0.8)
        trigonal = VGroup(c_atom2, trig_atoms, trig_bonds, trig_label).move_to(ORIGIN + DOWN * 1)

        # Tetrahedral (4 BP, 0 LP)
        center3 = RIGHT * 4 + DOWN * 1
        c_atom3 = Circle(radius=0.3, color=CHEM_BOND, fill_opacity=0.8).move_to(center3)
        tet_positions = [
            UP * 0.8,
            LEFT * 0.7 + DOWN * 0.4,
            RIGHT * 0.7 + DOWN * 0.4,
            DOWN * 0.8 + RIGHT * 0.2,
        ]
        tet_atoms = VGroup()
        tet_bonds = VGroup()
        for pos in tet_positions:
            a = Circle(radius=0.25, color=CHEM_MOLECULE, fill_opacity=0.8).move_to(center3 + pos)
            b = Line(c_atom3.get_center(), a.get_center(), color=CHEM_BOND, stroke_width=3)
            tet_atoms.add(a)
            tet_bonds.add(b)
        tet_label = Text("Tetrahedral\n109.5°", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        tet_label.next_to(center3, DOWN, buff=0.8)
        tetrahedral = VGroup(c_atom3, tet_atoms, tet_bonds, tet_label)

        # Animate each shape
        self.play(FadeIn(linear, shift=LEFT * 0.5), run_time=1.5)
        self.wait(0.5)
        self.play(FadeIn(trigonal, shift=UP * 0.3), run_time=1.5)
        self.wait(0.5)
        self.play(FadeIn(tetrahedral, shift=RIGHT * 0.5), run_time=1.5)

        # Highlight bond angles
        angle_arc1 = Arc(radius=0.5, start_angle=0, angle=np.pi, color=CHEM_ENERGY, stroke_width=2)
        angle_arc1.move_arc_center_to(center1)
        angle_label1 = MathTex(r"180°", font_size=SMALL_FONT_SIZE, color=CHEM_ENERGY)
        angle_label1.next_to(angle_arc1, UP, buff=0.1)

        self.play(Create(angle_arc1), Write(angle_label1), run_time=0.8)

        insight = Text("Lone pairs compress bond angles from ideal values", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class MolecularOrbital(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Molecular Orbital Theory", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{Bond Order} = \frac{N_b - N_a}{2}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # MO energy level diagram
        # Left: atomic orbitals
        left_label = Text("A", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON)
        left_label.move_to(LEFT * 4 + UP * 2)
        self.play(Write(left_label), run_time=0.3)

        ao1 = Line(LEFT * 5 + UP * 0.5, LEFT * 3 + UP * 0.5, color=CHEM_ELECTRON, stroke_width=2)
        ao1_label = MathTex(r"2s", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        ao1_label.next_to(ao1, LEFT, buff=0.1)
        ao2 = Line(LEFT * 5 + DOWN * 1, LEFT * 3 + DOWN * 1, color=CHEM_ELECTRON, stroke_width=2)
        ao2_label = MathTex(r"2p", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON)
        ao2_label.next_to(ao2, LEFT, buff=0.1)

        # Right: atomic orbitals
        right_label = Text("B", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON)
        right_label.move_to(RIGHT * 4 + UP * 2)
        self.play(Write(right_label), run_time=0.3)

        ao3 = Line(RIGHT * 3 + UP * 0.5, RIGHT * 5 + UP * 0.5, color=CHEM_ELECTRON, stroke_width=2)
        ao4 = Line(RIGHT * 3 + DOWN * 1, RIGHT * 5 + DOWN * 1, color=CHEM_ELECTRON, stroke_width=2)

        # Center: molecular orbitals
        center_label = Text("AB", font_size=LABEL_FONT_SIZE, color=CHEM_BOND)
        center_label.move_to(UP * 2)

        # Bonding MO (lower energy)
        mo_sigma = Line(LEFT * 1.5 + DOWN * 2, RIGHT * 1.5 + DOWN * 2, color=CHEM_PRODUCT, stroke_width=3)
        mo_sigma_label = MathTex(r"\sigma_{2s}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        mo_sigma_label.next_to(mo_sigma, RIGHT, buff=0.1)

        # Anti-bonding MO (higher energy)
        mo_sigma_star = Line(LEFT * 1.5 + UP * 1, RIGHT * 1.5 + UP * 1, color=CHEM_REACTION, stroke_width=3)
        mo_sigma_star_label = MathTex(r"\sigma^*_{2s}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        mo_sigma_star_label.next_to(mo_sigma_star, RIGHT, buff=0.1)

        # p-orbital MOs
        mo_pi1 = Line(LEFT * 1.5 + DOWN * 0.3, RIGHT * 1.5 + DOWN * 0.3, color=CHEM_PRODUCT, stroke_width=2)
        mo_pi1_label = MathTex(r"\pi_{2p}", font_size=SMALL_FONT_SIZE, color=CHEM_PRODUCT)
        mo_pi1_label.next_to(mo_pi1, RIGHT, buff=0.1)

        mo_pi2 = Line(LEFT * 1.5 + DOWN * 0.6, RIGHT * 1.5 + DOWN * 0.6, color=CHEM_PRODUCT, stroke_width=2)

        mo_pi_star = Line(LEFT * 1.5 + UP * 0.3, RIGHT * 1.5 + UP * 0.3, color=CHEM_REACTION, stroke_width=2)
        mo_pi_star_label = MathTex(r"\pi^*_{2p}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION)
        mo_pi_star_label.next_to(mo_pi_star, RIGHT, buff=0.1)

        all_mos = VGroup(
            ao1, ao1_label, ao2, ao2_label,
            ao3, ao4,
            mo_sigma, mo_sigma_label, mo_sigma_star, mo_sigma_star_label,
            mo_pi1, mo_pi1_label, mo_pi2, mo_pi_star, mo_pi_star_label,
            left_label, right_label, center_label
        )

        self.play(FadeIn(all_mos), run_time=1.5)

        # Fill electrons
        e_dots = VGroup()
        electron_positions = [
            mo_sigma.get_center() + LEFT * 0.3,
            mo_sigma.get_center() + RIGHT * 0.3,
            mo_sigma_star.get_center() + LEFT * 0.3,
            mo_sigma_star.get_center() + RIGHT * 0.3,
        ]
        for pos in electron_positions:
            e = Dot(pos, radius=0.07, color=CHEM_ELECTRON)
            e_dots.add(e)

        self.play(FadeIn(e_dots, lag_ratio=0.1), run_time=1)

        # Bond order calculation
        bo = MathTex(
            r"\text{B.O.} = \frac{2 - 0}{2} = 1",
            font_size=FORMULA_FONT_SIZE, color=CHEM_PRODUCT
        )
        bo.to_edge(DOWN, buff=0.8)
        self.play(Write(bo), run_time=1)

        insight = Text("Bonding MOs stabilize, antibonding MOs destabilize", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DipoleMoment(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Bond Polarity & Dipole Moment", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\vec{\mu} = q \times \vec{d}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # HCl example
        h_atom = Circle(radius=0.3, color=CHEM_ELECTRON, fill_opacity=0.6)
        h_label = MathTex(r"H^{\delta+}", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON)
        h_label.next_to(h_atom, DOWN, buff=0.1)

        cl_atom = Circle(radius=0.45, color=CHEM_REACTION, fill_opacity=0.6)
        cl_label = MathTex(r"Cl^{\delta-}", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        cl_label.next_to(cl_atom, DOWN, buff=0.1)

        bond = Line(h_atom.get_right(), cl_atom.get_left(), color=CHEM_BOND, stroke_width=3)

        # Dipole arrow (pointing toward negative)
        dipole = Arrow(
            h_atom.get_center() + UP * 0.8,
            cl_atom.get_center() + UP * 0.8,
            color=CHEM_PRODUCT, buff=0, stroke_width=3
        )
        cross = Line(
            dipole.get_start() + UP * 0.15 + LEFT * 0.1,
            dipole.get_start() + DOWN * 0.15 + RIGHT * 0.1,
            color=CHEM_PRODUCT, stroke_width=2
        )

        dipole_label = MathTex(r"\mu = 1.08\,\text{D}", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        dipole_label.next_to(dipole, UP, buff=0.1)

        hcl_group = VGroup(h_atom, h_label, cl_atom, cl_label, bond, dipole, cross, dipole_label)
        hcl_group.move_to(LEFT * 2.5 + DOWN * 0.5)

        self.play(FadeIn(hcl_group), run_time=1.5)

        # CO2 - nonpolar despite polar bonds
        o_left = Circle(radius=0.35, color=CHEM_REACTION, fill_opacity=0.6)
        o_left_label = MathTex(r"O", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        o_left_label.next_to(o_left, DOWN, buff=0.1)

        c_center = Circle(radius=0.3, color=CHEM_MOLECULE, fill_opacity=0.6)
        c_label = MathTex(r"C", font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE)
        c_label.next_to(c_center, DOWN, buff=0.1)

        o_right = Circle(radius=0.35, color=CHEM_REACTION, fill_opacity=0.6)
        o_right_label = MathTex(r"O", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        o_right_label.next_to(o_right, DOWN, buff=0.1)

        bond_l = Line(o_left.get_right(), c_center.get_left(), color=CHEM_BOND, stroke_width=3)
        bond_r = Line(c_center.get_right(), o_left.get_left(), color=CHEM_BOND, stroke_width=3)

        dipole_l = Arrow(c_center.get_center() + UP * 0.7, o_left.get_center() + UP * 0.7, color=CHEM_PRODUCT, buff=0, stroke_width=2)
        dipole_r = Arrow(c_center.get_center() + UP * 0.7, o_right.get_center() + UP * 0.7, color=CHEM_PRODUCT, buff=0, stroke_width=2)

        # Cancellation X
        cancel = MathTex(r"\mu_{net} = 0", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        cancel.move_to(RIGHT * 2.5 + DOWN * 0.5)

        co2_group = VGroup(o_left, o_left_label, c_center, c_label, o_right, o_right_label, bond_l, bond_r, dipole_l, dipole_r)
        co2_group.move_to(RIGHT * 2.5 + DOWN * 0.5)

        self.play(FadeIn(co2_group), run_time=1.5)
        self.play(Write(cancel), run_time=0.8)

        # Electronegativity scale
        en_scale = VGroup()
        en_values = [("F", 4.0), ("O", 3.5), ("N", 3.0), ("C", 2.5), ("H", 2.1), ("Na", 0.9)]
        for i, (atom, en) in enumerate(en_values):
            dot = Dot(LEFT * 5 + RIGHT * i * 1.7 + DOWN * 2.5, radius=0.08, color=CHEM_BOND)
            label = MathTex(f"{atom}\,({en})", font_size=SMALL_FONT_SIZE, color=CHEM_BOND)
            label.next_to(dot, DOWN, buff=0.1)
            en_scale.add(VGroup(dot, label))

        en_line = Line(LEFT * 5 + DOWN * 2.5, LEFT * 5 + RIGHT * 8.5 + DOWN * 2.5, color=MUTED_COLOR, stroke_width=1)
        en_title = Text("Electronegativity", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
        en_title.next_to(en_line, UP, buff=0.1)

        self.play(Create(en_line), FadeIn(en_scale), Write(en_title), run_time=1.5)

        insight = Text("Greater EN difference = more polar bond", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
