import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class MomentOfInertia(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Moment of Inertia", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"I = \sum m_i r_i^2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Disc with mass points
        disc = Circle(radius=1.5, color=PHYSICS_OBJECT, stroke_width=2, fill_opacity=0.1)
        disc.move_to(LEFT * 2 + DOWN * 0.5)
        center = Dot(disc.get_center(), color=MUTED_COLOR, radius=0.05)

        # Mass points at different radii
        points = VGroup()
        for i in range(5):
            angle = i * 2 * np.pi / 5
            r = 0.5 + i * 0.25
            pos = disc.get_center() + r * np.array([np.cos(angle), np.sin(angle), 0])
            dot = Dot(pos, color=PHYSICS_FORCE, radius=0.06 + i * 0.01)
            r_line = Line(disc.get_center(), pos, color=MUTED_COLOR, stroke_width=1, stroke_opacity=0.5)
            r_label = MathTex(f"r_{i+1}", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
            r_label.next_to(r_line.get_center(), RIGHT, buff=0.05)
            points.add(VGroup(dot, r_line, r_label))

        self.play(Create(disc), FadeIn(center), run_time=0.5)
        self.play(FadeIn(points), run_time=1)

        # Show I depends on r^2
        formula2 = MathTex(r"I \propto r^2", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        formula2.move_to(RIGHT * 2.5 + DOWN * 0.5)
        self.play(Write(formula2), run_time=1)

        # Spinning
        self.play(Rotate(VGroup(disc, points, center), angle=2 * np.pi, about_point=disc.get_center()), run_time=ANIMATION_DURATION * 0.5, rate_func=linear)

        # Show disc formula
        disc_formula = MathTex(r"I_{disc} = \frac{1}{2}MR^2", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        disc_formula.move_to(RIGHT * 2.5 + DOWN * 1.5)
        self.play(Write(disc_formula), run_time=1)

        insight = Text("Farther mass contributes more to moment of inertia", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ParallelAxis(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Parallel Axis Theorem", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"I = I_{cm} + Md^2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Disc
        disc = Circle(radius=1.2, color=PHYSICS_OBJECT, stroke_width=2, fill_opacity=0.15)
        disc.move_to(LEFT * 2)

        # Center of mass axis
        cm_axis = DashedLine(disc.get_top(), disc.get_bottom(), color=PHYSICS_VELOCITY, stroke_width=2)
        cm_label = Text("CM axis", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        cm_label.next_to(cm_axis, LEFT, buff=0.1)

        # Parallel axis
        par_axis = DashedLine(disc.get_top() + RIGHT * 1.5, disc.get_bottom() + RIGHT * 1.5, color=PHYSICS_FORCE, stroke_width=2)
        par_label = Text("New axis", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        par_label.next_to(par_axis, RIGHT, buff=0.1)

        # Distance d
        d_line = Line(disc.get_center(), disc.get_center() + RIGHT * 1.5, color=PHYSICS_ENERGY, stroke_width=2)
        d_label = MathTex(r"d", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        d_label.next_to(d_line, DOWN, buff=0.1)

        self.play(Create(disc), run_time=0.5)
        self.play(Create(cm_axis), Write(cm_label), run_time=1)
        self.play(Create(par_axis), Write(par_label), run_time=1)
        self.play(Create(d_line), Write(d_label), run_time=1)

        # Show I comparison
        i_cm = MathTex(r"I_{cm} = \frac{1}{2}MR^2", font_size=LABEL_FONT_SIZE, color=PHYSICS_VELOCITY)
        i_cm.move_to(RIGHT * 2 + DOWN * 1)

        i_new = MathTex(r"I = \frac{1}{2}MR^2 + Md^2", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        i_new.move_to(RIGHT * 2 + DOWN * 2)

        self.play(Write(i_cm), run_time=1)
        self.play(Write(i_new), run_time=1)

        insight = Text("I always increases when axis is shifted from CM", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class AngularMomentum(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Angular Momentum", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"L = I\omega = \text{const}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Ice skater visualization
        # Arms extended
        body1 = Circle(radius=0.3, color=PHYSICS_OBJECT, fill_opacity=0.5)
        body1.move_to(LEFT * 3 + DOWN * 0.5)
        arm_l1 = Line(body1.get_center() + LEFT * 0.3, body1.get_center() + LEFT * 1.2, color=PHYSICS_OBJECT, stroke_width=3)
        arm_r1 = Line(body1.get_center() + RIGHT * 0.3, body1.get_center() + RIGHT * 1.2, color=PHYSICS_OBJECT, stroke_width=3)
        skater1 = VGroup(body1, arm_l1, arm_r1)

        label1 = Text("Arms out", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        label1.next_to(skater1, DOWN, buff=0.3)

        # Arms in
        body2 = Circle(radius=0.3, color=PHYSICS_FORCE, fill_opacity=0.5)
        body2.move_to(RIGHT * 3 + DOWN * 0.5)
        arm_l2 = Line(body2.get_center() + LEFT * 0.3, body2.get_center() + LEFT * 0.5, color=PHYSICS_FORCE, stroke_width=3)
        arm_r2 = Line(body2.get_center() + RIGHT * 0.3, body2.get_center() + RIGHT * 0.5, color=PHYSICS_FORCE, stroke_width=3)
        skater2 = VGroup(body2, arm_l2, arm_r2)

        label2 = Text("Arms in", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        label2.next_to(skater2, DOWN, buff=0.3)

        self.play(FadeIn(skater1), Write(label1), FadeIn(skater2), Write(label2), run_time=1)

        # Show rotation speed
        omega1 = MathTex(r"\omega_1 = \text{slow}", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        omega1.move_to(LEFT * 3 + UP * 1)
        omega2 = MathTex(r"\omega_2 = \text{fast}", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        omega2.move_to(RIGHT * 3 + UP * 1)

        self.play(Write(omega1), Write(omega2), run_time=1)

        # Animate rotation - slow for arms out
        self.play(Rotate(skater1, angle=np.pi, about_point=body1.get_center()), run_time=2, rate_func=linear)

        # Fast for arms in
        self.play(Rotate(skater2, angle=3 * np.pi, about_point=body2.get_center()), run_time=2, rate_func=linear)

        eq = MathTex(r"I_1\omega_1 = I_2\omega_2", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        eq.move_to(DOWN * 2.5)
        self.play(Write(eq), run_time=1)

        insight = Text("Arms in = smaller I = faster spin (L conserved)", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class RollingMotion(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Rolling Motion", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"v = \omega r", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Rolling disc
        disc = Circle(radius=0.5, color=PHYSICS_OBJECT, stroke_width=2, fill_opacity=0.15)
        disc.move_to(LEFT * 3 + DOWN * 0.5)

        # Radius line
        radius_line = Line(disc.get_center(), disc.get_center() + RIGHT * 0.5, color=PHYSICS_VELOCITY, stroke_width=2)
        r_label = MathTex(r"r", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        r_label.next_to(radius_line, DOWN, buff=0.05)

        # Contact point
        contact = Dot(disc.get_bottom(), color=PHYSICS_FORCE, radius=0.06)
        contact_label = Text("Contact (v=0)", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        contact_label.next_to(contact, DOWN, buff=0.1)

        ground = Line(LEFT * 5 + DOWN * 1, RIGHT * 5 + DOWN * 1, color=MUTED_COLOR, stroke_width=2)

        # Velocity at top
        top_vel = Arrow(disc.get_top() + UP * 0.1, disc.get_top() + UP * 0.1 + RIGHT * 0.8, color=PHYSICS_VELOCITY, buff=0)
        top_label = MathTex(r"v + \omega r = 2v", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        top_label.next_to(top_vel, UP, buff=0.05)

        # Translation arrow
        trans_arrow = Arrow(disc.get_center() + DOWN * 0.8, disc.get_center() + DOWN * 0.8 + RIGHT * 0.6, color=PHYSICS_PATH, buff=0)
        trans_label = Text("Translation", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        trans_label.next_to(trans_arrow, DOWN, buff=0.05)

        # Rotation arc
        rot_arc = Arc(radius=0.3, start_angle=0, angle=np.pi * 1.5, color=PHYSICS_ACCEL, stroke_width=2)
        rot_arc.move_arc_center_to(disc.get_center())
        rot_label = Text("Rotation", font_size=SMALL_FONT_SIZE, color=PHYSICS_ACCEL)
        rot_label.next_to(rot_arc, RIGHT, buff=0.1)

        self.play(Create(ground), FadeIn(disc), Create(radius_line), Write(r_label), run_time=0.5)
        self.play(FadeIn(contact), Write(contact_label), run_time=0.5)
        self.play(GrowArrow(top_vel), Write(top_label), run_time=0.5)
        self.play(GrowArrow(trans_arrow), Write(trans_label), Create(rot_arc), Write(rot_label), run_time=1)

        # Roll the disc
        self.play(
            disc.animate.shift(RIGHT * 8),
            run_time=ANIMATION_DURATION * 0.6,
            rate_func=linear
        )

        insight = Text("Rolling = Translation + Rotation without slipping", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
