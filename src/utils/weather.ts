export interface WeatherData {
  temperature: number;
  condition: string;
  locationName: string;
}

// Map weather conditions to emojis
export const getWeatherEmoji = (condition: string): string => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('晴') || conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return '☀️';
  }
  if (conditionLower.includes('曇') || conditionLower.includes('cloud')) {
    return '☁️';
  }
  if (conditionLower.includes('雨') || conditionLower.includes('rain')) {
    return '🌧️';
  }
  if (conditionLower.includes('雪') || conditionLower.includes('snow')) {
    return '❄️';
  }
  if (conditionLower.includes('雷') || conditionLower.includes('thunder')) {
    return '⚡';
  }
  if (conditionLower.includes('霧') || conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return '🌫️';
  }
  if (conditionLower.includes('風') || conditionLower.includes('wind')) {
    return '💨';
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
