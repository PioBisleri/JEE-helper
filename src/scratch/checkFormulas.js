import { FORMULAS } from '../data/formulas.js';
console.log("Young's Modulus:", JSON.stringify(FORMULAS.phy_07.find(f => f.name === "Young's Modulus")));
console.log("Bernoulli's Equation:", JSON.stringify(FORMULAS.phy_07.find(f => f.name === "Bernoulli's Equation")));
console.log("Moment of Inertia:", JSON.stringify(FORMULAS.phy_05.find(f => f.name === "Moment of Inertia")));
console.log("Torque:", JSON.stringify(FORMULAS.phy_05.find(f => f.name === "Torque-Angular Acceleration Relation")));
