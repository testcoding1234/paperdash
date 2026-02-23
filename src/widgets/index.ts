import { WeatherWidget } from './WeatherWidget';
import { GithubGrassWidget } from './GithubGrassWidget';
import { TodoWidget } from './TodoWidget';

export const WIDGET_REGISTRY = {
  weather: {
    component: WeatherWidget,
    name: '天気',
    defaultSettings: { locationCode: '130000', locationName: '東京' },
  },
  github: {
    component: GithubGrassWidget,
    name: 'GitHub',
    defaultSettings: { username: '', range: 7 },
  },
  todo: {
    component: TodoWidget,
    name: 'To-Do',
    defaultSettings: { items: [] },
  },
};

export type WidgetType = keyof typeof WIDGET_REGISTRY;
