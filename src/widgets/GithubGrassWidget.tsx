import { useState, useEffect } from 'react';
import type { WidgetProps, GithubSettings } from '../types';
import { fetchGithubContributions } from '../utils/github';
import type { GithubData, ContributionDay } from '../utils/github';

export const GithubGrassWidget: React.FC<WidgetProps> = ({ config }) => {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const settings = config.settings as GithubSettings;

  useEffect(() => {
    const loadContributions = async () => {
      if (!settings.username) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await fetchGithubContributions(
        settings.username,
        settings.token,
        settings.range || 30
      );
      setData(result);
      setLoading(false);
    };

    loadContributions();
  }, [settings.username, settings.token, settings.range]);

  const getSizeClasses = () => {
    switch (config.size) {
      case 'S':
        return 'p-2';
      case 'L':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getCellSize = () => {
    switch (config.size) {
      case 'S':
        return 'w-2 h-2';
      case 'L':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  if (!settings.username) {
    return (
      <div className={`border-2 border-black bg-white ${getSizeClasses()}`}>
        <div className="font-bold mb-1">GitHub</div>
        <div className="text-sm">ユーザー名を設定してください</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`border-2 border-black bg-white ${getSizeClasses()}`}>
        <div className="font-bold mb-1">GitHub - {settings.username}</div>
        <div className="text-sm">読み込み中...</div>
      </div>
    );
  }

  const getColor = (level: number) => {
    if (level === 0) return 'bg-white border border-black';
    if (level === 1) return 'bg-gray-200';
    if (level === 2) return 'bg-gray-400';
    if (level === 3) return 'bg-gray-600';
    return 'bg-black';
  };

  // Group by weeks
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];
  
  data?.contributions.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === data.contributions.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className={`border-2 border-black bg-white ${getSizeClasses()}`}>
      <div className="font-bold mb-2">GitHub - {settings.username}</div>
      <div className="text-xs mb-2">{settings.range}日間: {data?.totalContributions} contributions</div>
      <div className="flex gap-0.5 overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`${getCellSize()} ${getColor(day.level)}`}
                title={`${day.date}: ${day.count}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
