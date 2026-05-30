export const FORMULAS = {
  // Physics Formulas
  phy_01: [
    { name: "Dimensional Equation", latex: "[M^a L^b T^c]", desc: "Expression showing powers of fundamental units." },
    { name: "Percentage Error", latex: "\\frac{\\Delta x}{x} \\times 100", desc: "Relative error expressed as a percentage." },
    { name: "Error Propagation (Product/Division)", latex: "\\frac{\\Delta Z}{Z} = \\frac{\\Delta A}{A} + \\frac{\\Delta B}{B}", desc: "Relative errors add up for product or quotient $Z = AB$ or $Z = A/B$." },
    { name: "Error Propagation (Power)", latex: "\\frac{\\Delta Z}{Z} = k \\frac{\\Delta A}{A}", desc: "For $Z = A^k$, the power becomes a multiplier for fractional error." },
    { name: "Least Count of Vernier Calipers", latex: "LC = 1 \\text{ MSD} - 1 \\text{ VSD}", desc: "Smallest reading that can be measured accurately." }
  ],
  phy_02: [
    { name: "Equations of Motion (Constant Acceleration)", latex: "v = u + at", desc: "Velocity as a function of time." },
    { name: "Displacement-Time Relation", latex: "s = ut + \\frac{1}{2}at^2", desc: "Position under constant acceleration." },
    { name: "Velocity-Displacement Relation", latex: "v^2 = u^2 + 2as", desc: "Relates velocity and displacement." },
    { name: "Time of Flight (Projectile Motion)", latex: "T = \\frac{2u \\sin\\theta}{g}", desc: "Total time a projectile remains in air." },
    { name: "Horizontal Range", latex: "R = \\frac{u^2 \\sin(2\\theta)}{g}", desc: "Maximum horizontal distance travelled by projectile." }
  ],
  phy_03: [
    { name: "Newton's Second Law", latex: "\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a}", desc: "Force is rate of change of momentum." },
    { name: "Static Friction", latex: "f_s \\le \\mu_s N", desc: "Frictional resistance before motion starts." },
    { name: "Kinetic Friction", latex: "f_k = \\mu_k N", desc: "Friction acting on a moving body." },
    { name: "Centripetal Acceleration", latex: "a_c = \\frac{v^2}{r} = \\omega^2 r", desc: "Acceleration towards centre in circular motion." },
    { name: "Pseudo Force", latex: "\\vec{F}_{pseudo} = -m\\vec{a}_0", desc: "Force acting on mass $m$ in frame accelerating at $\\vec{a}_0$." }
  ],
  phy_04: [
    { name: "Work Done by Variable Force", latex: "W = \\int \\vec{F} \\cdot d\\vec{r}", desc: "Integral of force over displacement." },
    { name: "Work-Energy Theorem", latex: "W_{net} = \\Delta K = K_f - K_i", desc: "Net work done equals change in kinetic energy." },
    { name: "Potential Energy & Conservative Force", latex: "F = -\\frac{dU}{dx}", desc: "Force is negative gradient of potential energy." },
    { name: "Coefficient of Restitution", latex: "e = \\frac{v_2 - v_1}{u_1 - u_2}", desc: "Ratio of relative velocity of separation to approach." },
    { name: "Instantaneous Power", latex: "P = \\vec{F} \\cdot \\vec{v}", desc: "Rate of doing work." }
  ],
  phy_05: [
    { name: "Moment of Inertia", latex: "I = \\sum m_i r_i^2 = \\int r^2 dm", desc: "Rotational equivalent of mass." },
    { name: "Parallel Axis Theorem", latex: "I = I_{cm} + Md^2", desc: "Moment of inertia about parallel axis at distance $d$." },
    { name: "Torque-Angular Acceleration Relation", latex: "\\vec{\\tau} = I\\vec{\\alpha}", desc: "Rotational equivalent of $\\vec{F} = m\\vec{a}$." },
    { name: "Angular Momentum", latex: "\\vec{L} = I\\vec{\\omega} = \\vec{r} \\times \\vec{p}", desc: "Measure of rotational momentum." },
    { name: "Kinetic Energy of Rolling Body", latex: "K = \\frac{1}{2}mv_{cm}^2 + \\frac{1}{2}I_{cm}\\omega^2", desc: "Sum of translational and rotational kinetic energy." }
  ],
  phy_06: [
    { name: "Newton's Gravitational Force", latex: "F = G \\frac{m_1 m_2}{r^2}", desc: "Attractive force between two point masses." },
    { name: "Gravitational Potential Energy", latex: "U = -\\frac{G M m}{r}", desc: "Energy stored due to gravitational field." },
    { name: "Escape Velocity", latex: "v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR}", desc: "Minimum speed needed to escape gravity." },
    { name: "Orbital Velocity", latex: "v_o = \\sqrt{\\frac{GM}{r}}", desc: "Speed of satellite in circular orbit." },
    { name: "Kepler's Third Law", latex: "T^2 \\propto r^3", desc: "Square of time period is proportional to cube of orbit radius." }
  ],
  phy_07: [
    { name: "Young's Modulus", latex: "Y = \\frac{\\text{Stress}}{\\text{Strain}} = \\frac{F/A}{\\Delta L/L}", desc: "Measure of tensile elasticity." },
    { name: "Hydrostatic Pressure", latex: "P = P_0 + \\rho gh", desc: "Pressure in fluid of density $\\rho$ at depth $h$." },
    { name: "Equation of Continuity", latex: "A_1 v_1 = A_2 v_2", desc: "Conservation of mass flow in steady fluid dynamics." },
    { name: "Bernoulli's Equation", latex: "P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{Constant}", desc: "Conservation of energy in ideal fluid flow." },
    { name: "Surface Tension Excess Pressure", latex: "\\Delta P = \\frac{2T}{R} \\text{ (bubble: } \\frac{4T}{R}\\text{)}", desc: "Difference in pressure across curved interface." }
  ],
  phy_08: [
    { name: "Ideal Gas Law", latex: "PV = nRT", desc: "Equation of state of ideal gas." },
    { name: "First Law of Thermodynamics", latex: "dQ = dU + dW", desc: "Energy conservation statement: Heat = Change in Internal Energy + Work Done." },
    { name: "Internal Energy of Ideal Gas", latex: "U = \\frac{f}{2}nRT", desc: "Internal energy depends on degrees of freedom $f$." },
    { name: "Work Done in Isothermal Process", latex: "W = nRT \\ln\\left(\\frac{V_f}{V_i}\\right)", desc: "Work done during constant temperature expansion." },
    { name: "Carnot Engine Efficiency", latex: "\\eta = 1 - \\frac{T_C}{T_H}", desc: "Maximum efficiency of thermodynamic cycle between $T_H$ and $T_C$." }
  ],
  phy_09: [
    { name: "SHM Equation", latex: "x = A \\sin(\\omega t + \\phi)", desc: "Position in simple harmonic motion." },
    { name: "SHM Time Period (Spring-Mass)", latex: "T = 2\\pi \\sqrt{\\frac{m}{k}}", desc: "Period of oscillation of spring mass system." },
    { name: "SHM Energy", latex: "E = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2", desc: "Total mechanical energy is constant." },
    { name: "Wave Velocity", latex: "v = f\\lambda", desc: "Speed of wave propagation." },
    { name: "Doppler Effect (Sound)", latex: "f' = f \\left(\\frac{v \\pm v_o}{v \\mp v_s}\\right)", desc: "Apparent frequency due to relative motion of observer and source." }
  ],
  phy_10: [
    { name: "Coulomb's Law", latex: "F = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2}", desc: "Electrostatic force between two charges." },
    { name: "Electric Field of Point Charge", latex: "E = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2}", desc: "Field intensity at distance $r$." },
    { name: "Electric Potential", latex: "V = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r}", desc: "Work needed to bring unit charge from infinity." },
    { name: "Gauss's Law", latex: "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\varepsilon_0}", desc: "Net electric flux through a closed surface." },
    { name: "Capacitance (Parallel Plate)", latex: "C = \\frac{\\varepsilon_0 A}{d}", desc: "Charge storage capability per unit potential difference." }
  ],
  phy_11: [
    { name: "Ohm's Law", latex: "V = IR", desc: "Voltage is proportional to current under constant parameters." },
    { name: "Resistivity & Temperature", latex: "\\rho = \\rho_0(1 + \\alpha\\Delta T)", desc: "Resistance dependence on temperature." },
    { name: "Kirchhoff's Voltage Law (KVL)", latex: "\\sum V = 0", desc: "Sum of voltage drops in a closed loop is zero." },
    { name: "Equivalent Resistance (Parallel)", latex: "\\frac{1}{R_{eq}} = \\sum \\frac{1}{R_i}", desc: "Reciprocals add for parallel connections." },
    { name: "RC Discharging Circuit", latex: "q(t) = q_0 e^{-t/RC}", desc: "Charge decay as a function of time." }
  ],
  phy_12: [
    { name: "Biot-Savart Law", latex: "d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I(d\\vec{l} \\times \\hat{r})}{r^2}", desc: "Magnetic field produced by a current element." },
    { name: "Ampere's Law", latex: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{encl}", desc: "Integral of magnetic field along closed loop." },
    { name: "Lorentz Force", latex: "\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})", desc: "Total electromagnetic force on moving charge." },
    { name: "Magnetic Force on Wire", latex: "\\vec{F} = I(\\vec{L} \\times \\vec{B})", desc: "Force on conductor carrying current in magnetic field." },
    { name: "Magnetic Dipole Moment", latex: "\\vec{M} = NI\\vec{A}", desc: "Magnetic strength of loop of area $A$ and turns $N$." }
  ],
  phy_13: [
    { name: "Magnetic Flux", latex: "\\Phi_B = \\vec{B} \\cdot \\vec{A} = BA\\cos\\theta", desc: "Measure of magnetic field passing through area." },
    { name: "Faraday's Law of Induction", latex: "\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}", desc: "Induced EMF is rate of change of flux." },
    { name: "Self Inductance Induced EMF", latex: "\\mathcal{E} = -L \\frac{dI}{dt}", desc: "EMF induced in coil due to its own changing current." },
    { name: "Impedance in LCR Circuit", latex: "Z = \\sqrt{R^2 + (X_L - X_C)^2}", desc: "Total AC resistance of induction coil, capacitor, resistor." },
    { name: "Resonant Frequency", latex: "f_r = \\frac{1}{2\\pi\\sqrt{LC}}", desc: "Frequency where reactance becomes zero ($X_L = X_C$)." }
  ],
  phy_14: [
    { name: "Mirror Formula", latex: "\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}", desc: "Relation between object distance, image distance, focal length." },
    { name: "Snell's Law of Refraction", latex: "\\mu_1 \\sin i = \\mu_2 \\sin r", desc: "Bending of light across boundary." },
    { name: "Lens Maker's Formula", latex: "\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)", desc: "Focal length in terms of refractive index and radii." },
    { name: "Fringe Width (YDSL)", latex: "\\beta = \\frac{\\lambda D}{d}", desc: "Distance between consecutive bright/dark fringes." },
    { name: "Brewster's Law", latex: "\\mu = \\tan\\theta_p", desc: "Angle of polarization for complete reflection." }
  ],
  phy_15: [
    { name: "Photoelectric Equation", latex: "K_{max} = h\\nu - \\phi", desc: "Einstein's relation: Kinetic energy = photon energy - work function." },
    { name: "de Broglie Wavelength", latex: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}", desc: "Wavelength of wave associated with moving particle." },
    { name: "Bohr Quantized Energy", latex: "E_n = -13.6 \\frac{Z^2}{n^2} \\text{ eV}", desc: "Allowed energy levels of hydrogen-like atom." },
    { name: "Radioactive Decay Law", latex: "N(t) = N_0 e^{-\\lambda t}", desc: "Number of undecayed nuclei at time $t$." },
    { name: "Einstein Mass-Energy equivalence", latex: "E = \\Delta m c^2", desc: "Mass converted into binding energy." }
  ],

  // Chemistry Formulas & Equations
  chem_01: [
    { name: "Mole Formula", latex: "n = \\frac{\\text{Weight}}{\\text{Molar Mass}} = \\frac{N}{N_A}", desc: "Relates quantity of substance to particles." },
    { name: "Molarity", latex: "M = \\frac{\\text{Moles of solute}}{\\text{Volume of solution in Litres}}", desc: "Concentration in moles per litre." },
    { name: "Molality", latex: "m = \\frac{\\text{Moles of solute}}{\\text{Mass of solvent in kg}}", desc: "Concentration in moles per kg of solvent." },
    { name: "Mole Fraction", latex: "\\chi_A = \\frac{n_A}{n_A + n_B}", desc: "Ratio of moles of one component to total moles." },
    { name: "Ideal Gas Volume at STP", latex: "V = n \\times 22.7 \\text{ L}", desc: "Standard volume occupied by one mole of ideal gas." }
  ],
  chem_02: [
    { name: "Bohr Radius of Orbit", latex: "r_n = 0.529 \\frac{n^2}{Z} \\text{ }\\mathring{\\text{A}}", desc: "Radius of electron orbit in hydrogen-like atoms." },
    { name: "Rydberg Formula", latex: "\\frac{1}{\\lambda} = R_H Z^2 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)", desc: "Wavelength of spectral lines in hydrogen-like transitions." },
    { name: "Heisenberg Uncertainty Principle", latex: "\\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}", desc: "Impossibility of measuring position and momentum simultaneously." },
    { name: "de Broglie relation (Energy)", latex: "\\lambda = \\frac{h}{\\sqrt{2mK}}", desc: "Wavelength in terms of kinetic energy." },
    { name: "Quantum Numbers Node Formula", latex: "\\text{Radial nodes} = n - l - 1", desc: "Number of spherical nodes in shell." }
  ],
  chem_03: [
    { name: "Dipole Moment", latex: "\\mu = q \\times d", desc: "Separation of charge multiplied by distance." },
    { name: "Formal Charge", latex: "\\text{FC} = V - L - \\frac{1}{2}S", desc: "Valence electrons minus lone pair minus half bond pair." },
    { name: "Bond Order (MOT)", latex: "\\text{BO} = \\frac{N_b - N_a}{2}", desc: "Bond strength indicator: half bonding minus antibonding electrons." },
    { name: "Hybridization steric number", latex: "SN = V + M - C + A", desc: "Valence + Monovalent - Cation + Anion divided by 2 to determine hybridization." },
    { name: "Born-Haber Lattice Energy Cycle", latex: "\\Delta H_f = \\Delta H_{sub} + IE + \\Delta H_{diss} - EA - U_0", desc: "Enthalpy breakdown for ionic solid formation." }
  ],
  chem_04: [
    { name: "Enthalpy Change", latex: "\\Delta H = \\Delta U + P\\Delta V = \\Delta U + \\Delta n_g RT", desc: "Heat exchange at constant pressure." },
    { name: "Hess's Law of Constant Heat Summation", latex: "\\Delta H_{total} = \\sum \\Delta H_i", desc: "Total enthalpy change is independent of route." },
    { name: "Gibbs Free Energy Equation", latex: "\\Delta G = \\Delta H - T\\Delta S", desc: "Relates enthalpy, temperature, and entropy." },
    { name: "Gibbs Energy & Equilibrium", latex: "\\Delta G^\\circ = -RT \\ln K_{eq}", desc: "Free energy in relation to equilibrium constant." },
    { name: "Heat Capacity Relation", latex: "C_p - C_v = R", desc: "Difference between constant pressure and volume heat capacities." }
  ],
  chem_05: [
    { name: "Equilibrium Constant Relation", latex: "K_p = K_c(RT)^{\\Delta n_g}", desc: "Connects gas phase equilibrium pressure and molar concentration constants." },
    { name: "Henderson-Hasselbalch (Acid Buffer)", latex: "\\text{pH} = \\text{p}K_a + \\log\\frac{[\\text{Conjugate Base}]}{[\\text{Acid}]}", desc: "Calculates pH of acid buffer solutions." },
    { name: "pH definition", latex: "\\text{pH} = -\\log_{10}[H^+]", desc: "Negative logarithm of hydrogen ion activity." },
    { name: "Solubility Product", latex: "K_{sp} = [A^{y+}]^x [B^{x-}]^y", desc: "Equilibrium constant for dissolving ionic compound." },
    { name: "Ionic Product of Water", latex: "K_w = [H^+][OH^-] = 10^{-14} \\text{ at } 298\\text{K}", desc: "Dissociation equilibrium of pure water." }
  ],
  chem_06: [
    { name: "Standard EMF of Cell", latex: "E^\\circ_{cell} = E^\\circ_{cathode} - E^\\circ_{anode}", desc: "Standard potential difference of electrochemical cell." },
    { name: "Nernst Equation", latex: "E = E^\\circ - \\frac{0.0591}{n} \\log_{10} Q", desc: "Electrode potential dependency on concentration at 298K." },
    { name: "Gibbs Free Energy and EMF", latex: "\\Delta G = -nFE_{cell}", desc: "Electrical work obtained from cell." },
    { name: "Faraday's First Law of Electrolysis", latex: "w = Z I t = \\left(\\frac{\\text{Eq. weight}}{96500}\\right) I t", desc: "Mass deposited at electrode during electrolysis." },
    { name: "Kohlrausch's Law", latex: "\\Lambda_m^\\infty = \\nu_+ \\lambda_+^\\infty + \\nu_- \\lambda_-^\\infty", desc: "Equivalent conductivity of electrolyte at infinite dilution." }
  ],
  chem_07: [
    { name: "First-Order Integrated Rate Law", latex: "k = \\frac{2.303}{t} \\log\\frac{[A]_0}{[A]_t}", desc: "Relates concentration and time for 1st order reaction." },
    { name: "Half-Life of First-Order Reaction", latex: "t_{1/2} = \\frac{0.693}{k}", desc: "Time required to consume half of initial reactant concentration." },
    { name: "Arrhenius Equation", latex: "k = A e^{-E_a/RT}", desc: "Reaction rate constant temperature dependency." },
    { name: "Zero-Order Half-Life", latex: "t_{1/2} = \\frac{[A]_0}{2k}", desc: "Half life for zero-order kinetics." },
    { name: "Activation Energy Relation", latex: "\\log\\frac{k_2}{k_1} = \\frac{E_a}{2.303R}\\left(\\frac{T_2 - T_1}{T_1 T_2}\\right)", desc: "Calculate activation energy $E_a$ from rates at two temperatures." }
  ],
  chem_08: [
    { name: "Effective Atomic Number (EAN)", latex: "\\text{EAN} = Z - \\text{Oxidation State} + 2\\times\\text{Coordination Number}", desc: "Total electrons around metal centre." },
    { name: "Crystal Field Stabilization Energy (Octahedral)", latex: "\\text{CFSE} = -0.4n_{t2g} + 0.6n_{eg} + nP", desc: "Energy gain from splitting in octahedral geometry." },
    { name: "Magnetic Moment (Spin-only)", latex: "\\mu_s = \\sqrt{n(n+2)} \\text{ BM}", desc: "Magnetic strength based on $n$ unpaired electrons." },
    { name: "Werner's Primary Valence", latex: "\\text{Valence} = \\text{Oxidation state of metal}", desc: "Ionizable valence of complex." },
    { name: "Spectrochemical Series order", latex: "I^- < Br^- < S^{2-} < Cl^- < F^- < OH^- < H_2O < NH_3 < en < CN^- < CO", desc: "Strength of ligands to split d orbitals." }
  ],
  chem_09: [
    { name: "Inductive Effect Direction", latex: "-I: NO_2 > CN > COOH > F > Cl", desc: "Order of electron withdrawing groups by electronegativity." },
    { name: "Resonance Energy", latex: "\\text{RE} = \\text{Experimental Heat of Combustion} - \\text{Calculated Heat}", desc: "Stability gained through electron delocalization." },
    { name: "Electrophilic Addition Rule", latex: "\\text{Markownikoff's Rule}", desc: "Addition to unsymmetrical alkene: H goes to carbon with more H's." },
    { name: "Hyperconjugation Structure Count", latex: "\\text{Structures} = \\alpha\\text{-H atoms} + 1", desc: "Delocalization structures in carbocations or alkenes." },
    { name: "Nucleophilic Substitution", latex: "\\text{S}_N1 \\text{ rate } \\propto [\\text{substrate}], \\text{ S}_N2 \\text{ rate } \\propto [\\text{sub}][\\text{nuc}]", desc: "Comparison of substitution reaction orders." }
  ],
  chem_10: [
    { name: "Wurtz Reaction", latex: "2R-X + 2Na \\xrightarrow{\\text{dry ether}} R-R + 2NaX", desc: "Symmetrical alkane synthesis from alkyl halide." },
    { name: "Ozonolysis", latex: "R-CH=CH-R' \\xrightarrow[2. Zn/H_2O]{1. O_3} R-CHO + R'-CHO", desc: "Cleavage of double bond into carbonyl products." },
    { name: "Friedel-Crafts Alkylation", latex: "C_6H_6 + R-Cl \\xrightarrow{\\text{anhyd. } AlCl_3} C_6H_5-R + HCl", desc: "Electrophilic aromatic substitution of benzene with alkyl group." },
    { name: "Hydroboration-Oxidation", latex: "R-CH=CH_2 \\xrightarrow[2. H_2O_2/OH^-]{1. B_2H_6} R-CH_2-CH_2-OH", desc: "Anti-Markownikoff addition of water to alkene." },
    { name: "Markovnikov Carbocation Stabilities", latex: "3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}", desc: "Stability order of carbocation intermediates." }
  ],
  chem_11: [
    { name: "Williamson Ether Synthesis", latex: "R-O^-Na^+ + R'-X \\rightarrow R-O-R' + NaX", desc: "Nucleophilic substitution (SN2) yielding ether." },
    { name: "Aldol Condensation", latex: "2 R-CH_2-CHO \\xrightarrow{\\text{dil. } NaOH} R-CH_2-CH(OH)-CH(R)-CHO", desc: "Carbon-carbon bond formation involving enolate and carbonyl." },
    { name: "Cannizzaro Reaction", latex: "2 HCHO \\xrightarrow{\\text{conc. } KOH} CH_3OH + HCOOK", desc: "Disproportionation of aldehydes lacking alpha-hydrogens." },
    { name: "Hinsberg Reagent Test", latex: "\\text{C}_6\\text{H}_5\\text{SO}_2\\text{Cl}", desc: "Distinguishes primary, secondary, and tertiary amines." },
    { name: "Esterification", latex: "R-COOH + R'-OH \\xrightarrow{H^+} R-COOR' + H_2O", desc: "Acid-catalyzed formation of ester from acid and alcohol." }
  ],
  chem_12: [
    { name: "Glucose Open-Chain Structure", latex: "C_6H_{12}O_6 \\text{ (aldohexose)}", desc: "D-glucose structure containing aldehyde and five hydroxyls." },
    { name: "Isoelectric Point of Amino Acid", latex: "\\text{pI} = \\frac{\\text{p}K_{a1} + \\text{p}K_{a2}}{2}", desc: "pH where amino acid exists as zwitterion with net charge zero." },
    { name: "Peptide Bond Linkage", latex: "-CO-NH-", desc: "Amide linkage connecting amino acids in proteins." },
    { name: "Nucleotide Composition", latex: "\\text{Base} + \\text{Sugar} + \\text{Phosphate}", desc: "Monomer units composing DNA and RNA." },
    { name: "Polymerization (Ziegler-Natta)", latex: "n CH_2=CH_2 \\xrightarrow{TiCl_4/Al(Et)_3} \\text{HDPE}", desc: "Catalyzed linear polymer synthesis for High Density Polyethylene." }
  ],

  // Mathematics Formulas
  math_01: [
    { name: "De Morgan's Laws", latex: "(A \\cup B)' = A' \\cap B'", desc: "Complement of union is intersection of complements." },
    { name: "Number of Elements in Union", latex: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)", desc: "Addition formula for two finite sets." },
    { name: "Composite Function Derivative", latex: "(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)", desc: "Chain rule derivative representation." },
    { name: "Inverse Function Condition", latex: "f(f^{-1}(x)) = x", desc: "Exists if function is both one-to-one (injective) and onto (surjective)." },
    { name: "Total Relations Number", latex: "N = 2^{mn}", desc: "Relations from set of size $m$ to set of size $n$." }
  ],
  math_02: [
    { name: "Modulus of Complex Number", latex: "|z| = \\sqrt{x^2 + y^2}", desc: "Distance of complex number from origin." },
    { name: "Euler's Formula", latex: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta", desc: "Exponential representation of complex numbers." },
    { name: "De Moivre's Theorem", latex: "(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)", desc: "Formula for raising complex number to integer power $n$." },
    { name: "Cube Roots of Unity", latex: "1, \\omega, \\omega^2 \\text{ where } 1+\\omega+\\omega^2=0", desc: "Roots of equation $x^3 - 1 = 0$." },
    { name: "Triangle Inequality", latex: "|z_1 + z_2| \\le |z_1| + |z_2|", desc: "Modulus of sum is less than or equal to sum of moduli." }
  ],
  math_03: [
    { name: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", desc: "Roots of general quadratic equation $ax^2 + bx + c = 0$." },
    { name: "Sum and Product of Roots", latex: "\\alpha + \\beta = -\\frac{b}{a}, \\text{ } \\alpha\\beta = \\frac{c}{a}", desc: "Relations between coefficients and roots." },
    { name: "Discriminant & Nature of Roots", latex: "D = b^2 - 4ac", desc: "Real roots if $D \\ge 0$, imaginary roots if $D < 0$." },
    { name: "Condition for Common Root", latex: "(a_1 b_2 - a_2 b_1)(b_1 c_2 - b_2 c_1) = (c_1 a_2 - c_2 a_1)^2", desc: "For equations $a_1x^2+b_1x+c_1=0$ and $a_2x^2+b_2x+c_2=0$." },
    { name: "Vertex of Parabola (Quadratic)", latex: "x_{min/max} = -\\frac{b}{2a}, \\text{ } y_{min/max} = -\\frac{D}{4a}", desc: "Coordinates of vertex." }
  ],
  math_04: [
    { name: "AP n-th Term", latex: "a_n = a + (n-1)d", desc: "Term value in arithmetic progression." },
    { name: "AP Sum of n Terms", latex: "S_n = \\frac{n}{2}[2a + (n-1)d]", desc: "Summation of arithmetic progression." },
    { name: "GP n-th Term", latex: "a_n = a r^{n-1}", desc: "Term value in geometric progression." },
    { name: "Infinite GP Sum", latex: "S_\\infty = \\frac{a}{1-r} \\text{ for } |r| < 1", desc: "Sum of geometric progression to infinity." },
    { name: "AM-GM-HM Inequality", latex: "AM \\ge GM \\ge HM", desc: "Relates arithmetic, geometric, and harmonic means." }
  ],
  math_05: [
    { name: "Permutations Formula", latex: "^nP_r = \\frac{n!}{(n-r)!}", desc: "Arrangement of $r$ objects from $n$ distinct objects." },
    { name: "Combinations Formula", latex: "^nC_r = \\frac{n!}{r!(n-r)!}", desc: "Selection of $r$ objects from $n$ distinct objects." },
    { name: "Binomial Expansion Theorem", latex: "(x+y)^n = \\sum_{r=0}^n {^nC_r} x^{n-r} y^r", desc: "Expanding powers of binomials." },
    { name: "General Term in Binomial", latex: "T_{r+1} = {^nC_r} x^{n-r} y^r", desc: "Value of $(r+1)$-th term in expansion." },
    { name: "Binomial Coefficients sum", latex: "\\sum_{r=0}^n {^nC_r} = 2^n", desc: "Sum of coefficients of order $n$." }
  ],
  math_06: [
    { name: "Determinant of 2x2 Matrix", latex: "\\det(A) = ad - bc", desc: "Scalar value computed for matrix $\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$." },
    { name: "Inverse of Matrix", latex: "A^{-1} = \\frac{1}{|A|} \\text{adj}(A)", desc: "Multiplicative inverse of matrix $A$." },
    { name: "Cramer's Rule for System", latex: "x = \\frac{D_x}{D}, y = \\frac{D_y}{D}, z = \\frac{D_z}{D}", desc: "Solution to system of linear equations using determinants." },
    { name: "Properties of Determinants", latex: "|kA| = k^n|A|", desc: "For $n\\times n$ matrix $A$, scaling scales determinant by $k^n$." },
    { name: "Product Determinant", latex: "|AB| = |A||B|", desc: "Determinant of product is product of determinants." }
  ],
  math_07: [
    { name: "L'Hopital's Rule", latex: "\\lim_{x\\rightarrow c}\\frac{f(x)}{g(x)} = \\lim_{x\\rightarrow c}\\frac{f'(x)}{g'(x)}", desc: "Evaluation of limit under indeterminate forms $0/0$ or $\\infty/\\infty$." },
    { name: "Standard Limit (Sinc)", latex: "\\lim_{x\\rightarrow 0} \\frac{\\sin x}{x} = 1", desc: "Fundamental trigonometric limit." },
    { name: "Standard Limit (Exponential)", latex: "\\lim_{x\\rightarrow 0} \\frac{e^x - 1}{x} = 1", desc: "Fundamental exponential limit." },
    { name: "Derivative of Product (Product Rule)", latex: "(uv)' = u'v + uv'", desc: "Derivative of product of two functions." },
    { name: "Derivative of Quotient", latex: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}", desc: "Derivative of quotient of two functions." }
  ],
  math_08: [
    { name: "Equation of Tangent", latex: "y - y_1 = m(x - x_1) \\text{ where } m = f'(x_1)", desc: "Straight line touching curve at point $(x_1, y_1)$." },
    { name: "Equation of Normal", latex: "y - y_1 = -\\frac{1}{m}(x - x_1)", desc: "Straight line perpendicular to tangent." },
    { name: "Mean Value Theorem (Lagrange)", latex: "f'(c) = \\frac{f(b) - f(a)}{b-a}", desc: "Instaneous rate equals average rate in interval." },
    { name: "Critical Points (Monotonicity)", latex: "f'(x) \\ge 0 \\Rightarrow \\text{Increasing}", desc: "Sign of first derivative determines behavior." },
    { name: "Second Derivative Test (Extrema)", latex: "f'(c) = 0 \\text{ and } f''(c) < 0 \\Rightarrow \\text{Local Maxima}", desc: "Classify turning points using curvature." }
  ],
  math_09: [
    { name: "Integration by Parts", latex: "\\int u \\, dv = uv - \\int v \\, du", desc: "Integration version of product rule." },
    { name: "Newton-Leibniz Formula", latex: "\\int_a^b f(x) dx = F(b) - F(a)", desc: "Definite integral evaluation via antiderivative." },
    { name: "Definite Integral Property (King's Rule)", latex: "\\int_a^b f(x) dx = \\int_a^b f(a+b-x) dx", desc: "Integral value is unchanged under substitution $x \\rightarrow a+b-x$." },
    { name: "Standard Integral (Inverse Trig)", latex: "\\int \\frac{dx}{\\sqrt{a^2 - x^2}} = \\sin^{-1}\\left(\\frac{x}{a}\\right) + C", desc: "Anti-derivative yielding arcsin." },
    { name: "Standard Integral (Rational)", latex: "\\int \\frac{dx}{x^2 + a^2} = \\frac{1}{a} \\tan^{-1}\\left(\\frac{x}{a}\\right) + C", desc: "Anti-derivative yielding arctangent." }
  ],
  math_10: [
    { name: "Order and Degree", latex: "y'' + p(x)y' = q(x) \\Rightarrow \\text{Order 2, Degree 1}", desc: "Highest derivative defines order, its power defines degree." },
    { name: "Variable Separable Form", latex: "\\int g(y) dy = \\int f(x) dx", desc: "Method for solving DE when variables separate." },
    { name: "Integrating Factor (Linear DE)", latex: "IF = e^{\\int P(x) dx}", desc: "Multiplier to make linear DE integrable." },
    { name: "Linear DE General Solution", latex: "y \\cdot IF = \\int Q(x) \\cdot IF \\, dx + C", desc: "Solution for $y' + P(x)y = Q(x)$." },
    { name: "Homogeneous substitution", latex: "y = vx \\Rightarrow \\frac{dy}{dx} = v + x\\frac{dv}{dx}", desc: "Substitution to solve homogeneous differential equations." }
  ],
  math_11: [
    { name: "Distance Formula", latex: "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}", desc: "Distance between two coordinate points." },
    { name: "Distance from Point to Line", latex: "d = \\frac{|Ax_1 + By_1 + C|}{\\sqrt{A^2 + B^2}}", desc: "Shortest distance from $(x_1, y_1)$ to $Ax+By+C=0$." },
    { name: "Circle Equation (General Form)", latex: "x^2 + y^2 + 2gx + 2fy + c = 0", desc: "Centre is $(-g, -f)$ and radius is $\\sqrt{g^2+f^2-c}$." },
    { name: "Parabola Equation (Standard)", latex: "y^2 = 4ax", desc: "Focus is $(a, 0)$ and directrix is $x = -a$." },
    { name: "Ellipse Equation (Standard)", latex: "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\text{, } b^2 = a^2(1 - e^2)", desc: "Eccentricity relation for horizontal ellipse." }
  ],
  math_12: [
    { name: "Vector Dot Product", latex: "\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta", desc: "Scalar result of vector projection." },
    { name: "Vector Cross Product", latex: "\\vec{a} \\times \\vec{b} = |\\vec{a}||\\vec{b}|\\sin\\theta \\, \\hat{n}", desc: "Vector perpendicular to both $\\vec{a}$ and $\\vec{b}$." },
    { name: "Vector Projection", latex: "\\text{Proj}_{\\vec{b}} \\vec{a} = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|^2} \\vec{b}", desc: "Projection vector of $\\vec{a}$ along direction of $\\vec{b}$." },
    { name: "Scalar Triple Product", latex: "[\\vec{a} \\, \\vec{b} \\, \\vec{c}] = \\vec{a} \\cdot (\\vec{b} \\times \\vec{c})", desc: "Volume of parallelopiped spanned by three vectors." },
    { name: "Vector Triple Product Expansion", latex: "\\vec{a} \\times (\\vec{b} \\times \\vec{c}) = (\\vec{a} \\cdot \\vec{c})\\vec{b} - (\\vec{a} \\cdot \\vec{b})\\vec{c}", desc: "Vector formula expansion (BAC-CAB)." }
  ],
  math_13: [
    { name: "Direction Cosines relation", latex: "\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1", desc: "Sum of squares of direction cosines equals 1." },
    { name: "Equation of Line in 3D", latex: "\\frac{x - x_1}{a} = \\frac{y - y_1}{b} = \\frac{z - z_1}{c}", desc: "Symmetric line form passing through $(x_1, y_1, z_1)$ with direction ratios $a, b, c$." },
    { name: "Equation of Plane (Normal Form)", latex: "Ax + By + Cz + D = 0", desc: "Plane with normal vector vector $(A, B, C)$." },
    { name: "Shortest Distance between skew lines", latex: "d = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}", desc: "Minimum distance between non-parallel, non-intersecting lines." },
    { name: "Distance from Point to Plane", latex: "d = \\frac{|Ax_1 + By_1 + Cz_1 + D|}{\\sqrt{A^2 + B^2 + C^2}}", desc: "Perpendicular distance to plane." }
  ],
  math_14: [
    { name: "Classical Probability Definition", latex: "P(A) = \\frac{n(A)}{n(S)}", desc: "Ratio of favorable outcomes to total sample space." },
    { name: "Conditional Probability", latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}", desc: "Probability of $A$ given that event $B$ occurred." },
    { name: "Bayes' Theorem", latex: "P(E_i|A) = \\frac{P(E_i)P(A|E_i)}{\\sum P(E_k)P(A|E_k)}", desc: "Revises probability of partition event given evidence." },
    { name: "Binomial Distribution Probability", latex: "P(X=r) = {^nC_r} p^r q^{n-r}", desc: "Probability of $r$ successes in $n$ independent trials." },
    { name: "Mathematical Expectation", latex: "E(X) = \\sum x_i p_i", desc: "Average or expected value of random variable $X$." }
  ],
  math_15: [
    { name: "Trigonometric Identity", latex: "\\sin^2\\theta + \\cos^2\\theta = 1", desc: "Fundamental Pythagorean identity." },
    { name: "Double Angle Formulas", latex: "\\sin 2\\theta = 2\\sin\\theta\\cos\\theta, \\text{ } \\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta", desc: "Express trig functions of double angles." },
    { name: "Sum-to-Product Formula", latex: "\\sin A + \\sin B = 2\\sin\\left(\\frac{A+B}{2}\\right)\\cos\\left(\\frac{A-B}{2}\\right)", desc: "Converts sum of sines into product." },
    { name: "Inverse Trig sum", latex: "\\tan^{-1}x + \\tan^{-1}y = \\tan^{-1}\\left(\\frac{x+y}{1-xy}\\right)", desc: "Addition of angles in arctan form." },
    { name: "Sine Rule (Triangles)", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R", desc: "Relates side lengths to sines of angles in circumscribed triangle." }
  ]
};
