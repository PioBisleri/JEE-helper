import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class MirrorFormula(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Mirror Formula", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{1}{f} = \frac{1}{v} + \frac{1}{u}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Principal axis
        axis = Line(LEFT * 5, RIGHT * 5, color=MUTED_COLOR, stroke_width=1)
        self.play(Create(axis), run_time=0.3)

        # Concave mirror
        mirror_arc = Arc(radius=2, start_angle=-np.pi / 3, angle=2 * np.pi / 3, color=PHYSICS_OBJECT, stroke_width=3)
        mirror_arc.move_to(RIGHT * 3)

        # Mirror surface (curved back)
        mirror_back = Arc(radius=2, start_angle=-np.pi / 3, angle=2 * np.pi / 3, color=MUTED_COLOR, stroke_width=6)
        mirror_back.move_to(RIGHT * 3)

        # Pole
        pole = Dot(RIGHT * 1, color=MUTED_COLOR, radius=0.05)
        pole_label = Text("P", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
        pole_label.next_to(pole, DOWN, buff=0.1)

        # Center of curvature
        center = Dot(RIGHT * 3, color=PHYSICS_VELOCITY, radius=0.05)
        c_label = Text("C", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        c_label.next_to(center, UP, buff=0.1)

        # Focus
        focus = Dot(RIGHT * 2, color=PHYSICS_FORCE, radius=0.05)
        f_label = Text("F", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        f_label.next_to(focus, UP, buff=0.1)

        self.play(Create(mirror_back), Create(mirror_arc), run_time=1)
        self.play(FadeIn(pole), Write(pole_label), FadeIn(center), Write(c_label), FadeIn(focus), Write(f_label), run_time=1)

        # Object (upright arrow)
        obj = Arrow(LEFT * 3 + DOWN * 1, LEFT * 3 + UP * 0.5, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        obj_label = Text("Object", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        obj_label.next_to(obj, UP, buff=0.1)

        self.play(GrowArrow(obj), Write(obj_label), run_time=0.5)

        # Ray 1: Parallel to axis, reflects through focus
        ray1_in = Line(LEFT * 3 + UP * 0.5, RIGHT * 1 + UP * 0.5, color=PHYSICS_PATH, stroke_width=2)
        ray1_out = Line(RIGHT * 1 + UP * 0.5, LEFT * 1 + DOWN * 1, color=PHYSICS_PATH, stroke_width=2)

        # Ray 2: Through focus, reflects parallel
        ray2_in = Line(LEFT * 3 + UP * 0.5, RIGHT * 2, color=PHYSICS_ACCEL, stroke_width=2)
        ray2_out = Line(RIGHT * 2, RIGHT * 4 + UP * 0.5, color=PHYSICS_ACCEL, stroke_width=2)

        self.play(Create(ray1_in), run_time=0.5)
        self.play(Create(ray1_out), run_time=0.5)
        self.play(Create(ray2_in), run_time=0.5)
        self.play(Create(ray2_out), run_time=0.5)

        # Image (inverted)
        img = Arrow(LEFT * 1 + UP * 0.2, LEFT * 1 + DOWN * 1, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        img_label = Text("Image", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        img_label.next_to(img, DOWN, buff=0.1)

        self.play(GrowArrow(img), Write(img_label), run_time=0.5)

        insight = Text("Image is real, inverted, and magnified for objects beyond C", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class SnellsLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Snell's Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"n_1 \sin\theta_1 = n_2 \sin\theta_2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Interface
        interface = Line(LEFT * 4, RIGHT * 4, color=MUTED_COLOR, stroke_width=2)
        # Normal
        normal = DashedLine(UP * 3, DOWN * 3, color=PHYSICS_VELOCITY, stroke_width=1)
        normal_label = Text("Normal", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        normal_label.next_to(normal, UP, buff=0.1)

        # Mediums
        air_label = Text("n_1 = 1 (air)", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        air_label.move_to(LEFT * 3 + UP * 2)
        glass_label = Text("n_2 = 1.5 (glass)", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        glass_label.move_to(LEFT * 3 + DOWN * 2)

        self.play(Create(interface), Create(normal), Write(normal_label), run_time=0.5)
        self.play(Write(air_label), Write(glass_label), run_time=0.5)

        # Incident ray
        incident = Arrow(LEFT * 3 + UP * 2.5, ORIGIN, color=PHYSICS_PATH, buff=0, stroke_width=3)
        inc_label = Text("Incident", font_size=SMALL_FONT_SIZE, color=PHYSICS_PATH)
        inc_label.next_to(incident.get_start(), LEFT, buff=0.1)

        # Refracted ray (bends towards normal in denser medium)
        refracted = Arrow(ORIGIN, RIGHT * 1.5 + DOWN * 2.5, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        ref_label = Text("Refracted", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        ref_label.next_to(refracted.get_end(), RIGHT, buff=0.1)

        # Angle arcs
        theta1 = Arc(radius=0.8, start_angle=-np.pi / 2, angle=np.pi / 3, color=PHYSICS_ENERGY, stroke_width=2)
        theta1.move_arc_center_to(ORIGIN)
        t1_label = MathTex(r"\theta_1", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        t1_label.move_to(0.5 * np.array([np.cos(np.pi / 6), np.sin(np.pi / 6), 0]) + UP * 0.3)

        theta2 = Arc(radius=0.5, start_angle=-np.pi / 2, angle=np.pi / 6, color=PHYSICS_ENERGY, stroke_width=2)
        theta2.move_arc_center_to(ORIGIN)
        t2_label = MathTex(r"\theta_2", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        t2_label.move_to(0.4 * np.array([np.cos(-np.pi / 3), np.sin(-np.pi / 3), 0]) + DOWN * 0.3)

        self.play(GrowArrow(incident), Write(inc_label), run_time=1)
        self.play(Create(theta1), Write(t1_label), run_time=0.5)
        self.play(GrowArrow(refracted), Write(ref_label), run_time=1)
        self.play(Create(theta2), Write(t2_label), run_time=0.5)

        insight = Text("Light bends toward normal when entering denser medium", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class LensFormula(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Lens Formula", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{1}{f} = \frac{1}{v} - \frac{1}{u}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Principal axis
        axis = Line(LEFT * 5, RIGHT * 5, color=MUTED_COLOR, stroke_width=1)
        self.play(Create(axis), run_time=0.3)

        # Convex lens
        lens = VGroup()
        lens_curve1 = Arc(radius=3, start_angle=-0.4, angle=0.8, color=PHYSICS_OBJECT, stroke_width=3)
        lens_curve1.move_to(RIGHT * 0.2)
        lens_curve2 = Arc(radius=3, start_angle=np.pi - 0.4, angle=0.8, color=PHYSICS_OBJECT, stroke_width=3)
        lens_curve2.move_to(RIGHT * 0.2)
        lens.add(lens_curve1, lens_curve2)

        # Optical center
        center_dot = Dot(RIGHT * 0.2, color=MUTED_COLOR, radius=0.05)
        o_label = Text("O", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
        o_label.next_to(center_dot, DOWN, buff=0.1)

        # Focus points
        f1 = Dot(LEFT * 1.5, color=PHYSICS_FORCE, radius=0.05)
        f1_label = Text("F_1", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        f1_label.next_to(f1, DOWN, buff=0.1)
        f2 = Dot(RIGHT * 2, color=PHYSICS_FORCE, radius=0.05)
        f2_label = Text("F_2", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        f2_label.next_to(f2, DOWN, buff=0.1)

        self.play(Create(lens), run_time=1)
        self.play(FadeIn(center_dot), Write(o_label), FadeIn(f1), Write(f1_label), FadeIn(f2), Write(f2_label), run_time=1)

        # Object
        obj = Arrow(LEFT * 3 + DOWN * 1, LEFT * 3 + UP * 0.5, color=PHYSICS_VELOCITY, buff=0, stroke_width=3)
        obj_label = Text("Object", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        obj_label.next_to(obj, UP, buff=0.1)

        self.play(GrowArrow(obj), Write(obj_label), run_time=0.5)

        # Ray 1: Parallel, refracts through F2
        ray1_in = Line(LEFT * 3 + UP * 0.5, RIGHT * 0.2 + UP * 0.5, color=PHYSICS_PATH, stroke_width=2)
        ray1_out = Line(RIGHT * 0.2 + UP * 0.5, RIGHT * 4 + DOWN * 1.5, color=PHYSICS_PATH, stroke_width=2)

        # Ray 2: Through center, continues straight
        ray2 = Line(LEFT * 3 + UP * 0.5, RIGHT * 3 + DOWN * 0.5, color=PHYSICS_ACCEL, stroke_width=2)

        self.play(Create(ray1_in), run_time=0.5)
        self.play(Create(ray1_out), run_time=0.5)
        self.play(Create(ray2), run_time=0.5)

        # Image
        img = Arrow(RIGHT * 3 + UP * 0.2, RIGHT * 3 + DOWN * 1.5, color=PHYSICS_FORCE, buff=0, stroke_width=3)
        img_label = Text("Image", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        img_label.next_to(img, DOWN, buff=0.1)

        self.play(GrowArrow(img), Write(img_label), run_time=0.5)

        insight = Text("Convex lens forms real, inverted image beyond F2", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class InterferenceFringes(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Interference Fringes", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\beta = \frac{\lambda D}{d}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # YDSE diagram
        # Slits
        slit1 = Rectangle(width=0.1, height=0.3, color=PHYSICS_OBJECT, fill_opacity=0.8)
        slit1.move_to(LEFT * 2 + UP * 0.3)
        slit2 = Rectangle(width=0.1, height=0.3, color=PHYSICS_OBJECT, fill_opacity=0.8)
        slit2.move_to(LEFT * 2 + DOWN * 0.3)

        slit_label = Text("Slits", font_size=SMALL_FONT_SIZE, color=PHYSICS_OBJECT)
        slit_label.next_to(LEFT * 2, LEFT, buff=0.2)

        # Screen
        screen = Line(RIGHT * 3 + UP * 2, RIGHT * 3 + DOWN * 2, color=MUTED_COLOR, stroke_width=2)
        screen_label = Text("Screen", font_size=SMALL_FONT_SIZE, color=MUTED_COLOR)
        screen_label.next_to(screen, RIGHT, buff=0.1)

        self.play(FadeIn(slit1), FadeIn(slit2), Write(slit_label), Create(screen), Write(screen_label), run_time=1)

        # Fringes on screen
        fringes = VGroup()
        for i in range(-5, 6):
            y = i * 0.3
            intensity = np.cos(i * np.pi / 2)**2
            if intensity > 0.5:
                fringe = Rectangle(width=0.05, height=0.25, color=PHYSICS_ENERGY, fill_opacity=intensity)
            else:
                fringe = Rectangle(width=0.05, height=0.25, color=PHYSICS_ENERGY, fill_opacity=0.1)
            fringe.move_to(RIGHT * 3 + UP * y)
            fringes.add(fringe)

        self.play(FadeIn(fringes), run_time=2)

        # Path difference
        path1 = DashedLine(slit1.get_center(), RIGHT * 3, color=PHYSICS_VELOCITY, stroke_width=1)
        path2 = DashedLine(slit2.get_center(), RIGHT * 3, color=PHYSICS_FORCE, stroke_width=1)

        self.play(Create(path1), Create(path2), run_time=1)

        # Central max
        central = Text("Central\nMaximum", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        central.next_to(RIGHT * 3, RIGHT, buff=0.3)

        self.play(Write(central), run_time=1)

        insight = Text("Bright fringes appear where path difference = nλ", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
