function wrapMathOutsideDollar(text) {
  if (!text) return '';
  const parts = text.split('$');
  for (let i = 0; i < parts.length; i += 2) {
    let segment = parts[i];
    segment = segment.replace(/\\([a-zA-Z]+)(?:\{[^{}]*\})*/g, match => \`$\${match}$\`);
    segment = segment.replace(/\b(\d+(?:\.\d+)?)\s*(m|cm|kg|s|N|J|W|Pa|V|A|Hz)\b/g, (match, p1, p2) => \`$\${p1} \\text{\${p2}}$\`);
    parts[i] = segment;
  }
  let reconstructed = parts.join('$');
  reconstructed = reconstructed.replace(/(\$[^$]+)\$\s*\$([^$]+\$)/g, '$1 $2');
  return reconstructed;
}

const input1 = "Here is block math $$ x=2 $$ and inline $ y=3 $.";
const input2 = "Mass is 5 kg and velocity \\\\theta is 3 m/s.";
console.log("Input 1:", wrapMathOutsideDollar(input1));
console.log("Input 2:", wrapMathOutsideDollar(input2));
