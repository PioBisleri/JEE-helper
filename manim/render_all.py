#!/usr/bin/env python3
"""
Nexus JEE Manim - Master Render Script
Renders all animation scenes to .webm files and generates manifest.json.
"""

import os
import sys
import json
import subprocess
import importlib.util
from pathlib import Path

# Add manim directory to path
MANIM_DIR = Path(__file__).parent
sys.path.insert(0, str(MANIM_DIR))

# Output directory
OUTPUT_DIR = MANIM_DIR.parent / "public" / "animations"

# Scene registry: maps (subject, chapter_id) -> list of (scene_class_name, formula_id)
SCENE_REGISTRY = {
    # Physics
    ("physics", "phy_01"): [
        ("DimensionalAnalysis", "dimensional_analysis"),
        ("ErrorPropagation", "error_propagation"),
    ],
    ("physics", "phy_02"): [
        ("EquationsOfMotion", "equations_of_motion"),
        ("DisplacementTime", "displacement_time"),
        ("VelocityDisplacement", "velocity_displacement"),
        ("TimeOfFlight", "time_of_flight"),
        ("HorizontalRange", "horizontal_range"),
    ],
    ("physics", "phy_03"): [
        ("NewtonSecondLaw", "newton_second_law"),
        ("Friction", "friction"),
        ("CentripetalAcceleration", "centripetal_acceleration"),
        ("PseudoForce", "pseudo_force"),
    ],
    ("physics", "phy_04"): [
        ("WorkByForce", "work_by_force"),
        ("WorkEnergyTheorem", "work_energy_theorem"),
        ("PotentialEnergy", "potential_energy"),
        ("Power", "power"),
    ],
    ("physics", "phy_05"): [
        ("MomentOfInertia", "moment_of_inertia"),
        ("ParallelAxis", "parallel_axis"),
        ("AngularMomentum", "angular_momentum"),
        ("RollingMotion", "rolling_motion"),
    ],
    ("physics", "phy_06"): [
        ("GravitationalForce", "gravitational_force"),
        ("GravitationalPotential", "gravitational_potential"),
        ("EscapeVelocity", "escape_velocity"),
        ("OrbitalVelocity", "orbital_velocity"),
        ("KeplerThirdLaw", "kepler_third_law"),
    ],
    ("physics", "phy_07"): [
        ("StressStrain", "stress_strain"),
        ("FluidContinuity", "fluid_continuity"),
        ("BernoulliEquation", "bernoulli_equation"),
    ],
    ("physics", "phy_08"): [
        ("IdealGasLaw", "ideal_gas_law"),
        ("FirstLawThermo", "first_law_thermo"),
        ("CarnotCycle", "carnot_cycle"),
        ("IsothermalWork", "isothermal_work"),
    ],
    ("physics", "phy_09"): [
        ("SHMEquation", "shm_equation"),
        ("SHMPeriod", "shm_period"),
        ("WaveVelocity", "wave_velocity"),
        ("Superposition", "superposition"),
        ("DopplerEffect", "doppler_effect"),
    ],
    ("physics", "phy_10"): [
        ("CoulombsLaw", "coulombs_law"),
        ("ElectricField", "electric_field"),
        ("CapacitorCharging", "capacitor_charging"),
        ("GaussLaw", "gauss_law"),
    ],
    ("physics", "phy_11"): [
        ("OhmsLaw", "ohms_law"),
        ("RCDischarge", "rc_discharge"),
        ("ParallelResistance", "parallel_resistance"),
    ],
    ("physics", "phy_12"): [
        ("BiotSavart", "biot_savart"),
        ("LorentzForce", "lorentz_force"),
        ("MagneticDipole", "magnetic_dipole"),
    ],
    ("physics", "phy_13"): [
        ("MagneticFlux", "magnetic_flux"),
        ("FaradayLaw", "faraday_law"),
        ("LCROscillation", "lcr_oscillation"),
        ("ResonantFrequency", "resonant_frequency"),
    ],
    ("physics", "phy_14"): [
        ("MirrorFormula", "mirror_formula"),
        ("SnellsLaw", "snells_law"),
        ("LensFormula", "lens_formula"),
        ("InterferenceFringes", "interference_fringes"),
    ],
    ("physics", "phy_15"): [
        ("PhotoelectricEffect", "photoelectric_effect"),
        ("BohrOrbits", "bohr_orbits"),
        ("RadioactiveDecay", "radioactive_decay"),
    ],
    # Math
    ("maths", "math_01"): [
        ("VennDiagram", "venn_diagram"),
    ],
    ("maths", "math_02"): [
        ("ArgandPlane", "argand_plane"),
        ("EulerFormula", "euler_formula"),
        ("RootsOfUnity", "roots_of_unity"),
        ("DeMoivre", "de_moivre"),
    ],
    ("maths", "math_03"): [
        ("ParabolaCoefficients", "parabola_coefficients"),
        ("DiscriminantVisual", "discriminant_visual"),
        ("VertexForm", "vertex_form"),
        ("QuadraticFormula", "quadratic_formula"),
    ],
    ("maths", "math_04"): [
        ("APSequence", "ap_sequence"),
        ("GPSequence", "gp_sequence"),
        ("AMGMInequality", "amgm_inequality"),
    ],
    ("maths", "math_05"): [
        ("BinomialExpansion", "binomial_expansion"),
    ],
    ("maths", "math_06"): [
        ("Determinant2x2", "determinant_2x2"),
        ("LinearTransformation", "linear_transformation"),
    ],
    ("maths", "math_07"): [
        ("LimitApproach", "limit_approach"),
        ("SincLimit", "sinc_limit"),
        ("DerivativeAsLimit", "derivative_as_limit"),
    ],
    ("maths", "math_08"): [
        ("TangentLine", "tangent_line"),
        ("NormalLine", "normal_line"),
        ("MeanValueTheorem", "mean_value_theorem"),
        ("Extrema", "extrema"),
    ],
    ("maths", "math_09"): [
        ("AreaUnderCurve", "area_under_curve"),
        ("IntegrationByParts", "integration_by_parts"),
        ("InverseTrigIntegral", "inverse_trig_integral"),
        ("KingRule", "king_rule"),
    ],
    ("maths", "math_10"): [
        ("SeparableDE", "separable_de"),
        ("IntegratingFactor", "integrating_factor"),
    ],
    ("maths", "math_11"): [
        ("CircleEquation", "circle_equation"),
        ("ParabolaConic", "parabola_conic"),
        ("EllipseConic", "ellipse_conic"),
        ("DistancePointLine", "distance_point_line"),
    ],
    ("maths", "math_12"): [
        ("DotProduct", "dot_product"),
        ("CrossProduct", "cross_product"),
        ("VectorProjection", "vector_projection"),
        ("TripleProduct", "triple_product"),
    ],
    ("maths", "math_13"): [
        ("PlaneEquation", "plane_equation"),
        ("SkewLines", "skew_lines"),
    ],
    ("maths", "math_14"): [
        ("BayesTree", "bayes_tree"),
        ("BinomialDist", "binomial_dist"),
        ("ConditionalProb", "conditional_prob"),
    ],
    ("maths", "math_15"): [
        ("UnitCircle", "unit_circle"),
        ("DoubleAngle", "double_angle"),
        ("SumToProduct", "sum_to_product"),
        ("SineRule", "sine_rule"),
    ],
    # Chemistry
    ("chemistry", "chem_01"): [
        ("MoleConcept", "mole_concept"),
    ],
    ("chemistry", "chem_02"): [
        ("BohrOrbits", "bohr_orbits"),
        ("RydbergFormula", "rydberg_formula"),
        ("HeisenbergUncertainty", "heisenberg_uncertainty"),
        ("OrbitalShapes", "orbital_shapes"),
    ],
    ("chemistry", "chem_03"): [
        ("VSEPRGeometry", "vsepr_geometry"),
        ("MolecularOrbital", "molecular_orbital"),
        ("DipoleMoment", "dipole_moment"),
    ],
    ("chemistry", "chem_04"): [
        ("HessLawCycle", "hess_law_cycle"),
        ("EnthalpyLevels", "enthalpy_levels"),
        ("GibbsEnergy", "gibbs_energy"),
    ],
    ("chemistry", "chem_05"): [
        ("LeChatelierPrinciple", "le_chatelier_principle"),
        ("PHCurve", "ph_curve"),
        ("EquilibriumConstant", "equilibrium_constant"),
    ],
    ("chemistry", "chem_06"): [
        ("GalvanicCell", "galvanic_cell"),
        ("NernstEquation", "nernst_equation"),
        ("Electrolysis", "electrolysis"),
    ],
    ("chemistry", "chem_07"): [
        ("FirstOrderKinetics", "first_order_kinetics"),
        ("HalfLife", "half_life"),
        ("ArrheniusPlot", "arrhenius_plot"),
        ("RateLaws", "rate_laws"),
    ],
    ("chemistry", "chem_08"): [
        ("CrystalFieldSplitting", "crystal_field_splitting"),
        ("OctahedralGeometry", "octahedral_geometry"),
        ("MagneticMoment", "magnetic_moment"),
    ],
}

