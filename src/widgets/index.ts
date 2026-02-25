import { WeatherWidget } from './WeatherWidget';
import { GithubGrassWidget } from './GithubGrassWidget';
import { TodoWidget } from './TodoWidget';
import { TodayWidget } from './TodayWidget';

export const WIDGET_REGISTRY = {
  weather: {
    component: WeatherWidget,
    name: '天気',
    defaultSettings: { locationCode: '130000', locationName: '東京都' },
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
  today: {
    component: TodayWidget,
    name: '今日は何の日',
    defaultSettings: {},
  },
};

export type WidgetType = keyof typeof WIDGET_REGISTRY;
