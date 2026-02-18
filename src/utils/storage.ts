import type { DashboardState, WidgetConfig } from '../types';

const STORAGE_KEY = 'paperdash_state';

const defaultState: DashboardState = {
  widgets: [
    {
      id: 'weather-default',
      type: 'weather',
      enabled: true,
      size: 'M',
      order: 0,
      settings: { locationCode: '130000', locationName: '東京' },
    },
    {
      id: 'github-default',
      type: 'github',
      enabled: true,
      size: 'L',
      order: 1,
      settings: { username: '', range: 30 },
    },
    {
      id: 'todo-default',
      type: 'todo',
      enabled: true,
      size: 'M',
      order: 2,
      settings: { items: [] },
    },
  ],
  layout: '1-column',
  settings: {
    defaultLocation: '130000',
    githubUsername: '',
    grassRange: 30,
  },
};

/**
 * List of sensitive keys to be removed from state
 * These keys should never be stored in localStorage
 */
const SENSITIVE_KEYS = ['token', 'githubToken', 'auth', 'secret'];

/**
 * Recursively remove sensitive keys from an object
 * This ensures no tokens or secrets remain in the state
 * Returns [cleanedObject, hadSensitiveKeys] tuple
 */
function removeSensitiveKeys(obj: unknown): [unknown, boolean] {
  let foundSensitive = false;

  if (obj === null || obj === undefined) {
    return [obj, false];
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.map(item => {
      const [cleanedItem, hadSensitive] = removeSensitiveKeys(item);
      if (hadSensitive) foundSensitive = true;
      return cleanedItem;
    });
    return [cleaned, foundSensitive];
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive keys at any level
      if (SENSITIVE_KEYS.includes(key)) {
        foundSensitive = true;
        continue;
      }
      // Recursively clean nested objects
      const [cleanedValue, hadSensitive] = removeSensitiveKeys(value);
      if (hadSensitive) foundSensitive = true;
      cleaned[key] = cleanedValue;
    }
    return [cleaned, foundSensitive];
  }

  return [obj, false];
}

export const loadState = (): DashboardState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Automatically remove sensitive data from old state
      const [cleaned, hadSensitiveKeys] = removeSensitiveKeys(parsed);
      
      // Only write back if we actually removed sensitive keys
      // This avoids unnecessary localStorage writes on every load
      if (hadSensitiveKeys) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      
      // Validate that cleaned is an object before merging
      // This guard protects against corrupted localStorage data or edge cases
      // where removeSensitiveKeys might return a non-object type
      const cleanedState = cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned)
        ? cleaned
        : {};
      
      return { ...defaultState, ...cleanedState } as DashboardState;
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return defaultState;
};

export const saveState = (state: DashboardState): void => {
  try {
    // Remove sensitive keys before saving to prevent accidental storage
    const [cleaned] = removeSensitiveKeys(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const updateWidget = (
  widgets: WidgetConfig[],
  updatedWidget: WidgetConfig
): WidgetConfig[] => {
  return widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w));
};

export const moveWidget = (
  widgets: WidgetConfig[],
  id: string,
  direction: 'up' | 'down'
): WidgetConfig[] => {
  const sorted = [...widgets].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((w) => w.id === id);
  
  if (index === -1) return widgets;
  if (direction === 'up' && index === 0) return widgets;
  if (direction === 'down' && index === sorted.length - 1) return widgets;
  
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  [sorted[index], sorted[newIndex]] = [sorted[newIndex], sorted[index]];
  
  return sorted.map((w, i) => ({ ...w, order: i }));
};

export const addWidget = (
  widgets: WidgetConfig[],
  type: string,
  defaultSettings: Record<string, any> = {}
): WidgetConfig[] => {
  const newWidget: WidgetConfig = {
    id: `${type}-${Date.now()}`,
    type,
    enabled: true,
    size: 'M',
    order: widgets.length,
    settings: defaultSettings,
  };
  return [...widgets, newWidget];
};

export const deleteWidget = (widgets: WidgetConfig[], id: string): WidgetConfig[] => {
  return widgets
    .filter((w) => w.id !== id)
    .map((w, i) => ({ ...w, order: i }));
};

/**
 * Redact sensitive data for logging
 * Prevents token leakage in console logs and error messages
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
 * Removes control characters and trims whitespace
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
}

/**
 * Validate GitHub username format
 * Ensures username matches GitHub's rules
 */
export function validateGitHubUsername(username: string): boolean {
  if (!username) return false;
  
  // GitHub usernames: alphanumeric and hyphens, max 39 chars, cannot start/end with hyphen
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return usernameRegex.test(username);
}
