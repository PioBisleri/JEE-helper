export type AIProvider = 'openrouter' | 'openai' | 'anthropic' | 'gemini';

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  model: string;
  format: 'openai' | 'anthropic' | 'gemini';
  placeholder?: string;
}

export interface Providers {
  [key: string]: ProviderConfig;
}

export interface Question {
  question: string;
  options: Record<string, string>;
  answer: string;
  conceptsTested?: string[];
  primaryConcept: string;
  whyCorrect: string;
  whyOthersWrong?: Record<string, string>;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ScaffoldL1Response {
  question: string;
  options: Record<string, string>;
  answer: string;
  concept: string;
  whyCorrect: string;
  bridgeExplanation: string;
}

export interface ConceptExplanationResponse {
  explanation: string;
  analogy: string;
  example: string;
  commonMistake: string;
  jeeConnection: string;
  videoSearchQuery?: string;
}

export interface ConceptLadderRung {
  concept: string;
  explanation: string;
  example: string;
  videoSearchQuery?: string;
}

export interface ConceptLadderResponse {
  ladder: ConceptLadderRung[];
}

export interface WeeklyTestResponse {
  questions: Question[];
}

export interface MistakeClassification {
  category: string;
  explanation: string;
  advice: string;
}

export interface SessionSummaryResponse {
  summary: string;
  advice: string;
}

export interface HintResponse {
  hint: string;
}

export interface ReviewQuestionResponse extends Question {}

export interface WorkedSolutionResponse {
  solutionSteps: string[];
  finalDerivation: string;
}

export interface GateQuestionsResponse {
  questions: Question[];
}

export interface DailyChallengeQuestion extends Question {}

export interface ChapterSummaryResponse {
  summary: string;
  pitfalls: string;
  prerequisites: string;
  nextChapters: string;
}

export interface APIErrorType {
  type: 'rate_limit' | 'auth' | 'parse' | 'unknown';
  message: string;
}
