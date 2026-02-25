import { useState, useEffect } from 'react';
import type { WidgetProps } from '../types';
import { fetchTodayEvents } from '../utils/today';
import type { TodayData } from '../utils/today';

export const TodayWidget: React.FC<WidgetProps> = () => {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await fetchTodayEvents();
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="border-2 border-black bg-white p-4 md:p-6 overflow-hidden">
        <div className="font-bold mb-1 text-base md:text-lg lg:text-xl">今日は何の日</div>
        <div className="text-sm md:text-base">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6 overflow-hidden">
      <div className="font-bold mb-1 text-base md:text-lg lg:text-xl">
        今日は何の日{data?.date ? `\u3000${data.date}` : ''}
      </div>
      <ul className="text-sm md:text-base lg:text-lg space-y-1">
        {(data?.events || []).map((event, index) => (
          <li key={index} className="break-words">・{event}</li>
        ))}
      </ul>
    </div>
  );
};
