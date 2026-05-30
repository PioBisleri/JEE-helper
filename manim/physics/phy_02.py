import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class EquationsOfMotion(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Equations of Motion", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"v = u + at", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Ball with vectors
        ball = Circle(radius=0.2, color=PHYSICS_OBJECT, fill_opacity=0.8)
        ball.move_to(LEFT * 4 + DOWN * 1)

        vel_arrow = Arrow(LEFT * 4 + DOWN * 1, LEFT * 2 + DOWN * 1, color=PHYSICS_VELOCITY, buff=0)
        vel_label = Text("u", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        vel_label.next_to(vel_arrow, UP, buff=0.1)

        acc_arrow = Arrow(LEFT * 4 + DOWN * 1, LEFT * 3 + DOWN * 1 + UP * 0.8, color=PHYSICS_ACCEL, buff=0)
        acc_label = Text("a", font_size=LABEL_FONT_SIZE, color=PHYSICS_ACCEL)
        acc_label.next_to(acc_arrow, RIGHT, buff=0.1)

        ground = Line(LEFT * 5 + DOWN * 1.3, RIGHT * 5 + DOWN * 1.3, color=MUTED_COLOR, stroke_width=2)

        self.play(FadeIn(ball), Create(ground), run_time=0.5)
        self.play(GrowArrow(vel_arrow), Write(vel_label), run_time=0.5)
        self.play(GrowArrow(acc_arrow), Write(acc_label), run_time=0.5)

        # Animate motion
        vel_arrow2 = Arrow(ORIGIN, RIGHT * 3, color=PHYSICS_VELOCITY, buff=0)
        vel_label2 = Text("v", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)

        self.play(
            ball.animate.shift(RIGHT * 8),
            FadeOut(vel_arrow), FadeOut(vel_label),
            FadeOut(acc_arrow), FadeOut(acc_label),
            run_time=ANIMATION_DURATION * 0.8,
            rate_func=linear
        )

        # Show final velocity
        vel_arrow2.move_to(ball.get_center() + UP * 0.5)
        vel_label2.next_to(vel_arrow2, UP, buff=0.1)
        self.play(GrowArrow(vel_arrow2), Write(vel_label2), run_time=0.5)

        result = MathTex(r"v = u + at", font_size=FORMULA_FONT_SIZE, color=PHYSICS_VELOCITY)
        result.to_edge(DOWN, buff=0.5)
        self.play(Write(result), run_time=1)

        insight = Text("Velocity changes linearly with constant acceleration", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.next_to(result, DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class DisplacementTime(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Displacement-Time Graph", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"s = ut + \frac{1}{2}at^2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 6, 1], y_range=[0, 18, 3],
            x_length=7, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("t (s)").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("s (m)").set_color(PHYSICS_VELOCITY)

        curve = axes.plot(lambda t: 1.5 * t + 0.5 * 3 * t**2, x_range=[0, 3.5], color=PHYSICS_PATH, use_smoothing=True)
        curve_label = MathTex(r"u=1.5, a=3", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        curve_label.next_to(curve, UP, buff=0.2)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(curve), Write(curve_label), run_time=2)

        # Moving dot along curve
        dot = Dot(color=PHYSICS_OBJECT, radius=0.1)
        t_tracker = ValueTracker(0)

        def update_dot(d):
            t = t_tracker.get_value()
            t_clamped = min(t, 3.5)
            d.move_to(axes.c2p(t_clamped, 1.5 * t_clamped + 0.5 * 3 * t_clamped**2))

        dot.add_updater(update_dot)

        time_label = always_redraw(lambda: MathTex(
            f"t={t_tracker.get_value():.1f}s", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT
        ).to_corner(DR, buff=0.5))

        self.add(dot, time_label)
        self.play(t_tracker.animate.set_value(3.5), run_time=ANIMATION_DURATION * 0.8, rate_func=linear)
        dot.remove_updater(update_dot)

        insight = Text("Displacement depends on initial velocity and acceleration", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class VelocityDisplacement(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Velocity-Displacement", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"v^2 = u^2 + 2as", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 20, 4],
            x_length=6, y_length=3,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 1)

        x_label = axes.get_x_axis_label("s (m)").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("v^2").set_color(PHYSICS_VELOCITY)

        # v^2 = u^2 + 2as -> parabolic in s
        # For u=2, a=3: v^2 = 4 + 6s
        curve = axes.plot(lambda s: 4 + 6 * s, x_range=[0, 2.5], color=PHYSICS_PATH, use_smoothing=True)
        curve_label = MathTex(r"v^2 = 4 + 6s", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        curve_label.next_to(curve, UP, buff=0.2)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(curve), Write(curve_label), run_time=2)

        # Moving dot
        dot = Dot(color=PHYSICS_OBJECT, radius=0.1)
        s_tracker = ValueTracker(0)

        def update_dot(d):
            s = min(s_tracker.get_value(), 2.5)
            v2 = 4 + 6 * s
            d.move_to(axes.c2p(s, v2))

        dot.add_updater(update_dot)
        self.add(dot)
        self.play(s_tracker.animate.set_value(2.5), run_time=ANIMATION_DURATION * 0.7, rate_func=linear)
        dot.remove_updater(update_dot)

        insight = Text("Velocity-squared varies linearly with displacement", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class TimeOfFlight(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Time of Flight", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"T = \frac{2u\sin\theta}{g}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Ground line
        ground = Line(LEFT * 5 + DOWN * 2, RIGHT * 5 + DOWN * 2, color=MUTED_COLOR, stroke_width=2)

        # Launch point
        launch = Dot(LEFT * 4 + DOWN * 2, color=PHYSICS_OBJECT, radius=0.1)

        # Angle arc
        angle_arc = Arc(radius=1, start_angle=0, angle=np.radians(53), color=PHYSICS_VELOCITY, stroke_width=2)
        angle_arc.move_arc_center_to(LEFT * 4 + DOWN * 2)
        angle_label = MathTex(r"\theta=53°", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        angle_label.next_to(angle_arc, RIGHT, buff=0.1)

        # Projectile path
        theta = np.radians(53)
        u = 5
        g = 9.8
        T = 2 * u * np.sin(theta) / g
        R = u**2 * np.sin(2 * theta) / g
        H = (u * np.sin(theta))**2 / (2 * g)

        scale = 0.3
        def path_func(t):
            x = u * np.cos(theta) * t * scale
            y = u * np.sin(theta) * t * scale - 0.5 * g * t**2 * scale
            return LEFT * 4 + RIGHT * x + UP * y

        path_points = [path_func(t) for t in np.linspace(0, T, 50)]
        path = VMobject(color=PHYSICS_PATH, stroke_width=3)
        path.set_points_as_corners(path_points)

        # Max height line
        max_h_line = DashedLine(
            path.get_center() + UP * H * scale * 0.5,
            DOWN * 2,
            color=PHYSICS_ENERGY, stroke_width=1
        )
        h_label = MathTex(r"H", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        h_label.next_to(max_h_line, UP, buff=0.1)

        # Range line
        range_line = Line(LEFT * 4 + DOWN * 2, LEFT * 4 + RIGHT * R * scale + DOWN * 2, color=PHYSICS_FORCE, stroke_width=2)
        r_label = MathTex(r"R", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        r_label.next_to(range_line, DOWN, buff=0.1)

        self.play(Create(ground), FadeIn(launch), run_time=0.5)
        self.play(Write(angle_arc), Write(angle_label), run_time=0.5)
        self.play(Create(path), run_time=ANIMATION_DURATION * 0.6, rate_func=linear)
        self.play(Create(max_h_line), Write(h_label), run_time=1)
        self.play(Create(range_line), Write(r_label), run_time=1)

        insight = Text("Flight time depends only on vertical velocity component", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class HorizontalRange(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Horizontal Range", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"R = \frac{u^2 \sin 2\theta}{g}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        ground = Line(LEFT * 5 + DOWN * 2, RIGHT * 5 + DOWN * 2, color=MUTED_COLOR, stroke_width=2)
        self.play(Create(ground), run_time=0.5)

        u = 5
        g = 9.8
        scale = 0.15

        # Show range for different angles
        angles = [15, 30, 45, 60, 75]
        colors = [PHYSICS_FORCE, PHYSICS_OBJECT, PHYSICS_ENERGY, PHYSICS_VELOCITY, PHYSICS_PATH]

        prev_paths = VGroup()
        for angle_deg, c in zip(angles, colors):
            theta = np.radians(angle_deg)
            T = 2 * u * np.sin(theta) / g
            R = u**2 * np.sin(2 * theta) / g

            path_points = []
            for t in np.linspace(0, T, 40):
                x = u * np.cos(theta) * t * scale
                y = u * np.sin(theta) * t * scale - 0.5 * g * t**2 * scale
                path_points.append(LEFT * 4 + RIGHT * x + UP * y)

            p = VMobject(color=c, stroke_width=2, stroke_opacity=0.8)
            p.set_points_as_corners(path_points)

            angle_label = MathTex(f"{angle_deg}°", font_size=SMALL_FONT_SIZE, color=c)
            angle_label.next_to(p.get_end(), DOWN, buff=0.1)

            self.play(Create(p), Write(angle_label), run_time=1)

        # Highlight max range
        max_angle_label = Text("45° gives maximum range", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        max_angle_label.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(max_angle_label), run_time=INSIGHT_DURATION)

        insight = Text("Range is symmetric about 45 degrees", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.next_to(max_angle_label, DOWN, buff=0.2)
        self.play(FadeIn(insight), run_time=1)
        self.wait(1)
