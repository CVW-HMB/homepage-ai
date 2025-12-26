import { NextResponse } from "next/server";

interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionData {
  totalContributions: number;
  weeks: Week[];
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
  }

  const query = `
    query {
      user(login: "CVW-HMB") {
        contributionsCollection {
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
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0].message }, { status: 500 });
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar;

    return NextResponse.json({
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
    } as ContributionData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }
}
