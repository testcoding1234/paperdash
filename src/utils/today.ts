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
    // Use mobile-sections API to get structured section data for the date article.
    // The summary API only returns the intro paragraph (calendar description),
    // not the actual "できごと" (events) list.
    const response = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(dateKey)}`
    );

    if (!response.ok) {
      throw new Error('Today API fetch failed');
    }

    const data = await response.json();

    // Find the "できごと" (events) section among the remaining sections
    const sections = Array.isArray(data?.remaining?.sections)
      ? (data.remaining.sections as Array<Record<string, unknown>>)
      : [];
    const eventsSection = sections.find((s) => s['line'] === 'できごと');

    let events: string[] = [];

    if (typeof eventsSection?.['text'] === 'string') {
      // Parse the HTML to extract list items via DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(eventsSection['text'], 'text/html');
      events = Array.from(doc.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() ?? '')
        .filter((t) => t.length > 0)
        .slice(0, 3);
    }

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
