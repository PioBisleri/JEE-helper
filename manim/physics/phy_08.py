import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class IdealGasLaw(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Ideal Gas Law", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"PV = nRT", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("V").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("P").set_color(PHYSICS_FORCE)

        # Isotherms (P = nRT/V)
        colors = [PHYSICS_VELOCITY, PHYSICS_OBJECT, PHYSICS_FORCE]
        temps = ["T_1", "T_2", "T_3"]
        for i, (c, t) in enumerate(zip(colors, temps)):
            T = 2 + i * 1.5
            curve = axes.plot(lambda x, T=T: T / max(x, 0.5), x_range=[0.5, 8], color=c, stroke_width=2, stroke_opacity=0.8)
            label = MathTex(t, font_size=SMALL_FONT_SIZE, color=c)
            label.next_to(curve.get_end(), UP, buff=0.1)
            self.play(Create(curve), Write(label), run_time=1)

        # Show point moving along isotherm
        dot = Dot(color=PHYSICS_ENERGY, radius=0.1)
        v_tracker = ValueTracker(7)

        def update_dot(d):
            v = max(v_tracker.get_value(), 0.5)
            p = 3.5 / v
            d.move_to(axes.c2p(v, p))

        dot.add_updater(update_dot)
        self.add(dot)

        self.play(v_tracker.animate.set_value(1), run_time=ANIMATION_DURATION * 0.5, rate_func=smooth)
        dot.remove_updater(update_dot)

        insight = Text("Higher temperature = higher isotherm (more energy)", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class FirstLawThermo(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("First Law of Thermodynamics", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"dQ = dU + dW", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # PV diagram with process
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=5, y_length=3,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(LEFT * 2 + DOWN * 0.5)

        x_label = axes.get_x_axis_label("V").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("P").set_color(PHYSICS_FORCE)

        # Process path
        path = VMobject(color=PHYSICS_PATH, stroke_width=3)
        path.set_points_as_corners([axes.c2p(2, 2), axes.c2p(6, 2), axes.c2p(6, 6), axes.c2p(2, 2)])

        # Area = work
        area = Polygon(axes.c2p(2, 2), axes.c2p(6, 2), axes.c2p(6, 6), axes.c2p(2, 2), color=PHYSICS_ENERGY, fill_opacity=0.2, stroke_width=0)

        point1 = Dot(axes.c2p(2, 2), color=PHYSICS_OBJECT, radius=0.08)
        point2 = Dot(axes.c2p(6, 2), color=PHYSICS_VELOCITY, radius=0.08)
        point3 = Dot(axes.c2p(6, 6), color=PHYSICS_FORCE, radius=0.08)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(path), FadeIn(area), run_time=2)
        self.play(FadeIn(point1), FadeIn(point2), FadeIn(point3), run_time=0.5)

        # Energy terms
        terms = VGroup()
        term_data = [
            ("dQ = Heat in", PHYSICS_OBJECT, LEFT * 1 + DOWN * 2.5),
            ("dU = Internal energy change", PHYSICS_VELOCITY, ORIGIN + DOWN * 2.5),
            ("dW = Work done", PHYSICS_FORCE, RIGHT * 1.5 + DOWN * 2.5),
        ]

        for tex, color, pos in term_data:
            t = Text(tex, font_size=SMALL_FONT_SIZE, color=color)
            t.move_to(pos)
            terms.add(t)

        self.play(FadeIn(terms), run_time=1)

        insight = Text("Energy is conserved: heat = internal energy + work", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class CarnotCycle(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Carnot Cycle", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\eta = 1 - \frac{T_L}{T_H}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=5, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(LEFT * 2)

        x_label = axes.get_x_axis_label("V").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("P").set_color(PHYSICS_FORCE)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)

        # Carnot cycle points
        A = axes.c2p(2, 8)  # High P, Low V
        B = axes.c2p(6, 5)  # Lower P, High V
        C = axes.c2p(7, 2)  # Low P, Higher V
        D = axes.c2p(3, 3)  # Higher P, Low V

        # Isothermal expansion A->B (at T_H)
        iso1 = VMobject(color=PHYSICS_FORCE, stroke_width=3)
        iso1.set_points_smoothly([A, axes.c2p(4, 6.5), B])

        # Adiabatic expansion B->C
        adia1 = VMobject(color=PHYSICS_VELOCITY, stroke_width=3)
        adia1.set_points_smoothly([B, axes.c2p(6.5, 3.5), C])

        # Isothermal compression C->D (at T_L)
        iso2 = VMobject(color=PHYSICS_OBJECT, stroke_width=3)
        iso2.set_points_smoothly([C, axes.c2p(5, 2.5), D])

        # Adiabatic compression D->A
        adia2 = VMobject(color=PHYSICS_PATH, stroke_width=3)
        adia2.set_points_smoothly([D, axes.c2p(2.5, 5.5), A])

        # Labels
        labels = VGroup(
            Text("A", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD).next_to(A, UP, buff=0.1),
            Text("B", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD).next_to(B, RIGHT, buff=0.1),
            Text("C", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD).next_to(C, DOWN, buff=0.1),
            Text("D", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD).next_to(D, LEFT, buff=0.1),
        )

        self.play(Create(iso1), run_time=1.5)
        self.play(Create(adia1), run_time=1.5)
        self.play(Create(iso2), run_time=1.5)
        self.play(Create(adia2), run_time=1.5)
        self.play(FadeIn(labels), run_time=0.5)

        # Color legend
        legend = VGroup(
            Text("Isothermal", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE),
            Text("Adiabatic", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY),
        ).arrange(RIGHT, buff=1)
        legend.move_to(RIGHT * 3 + DOWN * 2)

        self.play(Write(legend), run_time=1)

        insight = Text("Carnot efficiency depends only on temperatures", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class IsothermalWork(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Isothermal Work", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"W = nRT \ln\frac{V_2}{V_1}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("V").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("P").set_color(PHYSICS_FORCE)

        # Isotherm
        isotherm = axes.plot(lambda x: 5 / max(x, 0.5), x_range=[0.8, 8], color=PHYSICS_OBJECT, stroke_width=3)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(isotherm), run_time=1.5)

        # Shaded area under curve (work)
        area = axes.get_area(isotherm, x_range=[2, 6], color=PHYSICS_ENERGY, opacity=0.3)
        area_label = Text("Area = Work", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        area_label.move_to(axes.c2p(4, 1.5))

        self.play(FadeIn(area), Write(area_label), run_time=2)

        # Show bounds
        v1_line = DashedLine(axes.c2p(2, 0), axes.c2p(2, 5), color=PHYSICS_VELOCITY, stroke_width=1)
        v2_line = DashedLine(axes.c2p(6, 0), axes.c2p(6, 5/6), color=PHYSICS_FORCE, stroke_width=1)
        v1_label = MathTex(r"V_1", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        v1_label.next_to(v1_line, DOWN, buff=0.1)
        v2_label = MathTex(r"V_2", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        v2_label.next_to(v2_line, DOWN, buff=0.1)

        self.play(Create(v1_line), Write(v1_label), Create(v2_line), Write(v2_label), run_time=1)

        insight = Text("Work in isothermal process depends on volume ratio", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
