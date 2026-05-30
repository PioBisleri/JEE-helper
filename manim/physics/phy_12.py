import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class BiotSavart(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Biot-Savart Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"d\vec{B} = \frac{\mu_0}{4\pi}\frac{I\,d\vec{l}\times\hat{r}}{r^2}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Wire (going into page)
        wire = Circle(radius=0.15, color=PHYSICS_OBJECT, fill_opacity=0.8)
        wire.move_to(ORIGIN)
        wire_dot = Dot(ORIGIN, color=PHYSICS_OBJECT, radius=0.05)
        current_into = MathTex(r"\\otimes I", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        current_into.move_to(ORIGIN)

        self.play(FadeIn(wire), FadeIn(wire_dot), Write(current_into), run_time=0.5)

        # Magnetic field lines (concentric circles)
        field_circles = VGroup()
        for r in [0.8, 1.3, 1.8]:
            c = Circle(radius=r, color=PHYSICS_FIELD, stroke_width=1.5, stroke_opacity=0.6)
            field_circles.add(c)

        self.play(Create(field_circles), run_time=2)

        # Arrows on circles
        arrows = VGroup()
        for r in [0.8, 1.3, 1.8]:
            for angle in [0, np.pi / 2, np.pi, 3 * np.pi / 2]:
                pos = r * np.array([np.cos(angle), np.sin(angle), 0])
                tangent = np.array([-np.sin(angle), np.cos(angle), 0]) * 0.2
                arr = Arrow(pos, pos + tangent, color=PHYSICS_FIELD, buff=0, stroke_width=2, max_tip_length_to_length_ratio=0.3)
                arrows.add(arr)

        self.play(FadeIn(arrows), run_time=1)

        # Show B decreases with distance
        b_near = MathTex(r"B_{near}", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        b_near.move_to(RIGHT * 1 + UP * 0.5)
        b_far = MathTex(r"B_{far}", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        b_far.move_to(RIGHT * 2 + UP * 0.5)

        self.play(Write(b_near), Write(b_far), run_time=1)

        insight = Text("Magnetic field forms concentric circles around the wire", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class LorentzForce(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Lorentz Force", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{F} = q(\vec{v} \times \vec{B})", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Magnetic field (dots = out of page)
        field_dots = VGroup()
        for x in range(-4, 5):
            for y in range(-2, 3):
                dot = Dot([x * 0.8, y * 0.8, 0], color=PHYSICS_FIELD, radius=0.03)
                field_dots.add(dot)

        field_label = MathTex(r"\\odot B", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        field_label.move_to(RIGHT * 4 + UP * 2)

        self.play(FadeIn(field_dots), Write(field_label), run_time=1)

        # Charged particle
        particle = Circle(radius=0.15, color=PHYSICS_FORCE, fill_opacity=0.8)
        particle.move_to(LEFT * 3)
        p_label = MathTex(r"+q", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        p_label.next_to(particle, UP, buff=0.1)

        # Initial velocity
        vel_arrow = Arrow(particle.get_right(), particle.get_right() + RIGHT * 0.5, color=PHYSICS_VELOCITY, buff=0)
        vel_label = MathTex(r"v", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        vel_label.next_to(vel_arrow, UP, buff=0.05)

        self.play(FadeIn(particle), Write(p_label), GrowArrow(vel_arrow), Write(vel_label), run_time=0.5)

        # Circular path
        radius = 1.5
        path = Circle(radius=radius, color=PHYSICS_PATH, stroke_width=2, stroke_opacity=0.5)
        path.move_to(LEFT * 3 + DOWN * 1.5)

        # Show force direction
        force_arrow = Arrow(LEFT * 3, LEFT * 3 + DOWN * 0.8, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        force_label = MathTex(r"F", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        force_label.next_to(force_arrow, LEFT, buff=0.1)

        self.play(Create(path), run_time=1)
        self.play(GrowArrow(force_arrow), Write(force_label), run_time=0.5)

        # Animate circular motion
        angle_tracker = ValueTracker(0)
        particle.add_updater(lambda p: p.move_to(path.get_center() + radius * np.array([np.cos(angle_tracker.get_value()), np.sin(angle_tracker.get_value()), 0])))

        self.play(angle_tracker.animate.set_value(4 * np.pi), run_time=ANIMATION_DURATION, rate_func=linear)
        particle.clear_updaters()

        insight = Text("Magnetic force is always perpendicular to velocity", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class MagneticDipole(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Magnetic Dipole", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\vec{\mu} = NIA\hat{n}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Current loop (ellipse for 3D perspective)
        loop = Ellipse(width=3, height=2, color=PHYSICS_OBJECT, stroke_width=3)
        loop.move_to(DOWN * 0.5)

        # Current direction arrows on loop
        arrow_positions = [
            (0, 1), (np.pi / 2, 1), (np.pi, 1), (3 * np.pi / 2, 1)
        ]

        # Magnetic moment arrow (through center)
        mu_arrow = Arrow(loop.get_center() + DOWN * 0.3, loop.get_center() + UP * 1.5, color=PHYSICS_FORCE, buff=0, stroke_width=4)
        mu_label = MathTex(r"\vec{\mu}", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        mu_label.next_to(mu_arrow, UP, buff=0.1)

        self.play(Create(loop), run_time=1)

        # Show current flowing
        current_dot = Dot(color=PHYSICS_VELOCITY, radius=0.08)
        angle_tracker = ValueTracker(0)

        def update_dot(d):
            angle = angle_tracker.get_value()
            x = 1.5 * np.cos(angle)
            y = 1.0 * np.sin(angle) - 0.5
            d.move_to([x, y, 0])

        current_dot.add_updater(update_dot)
        self.add(current_dot)

        self.play(angle_tracker.animate.set_value(2 * np.pi), run_time=2, rate_func=linear)
        current_dot.remove_updater(update_dot)

        self.play(GrowArrow(mu_arrow), Write(mu_label), run_time=1)

        # Field lines (like bar magnet)
        field_lines = VGroup()
        for angle_offset in [-0.3, 0, 0.3]:
            start = loop.get_center() + UP * 1.5 + RIGHT * angle_offset * 2
            curve = VMobject(color=PHYSICS_FIELD, stroke_width=1.5, stroke_opacity=0.5)
            curve.set_points_smoothly([
                start,
                start + UP * 1 + RIGHT * angle_offset * 3,
                start + UP * 1.5 + RIGHT * angle_offset * 4 + DOWN * 0.5,
            ])
            field_lines.add(curve)

        self.play(FadeIn(field_lines), run_time=1)

        insight = Text("A current loop behaves like a magnetic dipole", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
