function sanitizeLaTeXJson(jsonString) {
  let sanitized = jsonString;
  // Let's test the replacement
  sanitized = sanitized.replace(/\\\\text([a-zA-Z]+)/g, '\\\\text{$1}');
  return sanitized;
}

const inputJSON = '{"question": "2 \\\\textm and \\\\textcm"}';
console.log("Original:", inputJSON);
console.log("Sanitized:", sanitizeLaTeXJson(inputJSON));
