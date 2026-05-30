import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class GravitationalForce(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Gravitational Force", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"F = \frac{Gm_1m_2}{r^2}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Two masses
        mass1 = Circle(radius=0.5, color=PHYSICS_OBJECT, fill_opacity=0.4)
        mass1.move_to(LEFT * 2.5)
        m1_label = MathTex(r"m_1", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        m1_label.move_to(mass1)

        mass2 = Circle(radius=0.35, color=PHYSICS_VELOCITY, fill_opacity=0.4)
        mass2.move_to(RIGHT * 2.5)
        m2_label = MathTex(r"m_2", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        m2_label.move_to(mass2)

        # Force arrows (attractive)
        f1 = Arrow(mass1.get_right(), mass1.get_right() + RIGHT * 1.2, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        f2 = Arrow(mass2.get_left(), mass2.get_left() + LEFT * 1.2, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        f_label = MathTex(r"F_{12} = F_{21}", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        f_label.move_to(UP * 0.3)

        # Distance line
        r_line = Line(mass1.get_bottom() + DOWN * 0.3, mass2.get_bottom() + DOWN * 0.3, color=PHYSICS_ENERGY, stroke_width=2)
        r_label = MathTex(r"r", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        r_label.next_to(r_line, DOWN, buff=0.1)

        self.play(FadeIn(mass1), Write(m1_label), FadeIn(mass2), Write(m2_label), run_time=1)
        self.play(GrowArrow(f1), GrowArrow(f2), Write(f_label), run_time=1)
        self.play(Create(r_line), Write(r_label), run_time=1)

        # Show inverse square
        inv_sq = MathTex(r"F \propto \frac{1}{r^2}", font_size=LABEL_FONT_SIZE, color=PHYSICS_PATH)
        inv_sq.move_to(DOWN * 2)
        self.play(Write(inv_sq), run_time=1)

        # Animate distance change
        self.play(mass2.animate.shift(RIGHT * 1), run_time=1)
        smaller_f = MathTex(r"r \uparrow \Rightarrow F \downarrow\downarrow", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        smaller_f.move_to(DOWN * 2.5)
        self.play(Write(smaller_f), run_time=1)

        insight = Text("Gravity weakens with the square of distance", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class GravitationalPotential(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Gravitational Potential", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"V = -\frac{GM}{r}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Potential well visualization
        axes = Axes(
            x_range=[0, 6, 1], y_range=[-8, 0, 2],
            x_length=7, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("r").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("V").set_color(PHYSICS_ENERGY)

        # V = -GM/r curve
        curve = axes.plot(lambda r: -6 / max(r, 0.3), x_range=[0.4, 5.5], color=PHYSICS_PATH, use_smoothing=True)
        curve_label = MathTex(r"V = -\frac{GM}{r}", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        curve_label.next_to(curve.get_end(), UP, buff=0.1)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(curve), Write(curve_label), run_time=2)

        # Ball rolling in well
        dot = Dot(color=PHYSICS_OBJECT, radius=0.1)
        r_tracker = ValueTracker(5)

        def update_dot(d):
            r = max(r_tracker.get_value(), 0.4)
            v = -6 / r
            d.move_to(axes.c2p(r, v))

        dot.add_updater(update_dot)
        self.add(dot)

        self.play(r_tracker.animate.set_value(0.8), run_time=ANIMATION_DURATION * 0.7, rate_func=smooth)
        dot.remove_updater(update_dot)

        insight = Text("Objects fall into deeper potential wells", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class EscapeVelocity(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Escape Velocity", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"v_{esc} = \sqrt{\frac{2GM}{R}}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Planet
        planet = Circle(radius=0.8, color=PHYSICS_OBJECT, fill_opacity=0.3)
        planet.move_to(DOWN * 0.5)

        # Orbital trajectory (ellipse)
        orbit = Ellipse(width=3, height=1.5, color=PHYSICS_VELOCITY, stroke_width=2, stroke_opacity=0.6)
        orbit.move_to(DOWN * 0.5)

        # Escape trajectory (parabola going out)
        escape_pts = []
        for t in np.linspace(-1, 2, 30):
            x = t
            y = 0.5 * t**1.5 + 0.3
            escape_pts.append(planet.get_center() + RIGHT * 0.8 + np.array([x, y, 0]))
        escape = VMobject(color=DANGER_COLOR, stroke_width=2)
        escape.set_points_as_corners(escape_pts)

        # Labels
        orbital_label = Text("Orbital", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        orbital_label.next_to(orbit, UP, buff=0.1)
        escape_label = Text("Escape", font_size=SMALL_FONT_SIZE, color=DANGER_COLOR)
        escape_label.move_to(RIGHT * 3 + UP * 2)

        self.play(FadeIn(planet), run_time=0.5)
        self.play(Create(orbit), Write(orbital_label), run_time=1)
        self.play(Create(escape), Write(escape_label), run_time=2)

        # Earth value
        v_earth = MathTex(r"v_{esc,Earth} = 11.2\,km/s", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        v_earth.move_to(DOWN * 2.5)
        self.play(Write(v_earth), run_time=1)

        insight = Text("Escape velocity is sqrt(2) times orbital velocity", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class OrbitalVelocity(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Orbital Velocity", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"v = \sqrt{\frac{GM}{r}}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Central body
        center = Circle(radius=0.5, color=PHYSICS_OBJECT, fill_opacity=0.4)
        center.move_to(ORIGIN)
        c_label = Text("M", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        c_label.move_to(center)

        # Orbit circle
        orbit = Circle(radius=2, color=PHYSICS_VELOCITY, stroke_width=2, stroke_opacity=0.5)
        self.play(FadeIn(center), Write(c_label), Create(orbit), run_time=1)

        # Satellite
        satellite = Square(side_length=0.2, color=PHYSICS_VELOCITY, fill_opacity=0.8)
        angle_tracker = ValueTracker(0)

        def update_sat(s):
            angle = angle_tracker.get_value()
            s.move_to(2 * np.array([np.cos(angle), np.sin(angle), 0]))
            s.rotate(angle)

        satellite.add_updater(update_sat)

        # Velocity arrow (tangent)
        vel_arrow = Arrow(ORIGIN, RIGHT * 0.6, color=PHYSICS_VELOCITY, buff=0)

        def update_vel(a):
            angle = angle_tracker.get_value()
            pos = 2 * np.array([np.cos(angle), np.sin(angle), 0])
            tangent = np.array([-np.sin(angle), np.cos(angle), 0]) * 0.6
            a.put_start_and_end_on(pos, pos + tangent)

        vel_arrow.add_updater(update_vel)

        # Radius line
        radius_line = always_redraw(lambda: Line(
            center.get_center(),
            2 * np.array([np.cos(angle_tracker.get_value()), np.sin(angle_tracker.get_value()), 0]),
            color=MUTED_COLOR, stroke_width=1
        ))

        self.add(satellite, vel_arrow, radius_line)
        self.play(angle_tracker.animate.set_value(2 * np.pi), run_time=ANIMATION_DURATION, rate_func=linear)

        satellite.remove_updater(update_sat)
        vel_arrow.remove_updater(update_vel)

        insight = Text("Orbital speed depends on distance from center", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class KeplerThirdLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Kepler's Third Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"T^2 \propto a^3", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Two elliptical orbits
        center = Dot(ORIGIN, color=PHYSICS_OBJECT, radius=0.1)

        orbit1 = Ellipse(width=3, height=2.5, color=PHYSICS_VELOCITY, stroke_width=2, stroke_opacity=0.6)
        orbit2 = Ellipse(width=5, height=3, color=PHYSICS_PATH, stroke_width=2, stroke_opacity=0.6)
        orbit2.shift(RIGHT * 0.5)

        # Planets
        planet1 = Dot(LEFT * 1.2 + UP * 0.8, color=PHYSICS_VELOCITY, radius=0.08)
        planet2 = Dot(RIGHT * 2 + UP * 0.5, color=PHYSICS_PATH, radius=0.08)

        # Semi-major axis labels
        a1 = Line(ORIGIN, LEFT * 1.2, color=PHYSICS_VELOCITY, stroke_width=1)
        a1_label = MathTex(r"a_1", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        a1_label.next_to(a1, DOWN, buff=0.05)

        a2 = Line(ORIGIN, RIGHT * 2, color=PHYSICS_PATH, stroke_width=1)
        a2_label = MathTex(r"a_2", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        a2_label.next_to(a2, DOWN, buff=0.05)

        # Period labels
        t1 = MathTex(r"T_1", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        t1.move_to(LEFT * 3 + DOWN * 2)
        t2 = MathTex(r"T_2", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        t2.move_to(RIGHT * 3 + DOWN * 2)

        self.play(FadeIn(center), Create(orbit1), Create(orbit2), run_time=1)
        self.play(FadeIn(planet1), FadeIn(planet2), run_time=0.5)
        self.play(Create(a1), Write(a1_label), Create(a2), Write(a2_label), run_time=1)
        self.play(Write(t1), Write(t2), run_time=1)

        # Animate - inner orbits faster
        self.play(
            Rotate(planet1, angle=4 * np.pi, about_point=ORIGIN),
            Rotate(planet2, angle=2 * np.pi, about_point=ORIGIN),
            run_time=ANIMATION_DURATION * 0.6,
            rate_func=linear
        )

        ratio = MathTex(r"\frac{T_1^2}{T_2^2} = \frac{a_1^3}{a_2^3}", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        ratio.move_to(DOWN * 2.5)
        self.play(Write(ratio), run_time=1)

        insight = Text("Farther planets take longer to complete orbits", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
