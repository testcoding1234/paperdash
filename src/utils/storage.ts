/**
 * Secure Storage Module
 * Handles localStorage with proper namespacing and separation of sensitive data
 */

const NAMESPACE = 'epaper_dashboard_';

// Storage keys
export const STORAGE_KEYS = {
  // Sensitive data (only stored with explicit user consent)
  GITHUB_TOKEN: `${NAMESPACE}github_token`,
  SAVE_TOKEN_ENABLED: `${NAMESPACE}save_token_enabled`,
  
  // Non-sensitive data
  LAYOUT: `${NAMESPACE}layout`,
  WIDGETS: `${NAMESPACE}widgets`,
  TODO_ITEMS: `${NAMESPACE}todo_items`,
  SETTINGS: `${NAMESPACE}settings`,
} as const;

// In-memory storage for session-only data
let sessionData: Record<string, string> = {};

export const secureStorage = {
  /**
   * Get value from storage
   * Checks session storage first for sensitive data
   */
  getItem(key: string): string | null {
    // Check session storage first for sensitive data
    if (key === STORAGE_KEYS.GITHUB_TOKEN && sessionData[key]) {
      return sessionData[key];
    }
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      // Silently fail if localStorage is not available
      return null;
    }
  },

  /**
   * Set value in storage
   * Sensitive data goes to session storage unless explicitly allowed
   */
  setItem(key: string, value: string, persist: boolean = true): void {
    if (key === STORAGE_KEYS.GITHUB_TOKEN) {
      // Always store in session memory
      sessionData[key] = value;
      
      // Only persist to localStorage if explicitly enabled
      const shouldSave = this.getItem(STORAGE_KEYS.SAVE_TOKEN_ENABLED) === 'true';
      if (!shouldSave || !persist) {
        // Remove from localStorage if it was there
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore errors
        }
        return;
      }
    }
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  },

  /**
   * Remove value from storage
   */
  removeItem(key: string): void {
    // Remove from session storage
    delete sessionData[key];
    
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },

  /**
   * Clear all application data
   */
  clearAll(): void {
    // Clear session data
    sessionData = {};
    
    try {
      // Remove all namespaced keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(NAMESPACE)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore errors
    }
  },

  /**
   * Enable/disable token persistence
   */
  setSaveTokenEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE_TOKEN_ENABLED, enabled.toString());
      
      // If disabling, remove token from localStorage immediately
      if (!enabled) {
        localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
      } else {
        // If enabling and we have a token in session, save it
        const token = sessionData[STORAGE_KEYS.GITHUB_TOKEN];
        if (token) {
          localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
        }
      }
    } catch {
      // Ignore errors
    }
  },

  /**
   * Check if token saving is enabled
   */
  isSaveTokenEnabled(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.SAVE_TOKEN_ENABLED) === 'true';
    } catch {
      return false;
    }
  }
};

/**
 * Redact sensitive data for logging
 */
export function redactSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    // Never log tokens or sensitive patterns
    if (data.startsWith('ghp_') || data.startsWith('github_pat_')) {
      return '[REDACTED_TOKEN]';
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }
  
  if (data && typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Redact token fields
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }
  
  return data;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  // Remove any control characters and trim whitespace
  return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
}

/**
 * Validate GitHub username format
 */
export function validateGitHubUsername(username: string): boolean {
  if (!username) return false;
  
  // GitHub usernames: alphanumeric and hyphens, max 39 chars, cannot start/end with hyphen
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return usernameRegex.test(username);
}
