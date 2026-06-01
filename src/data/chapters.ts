export const CHAPTERS = {
  physics: [
    {
      id: "phy_01",
      name: "Units and Measurements",
      subtopics: ["Dimensional Analysis", "Significant Figures", "Error Analysis", "SI Units"],
      difficulty_curve: ["basic unit conversion", "dimensional analysis", "error propagation", "combined error analysis"]
    },
    {
      id: "phy_02",
      name: "Kinematics",
      subtopics: ["Motion in straight line", "Relative motion", "Projectile motion", "Circular motion"],
      difficulty_curve: ["displacement vs distance", "equations of motion", "relative velocity basics", "projectile basics", "2D projectile", "relative velocity advanced"]
    },
    {
      id: "phy_03",
      name: "Laws of Motion",
      subtopics: ["Newton's laws", "Friction", "Circular motion dynamics", "Pseudo forces"],
      difficulty_curve: ["Newton first law", "Newton second law", "Newton third law", "static friction", "kinetic friction", "circular motion forces", "pseudo force basics"]
    },
    {
      id: "phy_04",
      name: "Work, Energy and Power",
      subtopics: ["Work done by forces", "Kinetic and potential energy", "Conservation of energy", "Power and collisions"],
      difficulty_curve: ["work by constant force", "work by variable force", "kinetic energy", "potential energy", "conservation of energy", "power", "elastic collision", "inelastic collision"]
    },
    {
      id: "phy_05",
      name: "Rotational Motion",
      subtopics: ["Moment of inertia", "Torque", "Angular momentum", "Rolling motion"],
      difficulty_curve: ["basic rotation kinematics", "torque basics", "moment of inertia simple", "moment of inertia composite", "angular momentum", "conservation of angular momentum", "rolling without slipping"]
    },
    {
      id: "phy_06",
      name: "Gravitation",
      subtopics: ["Newton's law of gravitation", "Gravitational field", "Potential energy", "Satellites and Kepler's laws"],
      difficulty_curve: ["gravitational force", "gravitational field", "gravitational potential", "escape velocity", "orbital velocity", "Kepler laws"]
    },
    {
      id: "phy_07",
      name: "Properties of Matter",
      subtopics: ["Elasticity", "Fluid statics", "Fluid dynamics", "Surface tension", "Viscosity"],
      difficulty_curve: ["stress strain", "Young's modulus", "pressure in fluids", "Archimedes principle", "Bernoulli equation", "surface tension", "viscosity"]
    },
    {
      id: "phy_08",
      name: "Thermodynamics",
      subtopics: ["Thermal expansion", "Kinetic theory", "Laws of thermodynamics", "Heat transfer"],
      difficulty_curve: ["thermal expansion", "ideal gas law", "kinetic theory basics", "first law of thermodynamics", "second law", "Carnot cycle", "heat transfer modes"]
    },
    {
      id: "phy_09",
      name: "Oscillations and Waves",
      subtopics: ["Simple harmonic motion", "Damped oscillations", "Wave motion", "Sound waves", "Doppler effect"],
      difficulty_curve: ["SHM basics", "SHM energy", "spring mass system", "pendulum", "wave equation", "superposition", "beats", "Doppler effect"]
    },
    {
      id: "phy_10",
      name: "Electrostatics",
      subtopics: ["Coulomb's law", "Electric field", "Gauss law", "Electric potential", "Capacitors"],
      difficulty_curve: ["Coulomb's law", "electric field basics", "electric field lines", "Gauss law basics", "Gauss law applications", "electric potential", "equipotential surfaces", "capacitance", "capacitor combinations", "energy stored"]
    },
    {
      id: "phy_11",
      name: "Current Electricity",
      subtopics: ["Ohm's law", "Kirchhoff's laws", "Wheatstone bridge", "RC circuits"],
      difficulty_curve: ["Ohm's law", "resistance combinations", "Kirchhoff's current law", "Kirchhoff's voltage law", "Wheatstone bridge", "potentiometer", "RC circuit basics"]
    },
    {
      id: "phy_12",
      name: "Magnetic Effects of Current",
      subtopics: ["Biot-Savart law", "Ampere's law", "Force on current", "Magnetic materials"],
      difficulty_curve: ["magnetic field due to straight wire", "Biot-Savart law", "Ampere's law", "force on moving charge", "force between parallel wires", "torque on current loop"]
    },
    {
      id: "phy_13",
      name: "Electromagnetic Induction",
      subtopics: ["Faraday's law", "Lenz's law", "Self and mutual inductance", "AC circuits"],
      difficulty_curve: ["magnetic flux", "Faraday's law", "Lenz's law", "self inductance", "mutual inductance", "AC basics", "LCR circuit", "resonance"]
    },
    {
      id: "phy_14",
      name: "Optics",
      subtopics: ["Ray optics", "Wave optics", "Optical instruments"],
      difficulty_curve: ["reflection", "refraction", "prism", "lens formula", "mirrors", "interference", "diffraction", "polarization"]
    },
    {
      id: "phy_15",
      name: "Modern Physics",
      subtopics: ["Photoelectric effect", "Atomic structure", "Radioactivity", "Nuclear physics", "Semiconductors"],
      difficulty_curve: ["photoelectric effect", "de Broglie wavelength", "Bohr model", "radioactive decay", "nuclear reactions", "p-n junction", "logic gates"]
    }
  ],
  chemistry: [
    {
      id: "chem_01",
      name: "Basic Concepts of Chemistry",
      subtopics: ["Mole concept", "Stoichiometry", "Equivalent concept", "Concentration terms"],
      difficulty_curve: ["mole basics", "molar mass", "stoichiometry basics", "limiting reagent", "concentration terms", "equivalent concept"]
    },
    {
      id: "chem_02",
      name: "Atomic Structure",
      subtopics: ["Bohr model", "Quantum numbers", "Electronic configuration", "Periodic trends"],
      difficulty_curve: ["Bohr model", "quantum numbers", "orbital shapes", "electronic configuration", "periodic trends"]
    },
    {
      id: "chem_03",
      name: "Chemical Bonding",
      subtopics: ["Ionic bonding", "Covalent bonding", "VSEPR", "Hybridization", "Molecular orbital theory"],
      difficulty_curve: ["ionic bond", "covalent bond", "Lewis structure", "VSEPR basics", "hybridization", "MOT basics", "resonance"]
    },
    {
      id: "chem_04",
      name: "Thermodynamics",
      subtopics: ["Internal energy", "Enthalpy", "Entropy", "Gibbs energy", "Hess's law"],
      difficulty_curve: ["system and surroundings", "enthalpy basics", "Hess's law", "bond enthalpy", "entropy", "Gibbs energy", "spontaneity"]
    },
    {
      id: "chem_05",
      name: "Equilibrium",
      subtopics: ["Chemical equilibrium", "Le Chatelier's principle", "Ionic equilibrium", "pH and buffers"],
      difficulty_curve: ["Kc and Kp", "Le Chatelier's principle", "degree of dissociation", "ionic equilibrium", "pH basics", "buffer solutions", "solubility product"]
    },
    {
      id: "chem_06",
      name: "Electrochemistry",
      subtopics: ["Electrochemical cells", "Nernst equation", "Electrolysis", "Conductance"],
      difficulty_curve: ["galvanic cell basics", "standard electrode potential", "Nernst equation", "EMF calculation", "electrolysis", "Faraday's laws", "conductance"]
    },
    {
      id: "chem_07",
      name: "Chemical Kinetics",
      subtopics: ["Rate of reaction", "Rate law", "Integrated rate equations", "Activation energy"],
      difficulty_curve: ["rate basics", "rate law", "first order reactions", "half life", "Arrhenius equation", "activation energy"]
    },
    {
      id: "chem_08",
      name: "Coordination Chemistry",
      subtopics: ["Werner's theory", "Nomenclature", "Isomerism", "Bonding theories", "Colour and magnetism"],
      difficulty_curve: ["basic terminology", "Werner's theory", "nomenclature", "isomerism", "VBT", "CFT basics", "colour and magnetism"]
    },
    {
      id: "chem_09",
      name: "Organic Chemistry — Basics",
      subtopics: ["IUPAC nomenclature", "Isomerism", "Reaction mechanisms", "Inductive and resonance effects"],
      difficulty_curve: ["IUPAC basics", "functional groups", "isomerism", "inductive effect", "resonance effect", "reaction mechanisms", "carbocation stability"]
    },
    {
      id: "chem_10",
      name: "Hydrocarbons",
      subtopics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic compounds"],
      difficulty_curve: ["alkane reactions", "alkene addition reactions", "alkyne reactions", "benzene structure", "EAS reactions", "NAS reactions"]
    },
    {
      id: "chem_11",
      name: "Organic Compounds with Functional Groups",
      subtopics: ["Alcohols", "Ethers", "Aldehydes and Ketones", "Carboxylic acids", "Amines"],
      difficulty_curve: ["alcohol reactions", "ether preparation", "aldehyde reactions", "ketone reactions", "nucleophilic addition", "carboxylic acid reactions", "amine reactions"]
    },
    {
      id: "chem_12",
      name: "Biomolecules and Polymers",
      subtopics: ["Carbohydrates", "Proteins", "Nucleic acids", "Polymers"],
      difficulty_curve: ["carbohydrate classification", "amino acids", "protein structure", "nucleic acids", "polymer types", "biodegradable polymers"]
    }
  ],
  math: [
    {
      id: "math_01",
      name: "Sets, Relations and Functions",
      subtopics: ["Sets and operations", "Relations", "Functions", "Inverse functions"],
      difficulty_curve: ["set basics", "set operations", "Venn diagrams", "relations", "types of functions", "composite functions", "inverse functions"]
    },
    {
      id: "math_02",
      name: "Complex Numbers",
      subtopics: ["Algebra of complex numbers", "Argand plane", "Modulus and argument", "Roots of unity"],
      difficulty_curve: ["basic complex algebra", "conjugate and modulus", "Argand plane", "polar form", "De Moivre's theorem", "roots of unity", "cube roots of unity"]
    },
    {
      id: "math_03",
      name: "Quadratic Equations",
      subtopics: ["Roots of quadratic", "Nature of roots", "Relation between roots", "Quadratic inequalities"],
      difficulty_curve: ["basic quadratic solving", "discriminant", "nature of roots", "sum and product of roots", "forming equation from roots", "quadratic inequalities"]
    },
    {
      id: "math_04",
      name: "Sequences and Series",
      subtopics: ["AP", "GP", "HP", "Special series", "AGP"],
      difficulty_curve: ["AP basics", "AP problems", "GP basics", "GP sum", "infinite GP", "HP", "AM GM HM inequality", "AGP", "special series"]
    },
    {
      id: "math_05",
      name: "Permutations and Combinations",
      subtopics: ["Fundamental counting", "Permutations", "Combinations", "Binomial theorem"],
      difficulty_curve: ["fundamental principle", "permutations basics", "permutations with repetition", "combinations basics", "combinations problems", "binomial theorem", "binomial coefficients"]
    },
    {
      id: "math_06",
      name: "Matrices and Determinants",
      subtopics: ["Matrix algebra", "Determinants", "Inverse of matrix", "System of equations"],
      difficulty_curve: ["matrix basics", "matrix operations", "determinant 2x2", "determinant 3x3", "properties of determinants", "adjoint and inverse", "Cramer's rule", "system of equations"]
    },
    {
      id: "math_07",
      name: "Limits, Continuity and Differentiability",
      subtopics: ["Limits", "Continuity", "Differentiability", "Standard derivatives"],
      difficulty_curve: ["limit basics", "standard limits", "L'Hopital rule", "continuity basics", "differentiability", "chain rule", "implicit differentiation", "parametric differentiation"]
    },
    {
      id: "math_08",
      name: "Applications of Derivatives",
      subtopics: ["Rate of change", "Tangent and normal", "Monotonicity", "Maxima and minima"],
      difficulty_curve: ["rate of change", "tangent and normal", "increasing decreasing", "first derivative test", "second derivative test", "maxima minima word problems", "Rolle's theorem", "LMVT"]
    },
    {
      id: "math_09",
      name: "Integrals",
      subtopics: ["Standard integrals", "Integration by substitution", "Integration by parts", "Definite integrals"],
      difficulty_curve: ["basic integration", "substitution", "integration by parts", "partial fractions", "definite integral basics", "properties of definite integrals", "limit as sum"]
    },
    {
      id: "math_10",
      name: "Differential Equations",
      subtopics: ["Order and degree", "Variable separable", "Homogeneous equations", "Linear differential equations"],
      difficulty_curve: ["order and degree", "variable separable", "homogeneous equations", "linear DE", "Bernoulli equation"]
    },
    {
      id: "math_11",
      name: "Coordinate Geometry",
      subtopics: ["Straight lines", "Circles", "Parabola", "Ellipse", "Hyperbola"],
      difficulty_curve: ["straight line basics", "family of lines", "circle basics", "circle and line", "parabola basics", "parabola problems", "ellipse basics", "hyperbola basics", "conics general"]
    },
    {
      id: "math_12",
      name: "Vector Algebra",
      subtopics: ["Vector basics", "Dot product", "Cross product", "Scalar triple product"],
      difficulty_curve: ["vector basics", "addition and subtraction", "dot product", "projection", "cross product", "area using vectors", "scalar triple product", "coplanarity"]
    },
    {
      id: "math_13",
      name: "3D Geometry",
      subtopics: ["Direction cosines", "Line in 3D", "Plane in 3D", "Angle between line and plane"],
      difficulty_curve: ["direction cosines", "direction ratios", "line equation", "angle between lines", "plane equation", "angle between planes", "line and plane", "skew lines"]
    },
    {
      id: "math_14",
      name: "Probability",
      subtopics: ["Classical probability", "Conditional probability", "Bayes theorem", "Random variables", "Distributions"],
      difficulty_curve: ["basic probability", "addition theorem", "conditional probability", "multiplication theorem", "Bayes theorem", "random variables", "Binomial distribution", "Poisson distribution"]
    },
    {
      id: "math_15",
      name: "Trigonometry",
      subtopics: ["Trigonometric ratios", "Identities", "Inverse trigonometry", "Heights and distances"],
      difficulty_curve: ["basic ratios", "compound angles", "multiple angles", "sum to product", "product to sum", "inverse trig basics", "inverse trig equations", "heights and distances"]
    }
  ]
}
