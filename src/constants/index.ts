export const JAPANESE_LABELS = {
  // Main UI
  appTitle: 'ダッシュボード',
  
  // Buttons
  addWidget: 'ウィジェット追加',
  generateImage: '更新して画像生成',
  settings: '設定',
  save: '保存',
  cancel: 'キャンセル',
  delete: '削除',
  edit: '編集',
  
  // Widget types
  weather: '天気',
  github: 'GitHub',
  todo: 'To-Do',
  
  // Size labels
  sizeSmall: '小',
  sizeMedium: '中',
  sizeLarge: '大',
  
  // Layout
  layoutOneColumn: '1列',
  layoutTwoColumn: '2列',
  
  // Settings
  settingsTitle: '設定',
  weatherLocation: '天気の地域',
  githubUsername: 'GitHubユーザー名',
  githubToken: 'GitHubトークン (任意)',
  grassRange: '草の表示期間',
  days7: '7日',
  days30: '30日',
  
  // Weather locations
  tokyo: '東京',
  nagoya: '名古屋',
  osaka: '大阪',
  custom: 'カスタムコード',
  
  // Widget settings
  widgetSettings: 'ウィジェット設定',
  location: '地域',
  username: 'ユーザー名',
  range: '期間',
  
  // Todo
  addTodo: 'タスク追加',
  todoPlaceholder: '新しいタスク',
  
  // Image generation
  imageTitle: '電子ペーパー用画像',
  download: 'ダウンロード',
  preview: 'プレビュー',
  
  // Messages
  noWidgets: 'ウィジェットがありません',
  addFirstWidget: '最初のウィジェットを追加してください',
};

export const WEATHER_LOCATIONS = [
  { code: '130000', name: '東京' },
  { code: '230000', name: '名古屋' },
  { code: '270000', name: '大阪' },
];

export const E_PAPER_COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  yellow: '#FFFF00',
} as const;

export const CANVAS_WIDTH = 296;
export const CANVAS_HEIGHT = 128;
