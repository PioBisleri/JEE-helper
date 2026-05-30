import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class MoleConcept(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("The Mole Concept", font_size=TITLE_FONT_SIZE, color=CHEM_MOLECULE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"1\,\text{mol} = 6.022 \times 10^{23}\,\text{particles}", font_size=FORMULA_FONT_SIZE, color=CHEM_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Avogadro's number display
        avogadro = MathTex(r"N_A = 6.022 \times 10^{23}", font_size=FORMULA_FONT_SIZE, color=CHEM_BOND)
        avogadro.move_to(ORIGIN + DOWN * 0.3)
        self.play(Write(avogadro), run_time=1)

        # Create a grid of particles
        particles = VGroup()
        for row in range(6):
            for col in range(10):
                dot = Circle(radius=0.06, color=CHEM_MOLECULE, fill_opacity=0.8)
                dot.move_to(LEFT * 3.5 + RIGHT * col * 0.7 + DOWN * 1.2 + UP * row * 0.35)
                particles.add(dot)

        self.play(FadeIn(particles, lag_ratio=0.01), run_time=ANIMATION_DURATION * 0.4)

        # Animate counting with highlighting
        for i in range(0, 60, 5):
            self.play(particles[i].animate.set_color(CHEM_PRODUCT).set_fill(CHEM_PRODUCT, 1), run_time=0.08)

        # Scale down particles and show equivalence
        self.play(particles.animate.scale(0.4).to_edge(DOWN, buff=0.3), run_time=1)

        # Show equivalence relationships
        equiv = VGroup(
            MathTex(r"12\,\text{g C} = 1\,\text{mol C atoms}", font_size=LABEL_FONT_SIZE, color=CHEM_MOLECULE),
            MathTex(r"18\,\text{g H}_2\text{O} = 1\,\text{mol H}_2\text{O}", font_size=LABEL_FONT_SIZE, color=CHEM_BOND),
            MathTex(r"22.4\,\text{L STP} = 1\,\text{mol gas}", font_size=LABEL_FONT_SIZE, color=CHEM_ENERGY),
        ).arrange(DOWN, buff=0.3).move_to(ORIGIN + DOWN * 0.5)

        for eq in equiv:
            self.play(Write(eq), run_time=0.8)

        insight = Text("The mole bridges the atomic and macroscopic worlds", font_size=LABEL_FONT_SIZE, color=CHEM_PRODUCT)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
