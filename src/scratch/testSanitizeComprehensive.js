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

// Case 1: AI returns escaped double backslashes in JSON (standard)
const input1 = '{"question": "The speed is 3\\\\times10^8 \\\\textm/s. Express in \\\\textkm/h."}';
console.log("Input 1:", input1);
const output1 = sanitizeLaTeXJson(input1);
console.log("Sanitized 1:", output1);
console.log("Parsed 1:", JSON.parse(output1));

// Case 2: AI returns single backslashes in JSON (malformed JSON from model)
const input2 = '{"question": "The speed is 3\\times10^8 \\textm/s. Express in \\textkm/h."}';
console.log("\nInput 2:", input2);
const output2 = sanitizeLaTeXJson(input2);
console.log("Sanitized 2:", output2);
console.log("Parsed 2:", JSON.parse(output2));
