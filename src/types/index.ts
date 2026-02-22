export type GrassRange = 7;

export interface WidgetConfig {
  id: string;
  type: string;
  enabled: boolean;
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

export interface DashboardState {
  widgets: WidgetConfig[];
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
}
