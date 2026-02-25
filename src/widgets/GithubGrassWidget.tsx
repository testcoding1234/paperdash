import { useState, useEffect } from 'react';
import type { WidgetProps, GithubSettings } from '../types';
import { fetchGithubContributions } from '../utils/github';
import type { GithubData } from '../utils/github';

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
        settings.range || 7
      );
      setData(result);
      setLoading(false);
    };

    loadContributions();
  }, [settings.username, settings.range]);

  if (!settings.username) {
    return (
      <div className="border-2 border-black bg-white p-4 md:p-6">
        <div className="font-bold mb-1 text-base md:text-lg lg:text-xl">GitHub</div>
        <div className="text-sm md:text-base">ユーザー名を設定してください</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-2 border-black bg-white p-4 md:p-6">
        <div className="font-bold mb-1 text-base md:text-lg lg:text-xl">GitHub - {settings.username}</div>
        <div className="text-sm md:text-base">読み込み中...</div>
      </div>
    );
  }

  // Display error if data fetch failed
  if (data?.error) {
    return (
      <div className="border-2 border-black bg-white p-4 md:p-6">
        <div className="font-bold mb-1 text-base md:text-lg lg:text-xl">GitHub - {settings.username}</div>
        <div className="text-sm md:text-base text-red-600">{data.error}</div>
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

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6 overflow-hidden">
      <div className="font-bold mb-2 text-base md:text-lg lg:text-xl break-words">GitHub - {settings.username}</div>
      <div className="text-xs md:text-sm lg:text-base mb-2 break-words">{settings.range}日間: {data?.totalContributions} contributions</div>
      
      {/* Horizontal grass layout (left to right by date, wrapping rows) */}
      <div className="flex flex-wrap gap-0.5 md:gap-1">
        {(data?.contributions || []).map((day, index) => (
          <div
            key={index}
            className={`w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 ${getColor(day.level)}`}
            title={`${day.date}: ${day.count}`}
            aria-label={`${day.date}: ${day.count} contributions`}
          />
        ))}
      </div>
    </div>
  );
};
