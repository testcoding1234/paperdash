/**
 * Application constants
 * All configuration values should be defined here
 * NEVER add API keys, tokens, or secrets here
 */

export const APP_NAME = 'PaperDash';
export const APP_VERSION = '1.0.0';

// GitHub API endpoint (public, no secret)
export const GITHUB_API_URL = 'https://api.github.com/graphql';

// Cache settings
export const CACHE_MAX_AGE_SECONDS = 300; // 5 minutes

// UI text constants
export const UI_TEXT = {
  APP_TITLE: 'PaperDash - 個人用ダッシュボード',
  SETTINGS_TITLE: '設定',
  LOADING: '読み込み中...',
  ERROR_FETCH: 'データの取得に失敗しました',
  ERROR_TOKEN_FORMAT: 'トークンの形式が正しくありません。GitHub Personal Access Tokenを入力してください。',
  CONFIRM_DELETE: 'すべてのデータを削除しました',
  NO_USERNAME: '設定からGitHubユーザー名を入力してください',
} as const;

// Security warnings (Japanese)
export const SECURITY_WARNINGS = {
  PERSONAL_USE: 'このアプリは個人利用前提です',
  READ_ONLY_TOKEN: '読み取り専用（Read-only）のGitHub Tokenのみ使用してください',
  NO_WRITE_TOKEN: '書き込み権限のあるトークンは使用しないでください',
  LOCAL_STORAGE_ONLY: 'トークンはこの端末のブラウザ内にのみ保存されます',
  GITHUB_PAGES_PUBLIC: 'GitHub Pagesは公開サイトです。URLを他人と共有しないでください',
} as const;
