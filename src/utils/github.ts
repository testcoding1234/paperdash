import { sanitizeInput } from './storage';

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GithubData {
  contributions: ContributionDay[];
  totalContributions: number;
  error?: string;
}

// Public API endpoint - no authentication required
const GITHUB_PUBLIC_API_ENDPOINT = 'https://github-contributions-api.jogruber.de/v4';

export const fetchGithubContributions = async (
  username: string,
  days: number = 30
): Promise<GithubData> => {
  // Validate username before making API call
  const sanitizedUsername = sanitizeInput(username);
  if (!sanitizedUsername) {
    return {
      contributions: [],
      totalContributions: 0,
      error: 'ユーザー名が無効です',
    };
  }

  try {
    // Use public API with no authentication
    const response = await fetch(`${GITHUB_PUBLIC_API_ENDPOINT}/${sanitizedUsername}`);

    if (!response.ok) {
      const errorMessage = response.status === 404 
        ? `ユーザー "${sanitizedUsername}" が見つかりません`
        : `GitHub API エラー: ${response.status}`;
      console.error('GitHub API error:', errorMessage);
      return {
        contributions: [],
        totalContributions: 0,
        error: errorMessage,
      };
    }

    const result = await response.json();

    // Check for API error response
    if (result.error) {
      console.error('GitHub API error:', result.error);
      return {
        contributions: [],
        totalContributions: 0,
        error: 'データの取得に失敗しました',
      };
    }

    // Public API returns all contributions, filter by date range
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - days);
    
    const filteredContributions = result.contributions
      .filter((day: ContributionDay) => {
        const dayDate = new Date(day.date);
        return dayDate >= fromDate && dayDate <= today;
      })
      .map((day: ContributionDay) => ({
        date: day.date,
        count: day.count,
        level: day.level,
      }));

    // Calculate total for the filtered range
    const totalContributions = filteredContributions.reduce(
      (sum: number, day: ContributionDay) => sum + day.count,
      0
    );

    return {
      contributions: filteredContributions,
      totalContributions,
    };
  } catch (error) {
    // Log error and return explicit error state
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('GitHub API error:', errorMessage);
    
    return {
      contributions: [],
      totalContributions: 0,
      error: 'データの取得に失敗しました',
    };
  }
};
