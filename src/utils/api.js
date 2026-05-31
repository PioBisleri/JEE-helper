import { logger } from './logger';
import { storage } from './storage';

const SYSTEM_PROMPT = `You are Nexus JEE's AI tutor — a precise, strict, expert JEE Mains teacher. 
You generate perfectly calibrated JEE questions and explanations. 
You ALWAYS respond in valid JSON only. No markdown, no explanation outside JSON, 
no preamble. Every response must be parseable by JSON.parse() directly.
CRITICAL LaTeX RULES:
1. Always enclose mathematical formulas and units in single dollar signs ($...$). For example: "$5\\text{ m}$ to $5\\text{ cm}$".
2. Never write unbraced commands like \\textm, \\textcm, \\textkg, \\texts. Always write: \\text{m}, \\text{cm}, \\text{kg}, \\text{s}.
3. Always escape all backslashes as double backslashes (\\\\) inside the JSON strings.`;

// Provider configurations
const PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openrouter/owl-alpha',
    format: 'openai',
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    format: 'openai',
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    format: 'anthropic',
  },
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/',
    model: 'gemini-2.0-flash',
    format: 'gemini',
  },
};

// In-flight requests map to handle deduplication
const inFlightRequests = new Map();

export class APIError extends Error {
  constructor(type, original) {
    super(original?.message || type);
    this.type = type;
  }
}

export { PROVIDERS };

// LaTeX JSON sanitization
function sanitizeLaTeXJson(jsonString) {
  let sanitized = jsonString;
  sanitized = sanitized.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
  sanitized = sanitized.replace(/\\vec([a-zA-Z]+)/g, '\\vec{$1}');
  const latexCommands = 'frac|sqrt|sin|cos|tan|sec|csc|cot|log|ln|exp|lim|sum|prod|int|infty|partial|nabla|vec|hat|bar|dot|ddot|tilde|overline|underline|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|phi|psi|chi|rho|tau|nu|xi|zeta|eta|iota|kappa|Delta|Gamma|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|cdot|times|div|pm|mp|circ|leq|geq|neq|approx|equiv|sim|propto|subset|supset|subseteq|supseteq|in|notin|cup|cap|emptyset|forall|exists|neg|land|lor|implies|perp|parallel|angle';
  const re = new RegExp(`(?<!\\\\)(?<!\\")\\\\(${latexCommands})`, 'g');
  sanitized = sanitized.replace(re, '\\\\$1');
  return sanitized;
}

// Parse response text to JSON
function parseAIResponse(text) {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
  const sanitized = sanitizeLaTeXJson(cleaned);
  return JSON.parse(sanitized);
}

// Fetch from OpenAI-compatible APIs (OpenRouter, OpenAI)
async function fetchOpenAICompatible(baseUrl, apiKey, model, systemPrompt, userPrompt) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(baseUrl.includes('openrouter') ? { 'HTTP-Referer': 'https://nexusjee.app', 'X-Title': 'Nexus JEE' } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const msg = text.toLowerCase();
    if (response.status === 429 || msg.includes('rate limit') || msg.includes('quota')) {
      throw new APIError('rate_limit', new Error(`Rate limit: ${text}`));
    }
    if (response.status === 401 || response.status === 403) {
      throw new APIError('auth', new Error(`Auth error: ${text}`));
    }
    throw new APIError('unknown', new Error(`API error ${response.status}: ${text}`));
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new APIError('parse', new Error('Empty response'));
  return parseAIResponse(content);
}

// Fetch from Anthropic
async function fetchAnthropic(apiKey, model, systemPrompt, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const msg = text.toLowerCase();
    if (response.status === 429 || msg.includes('rate limit') || msg.includes('quota')) {
      throw new APIError('rate_limit', new Error(`Rate limit: ${text}`));
    }
    if (response.status === 401 || response.status === 403) {
      throw new APIError('auth', new Error(`Auth error: ${text}`));
    }
    throw new APIError('unknown', new Error(`API error ${response.status}: ${text}`));
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new APIError('parse', new Error('Empty response'));
  return parseAIResponse(content);
}

// Fetch from Google Gemini
async function fetchGemini(apiKey, model, systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const msg = text.toLowerCase();
    if (response.status === 429 || msg.includes('rate limit') || msg.includes('quota')) {
      throw new APIError('rate_limit', new Error(`Rate limit: ${text}`));
    }
    if (response.status === 401 || response.status === 403) {
      throw new APIError('auth', new Error(`Auth error: ${text}`));
    }
    throw new APIError('unknown', new Error(`API error ${response.status}: ${text}`));
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new APIError('parse', new Error('Empty response'));
  return parseAIResponse(content);
}

