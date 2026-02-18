/**
 * GitHub API utilities with secure token handling
 */

import { redactSensitiveData, sanitizeInput } from './storage';
import { GITHUB_API_URL } from './constants';

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionData {
  total: number;
  days: ContributionDay[];
}

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Fetch GitHub contribution data
 * NEVER logs token or includes it in error messages
 * Includes rate limiting to prevent abuse
 */
export async function fetchGitHubContributions(
  username: string,
  token?: string
): Promise<ContributionData> {
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
  const query = `
    query($userName: String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header ONLY if token is provided
  if (token) {
    const sanitizedToken = sanitizeInput(token);
    headers['Authorization'] = `Bearer ${sanitizedToken}`;
  }

  try {
    const response = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { userName: sanitizedUsername },
      }),
    });

    if (!response.ok) {
      // NEVER include token in error messages
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      // Redact any potential sensitive data from errors
      const safeErrors = redactSensitiveData(data.errors);
      throw new Error(`GitHub GraphQL error: ${JSON.stringify(safeErrors)}`);
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      throw new Error('No contribution data found');
    }

    // Transform the data
    const days: ContributionDay[] = [];
    calendar.weeks.forEach((week: { contributionDays: Array<{ date: string; contributionCount: number; color: string }> }) => {
      week.contributionDays.forEach((day) => {
        days.push({
          date: day.date,
          count: day.contributionCount,
          level: getContributionLevel(day.contributionCount),
        });
      });
    });

    return {
      total: calendar.totalContributions,
      days,
    };
  } catch (error) {
    // NEVER log the actual error if it might contain sensitive data
    if (error instanceof Error) {
      // Create a safe error message without token
      throw new Error(`Failed to fetch GitHub data: ${error.message}`);
    }
    throw new Error('Failed to fetch GitHub data');
  }
}

/**
 * Get contribution level (0-4) based on count
 */
function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
}

/**
 * Validate GitHub token format
 * NEVER logs the actual token
 */
export function validateGitHubToken(token: string): boolean {
  if (!token) return false;
  
  // GitHub personal access tokens start with 'ghp_' or 'github_pat_'
  // Classic tokens are 40 characters, fine-grained are longer
  const isValidFormat = 
    (token.startsWith('ghp_') && token.length >= 40) ||
    (token.startsWith('github_pat_') && token.length >= 80);
  
  return isValidFormat;
}
