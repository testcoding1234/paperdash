export interface WeatherData {
  temperature: number;
  condition: string;
  locationName: string;
}

// Map weather conditions to emojis
const WEATHER_EMOJI_MAP: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ['晴', 'sunny', 'clear'], emoji: '☀️' },
  { keywords: ['曇', 'cloud'], emoji: '☁️' },
  { keywords: ['雨', 'rain'], emoji: '🌧️' },
  { keywords: ['雪', 'snow'], emoji: '❄️' },
  { keywords: ['雷', 'thunder'], emoji: '⚡' },
  { keywords: ['霧', 'fog', 'mist'], emoji: '🌫️' },
  { keywords: ['風', 'wind'], emoji: '💨' },
];

export const getWeatherEmoji = (condition: string): string => {
  const conditionLower = condition.toLowerCase();
  
  for (const { keywords, emoji } of WEATHER_EMOJI_MAP) {
    if (keywords.some((keyword) => conditionLower.includes(keyword))) {
      return emoji;
    }
  }
  
  // Default emoji for unknown conditions
  return '🌤️';
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();

export const fetchWeather = async (locationCode: string): Promise<WeatherData> => {
  // Check cache
  const cached = weatherCache.get(locationCode);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://www.jma.go.jp/bosai/forecast/data/forecast/${locationCode}.json`
    );
    
    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }

    const data = await response.json();
    
    // Extract weather data from JMA format
    const area = data[0]?.timeSeries[0];
    const tempArea = data[0]?.timeSeries[2];
    
    const weatherData: WeatherData = {
      temperature: tempArea?.areas[0]?.temps[0] || 0,
      condition: area?.areas[0]?.weathers[0] || '不明',
      locationName: area?.areas[0]?.area?.name || '不明',
    };

    // Cache the result
    weatherCache.set(locationCode, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return fallback data
    return {
      temperature: 0,
      condition: 'データなし',
      locationName: '不明',
    };
  }
};
