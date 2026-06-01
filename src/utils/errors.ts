export const ErrorType = {
  NETWORK: 'network',
  RATE_LIMIT: 'rate_limit',
  AUTH: 'auth',
  PARSE: 'parse',
  QUOTA_EXHAUSTED: 'quota_exhausted',
  UNKNOWN: 'unknown',
};

const ERROR_MESSAGES: Record<string, string> = {
  [ErrorType.NETWORK]: "Check your internet connection and try again.",
  [ErrorType.RATE_LIMIT]: "Rate limited — waiting a moment before retry.",
  [ErrorType.AUTH]: "API key is missing or invalid. Check your .env file.",
  [ErrorType.PARSE]: "The AI returned something unexpected — try again.",
  [ErrorType.QUOTA_EXHAUSTED]: "Daily AI quota exceeded. It resets every 24 hours.",
  [ErrorType.UNKNOWN]: "Something went wrong — please retry.",
};

interface ClassifiedError {
  type: string;
  message: string;
  retryable: boolean;
}

export function classifyError(err: unknown): ClassifiedError {
  const e = err as Record<string, unknown> | null;
  // Handle our custom GeminiError types first
  if (e?.type === 'rate_limit') {
    return { type: ErrorType.RATE_LIMIT, message: ERROR_MESSAGES[ErrorType.RATE_LIMIT], retryable: true };
  }
  if (e?.type === 'auth') {
    return { type: ErrorType.AUTH, message: ERROR_MESSAGES[ErrorType.AUTH], retryable: false };
  }
  if (e?.type === 'parse') {
    return { type: ErrorType.PARSE, message: ERROR_MESSAGES[ErrorType.PARSE], retryable: true };
  }
  if (e?.type === 'network') {
    return { type: ErrorType.NETWORK, message: ERROR_MESSAGES[ErrorType.NETWORK], retryable: true };
  }

  const msg = ((e?.message as string) || '').toLowerCase();

  // Rate limit / quota detection — expanded patterns
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') ||
      msg.includes('too many') || msg.includes('exceeded') || msg.includes('throttl')) {
    // Distinguish between temporary rate limit vs daily quota exhausted
    if (msg.includes('daily') || msg.includes('per day') || msg.includes('quota_exhausted') ||
        (msg.includes('quota') && msg.includes('0'))) {
      return { type: ErrorType.QUOTA_EXHAUSTED, message: ERROR_MESSAGES[ErrorType.QUOTA_EXHAUSTED], retryable: false };
    }
    return { type: ErrorType.RATE_LIMIT, message: ERROR_MESSAGES[ErrorType.RATE_LIMIT], retryable: true };
  }
  if (msg.includes('401') || msg.includes('403') || msg.includes('api key') || msg.includes('unauthorized') || msg.includes('forbidden')) {
    return { type: ErrorType.AUTH, message: ERROR_MESSAGES[ErrorType.AUTH], retryable: false };
  }
  if (msg.includes('json') || msg.includes('parse') || msg.includes('unexpected') || msg.includes('syntax')) {
    return { type: ErrorType.PARSE, message: ERROR_MESSAGES[ErrorType.PARSE], retryable: true };
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused') || !navigator.onLine) {
    return { type: ErrorType.NETWORK, message: ERROR_MESSAGES[ErrorType.NETWORK], retryable: true };
  }
  return { type: ErrorType.UNKNOWN, message: ERROR_MESSAGES[ErrorType.UNKNOWN], retryable: true };
}

export function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 8000);
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, maxAttempts: number = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const classified = classifyError(err);
      if (!classified.retryable || attempt === maxAttempts) throw err;
      await new Promise(r => setTimeout(r, getRetryDelay(attempt)));
    }
  }
  throw lastError;
}

export function getErrorMessage(err: unknown): string {
  return classifyError(err).message;
}
