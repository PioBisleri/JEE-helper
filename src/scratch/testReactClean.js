const text = "The speed is 3 \\textm/s and 5 \\textcm. Convert \\textm to \\textcm.";
console.log("Original:", text);
const cleaned = text.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
console.log("Cleaned:", cleaned);