# Subject -> directory name mapping
SUBJECT_DIR = {
    "physics": "physics",
    "maths": "maths",
    "chemistry": "chemistry",
}


def render_scene(subject, chapter_id, scene_class_name, formula_id):
    """Render a single scene to .webm"""
    output_subdir = OUTPUT_DIR / subject / chapter_id
    output_subdir.mkdir(parents=True, exist_ok=True)

    output_file = output_subdir / f"{formula_id}.webm"
    if output_file.exists() and output_file.stat().st_size > 0:
        print(f"  [SKIP] {formula_id}.webm already exists")
        return str(output_file)

    script_dir = MANIM_DIR / SUBJECT_DIR[subject]
    script_file = script_dir / f"{chapter_id}.py"

    if not script_file.exists():
        print(f"  [ERROR] Script not found: {script_file}")
        return None

    # Render to default media location first, then move
    cmd = [
        sys.executable, "-m", "manim",
        "-ql",  # low quality for speed
        "--format", "webm",
        str(script_file),
        scene_class_name,
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,  # 2 min timeout per scene
            cwd=str(MANIM_DIR),
        )
        if result.returncode == 0:
            # Find the rendered file in media directory
            media_dir = MANIM_DIR / "media" / "videos" / chapter_id / "480p15"
            rendered_file = media_dir / f"{scene_class_name}.webm"
            if rendered_file.exists():
                import shutil
                shutil.move(str(rendered_file), str(output_file))
                print(f"  [OK] {formula_id}.webm")
                return str(output_file)
            else:
                print(f"  [FAIL] {formula_id}: Rendered file not found at {rendered_file}")
                return None
        else:
            print(f"  [FAIL] {formula_id}: {result.stderr[-200:]}")
            return None
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {formula_id}")
        return None
    except Exception as e:
        print(f"  [ERROR] {formula_id}: {e}")
        return None


