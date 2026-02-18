/**
 * Application constants
 * All configuration values should be defined here
 * NEVER add API keys, tokens, or secrets here
 */

export const APP_NAME = 'PaperDash';
export const APP_VERSION = '1.0.0';

// Cache settings
export const CACHE_MAX_AGE_SECONDS = 300; // 5 minutes

// UI text constants
export const UI_TEXT = {
  APP_TITLE: 'PaperDash - 個人用ダッシュボード',
  SETTINGS_TITLE: '設定',
  LOADING: '読み込み中...',
  ERROR_FETCH: 'データの取得に失敗しました',
  CONFIRM_DELETE: 'すべてのデータを削除しました',
  NO_USERNAME: '設定からGitHubユーザー名を入力してください',
} as const;

// Security warnings (Japanese)
export const SECURITY_WARNINGS = {
  PERSONAL_USE: 'このアプリは個人利用前提です',
  GITHUB_PAGES_PUBLIC: 'GitHub Pagesは公開サイトです。URLを他人と共有しないでください',
  PUBLIC_API_ONLY: '公開APIのみを使用し、認証トークンは不要です',
} as const;
