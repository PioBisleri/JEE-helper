import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class CoulombsLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Coulomb's Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"F = k\frac{|q_1 q_2|}{r^2}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Two charges
        q1 = Circle(radius=0.4, color=PHYSICS_FORCE, fill_opacity=0.5)
        q1.move_to(LEFT * 2.5)
        q1_label = MathTex(r"+q_1", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        q1_label.move_to(q1)

        q2 = Circle(radius=0.35, color=PHYSICS_OBJECT, fill_opacity=0.5)
        q2.move_to(RIGHT * 2.5)
        q2_label = MathTex(r"-q_2", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        q2_label.move_to(q2)

        # Force arrows (attractive)
        f1 = Arrow(q1.get_right(), q1.get_right() + RIGHT * 1.2, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        f2 = Arrow(q2.get_left(), q2.get_left() + LEFT * 1.2, color=PHYSICS_OBJECT, buff=0, stroke_width=3)
        f_label = MathTex(r"F_{12}", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        f_label.move_to(UP * 0.3)

        # Distance
        r_line = Line(q1.get_bottom() + DOWN * 0.3, q2.get_bottom() + DOWN * 0.3, color=PHYSICS_VELOCITY, stroke_width=2)
        r_label = MathTex(r"r", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        r_label.next_to(r_line, DOWN, buff=0.1)

        self.play(FadeIn(q1), Write(q1_label), FadeIn(q2), Write(q2_label), run_time=1)
        self.play(GrowArrow(f1), GrowArrow(f2), Write(f_label), run_time=1)
        self.play(Create(r_line), Write(r_label), run_time=1)

        # Show k constant
        k_val = MathTex(r"k = 9 \times 10^9\,N\cdot m^2/C^2", font_size=LABEL_FONT_SIZE, color=PHYSICS_PATH)
        k_val.move_to(DOWN * 2)
        self.play(Write(k_val), run_time=1)

        # Change distance
        self.play(q2.animate.shift(RIGHT * 1), run_time=1)
        weaker = MathTex(r"r \uparrow \Rightarrow F \downarrow\downarrow", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        weaker.move_to(DOWN * 2.5)
        self.play(Write(weaker), run_time=1)

        insight = Text("Electric force follows inverse square law like gravity", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ElectricField(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Electric Field", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{E} = \frac{kq}{r^2}\hat{r}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=TITLE_DURATION)

        # Central charge
        charge = Circle(radius=0.3, color=PHYSICS_FORCE, fill_opacity=0.8)
        charge.move_to(ORIGIN)
        charge_label = MathTex(r"+q", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        charge_label.move_to(charge)

        self.play(FadeIn(charge), Write(charge_label), run_time=0.5)

        # Field lines radiating outward
        field_lines = VGroup()
        for i in range(12):
            angle = i * np.pi / 6
            start = charge.get_center() + 0.4 * np.array([np.cos(angle), np.sin(angle), 0])
            end = charge.get_center() + 2.5 * np.array([np.cos(angle), np.sin(angle), 0])
            arr = Arrow(start, end, color=PHYSICS_FIELD, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.1)
            field_lines.add(arr)

        self.play(LaggedStart(*[GrowArrow(f) for f in field_lines], lag_ratio=0.1), run_time=ANIMATION_DURATION * 0.5)

        # Show E decreases with distance
        e_near = MathTex(r"E_{near}", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        e_near.move_to(RIGHT * 1.2 + UP * 0.5)
        e_far = MathTex(r"E_{far}", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        e_far.move_to(RIGHT * 2.5 + UP * 0.5)

        self.play(Write(e_near), Write(e_far), run_time=1)

        insight = Text("Field lines point away from positive charges", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class CapacitorCharging(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Capacitor Charging", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"Q = CV", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Parallel plates
        plate1 = Rectangle(width=0.1, height=2, color=PHYSICS_FORCE, fill_opacity=0.3)
        plate1.move_to(LEFT * 1)
        plate2 = Rectangle(width=0.1, height=2, color=PHYSICS_OBJECT, fill_opacity=0.3)
        plate2.move_to(RIGHT * 1)

        # + and - signs
        plus_signs = VGroup()
        minus_signs = VGroup()
        for y in [-0.5, 0, 0.5]:
            p = Text("+", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
            p.move_to(LEFT * 0.85 + UP * y)
            plus_signs.add(p)
            m = Text("-", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
            m.move_to(RIGHT * 0.85 + UP * y)
            minus_signs.add(m)

        # Field lines between plates
        field_lines = VGroup()
        for y in [-0.5, 0, 0.5]:
            arr = Arrow(LEFT * 0.7 + UP * y, RIGHT * 0.7 + UP * y, color=PHYSICS_FIELD, buff=0, stroke_width=2)
            field_lines.add(arr)

        self.play(FadeIn(plate1), FadeIn(plate2), run_time=0.5)
        self.play(FadeIn(plus_signs), FadeIn(minus_signs), run_time=1)
        self.play(FadeIn(field_lines), run_time=1)

        # Show capacitance
        cap_formula = MathTex(r"C = \frac{\varepsilon_0 A}{d}", font_size=LABEL_FONT_SIZE, color=PHYSICS_PATH)
        cap_formula.move_to(DOWN * 2)
        self.play(Write(cap_formula), run_time=1)

        # Animate charge building up
        charge_bar = Rectangle(width=0.5, height=0.1, color=PHYSICS_ENERGY, fill_opacity=0.5)
        charge_bar.move_to(DOWN * 2.8)
        charge_label = Text("Q", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        charge_label.next_to(charge_bar, RIGHT, buff=0.1)

        self.play(FadeIn(charge_bar), Write(charge_label), run_time=0.5)
        self.play(charge_bar.animate.stretch_to_fit_height(1.5).move_to(DOWN * 2.8, aligned_edge=DOWN), run_time=ANIMATION_DURATION * 0.5)

        insight = Text("Capacitance depends on geometry, not on charge", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class GaussLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Gauss's Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\oint \vec{E} \cdot d\vec{A} = \frac{q_{enc}}{\varepsilon_0}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Gaussian surface (sphere)
        gaussian = Circle(radius=1.5, color=PHYSICS_PATH, stroke_width=2)
        gaussian.stroke_dasharray = [5, 3]
        gaussian.move_to(DOWN * 0.5)

        # Charge inside
        charge = Circle(radius=0.2, color=PHYSICS_FORCE, fill_opacity=0.8)
        charge.move_to(DOWN * 0.5)
        q_label = MathTex(r"+q", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        q_label.move_to(charge)

        # Field lines through surface
        field_lines = VGroup()
        for i in range(8):
            angle = i * np.pi / 4
            start = charge.get_center() + 0.3 * np.array([np.cos(angle), np.sin(angle), 0])
            end = gaussian.get_center() + 1.5 * np.array([np.cos(angle), np.sin(angle), 0])
            arr = Arrow(start, end, color=PHYSICS_FIELD, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.15)
            field_lines.add(arr)

        # Area element
        dA = Arc(radius=1.5, start_angle=-0.2, angle=0.4, color=PHYSICS_ENERGY, stroke_width=4)
        dA.move_arc_center_to(DOWN * 0.5)
        dA_label = MathTex(r"d\vec{A}", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        dA_label.next_to(dA, RIGHT, buff=0.1)

        self.play(Create(gaussian), FadeIn(charge), Write(q_label), run_time=1)
        self.play(LaggedStart(*[GrowArrow(f) for f in field_lines], lag_ratio=0.1), run_time=1.5)
        self.play(Create(dA), Write(dA_label), run_time=1)

        # Surface label
        gs_label = Text("Gaussian Surface", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        gs_label.next_to(gaussian, UP, buff=0.2)
        self.play(Write(gs_label), run_time=0.5)

        insight = Text("Flux depends only on enclosed charge, not surface shape", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
