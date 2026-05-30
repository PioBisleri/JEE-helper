// Correct JS replacement string for wrapping match in single dollars
const testCases = [
  "Find the value of \\theta when force is 5 \\text{N}.",
  "Calculate the speed in \\text{m/s} if distance is 10\\text{ m} and time is 2\\text{ s}.",
  "The formula is \\frac{1}{2}mv^2.",
  "Let x = 5 and y = 10.",
  "It already has $5\\text{ m}$ and $\\theta$."
];

function wrapMathOutsideDollar(text) {
  if (!text) return '';

  const parts = text.split('$');
  for (let i = 0; i < parts.length; i += 2) {
    let segment = parts[i];
    
    // Wrap backslash LaTeX commands in $...$
    // Using string concatenation for replacement value to avoid regex replace syntax confusion
    segment = segment.replace(/\\([a-zA-Z]+)(?:\{[^{}]*\})*/g, (match) => `$${match}$`);
    
    // Wrap number + unit (e.g. 5 m or 5 kg) in $...$
    segment = segment.replace(/\b(\d+(?:\.\d+)?)\s*(m|cm|kg|s|N|J|W|Pa|V|A|Hz)\b/g, (match, num, unit) => `$${num}\\text{ ${unit}}$`);

    parts[i] = segment;
  }
  
  let reconstructed = parts.join('$');
  
  // Merge adjacent math blocks: $5$ $\text{m}$ -> $5\text{m}$
  reconstructed = reconstructed.replace(/\$\s*\$/g, '');
  
  return reconstructed;
}

testCases.forEach(c => {
  console.log("Original:", c);
  console.log("Wrapped: ", wrapMathOutsideDollar(c));
  console.log("---");
});
