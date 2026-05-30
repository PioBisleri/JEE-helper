import sys; sys.path.insert(0, '..'); from shared.config import *; from shared.themes import *


class DimensionalAnalysis(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Dimensional Analysis", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{km}{h} \times \frac{1000\,m}{1\,km} \times \frac{1\,h}{3600\,s} = \frac{m}{s}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Visual: unit boxes
        boxes = VGroup()
        labels_text = ["km", "h", "1000 m", "1 km", "1 h", "3600 s", "m/s"]
        colors = [PHYSICS_OBJECT, PHYSICS_OBJECT, PHYSICS_VELOCITY, PHYSICS_FORCE, PHYSICS_FORCE, PHYSICS_FORCE, PHYSICS_ENERGY]
        for i, (lt, c) in enumerate(zip(labels_text, colors)):
            rect = Rectangle(width=1.4, height=0.7, color=c, fill_opacity=0.15)
            t = Text(lt, font_size=SMALL_FONT_SIZE, color=c)
            box = VGroup(rect, t)
            boxes.add(box)
        boxes.arrange(RIGHT, buff=0.15)
        boxes.move_to(ORIGIN + DOWN * 1)

        self.play(FadeIn(boxes, shift=UP * 0.3), run_time=ANIMATION_DURATION * 0.4)

        # Animate conversion step by step
        arrows = VGroup()
        for i in range(len(boxes) - 1):
            arr = Arrow(boxes[i].get_right(), boxes[i + 1].get_left(), buff=0.05, color=PHYSICS_VELOCITY, stroke_width=2, max_tip_length_to_length_ratio=0.15)
            arrows.add(arr)
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.2), run_time=ANIMATION_DURATION * 0.4)

        # Highlight cancellation
        strike = Line(boxes[2].get_left(), boxes[3].get_right(), color=DANGER_COLOR, stroke_width=3)
        strike2 = Line(boxes[4].get_left(), boxes[5].get_right(), color=DANGER_COLOR, stroke_width=3)
        self.play(Create(strike), Create(strike2), run_time=1)

        result = MathTex(r"= \frac{1000}{3600} = 0.278\,m/s", font_size=FORMULA_FONT_SIZE, color=PHYSICS_VELOCITY)
        result.to_edge(DOWN, buff=0.5)
        self.play(Write(result), run_time=1)

        insight = Text("Dimensions must cancel to give the correct unit", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.next_to(result, DOWN, buff=0.3)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)


class ErrorPropagation(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        title = Text("Error Propagation", font_size=TITLE_FONT_SIZE, color=PHYSICS_OBJECT)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=TITLE_DURATION)

        formula = MathTex(r"\frac{\Delta Z}{Z} = \frac{\Delta A}{A} + \frac{\Delta B}{B}", font_size=FORMULA_FONT_SIZE, color=PHYSICS_ENERGY)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(formula), run_time=FORMULA_DURATION)

        # Bar chart showing error addition
        bar_a = Rectangle(width=0.8, height=1.5, color=PHYSICS_FORCE, fill_opacity=0.3)
        bar_a_label = Text("A: 3%", font_size=SMALL_FONT_SIZE, color=PHYSICS_FORCE)
        bar_a_label.next_to(bar_a, DOWN, buff=0.1)

        bar_b = Rectangle(width=0.8, height=2.0, color=PHYSICS_VELOCITY, fill_opacity=0.3)
        bar_b_label = Text("B: 4%", font_size=SMALL_FONT_SIZE, color=PHYSICS_VELOCITY)
        bar_b_label.next_to(bar_b, DOWN, buff=0.1)

        bar_z = Rectangle(width=0.8, height=3.5, color=PHYSICS_ENERGY, fill_opacity=0.3)
        bar_z_label = Text("Z: 7%", font_size=SMALL_FONT_SIZE, color=PHYSICS_ENERGY)
        bar_z_label.next_to(bar_z, DOWN, buff=0.1)

        group_a = VGroup(bar_a, bar_a_label).move_to(LEFT * 3 + DOWN * 0.5)
        group_b = VGroup(bar_b, bar_b_label).move_to(ORIGIN + DOWN * 0.5)
        group_z = VGroup(bar_z, bar_z_label).move_to(RIGHT * 3 + DOWN * 0.5)

        # Set bar heights from baseline
        bar_a.move_to(np.array([bar_a.get_x(), bar_a_label.get_y() + 0.35 + 1.5 / 2, 0]))
        bar_b.move_to(np.array([bar_b.get_x(), bar_b_label.get_y() + 0.35 + 2.0 / 2, 0]))
        bar_z.move_to(np.array([bar_z.get_x(), bar_z_label.get_y() + 0.35 + 3.5 / 2, 0]))

        plus1 = Text("+", font_size=TITLE_FONT_SIZE, color=PHYSICS_FIELD).move_to(LEFT * 1.5 + DOWN * 0.5)
        equals = Text("=", font_size=TITLE_FONT_SIZE, color=PHYSICS_FIELD).move_to(RIGHT * 1.5 + DOWN * 0.5)

        self.play(FadeIn(group_a, shift=UP * 0.5), run_time=1)
        self.play(FadeIn(group_b, shift=UP * 0.5), Write(plus1), run_time=1)
        self.play(FadeIn(group_z, shift=UP * 0.5), Write(equals), run_time=1)

        # Stacking animation
        copy_a = bar_a.copy().set_color(PHYSICS_ENERGY).set_fill(PHYSICS_ENERGY, 0.2)
        copy_b = bar_b.copy().set_color(PHYSICS_ENERGY).set_fill(PHYSICS_ENERGY, 0.2)
        copy_a.move_to(bar_z.get_bottom() + UP * 0.75)
        copy_b.next_to(copy_a, UP, buff=0)

        self.play(FadeOut(copy_a), FadeOut(copy_b), run_time=0.5)

        insight = Text("Errors ALWAYS add up in calculations", font_size=LABEL_FONT_SIZE, color=PHYSICS_FIELD)
        insight.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(insight), run_time=INSIGHT_DURATION)
        self.wait(1)
