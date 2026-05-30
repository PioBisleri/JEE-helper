const isProduction = import.meta.env.MODE === 'production';

export const logger = {
  log: (message, ...args) => {
    if (!isProduction) {
      console.log(`[Nexus JEE] ${message}`, ...args);
    }
  },
  
  info: (message, ...args) => {
    if (!isProduction) {
      console.info(`[Nexus JEE INFO] ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (!isProduction) {
      console.warn(`[Nexus JEE WARNING] ${message}`, ...args);
    }
  },

  error: (message, error, ...args) => {
    if (isProduction) {
      // In production, we log a sanitized structured message, avoiding raw print of stack traces unless crucial
      console.error(`[Nexus JEE Error] ${message}: ${error?.message || error || 'Unknown error'}`);
    } else {
      console.error(`[Nexus JEE Error] ${message}`, error, ...args);
    }
  }
};