// Main fetch function — routes to correct provider
async function fetchAI(systemPrompt, userPrompt) {
  const provider = storage.getAIProvider();
  const apiKey = storage.getAIApiKey();

  if (!provider || !apiKey) {
    throw new APIError('auth', new Error('No AI provider configured. Please set up your API key in Settings.'));
  }

  const config = PROVIDERS[provider];
  if (!config) {
    throw new APIError('auth', new Error(`Unknown provider: ${provider}`));
  }

  const model = storage.getAIModel() || config.model;
  logger.log(`Calling ${config.name} (${model})...`);

  switch (config.format) {
    case 'openai':
      return fetchOpenAICompatible(config.baseUrl, apiKey, model, systemPrompt, userPrompt);
    case 'anthropic':
      return fetchAnthropic(apiKey, model, systemPrompt, userPrompt);
    case 'gemini':
      return fetchGemini(apiKey, model, systemPrompt, userPrompt);
    default:
      throw new APIError('auth', new Error(`Unsupported provider format: ${config.format}`));
  }
}

// Wrapper with deduplication and 2 retries
export async function callAI(userPrompt, customSystemPrompt = SYSTEM_PROMPT) {
  const requestKey = JSON.stringify({ customSystemPrompt, userPrompt });
  
  if (inFlightRequests.has(requestKey)) {
    logger.log('Deduplicated API call in flight.');
    return inFlightRequests.get(requestKey);
  }

  const executeCall = async (retriesLeft = 2) => {
    try {
      return await fetchAI(customSystemPrompt, userPrompt);
    } catch (err) {
      if (retriesLeft > 0) {
        logger.warn(`API call failed. Retrying... (${retriesLeft} retries left)`, err);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return executeCall(retriesLeft - 1);
      }
      throw err;
    }
  };

  const promise = executeCall().finally(() => {
    inFlightRequests.delete(requestKey);
  });

  inFlightRequests.set(requestKey, promise);
  return promise;
}

// API functions
export async function generateQuestion(chapter, difficultyPoint, conceptsAlreadyLearned, mood) {
  const moodInstruction = {
    focused: 'Normal JEE Mains difficulty. Standard question.',
    tired: 'Slightly easier than usual. More conceptual, less calculation-heavy. Keep it short.',
    stressed: 'One difficulty level easier than normal. Be encouraging in phrasing.'
  }[mood] || 'Normal JEE Mains difficulty.';

  const userPrompt = `Generate ONE multiple choice question.
Chapter: ${chapter.name}
Current focus concept: ${difficultyPoint}
Concepts student already knows: ${conceptsAlreadyLearned.join(', ') || 'none yet'}
Mood adjustment: ${moodInstruction}

The question must test "${difficultyPoint}" as the primary concept.
If the student knows prerequisite concepts, the question may build on them naturally.
Do NOT test concepts beyond the current focus topic.

Double-check that the correct answer is mathematically/scientifically accurate before including it.
Do not generate trick questions with ambiguous answers.
Each wrong option must represent a common and plausible mistake, not an obviously wrong value.

Return ONLY this JSON schema:
{
  "question": "full question text in LaTeX ($ for inline math)",
  "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
  "answer": "A or B or C or D",
  "conceptsTested": ["concept1", "concept2"],
  "primaryConcept": "${difficultyPoint}",
  "whyCorrect": "one clear sentence explaining the correct answer",
  "whyOthersWrong": { "A": "reason A is incorrect", "B": "reason B is incorrect", "C": "reason C is incorrect", "D": "reason D is incorrect" },
  "difficulty": "easy or medium or hard"
}`;

  return callAI(userPrompt);
}

export async function generateScaffoldL1(originalQuestion, primaryConcept, chapterName) {
  const userPrompt = `A JEE student could not solve this question:
"${originalQuestion}"

The concept they're stuck on is: "${primaryConcept}" from chapter "${chapterName}".

Generate a SIMPLER question that isolates ONLY the concept "${primaryConcept}".
It should be easier than JEE level but still meaningful — like a good textbook example problem.
Remove any compounding concepts from the original question. Ensure the correct answer is mathematically accurate.

Return ONLY this JSON schema:
{
  "question": "simpler question text in LaTeX ($ for inline math)",
  "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
  "answer": "A or B or C or D",
  "concept": "${primaryConcept}",
  "whyCorrect": "clear explanation",
  "bridgeExplanation": "one sentence explaining how solving this connects back to the original question"
}`;

  return callAI(userPrompt);
}

