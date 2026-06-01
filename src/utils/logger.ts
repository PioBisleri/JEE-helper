const isProduction = (import.meta as unknown as { env: Record<string, string> }).env.MODE === 'production';

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      console.log(`[Nexus JEE] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      console.info(`[Nexus JEE INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      console.warn(`[Nexus JEE WARNING] ${message}`, ...args);
    }
  },

  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    if (isProduction) {
      console.error(`[Nexus JEE Error] ${message}: ${error instanceof Error ? error.message : String(error || 'Unknown error')}`);
    } else {
      console.error(`[Nexus JEE Error] ${message}`, error, ...args);
    }
  }
};
