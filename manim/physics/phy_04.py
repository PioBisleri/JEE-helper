import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class WorkByForce(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Work Done by Force", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"W = \int \vec{F} \cdot d\vec{s}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        axes = Axes(
            x_range=[0, 6, 1], y_range=[0, 8, 2],
            x_length=6, y_length=3.5,
            axis_config={"color": MUTED_COLOR, "include_numbers": True, "font_size": SMALL_FONT_SIZE},
            tips=True,
        ).move_to(DOWN * 0.8)

        x_label = axes.get_x_axis_label("s (m)").set_color(PHYSICS_VELOCITY)
        y_label = axes.get_y_axis_label("F (N)").set_color(PHYSICS_FORCE)

        # Constant force line
        force_line = axes.plot(lambda x: 4, x_range=[0, 5], color=PHYSICS_FORCE, stroke_width=3)
        force_label = MathTex(r"F = 4\,N", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        force_label.next_to(force_line.get_end(), UP, buff=0.1)

        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1)
        self.play(Create(force_line), Write(force_label), run_time=1)

        # Area under curve = work
        area = axes.get_area(force_line, x_range=[0, 4], color=PHYSICS_ENERGY, opacity=0.3)
        area_label = Text("Area = Work", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        area_label.move_to(area.get_center())

        work_val = MathTex(r"W = F \times s = 4 \times 4 = 16\,J", font_size=LABEL_FONT_SIZE, color=PHYSICS_ENERGY)
        work_val.to_edge(DOWN, buff=1.5)

        self.play(FadeIn(area), Write(area_label), run_time=2)
        self.play(Write(work_val), run_time=1)

        insight = Text("Work is the area under the force-displacement graph", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class WorkEnergyTheorem(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Work-Energy Theorem", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"W_{net} = \Delta KE = \frac{1}{2}mv^2 - \frac{1}{2}mu^2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Bar chart showing energy transformation
        bars = VGroup()
        labels = ["Initial KE", "Work Done", "Final KE"]
        heights = [1.5, 1.0, 2.5]
        bar_colors = [PHYSICS_OBJECT, PHYSICS_FORCE, PHYSICS_ENERGY]

        for i, (label, h, c) in enumerate(zip(labels, heights, bar_colors)):
            bar = Rectangle(width=1.5, height=h, color=c, fill_opacity=0.3, stroke_width=2)
            l = Text(label, font_size=SMALL_FONT_SIZE, color=c)
            v = MathTex(f"={['', '4J', '6J'][i]}" if i > 0 else "= 2J", font_size=SMALL_FONT_SIZE, color=c)
            v.next_to(bar, DOWN, buff=0.1)
            l.next_to(bar, UP, buff=0.1)
            bars.add(VGroup(bar, l, v))

        bars.arrange(RIGHT, buff=1)
        bars.move_to(DOWN * 0.5)

        plus = Text("+", font_size=TITLE_FONT_SIZE, color=PHYSICS_FIELD)
        plus.move_to(bars[0].get_right() + RIGHT * 0.3 + DOWN * 0.3)
        equals = Text("=", font_size=TITLE_FONT_SIZE, color=PHYSICS_FIELD)
        equals.move_to(bars[1].get_right() + RIGHT * 0.3 + DOWN * 0.3)

        self.play(FadeIn(bars[0]), run_time=1)
        self.play(Write(plus), FadeIn(bars[1]), run_time=1)
        self.play(Write(equals), FadeIn(bars[2]), run_time=1)

        # Highlight transformation
        arrow = Arrow(bars[0].get_center(), bars[2].get_center(), color=PHYSICS_VELOCITY, buff=0.5)
        self.play(GrowArrow(arrow), run_time=1)

        insight = Text("Net work equals change in kinetic energy", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class PotentialEnergy(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Potential Energy", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"PE = \frac{1}{2}kx^2", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Spring visualization
        spring_x = LEFT * 3
        wall = Rectangle(width=0.1, height=1, color=MUTED_COLOR, fill_opacity=0.5)
        wall.move_to(spring_x + LEFT * 0.5)

        # Spring coils
        spring = VMobject(color=PHYSICS_OBJECT, stroke_width=2)
        spring_pts = [spring_x]
        for i in range(8):
            x_off = 0.15 * (i + 1)
            y_off = 0.15 * (-1)**i
            spring_pts.append(spring_x + RIGHT * x_off + UP * y_off)
        spring_pts.append(spring_x + RIGHT * 1.3)
        spring.set_points_as_corners(spring_pts)

        # Mass
        mass = Rectangle(width=0.6, height=0.6, color=PHYSICS_OBJECT, fill_opacity=0.3)
        mass.move_to(spring_x + RIGHT * 1.6)

        spring_system = VGroup(wall, spring, mass)

        # Energy bar
        pe_bar = Rectangle(width=0.8, height=2, color=PHYSICS_ENERGY, fill_opacity=0.3)
        pe_bar.move_to(RIGHT * 2 + DOWN * 0.5)
        ke_bar = Rectangle(width=0.8, height=0.5, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        ke_bar.move_to(RIGHT * 3.2 + DOWN * 0.5)

        pe_label = Text("PE", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        pe_label.next_to(pe_bar, UP, buff=0.1)
        ke_label = Text("KE", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        ke_label.next_to(ke_bar, UP, buff=0.1)

        total = Text("Total = const", font_size=SMALL_FONT_SIZE, color=PHYSICS_FIELD)
        total.move_to(RIGHT * 2.6 + DOWN * 2.2)

        self.play(FadeIn(spring_system), run_time=0.5)
        self.play(FadeIn(pe_bar), Write(pe_label), FadeIn(ke_bar), Write(ke_label), Write(total), run_time=1)

        # Animate oscillation
        for _ in range(2):
            self.play(mass.animate.shift(RIGHT * 0.5), run_time=0.5, rate_func=smooth)
            # Swap bar heights
            self.play(
                pe_bar.animate.stretch_to_fit_height(0.5).move_to(RIGHT * 2 + DOWN * 0.5, aligned_edge=DOWN),
                ke_bar.animate.stretch_to_fit_height(2).move_to(RIGHT * 3.2 + DOWN * 0.5, aligned_edge=DOWN),
                run_time=0.5
            )
            self.play(mass.animate.shift(LEFT * 0.5), run_time=0.5, rate_func=smooth)
            self.play(
                pe_bar.animate.stretch_to_fit_height(2).move_to(RIGHT * 2 + DOWN * 0.5, aligned_edge=DOWN),
                ke_bar.animate.stretch_to_fit_height(0.5).move_to(RIGHT * 3.2 + DOWN * 0.5, aligned_edge=DOWN),
                run_time=0.5
            )

        insight = Text("Energy oscillates between kinetic and potential", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class Power(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Power", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"P = \frac{dW}{dt} = Fv", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Two objects - low power vs high power
        obj1 = Circle(radius=0.3, color=PHYSICS_OBJECT, fill_opacity=0.5)
        obj1.move_to(LEFT * 3 + DOWN * 1)
        obj2 = Circle(radius=0.3, color=PHYSICS_FORCE, fill_opacity=0.5)
        obj2.move_to(RIGHT * 3 + DOWN * 1)

        label1 = Text("Low Power", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        label1.next_to(obj1, UP, buff=0.3)
        label2 = Text("High Power", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        label2.next_to(obj2, UP, buff=0.3)

        # Force arrows (same force)
        f1 = Arrow(obj1.get_right(), obj1.get_right() + RIGHT * 0.8, color=PHYSICS_FORCE, buff=0)
        f2 = Arrow(obj2.get_right(), obj2.get_right() + RIGHT * 0.8, color=PHYSICS_FORCE, buff=0)

        # Velocity arrows (different)
        v1 = Arrow(obj1.get_top(), obj1.get_top() + UP * 0.5, color=PHYSICS_VELOCITY, buff=0)
        v2 = Arrow(obj2.get_top(), obj2.get_top() + UP * 1.5, color=PHYSICS_VELOCITY, buff=0)

        self.play(FadeIn(obj1), FadeIn(obj2), Write(label1), Write(label2), run_time=0.5)
        self.play(GrowArrow(f1), GrowArrow(f2), run_time=0.5)
        self.play(GrowArrow(v1), GrowArrow(v2), run_time=0.5)

        # Animate movement
        self.play(
            obj1.animate.shift(RIGHT * 2),
            obj2.animate.shift(RIGHT * 6),
            run_time=ANIMATION_DURATION * 0.6,
            rate_func=linear
        )

        power1 = MathTex(r"P_1 = Fv_{small}", font_size=LABEL_FONT_SIZE, color=PHYSICS_OBJECT)
        power1.move_to(LEFT * 3 + DOWN * 2.5)
        power2 = MathTex(r"P_2 = Fv_{large}", font_size=LABEL_FONT_SIZE, color=PHYSICS_FORCE)
        power2.move_to(RIGHT * 3 + DOWN * 2.5)

        self.play(Write(power1), Write(power2), run_time=1)

        insight = Text("Power is the rate at which work is done", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
