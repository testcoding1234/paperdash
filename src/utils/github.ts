import { redactSensitiveData, sanitizeInput } from './storage';

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GithubData {
  contributions: ContributionDay[];
  totalContributions: number;
}

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

export const fetchGithubContributions = async (
  username: string,
  token?: string,
  days: number = 30
): Promise<GithubData> => {
  // Rate limiting check
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  // Sanitize username to prevent injection
  const sanitizedUsername = sanitizeInput(username);
  if (!sanitizedUsername) {
    throw new Error('Invalid username');
  }

  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - days);

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      const sanitizedToken = sanitizeInput(token);
      headers['Authorization'] = `Bearer ${sanitizedToken}`;
    }

    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: {
          username: sanitizedUsername,
          from: fromDate.toISOString(),
          to: today.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      // Redact any potential sensitive data from errors
      const safeErrors = redactSensitiveData(result.errors);
      throw new Error(`GitHub API error: ${JSON.stringify(safeErrors)}`);
    }

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    
    if (!calendar) {
      throw new Error('No contribution data found');
    }

    const contributions: ContributionDay[] = [];
    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel === 'NONE' ? 0 :
                 day.contributionLevel === 'FIRST_QUARTILE' ? 1 :
                 day.contributionLevel === 'SECOND_QUARTILE' ? 2 :
                 day.contributionLevel === 'THIRD_QUARTILE' ? 3 : 4,
        });
      });
    });

    return {
      contributions,
      totalContributions: calendar.totalContributions,
    };
  } catch (error) {
    // Log error without sensitive data
    if (error instanceof Error) {
      console.error('GitHub API error:', error.message);
    }
    
    // Return empty data
    return {
      contributions: [],
      totalContributions: 0,
    };
  }
};
