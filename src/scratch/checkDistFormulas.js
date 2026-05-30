import fs from 'fs';
import path from 'path';

// Find the built index JS file
const assetsDir = './dist/assets';
const files = fs.readdirSync(assetsDir);
const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

if (!indexFile) {
  console.error("Could not find index-*.js file in dist/assets");
  process.exit(1);
}

const filePath = path.join(assetsDir, indexFile);
const content = fs.readFileSync(filePath, 'utf8');

// Use a regex to extract the RF object which contains the formulas
const match = content.match(/Rf=\{phy_01:\[[\s\S]*?\}\n/);
if (match) {
  console.log("Found Rf object!");
  // Let's write the Rf object to a temporary file and import it
  const code = `const Rf = ${match[0].substring(3)}; export { Rf };`;
  fs.writeFileSync('./src/scratch/tempRf.js', code);
  
  // Import it
  const { Rf } = await import('../scratch/tempRf.js');
  const torque = Rf.phy_05.find(f => f.name.includes("Torque"));
  console.log("Torque formula in built JS:", JSON.stringify(torque));
  console.log("Torque chars:");
  for (let i = 0; i < torque.latex.length; i++) {
    console.log(`char ${i}: '${torque.latex[i]}' (code point: ${torque.latex.charCodeAt(i)})`);
  }
} else {
  // Let's search for "Torque-Angular" in the text
  const idx = content.indexOf("Torque-Angular");
  if (idx !== -1) {
    console.log("Found Torque string at index:", idx);
    console.log("Snippet:", content.substring(idx - 100, idx + 200));
  } else {
    console.log("Could not find Torque formula in built JS");
  }
}
