import { useState, useEffect } from 'react';
import type { WidgetProps, WeatherSettings } from '../types';
import { fetchWeather, getWeatherEmoji, TEMP_VARIANCE } from '../utils/weather';
import type { WeatherData } from '../utils/weather';

export const WeatherWidget: React.FC<WidgetProps> = ({ config }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const settings = config.settings as WeatherSettings;

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      const data = await fetchWeather(settings.locationCode || '130000');
      setWeather(data);
      setLoading(false);
    };

    loadWeather();
  }, [settings.locationCode]);

  if (loading) {
    return (
      <div className="border-2 border-black bg-white p-4 text-base">
        <div className="font-bold mb-1">天気</div>
        <div className="text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white p-4 text-base">
      <div className="font-bold mb-1">{'天気\u3000'}{weather?.locationName}</div>
      <div className="flex items-center gap-2">
        <span className="text-3xl">{getWeatherEmoji(weather?.condition || '')}</span>
        <div>
          <div className="text-sm">{weather?.condition}</div>
          <div className="text-sm">最高{Number(weather?.temperature ?? 0) + TEMP_VARIANCE}°C 最低{Number(weather?.temperature ?? 0) - TEMP_VARIANCE}°C</div>
        </div>
      </div>
    </div>
  );
};