def generate_manifest(rendered_files):
    """Generate manifest.json mapping formula IDs to video paths"""
    manifest = {}
    for (subject, chapter_id, formula_id), filepath in rendered_files.items():
        if filepath:
            manifest[f"{chapter_id}_{formula_id}"] = {
                "file": f"/animations/{subject}/{chapter_id}/{formula_id}.webm",
                "chapter": chapter_id,
                "subject": subject,
            }
    return manifest


def main():
    print("=" * 60)
    print("Nexus JEE Manim - Master Render")
    print("=" * 60)
    print()

    total = sum(len(scenes) for scenes in SCENE_REGISTRY.values())
    print(f"Total scenes to render: {total}")
    print()

    rendered = {}
    count = 0

    for (subject, chapter_id), scenes in SCENE_REGISTRY.items():
        print(f"\n--- {subject.upper()} / {chapter_id} ({len(scenes)} scenes) ---")
        for scene_class_name, formula_id in scenes:
            count += 1
            print(f"[{count}/{total}] Rendering {scene_class_name}...")
            filepath = render_scene(subject, chapter_id, scene_class_name, formula_id)
            rendered[(subject, chapter_id, formula_id)] = filepath

    # Generate manifest
    manifest = generate_manifest(rendered)
    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    # Summary
    success = sum(1 for v in rendered.values() if v)
    failed = total - success

    print()
    print("=" * 60)
    print(f"RENDER COMPLETE: {success}/{total} succeeded, {failed} failed")
    print(f"Manifest written to: {manifest_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
