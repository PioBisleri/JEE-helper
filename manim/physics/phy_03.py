import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class NewtonSecondLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Newton's Second Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{F} = m\vec{a}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Block
        block = Rectangle(width=1.2, height=0.8, color=PHYSICS_OBJECT, fill_opacity=0.3, stroke_width=2)
        mass_label = MathTex(r"m = 2\,kg", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        mass_label.move_to(block)

        ground = Line(LEFT * 4 + DOWN * 1.5, RIGHT * 4 + DOWN * 1.5, color=MUTED_COLOR, stroke_width=2)
        block_group = VGroup(block, mass_label).move_to(DOWN * 1.1)

        # Force arrow
        force_arrow = Arrow(block.get_right(), block.get_right() + RIGHT * 2, color=PHYSICS_FORCE, buff=0, stroke_width=4)
        force_label = MathTex(r"F = 10\,N", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        force_label.next_to(force_arrow, UP, buff=0.1)

        # Acceleration arrow (F/m = 10/2 = 5 m/s^2)
        acc_arrow = Arrow(block.get_left(), block.get_left() + LEFT * 1.25, color=PHYSICS_ACCEL, buff=0, stroke_width=3)
        acc_label = MathTex(r"a = 5\,m/s^2", font_size=LABEL_FONT_SIZE, color=PHYSICS_ACCEL)
        acc_label.next_to(acc_arrow, UP, buff=0.1)

        self.play(FadeIn(block_group), Create(ground), run_time=0.5)
        self.play(GrowArrow(force_arrow), Write(force_label), run_time=1)

        # Animate acceleration
        self.play(GrowArrow(acc_arrow), Write(acc_label), run_time=1)

        # Move the block
        self.play(
            block_group.animate.shift(RIGHT * 3),
            run_time=ANIMATION_DURATION * 0.6,
            rate_func=linear
        )

        # Show result
        result = MathTex(r"a = \frac{F}{m} = \frac{10}{2} = 5\,m/s^2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ACCEL)
        result.to_edge(DOWN, buff=0.5)
        self.play(Write(result), run_time=1)

        insight = Text("More mass means less acceleration for the same force", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.next_to(result, DOWN, buff=0.2)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class Friction(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Friction Forces", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"f \leq \mu N", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Block on surface
        block = Rectangle(width=1, height=0.6, color=PHYSICS_OBJECT, fill_opacity=0.3, stroke_width=2)
        block.move_to(ORIGIN + DOWN * 0.5)
        surface = Line(LEFT * 3 + DOWN * 0.8, RIGHT * 3 + DOWN * 0.8, color=MUTED_COLOR, stroke_width=2)

        # Normal force
        n_arrow = Arrow(block.get_top(), block.get_top() + UP * 1, color=PHYSICS_VELOCITY, buff=0)
        n_label = MathTex(r"N", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        n_label.next_to(n_arrow, RIGHT, buff=0.1)

        # Weight
        w_arrow = Arrow(block.get_bottom(), block.get_bottom() + DOWN * 0.8, color=PHYSICS_ACCEL, buff=0)
        w_label = MathTex(r"mg", font_size=LABEL_FONT_SIZE, color=PHYSICS_ACCEL)
        w_label.next_to(w_arrow, RIGHT, buff=0.1)

        # Applied force
        f_arrow = Arrow(block.get_right(), block.get_right() + RIGHT * 1.5, color=PHYSICS_FORCE, buff=0)
        f_label = MathTex(r"F_{app}", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        f_label.next_to(f_arrow, UP, buff=0.1)

        # Friction force (opposing)
        fr_arrow = Arrow(block.get_left(), block.get_left() + LEFT * 1, color=PHYSICS_PATH, buff=0)
        fr_label = MathTex(r"f_s", font_size=LABEL_FONT_SIZE, color=PHYSICS_PATH)
        fr_label.next_to(fr_arrow, UP, buff=0.1)

        self.play(FadeIn(block), Create(surface), run_time=0.5)
        self.play(GrowArrow(n_arrow), Write(n_label), run_time=0.5)
        self.play(GrowArrow(w_arrow), Write(w_label), run_time=0.5)
        self.play(GrowArrow(f_arrow), Write(f_label), run_time=0.5)
        self.play(GrowArrow(fr_arrow), Write(fr_label), run_time=0.5)

        # Show static vs kinetic
        static_label = Text("Static: f_s ≤ μ_s N", font_size=LABEL_FONT_SIZE, color=PHYSICS_PATH)
        static_label.move_to(LEFT * 2 + DOWN * 2.5)

        kinetic_label = Text("Kinetic: f_k = μ_k N", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        kinetic_label.move_to(RIGHT * 2 + DOWN * 2.5)

        self.play(Write(static_label), Write(kinetic_label), run_time=1)

        # Highlight μ_s > μ_k
        mu_note = MathTex(r"\mu_s > \mu_k", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        mu_note.move_to(DOWN * 3.2)
        self.play(Write(mu_note), run_time=1)

        insight = Text("Static friction is always greater than kinetic friction", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class CentripetalAcceleration(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Centripetal Acceleration", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"a_c = \frac{v^2}{r}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Circle path
        circle = Circle(radius=1.5, color=PHYSICS_PATH, stroke_width=2, stroke_opacity=0.5)
        circle.move_to(DOWN * 0.5)
        self.play(Create(circle), run_time=1)

        # Center point
        center = Dot(circle.get_center(), color=MUTED_COLOR, radius=0.05)
        self.add(center)

        # Moving dot
        dot = Dot(color=PHYSICS_OBJECT, radius=0.12)
        angle_tracker = ValueTracker(0)

        def update_dot(d):
            angle = angle_tracker.get_value()
            x = 1.5 * np.cos(angle)
            y = 1.5 * np.sin(angle) - 0.5
            d.move_to([x, y, 0])

        def update_vel(d):
            angle = angle_tracker.get_value()
            # Velocity is tangent
            dx = -1.5 * np.sin(angle) * 0.5
            dy = 1.5 * np.cos(angle) * 0.5
            pos = d.get_start()
            d.put_start_and_end_on(pos, pos + np.array([dx, dy, 0]))

        def update_acc(d):
            angle = angle_tracker.get_value()
            pos = dot.get_center()
            # Acceleration towards center
            center_pos = circle.get_center()
            direction = center_pos - pos
            norm = np.linalg.norm(direction)
            if norm > 0:
                direction = direction / norm * 0.6
            d.put_start_and_end_on(pos, pos + direction)

        vel_arrow = Arrow(ORIGIN, RIGHT * 0.5, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        acc_arrow = Arrow(ORIGIN, LEFT * 0.5, color=PHYSICS_FORCE, buff=0, stroke_width=3)

        dot.add_updater(update_dot)
        vel_arrow.add_updater(update_vel)
        acc_arrow.add_updater(update_acc)

        vel_label = Text("v (tangent)", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        acc_label = Text("a_c (center)", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)

        self.add(dot, vel_arrow, acc_arrow)
        self.play(angle_tracker.animate.set_value(4 * np.pi), run_time=ANIMATION_DURATION, rate_func=linear)

        dot.remove_updater(update_dot)
        vel_arrow.remove_updater(update_vel)
        acc_arrow.remove_updater(update_acc)

        vel_label.move_to(UP * 2.5 + LEFT * 2)
        acc_label.move_to(UP * 2.5 + RIGHT * 2)
        self.play(Write(vel_label), Write(acc_label), run_time=1)

        insight = Text("Acceleration always points toward the center of the circle", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class PseudoForce(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Pseudo Force", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{F}_{pseudo} = -m\vec{a}_{frame}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Elevator box
        elevator = Rectangle(width=2.5, height=3, color=PHYSICS_OBJECT, fill_opacity=0.1, stroke_width=2)
        elevator.move_to(DOWN * 0.5)

        # Person inside
        person = Circle(radius=0.3, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        person.move_to(elevator.get_center())
        person_head = Circle(radius=0.15, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        person_head.next_to(person, UP, buff=0)

        person_group = VGroup(person, person_head)

        # Normal force up
        n_arrow = Arrow(person.get_top() + UP * 0.3, person.get_top() + UP * 1.3, color=PHYSICS_VELOCITY, buff=0)
        n_label = MathTex(r"N", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        n_label.next_to(n_arrow, RIGHT, buff=0.1)

        # Weight down
        w_arrow = Arrow(person.get_bottom(), person.get_bottom() + DOWN * 0.8, color=PHYSICS_ACCEL, buff=0)
        w_label = MathTex(r"mg", font_size=LABEL_FONT_SIZE, color=PHYSICS_ACCEL)
        w_label.next_to(w_arrow, RIGHT, buff=0.1)

        # Pseudo force
        pseudo_arrow = Arrow(person.get_left(), person.get_left() + LEFT * 1.2, color=DANGER_COLOR, buff=0, stroke_width=3)
        pseudo_label = MathTex(r"ma", font_size=LABEL_FONT_SIZE, color=DANGER_COLOR)
        pseudo_label.next_to(pseudo_arrow, DOWN, buff=0.1)

        accel_arrow = Arrow(elevator.get_right() + RIGHT * 0.3, elevator.get_right() + RIGHT * 1.5, color=PHYSICS_FORCE, buff=0)
        accel_label = Text("a (frame)", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        accel_label.next_to(accel_arrow, UP, buff=0.1)

        self.play(FadeIn(elevator), FadeIn(person_group), run_time=0.5)
        self.play(GrowArrow(n_arrow), Write(n_label), run_time=0.5)
        self.play(GrowArrow(w_arrow), Write(w_label), run_time=0.5)
        self.play(GrowArrow(pseudo_arrow), Write(pseudo_label), run_time=0.5)
        self.play(GrowArrow(accel_arrow), Write(accel_label), run_time=0.5)

        # Equation
        eq = MathTex(r"N = mg + ma = m(g+a)", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        eq.to_edge(DOWN, buff=0.8)
        self.play(Write(eq), run_time=1)

        # Elevator accelerates
        self.play(elevator.animate.shift(UP * 0.5), person_group.animate.shift(UP * 0.5), run_time=1)

        insight = Text("Pseudo force appears only in accelerating frames of reference", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
