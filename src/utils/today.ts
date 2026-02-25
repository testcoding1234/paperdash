export interface TodayData {
  date: string;
  events: string[];
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
let cache: { data: TodayData; timestamp: number } | null = null;

export const fetchTodayEvents = async (): Promise<TodayData> => {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateKey = `${month}月${day}日`;

  try {
    const response = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(dateKey)}`
    );

    if (!response.ok) {
      throw new Error('Today API fetch failed');
    }

    const data = await response.json();

    // Extract sentences from the description as event items
    const extract: string = data.extract || '';
    // Split by Japanese sentence boundaries and take meaningful snippets
    const sentences = extract
      .split(/[。\n]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.length <= 40);

    const events = sentences.slice(0, 3);

    const result: TodayData = {
      date: dateKey,
      events: events.length > 0 ? events : ['情報なし'],
    };

    cache = { data: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error('Today API error:', error);
    const result: TodayData = {
      date: dateKey,
      events: ['データなし'],
    };
    cache = { data: result, timestamp: Date.now() };
    return result;
  }
};
