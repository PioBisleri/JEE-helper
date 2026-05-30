import { FORMULAS } from '../data/formulas.js';
const torque = FORMULAS.phy_05.find(f => f.name === "Torque-Angular Acceleration Relation");
console.log("String:", torque.latex);
console.log("Chars and Code Points:");
for (let i = 0; i < torque.latex.length; i++) {
  console.log(`char ${i}: '${torque.latex[i]}' (code point: ${torque.latex.charCodeAt(i)})`);
}