export async function generateConceptExplanation(concept, chapterName) {
  const userPrompt = `Explain the concept "${concept}" from JEE chapter "${chapterName}" to a student who is confused.

Rules:
- Provide an intuitive conceptual explanation (max 120 words).
- Provide one real-world analogy.
- Provide a concrete worked example showing the concept in action (using step-by-step LaTeX formulas).
- Mention the most common mistake students make.
- End with a sentence connecting it back to JEE problem solving.

Return ONLY this JSON schema:
{
  "explanation": "intuitive conceptual explanation text",
  "analogy": "real-world analogy",
  "example": "concrete worked example with step-by-step calculations/reasoning using LaTeX ($)",
  "commonMistake": "common misconception or formula application mistake",
  "jeeConnection": "how it applies to JEE problem solving",
  "videoSearchQuery": "YouTube search query to find a good explanation video for this concept for JEE"
}`;

  return callAI(userPrompt);
}

export async function generateConceptLadder(stuckConcept, chapterName) {
  const userPrompt = `A JEE student is stuck on "${stuckConcept}" from "${chapterName}".

Break this down into a ladder of prerequisite concepts from most fundamental (Class 9-10 level) up to "${stuckConcept}".
Maximum 5 rungs in the ladder. The last rung should BE "${stuckConcept}".

For each rung provide a micro-explanation (2-3 sentences max, intuition-first).

Return ONLY this JSON schema:
{
  "ladder": [
    {
      "concept": "concept name",
      "explanation": "2-3 sentence intuitive explanation",
      "example": "one concrete example using LaTeX ($)",
      "videoSearchQuery": "YouTube search query for this concept"
    }
  ]
}
The ladder array must go from most fundamental at index 0 to "${stuckConcept}" at the last index.`;

  return callAI(userPrompt);
}

export async function generateWeeklyTest(conceptsLearned, challengeMode = false) {
  const conceptList = conceptsLearned.map(c => c.concept).join(', ');
  const questionCount = challengeMode ? 15 : 10;
  const difficultyDistribution = challengeMode 
    ? '2 easy, 5 medium, 8 hard questions (harder difficulty bias)'
    : '3 easy, 4 medium, 3 hard questions';

  const userPrompt = `Generate a ${questionCount}-question JEE Mains style test covering these concepts the student learned recently:
${conceptList}

Distribution: ${difficultyDistribution}.
Cover as many of the concepts as possible, prioritizing the ones that appear most in JEE.
Each question should test ONE primary concept from the list.
Ensure that the correct answer is mathematically/scientifically accurate.

Return ONLY this JSON schema:
{
  "questions": [
    {
      "question": "question text in LaTeX ($ for inline math)",
      "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
      "answer": "A or B or C or D",
      "primaryConcept": "concept name from input",
      "whyCorrect": "explanation of correct option",
      "difficulty": "easy or medium or hard"
    }
  ]
}`;

  return callAI(userPrompt);
}

export async function classifyMistake(question, correctAnswer, studentAnswer, studentWorking) {
  const userPrompt = `A JEE student answered this question wrong.

Question: "${question}"
Correct answer: ${correctAnswer}
Student chose: ${studentAnswer}
Student's working (if provided): "${studentWorking || 'not provided'}"

Classify WHY they got it wrong into exactly one of these categories:
- "conceptual_gap": They don't understand the underlying theory
- "calculation_error": They knew the method but made an arithmetic/algebraic mistake
- "misread_question": They understood the concept but missed a detail in the question
- "distractor_trap": They knew the concept but fell for a cleverly designed wrong option

Return ONLY this JSON schema:
{
  "category": "one of the four categories listed above",
  "explanation": "one sentence explaining specifically what went wrong",
  "advice": "one actionable sentence on how to avoid this in future"
}`;

  return callAI(userPrompt);
}

export async function generateSessionSummary(sessionData) {
  const userPrompt = `Generate a brief, encouraging session summary for a JEE student.

Session data:
- Questions attempted: ${sessionData.attempted}
- Questions solved without help (clean solves): ${sessionData.solvedClean}
- Got scaffolded on: ${sessionData.scaffoldedConcepts.join(', ') || 'none'}
- New concepts learned: ${sessionData.newConcepts.join(', ') || 'none'}
- Chapter: ${sessionData.chapterName}

Write exactly 2 sentences of encouragement and summary.
AND write a 3rd sentence of specific, actionable study advice. For example: "You consistently set up the reference frame wrong in relative motion — try drawing the velocity vectors before writing equations next time."

Return ONLY this JSON schema:
{
  "summary": "your 2-sentence encouraging summary here",
  "advice": "your 1-sentence actionable advice here"
}`;

  return callAI(userPrompt);
}

