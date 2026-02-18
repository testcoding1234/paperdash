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

export const fetchGithubContributions = async (
  username: string,
  token?: string,
  days: number = 30
): Promise<GithubData> => {
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
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: {
          username,
          from: fromDate.toISOString(),
          to: today.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('GitHub API request failed');
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GitHub API error');
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
    console.error('GitHub API error:', error);
    
    // Return empty data
    return {
      contributions: [],
      totalContributions: 0,
    };
  }
};
