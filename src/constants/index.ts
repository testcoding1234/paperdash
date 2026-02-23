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
  
  // Settings
  settingsTitle: '設定',
  weatherLocation: '天気の地域',
  githubUsername: 'GitHubユーザー名',
  grassRange: '草の表示期間',
  days7: '7日',
  
  // Weather locations
  tokyo: '東京',
  nagoya: '名古屋',
  osaka: '大阪',
  
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

// All 47 prefectures (都道府県) with JMA forecast area codes
export const WEATHER_LOCATIONS = [
  { code: '016000', name: '北海道' },
  { code: '020000', name: '青森県' },
  { code: '030000', name: '岩手県' },
  { code: '040000', name: '宮城県' },
  { code: '050000', name: '秋田県' },
  { code: '060000', name: '山形県' },
  { code: '070000', name: '福島県' },
  { code: '080000', name: '茨城県' },
  { code: '090000', name: '栃木県' },
  { code: '100000', name: '群馬県' },
  { code: '110000', name: '埼玉県' },
  { code: '120000', name: '千葉県' },
  { code: '130000', name: '東京都' },
  { code: '140000', name: '神奈川県' },
  { code: '150000', name: '新潟県' },
  { code: '160000', name: '富山県' },
  { code: '170000', name: '石川県' },
  { code: '180000', name: '福井県' },
  { code: '190000', name: '山梨県' },
  { code: '200000', name: '長野県' },
  { code: '210000', name: '岐阜県' },
  { code: '220000', name: '静岡県' },
  { code: '230000', name: '愛知県' },
  { code: '240000', name: '三重県' },
  { code: '250000', name: '滋賀県' },
  { code: '260000', name: '京都府' },
  { code: '270000', name: '大阪府' },
  { code: '280000', name: '兵庫県' },
  { code: '290000', name: '奈良県' },
  { code: '300000', name: '和歌山県' },
  { code: '310000', name: '鳥取県' },
  { code: '320000', name: '島根県' },
  { code: '330000', name: '岡山県' },
  { code: '340000', name: '広島県' },
  { code: '350000', name: '山口県' },
  { code: '360000', name: '徳島県' },
  { code: '370000', name: '香川県' },
  { code: '380000', name: '愛媛県' },
  { code: '390000', name: '高知県' },
  { code: '400000', name: '福岡県' },
  { code: '410000', name: '佐賀県' },
  { code: '420000', name: '長崎県' },
  { code: '430000', name: '熊本県' },
  { code: '440000', name: '大分県' },
  { code: '450000', name: '宮崎県' },
  { code: '460100', name: '鹿児島県' },
  { code: '471000', name: '沖縄県' },
];

export const E_PAPER_COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  yellow: '#FFFF00',
} as const;

export const CANVAS_WIDTH = 296;
export const CANVAS_HEIGHT = 128;