export async function generateHint(question, wrongOptionChosen, primaryConcept) {
  const userPrompt = `A JEE student just got this question wrong by choosing option ${wrongOptionChosen}.
Question: "${question}"
Primary concept tested: "${primaryConcept}"

Give them a hint that:
- Points at their specific mistake without revealing the answer
- Asks them a guiding question to redirect their thinking
- Does NOT give the answer or the method directly
- Is maximum 2 sentences

Return ONLY this JSON schema:
{ "hint": "your hint here" }`;

  return callAI(userPrompt);
}

export async function generateReviewQuestion(concept, chapterName) {
  const userPrompt = `Generate ONE JEE Mains level review question testing the concept "${concept}" from "${chapterName}".
This is a spaced repetition review — make it slightly different from a standard problem to test real understanding.
Medium difficulty. Ensure correct answer is accurate.

Return ONLY this JSON schema:
{
  "question": "review question text in LaTeX ($ for inline math)",
  "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
  "answer": "A or B or C or D",
  "primaryConcept": "${concept}",
  "whyCorrect": "clear explanation of correct option"
}`;

  return callAI(userPrompt);
}

export async function generateWorkedSolution(question) {
  const userPrompt = `A JEE student is completely stuck and has failed all scaffolding helper steps for this question:
"${question}"

Generate a clear, detailed, step-by-step worked solution to this question.
Break down the equations and variables used, and show how to derive the correct option.
Use LaTeX ($ for inline formulas) for mathematical clarity.

Return ONLY this JSON schema:
{
  "solutionSteps": [
    "step 1 text",
    "step 2 text",
    "step 3 text"
  ],
  "finalDerivation": "final derivation sentence showing why correct option is chosen"
}`;

  return callAI(userPrompt);
}

export async function generateGateQuestions(prevChapterName, currentChapterName) {
  const userPrompt = `Generate exactly 5 critical multiple-choice prerequisite questions from the chapter "${prevChapterName}" that are essential for understanding the chapter "${currentChapterName}".
These questions should be of medium difficulty, testing core concepts only.
Double-check that the correct answer is mathematically/scientifically accurate.
Each wrong option must represent a common mistake.

Return ONLY this JSON schema:
{
  "questions": [
    {
      "question": "question text in LaTeX ($ for inline math)",
      "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
      "answer": "A or B or C or D",
      "whyCorrect": "clear explanation of correct option"
    }
  ]
}`;
  return callAI(userPrompt);
}

export async function generateDailyChallengeQuestion(chapterName, concept, difficulty) {
  const userPrompt = `Generate ONE multiple choice question.
Chapter: ${chapterName}
Concept tested: ${concept}
Difficulty level required: ${difficulty} (easy or medium or hard)

The question must test "${concept}" as the primary concept.
For easy: straightforward concept application.
For medium: multi-step calculation or slight trick.
For hard: advanced reasoning, typical of harder JEE Mains questions.

Double-check that the correct answer is mathematically/scientifically accurate before including it.
Each wrong option must represent a common and plausible mistake, not an obviously wrong value.

Return ONLY this JSON schema:
{
  "question": "full question text in LaTeX ($ for inline math)",
  "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
  "answer": "A or B or C or D",
  "primaryConcept": "${concept}",
  "whyCorrect": "one clear sentence explaining the correct answer",
  "whyOthersWrong": { "A": "reason A is incorrect", "B": "reason B is incorrect", "C": "reason C is incorrect", "D": "reason D is incorrect" }
}`;

  return callAI(userPrompt);
}

export async function generateChapterSummary(chapterName, subject, subtopics) {
  const userPrompt = `Generate a comprehensive JEE revision summary for the chapter "${chapterName}" in the subject "${subject}".
The subtopics covered are: ${subtopics.join(', ')}.

Provide:
1. Core theory and primary formulas.
2. Common traps, pitfalls, and exam tricks.
3. Recommended prerequisites.
4. Suggested next chapters to study.

Use LaTeX ($ for inline equations and $$ for block equations) where appropriate for mathematical formulas. Keep it highly structured and concise.

Return ONLY this JSON schema:
{
  "summary": "Core theory summary with key formulas in Markdown format (use $ and $$ for LaTeX)",
  "pitfalls": "Common student traps and exam-solving tips in Markdown format",
  "prerequisites": "Essential topics or chapters to know first",
  "nextChapters": "Recommended topics or chapters to study next"
}`;

  return callAI(userPrompt);
}
