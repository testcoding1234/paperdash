import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { secureStorage, STORAGE_KEYS, sanitizeInput, validateGitHubUsername } from '../utils/storage';
import { validateGitHubToken } from '../utils/github';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [token, setToken] = useState(secureStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN) || '');
  const [saveToken, setSaveToken] = useState(secureStorage.isSaveTokenEnabled());
  const [username, setUsername] = useState(secureStorage.getItem(STORAGE_KEYS.SETTINGS) || '');
  const [showToken, setShowToken] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleSaveTokenToggle = () => {
    const newValue = !saveToken;
    setSaveToken(newValue);
    secureStorage.setSaveTokenEnabled(newValue);
    
    // If we have a token, update its storage based on the new setting
    if (token) {
      secureStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token, newValue);
    }
  };

  const handleSave = () => {
    // Sanitize and validate username
    const sanitizedUsername = sanitizeInput(username);
    
    if (sanitizedUsername && !validateGitHubUsername(sanitizedUsername)) {
      alert('GitHubユーザー名の形式が正しくありません。英数字とハイフンのみ使用でき、ハイフンで始まる・終わることはできません。');
      return;
    }
    
    // Validate and save token (respects saveToken setting)
    if (token) {
      const sanitizedToken = sanitizeInput(token);
      if (!validateGitHubToken(sanitizedToken)) {
        alert('トークンの形式が正しくありません。GitHub Personal Access Tokenを入力してください。');
        return;
      }
      secureStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, sanitizedToken, saveToken);
    } else {
      secureStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    }
    
    // Save username
    if (sanitizedUsername) {
      secureStorage.setItem(STORAGE_KEYS.SETTINGS, sanitizedUsername);
    }
    
    onClose();
  };

  const handleDeleteAll = () => {
    if (showDeleteConfirm) {
      secureStorage.clearAll();
      setToken('');
      setUsername('');
      setSaveToken(false);
      setShowDeleteConfirm(false);
      alert('すべてのデータを削除しました');
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* Security Warning Section */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ セキュリティに関する重要な情報</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• このアプリは個人利用前提です</li>
              <li>• <strong>読み取り専用（Read-only）のGitHub Tokenのみ</strong>使用してください</li>
              <li>• 書き込み権限のあるトークンは使用しないでください</li>
              <li>• トークンはこの端末のブラウザ内にのみ保存されます</li>
              <li>• GitHub Pagesは公開サイトです。URLを他人と共有しないでください</li>
            </ul>
          </div>

          {/* GitHub Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHubユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: octocat"
              autoComplete="username"
              maxLength={39}
            />
          </div>

          {/* GitHub Token */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token（任意）
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={handleTokenChange}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {showToken ? '隠す' : '表示'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              コントリビューショングラフの表示に使用されます（オプション）
            </p>
          </div>

          {/* Save Token Toggle */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="saveToken"
              checked={saveToken}
              onChange={handleSaveTokenToggle}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="saveToken" className="ml-2 text-sm text-gray-700">
              トークンを端末に保存する（チェックしない場合、セッション中のみ有効）
            </label>
          </div>

          {/* Token Creation Guide */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">トークンの作成方法</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                GitHub → Settings → Developer settings → Personal access tokens → 
                <strong> Fine-grained tokens</strong>
              </li>
              <li>「Generate new token」をクリック</li>
              <li>Repository access: 「Public Repositories (read-only)」を選択</li>
              <li>Permissions: 必要最小限の読み取り権限のみ付与</li>
              <li>Generate token してコピー</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>

          {/* Delete All Data */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDeleteAll}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {showDeleteConfirm ? '本当に削除しますか？もう一度クリックで確定' : '全データ削除'}
            </button>
            {showDeleteConfirm && (
              <p className="mt-2 text-xs text-center text-red-600">
                すべての設定、トークン、データが削除されます
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
