import { useEffect, useState } from 'react';
import type { ContributionData } from '../utils/github';
import { fetchGitHubContributions } from '../utils/github';
import { secureStorage, STORAGE_KEYS } from '../utils/storage';

export function Dashboard() {
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    const username = secureStorage.getItem(STORAGE_KEYS.SETTINGS);
    const token = secureStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);

    if (!username) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchGitHubContributions(username, token || undefined);
      setContributions(data);
    } catch (err) {
      // Error already sanitized in github.ts
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getContributionColor = (level: number): string => {
    const colors = [
      'bg-gray-100',
      'bg-green-200',
      'bg-green-400',
      'bg-green-600',
      'bg-green-800',
    ];
    return colors[level] || colors[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadContributions}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!contributions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="mb-2">設定からGitHubユーザー名を入力してください</p>
          <p className="text-sm">コントリビューショングラフを表示します</p>
        </div>
      </div>
    );
  }

  // Group days by week for grid display
  const weeks: ContributionData['days'][] = [];
  const days = [...contributions.days];
  while (days.length > 0) {
    weeks.push(days.splice(0, 7));
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">GitHub コントリビューション</h2>
        <p className="text-sm text-gray-600">
          過去1年間の合計: <span className="font-semibold">{contributions.total}</span> コントリビューション
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getContributionColor(day.level)}`}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
        <span>少ない</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`}
            />
          ))}
        </div>
        <span>多い</span>
      </div>
    </div>
  );
}
