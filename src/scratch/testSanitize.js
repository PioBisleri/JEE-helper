function sanitizeLaTeXJson(jsonString) {
  let sanitized = jsonString
    .replace(/(?<!\\)\\t(ext|heta|au|imes|an)/g, '\\\\t$1')
    .replace(/(?<!\\)\\n(ode|ew|u)/g, '\\\\n$1')
    .replace(/(?<!\\)\\f(rac)/g, '\\\\f$1')
    .replace(/(?<!\\)\\r(ho|ight)/g, '\\\\r$1')
    .replace(/(?<!\\)\\b(eta|ar|egin|old)/g, '\\\\b$1')
    .replace(/(?<!\\)\\([\[\]()])/g, '\\\\$1');

  sanitized = sanitized.replace(/\\\\text([a-zA-Z]+)/g, '\\\\text{$1}');

  return sanitized;
}

const inputJSON = '{"question": "Here is block math \\\\[ x=2 \\\\] and inline \\\\( y=3 \\\\)."}';
console.log("Original JSON String:", inputJSON);
const sanitized = sanitizeLaTeXJson(inputJSON);
console.log("Sanitized JSON String:", sanitized);
try {
  const parsed = JSON.parse(sanitized);
  console.log("Parsed Object:", parsed);
} catch (e) {
  console.error("Parse Error:", e.message);
}
