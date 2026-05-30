import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class OrganicFunctionalGroups(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Organic Functional Groups", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{R-X determines chemical properties}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Functional group cards
        groups = VGroup()
        fg_data = [
            ("-OH", "Alcohol", CHEM_REACTION),
            ("-COOH", "Carboxylic Acid", CHEM_ELECTRON),
            ("-NH\u2082", "Amine", CHEM_PRODUCT),
            ("C=C", "Alkene", CHEM_BOND),
            ("-CHO", "Aldehyde", CHEM_ENERGY),
        ]

        for i, (fg, name, color) in enumerate(fg_data):
            card = Rectangle(width=2.2, height=1.2, color=color, fill_opacity=0.1, stroke_width=2)
            fg_text = MathTex(fg, font_size=FORMULA_FONT_SIZE, color=color)
            name_text = Text(name, font_size=SMALL_FONT_SIZE, color=color)
            card_group = VGroup(card, fg_text, name_text)
            fg_text.move_to(card.get_center() + UP * 0.2)
            name_text.next_to(fg_text, DOWN, buff=0.1)
            groups.add(card_group)

        groups.arrange(RIGHT, buff=0.2).move_to(ORIGIN + DOWN * 0.3)

        for g in groups:
            self.play(FadeIn(g, shift=UP * 0.3), run_time=0.6)

        # Highlight with reactions
        self.play(groups[0].animate.scale(1.2).set_color(CHEM_REACTION), run_time=0.5)
        self.play(groups[0].animate.scale(1 / 1.2), run_time=0.3)

        # Carbon backbone
        backbone = VGroup()
        for i in range(5):
            c = Circle(radius=0.15, color=CHEM_MOLECULE, fill_opacity=0.8)
            if i < 4:
                bond = Line(RIGHT * 0.3, RIGHT * 0.7, color=CHEM_BOND, stroke_width=2)
            else:
                bond = VMobject()
            backbone.add(VGroup(c, bond))
        backbone.arrange(RIGHT, buff=0).move_to(DOWN * 2)

        c_label = Text("C-C backbone", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE)
        c_label.next_to(backbone, DOWN, buff=0.1)

        self.play(FadeIn(backbone), Write(c_label), run_time=1)

        insight = Text("Functional groups define organic molecule reactivity", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class IUPACNomenclature(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("IUPAC Nomenclature", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{Prefix} + \text{Root} + \text{Suffix}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Naming components
        components = VGroup(
            VGroup(
                Rectangle(width=2, height=0.6, color=CHEM_REACTION, fill_opacity=0.15),
                Text("Prefix", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION),
                Text("(substituents)", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR),
            ).arrange(DOWN, buff=0.05),
            MathTex("+", font_size=TITLE_FONT_SIZE, color=MUTED_COLOR),
            VGroup(
                Rectangle(width=2, height=0.6, color=CHEM_ELECTRON, fill_opacity=0.15),
                Text("Root", font_size=LABEL_FONT_SIZE, color=CHEM_ELECTRON),
                Text("(carbon chain)", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR),
            ).arrange(DOWN, buff=0.05),
            MathTex("+", font_size=TITLE_FONT_SIZE, color=MUTED_COLOR),
            VGroup(
                Rectangle(width=2, height=0.6, color=CHEM_PRODUCT, fill_opacity=0.15),
                Text("Suffix", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT),
                Text("(functional group)", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR),
            ).arrange(DOWN, buff=0.05),
        ).arrange(RIGHT, buff=0.3).move_to(ORIGIN + DOWN * 0.5)

        self.play(FadeIn(components), run_time=1.5)

        # Carbon chain prefixes
        prefixes = VGroup(
            MathTex(r"1: \text{meth-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"2: \text{eth-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"3: \text{prop-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"4: \text{but-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"5: \text{pent-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
            MathTex(r"6: \text{hex-}", font_size=SMALL_FONT_SIZE, color=CHEM_ELECTRON),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT).move_to(LEFT * 4 + DOWN * 2)

        self.play(FadeIn(prefixes), run_time=1)

        # Example naming
        example = VGroup(
            MathTex(r"\text{CH}_3\text{-CH}_2\text{-CH}_2\text{-OH}", font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE),
            MathTex(r"\text{propan-1-ol}", font_size=FORMULA_FONT_SIZE, color=CHEM_PRODUCT),
        ).arrange(DOWN, buff=0.2).move_to(RIGHT * 3 + DOWN * 2)

        self.play(FadeIn(example), run_time=1)

        insight = Text("Systematic naming ensures unambiguous identification", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class Isomerism(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Structural Isomerism", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(
            r"\text{Same formula, different structure}",
            font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY
        )
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # C4H10 isomers
        formula_label = MathTex(r"\text{C}_4\text{H}_{10}", font_size=FORMULA_FONT_SIZE, color=CHEM_BOND)
        formula_label.move_to(ORIGIN + UP * 0.5)
        self.play(Write(formula_label), run_time=0.5)

        # Butane (straight chain)
        butane = VGroup()
        positions = [LEFT * 1.5, LEFT * 0.5, RIGHT * 0.5, RIGHT * 1.5]
        for i, pos in enumerate(positions):
            c = Circle(radius=0.15, color=CHEM_MOLECULE, fill_opacity=0.8)
            c.move_to(pos + DOWN * 1)
            butane.add(c)
            if i < 3:
                bond = Line(pos + RIGHT * 0.15 + DOWN * 1, pos + RIGHT * 0.85 + DOWN * 1, color=CHEM_BOND, stroke_width=2)
                butane.add(bond)

        butane_label = Text("n-Butane", font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE)
        butane_label.next_to(butane, DOWN, buff=0.3)

        # Isobranched (2-methylpropane)
        isobutane = VGroup()
        center = Circle(radius=0.15, color=CHEM_REACTION, fill_opacity=0.8)
        center.move_to(ORIGIN + DOWN * 1)
        left_c = Circle(radius=0.15, color=CHEM_REACTION, fill_opacity=0.8).move_to(LEFT * 0.8 + DOWN * 1)
        right_c = Circle(radius=0.15, color=CHEM_REACTION, fill_opacity=0.8).move_to(RIGHT * 0.8 + DOWN * 1)
        top_c = Circle(radius=0.15, color=CHEM_REACTION, fill_opacity=0.8).move_to(ORIGIN + UP * 0.2 + DOWN * 1)

        isobutane.add(
            center, left_c, right_c, top_c,
            Line(center.get_left(), right_c.get_right(), color=CHEM_BOND, stroke_width=2),
            Line(center.get_top(), top_c.get_bottom(), color=CHEM_BOND, stroke_width=2),
            Line(center.get_right(), left_c.get_left(), color=CHEM_BOND, stroke_width=2),
        )
        isobutane.move_to(RIGHT * 3 + DOWN * 1)

        isobutane_label = Text("Isobutane", font_size=LABEL_FONT_SIZE, color=CHEM_REACTION)
        isobutane_label.next_to(isobutane, DOWN, buff=0.3)

        self.play(FadeIn(butane), Write(butane_label), run_time=1)
        self.play(FadeIn(isobutane), Write(isobutane_label), run_time=1)

        # Properties differ
        props = VGroup(
            MathTex(r"\text{b.p.} = -0.5\,°\text{C}", font_size=SMALL_FONT_SIZE, color=CHEM_MOLECULE),
            MathTex(r"\text{b.p.} = -11.7\,°\text{C}", font_size=SMALL_FONT_SIZE, color=CHEM_REACTION),
        ).arrange(DOWN, buff=0.1).move_to(RIGHT * 3 + DOWN * 2)

        self.play(FadeIn(props), run_time=0.8)

        insight = Text("Isomers have identical formulas but different properties", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
