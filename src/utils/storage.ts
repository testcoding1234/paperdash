import type { DashboardState, WidgetConfig } from '../types';

const STORAGE_KEY = 'paperdash_state';

const defaultState: DashboardState = {
  widgets: [],
  layout: '1-column',
  settings: {
    defaultLocation: '130000',
    githubUsername: '',
    githubToken: '',
    grassRange: 30,
  },
};

export const loadState = (): DashboardState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return defaultState;
};

export const saveState = (state: DashboardState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
