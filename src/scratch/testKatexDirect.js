import katex from 'katex';
try {
  const html = katex.renderToString("\\vec{\\tau}");
  console.log("KaTeX Output HTML:", html);
} catch (e) {
  console.error("KaTeX Error:", e.message);
}
