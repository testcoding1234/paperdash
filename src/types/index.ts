export type WidgetSize = 'S' | 'M' | 'L';
export type LayoutMode = '1-column' | '2-column';
export type GrassRange = 7 | 30;

export interface WidgetConfig {
  id: string;
  type: string;
  enabled: boolean;
  size: WidgetSize;
  order: number;
  settings: Record<string, any>;
}

export interface WeatherSettings {
  locationCode: string;
  locationName: string;
}

export interface GithubSettings {
  username: string;
  range: GrassRange;
}

export interface TodoSettings {
  items: TodoItem[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface DashboardState {
  widgets: WidgetConfig[];
  layout: LayoutMode;
  settings: {
    defaultLocation: string;
    githubUsername: string;
    grassRange: GrassRange;
  };
}

export interface WidgetProps {
  config: WidgetConfig;
  onUpdate: (config: WidgetConfig) => void;
  previewMode?: boolean;
  renderMode?: 'preview' | 'export';
}
